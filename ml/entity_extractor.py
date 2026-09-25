"""
AryaSaarthi ML Pipeline — Local Deterministic Entity & Profile Extractor
Extracts domain profile attributes from user queries without any external LLM calls.
Attributes: age, state, district, occupation, land_area, land_unit, crop, annual_income,
loan_requirement, assistance_requirement.
"""

import re
from typing import Dict, Any, Optional, Tuple
from .preprocess import clean_text


INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
]

COMMON_DISTRICTS = {
    # West Bengal
    "Kolkata": "West Bengal", "Howrah": "West Bengal", "Hooghly": "West Bengal",
    "North 24 Parganas": "West Bengal", "South 24 Parganas": "West Bengal",
    "Nadia": "West Bengal", "Murshidabad": "West Bengal", "Malda": "West Bengal",
    "Bardhaman": "West Bengal", "Burdwan": "West Bengal", "Purba Bardhaman": "West Bengal",
    "Paschim Bardhaman": "West Bengal", "Birbhum": "West Bengal", "Bankura": "West Bengal",
    "Purulia": "West Bengal", "Midnapore": "West Bengal", "Paschim Medinipur": "West Bengal",
    "Purba Medinipur": "West Bengal", "Jalpaiguri": "West Bengal", "Darjeeling": "West Bengal",
    "Kalimpong": "West Bengal", "Cooch Behar": "West Bengal", "Alipurduar": "West Bengal",
    "Uttar Dinajpur": "West Bengal", "Dakshin Dinajpur": "West Bengal", "Jhargram": "West Bengal",
    # Other Key Districts
    "Patna": "Bihar", "Gaya": "Bihar", "Muzaffarpur": "Bihar", "Bhagalpur": "Bihar",
    "Lucknow": "Uttar Pradesh", "Kanpur": "Uttar Pradesh", "Varanasi": "Uttar Pradesh",
    "Prayagraj": "Uttar Pradesh", "Agra": "Uttar Pradesh", "Gorakhpur": "Uttar Pradesh",
    "Bhopal": "Madhya Pradesh", "Indore": "Madhya Pradesh", "Pune": "Maharashtra",
    "Nagpur": "Maharashtra", "Ludhiana": "Punjab", "Amritsar": "Punjab", "Jaipur": "Rajasthan"
}

OCCUPATIONS = [
    ("marginal farmer", ["marginal farmer", "marginal farmers", "small and marginal farmer", "small and marginal farmers"]),
    ("small farmer", ["small farmer", "small farmers"]),
    ("tenant farmer", ["tenant farmer", "tenant farmers", "lessee farmer", "lessee farmers"]),
    ("sharecropper", ["sharecropper", "sharecroppers", "bhagchasi", "bhagchasis", "bataidar"]),
    ("dairy farmer", ["dairy farmer", "dairy farmers", "dairy farming", "dairy", "milk producer", "cattle farmer"]),
    ("poultry farmer", ["poultry farmer", "poultry farmers", "poultry farming", "poultry", "chicken farm"]),
    ("farmer", ["farmer", "farmers", "cultivator", "cultivators", "kisan", "kisans", "krishak", "grower", "growers", "agriculture worker", "chasi"]),
    ("tailor", ["tailor", "tailors", "tailoring", "boutique", "stitching", "seamstress", "dressmaker"]),
    ("weaver", ["weaver", "weavers", "handloom", "weaving"]),
    ("artisan", ["artisan", "artisans", "craftsman", "craftsmen", "potter", "carpenter", "blacksmith"]),
    ("beautician", ["beautician", "beauticians", "beauty parlor", "beauty parlour", "salon owner"]),
    ("shopkeeper", ["shopkeeper", "shopkeepers", "grocery store", "kirana", "retailer", "small vendor", "street vendor"]),
    ("student", ["student", "students", "scholar", "scholars", "aspirant", "aspirants", "college student"]),
    ("agricultural laborer", ["agricultural laborer", "agricultural laborers", "farm laborer", "khet mazdoor", "labourer"])
]

CROPS = [
    "paddy", "rice", "wheat", "mustard", "potato", "jute", "maize", "cotton",
    "sugarcane", "pulses", "gram", "lentil", "tea", "vegetables", "onion", "soybean"
]

ASSISTANCE_MAP = [
    ("tractor subsidy", ["tractor", "power tiller", "rotavator", "farm machinery", "smam", "harvester"]),
    ("drip irrigation", ["drip irrigation", "sprinkler", "micro irrigation", "per drop more crop"]),
    ("crop insurance", ["crop insurance", "fasal bima", "pmfby", "crop loss"]),
    ("kisan credit card", ["kcc", "kisan credit card", "crop loan"]),
    ("direct cash support", ["pm kisan", "krishak bandhu", "cash assistance", "grant", "direct income"]),
    ("solar pump", ["solar pump", "pm kusum", "solar irrigation"]),
    ("education loan", ["education loan", "study abroad", "college fee loan", "elis"])
]


