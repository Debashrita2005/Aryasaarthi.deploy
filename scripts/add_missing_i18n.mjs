import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = '/Users/adityasingh/092/src/lib/i18n';

// Native translations for key languages' missing sections
// For less common languages, we use English (they extend typeof en, so English is acceptable)
const nativeTranslations = {
  bn: {
    backToHome: 'মূল পৃষ্ঠায় ফিরুন',
    sortedByDistance: 'দূরত্ব অনুযায়ী সাজানো',
    searchPlaceholder: 'ব্যাংক, শহর, জেলা খুঁজুন...',
    pincodeSearch: 'পিনকোড',
    listView: 'তালিকা দর্শন',
    mapView: 'মানচিত্র দর্শন',
    noResults: 'এই ফিল্টারের জন্য কোনো অংশীদার পাওয়া যায়নি।',
    locating: 'অবস্থান খুঁজে পাওয়া হচ্ছে...',
    enterPincode: '৬ সংখ্যার পিনকোড লিখুন',
    searchByPincode: 'পিনকোড দিয়ে খুঁজুন',
    helpTitle: 'নথি প্রস্তুতি ও সহায়তা কেন্দ্র',
    helpSubtitle: 'আবেদনের আগে প্রয়োজনীয় নথি, প্রক্রিয়া এবং সাধারণ প্রশ্নের উত্তর।',
    helpStepsTitle: 'ঋণ পাওয়ার ৫টি ধাপ',
    pillarVyakti: 'সঠিক ব্যক্তি (Sahi Vyakti)',
    pillarVyaktiDesc: 'প্রকৃত SC নাগরিকদের সুবিধা নিশ্চিত করতে লক্ষ্যভিত্তিক যাচাইকরণ।',
    pillarYojna: 'সঠিক প্রকল্প (Sahi Yojna)',
    pillarYojnaDesc: 'সুলভ সুদে সেরা ঋণ প্রকল্পে স্বচ্ছ ও নির্ধারক সংযোগ।',
    pillarMarg: 'সঠিক পথ (Sahi Marg)',
    pillarMargDesc: 'আপনার জেলার কাছাকাছি অনুমোদিত SCA ও গ্রামীণ ব্যাংকে সরাসরি পথনির্দেশ।',
    loginTitle: 'নাগরিক ও সুবিধাভোগী লগইন',
    signedIn: 'আপনি লগইন আছেন',
  },
  te: {
    backToHome: 'హోమ్‌కు తిరిగి వెళ్ళు',
    sortedByDistance: 'దూరం ప్రకారం క్రమబద్ధీకరించబడింది',
    searchPlaceholder: 'బ్యాంకు, నగరం, జిల్లా వెతకండి...',
    pincodeSearch: 'పిన్‌కోడ్',
    listView: 'జాబితా వీక్షణ',
    mapView: 'మ్యాప్ వీక్షణ',
    noResults: 'ఈ ఫిల్టర్‌కు సరిపోయే భాగస్వాములు కనుగొనబడలేదు.',
    locating: 'స్థానాన్ని కనుగొంటున్నారు...',
    enterPincode: '6 అంకెల పిన్‌కోడ్ నమోదు చేయండి',
    searchByPincode: 'పిన్‌కోడ్ ద్వారా వెతకండి',
    helpTitle: 'పత్రాల తయారీ & సహాయ కేంద్రం',
    helpSubtitle: 'దరఖాస్తు చేయడానికి ముందు అవసరమైన పత్రాలు, ప్రక్రియ మరియు తరచుగా అడిగే ప్రశ్నలు.',
    helpStepsTitle: 'రుణం పొందడానికి 5 దశలు',
    pillarVyakti: 'సరైన వ్యక్తి (Sahi Vyakti)',
    pillarVyaktiDesc: 'నిజమైన SC పౌరులకు పారదర్శకంగా ప్రయోజనాలు చేరేలా లక్ష్యంగా చేసుకున్న ధృవీకరణ.',
    pillarYojna: 'సరైన పథకం (Sahi Yojna)',
    pillarYojnaDesc: 'వ్యాపారం లేదా విద్యకు అనువైన రుణ పథకానికి నిర్ణయాత్మక, పారదర్శక సంయోజనం.',
    pillarMarg: 'సరైన మార్గం (Sahi Marg)',
    pillarMargDesc: 'మీ జిల్లా సమీపంలోని ధృవీకరించబడిన SCA మరియు గ్రామీణ బ్యాంకులకు నేరుగా మార్గదర్శనం.',
    loginTitle: 'పౌర & లబ్ధిదారుని సైన్ ఇన్',
    signedIn: 'మీరు సైన్ ఇన్ చేశారు',
  },
  mr: {
    backToHome: 'मुख्य पृष्ठावर परत जा',
    sortedByDistance: 'अंतरानुसार क्रमवारी',
    searchPlaceholder: 'बँक, शहर, जिल्हा शोधा...',
    pincodeSearch: 'पिनकोड',
    listView: 'यादी दृश्य',
    mapView: 'नकाशा दृश्य',
    noResults: 'या फिल्टरसाठी कोणतेही भागीदार सापडले नाहीत.',
    locating: 'स्थान शोधत आहे...',
    enterPincode: '6 अंकी पिनकोड प्रविष्ट करा',
    searchByPincode: 'पिनकोडने शोधा',
    helpTitle: 'कागदपत्रे तयारी व सहाय्य केंद्र',
    helpSubtitle: 'अर्ज करण्यापूर्वी आवश्यक कागदपत्रे, प्रक्रिया आणि वारंवार विचारले जाणारे प्रश्न.',
    helpStepsTitle: 'कर्ज मिळवण्याची ५ पायऱ्यांची प्रक्रिया',
    pillarVyakti: 'सही व्यक्ती (Sahi Vyakti)',
    pillarVyaktiDesc: 'वास्तविक SC नागरिकांना पारदर्शकतेने लाभ मिळावा यासाठी लक्ष्यित वैधानिक सत्यापन.',
    pillarYojna: 'सही योजना (Sahi Yojna)',
    pillarYojnaDesc: 'व्यवसाय किंवा शिक्षणासाठी आदर्श सवलतीच्या कर्ज योजनेशी निर्धारक, पारदर्शक जोडणी.',
    pillarMarg: 'सही मार्ग (Sahi Marg)',
    pillarMargDesc: 'तुमच्या जिल्ह्याजवळील सत्यापित SCA आणि ग्रामीण भागीदार बँकांपर्यंत थेट मार्गदर्शन.',
    loginTitle: 'नागरिक व लाभार्थी लॉगिन',
    signedIn: 'आपण लॉग इन आहात',
  },
  kn: {
    backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    sortedByDistance: 'ದೂರದ ಪ್ರಕಾರ ವಿಂಗಡಿಸಲಾಗಿದೆ',
    searchPlaceholder: 'ಬ್ಯಾಂಕ್, ನಗರ, ಜಿಲ್ಲೆ ಹುಡುಕಿ...',
    pincodeSearch: 'ಪಿನ್‌ಕೋಡ್',
    listView: 'ಪಟ್ಟಿ ವೀಕ್ಷಣೆ',
    mapView: 'ನಕ್ಷೆ ವೀಕ್ಷಣೆ',
    noResults: 'ಈ ಫಿಲ್ಟರ್‌ಗಾಗಿ ಯಾವುದೇ ಪಾಲುದಾರರು ಕಂಡುಬಂದಿಲ್ಲ.',
    locating: 'ಸ್ಥಳ ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    enterPincode: '6 ಅಂಕಿಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ',
    searchByPincode: 'ಪಿನ್‌ಕೋಡ್ ಮೂಲಕ ಹುಡುಕಿ',
    helpTitle: 'ದಾಖಲೆ ತಯಾರಿ ಮತ್ತು ಸಹಾಯ ಕೇಂದ್ರ',
    helpSubtitle: 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಅಗತ್ಯ ದಾಖಲೆಗಳು, ಪ್ರಕ್ರಿಯೆ ಮತ್ತು ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳ ಉತ್ತರಗಳು.',
    helpStepsTitle: 'ಸಾಲ ಪಡೆಯಲು 5 ಹಂತಗಳು',
    pillarVyakti: 'ಸರಿಯಾದ ವ್ಯಕ್ತಿ (Sahi Vyakti)',
    pillarVyaktiDesc: 'ನಿಜವಾದ SC ನಾಗರಿಕರಿಗೆ ಪಾರದರ್ಶಕವಾಗಿ ಪ್ರಯೋಜನಗಳನ್ನು ತಲುಪಿಸಲು ಗುರಿ-ಆಧಾರಿತ ಪರಿಶೀಲನೆ.',
    pillarYojna: 'ಸರಿಯಾದ ಯೋಜನೆ (Sahi Yojna)',
    pillarYojnaDesc: 'ವ್ಯವಹಾರ ಅಥವಾ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಆದರ್ಶ ರಿಯಾಯಿತಿ ಸಾಲ ಯೋಜನೆಗೆ ನಿರ್ಣಾಯಕ, ಪಾರದರ್ಶಕ ಸಂಯೋಜನೆ.',
    pillarMarg: 'ಸರಿಯಾದ ದಾರಿ (Sahi Marg)',
    pillarMargDesc: 'ನಿಮ್ಮ ಜಿಲ್ಲೆ ಸಮೀಪದ ಪರಿಶೀಲಿತ SCA ಮತ್ತು ಗ್ರಾಮೀಣ ಬ್ಯಾಂಕ್‌ಗಳಿಗೆ ನೇರ ಮಾರ್ಗದರ್ಶನ.',
    loginTitle: 'ನಾಗರಿಕ ಮತ್ತು ಫಲಾನುಭವಿ ಸೈನ್ ಇನ್',
    signedIn: 'ನೀವು ಸೈನ್ ಇನ್ ಆಗಿದ್ದೀರಿ',
  },
  ml: {
    backToHome: 'ഹോം പേജിലേക്ക് മടങ്ങുക',
    sortedByDistance: 'ദൂരം അനുസരിച്ച് ക്രമീകരിച്ചിരിക്കുന്നു',
    searchPlaceholder: 'ബാങ്ക്, നഗരം, ജില്ല തിരയുക...',
    pincodeSearch: 'പിൻകോഡ്',
    listView: 'ലിസ്റ്റ് വ്യൂ',
    mapView: 'മാപ്പ് വ്യൂ',
    noResults: 'ഈ ഫിൽട്ടറിന് യോജിക്കുന്ന പങ്കാളികൾ കണ്ടെത്തിയില്ല.',
    locating: 'സ്ഥാനം കണ്ടെത്തുന്നു...',
    enterPincode: '6 അക്ക പിൻകോഡ് നൽകുക',
    searchByPincode: 'പിൻകോഡ് ഉപയോഗിച്ച് തിരയുക',
    helpTitle: 'രേഖ തയ്യാറാക്കൽ & സഹായ കേന്ദ്രം',
    helpSubtitle: 'അപേക്ഷ നൽകുന്നതിന് മുൻപ് ആവശ്യമായ രേഖകൾ, നടപടിക്രമം, പൊതു ചോദ്യങ്ങൾക്ക് ഉത്തരങ്ങൾ.',
    helpStepsTitle: 'വായ്പ ലഭിക്കാൻ 5 ഘട്ടങ്ങൾ',
    pillarVyakti: 'ശരിയായ വ്യക്തി (Sahi Vyakti)',
    pillarVyaktiDesc: 'യഥാർഥ SC പൗരന്മാർക്ക് ആനുകൂല്യങ്ങൾ ലഭ്യമാക്കാൻ ലക്ഷ്യബോധമുള്ള സ്ഥിരീകരണം.',
    pillarYojna: 'ശരിയായ പദ്ധതി (Sahi Yojna)',
    pillarYojnaDesc: 'വ്യവസായം അല്ലെങ്കിൽ വിദ്യാഭ്യാസത്തിനായി ആദർശ ആനുകൂല്യ വായ്പാ പദ്ധതിയിലേക്ക് സുതാര്യ ബന്ധം.',
    pillarMarg: 'ശരിയായ മാർഗം (Sahi Marg)',
    pillarMargDesc: 'നിങ്ങളുടെ ജില്ലയ്ക്ക് സമീപമുള്ള SCA, ഗ്രാമീണ ബാങ്കുകൾ എന്നിവിടങ്ങളിലേക്ക് നേരിട്ടുള്ള വഴി.',
    loginTitle: 'പൗര & ഗുണഭോക്തൃ സൈൻ ഇൻ',
    signedIn: 'നിങ്ങൾ സൈൻ ഇൻ ചെയ്തിരിക്കുന്നു',
  },
  gu: {
    backToHome: 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ',
    sortedByDistance: 'અંતર અનુસાર ક્રમ',
    searchPlaceholder: 'બેન્ક, શહેર, જિલ્લો શોધો...',
    pincodeSearch: 'પિનકોડ',
    listView: 'સૂચિ દૃશ્ય',
    mapView: 'નકશો દૃશ્ય',
    noResults: 'આ ફિલ્ટર માટે કોઈ ભાગીદારો મળ્યા નથી.',
    locating: 'સ્થાન શોધી રહ્યા છીએ...',
    enterPincode: '6 અંકનો પિનકોડ દાખલ કરો',
    searchByPincode: 'પિનકોડ દ્વારા શોધો',
    helpTitle: 'દસ્તાવેજ તૈયારી & સહાય કેન્દ્ર',
    helpSubtitle: 'અરજી કરતા પહેલાં જરૂરી દસ્તાવેજો, પ્રક્રિયા અને સામાન્ય પ્રશ્નોના જવાબ.',
    helpStepsTitle: 'લોન મેળવવા માટે ૫ પગથિયાં',
    pillarVyakti: 'સાચો વ્યક્તિ (Sahi Vyakti)',
    pillarVyaktiDesc: 'વ્યૂહાત્મક SC નાગરિકોને પારદર્શક રીતે લાભ મળે તે સુનિશ્ચિત.',
    pillarYojna: 'સાચી યોજના (Sahi Yojna)',
    pillarYojnaDesc: 'વ્યવસાય અથવા શિક્ષણ માટે આદર્શ રિયાયતી ઋણ યોજના સાથે પારદર્શક જોડાણ.',
    pillarMarg: 'સાચો રસ્તો (Sahi Marg)',
    pillarMargDesc: 'તમારા જિલ્લા નજીક ચકાસાયેલ SCA અને ગ્રામ્ય ભાગીદાર બેન્કોમાં સીધી ઍક્સેસ.',
    loginTitle: 'નાગરિક અને લાભાર્થી સાઇન ઇન',
    signedIn: 'આપ સૉઇન ઇન છો',
  },
  pa: {
    backToHome: 'ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਾਪਸ ਜਾਓ',
    sortedByDistance: 'ਦੂਰੀ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ',
    searchPlaceholder: 'ਬੈਂਕ, ਸ਼ਹਿਰ, ਜ਼ਿਲ੍ਹਾ ਖੋਜੋ...',
    pincodeSearch: 'ਪਿੰਨਕੋਡ',
    listView: 'ਸੂਚੀ ਦ੍ਰਿਸ਼',
    mapView: 'ਨਕਸ਼ਾ ਦ੍ਰਿਸ਼',
    noResults: 'ਇਸ ਫਿਲਟਰ ਲਈ ਕੋਈ ਭਾਈਵਾਲ ਨਹੀਂ ਮਿਲੇ।',
    locating: 'ਟਿਕਾਣਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    enterPincode: '6 ਅੰਕਾਂ ਦਾ ਪਿੰਨਕੋਡ ਦਾਖਲ ਕਰੋ',
    searchByPincode: 'ਪਿੰਨਕੋਡ ਨਾਲ ਖੋਜੋ',
    helpTitle: 'ਦਸਤਾਵੇਜ਼ ਤਿਆਰੀ ਅਤੇ ਸਹਾਇਤਾ ਕੇਂਦਰ',
    helpSubtitle: 'ਅਰਜ਼ੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼, ਪ੍ਰਕਿਰਿਆ ਅਤੇ ਆਮ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ।',
    helpStepsTitle: 'ਕਰਜ਼ਾ ਪ੍ਰਾਪਤ ਕਰਨ ਦੇ ੫ ਕਦਮ',
    pillarVyakti: 'ਸਹੀ ਵਿਅਕਤੀ (Sahi Vyakti)',
    pillarVyaktiDesc: 'ਅਸਲੀ SC ਨਾਗਰਿਕਾਂ ਨੂੰ ਪਾਰਦਰਸ਼ੀ ਢੰਗ ਨਾਲ ਲਾਭ ਮਿਲਣਾ ਯਕੀਨੀ।',
    pillarYojna: 'ਸਹੀ ਯੋਜਨਾ (Sahi Yojna)',
    pillarYojnaDesc: 'ਕਾਰੋਬਾਰ ਜਾਂ ਸਿੱਖਿਆ ਲਈ ਆਦਰਸ਼ ਰਿਆਇਤੀ ਕਰਜ਼ਾ ਯੋਜਨਾ ਨਾਲ ਪਾਰਦਰਸ਼ੀ ਮੇਲ।',
    pillarMarg: 'ਸਹੀ ਰਸਤਾ (Sahi Marg)',
    pillarMargDesc: 'ਤੁਹਾਡੇ ਜ਼ਿਲ੍ਹੇ ਦੇ ਨੇੜੇ ਤਸਦੀਕਸ਼ੁਦਾ SCA ਅਤੇ ਗ੍ਰਾਮੀਣ ਬੈਂਕਾਂ ਤੱਕ ਸਿੱਧੀ ਪਹੁੰਚ।',
    loginTitle: 'ਨਾਗਰਿਕ ਅਤੇ ਲਾਭਪਾਤਰੀ ਸਾਈਨ ਇਨ',
    signedIn: 'ਤੁਸੀਂ ਸਾਈਨ ਇਨ ਕੀਤਾ ਹੈ',
  }
};

