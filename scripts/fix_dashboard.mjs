import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('src/app/dashboard/page.tsx', 'utf8');

c = c.replace('const { language } = useI18n();', 'const { language, t } = useI18n();');

c = c.replace("label: language !== 'en' ? 'मेरी योजनाएं और आवेदन' : 'My Schemes & Inquiries',", "label: t.dashboardPage.mySchemes,");
c = c.replace("label: language !== 'en' ? 'योजना अपडेट व अलर्ट' : 'Scheme Updates & Alerts',", "label: t.dashboardPage.schemeAlerts,");
c = c.replace("label: language !== 'en' ? 'सहेजी गई योजनाएं' : 'Saved Schemes',", "label: t.dashboardPage.savedSchemes,");
c = c.replace("label: language !== 'en' ? 'खोज इतिहास' : 'Search History',", "label: t.dashboardPage.searchHistory,");

c = c.replace("title={language !== 'en' ? 'लॉग आउट करें' : 'Log Out'}", "title={t.dashboardPage.logout}");
c = c.replace("<span>{language !== 'en' ? 'लॉग आउट' : 'Logout'}</span>", "<span>{t.dashboardPage.logout}</span>");

c = c.replace("{language !== 'en' ? 'अभी तक कोई योजना पूछताछ दर्ज नहीं है' : 'No Scheme Inquiries Yet'}", "{t.dashboardPage.noInquiriesYet}");
c = c.replace(
  /{language !== 'en'\s*\?\s*'आपने अभी तक किसी योजना के लिए आवेदन \/ पूछताछ दर्ज नहीं की है। योजनाएं देखें या अपनी पात्रता की जांच करें।'[\s\S]*?'You haven't submitted any scheme inquiries yet\. Browse verified schemes or run the smart finder to get matched\.'}/,
  "{t.dashboardPage.noInquiriesSub}"
);
c = c.replace("<span>{language !== 'en' ? 'सभी 93 योजनाएं देखें' : 'Browse All 93 Schemes'}</span>", "<span>{t.dashboardPage.browseAllSchemes}</span>");

c = c.replace("{language !== 'en' ? 'कोई नया योजना अपडेट नहीं है' : 'All Schemes Are Up To Date'}", "{t.dashboardPage.allUpToDate}");
c = c.replace(
  /{language !== 'en'\s*\?\s*'वर्तमान में आपके प्रोफाइल और पात्रता के अनुसार कोई नया नियम संशोधन या नीतिगत सूचना नहीं है।'[\s\S]*?'No new scheme policy revisions or alerts for your profile at this time\.'}/,
  "{t.dashboardPage.allUpToDateSub}"
);

c = c.replace("{language !== 'en' && n.titleHi ? n.titleHi : n.title}", "{language === 'hi' && n.titleHi ? n.titleHi : n.title}");
c = c.replace("{language !== 'en' && n.messageHi ? n.messageHi : n.message}", "{language === 'hi' && n.messageHi ? n.messageHi : n.message}");

writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('Successfully updated src/app/dashboard/page.tsx');
