import { Scheme, SchemeCategory } from '../types';
import { LanguageCode } from './languages';

export interface LocalizedSchemeContent {
  name: string;
  tagline: string;
  description: string;
}

export interface LocalizedCardLabels {
  projectCostLimit: string;
  interestRate: string;
  tenure: string;
  moratorium: string;
  years: string;
  months: string;
  lakh: string;
  calculate: string;
  viewDetails: string;
  pa: string; // per annum
  version: string;
}

export interface LocalizedHomeFeatured {
  title: string;
  subtitle: string;
  viewAll: string;
}

// 1. SCHEME NAMES & DESCRIPTIONS ACROSS NATIVE LANGUAGES
const SCHEME_TRANSLATIONS: Record<string, Record<string, LocalizedSchemeContent>> = {
  MFS: {
    en: {
      name: 'Micro Finance Scheme (MFS)',
      tagline: 'Direct micro-credit up to ₹1.40 Lakhs for small village shops, rural crafts, and micro income activities',
      description: 'Provides direct financial assistance to Scheduled Caste entrepreneurs for setting up or expanding small income-generating micro-enterprises with minimal paperwork. Channelizing agencies charge 6.5% p.a. from beneficiaries.',
    },
    hi: {
      name: 'लघु वित्त योजना (MFS)',
      tagline: 'छोटी दुकानों, कारीगरी और आजीविका कार्यों के लिए ₹1.40 लाख तक का त्वरित सूक्ष्म ऋण',
      description: 'अनुसूचित जाति के उद्यमियों को छोटी आजीविका इकाइयों या दुकानों को शुरू करने अथवा विस्तार देने हेतु आसान शर्तों पर 6.5% वार्षिक ब्याज पर वित्तीय सहायता।',
    },
    bn: {
      name: 'লঘু অর্থায়ন প্রকল্প (MFS)',
      tagline: 'ছোট গ্রাম্য দোকান, গ্রামীণ কারুশিল্প ও ক্ষুদ্র আয়ের জন্য ₹১.৪০ লাখ পর্যন্ত সরাসরি ক্ষুদ্র ঋণ',
      description: 'তপশিলি জাতির উদ্যোক্তাদের জন্য স্বল্প নথিপত্রে ও মাত্র ৬.৫% বার্ষিক সুদে ছোট দোকান ও স্বনির্ভর আয়ের উদ্যোগ শুরু করতে সরাসরি আর্থিক সহায়তা প্রদান করে।',
    },
    mr: {
      name: 'सूक्ष्म वित्त योजना (MFS)',
      tagline: 'लहान दुकाने, ग्रामीण कारागीर व उपजीविकेसाठी ₹१.४० लाखांपर्यंत थेट सूक्ष्म कर्ज',
      description: 'अनुसूचित जातीतील नवउद्योजकांना अल्प कागदपत्रांसह व ६.५% वार्षिक सवलतीच्या व्याजदराने लहान व्यवसाय सुरू करण्यासाठी थेट कर्ज सहाय्य.',
    },
    te: {
      name: 'మైక్రో ఫైనాన్స్ పథకం (MFS)',
      tagline: 'చిన్న గ్రామీణ దుకాణాలు, చేతివృత్తులు మరియు జీవనోపాధి పనుల కోసం ₹1.40 లక్షల వరకు మైక్రో క్రెడిట్',
      description: 'షెడ్యూల్డ్ కులాల ఔత్సాహిక పారిశ్రామికవేత్తలకు అతి తక్కువ పత్రాలతో, వార్షిక 6.5% స్వల్ప వడ్డీ రేటుతో సూక్ష్మ వ్యాపారాల స్థాపనకు ప్రత్యక్ష ఆర్థిక సహాయం.',
    },
    ta: {
      name: 'குறு நிதித் திட்டம் (MFS)',
      tagline: 'கிராமப்புற சிறு கடைகள், கைவினைப் பொருட்கள் மற்றும் வாழ்வாதார பணிகளுக்கு ₹1.40 லட்சம் வரை நேரடி குறு நிதி',
      description: 'தாழ்த்தப்பட்ட சமூகத்தைச் சேர்ந்த தொழில்முனைவோர் சிறு தொழில்கள் தொடங்க ஆண்டுக்கு 6.5% சலுகை வட்டியில் வழங்கப்படும் நேரடிக் கடன் உதவி.',
    },
    gu: {
      name: 'માઈક્રો ફાઇનાન્સ યોજના (MFS)',
      tagline: 'નાની દુકાનો, ગ્રામીણ કારીગરો અને આજીવિકા માટે ₹1.40 લાખ સુધીનું માઇક્રો ધિરાણ',
      description: 'અનુસૂચિત જાતિના સાહસિકોને લઘુતમ દસ્તાવેજો સાથે વાર્ષિક 6.5% ના રાહત દરે નાના વ્યવસાયો શરૂ કરવા માટે સીધી નાણાકીય સહાય.',
    },
    kn: {
      name: 'ಮೈಕ್ರೋ ಫೈನಾನ್ಸ್ ಯೋಜನೆ (MFS)',
      tagline: 'ಸಣ್ಣ ಅಂಗಡಿಗಳು, ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿಗಳು ಮತ್ತು ಜೀವನೋಪಾಯಕ್ಕಾಗಿ ₹1.40 ಲಕ್ಷದವರೆಗೆ ಮೈಕ್ರೋ ಸಾಲ',
      description: 'ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ಉದ್ಯಮಿಗಳಿಗೆ ಕನಿಷ್ಠ ದಾಖಲಾತಿಯೊಂದಿಗೆ ವಾರ್ಷಿಕ 6.5% ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ಸಣ್ಣ ಆದಾಯ ತರುವ ಉದ್ಯಮಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ನೇರ ಸಾಲ ನೆರವು.',
    },
    ml: {
      name: 'മൈക്രോ ഫിനാൻസ് പദ്ധതി (MFS)',
      tagline: 'ചെറുകിട ഗ്രാമീണ കടകൾക്കും കരകൗശല തൊഴിലാളികൾക്കും ₹1.40 ലക്ഷം വരെയുള്ള ചെറുകിട വായ്പ',
      description: 'പട്ടികജാതി സംരംഭകർക്ക് കുറഞ്ഞ രേഖകളോടെ 6.5% വാർഷിക പലിശ നിരക്കിൽ ചെറുകിട ഉപജീവന യൂണിറ്റുകൾ ആരംഭിക്കുന്നതിനുള്ള സാമ്പത്തിക സഹായം.',
    },
    pa: {
      name: 'ਮਾਈਕ੍ਰੋ ਫਾਈਨਾਂਸ ਸਕੀਮ (MFS)',
      tagline: 'ਛੋਟੀਆਂ ਦੁਕਾਨਾਂ, ਪੇਂਡੂ ਦਸਤਕਾਰਾਂ ਅਤੇ ਰੋਜ਼ੀ-ਰੋਟੀ ਲਈ ₹1.40 ਲੱਖ ਤੱਕ ਸਿੱਧਾ ਮਾਈਕ੍ਰੋ ਕਰਜ਼ਾ',
      description: 'ਅਨੁਸੂਚਿਤ ਜਾਤੀਆਂ ਦੇ ਉੱਦਮੀਆਂ ਨੂੰ ਘੱਟੋ-ਘੱਟ ਕਾਗਜ਼ੀ ਕਾਰਵਾਈ ਅਤੇ 6.5% ਸਾਲਾਨਾ ਵਿਆਜ ਦਰ ਨਾਲ ਛੋਟੇ ਕਾਰੋਬਾਰ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਵਿੱਤੀ ਸਹਾਇਤਾ।',
    },
    or: {
      name: 'କ୍ଷୁଦ୍ର ଅର୍ଥନୈତିକ ଯୋଜନା (MFS)',
      tagline: 'ଛୋଟ ଗ୍ରାମୀଣ ଦୋକାନ, ହସ୍ତଶିଳ୍ପ ଓ ଜୀବିକା ପାଇଁ ₹୧.୪୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ସିଧାସଳଖ କ୍ଷୁଦ୍ର ଋଣ',
      description: 'ଅନୁସୂଚିତ ଜାତିର ଉଦ୍ୟୋଗୀମାନଙ୍କୁ ସର୍ବନିମ୍ନ କାଗଜପତ୍ର ସହିତ ବାର୍ଷିକ ୬.୫% ସୁଧ ହାରରେ ଛୋଟ ବ୍ୟବସାୟ ଆରମ୍ଭ କରିବା ପାଇଁ ସିଧାସଳଖ ଋଣ ସହାୟତା।',
    },
    as: {
      name: 'ক্ষুদ্ৰ বিত্তীয় আঁচনি (MFS)',
      tagline: 'সৰু গাঁৱলীয়া দোকান, গ্ৰাম্য হস্তশিল্প আৰু জীৱিকাৰ বাবে ₹১.৪০ লাখলৈকে প্ৰত্যক্ষ ক্ষুদ্ৰ ঋণ',
      description: 'অনুসূচিত জাতিৰ উদ্যমীসকলক সৰ্বনিম্ন নথিপত্ৰৰে বাৰ্ষিক ৬.৫% ৰেহাই সুতৰ হাৰত সৰু ব্যৱসায় আৰম্ভ কৰিবলৈ বিত্তীয় সাহায্য।',
    },
    ur: {
      name: 'مائیکرو فنانس اسکیم (MFS)',
      tagline: 'چھوٹی دکانوں، دیہی دستکاروں اور روزی روٹی کے لیے ₹1.40 لاکھ تک براہ راست مائیکرو فنانس',
      description: 'شیڈولڈ کاسٹ تاجروں کو معمولی کاغذی کارروائی اور سالانہ 6.5 فیصد رعایتی شرح سود پر چھوٹے کاروبار کے قیام کے لیے براہ راست قرض۔',
    },
  },

  AMY: {
    en: {
      name: 'Aajeevika Micro-Finance Yojana (AMY)',
      tagline: 'Prompt micro-finance delivered through accredited NBFC-MFIs for small business pursuits',
      description: 'Targets women beneficiaries and small entrepreneurs through accredited Microfinance Institutions and NBFCs for quick turnaround credit delivery.',
    },
    hi: {
      name: 'आजीविका माइक्रो-फाइनेंस योजना (AMY)',
      tagline: 'मान्यता प्राप्त NBFC-MFI के माध्यम से महिला उद्यमियों व लघु व्यवसाय हेतु त्वरित सूक्ष्म ऋण',
      description: 'मान्यता प्राप्त सूक्ष्म वित्त संस्थानों (NBFC-MFI) के सहयोग से अनुसूचित जाति की महिला उद्यमियों को आजीविका हेतु त्वरित ऋण उपलब्ध कराना।',
    },
    bn: {
      name: 'জীবিকা ক্ষুদ্র অর্থায়ন যোজনা (AMY)',
      tagline: 'স্বীকৃত আর্থিক প্রতিষ্ঠানের মাধ্যমে মহিলা উদ্যোক্তা ও ক্ষুদ্র ব্যবসার জন্য দ্রুত ক্ষুদ্র ঋণ',
      description: 'স্বীকৃত মাইক্রোফাইন্যান্স প্রতিষ্ঠান (NBFC-MFI)-এর মাধ্যমে তপশিলি জাতির নারী উদ্যোক্তা ও ক্ষুদ্র ব্যবসায়ীদের দ্রুত ঋণ প্রদান করা হয়।',
    },
    mr: {
      name: 'उपजीविका सूक्ष्म-वित्त योजना (AMY)',
      tagline: 'मान्यताप्राप्त वित्तीय संस्थांमार्फत महिला उद्योजक व लहान व्यवसायांसाठी त्वरित सूक्ष्म कर्ज',
      description: 'मान्यताप्राप्त मायक्रोफायनान्स संस्थांच्या माध्यमातून अनुसूचित जातीतील महिला उद्योजकांना त्वरित कर्ज उपलब्ध करून देणे.',
    },
    te: {
      name: 'జీవనోపాధి మైక్రో-ఫైనాన్స్ యోజన (AMY)',
      tagline: 'చిన్న వ్యాపారాల కోసం గుర్తింపు పొందిన ఆర్థిక సంస్థల ద్వారా త్వరిత మైక్రో ఫైనాన్స్',
      description: 'గుర్తింపు పొందిన ఎన్‌బిఎఫ్‌సి-ఎంఎఫ్‌ఐల ద్వారా షెడ్యూల్డ్ కులాల మహిళా పారిశ్రామికవేత్తలకు శీఘ్ర రుణ సదుపాయం.',
    },
    ta: {
      name: 'வாழ்வாதார குறு நிதித் திட்டம் (AMY)',
      tagline: 'சிறு வணிகங்களுக்காக அங்கீகரிக்கப்பட்ட நிதி நிறுவனங்கள் மூலம் விரைவான குறு நிதி',
      description: 'அங்கீகரிக்கப்பட்ட நுண்நிதி நிறுவனங்கள் (NBFC-MFI) மூலம் தாழ்த்தப்பட்ட பெண்களுக்கும் சிறு வணிகர்களுக்கும் துரித கடன் உதவி.',
    },
    gu: {
      name: 'આજીવિકા માઇક્રો-ફાઇનાન્સ યોજના (AMY)',
      tagline: 'મહિલા ઉદ્યોગસાહસિકો અને નાના વ્યવસાયો માટે ઝડપી માઇક્રો ધિરાણ',
      description: 'માન્ય માઇક્રોફાઇનાન્સ સંસ્થાઓ (NBFC-MFI) દ્વારા અનુસૂચિત જાતિની મહિલાઓ અને સાહસિકોને ઝડપી ધિરાણ.',
    },
    kn: {
      name: 'ಆಜೀವಿಕಾ ಮೈಕ್ರೋ-ಫೈನಾನ್ಸ್ ಯೋಜನೆ (AMY)',
      tagline: 'ಮಹಿಳಾ ಉದ್ಯಮಿಗಳು ಮತ್ತು ಸಣ್ಣ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ತ್ವರಿತ ಮೈಕ್ರೋ ಸಾಲ',
      description: 'ಮಾನ್ಯತೆ ಪಡೆದ ಮೈಕ್ರೋಫೈನಾನ್ಸ್ ಸಂಸ್ಥೆಗಳ (NBFC-MFI) ಮೂಲಕ ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ಮಹಿಳಾ ಉದ್ಯಮಿಗಳಿಗೆ ತ್ವರಿತ ಸಾಲ ಸೌಲಭ್ಯ.',
    },
    ml: {
      name: 'ആജീവിക മൈക്രോ-ഫിനാൻസ് യോജന (AMY)',
      tagline: 'ചെറുകിട ബിസിനസുകൾക്കായി അംഗീകൃത ധനകാര്യ സ്ഥാപനങ്ങൾ വഴി വേഗത്തിലുള്ള വായ്പ',
      description: 'അംഗീകൃത സൂക്ഷ്മ ധനകാര്യ സ്ഥാപനങ്ങൾ വഴി വനിതാ സംരംഭകർക്ക് ലഭ്യമാക്കുന്ന ത്വരിത വായ്പാ പദ്ധതി.',
    },
    pa: {
      name: 'ਆਜੀਵਿਕਾ ਮਾਈਕ੍ਰੋ-ਫਾਈਨਾਂਸ ਯੋਜਨਾ (AMY)',
      tagline: 'ਛੋਟੇ ਕਾਰੋਬਾਰਾਂ ਅਤੇ ਮਹਿਲਾ ਉੱਦਮੀਆਂ ਲਈ ਤੇਜ਼ ਮਾਈਕ੍ਰੋ-ਫਾਈਨਾਂਸ ਸਹਾਇਤਾ',
      description: 'ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਵਿੱਤੀ ਅਦਾਰਿਆਂ (NBFC-MFI) ਰਾਹੀਂ ਮਹਿਲਾ ਉੱਦਮੀਆਂ ਨੂੰ ਆਸਾਨ ਅਤੇ ਤੇਜ਼ ਕਰਜ਼ਾ ਸੁਵਿਧਾ।',
    },
    or: {
      name: 'ଆଜୀବିକା କ୍ଷୁଦ୍ର ଅର୍ଥ ଯୋଜନା (AMY)',
      tagline: 'ମହିଳା ଉଦ୍ୟୋଗୀ ଓ କ୍ଷୁଦ୍ର ବ୍ୟବସାୟ ପାଇଁ ତ୍ୱରିତ କ୍ଷୁଦ୍ର ଋଣ ସହାୟତା',
      description: 'ସ୍ୱୀକୃତିପ୍ରାପ୍ତ ଅଣ-ବ୍ୟାଙ୍କିଙ୍ଗ ବିତ୍ତୀୟ ସଂସ୍ଥା (NBFC-MFI) ମାଧ୍ୟମରେ ମହିଳାମାନଙ୍କୁ ଶୀଘ୍ର ଋଣ ଯୋଗାଣ।',
    },
    as: {
      name: 'আজীৱিকা ক্ষুদ্ৰ বিত্ত যোজনা (AMY)',
      tagline: 'ক্ষুদ্ৰ ব্যৱসায় আৰু মহিলা উদ্যমীসকলৰ বাবে দ্ৰুত ক্ষুদ্ৰ ঋণ সাহায্য',
      description: 'স্বীকৃত ক্ষুদ্ৰ বিত্ত প্ৰতিষ্ঠানসমূহৰ জৰিয়তে অনুসূচিত জাতিৰ মহিলাসকললৈ তৎকালীন ঋণ সাহায্য।',
    },
    ur: {
      name: 'آجیویکا مائیکرو فنانس یوجنا (AMY)',
      tagline: 'چھوٹے کاروباروں اور خواتین تاجروں کے لیے فوری مائیکرو فنانس معاونت',
      description: 'تسلیم شدہ مالیاتی اداروں کے اشتراک سے درج فہرست ذات کی خواتین کو کاروبار کے لیے فوری قرض کی فراہمی۔',
    },
  },

  TERM_LOAN: {
    en: {
      name: 'Term Loan Scheme (TLS)',
      tagline: 'Substantial capital assistance up to ₹50 Lakhs for viable commercial, service, agriculture, and transport projects',
      description: 'Provides long-term concessional financing to Scheduled Caste individuals and groups for income-generating units in Agriculture, Manufacturing, Service, and Transport sectors.',
    },
    hi: {
      name: 'मियादी ऋण योजना (TLS)',
      tagline: 'व्यावसायिक, सेवा, कृषि एवं परिवहन इकाइयों की स्थापना हेतु ₹50 लाख तक का पूंजीगत मियादी ऋण',
      description: 'अनुसूचित जाति के पात्र लाभार्थियों को कृषि, उद्योग, व्यापार व परिवहन में व्यावहारिक व लाभकारी परियोजनाओं के लिए ₹50 लाख तक दीर्घकालिक रियायती ऋण।',
    },
    bn: {
      name: 'মেয়াদী ঋণ প্রকল্প (TLS)',
      tagline: 'বাণিজ্যিক, সেবা, কৃষি ও পরিবহন প্রকল্পের জন্য ₹৫০ লাখ পর্যন্ত বৃহৎ মূলধনী মেয়াদী ঋণ',
      description: 'তপশিলি জাতির যোগ্য ব্যক্তিদের কৃষি, উৎপাদন, পরিবহন এবং সেবা ক্ষেত্রে বৃহৎ স্বনির্ভর প্রকল্প স্থাপনের জন্য ₹৫০ লাখ পর্যন্ত স্বল্প সুদে দীর্ঘমেয়াদী ঋণ।',
    },
    mr: {
      name: 'मुदत कर्ज योजना (TLS)',
      tagline: 'व्यावसायिक, कृषी, सेवा आणि वाहतूक प्रकल्पांसाठी ₹५० लाखांपर्यंतचे मुदत कर्ज',
      description: 'अनुसूचित जातीतील लाभार्थ्यांना शेती, उद्योग, सेवा व वाहतूक क्षेत्रातील फायदेशीर प्रकल्पांसाठी दीर्घकालीन सवलतीचे भांडवली कर्ज.',
    },
    te: {
      name: 'టర్మ్ లోన్ పథకం (TLS)',
      tagline: 'వాణిజ్య, సేవా, వ్యవసాయ మరియు రవాణా ప్రాజెక్టుల కోసం ₹50 లక్షల వరకు మూలధన టర్మ్ లోన్',
      description: 'షెడ్యూల్డ్ కులాల వ్యక్తులకు వ్యవసాయం, తయారీ, సేవలు మరియు రవాణా రంగాలలో లాభదాయక ప్రాజెక్టుల కోసం దీర్ఘకాలిక రాయితీ రుణాలు.',
    },
    ta: {
      name: 'காலக் கடன் திட்டம் (TLS)',
      tagline: 'வணிக, சேவை, விவசாயம் மற்றும் போக்குவரத்து திட்டங்களுக்கு ₹50 லட்சம் வரை காலக் கடன்',
      description: 'விவசாயம், தொழில், சேவை மற்றும் போக்குவரத்து துறைகளில் வருமானம் ஈட்டும் புதிய அலகுகளை நிறுவ தாழ்த்தப்பட்டோருக்கு வழங்கப்படும் நீண்ட கால சலுகைக் கடன்.',
    },
    gu: {
      name: 'મુદતી લોન યોજના (TLS)',
      tagline: 'વાણિજ્યિક, કૃષિ, સેવા અને પરિવહન પ્રોજેક્ટ માટે ₹50 લાખ સુધીની મુદતી લોન',
      description: 'અનુસૂચિત જાતિના લાભાર્થીઓને કૃષિ, ઉત્પાદન અને સેવા ક્ષેત્રે મોટા સાહસો સ્થાપવા માટે ₹50 લાખ સુધીનું લાંબા ગાળાનું ધિરાણ.',
    },
    kn: {
      name: 'ಅವಧಿ ಸಾಲ ಯೋಜನೆ (TLS)',
      tagline: 'ವಾಣಿಜ್ಯ, ಸೇವೆ, ಕೃಷಿ ಮತ್ತು ಸಾರಿಗೆ ಯೋಜನೆಗಳಿಗಾಗಿ ₹50 ಲಕ್ಷದವರೆಗೆ ಅವಧಿ ಸಾಲ',
      description: 'ಕೃಷಿ, ಕೈಗಾರಿಕೆ, ಸೇವೆ ಮತ್ತು ಸಾರಿಗೆ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಆದಾಯ ತರುವ ಯೋಜನೆಗಳಿಗೆ ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ಫಲಾನುಭವಿಗಳಿಗೆ ದೀರ್ಘಾವಧಿಯ ರಿಯಾಯಿತಿ ಸಾಲ.',
    },
    ml: {
      name: 'ടേം ലോൺ പദ്ധതി (TLS)',
      tagline: 'വാണിജ്യ, കാർഷിക, ഗതാഗത സംരംഭങ്ങൾക്കായി ₹50 ലക്ഷം വരെയുള്ള ടേം ലോൺ സഹായം',
      description: 'കൃഷി, വ്യവസായം, ഗതാഗതം എന്നീ മേഖലകളിൽ പുതിയ സംരംഭങ്ങൾ ആരംഭിക്കുന്നതിന് പട്ടികജാതി ഗുണഭോക്താക്കൾക്കുള്ള ദീർഘകാല വായ്പ.',
    },
    pa: {
      name: 'ਮਿਆਦੀ ਕਰਜ਼ਾ ਸਕੀਮ (TLS)',
      tagline: 'ਵਪਾਰਕ, ਸੇਵਾ, ਖੇਤੀਬਾੜੀ ਅਤੇ ਆਵਾਜਾਈ ਪ੍ਰੋਜੈਕਟਾਂ ਲਈ ₹50 ਲੱਖ ਤੱਕ ਦਾ ਮਿਆਦੀ ਕਰਜ਼ਾ',
      description: 'ਅਨੁਸੂਚਿਤ ਜਾਤੀਆਂ ਦੇ ਲਾਭਪਾਤਰੀਆਂ ਨੂੰ ਖੇਤੀਬਾੜੀ, ਸੇਵਾ ਅਤੇ ਆਵਾਜਾਈ ਖੇਤਰਾਂ ਵਿੱਚ ਵੱਡੇ ਪ੍ਰੋਜੈਕਟ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਲੰਬੇ ਸਮੇਂ ਦਾ ਰਿਆਇਤੀ ਕਰਜ਼ਾ।',
    },
    or: {
      name: 'ମିଆଦି ଋଣ ଯୋଜନା (TLS)',
      tagline: 'ବାଣିଜ୍ୟିକ, ସେବା, କୃଷି ଓ ପରିବହନ ପ୍ରକଳ୍ପ ପାଇଁ ₹୫୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ମିଆଦି ଋଣ',
      description: 'କୃଷି, ଶିଳ୍ପ, ବାଣିଜ୍ୟ ଓ ପରିବହନ କ୍ଷେତ୍ରରେ ଲାଭଦାୟକ ପ୍ରକଳ୍ପ ପ୍ରତିଷ୍ଠା ପାଇଁ ଅନୁସୂଚିତ ଜାତିର ଲୋକଙ୍କୁ ଦୀର୍ଘକାଳୀନ ରିହାତି ଋଣ।',
    },
    as: {
      name: 'ম্যাদী ঋণ আঁচনি (TLS)',
      tagline: 'বাণিজ্যিক, সেৱা, কৃষি আৰু পৰিবহণ প্ৰকল্পৰ বাবে ₹৫০ লাখলৈকে মূলধনী ঋণ',
      description: 'কৃষি, উৎপাদন, সেৱা আৰু পৰিবহণ ক্ষেত্ৰত লাভজনক ব্যৱসায় প্ৰতিষ্ঠাৰ বাবে অনুসূচিত জাতিৰ লোকসকললৈ দীৰ্ঘম্যাদী ৰেহাই ঋণ।',
    },
    ur: {
      name: 'میعادی قرض اسکیم (TLS)',
      tagline: 'تجارتی، خدمات، زراعت اور ٹرانسپورٹ کے لیے ₹50 لاکھ تک کا میعادی قرض',
      description: 'زراعت، مینوفیکچرنگ اور خدمات کے شعبوں میں نفع بخش یونٹوں کے قیام کے لیے درج فہرست ذات کے افراد کو طویل مدتی رعایتی قرض۔',
    },
  },

  UNY: {
    en: {
      name: 'Udyam Nidhi Yojana (UNY)',
      tagline: 'Term financing up to ₹5 Lakhs for micro-enterprises and scalable self-employment ventures',
      description: 'Designed to bridge the gap between micro-finance and major term loans, supporting first-generation Scheduled Caste entrepreneurs with seed capital.',
    },
    hi: {
      name: 'उद्यम निधि योजना (UNY)',
      tagline: 'लघु उद्यमों एवं तकनीकी स्वरोजगार इकाइयों के विस्तार हेतु ₹5 लाख तक का वित्तीय सहयोग',
      description: 'प्रथम पीढ़ी के अनुसूचित जाति उद्यमियों को सूक्ष्म ऋण और बड़े मियादी ऋण के बीच की पूंजी आवश्यकता पूर्ति हेतु ₹5 लाख तक का रियायती ऋण।',
    },
    bn: {
      name: 'উদ্যম নিধি যোজনা (UNY)',
      tagline: 'ক্ষুদ্র শিল্প ও স্বনির্ভর উদ্যোগের জন্য ₹৫ লাখ পর্যন্ত বিশেষ আর্থিক সহায়তা',
      description: 'তপশিলি জাতির প্রথম প্রজন্মের নবীন উদ্যোক্তাদের স্বনির্ভর ব্যবসা ও ছোট কারখানা সম্প্রসারণের জন্য ₹৫ লাখ পর্যন্ত সহজ শর্তে মেয়াদী ঋণ।',
    },
    mr: {
      name: 'उद्यम निधी योजना (UNY)',
      tagline: 'सूक्ष्म उद्योग व स्वयंरोजगार उपक्रमांसाठी ₹५ लाखांपर्यंतचे मुदत कर्ज',
      description: 'पहिल्या पिढीतील अनुसूचित जातीतील उद्योजकांना सूक्ष्म व्यवसाय सुरू करण्यासाठी ₹५ लाखांपर्यंतचे सवलतीचे कर्ज सहाय्य.',
    },
    te: {
      name: 'ఉద్యమ్ నిధి యోజన (UNY)',
      tagline: 'చిన్న పరిశ్రమలు మరియు స్వయం ఉపాధి కోసం ₹5 లక్షల వరకు ఆర్థిక సహాయం',
      description: 'మొదటి తరం షెడ్యూల్డ్ కులాల పారిశ్రామికవేత్తల కోసం ₹5 లక్షల వరకు మూలధన సాయం అందించే ప్రత్యేక రుణం.',
    },
    ta: {
      name: 'உத்யம் நிதி யோஜனா (UNY)',
      tagline: 'சிறு தொழில்கள் மற்றும் சுயதொழில் முயற்சிகளுக்கு ₹5 லட்சம் வரை நிதியுதவி',
      description: 'முதல் தலைமுறை தாழ்த்தப்பட்ட தொழில்முனைவோருக்கு சிறு தொழில்கள் மற்றும் சுயதொழில்களை விரிவுபடுத்த ₹5 லட்சம் வரை கடன்.',
    },
    gu: {
      name: 'ઉદ્યમ નિધિ યોજના (UNY)',
      tagline: 'લઘુ ઉદ્યોગો અને સ્વરોજગાર માટે ₹5 લાખ સુધીની નાણાકીય સહાય',
      description: 'પ્રથમ પેઢીના અનુસૂચિત જાતિના ઉદ્યોગસાહસિકોને વ્યવસાય શરૂ કરવા માટે ₹5 લાખ સુધીની મુદતી લોન.',
    },
    kn: {
      name: 'ಉದ್ಯಮ್ ನಿಧಿ ಯೋಜನೆ (UNY)',
      tagline: 'ಸಣ್ಣ ಉದ್ಯಮಗಳು ಮತ್ತು ಸ್ವಯಂ ಉದ್ಯೋಗಕ್ಕಾಗಿ ₹5 ಲಕ್ಷದವರೆಗೆ ಹಣಕಾಸು ನೆರವು',
      description: 'ಮೊದಲ ಪೀಳಿಗೆಯ ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ಉದ್ಯಮಿಗಳಿಗೆ ಸ್ವಯಂ ಉದ್ಯೋಗ ಘಟಕಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ₹5 ಲಕ್ಷದವರೆಗೆ ರಿಯಾಯಿತಿ ಸಾಲ.',
    },
    ml: {
      name: 'ഉദ്യം നിധി യോജന (UNY)',
      tagline: 'ചെറുകിട സംരംഭങ്ങൾക്കും സ്വയം തൊഴിലിനുമായി ₹5 ലക്ഷം വരെയുള്ള വായ്പ',
      description: 'ആദ്യ തലമുറ പട്ടികജാതി സംരംഭകർക്ക് സ്വയംതൊഴിൽ യൂണിറ്റുകൾ ആരംഭിക്കുന്നതിനായി ₹5 ലക്ഷം വരെയുള്ള ധനസഹായം.',
    },
    pa: {
      name: 'ਉਦਯਮ ਨਿਧੀ ਯੋਜਨਾ (UNY)',
      tagline: 'ਛੋਟੇ ਉਦਯੋਗਾਂ ਅਤੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਲਈ ₹5 ਲੱਖ ਤੱਕ ਦੀ ਵਿੱਤੀ ਸਹਾਇਤਾ',
      description: 'ਪਹਿਲੀ ਪੀੜ੍ਹੀ ਦੇ ਅਨੁਸੂਚਿਤ ਜਾਤੀ ਉੱਦਮੀਆਂ ਲਈ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਕਾਰੋਬਾਰ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ₹5 ਲੱਖ ਤੱਕ ਦਾ ਕਰਜ਼ਾ।',
    },
    or: {
      name: 'ଉଦ୍ୟମ ନିଧି ଯୋଜନା (UNY)',
      tagline: 'କ୍ଷୁଦ୍ର ଉଦ୍ୟୋଗ ଓ ସ୍ୱରୋଜଗାର ପାଇଁ ₹୫ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଆର୍ଥିକ ସହାୟତା',
      description: 'ଅନୁସୂଚିତ ଜାତିର ପ୍ରଥମ ପିଢ଼ିର ଯୁବ ଉଦ୍ୟୋଗୀମାନଙ୍କୁ ସ୍ୱରୋଜଗାର ଆରମ୍ଭ କରିବା ପାଇଁ ₹୫ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଋଣ।',
    },
    as: {
      name: 'উদ্যম নিধি যোজনা (UNY)',
      tagline: 'ক্ষুদ্ৰ উদ্যোগ আৰু আত্মনিয়োগৰ বাবে ₹৫ লাখলৈকে বিত্তীয় সাহায্য',
      description: 'প্ৰথম প্ৰজন্মৰ অনুসূচিত জাতিৰ উদ্যমীসকলক নিজা ব্যৱসায় গঢ়িবলৈ ₹৫ লাখ পৰ্যন্ত বিশেষ ঋণ সাহায্য।',
    },
    ur: {
      name: 'ادیم ندھی یوجنا (UNY)',
      tagline: 'چھوٹے کاروباروں اور خود روزگاری کے لیے ₹5 لاکھ تک کی مالی معاونت',
      description: 'پہلی نسل کے شیڈولڈ کاسٹ تاجروں کو خود روزگار اور چھوٹے کاروبار کے لیے ₹5 لاکھ تک کا آسان قرض۔',
    },
  },

  ELS: {
    en: {
      name: 'Education Loan Scheme (ELS)',
      tagline: 'Higher education loans up to ₹40 Lakhs (abroad) and ₹20 Lakhs (India) at concessional 6.5% interest',
      description: 'Supports Scheduled Caste students pursuing recognized full-time professional and technical courses in India or abroad. Female students receive an additional 0.5% interest rate rebate.',
    },
    hi: {
      name: 'शिक्षा ऋण योजना (ELS)',
      tagline: 'भारत (₹20 लाख) व विदेश (₹40 लाख) में उच्च तकनीकी शिक्षा हेतु 6.5% रियायती ब्याज दर पर शिक्षा ऋण',
      description: 'अनुसूचित जाति के विद्यार्थियों को भारत एवं विदेशों में उच्च व्यावसायिक व तकनीकी शिक्षा (इंजीनियरिंग, मेडिकल, एमबीए आदि) हेतु रियायती ऋण। छात्राओं को 0.5% अतिरिक्त ब्याज छूट।',
    },
    bn: {
      name: 'শিক্ষা ঋণ প্রকল্প (ELS)',
      tagline: 'ভারতে (₹২০ লাখ) ও বিদেশে (₹৪০ লাখ) উচ্চশিক্ষার জন্য মাত্র ৬.৫% স্বল্প সুদে শিক্ষা ঋণ',
      description: 'তপশিলি জাতির শিক্ষার্থীদের ভারত ও বিদেশে স্বীকৃত পেশাদার ও কারিগরি কোর্সের (ইঞ্জিনিয়ারিং, মেডিকেল, ম্যানেজমেন্ট) জন্য স্বল্প সুদের শিক্ষা ঋণ। ছাত্রীদের জন্য অতিরিক্ত ০.৫% সুদের ছাড় রয়েছে।',
    },
    mr: {
      name: 'शैक्षणिक कर्ज योजना (ELS)',
      tagline: 'भारतात (₹२० लाख) व परदेशात (₹४० लाख) उच्च शिक्षणासाठी ६.५% सवलतीच्या दरात शैक्षणिक कर्ज',
      description: 'अनुसूचित जातीतील विद्यार्थ्यांना भारत व परदेशात व्यावसायिक व तांत्रिक अभ्यासक्रमांसाठी ६.५% व्याजदराने कर्ज. विद्यार्थिनींसाठी ०.५% अतिरिक्त सवलत.',
    },
    te: {
      name: 'విద్యా రుణ పథకం (ELS)',
      tagline: 'భారత్ (₹20 లక్షలు), విదేశాలలో (₹40 లక్షలు) ఉన్నత విద్య కోసం 6.5% రాయితీ వడ్డీతో విద్యా రుణం',
      description: 'షెడ్యూల్డ్ కులాల విద్యార్థులు భారత్ మరియు విదేశాలలో ఉన్నత వృత్తి విద్యా కోర్సులు అభ్యసించడానికి 6.5% వడ్డీతో రుణాలు. విద్యార్థినులకు 0.5% అదనపు రాయితీ.',
    },
    ta: {
      name: 'கல்விக் கடன் திட்டம் (ELS)',
      tagline: 'இந்தியா (₹20 லட்சம்) மற்றும் வெளிநாட்டில் (₹40 லட்சம்) உயர்கல்விக்கு 6.5% சலுகை வட்டியில் கடன்',
      description: 'தாழ்த்தப்பட்ட மாணவ-மாணவிகள் இந்தியாவில் அல்லது வெளிநாட்டில் தொழில்முறை மற்றும் தொழில்நுட்ப உயர்கல்வி பயில 6.5% வட்டியில் கடன். மாணவிகளுக்கு 0.5% கூடுதல் வட்டிச் சலுகை.',
    },
    gu: {
      name: 'શિક્ષણ લોન યોજના (ELS)',
      tagline: 'ભારતમાં (₹20 લાખ) અને વિદેશમાં (₹40 લાખ) ઉચ્ચ શિક્ષણ માટે 6.5% સબસિડીવાળી લોન',
      description: 'અનુસૂચિત જાતિના વિદ્યાર્થીઓને દેશ અને વિદેશમાં ઉચ્ચ તકનીકી શિક્ષણ માટે 6.5% વ્યાજે લોન. વિદ્યાર્થિનીઓને 0.5% વધારાની છૂટ.',
    },
    kn: {
      name: 'ಶಿಕ್ಷಣ ಸಾಲ ಯೋಜನೆ (ELS)',
      tagline: 'ಭಾರತ (₹20 ಲಕ್ಷ) ಮತ್ತು ವಿದೇಶದಲ್ಲಿ (₹40 ಲಕ್ಷ) ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕಾಗಿ 6.5% ರಿಯಾಯಿತಿ ಸಾಲ',
      description: 'ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಭಾರತ ಮತ್ತು ವಿದೇಶಗಳಲ್ಲಿ ವೃತ್ತಿಪರ ಹಾಗೂ ತಾಂತ್ರಿಕ ಶಿಕ್ಷಣಕ್ಕಾಗಿ 6.5% ಬಡ್ಡಿದರದಲ್ಲಿ ಸಾಲ. ವಿದ್ಯಾರ್ಥಿನಿಯರಿಗೆ 0.5% ಹೆಚ್ಚುವರಿ ರಿಯಾಯಿತಿ.',
    },
    ml: {
      name: 'വിദ്യാഭ്യാസ വായ്പാ പദ്ധതി (ELS)',
      tagline: 'ഇന്ത്യയിലും (₹20 ലക്ഷം) വിദേശത്തും (₹40 ലക്ഷം) ഉന്നതപഠനത്തിനായി 6.5% പലിശ നിരക്കിൽ വായ്പ',
      description: 'പട്ടികജാതി വിദ്യാർത്ഥികൾക്ക് ഇന്ത്യയിലോ വിദേശത്തോ പ്രൊഫഷണൽ, സാങ്കേതിക കോഴ്സുകൾ പഠിക്കുന്നതിനായി 6.5% പലിശ നിരക്കിൽ വിദ്യാഭ്യാസ വായ്പ. പെൺകുട്ടികൾക്ക് 0.5% ഇളവ്.',
    },
    pa: {
      name: 'ਸਿੱਖਿਆ ਕਰਜ਼ਾ ਸਕੀਮ (ELS)',
      tagline: 'ਭਾਰਤ (₹20 ਲੱਖ) ਅਤੇ ਵਿਦੇਸ਼ (₹40 ਲੱਖ) ਵਿੱਚ ਉੱਚ ਸਿੱਖਿਆ ਲਈ 6.5% ਰਿਆਇਤੀ ਕਰਜ਼ਾ',
      description: 'ਅਨੁਸੂਚਿਤ ਜਾਤੀ ਦੇ ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਦੇਸ਼-ਵਿਦੇਸ਼ ਵਿੱਚ ਪੇਸ਼ੇਵਰ ਅਤੇ ਤਕਨੀਕੀ ਕੋਰਸਾਂ ਲਈ 6.5% ਵਿਆਜ ਦਰ \'ਤੇ ਕਰਜ਼ਾ। ਵਿਦਿਆਰਥਣਾਂ ਨੂੰ 0.5% ਵਾਧੂ ਛੋਟ।',
    },
    or: {
      name: 'ଶିକ୍ଷା ଋଣ ଯୋଜନା (ELS)',
      tagline: 'ଭାରତ (₹୨୦ ଲକ୍ଷ) ଓ ବିଦେଶରେ (₹୪୦ ଲକ୍ଷ) ଉଚ୍ଚଶିକ୍ଷା ପାଇଁ ୬.୫% ସୁଧରେ ଶିକ୍ଷା ଋଣ',
      description: 'ଅନୁସୂଚିତ ଜାତିର ଛାତ୍ରଛାତ୍ରୀମାନଙ୍କୁ ଭାରତ ଏବଂ ବିଦେଶରେ ବୈଷୟିକ ଓ ବୃତ୍ତିଗତ ଉଚ୍ଚଶିକ୍ଷା ପାଇଁ ୬.୫% ସୁଧରେ ଋଣ। ଛାତ୍ରୀମାନଙ୍କ ପାଇଁ ୦.୫% ଅତିରିକ୍ତ ଛାଡ଼।',
    },
    as: {
      name: 'শিক্ষা ঋণ আঁচনি (ELS)',
      tagline: 'ভাৰতত (₹২০ লাখ) আৰু বিদেশত (₹৪০ লাখ) উচ্চ শিক্ষাৰ বাবে ৬.৫% ৰেহাই সুতত ঋণ',
      description: 'অনুসূচিত জাতিৰ শিক্ষাৰ্থীসকলক কাৰিকৰী আৰু পেছাদাৰী উচ্চ শিক্ষাৰ বাবে ৬.৫% ৰেহাই সুতত ঋণ। ছাত্ৰীসকলৰ বাবে অতিৰিক্ত ০.৫% সুতৰ ৰেহাই।',
    },
    ur: {
      name: 'تعلیمی قرض اسکیم (ELS)',
      tagline: 'ہندوستان (₹20 لاکھ) اور بیرون ملک (₹40 لاکھ) میں اعلیٰ تعلیم کے لیے 6.5% رعایتی قرض',
      description: 'شیڈولڈ کاسٹ طلباء کو تکنیکی و پیشہ ورانہ اعلیٰ تعلیم کے لیے 6.5 فیصد رعایتی شرح سود پر تعلیمی قرض۔ طالبات کے لیے 0.5 فیصد اضافی چھوٹ۔',
    },
  },

  GBS: {
    en: {
      name: 'Green Business Scheme (GBS)',
      tagline: 'Concessional loans up to ₹30 Lakhs for solar power, battery e-rickshaws, and eco-friendly ventures',
      description: 'Finances climate-friendly, sustainable business models including rooftop solar, electric commercial mobility, polyhouses, and waste recycling units.',
    },
    hi: {
      name: 'ग्रीन बिजनेस योजना (GBS)',
      tagline: 'सौर ऊर्जा, बैटरी ई-रिक्शा, अपशिष्ट प्रबंधन एवं पर्यावरण अनुकूल हरित व्यवसायों हेतु ₹30 लाख तक का ऋण',
      description: 'जलवायु-अनुकूल और पर्यावरण-हितैषी परियोजनाओं जैसे सौर संयंत्र, इलेक्ट्रिक वाहन, कंपोस्टिंग और रिसाइक्लिंग इकाइयों के लिए ₹30 लाख तक वित्तीय सहायता।',
    },
    bn: {
      name: 'সবুজ ব্যবসা প্রকল্প (GBS)',
      tagline: 'সৌরশক্তি, ব্যাটারি চালিত ই-রিকশা এবং পরিবেশবান্ধব সবুজ ব্যবসার জন্য ₹৩০ লাখ পর্যন্ত ঋণ',
      description: 'সৌর বিদ্যুৎ প্ল্যান্ট, বৈদ্যুতিক ই-রিকশা, বর্জ্য পুনর্ব্যবহার এবং পরিবেশবান্ধব আধুনিক উদ্যোগের জন্য ₹৩০ লাখ পর্যন্ত স্বল্প সুদের ঋণ।',
    },
    mr: {
      name: 'हरित व्यवसाय योजना (GBS)',
      tagline: 'सौर ऊर्जा, ई-रिक्षा आणि पर्यावरणपूरक हरित व्यवसायांसाठी ₹३० लाखांपर्यंतचे कर्ज',
      description: 'सौरऊर्जा प्रकल्प, ई-रिक्षा, कचरा व्यवस्थापन आणि पर्यावरणस्नेही व्यवसायांसाठी ₹३० लाखांपर्यंतचे सवलतीचे कर्ज सहाय्य.',
    },
    te: {
      name: 'గ్రీన్ బిజినెస్ పథకం (GBS)',
      tagline: 'సౌర విద్యుత్, ఇ-రిక్షాలు మరియు పర్యావరణ అనుకూల వ్యాపారాల కోసం ₹30 లక్షల వరకు రుణం',
      description: 'రూఫ్‌టాప్ సోలార్, బ్యాటరీ ఇ-రిక్షాలు ಮತ್ತು ಪರಿಸರ అనుకూల హరిత వ్యాపారాల కోసం ₹30 లక్షల వరకు రాయితీ రుణం.',
    },
    ta: {
      name: 'பசுமை வணிகத் திட்டம் (GBS)',
      tagline: 'சூரிய சக்தி, மின்சார ரிக்‌ஷா மற்றும் பசுமை வணிகங்களுக்கு ₹30 லட்சம் வரை கடன்',
      description: 'சூரிய மின்சக்தி அலகுகள், மின்சார வாகனங்கள் மற்றும் மறுசுழற்சி போன்ற சுற்றுச்சூழல் நட்பு திட்டங்களுக்கு ₹30 லட்சம் வரை கடன் உதவி.',
    },
    gu: {
      name: 'ગ્રીન બિઝનેસ યોજના (GBS)',
      tagline: 'સોલાર પાવર, બેટરી ઈ-રિક્ષા અને પર્યાવરણને અનુકૂળ વ્યવસાયો માટે ₹30 લાખ સુધીની લોન',
      description: 'સૌર ઊર્જા, ઇલેક્ટ્રિક વાહનો અને ઇકો-ફ્રેન્ડલી વ્યવસાયો માટે ₹30 લાખ સુધીની નાણાકીય સહાય.',
    },
    kn: {
      name: 'ಹಸಿರು ವ್ಯಾಪಾರ ಯೋಜನೆ (GBS)',
      tagline: 'ಸೌರ ಶಕ್ತಿ, ಇ-ರಿಕ್ಷಾ ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ ಉದ್ಯಮಗಳಿಗಾಗಿ ₹30 ಲಕ್ಷದವರೆಗೆ ಸಾಲ',
      description: 'ಸೌರ ವಿದ್ಯುತ್, ಬ್ಯಾಟರಿ ಇ-ರಿಕ್ಷಾಗಳು ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ ಸುಸ್ಥಿರ ವ್ಯವಹಾರಗಳಿಗಾಗಿ ₹30 ಲಕ್ಷದವರೆಗೆ ಸಾಲ ಸೌಲಭ್ಯ.',
    },
    ml: {
      name: 'ഗ്രീൻ ബിസിനസ്സ് പദ്ധതി (GBS)',
      tagline: 'സോളാർ പവർ, ഇ-റിക്ഷകൾ, പരിസ്ഥിതി സൗഹൃദ പദ്ധതികൾ എന്നിവയ്ക്കായി ₹30 ലക്ഷം വരെയുള്ള വായ്പ',
      description: 'സോളാർ പവർ, ഇ-റിക്ഷകൾ, പുനരുപയോഗ സംരംഭങ്ങൾ തുടങ്ങിയ പരിസ്ഥിതി സൗഹൃദ പദ്ധതികൾക്കായി ₹30 ലക്ഷം വരെയുള്ള വായ്പ.',
    },
    pa: {
      name: 'ਗ੍ਰੀਨ ਬਿਜ਼ਨਸ ਸਕੀਮ (GBS)',
      tagline: 'ਸੋਲਰ ਊਰਜਾ, ਈ-ਰਿਕਸ਼ਾ ਅਤੇ ਵਾਤਾਵਰਣ ਅਨੁਕੂਲ ਕਾਰੋਬਾਰਾਂ ਲਈ ₹30 ਲੱਖ ਤੱਕ ਕਰਜ਼ਾ',
      description: 'ਸੂਰਜੀ ਊਰਜਾ, ਬੈਟਰੀ ਈ-ਰਿਕਸ਼ਾ ਅਤੇ ਈਕੋ-ਫਰੈਂਡਲੀ ਕਾਰੋਬਾਰਾਂ ਲਈ ₹30 ਲੱਖ ਤੱਕ ਰਿਆਇਤੀ ਵਿੱਤੀ ਸਹਾਇਤਾ।',
    },
    or: {
      name: 'ସବୁଜ ବ୍ୟବସାୟ ଯୋଜନା (GBS)',
      tagline: 'ସୌର ଶକ୍ତି, ଇ-ରିକ୍ସା ଓ ପରିବେଶ ଅନୁକୂଳ ସବୁଜ ବ୍ୟବସାୟ ପାଇଁ ₹୩୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଋଣ',
      description: 'ସୌର ପ୍ଲାଣ୍ଟ, ବ୍ୟାଟେରୀ ଇ-ରିକ୍ସା ଓ ପରିବେଶ ସୁରକ୍ଷାକାରୀ ବ୍ୟବସାୟ ପାଇଁ ₹୩୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ଆର୍ଥିକ ସହାୟତା।',
    },
    as: {
      name: 'সেউজ ব্যৱসায় আঁচনি (GBS)',
      tagline: 'সৌৰ শক্তি, ই-ৰিক্সা আৰু সেউজ ব্যৱসায়ৰ বাবে ₹৩০ লাখলৈকে ঋণ',
      description: 'সৌৰ শক্তি প্ৰকল্প, বৈদ্যুতিক ই-ৰিক্সা আৰু পৰিৱেশ অনুকূল বহনক্ষম ব্যৱসায়ৰ বাবে ₹৩০ লাখ পৰ্যন্ত ঋণ।',
    },
    ur: {
      name: 'گرین بزنس اسکیم (GBS)',
      tagline: 'شمسی توانائی، ای رکشا اور ماحول دوست کاروباروں کے لیے ₹30 لاکھ تک کا قرض',
      description: 'شمسی توانائی، برقی ای رکشا اور ماحول دوست پائیدار منصوبوں کے لیے ₹30 لاکھ تک کا رعایتی مالی تعاون۔',
    },
  },
};

