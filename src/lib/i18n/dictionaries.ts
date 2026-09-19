import { en } from './en';
import { hi } from './hi';
import { bn } from './bn';
import { mr } from './mr';
import { te } from './te';
import { ta } from './ta';
import { gu } from './gu';
import { kn } from './kn';
import { ml } from './ml';
import { pa } from './pa';
import { or } from './or';
import { as } from './as';
import { ur } from './ur';
import { mai } from './mai';
import { sat } from './sat';
import { ks } from './ks';
import { ne } from './ne';
import { sd } from './sd';
import { kok } from './kok';
import { doi } from './doi';
import { mni } from './mni';
import { brx } from './brx';
import { sa } from './sa';
import { LanguageCode } from './languages';

export type Translations = typeof en;

const DICTIONARIES: Record<LanguageCode, any> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  gu,
  kn,
  ml,
  pa,
  or,
  as,
  ur,
  mai,
  sat,
  ks,
  ne,
  sd,
  kok,
  doi,
  mni,
  brx,
  sa,
};

export function getDictionary(code: LanguageCode): Translations {
  return DICTIONARIES[code] || hi;
}

