"""
AryaSaarthi — Ask Arya NLU Pipeline
Layer 1: Regex / keyword rules (structured phrasing, Indian currency formats, category keywords)
Layer 2: spaCy NER (lightweight en_core_web_sm for numeric values and locations)
Layer 3: SentenceTransformers similarity matcher fallback for project_types
"""

import re
import logging
from typing import Dict, Any, Optional, List
from .similarity_matcher import match_project_type

logger = logging.getLogger("chatbot.nlu")

# Lazy spaCy model
_nlp = None
_spacy_failed = False

def get_spacy_nlp():
    """Loads spaCy model once with safe fallback."""
    global _nlp, _spacy_failed
    if _nlp is not None:
        return _nlp
    if _spacy_failed:
        return None

    try:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model 'en_core_web_sm'.")
            return _nlp
        except Exception:
            logger.info("Downloading en_core_web_sm for first-time offline caching...")
            from spacy.cli import download
            download("en_core_web_sm")
            _nlp = spacy.load("en_core_web_sm")
            return _nlp
    except Exception as e:
        logger.warning("spaCy not available (%s). Proceeding with regex/keyword engine.", e)
        _spacy_failed = True
        return None

# Known Indian States & Union Territories
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry"
]

COMMON_DISTRICTS = [
    "Lucknow", "Kanpur", "Varanasi", "Prayagraj", "Agra", "Gorakhpur", "Noida", "Ghaziabad",
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Purnia",
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad",
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain",
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur",
    "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi",
    "Kolkata", "Howrah", "Durgapur", "Siliguri",
    "Chennai", "Coimbatore", "Madurai", "Salem",
    "Hyderabad", "Warangal", "Ahmedabad", "Surat", "Vadodara", "Rajkot",
    "Chandigarh", "Shimla", "Dehradun", "Ranchi", "Raipur", "Guwahati", "Bhubaneswar"
]

ALL_PROJECT_LABELS = [
    "higher_education", "vocational", "technical_courses", "abroad_study",
    "tailoring", "beauty_parlor", "handicrafts", "women_enterprise",
    "dairy", "vegetable_vending", "grocery", "street_vendor", "poultry", "goat_farming",
    "transport", "electric_rickshaw", "auto_rickshaw", "small_truck",
    "manufacturing", "service_unit", "shop", "retail", "small_industry",
    "solar_installation", "waste_recycling", "organic_farming",
    "skill_training"
]

# -------------------------------------------------------------
# Layer 1: Regex / Keyword Extraction
# -------------------------------------------------------------
SAFE_BND_START = r'(?:^|[\s.,!?;:()\[\]\"\'\-])'
SAFE_BND_END = r'(?:$|[\s.,!?;:()\[\]\"\'\-])'

INDIC_DIGIT_MAP = {
    # Devanagari (Hindi, Marathi, Nepali, Sanskrit, Maithili, Dogri, Konkani, Bodo)
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    # Bengali & Assamese & Manipuri
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    # Gujarati
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
    # Gurmukhi (Punjabi)
    '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
    # Odia
    '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4', '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
    # Tamil
    '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
    # Telugu
    '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
    # Kannada
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
    # Malayalam
    '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
    # Urdu / Arabic-Indic
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    # Santali (Ol Chiki)
    '᱐': '0', '᱑': '1', '᱒': '2', '᱓': '3', '᱔': '4', '᱕': '5', '᱖': '6', '᱗': '7', '᱘': '8', '᱙': '9',
    # Manipuri (Meetei Mayek)
    '꯰': '0', '꯱': '1', '꯲': '2', '꯳': '3', '꯴': '4', '꯵': '5', '꯶': '6', '꯷': '7', '꯸': '8', '꯹': '9',
}