// 2. CATEGORY BADGES
const CATEGORY_TRANSLATIONS: Partial<Record<SchemeCategory, Record<string, string>>> = {
  MICRO_FINANCE: {
    en: 'Micro Finance',
    hi: 'लघु वित्त',
    bn: 'ক্ষুদ্র ঋণ',
    mr: 'सूक्ष्म वित्त',
    te: 'మైక్రో ఫైనాన్స్',
    ta: 'குறு நிதி',
    gu: 'માઇક્રો ફાઇનાન્સ',
    kn: 'ಮೈಕ್ರೋ ಫೈನಾನ್ಸ್',
    ml: 'മൈക്രോ ഫിനാൻസ്',
    pa: 'ਮਾਈਕ੍ਰੋ ਫਾਈਨਾਂਸ',
    or: 'କ୍ଷୁଦ୍ର ଅର୍ଥ',
    as: 'ক্ষুদ্ৰ বিত্ত',
    ur: 'مائیکرو فنانس',
  },
  TERM_LOAN: {
    en: 'Term Loan',
    hi: 'मियादी ऋण',
    bn: 'মেয়াদী ঋণ',
    mr: 'मुदत कर्ज',
    te: 'టర్మ్ లోన్',
    ta: 'காலக் கடன்',
    gu: 'મુદતી લોન',
    kn: 'ಅವಧಿ ಸಾಲ',
    ml: 'ടേം ലോൺ',
    pa: 'ਮਿਆਦੀ ਕਰਜ਼ਾ',
    or: 'ମିଆଦି ଋଣ',
    as: 'ম্যাদী ঋণ',
    ur: 'میعادی قرض',
  },
  ENTREPRENEURSHIP: {
    en: 'Self Employment',
    hi: 'स्वरोजगार',
    bn: 'আত্মনিয়োগ',
    mr: 'स्वयंरोजगार',
    te: 'స్వయం ఉపాధి',
    ta: 'சுயதொழில்',
    gu: 'સ્વરોજગાર',
    kn: 'ಸ್ವಯಂ ಉದ್ಯೋಗ',
    ml: 'സ്വയം തൊഴിൽ',
    pa: 'ਸਵੈ-ਰੁਜ਼ਗਾਰ',
    or: 'ସ୍ୱରୋଜଗାର',
    as: 'আত্মসংস্থাপন',
    ur: 'خود روزگاری',
  },
  EDUCATION: {
    en: 'Higher Education',
    hi: 'उच्च शिक्षा',
    bn: 'উচ্চ শিক্ষা',
    mr: 'उच्च शिक्षण',
    te: 'ఉన్నత విద్య',
    ta: 'உயர்கல்வி',
    gu: 'ઉચ્ચ શિક્ષણ',
    kn: 'ಉನ್ನತ ಶಿಕ್ಷಣ',
    ml: 'ഉന്നത വിദ്യാഭ്യാസം',
    pa: 'ਉੱਚ ਸਿੱਖਿਆ',
    or: 'ଉଚ୍ଚ ଶିକ୍ଷା',
    as: 'উচ্চ শিক্ষা',
    ur: 'اعلیٰ تعلیم',
  },
  GREEN_BUSINESS: {
    en: 'Green Business',
    hi: 'ग्रीन बिजनेस',
    bn: 'সবুজ ব্যবসা',
    mr: 'हरित व्यवसाय',
    te: 'గ్రీన్ బిజినెస్',
    ta: 'பசுமை வணிகம்',
    gu: 'ગ્રીન બિઝનેસ',
    kn: 'ಹಸಿರು ವ್ಯಾಪಾರ',
    ml: 'ഗ്രീൻ ബിസിനസ്സ്',
    pa: 'ਗ੍ਰੀਨ ਬਿਜ਼ਨਸ',
    or: 'ସବୁଜ ବ୍ୟବସାୟ',
    as: 'সেউজ ব্যৱসায়',
    ur: 'گرین بزنس',
  },
};

