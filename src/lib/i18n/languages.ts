export type LanguageCode =
  | 'hi'
  | 'en'
  | 'bn'
  | 'mr'
  | 'te'
  | 'ta'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur'
  | 'mai'
  | 'sat'
  | 'ks'
  | 'ne'
  | 'sd'
  | 'kok'
  | 'doi'
  | 'mni'
  | 'brx'
  | 'sa';

export type IndianRegion = 'North' | 'South' | 'East' | 'West' | 'Northeast' | 'Central' | 'Pan-India';

export interface LanguageOption {
  code: LanguageCode;
  nameEn: string;
  nameNative: string;
  displayText: string; // Formatted exactly as: "English | Regional name in regional script"
  dir?: 'ltr' | 'rtl';
  region: IndianRegion;
  regionLabel: string;
  primaryState: string;
  statesAndUTs: string[];
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'hi',
    nameEn: 'Hindi',
    nameNative: 'हिन्दी',
    displayText: 'Hindi | हिन्दी',
    region: 'North',
    regionLabel: 'उत्तर भारत (North India)',
    primaryState: 'Delhi, UP, MP, Bihar, Rajasthan',
    statesAndUTs: [
      'Uttar Pradesh',
      'Madhya Pradesh',
      'Bihar',
      'Rajasthan',
      'Haryana',
      'Himachal Pradesh',
      'Uttarakhand',
      'Chhattisgarh',
      'Jharkhand',
      'Delhi',
      'Chandigarh',
      'Andaman and Nicobar Islands',
    ],
  },
  {
    code: 'en',
    nameEn: 'English',
    nameNative: 'English',
    displayText: 'English | English',
    region: 'Pan-India',
    regionLabel: 'समस्त भारत (Pan-India)',
    primaryState: 'All States & UTs / राष्ट्रीय',
    statesAndUTs: [
      'Pan-India',
      'Nagaland',
      'Meghalaya',
      'Arunachal Pradesh',
      'All 28 States & 8 Union Territories',
    ],
  },
  {
    code: 'bn',
    nameEn: 'Bengali',
    nameNative: 'বাংলা',
    displayText: 'Bengali | বাংলা',
    region: 'East',
    regionLabel: 'पूर्वी भारत (East India)',
    primaryState: 'West Bengal & Tripura',
    statesAndUTs: ['West Bengal', 'Tripura', 'Assam (Barak Valley)', 'Andaman and Nicobar Islands'],
  },
  {
    code: 'mr',
    nameEn: 'Marathi',
    nameNative: 'मराठी',
    displayText: 'Marathi | मराठी',
    region: 'West',
    regionLabel: 'पश्चिम भारत (West India)',
    primaryState: 'Maharashtra & Goa',
    statesAndUTs: ['Maharashtra', 'Goa', 'Dadra and Nagar Haveli and Daman and Diu'],
  },
  {
    code: 'te',
    nameEn: 'Telugu',
    nameNative: 'తెలుగు',
    displayText: 'Telugu | తెలుగు',
    region: 'South',
    regionLabel: 'दक्षिण भारत (South India)',
    primaryState: 'Andhra Pradesh & Telangana',
    statesAndUTs: ['Andhra Pradesh', 'Telangana', 'Puducherry (Yanam)', 'Odisha (Border)'],
  },
  {
    code: 'ta',
    nameEn: 'Tamil',
    nameNative: 'தமிழ்',
    displayText: 'Tamil | தமிழ்',
    region: 'South',
    regionLabel: 'दक्षिण भारत (South India)',
    primaryState: 'Tamil Nadu & Puducherry',
    statesAndUTs: ['Tamil Nadu', 'Puducherry', 'Andaman and Nicobar Islands'],
  },
  {
    code: 'gu',
    nameEn: 'Gujarati',
    nameNative: 'ગુજરાતી',
    displayText: 'Gujarati | ગુજરાતી',
    region: 'West',
    regionLabel: 'पश्चिम भारत (West India)',
    primaryState: 'Gujarat, DNH & DD',
    statesAndUTs: ['Gujarat', 'Dadra and Nagar Haveli and Daman and Diu'],
  },
  {
    code: 'kn',
    nameEn: 'Kannada',
    nameNative: 'ಕನ್ನಡ',
    displayText: 'Kannada | ಕನ್ನಡ',
    region: 'South',
    regionLabel: 'दक्षिण भारत (South India)',
    primaryState: 'Karnataka',
    statesAndUTs: ['Karnataka', 'Goa', 'Maharashtra (Border)'],
  },
  {
    code: 'ml',
    nameEn: 'Malayalam',
    nameNative: 'മലയാളം',
    displayText: 'Malayalam | മലയാളം',
    region: 'South',
    regionLabel: 'दक्षिण भारत (South India)',
    primaryState: 'Kerala & Lakshadweep',
    statesAndUTs: ['Kerala', 'Lakshadweep', 'Puducherry (Mahe)'],
  },
  {
    code: 'pa',
    nameEn: 'Punjabi',
    nameNative: 'ਪੰਜਾਬੀ',
    displayText: 'Punjabi | ਪੰਜਾਬੀ',
    region: 'North',
    regionLabel: 'उत्तर भारत (North India)',
    primaryState: 'Punjab & Chandigarh',
    statesAndUTs: ['Punjab', 'Chandigarh', 'Haryana', 'Delhi', 'Himachal Pradesh'],
  },
  {
    code: 'or',
    nameEn: 'Odia',
    nameNative: 'ଓଡ଼ିଆ',
    displayText: 'Odia | ଓଡ଼ିଆ',
    region: 'East',
    regionLabel: 'पूर्वी भारत (East India)',
    primaryState: 'Odisha',
    statesAndUTs: ['Odisha', 'West Bengal (Border)', 'Jharkhand (Border)'],
  },
  {
    code: 'as',
    nameEn: 'Assamese',
    nameNative: 'অসমীয়া',
    displayText: 'Assamese | অসমীয়া',
    region: 'Northeast',
    regionLabel: 'पूर्वोत्तर भारत (Northeast India)',
    primaryState: 'Assam',
    statesAndUTs: ['Assam', 'Arunachal Pradesh (Border)', 'Meghalaya (Border)'],
  },
  {
    code: 'ur',
    nameEn: 'Urdu',
    nameNative: 'اُردُو',
    displayText: 'Urdu | اُردُو',
    dir: 'rtl',
    region: 'North',
    regionLabel: 'उत्तर व दक्षिण भारत (North & South India)',
    primaryState: 'J&K, Telangana, UP, Bihar, Delhi',
    statesAndUTs: [
      'Jammu and Kashmir',
      'Telangana',
      'Uttar Pradesh',
      'Bihar',
      'Delhi',
      'Andhra Pradesh',
    ],
  },
  {
    code: 'mai',
    nameEn: 'Maithili',
    nameNative: 'मैथिली',
    displayText: 'Maithili | मैथिली',
    region: 'East',
    regionLabel: 'पूर्वी भारत (East India)',
    primaryState: 'Bihar (Mithila) & Jharkhand',
    statesAndUTs: ['Bihar', 'Jharkhand'],
  },
  {
    code: 'sat',
    nameEn: 'Santali',
    nameNative: 'ᱥᱟᱱᱛᱟᱲᱤ',
    displayText: 'Santali | ᱥᱟᱱᱛᱟᱲᱤ',
    region: 'East',
    regionLabel: 'पूर्वी भारत (East India - Tribal Heritage)',
    primaryState: 'Jharkhand, Odisha, West Bengal',
    statesAndUTs: ['Jharkhand', 'Odisha', 'West Bengal', 'Bihar', 'Assam'],
  },
  {
    code: 'ks',
    nameEn: 'Kashmiri',
    nameNative: 'कॉशुर',
    displayText: 'Kashmiri | कॉशुर',
    region: 'North',
    regionLabel: 'उत्तर भारत (North India)',
    primaryState: 'Jammu & Kashmir',
    statesAndUTs: ['Jammu and Kashmir', 'Ladakh'],
  },
  {
    code: 'ne',
    nameEn: 'Nepali',
    nameNative: 'नेपाली',
    displayText: 'Nepali | नेपाली',
    region: 'Northeast',
    regionLabel: 'हिमालयी व पूर्वोत्तर (Himalayan & Northeast)',
    primaryState: 'Sikkim & West Bengal (Darjeeling)',
    statesAndUTs: ['Sikkim', 'West Bengal', 'Assam', 'Uttarakhand'],
  },
  {
    code: 'sd',
    nameEn: 'Sindhi',
    nameNative: 'سنڌي',
    displayText: 'Sindhi | سنڌي',
    dir: 'rtl',
    region: 'West',
    regionLabel: 'पश्चिम भारत (West India)',
    primaryState: 'Gujarat, Rajasthan, Maharashtra',
    statesAndUTs: ['Gujarat', 'Rajasthan', 'Maharashtra', 'Madhya Pradesh', 'Delhi'],
  },
  {
    code: 'kok',
    nameEn: 'Konkani',
    nameNative: 'कोंकणी',
    displayText: 'Konkani | कोंकणी',
    region: 'West',
    regionLabel: 'पश्चिम तटीय भारत (West Coastal India)',
    primaryState: 'Goa & Coastal Karnataka',
    statesAndUTs: ['Goa', 'Maharashtra', 'Karnataka', 'Kerala'],
  },
  {
    code: 'doi',
    nameEn: 'Dogri',
    nameNative: 'डोगरी',
    displayText: 'Dogri | डोगरी',
    region: 'North',
    regionLabel: 'उत्तर भारत (North India)',
    primaryState: 'Jammu & Kashmir (Jammu)',
    statesAndUTs: ['Jammu and Kashmir', 'Himachal Pradesh', 'Punjab'],
  },
  {
    code: 'mni',
    nameEn: 'Manipuri',
    nameNative: 'মৈতৈলোন্',
    displayText: 'Manipuri | মৈতৈলোন্',
    region: 'Northeast',
    regionLabel: 'पूर्वोत्तर भारत (Northeast India)',
    primaryState: 'Manipur',
    statesAndUTs: ['Manipur', 'Assam', 'Tripura'],
  },
  {
    code: 'brx',
    nameEn: 'Bodo',
    nameNative: 'बड़ो',
    displayText: 'Bodo | बड़ो',
    region: 'Northeast',
    regionLabel: 'पूर्वोत्तर भारत (Bodoland)',
    primaryState: 'Assam (Bodoland)',
    statesAndUTs: ['Assam', 'West Bengal', 'Meghalaya'],
  },
  {
    code: 'sa',
    nameEn: 'Sanskrit',
    nameNative: 'संस्कृतम्',
    displayText: 'Sanskrit | संस्कृतम्',
    region: 'Pan-India',
    regionLabel: 'समस्त भारत (Classical Heritage)',
    primaryState: 'Pan-India / शास्त्रीय भाषा',
    statesAndUTs: ['Uttarakhand', 'Himachal Pradesh', 'Pan-India'],
  },
];

