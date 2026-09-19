import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('src/app/schemes/[slug]/page.tsx', 'utf8');

// Modal strings
c = c.replace("{language !== 'en' ? 'पूछताछ सफलतापूर्वक दर्ज की गई!' : 'Inquiry Successfully Submitted!'}", "{t.schemeDetail.inquirySuccess}");
c = c.replace(
  /{language !== 'en'\s*\?\s*'आपकी योजना पूछताछ आपके डैशबोर्ड में जोड़ दी गई है। संदर्भ आईडी: #' \+ inquirySuccess\.slice\(-6\)\.toUpperCase\(\)\s*:\s*'Your scheme inquiry has been recorded in your Dashboard\. Reference ID: #' \+ inquirySuccess\.slice\(-6\)\.toUpperCase\(\)}/,
  "{t.schemeDetail.inquirySuccessDesc + ' (#' + inquirySuccess.slice(-6).toUpperCase() + ')'}"
);
c = c.replace("{language !== 'en' ? 'डैशबोर्ड में देखें →' : 'View in My Dashboard →'}", "{t.schemeDetail.viewDashboard}");
c = c.replace("{language !== 'en' ? 'बंद करें' : 'Close'}", "{t.schemeDetail.close}");
c = c.replace("{language !== 'en' ? 'आवेदक का पूरा नाम' : 'Full Name'}", "{t.schemeDetail.fullName}");
c = c.replace("{language !== 'en' ? 'मोबाइल नंबर' : 'Phone Number'}", "{t.schemeDetail.phone}");
c = c.replace("{language !== 'en' ? 'राज्य' : 'State'}", "{t.schemeDetail.state}");
c = c.replace("{language !== 'en' ? 'आवश्यक ऋण/सहायता राशि (₹)' : 'Requested Loan Amount (₹)'}", "{t.schemeDetail.reqAmount}");
c = c.replace("{language !== 'en' ? 'उद्देश्य' : 'Purpose'}", "{t.schemeDetail.purpose}");
c = c.replace("{language !== 'en' ? 'अतिरिक्त टिप्पणी / प्रश्न' : 'Notes / Queries'}", "{t.schemeDetail.notes}");
c = c.replace("{language !== 'en' ? 'रद्द करें' : 'Cancel'}", "{t.schemeDetail.cancel}");
c = c.replace("language !== 'en' ? 'दर्ज हो रहा है...' : 'Submitting...'", "t.schemeDetail.submitting");
c = c.replace("language !== 'en' ? 'पूछताछ दर्ज करें' : 'Submit Inquiry'", "t.schemeDetail.submitInquiry");

// Navigation & banners
c = c.replaceAll("{language !== 'en' ? '← सभी योजनाओं पर वापस जाएं' : '← Back to All Schemes'}", "{t.schemeDetail.backToSchemes}");
c = c.replace(
  /{language !== 'en'\s*\?\s*`आधिकारिक सरकारी पोर्टल द्वारा सत्यापित: \${verifiedScheme\.lastVerifiedDate \|\| '17 सितंबर 2026'}`\s*:\s*`Verified by Gov\. Portal: \${verifiedScheme\.lastVerifiedDate \|\| '17 Sep 2026'}`}/,
  "{`${t.schemeDetail.verifiedOn}: ${verifiedScheme.lastVerifiedDate || '17 Sep 2026'}`}"
);
c = c.replace("{language !== 'en' && verifiedScheme.nameHi ? verifiedScheme.nameHi : verifiedScheme.name}", "{language === 'hi' && verifiedScheme.nameHi ? verifiedScheme.nameHi : verifiedScheme.name}");
c = c.replace("{language !== 'en' ? 'पात्रता एवं प्रमुख शर्तें:' : 'Eligibility & Key Conditions:'}", "{t.schemeDetail.eligibilityCriteria}");
c = c.replace("{language !== 'en' ? 'आधिकारिक पोर्टल खोलें' : 'Visit Official Portal'}", "{t.common.officialLink}");
c = c.replace("{language !== 'en' ? 'आवेदन / पूछताछ दर्ज करें' : 'Submit Scheme Inquiry'}", "{t.schemeDetail.applyInquire}");
c = c.replace("{language !== 'en' ? 'आवश्यक आवेदन दस्तावेज चेकलिस्ट' : 'Specific Application Documents Checklist'}", "{t.schemeDetail.requiredDocs}");
c = c.replace(
  /{language !== 'en'\s*\?\s*'आधिकारिक पोर्टल या संबंधित निगम में आवेदन करने से पूर्व इन सभी दस्तावेजों की स्पष्ट प्रतियां तैयार रखें:'\s*:\s*'Prepare clear, valid, and readable copies of these documents before filing your application on the official portal:'}/,
  "{t.schemeDetail.requiredDocs}"
);
c = c.replaceAll("{language !== 'en' ? 'मेरी पात्रता की जांच करें' : 'Check My Eligibility'}", "{t.schemeDetail.checkEligibility}");