// 3. CARD LABELS & METRICS
const CARD_LABELS: Record<string, LocalizedCardLabels> = {
  en: {
    projectCostLimit: 'Project Cost Limit',
    interestRate: 'Interest Rate',
    tenure: 'Tenure',
    moratorium: 'Moratorium',
    years: 'Years',
    months: 'Months',
    lakh: 'Lakh',
    calculate: 'Calculate',
    viewDetails: 'View Details & Documents',
    pa: 'p.a.',
    version: 'Version:',
  },
  hi: {
    projectCostLimit: 'परियोजना खर्च सीमा',
    interestRate: 'ब्याज दर',
    tenure: 'ऋण अवधि',
    moratorium: 'ग्रेस पीरियड',
    years: 'वर्ष तक',
    months: 'माह',
    lakh: 'लाख',
    calculate: 'किस्त निकालें',
    viewDetails: 'विवरण व दस्तावेज देखें',
    pa: 'वार्षिक',
    version: 'संस्करण:',
  },
  bn: {
    projectCostLimit: 'প্রকল্প ব্যয়ের সর্বোচ্চ সীমা',
    interestRate: 'সুদের হার',
    tenure: 'ঋণের মেয়াদ',
    moratorium: 'গ্রেস পিরিয়ড',
    years: 'বছর পর্যন্ত',
    months: 'মাস',
    lakh: 'লাখ',
    calculate: 'কিস্তি বের করুন',
    viewDetails: 'বিস্তারিত ও নথিপত্র দেখুন',
    pa: 'বার্ষিক',
    version: 'সংস্করণ:',
  },
  mr: {
    projectCostLimit: 'प्रकल्प खर्च मर्यादा',
    interestRate: 'व्याज दर',
    tenure: 'परतफेड कालावधी',
    moratorium: 'सवलत कालावधी',
    years: 'वर्षे',
    months: 'महिने',
    lakh: 'लाख',
    calculate: 'हप्ता काढा',
    viewDetails: 'तपशील व कागदपत्रे पहा',
    pa: 'वार्षिक',
    version: 'आवृत्ती:',
  },
  te: {
    projectCostLimit: 'ప్రాజెక్ట్ ఖర్చు పరిమితి',
    interestRate: 'వడ్డీ రేటు',
    tenure: 'తిరిగి చెల్లించే వ్యవధి',
    moratorium: 'మొరటోరియం కాలం',
    years: 'సంవత్సరాలు',
    months: 'నెలలు',
    lakh: 'లక్ష',
    calculate: 'ఈఎంఐ గణించండి',
    viewDetails: 'వివరాలు & పత్రాలు చూడండి',
    pa: 'వార్షిక',
    version: 'వెర్షన్:',
  },
  ta: {
    projectCostLimit: 'திட்டச் செலவு வரம்பு',
    interestRate: 'வட்டி விகிதம்',
    tenure: 'திருப்பிச் செலுத்தும் காலம்',
    moratorium: 'சலுகைக் காலம்',
    years: 'ஆண்டுகள் வரை',
    months: 'மாதங்கள்',
    lakh: 'லட்சம்',
    calculate: 'தவணை கணக்கிடு',
    viewDetails: 'விவரங்கள் & ஆவணங்களைக் காண்க',
    pa: 'ஆண்டுக்கு',
    version: 'பதிப்பு:',
  },
  gu: {
    projectCostLimit: 'પ્રોજેક્ટ ખર્ચ મર્યાદા',
    interestRate: 'વ્યાજ દર',
    tenure: 'લોન મુદત',
    moratorium: 'ગ્રેસ પીરિયડ',
    years: 'વર્ષ સુધી',
    months: 'મહિના',
    lakh: 'લાખ',
    calculate: 'હપ્તો ગણો',
    viewDetails: 'વિગતો અને દસ્તાવેજો જુઓ',
    pa: 'વાર્ષિક',
    version: 'આવૃત્તિ:',
  },
  kn: {
    projectCostLimit: 'ಯೋಜನಾ ವೆಚ್ಚದ ಮಿತಿ',
    interestRate: 'ಬಡ್ಡಿ ದರ',
    tenure: 'ಮರುಪಾವತಿ ಅವಧಿ',
    moratorium: 'ಮೊರಟೋರಿಯಂ ಅವಧಿ',
    years: 'ವರ್ಷಗಳು',
    months: 'ತಿಂಗಳುಗಳು',
    lakh: 'ಲಕ್ಷ',
    calculate: 'ಕಂತು ಲೆಕ್ಕಿಸಿ',
    viewDetails: 'ವಿವರಗಳು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    pa: 'ವಾರ್ಷಿಕ',
    version: 'ಆವೃತ್ತಿ:',
  },
  ml: {
    projectCostLimit: 'പദ്ധതി ചെലവ് പരിധി',
    interestRate: 'പലിശ നിരക്ക്',
    tenure: 'തിരിച്ചടവ് കാലാവധി',
    moratorium: 'മൊറട്ടോറിയം കാലം',
    years: 'വർഷം വരെ',
    months: 'മാസം',
    lakh: 'ലക്ഷം',
    calculate: 'ഇഎംഐ കണക്കാക്കുക',
    viewDetails: 'വിശദാംശങ്ങളും രേഖകളും കാണുക',
    pa: 'പ്രതിവർഷം',
    version: 'പതിപ്പ്:',
  },
  pa: {
    projectCostLimit: 'ਪ੍ਰੋਜੈਕਟ ਲਾਗਤ ਸੀਮਾ',
    interestRate: 'ਵਿਆਜ ਦਰ',
    tenure: 'ਮੁੜ ਅਦਾਇਗੀ ਮਿਆਦ',
    moratorium: 'ਮੋਰੇਟੋਰੀਅਮ ਛੋਟ',
    years: 'ਸਾਲ ਤੱਕ',
    months: 'ਮਹੀਨੇ',
    lakh: 'ਲੱਖ',
    calculate: 'ਕਿਸ਼ਤ ਕੱਢੋ',
    viewDetails: 'ਵੇਰਵੇ ਅਤੇ ਦਸਤਾਵੇਜ਼ ਵੇਖੋ',
    pa: 'ਸਾਲਾਨਾ',
    version: 'ਸੰਸਕਰਣ:',
  },
  or: {
    projectCostLimit: 'ପ୍ରକଳ୍ପ ଖର୍ଚ୍ଚ ସୀମା',
    interestRate: 'ସୁଧ ହାର',
    tenure: 'ଋଣ ଅବଧି',
    moratorium: 'ରିହାତି ଅବଧି',
    years: 'ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ',
    months: 'ମାସ',
    lakh: 'ଲକ୍ଷ',
    calculate: 'କିସ୍ତି ଗଣନା କରନ୍ତୁ',
    viewDetails: 'ବିବରଣୀ ଓ ଦସ୍ତାବିଜ ଦେଖନ୍ତୁ',
    pa: 'ବାର୍ଷିକ',
    version: 'ସଂସ୍କରଣ:',
  },
  as: {
    projectCostLimit: 'প্ৰকল্প ব্যয়ৰ সীমা',
    interestRate: 'সুতৰ হাৰ',
    tenure: 'ঋণ পৰিশোধৰ ম্যাদ',
    moratorium: 'ৰেহাই ম্যাদ',
    years: 'বছৰলৈ',
    months: 'মাহ',
    lakh: 'লাখ',
    calculate: 'কিস্তি গণনা কৰক',
    viewDetails: 'বিৱৰণ আৰু নথিপত্ৰ চাওক',
    pa: 'বাৰ্ষিক',
    version: 'সংস্কৰণ:',
  },
  ur: {
    projectCostLimit: 'پروجیکٹ لاگت کی حد',
    interestRate: 'شرح سود',
    tenure: 'مدت قرض',
    moratorium: 'رعایتی مدت',
    years: 'سال تک',
    months: 'ماہ',
    lakh: 'لاکھ',
    calculate: 'قسط کا حساب لگائیں',
    viewDetails: 'تفصیلات اور دستاویزات دیکھیں',
    pa: 'سالانہ',
    version: 'ورژن:',
  },
};

