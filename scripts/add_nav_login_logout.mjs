import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = '/Users/adityasingh/092/src/lib/i18n';

const words = {
  en: { login: 'Login', logout: 'Logout' },
  hi: { login: 'लॉग इन', logout: 'लॉग आउट' },
  bn: { login: 'লগইন', logout: 'লগআউট' },
  te: { login: 'లాగిన్', logout: 'లాగౌట్' },
  ta: { login: 'உள்நுழை', logout: 'வெளியேறு' },
  mr: { login: 'लॉगिन', logout: 'लॉगआउट' },
  gu: { login: 'લૉગિન', logout: 'લૉગઆઉટ' },
  kn: { login: 'ಲಾಗಿನ್', logout: 'ಲಾಗ್ ಔಟ್' },
  ml: { login: 'ലോഗിൻ', logout: 'ലോഗ് ഔട്ട്' },
  pa: { login: 'ਲੌਗਇਨ', logout: 'ਲੌਗਆਊਟ' },
  or: { login: 'ଲଗଇନ୍', logout: 'ଲଗଆଉଟ୍' },
  as: { login: 'লগইন', logout: 'লগআউট' },
  ur: { login: 'لاگ ان', logout: 'لاگ آوٹ' },
  sa: { login: 'प्रवेशः', logout: 'निर्गमः' },
  ne: { login: 'लगइन', logout: 'लगआउट' },
  mai: { login: 'लॉगिन', logout: 'लॉगआउट' },
  sat: { login: 'Login', logout: 'Logout' },
  ks: { login: 'لاگ ان', logout: 'لاگ آوٹ' },
  sd: { login: 'لاگ ان', logout: 'لاگ آئوٽ' },
  kok: { login: 'लॉगिन', logout: 'लॉगआउट' },
  doi: { login: 'लॉगिन', logout: 'लॉगआउट' },
  mni: { login: 'লগইন', logout: 'লগআউট' },
  brx: { login: 'Login', logout: 'Logout' },
};

const languages = Object.keys(words);

for (const lang of languages) {
  const filePath = join(dir, `${lang}.ts`);
  let content = readFileSync(filePath, 'utf-8');

  // Check if nav already has login
  if (content.includes("login: '")) {
    console.log(`${lang}.ts already has login, skipping`);
    continue;
  }

  const { login, logout } = words[lang];
  // Replace after independentDisclaimer line
  const regex = /(independentDisclaimer:\s*['"][^'"]*['"])/;
  if (!regex.test(content)) {
    console.error(`Could not find independentDisclaimer in ${lang}.ts`);
    continue;
  }

  content = content.replace(regex, `$1,\n    login: '${login}',\n    logout: '${logout}'`);
  writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${lang}.ts with login: '${login}', logout: '${logout}'`);
}
