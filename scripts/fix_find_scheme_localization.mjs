import { readFileSync, writeFileSync } from 'fs';

const filePath = '/Users/adityasingh/092/src/app/find-scheme/page.tsx';
let content = readFileSync(filePath, 'utf-8');

// Specific replacements:
// 1. Ventures & Docs nameHi fallbacks: only use Devanagari Hindi if language is Hindi
content = content.replaceAll("language !== 'en' ? v.nameHi : v.name", "language === 'hi' && v.nameHi ? v.nameHi : v.name");
content = content.replaceAll("language !== 'en' ? v.sectorNameHi : v.sectorName", "language === 'hi' && v.sectorNameHi ? v.sectorNameHi : v.sectorName");
content = content.replaceAll("language !== 'en' ? doc.nameHi : doc.name", "language === 'hi' && doc.nameHi ? doc.nameHi : doc.name");
content = content.replaceAll("language !== 'en' ? doc.descriptionHi : doc.description", "language === 'hi' && doc.descriptionHi ? doc.descriptionHi : doc.description");

// 2. Results reasons & warnings
content = content.replaceAll("(language !== 'en' ? rec.reasonsHi : rec.reasons)", "(language === 'hi' && rec.reasonsHi ? rec.reasonsHi : rec.reasons)");
content = content.replaceAll("(language !== 'en' ? rec.warningsHi : rec.warnings)", "(language === 'hi' && rec.warningsHi ? rec.warningsHi : rec.warnings)");
content = content.replaceAll("(language !== 'en' ? rec.missing_criteriaHi : rec.missing_criteria)", "(language === 'hi' && rec.missing_criteriaHi ? rec.missing_criteriaHi : rec.missing_criteria)");

// 3. Navigation buttons & headers
content = content.replaceAll("<span>{language !== 'en' ? 'मुख्य पृष्ठ' : 'Back to Home'}</span>", "<span>{t.common.backToHome}</span>");
content = content.replaceAll("<span>{language !== 'en' ? '← प्रपत्र में सुधार करें' : '← Back to Edit Answers'}</span>", "<span>{t.finder.btnBack}</span>");
content = content.replaceAll("<span>{language !== 'en' ? '← प्रपत्र में सुधार करें' : '← Edit Answers / Previous Step'}</span>", "<span>{t.finder.btnBack}</span>");
content = content.replaceAll("{language !== 'en' ? '← प्रपत्र में सुधार करें' : '← Edit Answers'}", "{t.finder.btnBack}");
content = content.replaceAll("<span>{language !== 'en' ? '← प्रपत्र में सुधार करें (Previous Step)' : '← Edit Answers (Previous Step)'}</span>", "<span>{t.finder.btnBack}</span>");
content = content.replaceAll("<span>{language !== 'en' ? 'नई खोज शुरू करें' : 'Start Fresh Search'}</span>", "<span>{t.finder.btnReset}</span>");
content = content.replaceAll("{language !== 'en' ? 'आपके लिए उपयुक्त योजनाएं' : 'Matched NSFDC Lending Schemes'}", "{t.finder.resultsTitle}");

// 4. Any remaining language !== 'en' in find-scheme -> language === 'hi'
// This ensures that Tamil, Telugu, Kannada, Bengali, etc. users are NOT shown Hindi strings
content = content.replaceAll("language !== 'en'", "language === 'hi'");

writeFileSync(filePath, content, 'utf-8');
console.log('find-scheme/page.tsx updated successfully!');