// 4. HOME FEATURED SCHEMES SECTION
const HOME_FEATURED: Record<string, LocalizedHomeFeatured> = {
  en: {
    title: 'Featured Official Schemes',
    subtitle: '',
    viewAll: 'View all 5 schemes',
  },
  hi: {
    title: 'प्रमुख आधिकारिक योजनाएं',
    subtitle: 'राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम (NSFDC) द्वारा संचालित',
    viewAll: 'सभी 5 योजनाएं देखें',
  },
  bn: {
    title: 'বিশেষ সরকারি প্রকল্পসমূহ',
    subtitle: 'ন্যাশনাল শিডিউল্ড কাস্টস ফাইন্যান্স অ্যান্ড ডেভেলপমেন্ট কর্পোরেশন (NSFDC) দ্বারা পরিচালিত',
    viewAll: 'সমস্ত ৫টি প্রকল্প দেখুন',
  },
  mr: {
    title: 'प्रमुख अधिकृत योजना',
    subtitle: 'राष्ट्रीय अनुसूचित जाती वित्त व विकास महामंडळ (NSFDC) द्वारे संचलित',
    viewAll: 'सर्व ५ योजना पहा',
  },
  te: {
    title: 'ప్రముఖ అధికారిక పథకాలు',
    subtitle: 'నేషనల్ షెడ్యూల్డ్ క్యాస్ట్స్ ఫైనాన్స్ & డెవలప్‌మెంట్ కార్పొరేషన్ (NSFDC) ద్వారా నిర్వహించబడుతుంది',
    viewAll: 'అన్ని 5 పథకాలను చూడండి',
  },
  ta: {
    title: 'முக்கிய அதிகாரப்பூர்வ திட்டங்கள்',
    subtitle: 'தேசிய தாழ்த்தப்பட்டோர் நிதி மற்றும் மேம்பாட்டுக் கழகத்தால் (NSFDC) நிர்வகிக்கப்படுகிறது',
    viewAll: 'அனைத்து 5 திட்டங்களையும் காண்க',
  },
  gu: {
    title: 'મુખ્ય સત્તાવાર યોજનાઓ',
    subtitle: 'રાષ્ટ્રીય અનુસૂચિત જાતિ નાણાં અને વિકાસ નિગમ (NSFDC) દ્વારા સંચાલિત',
    viewAll: 'તમામ 5 યોજનાઓ જુઓ',
  },
  kn: {
    title: 'ಪ್ರಮುಖ ಅಧಿಕೃತ ಯೋಜನೆಗಳು',
    subtitle: 'ರಾಷ್ಟ್ರೀಯ ಪರಿಶಿಷ್ಟ ಜಾತಿ ಹಣಕಾಸು ಮತ್ತು ಅಭಿವೃದ್ಧಿ ನಿಗಮ (NSFDC) ದಿಂದ ನಿರ್ವಹಿಸಲ್ಪಡುತ್ತದೆ',
    viewAll: 'ಎಲ್ಲಾ 5 ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
  },
  ml: {
    title: 'പ്രധാന ഔദ്യോഗിക പദ്ധതികൾ',
    subtitle: 'നാഷണൽ ഷെഡ്യൂൾഡ് കാസ്റ്റ്സ് ഫിനാൻസ് ആൻഡ് ഡെവലപ്‌മെന്റ് കോർപ്പറേഷൻ (NSFDC) നിയന്ത്രിക്കുന്നത്',
    viewAll: 'എല്ലാ 5 പദ്ധതികളും കാണുക',
  },
  pa: {
    title: 'ਮੁੱਖ ਅਧਿਕਾਰਤ ਸਕੀਮਾਂ',
    subtitle: 'ਨੈਸ਼ਨਲ ਸ਼ਡਿਊਲਡ ਕਾਸਟਸ ਫਾਈਨਾਂਸ ਐਂਡ ਡਿਵੈਲਪਮੈਂਟ ਕਾਰਪੋਰੇਸ਼ਨ (NSFDC) ਦੁਆਰਾ ਸੰਚਾਲਿਤ',
    viewAll: 'ਸਾਰੀਆਂ 5 ਸਕੀਮਾਂ ਵੇਖੋ',
  },
  or: {
    title: 'ପ୍ରମୁଖ ସରକାରୀ ଯୋଜନା',
    subtitle: 'ଜାତୀୟ ଅନୁସୂଚିତ ଜାତି ବିତ୍ତ ଏବଂ ବିକାଶ ନିଗମ (NSFDC) ଦ୍ୱାରା ପରିଚାଳିତ',
    viewAll: 'ସମସ୍ତ ୫ଟି ଯୋଜନା ଦେଖନ୍ତୁ',
  },
  as: {
    title: 'প্ৰধান চৰকাৰী আঁচনিসমূহ',
    subtitle: 'ৰাষ্ট্ৰীয় অনুসূচিত জাতি বিত্ত আৰু উন্নয়ন নিগম (NSFDC) ৰ দ্বাৰা পৰিচালিত',
    viewAll: 'সকলো ৫খন আঁচনি চাওক',
  },
  ur: {
    title: 'نمایاں سرکاری اسکیمیں',
    subtitle: 'نیشنل شیڈولڈ کاسٹس فنانس اینڈ ڈیولپمنٹ کارپوریشن (NSFDC) کے زیر انتظام',
    viewAll: 'تمام 5 اسکیمیں دیکھیں',
  },
};

// 5. HELPER FUNCTIONS WITH SMART FALLBACK TO HINDI/ENGLISH
export function getLocalizedScheme(scheme: Scheme, language: LanguageCode | string): LocalizedSchemeContent {
  const code = scheme.code.toUpperCase();
  const byCode = SCHEME_TRANSLATIONS[code];

  if (byCode) {
    if (byCode[language]) {
      return byCode[language];
    }
    // Devanagari languages fallback to Hindi if available
    const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
    if (devanagariLangs.includes(language) && byCode['hi']) {
      return byCode['hi'];
    }
    if (byCode['en']) {
      return byCode['en'];
    }
  }

  // Fallback to scheme object fields
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat', 'hi'];
  if (devanagariLangs.includes(language) && scheme.nameHi) {
    return {
      name: scheme.nameHi,
      tagline: scheme.taglineHi || scheme.tagline,
      description: scheme.descriptionHi || scheme.description,
    };
  }

  return {
    name: scheme.name,
    tagline: scheme.tagline,
    description: scheme.description,
  };
}

export function getLocalizedCategory(
  category: SchemeCategory,
  language: LanguageCode | string
): { label: string; color: string } {
  const colors: Partial<Record<SchemeCategory, string>> = {
    MICRO_FINANCE: 'bg-emerald-100 text-emerald-800',
    TERM_LOAN: 'bg-blue-100 text-blue-800',
    ENTREPRENEURSHIP: 'bg-amber-100 text-amber-800',
    EDUCATION: 'bg-purple-100 text-purple-800',
    GREEN_BUSINESS: 'bg-teal-100 text-teal-800',
  };

  const byCat = CATEGORY_TRANSLATIONS[category];
  let label = category as string;

  if (byCat) {
    const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
    label = byCat[language] || (devanagariLangs.includes(language) && byCat['hi'] ? byCat['hi'] : byCat['en']);
  }

  return {
    label,
    color: colors[category] || 'bg-slate-100 text-slate-800',
  };
}

export function getLocalizedCardLabels(language: LanguageCode | string): LocalizedCardLabels {
  if (CARD_LABELS[language]) {
    return CARD_LABELS[language];
  }
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
  if (devanagariLangs.includes(language)) {
    return CARD_LABELS['hi'];
  }
  return CARD_LABELS['en'];
}

export function getLocalizedHomeFeatured(language: LanguageCode | string): LocalizedHomeFeatured {
  if (HOME_FEATURED[language]) {
    return HOME_FEATURED[language];
  }
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
  if (devanagariLangs.includes(language)) {
    return HOME_FEATURED['hi'];
  }
  return HOME_FEATURED['en'];
}