// NSFDC core scheme section
c = c.replace("{language !== 'en' ? 'आवेदन / पूछताछ दर्ज करें' : 'Apply / Inquire for Scheme'}", "{t.schemeDetail.applyInquire}");
c = c.replace("{language !== 'en' ? 'अधिकृत एजेंसी खोजें' : 'Find Authorized Agency'}", "{t.schemeDetail.findAgency}");
c = c.replace("{language !== 'en' ? 'अधिकतम लागत' : 'Max Project Cost'}", "{t.schemeDetail.maxCost}");
c = c.replace("{language !== 'en' ? 'अधिकतम वित्तपोषण' : 'Max Financing'}", "{t.schemeDetail.maxFinancing}");
c = c.replace(
  "{scheme!.rebate_women_pct ? `${scheme!.rebate_women_pct}% ${language !== 'en' ? 'महिला छूट' : 'Women Rebate'}` : (language !== 'en' ? 'कोई छूट नहीं' : 'Standard Rate')}",
  "{scheme!.rebate_women_pct ? `${scheme!.rebate_women_pct}% ${t.schemeDetail.womenRebate}` : t.schemeDetail.noRebate}"
);
c = c.replace("{language !== 'en' ? 'अधिस्थगन अवधि' : 'Moratorium period'}", "{t.schemeDetail.moratorium}");
c = c.replace("{language !== 'en' ? 'पात्रता मापदंड' : 'Eligibility Criteria'}", "{t.schemeDetail.eligibilityCriteria}");
c = c.replace(
  "<strong>{language !== 'en' ? 'जाति आवश्यकता' : 'Caste Requirement'}:</strong> {language !== 'en' ? 'आवेदक अनुसूचित जाति (SC) समुदाय से होना चाहिए।' : 'Applicant must belong to the Scheduled Caste (SC) community.'}",
  "<strong>{t.schemeDetail.casteReq}:</strong> {t.schemeDetail.casteReqText}"
);
c = c.replace(
  "<strong>{language !== 'en' ? 'आय सीमा' : 'Income Ceiling'}:</strong> {language !== 'en' ? 'वार्षिक पारिवारिक आय' : 'Annual family income up to'}",
  "<strong>{t.schemeDetail.incomeCeiling}:</strong> {t.schemeDetail.incomeCeilingText}"
);
c = c.replace(
  "<strong>{language !== 'en' ? 'आयु सीमा' : 'Age Requirement'}:</strong> {language !== 'en' ? 'न्यूनतम आयु' : 'Minimum age'}",
  "<strong>{t.schemeDetail.ageReq}:</strong> {t.schemeDetail.minAgeText}"
);
c = c.replace(
  "` ${language !== 'en' ? 'तथा अधिकतम' : 'and maximum'} ${scheme!.eligibility_rules.maxAge} ${labels.years}`",
  "` ${t.schemeDetail.maxAgeText} ${scheme!.eligibility_rules.maxAge} ${labels.years}`"
);
c = c.replace(
  "{language !== 'en' && scheme!.eligibility_rules.notesHi ? scheme!.eligibility_rules.notesHi : scheme!.eligibility_rules.notes}",
  "{language === 'hi' && scheme!.eligibility_rules.notesHi ? scheme!.eligibility_rules.notesHi : scheme!.eligibility_rules.notes}"
);
c = c.replace("{language !== 'en' ? 'आवश्यक दस्तावेज' : 'Required Documents'}", "{t.schemeDetail.requiredDocs}");
c = c.replace(
  "{language !== 'en' && doc.nameHi ? doc.nameHi : doc.name}",
  "{language === 'hi' && doc.nameHi ? doc.nameHi : doc.name}"
);
c = c.replace(
  "{language !== 'en' && doc.descriptionHi ? doc.descriptionHi : doc.description}",
  "{language === 'hi' && doc.descriptionHi ? doc.descriptionHi : doc.description}"
);
c = c.replace("{language !== 'en' ? 'आधिकारिक स्रोत' : 'Official Source'}", "{t.schemeDetail.officialSource}");
c = c.replace("{language !== 'en' ? 'सत्यापन तिथि' : 'Verified On'}", "{t.schemeDetail.verifiedOn}");

writeFileSync('src/app/schemes/[slug]/page.tsx', c, 'utf8');
console.log('Successfully updated src/app/schemes/[slug]/page.tsx');