def normalize_indic_text(text: str) -> str:
    """Normalizes native Indic numerals and common spoken Hindi/regional amount phrases to standard numbers."""
    # 1. Convert Indic digits to ASCII digits
    res = []
    for ch in text:
        res.append(INDIC_DIGIT_MAP.get(ch, ch))
    t = "".join(res)

    # 2. Convert common Hindi/Indic spoken number phrases across multiple regional languages
    phrases = [
        # Hindi / Urdu / Maithili / Dogri
        (SAFE_BND_START + r'(डेढ़|डेड|dedh|deydh|دیڑھ)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 1.5 lakh '),
        (SAFE_BND_START + r'(ढाई|dhai|ڈھائی)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 2.5 lakh '),
        (SAFE_BND_START + r'(एक|ek|ایک)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 1 lakh '),
        (SAFE_BND_START + r'(दो|do|دو)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 2 lakh '),
        (SAFE_BND_START + r'(तीन|teen|تین)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 3 lakh '),
        (SAFE_BND_START + r'(चार|chaar|چار)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 4 lakh '),
        (SAFE_BND_START + r'(पांच|पाँच|paanch|پانچ)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 5 lakh '),
        (SAFE_BND_START + r'(दस|das|دس)' + r'\s*(लाख|lakh|lac|لاکھ)' + SAFE_BND_END, ' 10 lakh '),
        (SAFE_BND_START + r'(पचास\s*हजार|पचास\s*हज़ार|50\s*हजार|50\s*हज़ार|پچاس\s*ہزار)' + SAFE_BND_END, ' 50000 '),
        # Bengali & Assamese
        (SAFE_BND_START + r'(দেড়|দেড়)' + r'\s*(লাখ|লাখস)' + SAFE_BND_END, ' 1.5 lakh '),
        (SAFE_BND_START + r'(আড়াই|আড়াই)' + r'\s*(লাখ|লাখস)' + SAFE_BND_END, ' 2.5 lakh '),
        (SAFE_BND_START + r'(এক|১)' + r'\s*(লাখ|লাখস)' + SAFE_BND_END, ' 1 lakh '),
        (SAFE_BND_START + r'(দুই|২)' + r'\s*(লাখ|লাখস)' + SAFE_BND_END, ' 2 lakh '),
        (SAFE_BND_START + r'(পঞ্চাশ\s*হাজার|৫০\s*হাজার)' + SAFE_BND_END, ' 50000 '),
        # Tamil
        (SAFE_BND_START + r'(ஒன்றரை|1\.5)' + r'\s*(லட்சம்|இலட்சம்)' + SAFE_BND_END, ' 1.5 lakh '),
        (SAFE_BND_START + r'(இரண்டரை|2\.5)' + r'\s*(லட்சம்|இலட்சம்)' + SAFE_BND_END, ' 2.5 lakh '),
        (SAFE_BND_START + r'(ஒரு|1)' + r'\s*(லட்சம்|இலட்சம்)' + SAFE_BND_END, ' 1 lakh '),
        (SAFE_BND_START + r'(இரண்டு|2)' + r'\s*(லட்சம்|இலட்சம்)' + SAFE_BND_END, ' 2 lakh '),
        (SAFE_BND_START + r'(ஐம்பதாயிரம்|50\s*ஆயிரம்)' + SAFE_BND_END, ' 50000 '),
        # Telugu
        (SAFE_BND_START + r'(ఒకటిన్నర|1\.5)' + r'\s*(లక్ష|లక్షలు)' + SAFE_BND_END, ' 1.5 lakh '),
        (SAFE_BND_START + r'(రెండున్నర|2\.5)' + r'\s*(లక్ష|లక్షలు)' + SAFE_BND_END, ' 2.5 lakh '),
        (SAFE_BND_START + r'(ఒక|1)' + r'\s*(లక్ష|లక్షలు)' + SAFE_BND_END, ' 1 lakh '),
        (SAFE_BND_START + r'(రెండు|2)' + r'\s*(లక్ష|లక్షలు)' + SAFE_BND_END, ' 2 lakh '),
        (SAFE_BND_START + r'(యాభై\s*వేలు|50\s*వేలు)' + SAFE_BND_END, ' 50000 '),
        # Marathi
        (SAFE_BND_START + r'(दीड|1\.5)' + r'\s*(लाख)' + SAFE_BND_END, ' 1.5 lakh '),
        (SAFE_BND_START + r'(अडीच|2\.5)' + r'\s*(लाख)' + SAFE_BND_END, ' 2.5 lakh '),
        (SAFE_BND_START + r'(पन्नास\s*हजार|५०\s*हजार)' + SAFE_BND_END, ' 50000 '),
        # Gujarati
        (SAFE_BND_START + r'(દોઢ|1\.5)' + r'\s*(લાખ)' + SAFE_BND_END, ' 1.5 lakh '),
        (SAFE_BND_START + r'(અઢી|2\.5)' + r'\s*(લાख)' + SAFE_BND_END, ' 2.5 lakh '),
        (SAFE_BND_START + r'(પચાસ\s*હજાર|૫૦\s*હજાર)' + SAFE_BND_END, ' 50000 '),
        # Generic Unit Normalizers across scripts
        (SAFE_BND_START + r'(লাখ|લાખ|లక్ష|లక్షలు|ലക്ഷം|ಲಕ್ಷ|ਲੱਖ|ଲକ୍ଷ|லட்சம்|இலட்சம்|لاکھ|লক্ষ)' + SAFE_BND_END, ' lakh '),
        (SAFE_BND_START + r'(हजार|हज़ार|হাজার|ஆயிரம்|వేలు|ਸਾਲ|ಸಾಸ್ತಿರ|ಸಾಸ್ತ್ರ|ആയിരം|હજાર|ହାଜାର|ہزار)' + SAFE_BND_END, ' thousand '),
        (SAFE_BND_START + r'(करोड़|कोटी|কোটি|కోట్లు|കോടി|கோடி|ਕਰੋੜ|କୋଟି|کروڑ)' + SAFE_BND_END, ' crore '),
    ]
    for pattern, replacement in phrases:
        t = re.sub(pattern, replacement, t, flags=re.IGNORECASE)

    return t

# -------------------------------------------------------------
# Layer 1: Regex / Keyword Extraction
# -------------------------------------------------------------