export interface StateUTMapping {
  name: string;
  nameHi: string;
  type: 'STATE' | 'UT';
  primaryLang: LanguageCode;
  otherLangs?: LanguageCode[];
}

export const ALL_INDIAN_STATES_AND_UTS: StateUTMapping[] = [
  // 28 States
  { name: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश', type: 'STATE', primaryLang: 'te', otherLangs: ['ur', 'hi'] },
  { name: 'Arunachal Pradesh', nameHi: 'अरुणाचल प्रदेश', type: 'STATE', primaryLang: 'en', otherLangs: ['hi', 'as'] },
  { name: 'Assam', nameHi: 'असम', type: 'STATE', primaryLang: 'as', otherLangs: ['brx', 'bn', 'hi'] },
  { name: 'Bihar', nameHi: 'बिहार', type: 'STATE', primaryLang: 'hi', otherLangs: ['mai', 'ur'] },
  { name: 'Chhattisgarh', nameHi: 'छत्तीसगढ़', type: 'STATE', primaryLang: 'hi', otherLangs: ['en'] },
  { name: 'Goa', nameHi: 'गोवा', type: 'STATE', primaryLang: 'kok', otherLangs: ['mr', 'en'] },
  { name: 'Gujarat', nameHi: 'गुजरात', type: 'STATE', primaryLang: 'gu', otherLangs: ['hi', 'sd'] },
  { name: 'Haryana', nameHi: 'हरियाणा', type: 'STATE', primaryLang: 'hi', otherLangs: ['pa'] },
  { name: 'Himachal Pradesh', nameHi: 'हिमाचल प्रदेश', type: 'STATE', primaryLang: 'hi', otherLangs: ['doi'] },
  { name: 'Jharkhand', nameHi: 'झारखंड', type: 'STATE', primaryLang: 'hi', otherLangs: ['sat', 'mai'] },
  { name: 'Karnataka', nameHi: 'कर्नाटक', type: 'STATE', primaryLang: 'kn', otherLangs: ['kok', 'te'] },
  { name: 'Kerala', nameHi: 'केरल', type: 'STATE', primaryLang: 'ml', otherLangs: ['en'] },
  { name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश', type: 'STATE', primaryLang: 'hi', otherLangs: ['en'] },
  { name: 'Maharashtra', nameHi: 'महाराष्ट्र', type: 'STATE', primaryLang: 'mr', otherLangs: ['hi', 'kok'] },
  { name: 'Manipur', nameHi: 'मणिपुर', type: 'STATE', primaryLang: 'mni', otherLangs: ['en'] },
  { name: 'Meghalaya', nameHi: 'मेघालय', type: 'STATE', primaryLang: 'en', otherLangs: ['hi', 'as'] },
  { name: 'Mizoram', nameHi: 'मिज़ोरम', type: 'STATE', primaryLang: 'en', otherLangs: ['hi'] },
  { name: 'Nagaland', nameHi: 'नागालैंड', type: 'STATE', primaryLang: 'en', otherLangs: ['hi'] },
  { name: 'Odisha', nameHi: 'ओडिशा', type: 'STATE', primaryLang: 'or', otherLangs: ['sat', 'hi'] },
  { name: 'Punjab', nameHi: 'पंजाब', type: 'STATE', primaryLang: 'pa', otherLangs: ['hi'] },
  { name: 'Rajasthan', nameHi: 'राजस्थान', type: 'STATE', primaryLang: 'hi', otherLangs: ['sd'] },
  { name: 'Sikkim', nameHi: 'सिक्किम', type: 'STATE', primaryLang: 'ne', otherLangs: ['hi', 'en'] },
  { name: 'Tamil Nadu', nameHi: 'तमिलनाडु', type: 'STATE', primaryLang: 'ta', otherLangs: ['en'] },
  { name: 'Telangana', nameHi: 'तेलंगाना', type: 'STATE', primaryLang: 'te', otherLangs: ['ur', 'hi'] },
  { name: 'Tripura', nameHi: 'त्रिपुरा', type: 'STATE', primaryLang: 'bn', otherLangs: ['en'] },
  { name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश', type: 'STATE', primaryLang: 'hi', otherLangs: ['ur'] },
  { name: 'Uttarakhand', nameHi: 'उत्तराखंड', type: 'STATE', primaryLang: 'hi', otherLangs: ['sa'] },
  { name: 'West Bengal', nameHi: 'पश्चिम बंगाल', type: 'STATE', primaryLang: 'bn', otherLangs: ['ne', 'sat', 'hi'] },

  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', nameHi: 'अण्डमान और निकोबार द्वीपसमूह', type: 'UT', primaryLang: 'hi', otherLangs: ['bn', 'ta', 'te', 'en'] },
  { name: 'Chandigarh', nameHi: 'चंडीगढ़', type: 'UT', primaryLang: 'pa', otherLangs: ['hi', 'en'] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', nameHi: 'दादरा व नगर हवेली और दमन व दीव', type: 'UT', primaryLang: 'gu', otherLangs: ['mr', 'hi'] },
  { name: 'Delhi', nameHi: 'दिल्ली (राष्ट्रीय राजधानी क्षेत्र)', type: 'UT', primaryLang: 'hi', otherLangs: ['pa', 'ur', 'en'] },
  { name: 'Jammu and Kashmir', nameHi: 'जम्मू और कश्मीर', type: 'UT', primaryLang: 'ks', otherLangs: ['doi', 'ur', 'hi'] },
  { name: 'Ladakh', nameHi: 'लद्दाख', type: 'UT', primaryLang: 'hi', otherLangs: ['ur', 'en'] },
  { name: 'Lakshadweep', nameHi: 'लक्षद्वीप', type: 'UT', primaryLang: 'ml', otherLangs: ['en'] },
  { name: 'Puducherry', nameHi: 'पुदुच्चेरी', type: 'UT', primaryLang: 'ta', otherLangs: ['te', 'ml', 'en'] },
];

export function getLanguageOption(code: string): LanguageOption {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return found || SUPPORTED_LANGUAGES[0]; // fallback to Hindi
}

export function getLanguagesForStateOrUT(stateOrUTName: string): LanguageOption[] {
  const mapping = ALL_INDIAN_STATES_AND_UTS.find(
    (s) =>
      s.name.toLowerCase() === stateOrUTName.toLowerCase() ||
      s.nameHi.includes(stateOrUTName)
  );

  if (!mapping) {
    // Search within language statesAndUTs array
    return SUPPORTED_LANGUAGES.filter((l) =>
      l.statesAndUTs.some((st) => st.toLowerCase().includes(stateOrUTName.toLowerCase()))
    );
  }

  const allCodes = [mapping.primaryLang, ...(mapping.otherLangs || [])];
  return allCodes.map((c) => getLanguageOption(c));
}