export function formatLocalizedLakh(
  amount: number,
  language: LanguageCode | string
): string {
  const labels = getLocalizedCardLabels(language);
  if (amount >= 100000) {
    const lakhVal = amount / 100000;
    const formattedNum = Number.isInteger(lakhVal) ? `${lakhVal}` : `${lakhVal.toFixed(1)}`;
    return `₹${formattedNum} ${labels.lakh}`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export interface LocalizedQuickActions {
  explore: string;
  educationLoan: string;
  calculate: string;
  locate: string;
}

const QUICK_ACTIONS: Record<string, LocalizedQuickActions> = {
  en: { explore: 'Explore', educationLoan: 'Education Loan', calculate: 'Calculate', locate: 'Locate' },
  hi: { explore: 'योजना खोजें', educationLoan: 'शिक्षा ऋण', calculate: 'किस्त निकालें', locate: 'केंद्र खोजें' },
  bn: { explore: 'প্রকল্প দেখুন', educationLoan: 'শিক্ষা ঋণ', calculate: 'হিসাব করুন', locate: 'কেন্দ্র খুঁজুন' },
  mr: { explore: 'योजना पहा', educationLoan: 'शैक्षणिक कर्ज', calculate: 'हिशोब करा', locate: 'केंद्र शोधा' },
  te: { explore: 'అన్వేషించండి', educationLoan: 'విద్యా రుణం', calculate: 'లెక్కించండి', locate: 'కేంద్రాన్ని కనుగొనండి' },
  ta: { explore: 'ஆராய்க', educationLoan: 'கல்விக் கடன்', calculate: 'கணக்கிடு', locate: 'மையத்தைக் காண்க' },
  gu: { explore: 'યોજનાઓ જુઓ', educationLoan: 'શિક્ષણ લોન', calculate: 'ગણતરી કરો', locate: 'કેન્દ્ર શોધો' },
  kn: { explore: 'ಅನ್ವೇಷಿಸಿ', educationLoan: 'ಶಿಕ್ಷಣ ಸಾಲ', calculate: 'ಲೆಕ್ಕ ಹಾಕಿ', locate: 'ಕೇಂದ್ರ ಹುಡುಕಿ' },
  ml: { explore: 'പരിശോധിക്കുക', educationLoan: 'വിദ്യാഭ്യാസ വായ്പ', calculate: 'കണക്കാക്കുക', locate: 'കേന്ദ്രം കണ്ടെത്തുക' },
  pa: { explore: 'ਵੇਖੋ', educationLoan: 'ਸਿੱਖਿਆ ਕਰਜ਼ਾ', calculate: 'ਹਿਸਾਬ ਕਰੋ', locate: 'ਕੇਂਦਰ ਲੱਭੋ' },
  or: { explore: 'ଅନୁସନ୍ଧାନ', educationLoan: 'ଶିକ୍ଷା ଋଣ', calculate: 'ଗଣନା', locate: 'କେନ୍ଦ୍ର ଖୋଜନ୍ତୁ' },
  as: { explore: 'আঁচনি চাওক', educationLoan: 'শিক্ষা ঋণ', calculate: 'গণনা কৰক', locate: 'কেন্দ্ৰ বিচাৰক' },
  ur: { explore: 'دریافت کریں', educationLoan: 'تعلیمی قرض', calculate: 'حساب لگائیں', locate: 'مرکز تلاش کریں' },
};

export function getLocalizedQuickActions(language: LanguageCode | string): LocalizedQuickActions {
  if (QUICK_ACTIONS[language]) return QUICK_ACTIONS[language];
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
  if (devanagariLangs.includes(language)) return QUICK_ACTIONS['hi'];
  return QUICK_ACTIONS['en'];
}

// 6. SCHEMES CATALOG PAGE
export interface LocalizedSchemesPage {
  catalogBadge: string;
  title: string;
  subtitle: string;
  allSchemes: string;
  searchPlaceholder: string;
}

const SCHEMES_PAGE_TEXT: Record<string, LocalizedSchemesPage> = {
  en: {
    catalogBadge: 'Official Scheme Catalog',
    title: 'NSFDC Credit & Education Schemes',
    subtitle: 'Concessional credit policies structured for self-employment, small enterprises, and recognized college degrees.',
    allSchemes: 'All Schemes',
    searchPlaceholder: 'Search scheme...',
  },
  hi: {
    catalogBadge: 'आधिकारिक योजना सूची',
    title: 'एनएसएफडीसी ऋण एवं शिक्षा योजनाएं',
    subtitle: 'अनुसूचित जाति के पात्र नागरिकों हेतु रियायती ब्याज दरों पर आजीविका, व्यवसाय एवं तकनीकी शिक्षा योजनाएं।',
    allSchemes: 'सभी योजनाएं',
    searchPlaceholder: 'योजना खोजें...',
  },
  bn: {
    catalogBadge: 'সরকারি প্রকল্পের তালিকা',
    title: 'NSFDC ঋণ ও শিক্ষা প্রকল্পসমূহ',
    subtitle: 'তপশিলি জাতির যোগ্য নাগরিকদের জন্য স্বল্প সুদের হারে স্বনির্ভর জীবিকা, ব্যবসা ও কারিগরি শিক্ষা সহায়তা প্রকল্প।',
    allSchemes: 'সমস্ত প্রকল্প',
    searchPlaceholder: 'প্রকল্প খুঁজুন...',
  },
  mr: {
    catalogBadge: 'अधिकृत योजना सूची',
    title: 'NSFDC कर्ज व शिक्षण योजना',
    subtitle: 'अनुसूचित जातीतील पात्र नागरिकांसाठी सवलतीच्या व्याजदरात उपजीविका, व्यवसाय व उच्च शिक्षण योजना.',
    allSchemes: 'सर्व योजना',
    searchPlaceholder: 'योजना शोधा...',
  },
  te: {
    catalogBadge: 'అధికారిక పథకాల జాబితా',
    title: 'NSFDC రుణాలు & విద్యా పథకాలు',
    subtitle: 'షెడ్యూల్డ్ కులాల అర్హులైన పౌరుల కోసం రాయితీ వడ్డీతో స్వయం ఉపాధి, వ్యాపారం మరియు ఉన్నత విద్య రుణాలు.',
    allSchemes: 'అన్ని పథకాలు',
    searchPlaceholder: 'పథకాన్ని శోధించండి...',
  },
  ta: {
    catalogBadge: 'அதிகாரப்பூர்வ திட்ட பட்டியல்',
    title: 'NSFDC கடன் மற்றும் கல்வித் திட்டங்கள்',
    subtitle: 'தாழ்த்தப்பட்ட மக்களுக்கு சலுகை வட்டியில் சுயதொழில், வணிகம் மற்றும் உயர்கல்வித் திட்டங்கள்.',
    allSchemes: 'அனைத்து திட்டங்கள்',
    searchPlaceholder: 'திட்டத்தைத் தேடுக...',
  },
  gu: {
    catalogBadge: 'સત્તાવાર યોજના યાદી',
    title: 'NSFDC ધિરાણ અને શિક્ષણ યોજનાઓ',
    subtitle: 'અનુસૂચિત જાતિના પાત્ર નાગરિકો માટે રાહત દરે આજીવિકા, વ્યવસાય અને ઉચ્ચ શિક્ષણ યોજનાઓ.',
    allSchemes: 'તમામ યોજનાઓ',
    searchPlaceholder: 'યોજના શોધો...',
  },
  kn: {
    catalogBadge: 'ಅಧಿಕೃತ ಯೋಜನೆಗಳ ಪಟ್ಟಿ',
    title: 'NSFDC ಸಾಲ ಮತ್ತು ಶಿಕ್ಷಣ ಯೋಜನೆಗಳು',
    subtitle: 'ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ಅರ್ಹ ನಾಗರಿಕರಿಗೆ ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ಜೀವನೋಪಾಯ, ವ್ಯಾಪಾರ ಮತ್ತು ಶಿಕ್ಷಣ ಯೋಜನೆಗಳು.',
    allSchemes: 'ಎಲ್ಲಾ ಯೋಜನೆಗಳು',
    searchPlaceholder: 'ಯೋಜನೆ ಹುಡುಕಿ...',
  },
  ml: {
    catalogBadge: 'ഔദ്യോഗിക പദ്ധതികളുടെ പട്ടിക',
    title: 'NSFDC വായ്പ, വിദ്യാഭ്യാസ പദ്ധതികൾ',
    subtitle: 'പട്ടികജാതി പൗരന്മാർക്കായി കുറഞ്ഞ പലിശയിൽ സ്വയംതൊഴിൽ, ബിസിനസ്സ്, ഉന്നതവിദ്യാഭ്യാസ വായ്പകൾ.',
    allSchemes: 'എല്ലാ പദ്ധതികളും',
    searchPlaceholder: 'പദ്ധതി തിരയുക...',
  },
  pa: {
    catalogBadge: 'ਅਧਿਕਾਰਤ ਸਕੀਮ ਸੂਚੀ',
    title: 'NSFDC ਕਰਜ਼ਾ ਅਤੇ ਸਿੱਖਿਆ ਸਕੀਮਾਂ',
    subtitle: 'ਅਨੁਸੂਚਿਤ ਜਾਤੀਆਂ ਲਈ ਰਿਆਇਤੀ ਵਿਆਜ ਦਰਾਂ \'ਤੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ, ਵਪਾਰ ਅਤੇ ਸਿੱਖਿਆ ਸਕੀਮਾਂ।',
    allSchemes: 'ਸਾਰੀਆਂ ਸਕੀਮਾਂ',
    searchPlaceholder: 'ਸਕੀਮ ਖੋਜੋ...',
  },
  or: {
    catalogBadge: 'ସରକାରୀ ଯୋଜନା ତାଲିକା',
    title: 'NSFDC ଋଣ ଓ ଶିକ୍ଷା ଯୋଜନା',
    subtitle: 'ଅନୁସୂଚିତ ଜାତିର ଲୋକଙ୍କ ପାଇଁ ରିହାତି ସୁଧରେ ସ୍ୱରୋଜଗାର, ବ୍ୟବସାୟ ଓ ଉଚ୍ଚଶିକ୍ଷା ଋଣ ଯୋଜନା।',
    allSchemes: 'ସମସ୍ତ ଯୋଜନା',
    searchPlaceholder: 'ଯୋଜନା ଖୋଜନ୍ତୁ...',
  },
  as: {
    catalogBadge: 'চৰকাৰী আঁচনিৰ তালিকা',
    title: 'NSFDC ঋণ আৰু শিক্ষা আঁচনি',
    subtitle: 'অনুসূচিত জাতিৰ লোকসকলৰ বাবে ৰেহাই সুতৰ হাৰত আত্মনিয়োগ, ব্যৱসায় আৰু উচ্চ শিক্ষা আঁচনি।',
    allSchemes: 'সকলো আঁচনি',
    searchPlaceholder: 'আঁচনি বিচাৰক...',
  },
  ur: {
    catalogBadge: 'سرکاری اسکیموں کی فہرست',
    title: 'NSFDC قرض اور تعلیمی اسکیمیں',
    subtitle: 'شیڈولڈ کاسٹ شہریوں کے لیے رعایتی شرح سود پر خود روزگاری، تجارت اور اعلیٰ تعلیمی اسکیمیں۔',
    allSchemes: 'تمام اسکیمیں',
    searchPlaceholder: 'اسکیم تلاش کریں...',
  },
};

export function getLocalizedSchemesPage(language: LanguageCode | string): LocalizedSchemesPage {
  if (SCHEMES_PAGE_TEXT[language]) return SCHEMES_PAGE_TEXT[language];
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
  if (devanagariLangs.includes(language)) return SCHEMES_PAGE_TEXT['hi'];
  return SCHEMES_PAGE_TEXT['en'];
}

// 7. PARTNER TYPE LABELS ACROSS LANGUAGES
export interface LocalizedPartnerUI {
  sca: string;
  rrb: string;
  bank: string;
  other: string;
  away: string;
  locateMe: string;
  directions: string;
  fromLocation: string;
  googleMapsEngine?: string;
  osmEngine?: string;
  keySetupTitle?: string;
  keySetupDesc?: string;
  saveKeyBtn?: string;
  pendingKeyNotice?: string;
}

const PARTNER_UI_TEXT: Record<string, LocalizedPartnerUI> = {
  en: {
    sca: 'State Channelizing Agency (SCA)',
    rrb: 'Regional Rural Bank (RRB)',
    bank: 'Lead Bank / PSB',
    other: 'Channel Partner',
    away: 'away',
    locateMe: 'Locate Me (GPS)',
    directions: 'Get Driving Directions ↗',
    fromLocation: 'from your location',
    googleMapsEngine: 'Google Maps (API)',
    osmEngine: 'OpenStreetMap',
    keySetupTitle: 'Google Maps Platform API Setup',
    keySetupDesc: 'Enter your Google Maps API Key to enable live satellite imagery and official routing layers.',
    saveKeyBtn: 'Save & Activate Google Maps',
    pendingKeyNotice: 'Google Maps API Ready • Awaiting API key in .env.local or UI setup',
  },
  hi: {
    sca: 'राज्य अधिकृत चैनल निगम (SCA)',
    rrb: 'क्षेत्रीय ग्रामीण बैंक (RRB)',
    bank: 'लीड बैंक / राष्ट्रीयकृत बैंक',
    other: 'अधिकृत चैनल पार्टनर',
    away: 'दूर',
    locateMe: 'मेरा स्थान खोजें (GPS)',
    directions: 'नेविगेट करें (दिशा देखें) ↗',
    fromLocation: 'आपके स्थान से',
    googleMapsEngine: 'गूगल मैप्स (API)',
    osmEngine: 'ओपनस्ट्रीटमैप',
    keySetupTitle: 'गूगल मैप्स प्लेटफ़ॉर्म एपीआई सेटअप',
    keySetupDesc: 'लाइव उपग्रह (सैटेलाइट) और आधिकारिक नेविगेशन सक्रिय करने हेतु अपनी गूगल मैप्स एपीआई कुंजी दर्ज करें।',
    saveKeyBtn: 'सहेजें व गूगल मैप्स चालू करें',
    pendingKeyNotice: 'गूगल मैप्स एपीआई तैयार • .env.local या यूआई में कुंजी दर्ज करने की प्रतीक्षा',
  },
  bn: {
    sca: 'রাজ্য চ্যানেল এজেন্সি (SCA)',
    rrb: 'আঞ্চলিক গ্রামীণ ব্যাংক (RRB)',
    bank: 'প্রধান ব্যাংক / লিড ব্যাংক',
    other: 'অনুমোদিত চ্যানেল সংস্থা',
    away: 'দূরে',
    locateMe: 'আমার অবস্থান খুঁজুন (GPS)',
    directions: 'দিকনির্দেশ দেখুন ↗',
    fromLocation: 'আপনার বর্তমান অবস্থান থেকে',
  },
  mr: {
    sca: 'राज्य चॅनेलाइजिंग एजन्सी (SCA)',
    rrb: 'प्रादेशिक ग्रामीण बँक (RRB)',
    bank: 'अग्रणी बँक / राष्ट्रीयकृत बँक',
    other: 'अधिकृत भागीदार संस्था',
    away: 'अंतरावर',
    locateMe: 'माझे स्थान शोधा (GPS)',
    directions: 'मार्गदर्शन मिळवा ↗',
    fromLocation: 'तुमच्या स्थानापासून',
  },
  te: {
    sca: 'రాష్ట్ర చానలైజింగ్ ఏజెన్సీ (SCA)',
    rrb: 'ప్రాంతీయ గ్రామీణ బ్యాంకు (RRB)',
    bank: 'లీడ్ బ్యాంక్ / ప్రభుత్వ బ్యాంకు',
    other: 'అధికారిక భాగస్వామి',
    away: 'దూరంలో',
    locateMe: 'నా స్థానాన్ని గుర్తించండి (GPS)',
    directions: 'దారి తెలుసుకోండి ↗',
    fromLocation: 'మీ ప్రస్తుత ప్రదేశం నుండి',
  },
  ta: {
    sca: 'மாநில முகமை (SCA)',
    rrb: 'மண்டல கிராமப்புற வங்கி (RRB)',
    bank: 'முதன்மை வங்கி / அரசு வங்கி',
    other: 'அங்கீகரிக்கப்பட்ட பங்குதாரர்',
    away: 'தொலைவில்',
    locateMe: 'என் இருப்பிடத்தைக் காண்க (GPS)',
    directions: 'வழிகாட்டுதலைப் பெறுக ↗',
    fromLocation: 'உங்கள் இருப்பிடத்திலிருந்து',
  },
  gu: {
    sca: 'રાજ્ય ચેનલાઈઝિંગ એજન્સી (SCA)',
    rrb: 'પ્રાદેશિક ગ્રામીણ બેંક (RRB)',
    bank: 'લીડ બેંક / જાહેર બેંક',
    other: 'સત્તાવાર ભાગીદાર',
    away: 'દૂર',
    locateMe: 'મારું સ્થાન શોધો (GPS)',
    directions: 'દિશા મેળવો ↗',
    fromLocation: 'તમારા સ્થાનથી',
  },
  kn: {
    sca: 'ರಾಜ್ಯ ವಾಹಿನಿ ಸಂಸ್ಥೆ (SCA)',
    rrb: 'ಪ್ರಾದೇಶಿಕ ಗ್ರಾಮೀಣ ಬ್ಯಾಂಕ್ (RRB)',
    bank: 'ಮುಖ್ಯ ಬ್ಯಾಂಕ್ / ಸಾರ್ವಜನಿಕ ಬ್ಯಾಂಕ್',
    other: 'ಅಧಿಕೃತ ಪಾಲುದಾರ',
    away: 'ದೂರದಲ್ಲಿ',
    locateMe: 'ನನ್ನ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ (GPS)',
    directions: 'ದಾರಿಯನ್ನು ಪಡೆಯಿರಿ ↗',
    fromLocation: 'ನಿಮ್ಮ ಸ್ಥಳದಿಂದ',
  },
  ml: {
    sca: 'സ്റ്റേറ്റ് ചാനലൈസിംഗ് ഏജൻസി (SCA)',
    rrb: 'റീജിയണൽ റൂറൽ ബാങ്ക് (RRB)',
    bank: 'ലീഡ് ബാങ്ക് / സർക്കാർ ബാങ്ക്',
    other: 'അംഗീകൃത ഏജൻസി',
    away: 'അകലെ',
    locateMe: 'എന്റെ ലൊക്കേഷൻ കണ്ടെത്തുക (GPS)',
    directions: 'വഴി കണ്ടെത്തുക ↗',
    fromLocation: 'നിങ്ങളുടെ സ്ഥാനത്ത് നിന്ന്',
  },
  pa: {
    sca: 'ਰਾਜ ਚੈਨਲਾਈਜ਼ਿੰਗ ਏਜੰਸੀ (SCA)',
    rrb: 'ਖੇਤਰੀ ਪੇਂਡੂ ਬੈਂਕ (RRB)',
    bank: 'ਲੀਡ ਬੈਂਕ / ਸਰਕਾਰੀ ਬੈਂਕ',
    other: 'ਅਧਿਕਾਰਤ ਭਾਈਵਾਲ',
    away: 'ਦੂਰ',
    locateMe: 'ਮੇਰੀ ਸਥਿਤੀ ਲੱਭੋ (GPS)',
    directions: 'ਦਿਸ਼ਾਵਾਂ ਵੇਖੋ ↗',
    fromLocation: 'ਤੁਹਾਡੇ ਸਥਾਨ ਤੋਂ',
  },
  or: {
    sca: 'ରାଜ୍ୟ ଚ୍ୟାନେଲାଇଜିଂ ଏଜେନ୍ସି (SCA)',
    rrb: 'ଆଞ୍ଚଳିକ ଗ୍ରାମୀଣ ବ୍ୟାଙ୍କ (RRB)',
    bank: 'ଲିଡ୍ ବ୍ୟାଙ୍କ / ସରକାରୀ ବ୍ୟାଙ୍କ',
    other: 'ସ୍ୱୀକୃତିପ୍ରାପ୍ତ ସଂସ୍ଥା',
    away: 'ଦୂରରେ',
    locateMe: 'ମୋର ସ୍ଥାନ ଖୋଜନ୍ତୁ (GPS)',
    directions: 'ଦିଗ ଦେଖନ୍ତୁ ↗',
    fromLocation: 'ଆପଣଙ୍କ ସ୍ଥାନରୁ',
  },
  as: {
    sca: 'ৰাজ্যিক চেনেল এজেঞ্চী (SCA)',
    rrb: 'আঞ্চলিক গ্ৰামীণ বেংক (RRB)',
    bank: 'লিড বেংক / চৰকাৰী বেংক',
    other: 'অনুমোদিত সংস্থা',
    away: 'দূৰত',
    locateMe: 'মোৰ স্থান বিচাৰক (GPS)',
    directions: 'দিশ নিৰ্দেশ চাওক ↗',
    fromLocation: 'আপোনাৰ স্থানৰ পৰা',
  },
  ur: {
    sca: 'اسٹیٹ چینلائزنگ ایجنسی (SCA)',
    rrb: 'علاقائی دیہی بینک (RRB)',
    bank: 'لیڈ بینک / سرکاری بینک',
    other: 'مجاز شراکت دار',
    away: 'دور',
    locateMe: 'مقام تلاش کریں (GPS)',
    directions: 'سمت حاصل کریں ↗',
    fromLocation: 'آپ کے مقام سے',
  },
};

export function getLocalizedPartnerUI(language: LanguageCode | string): LocalizedPartnerUI {
  if (PARTNER_UI_TEXT[language]) return PARTNER_UI_TEXT[language];
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
  if (devanagariLangs.includes(language)) return PARTNER_UI_TEXT['hi'];
  return PARTNER_UI_TEXT['en'];
}

export interface LocalizedDiscoveryUI {
  tabGuide: string;
  tabGuideDesc: string;
  tabDirect: string;
  tabDirectDesc: string;
  genderQuestion: string;
  genderSubtitle: string;
  genderFemale: string;
  genderMale: string;
  genderOther: string;
  femaleRebateNotice: string;
  femaleExclusiveBadge: string;
  purposeQuestion: string;
  purposeSubtitle: string;
  purposeBusiness: string;
  purposeBusinessDesc: string;
  purposeEducation: string;
  purposeEducationDesc: string;
  purposeGreen: string;
  purposeGreenDesc: string;
  purposeAgri: string;
  purposeAgriDesc: string;
  purposeTransport: string;
  purposeTransportDesc: string;
  directSearchPlaceholder: string;
  quickTagsTitle: string;
  schemeNotFound: string;
  viewGisRoute: string;
  eligibleVenturesTitle: string;
  mandatoryDocsTitle: string;
  maxAssistance: string;
  interestRate: string;
  tenure: string;
  moratorium: string;
  officialGuidelines: string;
}

const DISCOVERY_UI_TEXT: Record<string, LocalizedDiscoveryUI> = {
  en: {
    tabGuide: 'Guide for Your Scheme',
    tabGuideDesc: 'Step-by-step personalized eligibility advisor',
    tabDirect: 'Enter Your Scheme Name Here',
    tabDirectDesc: 'Direct search & instant loan scheme guidelines',
    genderQuestion: 'Choose Your Gender',
    genderSubtitle: 'Question 1 of 5 • Unlocks female interest rebates and women entrepreneur benefits',
    genderFemale: 'Female',
    genderMale: 'Male',
    genderOther: 'Other',
    femaleRebateNotice: 'Female applicants receive 0.5% p.a. interest rebate on Education Loans (6.0% net) and priority access to Mahila Samriddhi micro-finance.',
    femaleExclusiveBadge: '0.5% Interest Rebate + Mahila Samriddhi Scheme',
    purposeQuestion: 'Select Your Loan Category / Purpose',
    purposeSubtitle: 'Question 2 of 5 • Choose from official NSFDC concessional loan sectors',
    purposeBusiness: 'Small Business & Self-Employment',
    purposeBusinessDesc: 'Retail shops, micro-enterprises, village crafts & commercial trade (MFS, TLS, UNY, AMY)',
    purposeEducation: 'Higher & Technical Education',
    purposeEducationDesc: 'Professional courses: Engineering, Medical, MBA, MCA, Law & 25 recognized degrees (ELS)',
    purposeGreen: 'Green Business Scheme',
    purposeGreenDesc: 'Solar power, e-rickshaws, battery-operated transport, bio-gas & clean technologies (GBS)',
    purposeAgri: 'Agriculture & Allied Activities',
    purposeAgriDesc: 'Dairy farming, poultry, tractors, fisheries, honey production & agro-processing (TLS, MFS)',
    purposeTransport: 'Transport & Commercial Vehicles',
    purposeTransportDesc: 'Passenger auto, taxi, e-rickshaw, light commercial mini-truck & goods transport (TLS, GBS, UNY)',
    directSearchPlaceholder: 'Type scheme code or name (e.g., AMY, ELS, Green Business, Term Loan, Mahila Samriddhi)...',
    quickTagsTitle: 'Quick Select Scheme:',
    schemeNotFound: 'No matching scheme found. Please try searching for MFS, AMY, TLS, UNY, ELS, or GBS.',
    viewGisRoute: 'Locate Authorized Channel Partner Banks (GIS Map)',
    eligibleVenturesTitle: 'Eligible Ventures & Activities Under This Scheme',
    mandatoryDocsTitle: 'Mandatory Verification Checklist',
    maxAssistance: 'Maximum Loan Limit',
    interestRate: 'Beneficiary Interest Rate',
    tenure: 'Repayment Tenure',
    moratorium: 'Moratorium Period',
    officialGuidelines: 'Official NSFDC Guidelines'
  },
  hi: {
    tabGuide: 'योजना मार्गदर्शन (गाइड)',
    tabGuideDesc: 'चरण-दर-चरण व्यक्तिगत पात्रता सलाहकार',
    tabDirect: 'अपनी योजना का नाम यहाँ दर्ज करें',
    tabDirectDesc: 'त्वरित खोज एवं प्रत्यक्ष योजना विवरण व दिशानिर्देश',
    genderQuestion: 'अपना लिंग चुनें (Choose Your Gender)',
    genderSubtitle: 'प्रश्न 1/5 • महिला ब्याज छूट व विशेष महिला उद्यमी लाभ अनलॉक करें',
    genderFemale: 'महिला (Female)',
    genderMale: 'पुरुष (Male)',
    genderOther: 'अन्य (Other)',
    femaleRebateNotice: 'महिला आवेदकों को शिक्षा ऋण पर 0.5% वार्षिक ब्याज छूट (प्रभावी 6.0%) और महिला समृद्धि योजना में सीधी प्राथमिकता मिलती है।',
    femaleExclusiveBadge: '0.5% ब्याज छूट + महिला समृद्धि योजना',
    purposeQuestion: 'ऋण की श्रेणी अथवा उद्देश्य चुनें',
    purposeSubtitle: 'प्रश्न 2/5 • एनएसएफडीसी की आधिकारिक रियायती ऋण श्रेणियों में से चुनें',
    purposeBusiness: 'लघु व्यवसाय एवं स्वरोजगार',
    purposeBusinessDesc: 'खुदरा दुकान, सूक्ष्म उद्यम, कारीगरी, व्यापार व आजीविका इकाइयां (MFS, TLS, UNY, AMY)',
    purposeEducation: 'उच्च एवं तकनीकी शिक्षा',
    purposeEducationDesc: 'व्यावसायिक पाठ्यक्रम: इंजीनियरिंग, मेडिकल, एमबीए, कानून व 25 मान्यता प्राप्त डिग्री (ELS)',
    purposeGreen: 'ग्रीन बिजनेस योजना (पर्यावरण अनुकूल)',
    purposeGreenDesc: 'सौर ऊर्जा, ई-रिक्शा, बैटरी चालित वाहन, बायोगैस व हरित तकनीक (GBS)',
    purposeAgri: 'कृषि एवं संबद्ध गतिविधियाँ',
    purposeAgriDesc: 'डेयरी फार्मिंग, मुर्गी पालन, ट्रैक्टर, मत्स्य पालन, मधुमक्खी पालन व कृषि प्रसंस्करण (TLS, MFS)',
    purposeTransport: 'परिवहन एवं व्यावसायिक वाहन',
    purposeTransportDesc: 'सवारी ऑटो, टैक्सी, ई-रिक्शा, छोटा हाथी (मिनी-ट्रक) व मालवाहक वाहन (TLS, GBS, UNY)',
    directSearchPlaceholder: 'योजना कोड या नाम दर्ज करें (उदा. AMY, ELS, Green Business, मियादी ऋण, महिला समृद्धि)...',
    quickTagsTitle: 'त्वरित योजना चुनें:',
    schemeNotFound: 'कोई योजना नहीं मिली। कृपया MFS, AMY, TLS, UNY, ELS या GBS खोजें।',
    viewGisRoute: 'जीआईएस मानचित्र पर अधिकृत चैनल पार्टनर बैंक शाखाएं देखें',
    eligibleVenturesTitle: 'इस योजना के अंतर्गत पात्र उद्यम एवं गतिविधियां',
    mandatoryDocsTitle: 'आवश्यक सत्यापन दस्तावेज सूची',
    maxAssistance: 'अधिकतम ऋण सीमा',
    interestRate: 'लाभार्थी ब्याज दर',
    tenure: 'चुकौती अवधि',
    moratorium: 'छूट (मोरेटोरियम) अवधि',
    officialGuidelines: 'एनएसएफडीसी आधिकारिक दिशानिर्देश'
  },
  bn: {
    tabGuide: 'আপনার স্কিম নির্দেশিকা',
    tabGuideDesc: 'ধাপে ধাপে ব্যক্তিগতকৃত যোগ্যতা নির্দেশিকা',
    tabDirect: 'এখানে আপনার স্কিমের নাম লিখুন',
    tabDirectDesc: 'সরাসরি অনুসন্ধান ও তাৎক্ষণিক ঋণ স্কিমের বিবরণ',
    genderQuestion: 'আপনার লিঙ্গ নির্বাচন করুন',
    genderSubtitle: 'প্রশ্ন ১/৫ • মহিলা সুদের ছাড় ও বিশেষ সুবিধা আনলক করুন',
    genderFemale: 'মহিলা',
    genderMale: 'পুরুষ',
    genderOther: 'অন্যান্য',
    femaleRebateNotice: 'মহিলা আবেদনকারীরা শিক্ষা ঋণে ০.৫% বার্ষিক সুদের ছাড় (কার্যকর ৬.০%) এবং মহিলা সমৃদ্ধি যোজনায় বিশেষ অগ্রাধিকার পান।',
    femaleExclusiveBadge: '০.৫% সুদের ছাড় + মহিলা সমৃদ্ধি যোজনা',
    purposeQuestion: 'আপনার ঋণের বিভাগ বা উদ্দেশ্য নির্বাচন করুন',
    purposeSubtitle: 'প্রশ্ন ২/৫ • এনএসএফডিসির সরকারি ঋণ বিভাগগুলি থেকে নির্বাচন করুন',
    purposeBusiness: 'ক্ষুদ্র ব্যবসা ও স্বনির্ভর উদ্যোগ',
    purposeBusinessDesc: 'খুচরা দোকান, গ্রামীণ কারুশিল্প, ক্ষুদ্র উদ্যোগ ও বাণিজ্য (MFS, TLS, UNY, AMY)',
    purposeEducation: 'উচ্চ ও কারিগরি শিক্ষা',
    purposeEducationDesc: 'পেশাদার পাঠ্যক্রম: ইঞ্জিনিয়ারিং, মেডিকেল, এমবিএ ও ২৫টি স্বীকৃত ডিগ্রি (ELS)',
    purposeGreen: 'গ্রিন বিজনেস যোজনা (পরিবেশ-বান্ধব)',
    purposeGreenDesc: 'সৌর শক্তি, ই-রিকশা, ব্যাটারি চালিত পরিবহন ও সবুজ প্রযুক্তি (GBS)',
    purposeAgri: 'কৃষি ও সহযোগী কার্যক্রম',
    purposeAgriDesc: 'ডেইরি ফার্মিং, পোল্ট্রি, ট্রাক্টর, মৎস্য চাষ ও কৃষি প্রক্রিয়াকরণ (TLS, MFS)',
    purposeTransport: 'পরিবহন ও বাণিজ্যিক যানবাহন',
    purposeTransportDesc: 'অটো-রিকশা, ট্যাক্সি, ই-রিকশা ও বাণিজ্যিক মিনি-ট্রাক (TLS, GBS, UNY)',
    directSearchPlaceholder: 'স্কিমের কোড বা নাম লিখুন (যেমন AMY, ELS, Green Business, টার্ম লোন)...',
    quickTagsTitle: 'দ্রুত স্কিম নির্বাচন:',
    schemeNotFound: 'কোনো স্কিম পাওয়া যায়নি। MFS, AMY, TLS, UNY, ELS বা GBS সন্ধান করুন।',
    viewGisRoute: 'জিআইএস ম্যাপে অনুমোদিত চ্যানেল পার্টনার ব্যাংকগুলি দেখুন',
    eligibleVenturesTitle: 'এই স্কিমের অধীনে যোগ্য উদ্যোগসমূহ',
    mandatoryDocsTitle: 'প্রয়োজনীয় নথিপত্রের তালিকা',
    maxAssistance: 'সর্বোচ্চ ঋণের পরিমাণ',
    interestRate: 'সুদের হার',
    tenure: 'পরিশোধের মেয়াদ',
    moratorium: 'মোরটোরিয়াম সময়কাল',
    officialGuidelines: 'এনএসএফডিসি অফিসিয়াল নির্দেশিকা'
  },
  mr: {
    tabGuide: 'तुमच्या योजनेसाठी मार्गदर्शक',
    tabGuideDesc: 'टप्प्याटप्प्याने वैयक्तिकृत पात्रता सल्लागार',
    tabDirect: 'तुमच्या योजनेचे नाव येथे प्रविष्ट करा',
    tabDirectDesc: 'थेट शोध आणि तत्काळ कर्ज योजना तपशील',
    genderQuestion: 'तुमचे लिंग निवडा',
    genderSubtitle: 'प्रश्न १/५ • महिला व्याज सवलत आणि महिला उद्योजक लाभ मिळवा',
    genderFemale: 'महिला',
    genderMale: 'पुरुष',
    genderOther: 'इतर',
    femaleRebateNotice: 'महिला अर्जदारांना शिक्षण कर्जावर ०.५% वार्षिक व्याज सवलत (निव्वळ ६.०%) आणि महिला समृद्धी योजनेत थेट प्राधान्य मिळते.',
    femaleExclusiveBadge: '०.५% व्याज सवलत + महिला समृद्धी योजना',
    purposeQuestion: 'कर्जाचा प्रकार किंवा उद्देश निवडा',
    purposeSubtitle: 'प्रश्न २/५ • अधिकृत एनएसएफडीसी सवलतीच्या कर्ज क्षेत्रांमधून निवडा',
    purposeBusiness: 'लहान व्यवसाय आणि स्वयंरोजगार',
    purposeBusinessDesc: 'किरकोळ दुकाने, सूक्ष्म उद्योग, ग्रामीण हस्तकला आणि व्यापार (MFS, TLS, UNY, AMY)',
    purposeEducation: 'उच्च आणि तांत्रिक शिक्षण',
    purposeEducationDesc: 'व्यावसायिक अभ्यासक्रम: अभियांत्रिकी, वैद्यकीय, एमबीए व २५ मान्यताप्राप्त पदव्या (ELS)',
    purposeGreen: 'ग्रीन बिझनेस योजना (पर्यावरणस्नेही)',
    purposeGreenDesc: 'सौर ऊर्जा, ई-रिक्षा, बॅटरीवर चालणारी वाहने व हरित तंत्रज्ञान (GBS)',
    purposeAgri: 'कृषी आणि संलग्न उपक्रम',
    purposeAgriDesc: 'दुग्धव्यवसाय, पोल्ट्री, ट्रॅक्टर, मत्स्यपालन आणि कृषी प्रक्रिया (TLS, MFS)',
    purposeTransport: 'वाहतूक आणि व्यावसायिक वाहने',
    purposeTransportDesc: 'प्रवासी रिक्षा, टॅक्सी, ई-रिक्षा, मिनी-ट्रक आणि व्यावसायिक मालवाहू वाहने (TLS, GBS, UNY)',
    directSearchPlaceholder: 'योजना कोड किंवा नाव प्रविष्ट करा (उदा. AMY, ELS, Green Business, मुदत कर्ज)...',
    quickTagsTitle: 'जलद योजना निवडा:',
    schemeNotFound: 'कोणतीही योजना आढळली नाही. कृपया MFS, AMY, TLS, UNY, ELS किंवा GBS शोधा.',
    viewGisRoute: 'जीआयएस नकाशावर अधिकृत बँक भागीदार शाखा पहा',
    eligibleVenturesTitle: 'या योजनेअंतर्गत पात्र उद्योग व व्यवसाय',
    mandatoryDocsTitle: 'आवश्यक कागदपत्रांची पडताळणी यादी',
    maxAssistance: 'कमाल कर्ज मर्यादा',
    interestRate: 'लाभार्थी व्याजदर',
    tenure: 'परतफेड कालावधी',
    moratorium: 'सवलत (मोरेटोरियम) कालावधी',
    officialGuidelines: 'एनएसएफडीसी अधिकृत मार्गदर्शक तत्त्वे'
  },
  te: {
    tabGuide: 'మీ పథకం కొరకు గైడ్',
    tabGuideDesc: 'దశలవారీగా వ్యక్తిగతీకరించిన అర్హత సలహాదారు',
    tabDirect: 'మీ పథకం పేరును ఇక్కడ నమోదు చేయండి',
    tabDirectDesc: 'ప్రత్యక్ష శోధన మరియు తక్షణ పథకం మార్గదర్శకాలు',
    genderQuestion: 'మీ లింగాన్ని ఎంచుకోండి',
    genderSubtitle: 'ప్రశ్న 1/5 • మహిళల వడ్డీ రాయితీ మరియు మహిళా సాధికారత ప్రయోజనాలు',
    genderFemale: 'మహిళ',
    genderMale: 'పురుషుడు',
    genderOther: 'ఇతర',
    femaleRebateNotice: 'మహిళా దరఖాస్తుదారులకు విద్యా రుణాలపై 0.5% వార్షిక వడ్డీ రాయితీ (నికర 6.0%) మరియు మహిళా సమృద్ధి పథకంలో ప్రాధాన్యత లభిస్తుంది.',
    femaleExclusiveBadge: '0.5% వడ్డీ రాయితీ + మహిళా సమృద్ధి పథకం',
    purposeQuestion: 'మీ రుణ విభాగం లేదా ఉద్దేశాన్ని ఎంచుకోండి',
    purposeSubtitle: 'ప్రశ్న 2/5 • అధికారిక ఎన్‌ఎస్‌ఎఫ్‌డిసి రాయితీ రుణ వర్గాల నుండి ఎంచుకోండి',
    purposeBusiness: 'చిన్న వ్యాపారం మరియు స్వయం ఉపాధి',
    purposeBusinessDesc: 'రిటైల్ దుకాణాలు, చేతివృత్తులు, సూక్ష్మ వ్యాపారాలు మరియు వాణిజ్యం (MFS, TLS, UNY, AMY)',
    purposeEducation: 'ఉన్నత మరియు సాంకేతిక విద్య',
    purposeEducationDesc: 'వృత్తి విద్యా కోర్సులు: ఇంజనీరింగ్, మెడిసిన్, ఎంబీఏ మరియు 25 గుర్తింపు పొందిన డిగ్రీలు (ELS)',
    purposeGreen: 'గ్రీన్ బిజినెస్ పథకం',
    purposeGreenDesc: 'సౌర విద్యుత్, ఇ-రిక్షాలు, బ్యాటరీ వాహనాలు మరియు బయో-గ్యాస్ (GBS)',
    purposeAgri: 'వ్యవసాయం మరియు అనుబంధ కార్యకలాపాలు',
    purposeAgriDesc: 'పాడి పరిశ్రమ, పౌల్ట్రీ, ట్రాక్టర్లు, మత్స్య పరిశ్రమ మరియు అగ్రో ప్రాసెసింగ్ (TLS, MFS)',
    purposeTransport: 'రవాణా మరియు వాణిజ్య వాహనాలు',
    purposeTransportDesc: 'ఆటో రిక్షా, టాక్సీ, ఇ-రిక్షా, మినీ ట్రక్ మరియు వస్తు రవాణా వాహనాలు (TLS, GBS, UNY)',
    directSearchPlaceholder: 'పథకం కోడ్ లేదా పేరు నమోదు చేయండి (ఉదా. AMY, ELS, Green Business, టర్మ్ లోన్)...',
    quickTagsTitle: 'త్వరిత పథక ఎంపిక:',
    schemeNotFound: 'ఎటువంటి పథకం కనుగొనబడలేదు. MFS, AMY, TLS, UNY, ELS లేదా GBS వెతకండి.',
    viewGisRoute: 'జీఐఎస్ మ్యాప్‌లో అధికారిక భాగస్వామ్య బ్యాంకులను కనుగొనండి',
    eligibleVenturesTitle: 'ఈ పథకం కింద అర్హతగల వెంచర్లు & కార్యకలాపాలు',
    mandatoryDocsTitle: 'తప్పనిసరి ధృవీకరణ పత్రాల జాబితా',
    maxAssistance: 'గరిష్ట రుణ పరిమితి',
    interestRate: 'లబ్ధిదారుల వడ్డీ రేటు',
    tenure: 'తిరిగి చెల్లించే వ్యవధి',
    moratorium: 'మొరటోరియం కాలం',
    officialGuidelines: 'ఎన్‌ఎస్‌ఎఫ్‌డిసి అధికారిక మార్గదర్శకాలు'
  },
  ta: {
    tabGuide: 'உங்கள் திட்டத்திற்கான வழிகாட்டி',
    tabGuideDesc: 'படி படியான தனிப்பயனாக்கப்பட்ட தகுதி வழிகாட்டி',
    tabDirect: 'உங்கள் திட்டத்தின் பெயரை இங்கே உள்ளிடவும்',
    tabDirectDesc: 'நேரடி தேடல் மற்றும் உடனடி கடன் திட்ட வழிகாட்டுதல்கள்',
    genderQuestion: 'உங்கள் பாலினத்தைத் தேர்வுசெய்க',
    genderSubtitle: 'கேள்வி 1/5 • பெண்களுக்கான வட்டி தள்ளுபடி மற்றும் சிறப்பு சலுகைகள்',
    genderFemale: 'பெண்',
    genderMale: 'ஆண்',
    genderOther: 'மற்றவை',
    femaleRebateNotice: 'பெண் விண்ணப்பதாரர்களுக்கு கல்வி கடனில் 0.5% வருடாந்திர வட்டி தள்ளுபடி (நிகர 6.0%) மற்றும் மகிளா சம்ரித்தி திட்டத்தில் முன்னுரிமை கிடைக்கும்.',
    femaleExclusiveBadge: '0.5% வட்டி தள்ளுபடி + மகிளா சம்ரித்தி திட்டம்',
    purposeQuestion: 'உங்கள் கடன் பிரிவு அல்லது நோக்கத்தைத் தேர்வுசெய்க',
    purposeSubtitle: 'கேள்வி 2/5 • அதிகாரப்பூர்வ NSFDC சலுகைக் கடன் பிரிவுகளிலிருந்து தேர்வு செய்க',
    purposeBusiness: 'சிறு தொழில் மற்றும் சுயதொழில்',
    purposeBusinessDesc: 'சில்லறை கடைகள், குறுந்தொழில்கள், கைவினைப்பொருட்கள் மற்றும் வர்த்தகம் (MFS, TLS, UNY, AMY)',
    purposeEducation: 'உயர் மற்றும் தொழில்சார் கல்வி',
    purposeEducationDesc: 'பொறியியல், மருத்துவம், எம்பிஏ, சட்டம் மற்றும் 25 அங்கீகரிக்கப்பட்ட பட்டப்படிப்புகள் (ELS)',
    purposeGreen: 'பசுமை வணிகத் திட்டம் (Green Business)',
    purposeGreenDesc: 'சூரிய சக்தி, மின்-ரிக்‌ஷா, பேட்டரி வாகனங்கள் மற்றும் பசுமை தொழில்நுட்பங்கள் (GBS)',
    purposeAgri: 'விவசாயம் மற்றும் சார்பு தொழில்கள்',
    purposeAgriDesc: 'பால் பண்ணை, கோழி பண்ணை, டிராக்டர், மீன்வளர்ப்பு மற்றும் வேளாண் செயலாக்கம் (TLS, MFS)',
    purposeTransport: 'போக்குவரத்து மற்றும் வணிக வாகனங்கள்',
    purposeTransportDesc: 'ஆட்டோ ரிக்‌ஷா, டாக்ஸி, மின்-ரிக்‌ஷா மற்றும் வணிக மினி லாரிகள் (TLS, GBS, UNY)',
    directSearchPlaceholder: 'திட்டத்தின் குறியீடு அல்லது பெயரை உள்ளிடவும் (எ.கா. AMY, ELS, Green Business, டேர்ம் லோன்)...',
    quickTagsTitle: 'விரைவு திட்டத் தேர்வு:',
    schemeNotFound: 'திட்டம் எதுவும் கிடைக்கவில்லை. MFS, AMY, TLS, UNY, ELS அல்லது GBS என தேடவும்.',
    viewGisRoute: 'ஜிஐஎஸ் வரைபடத்தில் அங்கீகரிக்கப்பட்ட வங்கி கிளைகளைக் காண்க',
    eligibleVenturesTitle: 'இத்திட்டத்தின் கீழ் தகுதியான தொழில்கள்',
    mandatoryDocsTitle: 'தேவையான சரிபார்ப்பு ஆவணங்களின் பட்டியல்',
    maxAssistance: 'அதிகபட்ச கடன் வரம்பு',
    interestRate: 'வட்டி விகிதம்',
    tenure: 'திருப்பிச் செலுத்தும் காலம்',
    moratorium: 'விலக்கு காலம் (Moratorium)',
    officialGuidelines: 'NSFDC அதிகாரப்பூர்வ வழிகாட்டுதல்கள்'
  },
  gu: {
    tabGuide: 'તમારી યોજના માટે માર્ગદર્શિકા',
    tabGuideDesc: 'પગલાવાર વ્યક્તિગત પાત્રતા સલાહકાર',
    tabDirect: 'તમારી યોજનાનું નામ અહીં દાખલ કરો',
    tabDirectDesc: 'સીધી શોધ અને ત્વરિત લોન યોજના માર્ગદર્શિકા',
    genderQuestion: 'તમારું જાતિ પસંદ કરો (Choose Your Gender)',
    genderSubtitle: 'પ્રશ્ન ૧/૫ • મહિલા વ્યાજ છૂટ અને વિશેષ મહિલા લાભો મેળવો',
    genderFemale: 'મહિલા',
    genderMale: 'પુરુષ',
    genderOther: 'અન્ય',
    femaleRebateNotice: 'મહિલા અરજદારોને શિક્ષણ લોન પર ૦.૫% વાર્ષિક વ્યાજ છૂટ (ચોખ્ખું ૬.૦%) અને મહિલા સમૃદ્ધિ યોજનામાં સીધી પ્રાથમિકતા મળે છે.',
    femaleExclusiveBadge: '૦.૫% વ્યાજ છૂટ + મહિલા સમૃદ્ધિ યોજના',
    purposeQuestion: 'તમારી લોન શ્રેણી અથવા હેતુ પસંદ કરો',
    purposeSubtitle: 'પ્રશ્ન ૨/૫ • અધિકૃત NSFDC રાહત લોન ક્ષેત્રોમાંથી પસંદ કરો',
    purposeBusiness: 'નાના વ્યવસાય અને સ્વરોજગાર',
    purposeBusinessDesc: 'છૂટક દુકાનો, સૂક્ષ્મ ઉદ્યોગો, ગ્રામીણ હસ્તકલા અને વેપાર (MFS, TLS, UNY, AMY)',
    purposeEducation: 'ઉચ્ચ અને તકનીકી શિક્ષણ',
    purposeEducationDesc: 'વ્યાવસાયિક અભ્યાસક્રમો: એન્જિનિયરિંગ, મેડિકલ, એમબીએ અને ૨૫ માન્ય ડિગ્રી (ELS)',
    purposeGreen: 'ગ્રીન બિઝનેસ યોજના',
    purposeGreenDesc: 'સોલાર પાવર, ઈ-રિક્ષા, બેટરી સંચાલિત વાહનો અને બાયો-ગેસ (GBS)',
    purposeAgri: 'કૃષિ અને સંલગ્ન પ્રવૃત્તિઓ',
    purposeAgriDesc: 'ડેરી ફાર્મિંગ, મરઘા પાલન, ટ્રેક્ટર, મત્સ્યપાલન અને કૃષિ પ્રક્રિયા (TLS, MFS)',
    purposeTransport: 'પરિવહન અને વ્યાવસાયિક વાહનો',
    purposeTransportDesc: 'ઓટો રિક્ષા, ટેક્સી, ઈ-રિક્ષા અને કોમર્શિયલ મિની-ટ્રક (TLS, GBS, UNY)',
    directSearchPlaceholder: 'યોજનાનો કોડ અથવા નામ લખો (જેમ કે AMY, ELS, Green Business, ટર્મ લોન)...',
    quickTagsTitle: 'ઝડપી યોજના પસંદગી:',
    schemeNotFound: 'કોઈ યોજના મળી નથી. કૃપા કરીને MFS, AMY, TLS, UNY, ELS અથવા GBS શોધો.',
    viewGisRoute: 'જીઆઈએસ નકશા પર અધિકૃત ચેનલ પાર્ટનર બેંકો જુઓ',
    eligibleVenturesTitle: 'આ યોજના હેઠળ પાત્ર વ્યવસાયો',
    mandatoryDocsTitle: 'જરૂરી ચકાસણી દસ્તાવેજોની યાદી',
    maxAssistance: 'મહત્તમ લોન મર્યાદા',
    interestRate: 'લાભાર્થી વ્યાજ દર',
    tenure: 'ચુકવણી સમયગાળો',
    moratorium: 'મોરેટોરિયમ સમયગાળો',
    officialGuidelines: 'NSFDC અધિકૃત માર્ગદર્શિકા'
  },
  kn: {
    tabGuide: 'ನಿಮ್ಮ ಯೋಜನೆಗಾಗಿ ಮಾರ್ಗದರ್ಶಿ',
    tabGuideDesc: 'ಹಂತ-ಹಂತದ ವೈಯಕ್ತಿಕ ಅರ್ಹತಾ ಸಲಹೆಗಾರ',
    tabDirect: 'ನಿಮ್ಮ ಯೋಜನೆಯ ಹೆಸರನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ',
    tabDirectDesc: 'ನೇರ ಹುಡುಕಾಟ ಮತ್ತು ತಕ್ಷಣದ ಸಾಲ ಯೋಜನೆ ಮಾರ್ಗದರ್ಶಿ',
    genderQuestion: 'ನಿಮ್ಮ ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    genderSubtitle: 'ಪ್ರಶ್ನೆ ೧/೫ • ಮಹಿಳೆಯರ ಬಡ್ಡಿ ರಿಯಾಯಿತಿ ಮತ್ತು ವಿಶೇಷ ಸೌಲಭ್ಯಗಳನ್ನು ಪಡೆಯಿರಿ',
    genderFemale: 'ಮಹಿಳೆ',
    genderMale: 'ಪುರುಷ',
    genderOther: 'ಇತರ',
    femaleRebateNotice: 'ಮಹಿಳಾ ಅರ್ಜಿದಾರರಿಗೆ ಶಿಕ್ಷಣ ಸಾಲದಲ್ಲಿ ೦.೫% ವಾರ್ಷಿಕ ಬಡ್ಡಿ ರಿಯಾಯಿತಿ (ನಿವ್ವಳ ೬.೦%) ಮತ್ತು ಮಹಿಳಾ ಸಮೃದ್ಧಿ ಯೋಜನೆಯಲ್ಲಿ ವಿಶೇಷ ಆದ್ಯತೆ ಲಭಿಸುತ್ತದೆ.',
    femaleExclusiveBadge: '೦.೫% ಬಡ್ಡಿ ರಿಯಾಯಿತಿ + ಮಹಿಳಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ',
    purposeQuestion: 'ನಿಮ್ಮ ಸಾಲದ ವರ್ಗ ಅಥವಾ ಉದ್ದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    purposeSubtitle: 'ಪ್ರಶ್ನೆ ೨/೫ • ಅಧಿಕೃತ NSFDC ರಿಯಾಯಿತಿ ಸಾಲ ಕ್ಷೇತ್ರಗಳಿಂದ ಆರಿಸಿ',
    purposeBusiness: 'ಸಣ್ಣ ವ್ಯಾಪಾರ ಮತ್ತು ಸ್ವಯಂ ಉದ್ಯೋಗ',
    purposeBusinessDesc: 'ಚಿಲ್ಲರೆ ಅಂಗಡಿಗಳು, ಸೂಕ್ಷ್ಮ ಉದ್ಯಮಗಳು, ಕುಶಲಕರ್ಮಿಗಳು ಮತ್ತು ವ್ಯಾಪಾರ (MFS, TLS, UNY, AMY)',
    purposeEducation: 'ಉನ್ನತ ಮತ್ತು ತಾಂತ್ರಿಕ ಶಿಕ್ಷಣ',
    purposeEducationDesc: 'ವೃತ್ತಿಪರ ಕೋರ್ಸ್‌ಗಳು: ಎಂಜಿನಿಯರಿಂಗ್, ವೈದ್ಯಕೀಯ, ಎಂಬಿಎ ಮತ್ತು ೨೫ ಮಾನ್ಯತೆ ಪಡೆದ ಪದವಿಗಳು (ELS)',
    purposeGreen: 'ಹಸಿರು ವ್ಯಾಪಾರ ಯೋಜನೆ (Green Business)',
    purposeGreenDesc: 'ಸೌರಶಕ್ತಿ, ಇ-ರಿಕ್ಷಾ, ಬ್ಯಾಟರಿ ವಾಹನಗಳು ಮತ್ತು ಜೈವಿಕ ಅನಿಲ (GBS)',
    purposeAgri: 'ಕೃಷಿ ಮತ್ತು ಸಂಬಂಧಿತ ಚಟುವಟಿಕೆಗಳು',
    purposeAgriDesc: 'ಡೈರಿ ಫಾರ್ಮಿಂಗ್, ಕೋಳಿ ಸಾಕಣೆ, ಟ್ರ್ಯಾಕ್ಟರ್, ಮೀನುಗಾರಿಕೆ ಮತ್ತು ಕೃಷಿ ಸಂಸ್ಕರಣೆ (TLS, MFS)',
    purposeTransport: 'ಸಾರಿಗೆ ಮತ್ತು ವಾಣಿಜ್ಯ ವಾಹನಗಳು',
    purposeTransportDesc: 'ಆಟೋ ರಿಕ್ಷಾ, ಟ್ಯಾಕ್ಸಿ, ಇ-ರಿಕ್ಷಾ ಮತ್ತು ವಾಣಿಜ್ಯ ಮಿನಿ-ಟ್ರಕ್ (TLS, GBS, UNY)',
    directSearchPlaceholder: 'ಯೋಜನೆಯ ಕೋಡ್ ಅಥವಾ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ. AMY, ELS, Green Business, ಟರ್ಮ್ ಲೋನ್)...',
    quickTagsTitle: 'ತ್ವರಿತ ಯೋಜನೆ ಆಯ್ಕೆ:',
    schemeNotFound: 'ಯಾವುದೇ ಯೋಜನೆ ಕಂಡುಬಂದಿಲ್ಲ. MFS, AMY, TLS, UNY, ELS ಅಥವಾ GBS ಹುಡುಕಿ.',
    viewGisRoute: 'ಜಿಐಎಸ್ ನಕ್ಷೆಯಲ್ಲಿ ಅಧಿಕೃತ ಪಾಲುದಾರ ಬ್ಯಾಂಕ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    eligibleVenturesTitle: 'ಈ ಯೋಜನೆಯಡಿ ಅರ್ಹ ಉದ್ಯಮಗಳು',
    mandatoryDocsTitle: 'ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',
    maxAssistance: 'ಗರಿಷ್ಠ ಸಾಲ ಮಿತಿ',
    interestRate: 'ಬಡ್ಡಿ ದರ',
    tenure: 'ಮರುಪಾವತಿ ಅವಧಿ',
    moratorium: 'ರಿಯಾಯಿತಿ (ಮೊರಟೋರಿಯಂ) ಅವಧಿ',
    officialGuidelines: 'NSFDC ಅಧಿಕೃತ ಮಾರ್ಗದರ್ಶಿ ಸೂತ್ರಗಳು'
  },
  ml: {
    tabGuide: 'നിങ്ങളുടെ പദ്ധതിക്കുള്ള വഴികാട്ടി',
    tabGuideDesc: 'ഘട്ടം ഘട്ടമായുള്ള വ്യക്തിഗത യോഗ്യതാ ഉപദേശകൻ',
    tabDirect: 'നിങ്ങളുടെ പദ്ധതിയുടെ പേര് ഇവിടെ നൽകുക',
    tabDirectDesc: 'നേരിട്ടുള്ള തിരച്ചിലും തൽക്ഷണ പദ്ധതി വിവരങ്ങളും',
    genderQuestion: 'നിങ്ങളുടെ ലിംഗം തിരഞ്ഞെടുക്കുക',
    genderSubtitle: 'ചോദ്യം 1/5 • വനിതാ പലിശ ഇളവും സംരംഭക ആനുകൂല്യങ്ങളും',
    genderFemale: 'സ്ത്രീ',
    genderMale: 'പുരുഷൻ',
    genderOther: 'മറ്റുള്ളവ',
    femaleRebateNotice: 'വനിതാ അപേക്ഷകർക്ക് വിദ്യാഭ്യാസ വായ്പയിൽ 0.5% വാർഷിക പലിശ ഇളവും (നെറ്റ് 6.0%) മഹിളാ സമൃദ്ധി യോജനയിൽ മുൻഗണനയും ലഭിക്കും.',
    femaleExclusiveBadge: '0.5% പലിശ ഇളവ് + മഹിളാ സമൃദ്ധി യോജന',
    purposeQuestion: 'വായ്പാ വിഭാഗമോ ലക്ഷ്യമോ തിരഞ്ഞെടുക്കുക',
    purposeSubtitle: 'ചോദ്യം 2/5 • ഔദ്യോഗിക NSFDC ഇളവ് വായ്പാ മേഖലകളിൽ നിന്ന് തിരഞ്ഞെടുക്കുക',
    purposeBusiness: 'ചെറുകിട ബിസിനസും സ്വയംതൊഴിലും',
    purposeBusinessDesc: 'റീട്ടെയിൽ കടകൾ, സൂക്ഷ്മ സംരംഭങ്ങൾ, ഗ്രാമീണ കരകൗശലം, വ്യാപാരം (MFS, TLS, UNY, AMY)',
    purposeEducation: 'ഉന്നത സാങ്കേതിക വിദ്യാഭ്യാസം',
    purposeEducationDesc: 'പ്രൊഫഷണൽ കോഴ്സുകൾ: എൻജിനീയറിങ്, മെഡിക്കൽ, എം.ബി.എ, അംഗീകൃത ബിരുദങ്ങൾ (ELS)',
    purposeGreen: 'ഗ്രീൻ ബിസിനസ് സ്കീം (പരിസ്ഥിതി സൗഹൃദം)',
    purposeGreenDesc: 'സൗരോർജ്ജം, ഇ-റിക്ഷ, ബാറ്ററി വാഹനങ്ങൾ, ബയോഗ്യാസ് (GBS)',
    purposeAgri: 'കൃഷിയും അനുബന്ധ പ്രവർത്തനങ്ങളും',
    purposeAgriDesc: 'ക്ഷീരകൃഷി, കോഴിവളർത്തൽ, ട്രാക്ടർ, മത്സ്യകൃഷി, കാർഷിക സംസ്കരണം (TLS, MFS)',
    purposeTransport: 'ഗതാഗതവും വാണിജ്യ വാഹനങ്ങളും',
    purposeTransportDesc: 'ഓട്ടോറിക്ഷ, ടാക്സി, ഇ-റിക്ഷ, വാണിജ്യ മിനി ട്രക്കുകൾ (TLS, GBS, UNY)',
    directSearchPlaceholder: 'സ്കീം കോഡോ പേരോ നൽകുക (ഉദാ. AMY, ELS, Green Business, ടേം ലോൺ)...',
    quickTagsTitle: 'പെട്ടെന്ന് സ്കീം തിരഞ്ഞെടുക്കുക:',
    schemeNotFound: 'പദ്ധതികൾ ഒന്നും കണ്ടെത്തിയില്ല. MFS, AMY, TLS, UNY, ELS അല്ലെങ്കിൽ GBS തിരയുക.',
    viewGisRoute: 'ജിഐഎസ് ഭൂപടത്തിൽ അംഗീകൃത പങ്കാളി ബാങ്കുകൾ കാണുക',
    eligibleVenturesTitle: 'ഈ പദ്ധതിക്ക് കീഴിലുള്ള യോഗ്യമായ സംരംഭങ്ങൾ',
    mandatoryDocsTitle: 'ആവശ്യമായ പരിശോധനാ രേഖകളുടെ പട്ടിക',
    maxAssistance: 'പരമാവധി വായ്പാ പരിധി',
    interestRate: 'പലിശ നിരക്ക്',
    tenure: 'തിരിച്ചടവ് കാലാവധി',
    moratorium: 'മൊറട്ടോറിയം കാലയളവ്',
    officialGuidelines: 'NSFDC ഔദ്യോഗിക മാർഗ്ഗനിർദ്ദേശങ്ങൾ'
  },
  pa: {
    tabGuide: 'ਤੁਹਾਡੀ ਸਕੀਮ ਲਈ ਮਾਰਗਦਰਸ਼ਕ',
    tabGuideDesc: 'ਕਦਮ-ਦਰ-ਕਦਮ ਨਿੱਜੀ ਯੋਗਤਾ ਸਲਾਹਕਾਰ',
    tabDirect: 'ਇੱਥੇ ਆਪਣੀ ਸਕੀਮ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    tabDirectDesc: 'ਸਿੱਧੀ ਖੋਜ ਅਤੇ ਤੁਰੰਤ ਕਰਜ਼ਾ ਸਕੀਮ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼',
    genderQuestion: 'ਆਪਣਾ ਲਿੰਗ ਚੁਣੋ',
    genderSubtitle: 'ਸਵਾਲ 1/5 • ਮਹਿਲਾ ਵਿਆਜ ਛੋਟ ਅਤੇ ਵਿਸ਼ੇਸ਼ ਲਾਭ ਪ੍ਰਾਪਤ ਕਰੋ',
    genderFemale: 'ਮਹਿਲਾ',
    genderMale: 'ਪੁਰਸ਼',
    genderOther: 'ਹੋਰ',
    femaleRebateNotice: 'ਮਹਿਲਾ ਬਿਨੈਕਾਰਾਂ ਨੂੰ ਸਿੱਖਿਆ ਕਰਜ਼ੇ ਤੇ 0.5% ਸਾਲਾਨਾ ਵਿਆਜ ਛੋਟ (ਨੈੱਟ 6.0%) ਅਤੇ ਮਹਿਲਾ ਸਮ੍ਰਿਧੀ ਯੋਜਨਾ ਵਿੱਚ ਵਿਸ਼ੇਸ਼ ਤਰਜੀਹ ਮਿਲਦੀ ਹੈ।',
    femaleExclusiveBadge: '0.5% ਵਿਆਜ ਛੋਟ + ਮਹਿਲਾ ਸਮ੍ਰਿਧੀ ਯੋਜਨਾ',
    purposeQuestion: 'ਆਪਣੀ ਕਰਜ਼ਾ ਸ਼੍ਰੇਣੀ ਜਾਂ ਉਦੇਸ਼ ਚੁਣੋ',
    purposeSubtitle: 'ਸਵਾਲ 2/5 • ਅਧਿਕਾਰਤ NSFDC ਰਿਆਇਤੀ ਕਰਜ਼ਾ ਖੇਤਰਾਂ ਵਿੱਚੋਂ ਚੁਣੋ',
    purposeBusiness: 'ਛੋਟਾ ਕਾਰੋਬਾਰ ਅਤੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ',
    purposeBusinessDesc: 'ਪਰਚੂਨ ਦੁਕਾਨਾਂ, ਛੋਟੇ ਉੱਦਮ, ਪੇਂਡੂ ਦਸਤਕਾਰੀ ਅਤੇ ਵਪਾਰ (MFS, TLS, UNY, AMY)',
    purposeEducation: 'ਉੱਚ ਅਤੇ ਤਕਨੀਕੀ ਸਿੱਖਿਆ',
    purposeEducationDesc: 'ਪੇਸ਼ੇਵਰ ਕੋਰਸ: ਇੰਜੀਨੀਅਰਿੰਗ, ਮੈਡੀਕਲ, ਐਮਬੀਏ ਅਤੇ 25 ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਡਿਗਰੀਆਂ (ELS)',
    purposeGreen: 'ਗ੍ਰੀਨ ਬਿਜ਼ਨਸ ਸਕੀਮ (ਵਾਤਾਵਰਣ ਅਨੁਕੂਲ)',
    purposeGreenDesc: 'ਸੂਰਜੀ ਊਰਜਾ, ਈ-ਰਿਕਸ਼ਾ, ਬੈਟਰੀ ਵਾਹਨ ਅਤੇ ਬਾਇਓ-ਗੈਸ (GBS)',
    purposeAgri: 'ਖੇਤੀਬਾੜੀ ਅਤੇ ਸਹਾਇਕ ਗਤੀਵਿਧੀਆਂ',
    purposeAgriDesc: 'ਡੇਅਰੀ ਫਾਰਮਿੰਗ, ਪੋਲਟਰੀ, ਟਰੈਕਟਰ, ਮੱਛੀ ਪਾਲਣ ਅਤੇ ਖੇਤੀਬਾੜੀ ਪ੍ਰੋਸੈਸਿੰਗ (TLS, MFS)',
    purposeTransport: 'ਆਵਾਜਾਈ ਅਤੇ ਵਪਾਰਕ ਵਾਹਨ',
    purposeTransportDesc: 'ਆਟੋ ਰਿਕਸ਼ਾ, ਟੈਕਸੀ, ਈ-ਰਿਕਸ਼ਾ ਅਤੇ ਵਪਾਰਕ ਮਿੰਨੀ ਟਰੱਕ (TLS, GBS, UNY)',
    directSearchPlaceholder: 'ਸਕੀਮ ਕੋਡ ਜਾਂ ਨਾਮ ਦਰਜ ਕਰੋ (ਜਿਵੇਂ ਕਿ AMY, ELS, Green Business, ਮਿਆਦੀ ਕਰਜ਼ਾ)...',
    quickTagsTitle: 'ਤੁਰੰਤ ਸਕੀਮ ਚੋਣ:',
    schemeNotFound: 'ਕੋਈ ਸਕੀਮ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ MFS, AMY, TLS, UNY, ELS ਜਾਂ GBS ਖੋਜੋ।',
    viewGisRoute: 'ਜੀਆਈਐਸ ਨਕਸ਼ੇ ਤੇ ਅਧਿਕਾਰਤ ਭਾਈਵਾਲ ਬੈਂਕ ਵੇਖੋ',
    eligibleVenturesTitle: 'ਇਸ ਸਕੀਮ ਤਹਿਤ ਯੋਗ ਉੱਦਮ',
    mandatoryDocsTitle: 'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ',
    maxAssistance: 'ਵੱਧ ਤੋਂ ਵੱਧ ਕਰਜ਼ਾ ਸੀਮਾ',
    interestRate: 'ਵਿਆਜ ਦਰ',
    tenure: 'ਮੁੜ ਅਦਾਇਗੀ ਦੀ ਮਿਆਦ',
    moratorium: 'ਮੋਰਟੋਰੀਅਮ ਮਿਆਦ',
    officialGuidelines: 'NSFDC ਅਧਿਕਾਰਤ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼'
  },
  or: {
    tabGuide: 'ଆପଣଙ୍କ ଯୋଜନା ପାଇଁ ମାର୍ଗଦର୍ଶକ',
    tabGuideDesc: 'ପର୍ଯ୍ୟାୟକ୍ରମେ ବ୍ୟକ୍ତିଗତ ଯୋଗ୍ୟତା ପରାମର୍ଶଦାତା',
    tabDirect: 'ଏଠାରେ ଆପଣଙ୍କ ଯୋଜନାର ନାମ ଦିଅନ୍ତୁ',
    tabDirectDesc: 'ସିଧାସଳଖ ସନ୍ଧାନ ଏବଂ ତୁରନ୍ତ ଋଣ ଯୋଜନା ନିର୍ଦ୍ଦେଶାବଳୀ',
    genderQuestion: 'ଆପଣଙ୍କ ଲିଙ୍ଗ ଚୟନ କରନ୍ତୁ',
    genderSubtitle: 'ପ୍ରଶ୍ନ ୧/୫ • ମହିଳା ସୁଧ ରିହାତି ଏବଂ ବିଶେଷ ସୁବିଧା',
    genderFemale: 'ମହିଳା',
    genderMale: 'ପୁରୁଷ',
    genderOther: 'ଅନ୍ୟାନ୍ୟ',
    femaleRebateNotice: 'ମହିଳା ଆବେଦନକାରୀଙ୍କୁ ଶିକ୍ଷା ଋଣ ଉପରେ ୦.୫% ବାର୍ଷିକ ସୁଧ ରିହାତି (ନିଟ୍ ୬.୦%) ଏବଂ ମହିଳା ସମୃଦ୍ଧି ଯୋଜନାରେ ଅଗ୍ରାଧିକାର ମିଳିଥାଏ।',
    femaleExclusiveBadge: '୦.୫% ସୁଧ ରିହାତି + ମହିଳା ସମୃଦ୍ଧି ଯୋଜନା',
    purposeQuestion: 'ଆପଣଙ୍କ ଋଣ ବର୍ଗ ବା ଉଦ୍ଦେଶ୍ୟ ଚୟନ କରନ୍ତୁ',
    purposeSubtitle: 'ପ୍ରଶ୍ନ ୨/୫ • ସରକାରୀ NSFDC ଋଣ କ୍ଷେତ୍ରଗୁଡ଼ିକ ମଧ୍ୟରୁ ବାଛନ୍ତୁ',
    purposeBusiness: 'କ୍ଷୁଦ୍ର ବ୍ୟବସାୟ ଓ ସ୍ୱରୋଜଗାର',
    purposeBusinessDesc: 'ଖୁଚୁରା ଦୋକାନ, କ୍ଷୁଦ୍ର ଉଦ୍ୟୋଗ, ଗ୍ରାମୀଣ ହସ୍ତଶିଳ୍ପ ଏବଂ ବ୍ୟବସାୟ (MFS, TLS, UNY, AMY)',
    purposeEducation: 'ଉଚ୍ଚ ଏବଂ ବୈଷୟିକ ଶିକ୍ଷା',
    purposeEducationDesc: 'ବୃତ୍ତିଗତ ପାଠ୍ୟକ୍ରମ: ଇଞ୍ଜିନିୟରିଂ, ମେଡିକାଲ୍, ଏମବିଏ ଏବଂ ୨୫ଟି ସ୍ୱୀକୃତିପ୍ରାପ୍ତ ଡିଗ୍ରୀ (ELS)',
    purposeGreen: 'ଗ୍ରୀନ୍ ବିଜନେସ୍ ଯୋଜନା (ପରିବେଶ ଅନୁକୂଳ)',
    purposeGreenDesc: 'ସୌର ଶକ୍ତି, ଇ-ରିକ୍ସା, ବ୍ୟାଟେରୀ ଚାଳିତ ଯାନ ଏବଂ ବାୟୋ-ଗ୍ୟାସ୍ (GBS)',
    purposeAgri: 'କୃଷି ଏବଂ ଆନୁସଙ୍ଗିକ କାର୍ଯ୍ୟକଳାପ',
    purposeAgriDesc: 'ଦୁଗ୍ଧ ଚାଷ, କୁକୁଡ଼ା ପାଳନ, ଟ୍ରାକ୍ଟର, ମତ୍ସ୍ୟ ଚାଷ ଏବଂ କୃଷି ପ୍ରକ୍ରିୟାକରଣ (TLS, MFS)',
    purposeTransport: 'ପରିବହନ ଏବଂ ବାଣିଜ୍ୟିକ ଯାନ',
    purposeTransportDesc: 'ଅଟୋ ରିକ୍ସା, ଟ୍ୟାକ୍ସି, ଇ-ରିକ୍ସା ଏବଂ ବାଣିଜ୍ୟିକ ମିନି ଟ୍ରକ୍ (TLS, GBS, UNY)',
    directSearchPlaceholder: 'ଯୋଜନା କୋଡ୍ ବା ନାମ ଲେଖନ୍ତୁ (ଯଥା AMY, ELS, Green Business, ଟର୍ମ ଋଣ)...',
    quickTagsTitle: 'ତୁରନ୍ତ ଯୋଜନା ଚୟନ:',
    schemeNotFound: 'କୌଣସି ଯୋଜନା ମିଳିଲା ନାହିଁ। ଦୟାକରି MFS, AMY, TLS, UNY, ELS ବା GBS ଖୋଜନ୍ତୁ।',
    viewGisRoute: 'ଜିଆଇଏସ୍ ମାନଚିତ୍ରରେ ଅଧିକୃତ ସହଯୋଗୀ ବ୍ୟାଙ୍କଗୁଡ଼ିକୁ ଦେଖନ୍ତୁ',
    eligibleVenturesTitle: 'ଏହି ଯୋଜନା ଅଧୀନରେ ଯୋଗ୍ୟ ଉଦ୍ୟୋଗ',
    mandatoryDocsTitle: 'ଆବଶ୍ୟକୀୟ ଯାଞ୍ଚ ଦଲିଲ ତାଲିକା',
    maxAssistance: 'ସର୍ବାଧିକ ଋଣ ସୀମା',
    interestRate: 'ସୁଧ ହାର',
    tenure: 'ପରିଶୋଧ ଅବଧି',
    moratorium: 'ମୋରାଟୋରିୟମ୍ ଅବଧି',
    officialGuidelines: 'NSFDC ସରକାରୀ ନିର୍ଦ୍ଦେଶାବଳୀ'
  },
  as: {
    tabGuide: 'আপোনাৰ আঁচনিৰ বাবে নিৰ্দেশিকা',
    tabGuideDesc: 'পৰ্যায়ক্ৰমে ব্যক্তিগত যোগ্যতা পৰামৰ্শদাতা',
    tabDirect: 'ইয়াত আপোনাৰ আঁচনিৰ নাম লিখক',
    tabDirectDesc: 'পোনপটীয়া সন্ধান আৰু তাৎক্ষণিক ঋণ আঁচনি নিৰ্দেশনা',
    genderQuestion: 'আপোনাৰ লিংগ বাছক',
    genderSubtitle: 'প্ৰশ্ন ১/৫ • মহিলাৰ সুত ৰেহাই আৰু বিশেষ সুবিধা লাভ কৰক',
    genderFemale: 'মহিলা',
    genderMale: 'পুৰুষ',
    genderOther: 'অন্যান্য',
    femaleRebateNotice: 'মহিলা আবেদনকাৰীয়ে শিক্ষা ঋণত ০.৫% বাৰ্ষিক সুত ৰেহাই (কার্যকৰী ৬.০%) আৰু মহিলা সমৃদ্ধি যোজনাত অগ্ৰাধিকাৰ পায়।',
    femaleExclusiveBadge: '০.৫% সুত ৰেহাই + মহিলা সমৃদ্ধি যোজনা',
    purposeQuestion: 'আপোনাৰ ঋণ শ্ৰেণী বা উদ্দেশ্য বাছক',
    purposeSubtitle: 'প্ৰশ্ন ২/৫ • চৰকাৰী NSFDC ৰেহাই ঋণ খণ্ডসমূহৰ পৰা বাছক',
    purposeBusiness: 'ক্ষুদ্ৰ ব্যৱসায় আৰু স্বনিয়োজন',
    purposeBusinessDesc: 'খুচুৰা দোকান, ক্ষুদ্ৰ উদ্যোগ, গ্ৰামীণ হস্তশিল্প আৰু ব্যৱসায় (MFS, TLS, UNY, AMY)',
    purposeEducation: 'উচ্চ আৰু কাৰিকৰী শিক্ষা',
    purposeEducationDesc: 'পেছাদাৰী পাঠ্যক্ৰম: ইঞ্জিনিয়াৰিং, চিকিৎসা, এমবিএ আৰু ২৫টা স্বীকৃত ডিগ্ৰী (ELS)',
    purposeGreen: 'সেউজ ব্যৱসায় আঁচনি (Green Business)',
    purposeGreenDesc: 'সৌৰ শক্তি, ই-ৰিক্সা, বেটাৰী চালিত বাহন আৰু জৈৱ-গেছ (GBS)',
    purposeAgri: 'কৃষি আৰু আনুষংগিক কাম-কাজ',
    purposeAgriDesc: 'দুগ্ধ পাম, হাঁহ-কুকুৰা পালন, ট্ৰেক্টৰ, মীন পালন আৰু কৃষি প্ৰক্ৰিয়াকৰণ (TLS, MFS)',
    purposeTransport: 'পৰিবহণ আৰু বাণিজ্যিক বাহন',
    purposeTransportDesc: 'অট\' ৰিক্সা, টেক্সি, ই-ৰিক্সা আৰু বাণিজ্যিক মিনি ট্ৰাক (TLS, GBS, UNY)',
    directSearchPlaceholder: 'আঁচনিৰ কোড বা নাম লিখক (যেনে AMY, ELS, Green Business, টার্ম লোন)...',
    quickTagsTitle: 'দ্ৰুত আঁচনি বাছনি:',
    schemeNotFound: 'কোনো আঁচনি পোৱা নগ\'ল। অনুগ্ৰহ কৰি MFS, AMY, TLS, UNY, ELS বা GBS সন্ধান কৰক।',
    viewGisRoute: 'জিআইএছ মানচিত্ৰত কৰ্তৃত্বপ্ৰাপ্ত অংশীদাৰ বেংকসমূহ চাওক',
    eligibleVenturesTitle: 'এই আঁচনিৰ অধীনত যোগ্য উদ্যোগসমূহ',
    mandatoryDocsTitle: 'প্ৰয়োজনীয় নথিপত্ৰৰ তালিকা',
    maxAssistance: 'সৰ্বোচ্চ ঋণৰ সীমা',
    interestRate: 'সুতৰ হাৰ',
    tenure: 'পৰিশোধৰ ম্যাদ',
    moratorium: 'মৰেটৰিয়াম সময়সীমা',
    officialGuidelines: 'NSFDC চৰকাৰী নিৰ্দেশনা'
  },
  ur: {
    tabGuide: 'اپنی اسکیم کے لیے رہنمائی',
    tabGuideDesc: 'مرحلہ وار ذاتی اہلیت کا مشیر',
    tabDirect: 'یہاں اپنی اسکیم کا نام درج کریں',
    tabDirectDesc: 'براہ راست تلاش اور فوری اسکیم رہنما اصول',
    genderQuestion: 'اپنی جنس کا انتخاب کریں',
    genderSubtitle: 'سوال 1/5 • خواتین کے لیے شرح سود میں رعایت اور خصوصی فوائد',
    genderFemale: 'خاتون',
    genderMale: 'مرد',
    genderOther: 'دیگر',
    femaleRebateNotice: 'خواتین درخواست دہندگان کو تعلیمی قرض پر 0.5% سالانہ سود میں چھوٹ اور مہیلا سمردھی یوجنا میں ترجیح ملتی ہے۔',
    femaleExclusiveBadge: '0.5% سود میں رعایت + مہیلا سمردھی یوجنا',
    purposeQuestion: 'اپنے قرض کا زمرہ یا مقصد منتخب کریں',
    purposeSubtitle: 'سوال 2/5 • سرکاری NSFDC رعایتی قرض کے شعبوں میں سے انتخاب کریں',
    purposeBusiness: 'چھوٹا کاروبار اور خود روزگار',
    purposeBusinessDesc: 'ریٹیل دکانیں، مائیکرو انٹرپرائزز، دیہی دستکاری اور تجارت (MFS, TLS, UNY, AMY)',
    purposeEducation: 'اعلیٰ اور تکنیکی تعلیم',
    purposeEducationDesc: 'پیشہ ورانہ کورسز: انجینئرنگ، میڈیکل، ایم بی اے اور 25 تسلیم شدہ ڈگریاں (ELS)',
    purposeGreen: 'گرین بزنس اسکیم (ماحول دوست)',
    purposeGreenDesc: 'شمسی توانائی، ای رکشا، بیٹری سے چلنے والی گاڑیاں اور بائیو گیس (GBS)',
    purposeAgri: 'زراعت اور متعلقہ سرگرمیاں',
    purposeAgriDesc: 'ڈیری فارمنگ، پولٹری، ٹریکٹر، ماہی پروری اور زرعی پروسیسنگ (TLS, MFS)',
    purposeTransport: 'ٹرانسپورٹ اور کمرشل گاڑیاں',
    purposeTransportDesc: 'آٹو رکشا، ٹیکسی، ای رکشا اور کمرشل منی ٹرک (TLS, GBS, UNY)',
    directSearchPlaceholder: 'اسکیم کا کوڈ یا نام درج کریں (جیسے AMY, ELS, Green Business)...',
    quickTagsTitle: 'فوری اسکیم کا انتخاب:',
    schemeNotFound: 'کوئی اسکیم نہیں ملی۔ برائے مہربانی MFS, AMY, TLS, UNY, ELS یا GBS تلاش کریں۔',
    viewGisRoute: 'جی آئی ایس نقشے پر مجاز پارٹنر بینک دیکھیں',
    eligibleVenturesTitle: 'اس اسکیم کے تحت اہل کاروبار',
    mandatoryDocsTitle: 'لازمی دستاویزات کی فہرست',
    maxAssistance: 'زیادہ سے زیادہ قرض کی حد',
    interestRate: 'شرح سود',
    tenure: 'ادائیگی کی مدت',
    moratorium: 'رعایتی مدت (Moratorium)',
    officialGuidelines: 'سرکاری NSFDC رہنما اصول'
  }
};

export function getLocalizedDiscoveryUI(language: LanguageCode | string): LocalizedDiscoveryUI {
  if (DISCOVERY_UI_TEXT[language]) return DISCOVERY_UI_TEXT[language];
  const devanagariLangs = ['mai', 'ne', 'sa', 'kok', 'doi', 'brx', 'sat'];
  if (devanagariLangs.includes(language)) return DISCOVERY_UI_TEXT['hi'];
  return DISCOVERY_UI_TEXT['en'];
}