def parse_numeric_amount(val_str: str, multiplier_unit: Optional[str] = None) -> Optional[float]:
    """Converts string like '2', '2.5', '1,50,000' with optional unit into float value."""
    try:
        clean_num = val_str.replace(",", "").strip()
        num = float(clean_num)
        if multiplier_unit:
            unit = multiplier_unit.lower()
            if unit in ["lakh", "lakhs", "lac", "lacs", "l"]:
                return num * 100000.0
            elif unit in ["crore", "crores", "cr"]:
                return num * 10000000.0
            elif unit in ["k", "thousand"]:
                return num * 1000.0
        return num
    except (ValueError, TypeError):
        return None


def extract_profile(text: str) -> Dict[str, Any]:
    """
    Extracts structured user profile attributes from arbitrary natural language query.
    Returns dictionary with any discovered profile fields.
    """
    if not text:
        return {}

    cleaned = clean_text(text)
    entities: Dict[str, Any] = {}

    # 1. State extraction
    for state in INDIAN_STATES:
        # Match whole word pattern
        pattern = rf"\b{re.escape(state.lower())}\b"
        if re.search(pattern, cleaned):
            entities["state"] = state
            break

    # 2. District extraction
    for dist, dist_state in COMMON_DISTRICTS.items():
        pattern = rf"\b{re.escape(dist.lower())}\b"
        if re.search(pattern, cleaned):
            entities["district"] = dist
            if "state" not in entities:
                entities["state"] = dist_state
            break

    # 3. Occupation extraction (ordered from specific to general)
    for canonical_occ, syns in OCCUPATIONS:
        matched = False
        for syn in syns:
            if re.search(rf"\b{re.escape(syn)}\b", cleaned):
                entities["occupation"] = canonical_occ
                matched = True
                break
        if matched:
            break

    # 4. Land area and land unit extraction
    # Matches patterns like "2 acres", "1.5 acre", "3 bigha", "have 2.5 acres of land", "5 hectare"
    land_match = re.search(
        r'(?:have|own|with|holding|area|of)?\s*([0-9]+(?:\.[0-9]+)?)\s*(acres?|bighas?|hectares?|gunthas?|cents?|decimals?)(?:\s*(?:of\s*)?land)?\b',
        cleaned
    )
    if land_match:
        try:
            val = float(land_match.group(1))
            unit = land_match.group(2).rstrip('s')
            entities["land_area"] = val
            entities["land_unit"] = unit
        except (ValueError, TypeError):
            pass

    # 5. Age extraction
    # Matches "35 years old", "age 28", "age is 45", "am 30 years of age"
    age_match = re.search(
        r'\b(?:age\s*(?:is|:)?\s*|am\s*)([1-9][0-9])\s*(?:years?\s*(?:old|of\s*age)?)?\b',
        cleaned
    )
    if age_match:
        age_val = int(age_match.group(1))
        if 16 <= age_val <= 100:
            entities["age"] = age_val

    # 6. Crop extraction
    for crop in CROPS:
        if re.search(rf"\b{re.escape(crop)}\b", cleaned):
            entities["crop"] = crop
            break

    # 7. Annual Income extraction
    # Matches "income is 1.5 lakh", "income to 240000", "earning 3 lakhs", "annual income 180000"
    income_match = re.search(
        r'(?:income|salary|earning|annual\s*income)(?:\s*(?:is|of|around|to|as|:))?\s*(?:rupees|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(lakhs?|lacs?|crores?|cr|k|thousand)?\b',
        cleaned
    )
    if income_match:
        val_str = income_match.group(1)
        unit_str = income_match.group(2)
        parsed_inc = parse_numeric_amount(val_str, unit_str)
        if parsed_inc:
            entities["annual_income"] = parsed_inc

    # 8. Loan requirement extraction
    # Matches "loan of 2 lakhs", "need 50000 loan", "borrow 1 lakh", "loan requirement 1.4 lakh"
    loan_match = re.search(
        r'(?:loan|borrow|credit|financing)(?:\s*(?:of|is|need|require|around|amount|:))?\s*(?:rupees|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(lakhs?|lacs?|crores?|cr|k|thousand)?\b',
        cleaned
    )
    if not loan_match:
        loan_match = re.search(
            r'(?:need|require|want)\s*(?:rupees|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(lakhs?|lacs?|crores?|cr|k|thousand)?\s*(?:loan|amount|for)',
            cleaned
        )
    if loan_match:
        val_str = loan_match.group(1)
        unit_str = loan_match.group(2)
        parsed_loan = parse_numeric_amount(val_str, unit_str)
        if parsed_loan and ("annual_income" not in entities or entities["annual_income"] != parsed_loan):
            entities["loan_requirement"] = parsed_loan

    # 9. Assistance requirement extraction
    for canonical_ast, syns in ASSISTANCE_MAP:
        for syn in syns:
            if re.search(rf"\b{re.escape(syn)}\b", cleaned):
                entities["assistance_requirement"] = canonical_ast
                break
        if "assistance_requirement" in entities:
            break

    return entities