def parse_indian_amount(text: str) -> Optional[float]:
    """
    Parses natural language amounts across all 23 Indian languages:
    '1.5 lakh', '2.5L', '50k', '50,000', '150000', '2 crore', '80 thousand', '२ लाख', '५० हजार', '1 லட்சம்'
    """
    normalized = normalize_indic_text(text)
    clean_text = normalized.lower().replace(",", "").strip()

    lakh_words = r'(?:lakh|lakhs|lac|lacs|l|लाख|লাখ|લાખ|లక్ష|లక్షలు|ലക്ഷം|ಲಕ್ಷ|ਲੱਖ|ଲକ୍ଷ|லட்சம்|இலட்சம்|لاکھ|লক্ষ)'
    lakh_match = re.search(rf'([0-9]+(?:\.[0-9]+)?)\s*{lakh_words}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean_text)
    if lakh_match:
        return float(lakh_match.group(1)) * 100000

    cr_words = r'(?:crore|crores|cr|करोड़|कोटी|কোটি|కోట్లు|കോടി|கோடி|ਕਰੋੜ|କୋଟି|کروڑ)'
    cr_match = re.search(rf'([0-9]+(?:\.[0-9]+)?)\s*{cr_words}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean_text)
    if cr_match:
        return float(cr_match.group(1)) * 10000000

    k_words = r'(?:thousand|k|हजार|हज़ार|হাজার|ஆயிரம்|వేలు|ਸਾਲ|ಸಾಸ್ತಿರ|ആയിരം|હજાર|ହାଜାର|ہزار)'
    k_match = re.search(rf'([0-9]+(?:\.[0-9]+)?)\s*{k_words}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean_text)
    if k_match:
        return float(k_match.group(1)) * 1000

    digit_match = re.search(r'(?:rs\.?|inr|₹)?\s*([0-9]{4,8})(?:$|[\s.,!?;:()\[\]\"\'\-])', clean_text)
    if digit_match:
        return float(digit_match.group(1))

    return None

def parse_contextual_amounts(text: str) -> tuple[Optional[float], Optional[float]]:
    """Extracts (income, loan_amount) simultaneously when multiple numbers appear in one sentence."""
    normalized = normalize_indic_text(text)
    clean = re.sub(r'(?<=\d),(?=\d)', '', normalized.lower()).replace(",", " ")
    income_val = None
    loan_val = None

    # Check for income patterns across 23 languages
    inc_kws = (
        r'(?:income|salary|earn|earning|annual|aamdani|kamai|aavak|varshik|parivarik|utpann|aay|'
        r'आय|वार्षिक आय|पारिवारिक आय|आमदनी|कमाई|वेतन|'
        r'আয়|বার্ষিক আয়|পারিবারিক আয়|বেতন|'
        r'வருமானம்|ஆண்டு வருமானம்|குடும்ப வருமானம்|சம்பளம்|'
        r'ఆదాయం|వార్షిక ఆదాయం|జీతం|'
        r'ಆದಾಯ|ವಾರ್ಷಿಕ ಆದಾಯ|'
        r'വരുമാനം|വാർഷിക വരുമാനം|'
        r'ઉત્પન્ન|આવક|વાર્ષિક આવક|'
        r'ਆਮਦਨ|ਸਾਲਾਨਾ ਆਮਦਨ|'
        r'ଆୟ|ବାର୍ଷିକ ଆୟ|'
        r'آمدنی|سالانہ آمدنی)'
    )
    unit_pattern = r'(lakh|lakhs|lac|lacs|l|k|thousand|cr|crore|लाख|লাখ|லட்சம்|లక్ష|లక్షలు|ലക്ഷം|ಲಕ್ಷ|ਲੱਖ|ଲକ୍ଷ|لاکھ)?'

    income_match = re.search(rf'{inc_kws}\s*(?:is|of|around|approx|:)?\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*{unit_pattern}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean)
    if not income_match:
        income_match = re.search(rf'([0-9]+(?:\.[0-9]+)?)\s*{unit_pattern}\s*(?:का|के|की|এর|இன்|యొక్క|ಯ|ന്റെ)?\s*(?:[^\d\n,]{{0,25}})\s*{inc_kws}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean)

    if income_match:
        num = float(income_match.group(1))
        unit = (income_match.group(2) or '').lower()
        if unit in ('lakh', 'lakhs', 'lac', 'lacs', 'l', 'लाख', 'লাখ', 'லட்சம்', 'లక్ష', 'లక్షలు', 'ലക്ഷം', 'ಲಕ್ಷ', 'ਲੱਖ', 'ଲକ୍ଷ', 'لاکھ'):
            income_val = num * 100000
        elif unit in ('k', 'thousand', 'हजार', 'হাজার', 'ஆயிரம்', 'వేలు', 'ਸਾਲ', 'സാവിര', 'ആയിരം', 'ہزار'):
            income_val = num * 1000
        elif unit in ('cr', 'crore', 'करोड़', 'কোটি', 'கோடி', 'కోట్లు', 'കോടി', 'کروڑ'):
            income_val = num * 10000000
        else:
            income_val = num

    # Check for loan amount patterns across 23 languages
    loan_kws = (
        r'(?:loan|funding|amount|need|require|cost|karz|udhar|chahiye|chahta|lena|'
        r'ऋण|कर्ज|उधार|लोन|सहायता|धनराशि|चाहिए|ज़रूरत|'
        r'ঋণ|ধার|লোন|দরকার|চাই|'
        r'கடன்|லோன்|வேண்டும்|தேவை|'
        r'రుణం|లోన్|కావాలి|అవసరం|'
        r'ಸಾಲ|ಲೋನ್|ಬೇಕು|ಅಗತ್ಯವಿದೆ|'
        r'വായ്പ|ലോൺ|വേണം|'
        r'લોન|ધિરાણ|જોઈએ|'
        r'ਕਰਜ਼ਾ|ਕਰਜ਼|ਲੋਨ|ਚਾਹੀਦਾ|'
        r'ଋଣ|ଲୋନ|ଦରକାର|'
        r'قرض|لون|چاہئے)'
    )
    loan_match = re.search(rf'{loan_kws}\s*(?:is|of|around|approx|:)?\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*{unit_pattern}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean)
    if not loan_match:
        loan_match = re.search(rf'([0-9]+(?:\.[0-9]+)?)\s*{unit_pattern}\s*(?:का|के|की|रुपये|টাকা|ரூபாய்|రూపాయలు|రూ\.|రూ|₹)?\s*(?:[^\d\n,]{{0,35}})\s*{loan_kws}(?:$|[\s.,!?;:()\[\]\"\'\-])', clean)

    if loan_match:
        num = float(loan_match.group(1))
        unit = (loan_match.group(2) or '').lower()
        if unit in ('lakh', 'lakhs', 'lac', 'lacs', 'l', 'लाख', 'লাখ', 'லட்சம்', 'లక్ష', 'లక్షలు', 'ലക്ഷം', 'ಲಕ್ಷ', 'ਲੱਖ', 'ଲକ୍ଷ', 'لاکھ'):
            loan_val = num * 100000
        elif unit in ('k', 'thousand', 'हजार', 'হাজার', 'ஆயிரம்', 'వేలు', 'ਸਾਲ', 'സാവിര', 'ആയിരം', 'ہزار'):
            loan_val = num * 1000
        elif unit in ('cr', 'crore', 'करोड़', 'কোটি', 'கோடி', 'కోట్లు', 'കോടി', 'کروڑ'):
            loan_val = num * 10000000
        else:
            loan_val = num

    return income_val, loan_val

def extract_sc_status(text: str) -> Optional[str]:
    """Extracts SC category confirmation across Indian languages & English with safe whitespace boundary."""
    clean = text.lower().strip()

    # Affirmative keywords across 23 languages
    aff_pattern = (
        SAFE_BND_START +
        r'(yes|haan|ha|ji haan|i am sc|sc category|scheduled caste|belong to sc|true|sc|dalit|'
        r'हाँ|हा|हाँ जी|अनुसूचित जाति|एससी|दलित|'
        r'হ্যাঁ|হ্যা|তপশিলি জাতি|'
        r'होय|हो|अनुसूचित जाती|'
        r'ஆம்|பட்டியலின|பட்டியல்\s*இனம்|எஸ்\.சி|ஆதிதிராவிடர்|'
        r'అవును|షెడ్యూల్డ్ కులం|ఎస్సీ|'
        r'ಹೌದು|ಪರಿಶಿಷ್ಟ ಜಾತಿ|'
        r'അതെ|പട്ടികജാതി|'
        r'હા|અનુસૂચિત જાતિ|'
        r'ਹਾਂ|ਅਨੁਸੂਚਿਤ ਜਾਤੀ|'
        r'ହଁ|ଅନୁସୂଚିତ ଜାତି|'
        r'হয়|অনুসূচীত জাতি|'
        r'हँ|आम्|अनुसूचितजाति|ہاں|شیڈولڈ کاسٹ|हो|'
        r'ᱥᱟᱹᱨᱤ|ᱦᱚᱭ|آہ|ਜੀ ਹਾਂ|আমা|హౌదు)' +
        SAFE_BND_END
    )
    if re.search(aff_pattern, clean):
        return "YES"

    # Negative keywords across languages (strictly matching whole words so 'नाम' is not matched)
    neg_pattern = (
        SAFE_BND_START +
        r'(no|nahin|nahi|general|obc|open|general category|false|'
        r'नहीं|नाहीं|नाही|ना|না|இல்லை|காது|కాదు|ಇಲ್ಲ|അല്ല|ના|ਨਹੀਂ|ନୁହେଁ|نہیں|नहि|होइन|सामान्य|ओबीसी|'
        r'ᱵᱟᱝ|نہ|নহয়|ନାହିଁ)' +
        SAFE_BND_END
    )
    if re.search(neg_pattern, clean):
        return "NO"

    # In progress keywords
    prog_pattern = (
        SAFE_BND_START +
        r'(in progress|applied|waiting|certificate making|ban raha hai|बन रहा है|प्रक्रियाधीन|'
        r'প্রক্রিয়াধীন|சான்றிதழ் விண்ணப்பிக்கப்பட்டுள்ளது|సర్టిఫికేట్ పురోగతిలో ఉంది|ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ|'
        r'പ്രക്രിയയിലാണ്|પ્રક્રિયા હેઠળ છે|ਪ੍ਰਕਿਰਿਆ ਅਧੀਨ|زیرِ عمل)' +
        SAFE_BND_END
    )
    if re.search(prog_pattern, clean):
        return "IN_PROGRESS"

    return None

def extract_gender(text: str) -> Optional[str]:
    """Extracts gender: FEMALE, MALE, or OTHER across all 23 languages without Unicode boundary truncation."""
    clean = text.lower().strip()

    female_pattern = (
        SAFE_BND_START +
        r'(female|woman|women|girl|lady|mahila|aurat|stri|she|her|'
        r'महिला|औरत|स्त्री|लड़की|जनाना|नारी|মহিলা|মেয়ে|নারী|'
        r'பெண்|பெண்கள்|மகிளா|'
        r'స్త్రీ|మహిళ|మహిళలు|ఆడ|'
        r'ಮಹಿಳೆ|ಹೆಣ್ಣು|ಸ್ತ್ರೀ|'
        r'സ്ത്രീ|സ്ത്രീകൾ|'
        r'સ્ત્રી|મહિલા|'
        r'ਮਹਿਲਾ|ਔਰਤ|ਇਸਤਰੀ|'
        r'ମହିଳା|ସ୍ତ୍ରୀ|'
        r'খাতুন|عورت|زن|خاتون|'
        r'মাইকী|মিচে|মাইপাকপী|महिलाः)' +
        SAFE_BND_END
    )
    if re.search(female_pattern, clean):
        return "FEMALE"

    male_pattern = (
        SAFE_BND_START +
        r'(male|man|men|boy|purush|aadmi|he|him|guy|'
        r'पुरुष|मर्द|आदमी|लड़का|नर|পুরুষ|ছেলে|'
        r'ஆண்|ஆண்கள்|'
        r'పురుషుడు|పురుష|మగ|'
        r'ಪುರುಷ|ಗಂಡು|'
        r'പുരുഷൻ|'
        r'પુરુષ|નર|'
        r'ਪੁਰਸ਼|ਮਰਦ|'
        r'ପୁରୁଷ|'
        r'مرد|آدمی|مردانہ|'
        r'হৌদা|पुरुषः)' +
        SAFE_BND_END
    )
    if re.search(male_pattern, clean):
        return "MALE"

    other_pattern = (
        SAFE_BND_START +
        r'(other|transgender|trans|third gender|non-binary|'
        r'अन्य|इतर|अन्यथा|অন্যান্য|மற்றவை|ఇతర|ಇತರೆ|മറ്റുള്ളവ|અન્ય|ਹੋਰ|ଅନ୍ୟାନ୍ୟ|دیگر|किन्नर|हिजड़ा)' +
        SAFE_BND_END
    )
    if re.search(other_pattern, clean):
        return "OTHER"

    return None

def extract_disability(text: str) -> Optional[bool]:
    """Extracts disability / PwD status from English, Hindi, and all 23 regional languages."""
    clean = text.lower().strip()
    neg_pwd_match = re.search(SAFE_BND_START + r'(no disability|not disabled|not pwd|not handicapped|koi viklangta nahi|nahi|no|नहीं|না|ಇಲ್ಲ|இல்லை)' + SAFE_BND_END, clean)
    if neg_pwd_match and any(w in clean for w in ["pwd", "disabled", "disability", "viklang", "divyang"]):
        return False

    pwd_pattern = (
        SAFE_BND_START +
        r'(pwd|disabled|disability|handicap|handicapped|divyang|divyangjan|viklang|blind|deaf|orthopedic|udid|adip|tricycle|motorized tricycle|wheelchair|hearing aid|prosthetic|artificial limb|'
        r'दिव्यांग|दिव्यांगजन|विकलांग|अपंग|अंधे|नेत्रहीन|बधिर|मूक-बधिर|हैंडीकैप|'
        r'প্রতিবন্ধী|প্রতিবন্ধি|'
        r'மாற்றுத்திறனாளி|ஊனம்|செவித்திறன்|பார்வையற்ற|'
        r'దివ్యాంగులు|దివ్యాంగుడు|వికలాంగులు|వికలాంగ|దివ్యాంగ|'
        r'വികലാംഗർ|ഭിന്നശേഷಿ|'
        r'ವಿಕಲಚೇತನ|ಅಂಗವಿಕಲ|ಅಂಗವಿಕಲತೆ|'
        r'દિવ્યાંગ|વિકલાંગ|અંગહીન|'
        r'ਵਿਕਲਾਂਗ|ਦਿਵਿਆਂਗ|'
        r'ଦିବ୍ୟାଙ୍ଗ|'
        r'معذور|نابینا|दिव्याङ्ग)' +
        SAFE_BND_END
    )
    if re.search(pwd_pattern, clean):
        return True
    return None

def extract_purpose_and_project_type_regex(text: str) -> tuple[Optional[str], Optional[str]]:
    """Identifies broad purpose and specific project type via multilingual keywords across all 23 languages."""
    clean = text.lower()

    # 1. Assistive Devices / PwD Grants (ADIP)
    adip_pattern = (
        SAFE_BND_START +
        r'(wheelchair|tricycle|motorized tricycle|hearing aid|braille|prosthetic|artificial limb|assistive|aids and appliances|adip|'
        r'उपकरण|ट्राईसाइकिल|व्हीलचेयर|सहायक उपकरण|'
        r'সহায়ক সরঞ্জাম|হুইলচেয়ার|'
        r'உபகரணம்|உபகரணங்கள்|சக்கர நாற்காலி|'
        r'పరికరాలు|చక్రాల కుర్చీ|ట్రైసైకిల్|'
        r'ಸಲಕರಣೆ|ಗಾಲಿಕುರ್ಚಿ|'
        r'ഉപകരണങ്ങൾ|വീൽചെയർ|'
        r'ਸਹਾਇਕ ਉਪਕਰਣ|ਵ੍ਹੀਲਚੇਅਰ|'
        r'معذور آلات)' +
        SAFE_BND_END
    )
    if re.search(adip_pattern, clean):
        return "assistive_grant", "assistive_device"

    # 2. Education (Higher Education Loan Scheme / Study Abroad)
    edu_pattern = (
        SAFE_BND_START +
        r'(education|study|studies|college|university|degree|btech|mbbs|school|fees|higher education|abroad|mtech|mba|'
        r'पढ़ाई|शिक्षा|कॉलेज|विश्वविद्यालय|फीस|उच्च शिक्षा|'
        r'পড়াশোনা|পড়াশোনা|উচ্চশিক্ষা|কলেজ|বিশ্ববিদ্যালয়|'
        r'கல்வி|படிப்பு|கல்லூரி|பல்கலைக்கழகம்|உயர் கல்வி|'
        r'చదువు|విద్యా|కాలేజీ|విశ్వవిద్యాలయం|ఉన్నత విద్య|'
        r'ಶಿಕ್ಷಣ|ಓದು|ಕಾಲೇಜು|ಉನ್ನತ ಶಿಕ್ಷಣ|'
        r'വിദ്യാഭ്യാസം|പഠനം|കോളേജ്|ഉന്നത വിദ്യാഭ്യാസം|'
        r'ભણતર|શિક્ષણ|કોલેજ|'
        r'ਸਿੱਖਿਆ|ਪੜ੍ਹਾਈ|ਕਾਲਜ|'
        r'ଶିକ୍ଷା|ପାଠପଢା|କଲେଜ|'
        r'تعليم|پڑھائی|کالج)' +
        SAFE_BND_END
    )
    if re.search(edu_pattern, clean):
        voc_pattern = SAFE_BND_START + r'(vocational|diploma|iti|polytechnic|डिप्लोमा|पॉलिटेक्निक|ডিপ্লোমা|டிப்ளமோ|డిప్లొమా|ಡಿಪ್ಲೊಮಾ|ഡിപ്ലോമ)' + SAFE_BND_END
        if re.search(voc_pattern, clean):
            return "education", "vocational"
        return "education", "higher_education"

    # 3. Tailoring / Boutique (Mahila Samriddhi Yojana)
    tailor_pattern = (
        SAFE_BND_START +
        r'(tailor|tailoring|boutique|stitching|garment|cloth|dress|sewing machine|apparel|'
        r'सिलाई|शिलाई|दर्जी|सिलाई मशीन|शिलाई मशीन|बुटीक|कपड़े|सिलाई केंद्र|शिलाई केंद्र|शिलाई काम|'
        r'দর্জি|দর্জি দোকান|দর্জি কাজ|বুটিঙ্ক|সেলাই মেশিন|'
        r'தையல்|தையல் மெஷின்|தையல் தொழில்|தையல் கடை|பூட்டிக்|'
        r'టైలరింగ్|టైలరింగ్ షాపు|కుట్టు మిషన్|బోటిక్|'
        r'ಟೈಲರಿಂಗ್|ಹೊಲಿಗೆ|ಹೊಲಿಗೆ ಯಂತ್ರ|ಬೊಟಿಕ್|'
        r'തയ്യൽ|തയ്യൽ മെഷീൻ|ബോട്ടിക്|'
        r'દરજી|દરજી કામ|સીવણ મશીન|'
        r'ਸਿਲਾਈ|ਦਰਜ਼ੀ|ਸਿਲਾਈ ਮਸ਼ੀਨ|ਬੂਟੀਕ|'
        r'ସିଲେଇ|ଦରଜି|ସିଲେଇ ମେସିନ|'
        r'سلائی|درزی|سلائی مشین|بوتیک)' +
        SAFE_BND_END
    )
    if re.search(tailor_pattern, clean):
        return "self_employment", "tailoring"

    # 4. Beauty Parlor / Salon
    parlor_pattern = (
        SAFE_BND_START +
        r'(beauty parlor|beauty parlour|salon|makeup|cosmetics|hairdresser|'
        r'ब्यूटी पार्लर|पार्लर|सलून|श्रृंगार|'
        r'বিউটি পার্লার|মেকআপ|'
        r'பியூட்டி பார்லர்|சலூன்|'
        r'బ్యూటీ పార్లర్|సెలూన్|'
        r'ಬ್ಯೂಟಿ ಪಾರ್ಲರ್|ಸಲೂನ್|'
        r'ബ്യൂട്ടി പാർലർ|സലൂൺ|'
        r'બ્યુટી પાર્લર|સલૂન|'
        r'ਬਿਊਟੀ ਪਾਰਲਰ|'
        r'ବ୍ୟୁଟି ପାର୍ଲର|'
        r'بیوٹی پارلر|سیلون)' +
        SAFE_BND_END
    )
    if re.search(parlor_pattern, clean):
        return "self_employment", "beauty_parlor"

    # 5. Dairy / Livestock / Animal Husbandry
    dairy_pattern = (
        SAFE_BND_START +
        r'(dairy|cow|buffalo|milk|cattle|livestock|pashupalan|dairy farm|goat|poultry|hen|chicken|animal husbandry|'
        r'डेयरी|दूध|गाय|भैंस|पशुपालन|बकरी पालन|मुर्गी पालन|गोपालन|दुग्ध|'
        r'ডেইরি|দুধ|গরু|পশুপালন|ছাগল পালন|হাঁস-মুরগি|'
        r'பால் பண்ணை|பால்|மாடு|பசு|கால்நடை|ஆடு வளர்ப்பு|கோழி பண்ணை|'
        r'పాడి|ఆవులు|గేదెలు|పాడి పరిశ్రమ|గొర్రెల పెంపకం|కోళ్ల ఫారమ్|'
        r'ಹೈನುಗಾರಿಕೆ|ಡೈರಿ|ಹಸು|ಎಮ್ಮೆ|ಕುರಿ ಸಾಕಾಣಿಕೆ|ಕೋಳಿ ಸಾಕಾಣಿಕೆ|'
        r'ഡയറി|ക്ഷീരവികസനം|പശു|ആട് വളർത്തൽ|കോഴി ഫാം|'
        r'ડેરી|દૂધ|ગાય|ભેંસ|પશુપાલન|'
        r'ਡੇਅਰੀ|ਗਾਵਾਂ|ਮੱਝਾਂ|ਪਸ਼ੂ ਪਾਲਣ|'
        r'ଡାଏରୀ|ଦୁଗ୍ଧ|ଗାଈ|ପଶୁପାଳନ|'
        r'ڈیری|دودھ|گائے|بھینس|مویشی پالنا)' +
        SAFE_BND_END
    )
    if re.search(dairy_pattern, clean):
        return "self_employment", "dairy"

    # 6. Transport / Commercial Auto / E-Rickshaw
    transport_pattern = (
        SAFE_BND_START +
        r'(auto|rickshaw|e-rickshaw|electric auto|taxi|car|tempo|transport|driver|commercial vehicle|small truck|cab|'
        r'रिक्शा|ई-रिक्शा|ऑटो|गाड़ी|टैक्सी|ड्राइवर|टेंपो|परिवहन|'
        r'গাড়ি|অটো|রিকশা|ই-রিকশা|ট্যাক্সি|'
        r'ஆட்டோ|வாஹனம்|வாகனம்|டாக்ஸி|இ-ரிக்ஷா|'
        r'ఆటో|వాహనం|టాక్సీ|ఈ-రిక్షా|రవాణా|'
        r'ಆಟೋ|ಟ್ಯಾಕ್ಸಿ|ವಾಹನ|ಇ-ರಿಕ್ಷಾ|'
        r'ഓട്ടോ|ടാക്സി|വാഹനം|ഇ-റിക്ഷ|'
        r'રીક્ષા|ઈ-રીક્ષા|ટેક્સી|વાહન|'
        r'ਰਿਕਸ਼ਾ|ਈ-ਰਿਕਸ਼ਾ|ਟੈਕਸੀ|ਗੱਡੀ|'
        r'ଅଟୋ|ଇ-ରିକ୍ସା|ଟ୍ୟାକ୍ସି|'
        r'آٹو|ای رکشہ|ٹیکسی|گاڑی)' +
        SAFE_BND_END
    )
    if re.search(transport_pattern, clean):
        erick_pat = SAFE_BND_START + r'(electric|battery|e-rickshaw|ई-रिक्शा|बैटरी|ই-রিকশা|இ-ரிக்ஷா|ఈ-రిక్షా|ಇ-ರಿಕ್ಷಾ|ઈ-રીક્ષા|ای رکشہ)' + SAFE_BND_END
        if re.search(erick_pat, clean):
            return "business", "electric_rickshaw"
        return "business", "transport"

    # 7. Grocery / Kirana / Provision Store
    grocery_pattern = (
        SAFE_BND_START +
        r'(grocery|kirana|ration|provision|general store|supermarket|vegetable|fmcg|'
        r'किराना|दुकान|राशन|जनरल स्टोर|सब्जी|पंसारी|'
        r'মুদি|মুদি দোকান|রেশন|'
        r'மளிகை|மளிகை கடை|மளிகைப்பொருள்|'
        r'కిరాణా|కిరాణా షాపు|రేషన్ షాపు|'
        r'ದಿನಸಿ|ದಿನಸಿ ಅಂಗಡಿ|ರೇಷನ್ ಅಂಗಡಿ|'
        r'പലചരക്ക്|പലചരക്ക് കട|റേഷൻ കട|'
        r'કરીયાણું|કરિયાણાની દુકાન|'
        r'ਪਰਚੂਨ|ਕਰਿਆਨਾ ਦੁਕਾਨ|'
        r'କିରାନା|ରାସନ ଦୋକାନ|'
        r'کریانہ|جنرل اسٹور|راشن کی دکان)' +
        SAFE_BND_END
    )
    if re.search(grocery_pattern, clean):
        return "business", "grocery"

    # 8. Solar / Green Energy
    solar_pattern = (
        SAFE_BND_START +
        r'(solar|green energy|solar panel|rooftop solar|renewable|clean energy|'
        r'सोलर|सौर ऊर्जा|सोलर पैनल|'
        r'সৌর শক্তি|সোলার প্যানেল|'
        r'சோலார்|சூரிய ஒளி மின்சாரம்|'
        r'సౌర విద్యుత్|సోలార్ ప్యానెల్|'
        r'ಸೌರ ಶಕ್ತಿ|ಸೋಲಾರ್|'
        r'സൗരോർജ്ജം|സോളാർ|'
        r'સોલાર|સૌર ઊર્જા|'
        r'ਸੋਲਰ|ਸੂਰਜੀ ਊਰਜਾ|'
        r'ସୌର ଶକ୍ତି|'
        r'شمسی توانائی|سولر)' +
        SAFE_BND_END
    )
    if re.search(solar_pattern, clean):
        return "business", "solar_installation"

    # 9. Skill Training
    skill_pattern = (
        SAFE_BND_START +
        r'(skill|training|course|prashikshan|learn|vocational training|skill development|'
        r'प्रशिक्षण|ट्रेनिंग|हुनर|कौशल विकास|'
        r'প্রশিক্ষণ|দক্ষতা উন্নয়ন|'
        r'பயிற்சி|திறன் பயிற்சி|'
        r'శిక్షణ|నైపుణ్య శిక్షణ|'
        r'ತರಬೇತಿ|ಕೌಶಲ್ಯ ತರಬೇತಿ|'
        r'പരിശീലനം|തൊഴിൽ പരിശീലനം|'
        r'તાલીમ|કૌશલ્ય વિકાસ|'
        r'ਸਿਖਲਾਈ|ਹੁਨਰ ਵਿਕਾਸ|'
        r'ପ୍ରଶିକ୍ଷଣ|ଦକ୍ଷତା ବିକାଶ|'
        r'تربیت|ہنر)' +
        SAFE_BND_END
    )
    if re.search(skill_pattern, clean):
        return "skill_development", "skill_training"

    # 10. General Business / Shop / Trade / Micro-Enterprise
    shop_pattern = (
        SAFE_BND_START +
        r'(business|shop|retail|dukan|vyapar|trade|store|start business|small business|enterprise|self employed|'
        r'व्यापार|दुकान|व्यवसाय|कारोबार|उद्यम|स्वरोजगार|'
        r'কারবার|দোকান|ব্যবসা|'
        r'வியாபாரம்|கடை|தொழில்|வணிகம்|'
        r'వ్యాపారం|దుకాణం|చిరు వ్యాపారం|'
        r'ವ್ಯಾಪಾರ|ಅಂಗಡಿ|ಸಣ್ಣ ಉದ್ಯಮ|'
        r'വ്യാപാരം|കട|ചെറുകിട ബിസിനസ്സ്|'
        r'વેપાર|દુકાન|ધંધો|'
        r'ਵਪਾਰ|ਦੁਕਾਨ|ਕਾਰੋਬਾਰ|'
        r'ବ୍ୟବସାୟ|ଦୋକାନ|'
        r'کاروبار|دکان|تجارت)' +
        SAFE_BND_END
    )
    if re.search(shop_pattern, clean):
        return "business", "shop"

    return None, None

STATE_ALIASES: Dict[str, List[str]] = {
    "Tamil Nadu": ["tamil nadu", "tamilnadu", "தமிழ்நாடு", "तमिलनाडु", "তামিলনাড়ু", "తమిళనాడు", "ತಮಿಳುನಾಡು", "തമിഴ്നാട്"],
    "Uttar Pradesh": ["uttar pradesh", "up", "उत्तर प्रदेश", "उत्तरप्रदेश", "উত্তর প্রদেশ", "ఉత్తర ప్రదేశ్", "உத்தரப் பிரதேசம்"],
    "Bihar": ["bihar", "बिहार", "বিহার", "బీహార్", "பீகார்"],
    "Maharashtra": ["maharashtra", "महाराष्ट्र", "মহারাষ্ট্র", "మహారాష్ట్ర", "மகாராஷ்டிரா", "ಮಹಾರಾಷ್ಟ್ರ"],
    "West Bengal": ["west bengal", "bengal", "पश्चिम बंगाल", "পশ্চিমবঙ্গ", "পশ্চিম বঙ্গ", "పశ్చిమ బెంగాల్", "மேற்கு வங்காளம்"],
    "Rajasthan": ["rajasthan", "राजस्थान", "রাজস্থান", "రాజస్థాన్", "ராஜஸ்தான்"],
    "Madhya Pradesh": ["madhya pradesh", "mp", "मध्य प्रदेश", "মধ্যপ্রদেশ", "మధ్యప్రదేశ్", "மத்தியப் பிரதேசம்"],
    "Karnataka": ["karnataka", "कर्नाटक", "ಕರ್ನಾಟಕ", "কর্ণাটক", "కర్ణాటక", "கர்நாடகா", "കർണാടക"],
    "Gujarat": ["gujarat", "गुजरात", "ગુજરાત", "গুজরাট", "గుజరాత్", "குஜராத்"],
    "Andhra Pradesh": ["andhra pradesh", "andhra", "आंध्र प्रदेश", "ఆంధ్రప్రదేశ్", "ஆந்திரப் பிரதேசம்", "ಆಂಧ್ರಪ್ರದೇಶ"],
    "Telangana": ["telangana", "तेलंगाना", "తెలంగాణ", "തെലങ്കാന", "ತೆಲಂಗಾಣ", "தெலுங்கானா"],
    "Kerala": ["kerala", "केरल", "കേരളം", "கேரளா", "కేరళ", "ಕೇರಳ"],
    "Punjab": ["punjab", "पंजाब", "ਪੰਜਾਬ", "পাঞ্জাব", "పంజాబ్", "பஞ்சாப்"],
    "Haryana": ["haryana", "हरियाणा", "ਹਰਿਆਣਾ", "হরিয়ানা", "హర్యానా", "ஹரியானா"],
    "Odisha": ["odisha", "orissa", "ओडिशा", "ଓଡ଼ିଶା", "ওড়িশা", "ఒడిశా", "ஒடிசா"],
    "Assam": ["assam", "असम", "অসম", "আসাম", "అస్సాం", "அசாம்"],
    "Delhi": ["delhi", "दिल्ली", "দিল্লি", "ఢిల్లీ", "டெல்லி", "ದೆಹಲಿ"],
    "Jharkhand": ["jharkhand", "झारखंड", "ঝাড়খণ্ড", "ఝార్ఖండ్", "ஜார்க்கண்ட்"],
    "Chhattisgarh": ["chhattisgarh", "छत्तीसगढ़", "ছত্তিশগড়", "ఛత్తీస్‌గఢ్", "சத்தீஸ்கர்"],
    "Himachal Pradesh": ["himachal pradesh", "himachal", "हिमाचल प्रदेश", "হিমাচল প্রদেশ"],
    "Uttarakhand": ["uttarakhand", "उत्तराखंड", "উত্তরাখণ্ড"],
    "Jammu and Kashmir": ["jammu and kashmir", "jammu", "kashmir", "j&k", "जम्मू-कश्मीर", "جموں و کشمیر"],
    "Puducherry": ["puducherry", "pondicherry", "पुडुचेरी", "புதுச்சேரி", "పుదుచ్చేరి"],
    "Tripura": ["tripura", "त्रिपुरा", "ত্রিপুরা"],
    "Manipur": ["manipur", "मणिपुर", "মণিপুর"],
    "Goa": ["goa", "गोवा", "গোয়া"],
}

def extract_location_regex(text: str) -> tuple[Optional[str], Optional[str]]:
    """Extracts State and District from text across all 23 Indian languages using multilingual aliases."""
    clean = text.lower()
    matched_state = None
    matched_district = None

    # Check multilingual state aliases first
    for state_canonical, aliases in STATE_ALIASES.items():
        if any(alias.lower() in clean for alias in aliases):
            matched_state = state_canonical
            break

    if not matched_state:
        for state in INDIAN_STATES:
            if state.lower() in clean:
                matched_state = state
                break

    for dist in COMMON_DISTRICTS:
        if dist.lower() in clean:
            matched_district = dist
            break

    return matched_state, matched_district

# -------------------------------------------------------------
# Layer 2: spaCy NER Extraction
# -------------------------------------------------------------

def extract_with_spacy(text: str) -> Dict[str, Any]:
    """Uses spaCy NER to extract missing MONEY/CARDINAL and GPE (Location)."""
    nlp = get_spacy_nlp()
    if not nlp:
        return {}

    extracted = {}
    try:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ("MONEY", "CARDINAL"):
                amt = parse_indian_amount(ent.text)
                if amt and "amount" not in extracted:
                    extracted["amount"] = amt
            elif ent.label_ == "GPE":
                if "location" not in extracted:
                    extracted["location"] = ent.text
    except Exception as e:
        logger.warning("spaCy entity extraction error: %s", e)

    return extracted

# -------------------------------------------------------------
# Master NLU Pipeline
# -------------------------------------------------------------

def extract_slots(text: str, current_slots: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Executes NLU Pipeline in the exact fallback order:
    1. Regex / keyword extraction
    2. spaCy NER for missing numeric / location entities
    3. SimilarityMatcher for project_type if still unresolved
    """
    slots = dict(current_slots or {})
    clean_text = text.strip()

    # 1. SC Status
    if slots.get("sc_status") is None:
        sc = extract_sc_status(clean_text)
        if sc is not None:
            slots["sc_status"] = sc

    # 1b. Gender
    if slots.get("gender") is None:
        g = extract_gender(clean_text)
        if g is not None:
            slots["gender"] = g

    # 1c. Disability / PwD Status
    if slots.get("is_pwd") is None:
        pwd_val = extract_disability(clean_text)
        if pwd_val is not None:
            slots["is_pwd"] = pwd_val

    # 2. Income and/or Loan Amount via Regex
    ctx_income, ctx_loan = parse_contextual_amounts(clean_text)
    if ctx_income is not None:
        slots["income"] = ctx_income
    if ctx_loan is not None:
        slots["amount"] = ctx_loan

    # Fallback to single amount only if contextual matching didn't resolve both
    if ctx_income is None and ctx_loan is None:
        extracted_num = parse_indian_amount(clean_text)
        if extracted_num is not None:
            text_low = clean_text.lower()
            loan_indicators = [
                "loan", "amount", "need", "require", "chahiye", "udhar", "mora", "karz", "rin",
                "लोन", "कर्ज", "ऋण", "चाहिए", "দরকার", "চাই", "ঋণ", "வேண்டும்", "கடன்", "కావాలి", "రుణం", "ಬೇಕು", "ಸಾಲ", "വേണം", "ਕਰਜ਼ਾ"
            ]
            income_indicators = [
                "income", "kamai", "aamdani", "earning", "salary", "family", "varshik",
                "आय", "कमाई", "आमदनी", "वार्षिक", "আয়", "வருமானம்", "ఆదాయం", "ಆದಾಯ", "വരുമാനം"
            ]
            if any(k in text_low for k in loan_indicators):
                if slots.get("amount") is None:
                    slots["amount"] = extracted_num
            elif any(k in text_low for k in income_indicators):
                if slots.get("income") is None:
                    slots["income"] = extracted_num
            else:
                # Assign to earliest missing slot
                if slots.get("income") is None:
                    slots["income"] = extracted_num
                elif slots.get("amount") is None:
                    slots["amount"] = extracted_num

    # 3. Purpose & Project Type via Regex
    if slots.get("project_type") is None:
        purp, p_type = extract_purpose_and_project_type_regex(clean_text)
        if purp:
            slots["purpose"] = purp
        if p_type:
            slots["project_type"] = p_type

    # 4. Location via Regex
    st, dist = extract_location_regex(clean_text)
    if st and not slots.get("state"):
        slots["state"] = st
    if dist and not slots.get("district"):
        slots["district"] = dist

    # ---------------------------------------------------------
    # Layer 2: spaCy NER Fallback
    # ---------------------------------------------------------
    if slots.get("income") is None or slots.get("amount") is None or not (slots.get("state") or slots.get("district")):
        spacy_ents = extract_with_spacy(clean_text)

        # Fallback numeric
        if spacy_ents.get("amount"):
            if slots.get("income") is None:
                slots["income"] = spacy_ents["amount"]
            elif slots.get("amount") is None:
                slots["amount"] = spacy_ents["amount"]

        # Fallback location
        if spacy_ents.get("location"):
            loc_val = spacy_ents["location"]
            if not slots.get("state") and not slots.get("district"):
                # Check if it matches state or district
                st_match, dist_match = extract_location_regex(loc_val)
                if st_match:
                    slots["state"] = st_match
                elif dist_match:
                    slots["district"] = dist_match
                else:
                    slots["district"] = loc_val

    # ---------------------------------------------------------
    # Layer 3: SentenceTransformers Similarity Matcher Fallback
    # ---------------------------------------------------------
    if slots.get("project_type") is None and len(clean_text.split()) >= 2:
        # User entered free-text project description that didn't hit strict regex
        matched_proj = match_project_type(clean_text, ALL_PROJECT_LABELS, threshold=0.45)
        if matched_proj:
            slots["project_type"] = matched_proj
            if not slots.get("purpose"):
                # Map project_type to high-level purpose
                if matched_proj in ("higher_education", "vocational", "technical_courses", "abroad_study"):
                    slots["purpose"] = "education"
                elif matched_proj in ("tailoring", "beauty_parlor", "dairy", "poultry", "goat_farming"):
                    slots["purpose"] = "self_employment"
                elif matched_proj == "skill_training":
                    slots["purpose"] = "skill_development"
                else:
                    slots["purpose"] = "business"

    return slots
