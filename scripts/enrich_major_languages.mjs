import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = '/Users/adityasingh/092/src/lib/i18n';

const langPacks = {
  gu: {
    footer: {
      disclaimerTitle: 'મહત્વપૂર્ણ સત્તાવાર સૂચના અને અસ્વીકરણ',
      disclaimerText: 'આ એક સ્વતંત્ર નાગરિક સહાય મંચ છે. તે NSFDC અથવા કોઈપણ સરકારી મંત્રાલયનું સત્તાવાર પોર્ટલ નથી. આ વેબસાઇટ પર સીધી લોન મંજૂરી કે ગેરંટી આપવામાં આવતી નથી. તમામ નાણાકીય નિયમો અને વ્યાજ દરો રાજ્ય સત્તાવાર એજન્સી દ્વારા ચકાસણીને આધીન છે.',
      aboutDesc: 'અનુસૂચિત જાતિના સાહસિકો અને વિદ્યાર્થીઓ માટે સરળ અને પારદર્શક યોજના માર્ગદર્શન મંચ.',
      coreFeatures: 'મુખ્ય સુવિધાઓ',
      trustCompliance: 'પારદર્શિતા અને નિયમો',
      officialSources: 'સત્તાવાર સ્ત્રોત અને ચકાસણી',
      privacyPolicy: 'ગોપનીયતા નીતિ',
      terms: 'નિયમો અને શરતો',
      adminCenter: 'વહીવટી કેન્દ્ર',
      authoritativeSource: 'સત્તાવાર સ્ત્રોત',
      nsfdcGov: 'રાષ્ટ્રીય અનુસૂચિત જાતિ નાણાં અને વિકાસ નિગમ (સામાજિક ન્યાય મંત્રાલય, ભારત સરકાર)',
      copyright: '© 2026 AryaSaarthi. Sahi Vyakti. Sahi Yojna. Sahi Marg. ૧૦૦% મફત અને ખુલ્લું.'
    },
    onboarding: {
      firstTimeBadge: 'પ્રથમ વખત લૉગિન — પ્રોફાઇલ સેટઅપ',
      title: 'તમારી નાગરિક પ્રોફાઇલ પૂર્ણ કરો',
      subtitle: 'યોગ્ય સરકારી યોજનાઓ અને નજીકના સહાયક કેન્દ્રો શોધવા માટે તમારી વિગતો ભરો.',
      errName: 'કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.',
      errDistrict: 'કૃપા કરીને તમારો જિલ્લો પસંદ કરો.',
      nameLabel: 'તમારું પૂરું નામ *',
      genderLabel: 'જાતિ (Gender) *',
      womenRebateNote: 'મહિલાઓ માટે ૧% વ્યાજ રાહત',
      male: 'પુરુષ',
      female: 'મહિલા',
      other: 'અન્ય',
      stateLabel: 'રાજ્ય / કેન્દ્રશાસિત પ્રદેશ *',
      districtLabel: 'જિલ્લો *',
      customDistrictLabel: 'જિલ્લાનું નામ દાખલ કરો *',
      saveProfile: 'પ્રોફાઇલ સાચવો અને આગળ વધો',
      saving: 'સાચવી રહ્યું છે...'
    },
    schemesPage: {
      runWizard: 'પાત્રતા વિઝાર્ડ ચલાવો',
      directoryBadge: 'સપ્ટેમ્બર ૨૦૨૬ સુધારેલી ડિરેક્ટરી',
      directoryTitle: 'અનુસૂચિત જાતિ (SC) કલ્યાણ યોજના ડિરેક્ટરી',
      directorySubtitle: 'રાહત દરે લોન, સબસિડી અને શિષ્યવૃત્તિ આપતી ચકાસાયેલી સરકારી યોજનાઓ.',
      matchMyScheme: 'મારી પાત્રતાની યોજના શોધો',
      calcRepayment: 'હપ્તા કેલ્ક્યુલેટર',
      tabAll: 'બધી ચકાસાયેલી યોજનાઓ (૯૩)',
      tabCentral: 'કેન્દ્રીય યોજનાઓ (૧૭)',
      tabState: 'રાજ્ય યોજનાઓ (૭૬)',
      tabNsfdc: 'NSFDC ધિરાણ યોજનાઓ (૬)',
      searchPlaceholder: 'યોજનાનું નામ, રાજ્ય અથવા પોર્ટલ શોધો...',
      filterState: 'રાજ્ય પ્રમાણે:',
      allStatesOption: 'બધા રાજ્યો',
      catAll: 'બધી શ્રેણીઓ',
      catEducation: 'શિક્ષણ અને શિષ્યવૃત્તિ',
      catEnterprise: 'વેપાર અને લોન',
      catLivelihood: 'આજીવિકા અને કારીગરી',
      catHousing: 'આવાસ અને જમીન',
      catMarriage: 'લગ્ન સહાય અને રાહત',
      nsfdcHeading: 'NSFDC મુખ્ય ધિરાણ યોજનાઓ',
      schemesUnit: 'યોજનાઓ',
      showingSchemes: 'દર્શાવેલ યોજનાઓ:',
      portalVerified: 'સત્તાવાર ચકાસાયેલ',
      docsRequired: 'જરૂરી દસ્તાવેજો',
      viewDetails: 'વિગતો અને દસ્તાવેજો',
      noMatching: 'કોઈ મેળ ખાતી યોજના મળી નથી.',
      noMatchingSub: 'કૃપા કરીને અન્ય શ્રેણી અથવા રાજ્ય પસંદ કરીને ફરી પ્રયાસ કરો.',
      resetFilters: 'બધા ફિલ્ટર્સ ફરીથી સેટ કરો'
    },
    schemeDetail: {
      backToSchemes: '← બધી યોજનાઓ પર પાછા જાઓ',
      checkEligibility: 'મારી પાત્રતા ચકાસો',
      applyInquire: 'અરજી / પૂછપરછ સબમિટ કરો',
      findAgency: 'સત્તાવાર એજન્સી શોધો',
      maxCost: 'મહત્તમ પ્રોજેક્ટ ખર્ચ',
      maxFinancing: 'મહત્તમ નાણાકીય સહાય',
      womenRebate: 'મહિલા વ્યાજ રાહત',
      noRebate: 'સામાન્ય દર',
      moratorium: 'મોરેટોરિયમ સમયગાળો',
      eligibilityCriteria: 'પાત્રતા માપદંડ',
      casteReq: 'જાતિની જરૂરિયાત',
      casteReqText: 'અરજદાર અનુસૂચિત જાતિ (SC) સમુદાયના હોવા આવશ્યક છે.',
      incomeCeiling: 'આવક મર્યાદા',
      incomeCeilingText: 'વાર્ષિક કૌટુંબિક આવક વધુમાં વધુ',
      ageReq: 'વય મર્યાદા',
      minAgeText: 'લઘુત્તમ વય',
      maxAgeText: 'અને મહત્તમ',
      requiredDocs: 'જરૂરી દસ્તાવેજો',
      officialSource: 'સત્તાવાર સ્ત્રોત',
      verifiedOn: 'ચકાસણી તારીખ',
      inquirySuccess: 'પૂછપરછ સફળતાપૂર્વક સબમિટ થઈ!',
      inquirySuccessDesc: 'તમારી પૂછપરછ પ્રોફાઇલમાં નોંધવામાં આવી છે. સત્તાવાર ભાગીદાર તેની સમીક્ષા કરશે.',
      viewDashboard: 'મારા ડેશબોર્ડમાં જુઓ →',
      close: 'બંધ કરો',
      fullName: 'પૂરું નામ',
      phone: 'મોબાઇલ નંબર',
      state: 'રાજ્ય',
      reqAmount: 'જરૂરી લોનની રકમ (₹)',
      purpose: 'હેતુ',
      notes: 'નોંધો / પ્રશ્નો',
      cancel: 'રદ કરો',
      submitting: 'સબમિટ થઈ રહ્યું છે...',
      submitInquiry: 'પૂછપરછ સબમિટ કરો'
    },
    dashboardPage: {
      mySchemes: 'મારી યોજનાઓ અને અરજીઓ',
      schemeAlerts: 'યોજના અપડેટ્સ અને ચેતવણીઓ',
      savedSchemes: 'સાચવેલી યોજનાઓ',
      searchHistory: 'શોધ ઇતિહાસ',
      logout: 'લૉગ આઉટ',
      noInquiriesYet: 'હજી સુધી કોઈ પૂછપરછ સબમિટ કરવામાં આવી નથી',
      noInquiriesSub: 'યોજનાઓ બ્રાઉઝ કરો અથવા પાત્રતા વિઝાર્ડ શરૂ કરો.',
      browseAllSchemes: 'બધી ૯૩ યોજનાઓ જુઓ',
      allUpToDate: 'બધી યોજનાઓ અદ્યતન છે',
      allUpToDateSub: 'તમારી પ્રોફાઇલ માટે હાલમાં કોઈ નવી સૂચના નથી.'
    },
    sourcesPage: {
      backToHome: 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ',
      zeroHallucination: 'ચોક્કસતા ચકાસણી પ્રોટોકોલ',
      pageTitle: 'સત્તાવાર સ્ત્રોતો અને ચકાસણી',
      pageSubtitle: 'આર્યસારથી પરની દરેક નાણાકીય મર્યાદા સીધી સરકારી દસ્તાવેજોમાંથી ચકાસાયેલી છે.',
      verifiedRef: 'ચકાસાયેલ સરકારી સંદર્ભો',
      verifiedOn: 'ચકાસણી તારીખ:',
      effective: 'અમલી તારીખ:',
      changeProtocol: 'ફેરફાર નિર્ણય પ્રોટોકોલ',
      changeProtocolDesc: 'કોઈપણ નીતિ ફેરફાર સખત ચકાસણી પ્રક્રિયા પછી જ અપડેટ થાય છે.',
      currentVersion: 'વર્તમાન સંસ્કરણ: 2026.09.1',
      incomeCeiling: 'વાર્ષિક કૌટુંબિક આવક મર્યાદા: ₹૫,૦૦,૦૦૦',
      casteCert: 'જાતિનું પ્રમાણપત્ર: ફરજિયાત (SC સમુદાય)',
      routing: 'અરજી માધ્યમ: રાજ્ય ચેનલાઇઝિંગ એજન્સીઓ (SCAs)',
      viewAllSchemes: '← બધી યોજનાઓ જુઓ',
      checkEligibility: 'મારી પાત્રતા ચકાસો'
    },
    privacyPage: {
      backToHome: 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ',
      dataMinimization: 'ડેટા મિનિમાઇઝેશન પ્રોટોકોલ',
      pageTitle: 'ગોપનીયતા અને ડેટા સુરક્ષા નીતિ',
      pageSubtitle: 'આર્યસારથી તમારો વ્યક્તિગત ડેટા એકત્રિત, સંગ્રહિત કે વેચતી નથી.',
      zeroCollection: '૧. વ્યક્તિગત ડેટા સંગ્રહ નહીં',
      zeroCollectionDesc: 'આધાર કે બેંક વિગતો આપ્યા વિના તમે પાત્રતા અને હપ્તો ગણી શકો છો.',
      noUploads: '૨. કોઈ દસ્તાવેજ અપલોડ નહીં',
      noUploadsDesc: 'આર્યસારથી ક્યારેય પ્રમાણપત્રો અપલોડ કરવાનું કહેતી નથી.',
      locationPrivacy: '૩. સ્થાન ગોપનીયતા',
      locationPrivacyDesc: 'નજીકનું કેન્દ્ર શોધવા માટે જ સ્થાન માત્ર તમારા બ્રાઉઝરમાં ઉપયોગ થાય છે.'
    },
    termsPage: {
      backToHome: 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ',
      termsBadge: 'શરતો અને અસ્વીકરણ',
      pageTitle: 'સેવા શરતો અને કાનૂની અસ્વીકરણ',
      pageSubtitle: 'પ્લેટફોર્મનો ઉપયોગ કરતા પહેલા કૃપા કરીને આ શરતો કાળજીપૂર્વક વાંચો.',
      independentInterface: 'સ્વતંત્ર નાગરિક ઇન્ટરફેસ',
      independentInterfaceDesc: 'આર્યસારથી એ એક સ્વતંત્ર ડિજિટલ સાર્વજનિક પ્લેટફોર્મ છે.',
      noGuarantee: '૧. કોઈ લોન મંજૂરી કે ગેરંટી નથી',
      noGuaranteeDesc: 'આ પ્લેટફોર્મ લોન આપતું નથી. તમામ લોન ફક્ત સરકારી એજન્સીઓ દ્વારા જ આપવામાં આવે છે.',
      indicativeFin: '૨. માર્ગદર્શક નાણાકીય ગણતરીઓ',
      indicativeFinDesc: 'કેલ્ક્યુલેટરના હપ્તા અને વ્યાજના આંકડા સરકારી સૂત્રો પર આધારિત અંદાજ છે.',
      authoritativeVerif: '૩. સત્તાવાર ચકાસણી',
      authoritativeVerifDesc: 'કોઈપણ વિસંગતતાના કિસ્સામાં nsfdc.nic.in પર પ્રકાશિત સૂચનાઓ જ આખરી ગણાશે.'
    },
    mapUI: {
      yourLocation: 'તમારું વર્તમાન સ્થાન',
      geoNotSupported: 'તમારા બ્રાઉઝરમાં લોકેશન સુવિધા નથી.',
      validApiKey: 'કૃપા કરીને માન્ય Google Maps API Key દાખલ કરો.',
      searchPlaceholder: 'બેંક, શહેર, જિલ્લો શોધો...',
      allStates: 'બધા રાજ્યો',
      locationsAvailable: 'કેન્દ્રો ઉપલબ્ધ છે',
      serviceDirectory: 'અધિકૃત સેવા પ્રદાતાઓની યાદી',
      navigate: 'દિશાઓ',
      noMatching: 'કોઈ મેળ ખાતા કેન્દ્રો મળ્યા નથી.',
      roadmap: 'રોડમેપ',
      satellite: 'સેટેલાઇટ',
      drivingRoute: 'ડ્રાઇવિંગ રૂટ',
      distance: 'અંતર',
      estDuration: 'અંદાજિત સમય',
      openInGoogleMaps: 'Google Maps માં ખોલો',
      clearKey: 'કી દૂર કરો',
      cancel: 'રદ કરો',
      saveAndActivate: 'સાચવો અને સક્રિય કરો',
      enterApiKey: 'API Key દાખલ કરો',
      apiKeyLabel: 'Google Maps API Key',
      apiKeyHelp: 'નકશો સક્રિય કરવા માટે API કી દાખલ કરો'
    }
  },
  kn: {
    footer: {
      disclaimerTitle: 'ಮುಖ್ಯವಾದ ಅಧಿಕೃತ ಸೂಚನೆ ಮತ್ತು ಹಕ್ಕುತ್ಯಾಗ',
      disclaimerText: 'ಇದು ಸ್ವತಂತ್ರ ನಾಗರಿಕ ಸಹಾಯ ವೇದಿಕೆಯಾಗಿದೆ. ಇದು NSFDC ಅಥವಾ ಯಾವುದೇ ಸಚಿವಾಲಯದ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಅಲ್ಲ. ಈ ವೇದಿಕೆಯು ಸಾಲವನ್ನು ಮಂಜೂರು ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ. ಎಲ್ಲಾ ನಿಯಮಗಳು ಅಧಿಕೃತ ರಾಜ್ಯ ಏಜೆನ್ಸಿಗಳ ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ.',
      aboutDesc: 'ಪರಿಶಿಷ್ಟ ಜಾತಿಯ ಉದ್ಯಮಿಗಳು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪಾರದರ್ಶಕ ಮತ್ತು ಸುಲಭ ಯೋಜನೆ ಮಾರ್ಗದರ್ಶಿ ವೇದಿಕೆ.',
      coreFeatures: 'ಮುಖ್ಯ ವೈಶಿಷ್ಟ್ಯಗಳು',
      trustCompliance: 'ಪಾರದರ್ಶಕತೆ ಮತ್ತು ನಿಯಮಗಳು',
      officialSources: 'ಅಧಿಕೃತ ಮೂಲಗಳು ಮತ್ತು ಪರಿಶೀಲನೆ',
      privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
      terms: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
      adminCenter: 'ಆಡಳಿತ ಕೇಂದ್ರ',
      authoritativeSource: 'ಅಧಿಕೃತ ಮೂಲ',
      nsfdcGov: 'ರಾಷ್ಟ್ರೀಯ ಪರಿಶಿಷ್ಟ ಜಾತಿ ಹಣಕಾಸು ಮತ್ತು ಅಭಿವೃದ್ಧಿ ನಿಗಮ (ಭಾರತ ಸರ್ಕಾರ)',
      copyright: '© 2026 AryaSaarthi. Sahi Vyakti. Sahi Yojna. Sahi Marg. 100% ಉಚಿತ ಮತ್ತು ಮುಕ್ತ.'
    },
    onboarding: {
      firstTimeBadge: 'ಮೊದಲ ಬಾರಿಗೆ ಲಾಗಿನ್ — ಪ್ರೊಫೈಲ್ ಸೆಟಪ್',
      title: 'ನಿಮ್ಮ ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ',
      subtitle: 'ಸೂಕ್ತ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಹತ್ತಿರದ ಅಧಿಕೃತ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
      errName: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
      errDistrict: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      nameLabel: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು *',
      genderLabel: 'ಲಿಂಗ *',
      womenRebateNote: 'ಮಹಿಳೆಯರಿಗೆ 1% ಬಡ್ಡಿ ರಿಯಾಯಿತಿ',
      male: 'ಪುರುಷ',
      female: 'ಮಹಿಳೆ',
      other: 'ಇತರ',
      stateLabel: 'ರಾಜ್ಯ / ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ *',
      districtLabel: 'ಜಿಲ್ಲೆ *',
      customDistrictLabel: 'ಜಿಲ್ಲೆಯ ಹೆಸರು ನಮೂದಿಸಿ *',
      saveProfile: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ',
      saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...'
    },
    schemesPage: {
      runWizard: 'ಯೋಜನೆ ಅರ್ಹತಾ ಮಾರ್ಗದರ್ಶಿ',
      directoryBadge: 'ಸೆಪ್ಟೆಂಬರ್ 2026 ಪರಿಷ್ಕೃತ ಡೈರೆಕ್ಟರಿ',
      directoryTitle: 'ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC) ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಡೈರೆಕ್ಟರಿ',
      directorySubtitle: 'ರಿಯಾಯಿತಿ ಸಾಲಗಳು, ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ಒದಗಿಸುವ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು.',
      matchMyScheme: 'ನನ್ನ ಅರ್ಹತೆಯ ಯೋಜನೆ ಹುಡುಕಿ',
      calcRepayment: 'ಕಂತು ಕ್ಯಾಲ್ಕುಲೇಟರ್',
      tabAll: 'ಎಲ್ಲಾ ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆಗಳು (93)',
      tabCentral: 'ಕೇಂದ್ರ ಯೋಜನೆಗಳು (17)',
      tabState: 'ರಾಜ್ಯ ಯೋಜನೆಗಳು (76)',
      tabNsfdc: 'NSFDC ಸಾಲ ಯೋಜನೆಗಳು (6)',
      searchPlaceholder: 'ಯೋಜನೆಯ ಹೆಸರು, ರಾಜ್ಯ ಮೂಲಕ ಹುಡುಕಿ...',
      filterState: 'ರಾಜ್ಯವಾರು:',
      allStatesOption: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು',
      catAll: 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು',
      catEducation: 'ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ',
      catEnterprise: 'ವ್ಯಾಪಾರ ಮತ್ತು ಸಾಲಗಳು',
      catLivelihood: 'ಜೀವನೋಪಾಯ ಮತ್ತು ಕರಕುಶಲ',
      catHousing: 'ವಸತಿ ಮತ್ತು ಭೂಮಿ',
      catMarriage: 'ವಿವಾಹ ಸಹಾಯ ಮತ್ತು ಪರಿಹಾರ',
      nsfdcHeading: 'NSFDC ಪ್ರಮುಖ ಸಾಲ ಯೋಜನೆಗಳು',
      schemesUnit: 'ಯೋಜನೆಗಳು',
      showingSchemes: 'ತೋರಿಸಲಾದ ಯೋಜನೆಗಳು:',
      portalVerified: 'ಅಧಿಕೃತವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
      docsRequired: 'ಅಗತ್ಯ ದಾಖಲೆಗಳು',
      viewDetails: 'ವಿವರಗಳು ಮತ್ತು ದಾಖಲೆಗಳು',
      noMatching: 'ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಯೋಜನೆ ಕಂಡುಬಂದಿಲ್ಲ.',
      noMatchingSub: 'ದಯವಿಟ್ಟು ಬೇರೆ ವರ್ಗ ಅಥವಾ ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ.',
      resetFilters: 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ'
    },
    schemeDetail: {
      backToSchemes: '← ಎಲ್ಲಾ ಯೋಜನೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
      checkEligibility: 'ನನ್ನ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
      applyInquire: 'ಯೋಜನೆ ಅರ್ಜಿ / ವಿಚಾರಣೆ',
      findAgency: 'ಅಧಿಕೃತ ಏಜೆನ್ಸಿಯನ್ನು ಹುಡುಕಿ',
      maxCost: 'ಗರಿಷ್ಠ ಯೋಜನೆ ವೆಚ್ಚ',
      maxFinancing: 'ಗರಿಷ್ಠ ಹಣಕಾಸು ನೆರವು',
      womenRebate: 'ಮಹಿಳೆಯರ ಬಡ್ಡಿ ರಿಯಾಯಿತಿ',
      noRebate: 'ಪ್ರಮಾಣಿತ ದರ',
      moratorium: 'ರಿಯಾಯಿತಿ (ಮೊರಟೋರಿಯಂ) ಅವಧಿ',
      eligibilityCriteria: 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು',
      casteReq: 'ಜಾತಿ ಅಗತ್ಯತೆ',
      casteReqText: 'ಅರ್ಜಿದಾರರು ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC) ಸಮುದಾಯಕ್ಕೆ ಸೇರಿರಬೇಕು.',
      incomeCeiling: 'ಆದಾಯ ಮಿತಿ',
      incomeCeilingText: 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಗರಿಷ್ಠ',
      ageReq: 'ವಯಸ್ಸಿನ ಮಿತಿ',
      minAgeText: 'ಕನಿಷ್ಠ ವಯಸ್ಸು',
      maxAgeText: 'ಮತ್ತು ಗರಿಷ್ಠ',
      requiredDocs: 'ಅಗತ್ಯ ದಾಖಲೆಗಳು',
      officialSource: 'ಅಧಿಕೃತ ಮೂಲ',
      verifiedOn: 'ಪರಿಶೀಲಿಸಿದ ದಿನಾಂಕ',
      inquirySuccess: 'ವಿಚಾರಣೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      inquirySuccessDesc: 'ನಿಮ್ಮ ವಿಚಾರಣೆಯನ್ನು ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಅಧಿಕೃತ ಪಾಲುದಾರರು ಪರಿಶೀಲಿಸುತ್ತಾರೆ.',
      viewDashboard: 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ →',
      close: 'ಮುಚ್ಚಿ',
      fullName: 'ಪೂರ್ಣ ಹೆಸರು',
      phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
      state: 'ರಾಜ್ಯ',
      reqAmount: 'ಅಗತ್ಯವಿರುವ ಸಾಲದ ಮೊತ್ತ (₹)',
      purpose: 'ಉದ್ದೇಶ',
      notes: 'ಟಿಪ್ಪಣಿಗಳು / ಪ್ರಶ್ನೆಗಳು',
      cancel: 'ರದ್ದುಮಾಡಿ',
      submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      submitInquiry: 'ವಿಚಾರಣೆಯನ್ನು ಸಲ್ಲಿಸಿ'
    },
    dashboardPage: {
      mySchemes: 'ನನ್ನ ಯೋಜನೆಗಳು ಮತ್ತು ವಿಚಾರಣೆಗಳು',
      schemeAlerts: 'ಯೋಜನೆ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ನವೀಕರಣಗಳು',
      savedSchemes: 'ಉಳಿಸಿದ ಯೋಜನೆಗಳು',
      searchHistory: 'ಹುಡುಕಾಟ ಇತಿಹಾಸ',
      logout: 'ಲಾಗ್ ಔಟ್',
      noInquiriesYet: 'ಇನ್ನೂ ಯಾವುದೇ ವಿಚಾರಣೆಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ',
      noInquiriesSub: 'ಯೋಜನೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಅಥವಾ ಅರ್ಹತಾ ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.',
      browseAllSchemes: 'ಎಲ್ಲಾ 93 ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      allUpToDate: 'ಎಲ್ಲಾ ಯೋಜನೆಗಳು ನವೀಕೃತವಾಗಿವೆ',
      allUpToDateSub: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗಾಗಿ ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ.'
    },
    sourcesPage: {
      backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      zeroHallucination: 'ನಿಖರ ಪರಿಶೀಲನಾ ಪ್ರೋಟೋಕಾಲ್',
      pageTitle: 'ಅಧಿಕೃತ ಮೂಲಗಳು ಮತ್ತು ಪರಿಶೀಲನೆ',
      pageSubtitle: 'ಆರ್ಯಸಾರಥಿಯಲ್ಲಿನ ಪ್ರತಿಯೊಂದು ಹಣಕಾಸು ಮಿತಿಯನ್ನು ನೇರವಾಗಿ ಸರ್ಕಾರಿ ದಾಖಲೆಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
      verifiedRef: 'ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಉಲ್ಲೇಖಗಳು',
      verifiedOn: 'ಪರಿಶೀಲಿಸಿದ ದಿನಾಂಕ:',
      effective: 'ಜಾರಿಗೆ ಬಂದ ದಿನಾಂಕ:',
      changeProtocol: 'ಬದಲಾವಣೆ ನಿರ್ಧಾರ ಪ್ರೋಟೋಕಾಲ್',
      changeProtocolDesc: 'ಯಾವುದೇ ನೀತಿ ಬದಲಾವಣೆಯು ಕಟ್ಟುನಿಟ್ಟಾದ ಪರಿಶೀಲನಾ ಪ್ರಕ್ರಿಯೆಯ ನಂತರವೇ ನವೀಕರಿಸಲ್ಪಡುತ್ತದೆ.',
      currentVersion: 'ಪ್ರಸ್ತುತ ಆವೃತ್ತಿ: 2026.09.1',
      incomeCeiling: 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಮಿತಿ: ₹5,00,000',
      casteCert: 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ: ಕಡ್ಡಾಯ (SC ಸಮುದಾಯ)',
      routing: 'ಅರ್ಜಿ ಮಾರ್ಗ: ರಾಜ್ಯ ಚಾನಲೈಸಿಂಗ್ ಏಜೆನ್ಸಿಗಳು (SCAs)',
      viewAllSchemes: '← ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      checkEligibility: 'ನನ್ನ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ'
    },
    privacyPage: {
      backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      dataMinimization: 'ಡೇಟಾ ಕನಿಷ್ಠೀಕರಣ ಪ್ರೋಟೋಕಾಲ್',
      pageTitle: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ ಸಂರಕ್ಷಣಾ ನೀತಿ',
      pageSubtitle: 'ಆರ್ಯಸಾರಥಿಯು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ ಅಥವಾ ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ.',
      zeroCollection: '1. ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಸಂಗ್ರಹವಿಲ್ಲ',
      zeroCollectionDesc: 'ಆಧಾರ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ನೀಡದೆ ನೀವು ಅರ್ಹತೆ ಮತ್ತು ಕಂತನ್ನು ಲೆಕ್ಕ ಹಾಕಬಹುದು.',
      noUploads: '2. ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್ ಇಲ್ಲ',
      noUploadsDesc: 'ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಆರ್ಯಸಾರಥಿ ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ.',
      locationPrivacy: '3. ಸ್ಥಳ ಗೌಪ್ಯತೆ',
      locationPrivacyDesc: 'ಹತ್ತಿರದ ಕೇಂದ್ರವನ್ನು ಹುಡುಕಲು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.'
    },
    termsPage: {
      backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      termsBadge: 'ನಿಯಮಗಳು ಮತ್ತು ಹಕ್ಕುತ್ಯಾಗ',
      pageTitle: 'ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಕಾನೂನು ಹಕ್ಕುತ್ಯಾಗ',
      pageSubtitle: 'ವೇದಿಕೆಯನ್ನು ಬಳಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಈ ನಿಯಮಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಓದಿ.',
      independentInterface: 'ಸ್ವತಂತ್ರ ನಾಗರಿಕ ವೇದಿಕೆ',
      independentInterfaceDesc: 'ಆರ್ಯಸಾರಥಿ ಸಾರ್ವಜನಿಕ ಪ್ರಯೋಜನಕ್ಕಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಸ್ವತಂತ್ರ ಡಿಜಿಟಲ್ ವೇದಿಕೆಯಾಗಿದೆ.',
      noGuarantee: '1. ಸಾಲ ಮಂಜೂರಾತಿ ಅಥವಾ ಖಾತರಿ ಇಲ್ಲ',
      noGuaranteeDesc: 'ಈ ವೇದಿಕೆಯು ಸಾಲಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ. ಸಾಲಗಳನ್ನು ಕೇವಲ ಸರ್ಕಾರಿ ಸಂಸ್ಥೆಗಳ ಮೂಲಕ ನೀಡಲಾಗುತ್ತದೆ.',
      indicativeFin: '2. ಸೂಚಕ ಹಣಕಾಸು ಲೆಕ್ಕಾಚಾರಗಳು',
      indicativeFinDesc: 'ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ನ ಕಂತು ಮತ್ತು ಬಡ್ಡಿ ಮೊತ್ತಗಳು ಸರ್ಕಾರಿ ಸೂತ್ರಗಳ ಆಧಾರದ ಅಂದಾಜು ಮಾತ್ರ.',
      authoritativeVerif: '3. ಅಧಿಕೃತ ಪರಿಶೀಲನೆ',
      authoritativeVerifDesc: 'ಯಾವುದೇ ಭಿನ್ನಾಭಿಪ್ರಾಯವಿದ್ದಲ್ಲಿ nsfdc.nic.in ನಲ್ಲಿ ಪ್ರಕಟವಾದ ಸರ್ಕಾರಿ ಅಧಿಸೂಚನೆಗಳೇ ಅಂತಿಮ.'
    },
    mapUI: {
      yourLocation: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳ',
      geoNotSupported: 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ.',
      validApiKey: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ Google Maps API Key ನಮೂದಿಸಿ.',
      searchPlaceholder: 'ಬ್ಯಾಂಕ್, ನಗರ, ಜಿಲ್ಲೆ ಹುಡುಕಿ...',
      allStates: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು',
      locationsAvailable: 'ಕೇಂದ್ರಗಳು ಲಭ್ಯವಿದೆ',
      serviceDirectory: 'ಅಧಿಕೃತ ಸೇವಾ ಪೂರೈಕೆದಾರರ ಪಟ್ಟಿ',
      navigate: 'ದಿಕ್ಕುಗಳು',
      noMatching: 'ಯಾವುದೇ ಪಾಲುದಾರರು ಕಂಡುಬಂದಿಲ್ಲ.',
      roadmap: 'ರಸ್ತೆ ನಕ್ಷೆ',
      satellite: 'ಉಪಗ್ರಹ',
      drivingRoute: 'ಚಾಲನಾ ಮಾರ್ಗ',
      distance: 'ದೂರ',
      estDuration: 'ಅಂದಾಜು ಸಮಯ',
      openInGoogleMaps: 'Google Maps ನಲ್ಲಿ ತೆರೆಯಿರಿ',
      clearKey: 'ಕೀಲಿಯನ್ನು ತೆರವುಗೊಳಿಸಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      saveAndActivate: 'ಉಳಿಸಿ ಮತ್ತು ಸಕ್ರಿಯಗೊಳಿಸಿ',
      enterApiKey: 'API Key ನಮೂದಿಸಿ',
      apiKeyLabel: 'Google Maps API Key',
      apiKeyHelp: 'ನಕ್ಷೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು ನಿಮ್ಮ API ಕೀಲಿಯನ್ನು ನಮೂದಿಸಿ'
    }
  }
};

function serializeSection(name, obj, indent = '  ') {
  let lines = [`${indent}${name}: {`];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) {
      lines.push(serializeSection(k, v, indent + '  '));
    } else {
      const cleanVal = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`${indent}  ${k}: '${cleanVal}',`);
    }
  }
  lines.push(`${indent}},`);
  return lines.join('\n');
}

for (const [lang, sections] of Object.entries(langPacks)) {
  const filePath = join(dir, `${lang}.ts`);
  let content = readFileSync(filePath, 'utf-8');

  // Replace from "footer: {" to the end
  const footerIdx = content.indexOf('  footer: {');
  if (footerIdx !== -1) {
    let beforeFooter = content.substring(0, footerIdx);
    let newSectionsCode = '';
    for (const [secName, secObj] of Object.entries(sections)) {
      newSectionsCode += `${serializeSection(secName, secObj)}\n\n`;
    }
    const finalContent = beforeFooter + newSectionsCode.trim() + '\n};\n';
    writeFileSync(filePath, finalContent, 'utf-8');
    console.log(`✅ Successfully enriched ${lang}.ts with native translations!`);
  }
}

console.log('Language packs enrichment complete!');