// Common English fallback for less common languages
const enFallback = {
  backToHome: 'Back to Home',
  sortedByDistance: 'Sorted by distance',
  searchPlaceholder: 'Search bank, city, district...',
  pincodeSearch: 'Pincode',
  listView: 'List View',
  mapView: 'Map View',
  noResults: 'No matching partners found for this filter.',
  locating: 'Locating...',
  enterPincode: 'Enter 6-digit pincode',
  searchByPincode: 'Search by Pincode',
  helpTitle: 'Help & Document Preparation',
  helpSubtitle: 'Prepare your documents, understand the application route, and find answers to common questions.',
  helpStepsTitle: '5-Step Application Process',
  pillarVyakti: 'Sahi Vyakti — Right Beneficiary',
  pillarVyaktiDesc: 'Share your goals, profile, and requirements. AryaSaarthi identifies your support needs through intelligent analysis.',
  pillarYojna: 'Sahi Yojna — Right Scheme',
  pillarYojnaDesc: 'Combining AI intelligence with official eligibility rules to recommend the most suitable government schemes.',
  pillarMarg: 'Sahi Marg — Right Path',
  pillarMargDesc: 'Connect with verified channel partners, understand required documents, and move forward confidently.',
  loginTitle: 'Citizen & Beneficiary Sign In',
  signedIn: 'You are Signed In',
};

const langFiles = ['as', 'bn', 'brx', 'doi', 'gu', 'kn', 'kok', 'ks', 'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'];

for (const lang of langFiles) {
  const filePath = join(dir, `${lang}.ts`);
  let content = readFileSync(filePath, 'utf-8');

  const t = nativeTranslations[lang] || enFallback;
  const common_backToHome = t.backToHome || enFallback.backToHome;
  const sortedByDistance = t.sortedByDistance || enFallback.sortedByDistance;
  const searchPlaceholder = t.searchPlaceholder || enFallback.searchPlaceholder;
  const pincodeSearch = t.pincodeSearch || enFallback.pincodeSearch;
  const listView = t.listView || enFallback.listView;
  const mapView = t.mapView || enFallback.mapView;
  const noResults = t.noResults || enFallback.noResults;
  const locating = t.locating || enFallback.locating;
  const enterPincode = t.enterPincode || enFallback.enterPincode;
  const searchByPincode = t.searchByPincode || enFallback.searchByPincode;
  const helpTitle = t.helpTitle || enFallback.helpTitle;
  const helpSubtitle = t.helpSubtitle || enFallback.helpSubtitle;
  const helpStepsTitle = t.helpStepsTitle || enFallback.helpStepsTitle;
  const pillarVyakti = t.pillarVyakti || enFallback.pillarVyakti;
  const pillarVyaktiDesc = t.pillarVyaktiDesc || enFallback.pillarVyaktiDesc;
  const pillarYojna = t.pillarYojna || enFallback.pillarYojna;
  const pillarYojnaDesc = t.pillarYojnaDesc || enFallback.pillarYojnaDesc;
  const pillarMarg = t.pillarMarg || enFallback.pillarMarg;
  const pillarMargDesc = t.pillarMargDesc || enFallback.pillarMargDesc;
  const loginTitle = t.loginTitle || enFallback.loginTitle;
  const signedIn = t.signedIn || enFallback.signedIn;

  const appendix = `
  ,
  backToHome: '${common_backToHome.replace(/'/g, "\\'")}',
  sortedByDistance: '${sortedByDistance.replace(/'/g, "\\'")}',
  searchPlaceholder: '${searchPlaceholder.replace(/'/g, "\\'")}',
  pincodeSearch: '${pincodeSearch.replace(/'/g, "\\'")}',
  listView: '${listView.replace(/'/g, "\\'")}',
  mapView: '${mapView.replace(/'/g, "\\'")}',
  noResults: '${noResults.replace(/'/g, "\\'")}',
  locating: '${locating.replace(/'/g, "\\'")}',
  enterPincode: '${enterPincode.replace(/'/g, "\\'")}',
  searchByPincode: '${searchByPincode.replace(/'/g, "\\'")}'`;

  // The common section ends with `back: '...'` - we need to insert the new keys before the closing }
  // Find pattern: back: '...' followed by newline + spaces + }
  const backPattern = /(back:\s*'[^']*')\s*\n(\s*}\s*\n\s*};)/;
  
  if (!content.includes('backToHome:')) {
    const newContent = content.replace(backPattern, (match, backLine, closing) => {
      return `${backLine},\n    backToHome: '${common_backToHome.replace(/'/g, "\\'")}',\n    sortedByDistance: '${sortedByDistance.replace(/'/g, "\\'")}',\n    searchPlaceholder: '${searchPlaceholder.replace(/'/g, "\\'")}',\n    pincodeSearch: '${pincodeSearch.replace(/'/g, "\\'")}',\n    listView: '${listView.replace(/'/g, "\\'")}',\n    mapView: '${mapView.replace(/'/g, "\\'")}',\n    noResults: '${noResults.replace(/'/g, "\\'")}',\n    locating: '${locating.replace(/'/g, "\\'")}',\n    enterPincode: '${enterPincode.replace(/'/g, "\\'")}',\n    searchByPincode: '${searchByPincode.replace(/'/g, "\\'")}'
\n${closing}`;
    });

    // Now add the help, homePillars, and login sections before the final `};`
    const finalContent = newContent.replace(
      /\n\};(\n*)$/,
      `,\n\n  // Help Page\n  help: {\n    title: '${helpTitle.replace(/'/g, "\\'")}',\n    subtitle: '${helpSubtitle.replace(/'/g, "\\'")}',\n    stepsTitle: '${helpStepsTitle.replace(/'/g, "\\'")}',\n    step1Title: 'Step 1: Check scheme eligibility',\n    step1Desc: 'Use our smart finder to check eligibility for NSFDC schemes.',\n    step2Title: 'Step 2: Prepare certificates',\n    step2Desc: 'Caste certificate and family income certificate required.',\n    step3Title: 'Step 3: Prepare quotation / letter',\n    step3Desc: 'Business quotation or college admission letter required.',\n    step4Title: 'Step 4: Contact SCA office',\n    step4Desc: 'Visit district SCA branch and fill the application form.',\n    step5Title: 'Step 5: Verification & bank transfer',\n    step5Desc: 'Agency verifies and transfers funds directly to your bank account.',\n    docsTitle: 'Document Checklist',\n    doc1Title: 'Caste Certificate (Mandatory)',\n    doc1Sub: 'Issued by Tehsildar / SDO / DM',\n    doc2Title: 'Income Certificate (Mandatory)',\n    doc2Sub: 'Annual family income <= ₹5,00,000',\n    doc3Title: 'Aadhaar / Voter ID',\n    doc3Sub: 'Identity & address proof',\n    doc4Title: 'Bank Passbook Copy',\n    doc4Sub: 'Active account with IFSC code',\n    doc5Title: 'Business Quotation',\n    doc5Sub: 'For equipment or shop setup',\n    doc6Title: 'Admission Letter',\n    doc6Sub: 'For education loan applicants',\n    faqTitle: 'Frequently Asked Questions',\n    faq1Q: 'Who is eligible for NSFDC loans?',\n    faq1A: 'SC community members with annual income below ₹5,00,000.',\n    faq2Q: 'Can I apply directly here?',\n    faq2A: 'No. Apply through authorized State Channelizing Agencies.',\n    faq3Q: 'Is there any fee or commission?',\n    faq3A: 'No. Beware of unauthorized agents claiming guaranteed approval.',\n    faq4Q: 'Women interest rebate?',\n    faq4A: '1% rebate for eligible women under Mahila Samriddhi Yojana.',\n    faq5Q: 'Moratorium period in education loans?',\n    faq5A: 'Repayment starts 6 months after course or 1 year after employment.',\n    exploreSchemes: '← Explore All Schemes',\n    locateSca: 'Locate Nearest SCA',\n    findScheme: 'Find My Matching Scheme'\n  },\n\n  // Home Pillars\n  homePillars: {\n    vyaktiTitle: '${pillarVyakti.replace(/'/g, "\\'")}',\n    vyaktiDesc: '${pillarVyaktiDesc.replace(/'/g, "\\'")}',\n    yojnaTitle: '${pillarYojna.replace(/'/g, "\\'")}',\n    yojnaDesc: '${pillarYojnaDesc.replace(/'/g, "\\'")}',\n    margTitle: '${pillarMarg.replace(/'/g, "\\'")}',\n    margDesc: '${pillarMargDesc.replace(/'/g, "\\'")}'  \n  },\n\n  // Login\n  login: {\n    title: '${loginTitle.replace(/'/g, "\\'")}',\n    signedIn: '${signedIn.replace(/'/g, "\\'")}',\n    secureLogin: 'Secure Citizen Login',\n    liveMode: 'Live Mode: Firebase SMS & Google Active',\n    sandboxMode: 'Sandbox Mode: Test OTP Active',\n    verified: 'Verified',\n    method: 'Method:',\n    role: 'Role: Beneficiary (SC Category)',\n    findSchemeBtn: 'Find My Scheme',\n    locateSca: 'Locate Channel SCA',\n    signOut: 'Sign Out',\n    mobileOtpTab: 'Mobile OTP',\n    googleTab: 'Sign in with Google',\n    mobileLabel: 'Indian Mobile Number',\n    getOtp: 'Get OTP',\n    prevStep: '← Previous Step',\n    demoOtp: 'Demo OTP:',\n    autoFill: 'Auto-Fill',\n    enterOtp: 'Enter 6-Digit OTP',\n    resendIn: 'Resend in',\n    resendOtp: 'Resend OTP',\n    verify: 'Verify',\n    continueGoogle: 'Continue with Google',\n    privileges: 'Beneficiary Privileges',\n    saveEligibility: 'Save Eligibility',\n    nearestSca: 'Nearest SCA',\n    emiSheet: 'EMI & Subsidy Sheet',\n    tollfree: 'Toll-Free Helpline:',\n    backToHome: '← Back to Home'\n  }\n};\n$1`
    );

    writeFileSync(filePath, finalContent, 'utf-8');
    console.log(`✅ Updated ${lang}.ts`);
  } else {
    console.log(`⏭️  ${lang}.ts already has backToHome`);
  }
}

console.log('\n✅ All language files updated!');
