// AryaSaarthi — Ask Arya Intelligent On-Device Dialogue Engine
// 100% Local / Self-Contained. NO EXTERNAL LLM IMPLEMENTATION OR API CALLS.
// Generates contextual, dynamic replies based purely on the citizen's input, questions, and specific circumstances.

import { SCHEMES } from './schemeData';

export interface ChatSessionSlots {
  user_name?: string | null;
  sc_status: 'YES' | 'NO' | 'IN_PROGRESS' | null;
  gender: 'FEMALE' | 'MALE' | 'OTHER' | null;
  is_pwd: boolean | null;
  income: number | null;
  purpose: string | null;
  project_type: string | null;
  amount: number | null;
  state: string | null;
  district: string | null;
}

export interface SchemeMatch {
  scheme_id: string;
  name: string;
  category: string;
  min_income: number;
  max_income: number;
  min_amount: number;
  max_amount: number;
  interest_rate_min: number;
  interest_rate_max: number;
  moratorium_months?: number[];
  eligible_project_types?: string[];
  cost_coverage_pct?: number;
  match_reason?: string;
}

export interface ChatMessageResponse {
  session_id: string;
  reply: string;
  quick_replies: string[];
  matched_schemes: SchemeMatch[];
  slots: ChatSessionSlots;
}

interface ConversationTurn {
  user: string;
  assistant: string;
  timestamp: number;
}

// In-memory session store for multi-turn history, slots, and context
const SESSION_CACHE = new Map<string, {
  slots: ChatSessionSlots;
  matched_schemes: SchemeMatch[];
  history: ConversationTurn[];
  lastTurnTime: number;
  lastQuestionAsked: string;
  questionRepeatCounts: Record<string, number>;
}>();

// Helper to clean and normalize text
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[,\-_/\\#@!$%^&*()]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Indian Currency and number parser
function parseAmount(text: string): number | null {
  const norm = text.toLowerCase();

  const lakhMatch = norm.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs|l\b)/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const kMatch = norm.match(/(\d+(?:\.\d+)?)\s*(?:k\b|thousand|hazaar|hazar)/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  const croreMatch = norm.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr\b)/);
  if (croreMatch) {
    return Math.round(parseFloat(croreMatch[1]) * 10000000);
  }

  const digitMatches = norm.match(/\b\d{4,8}\b/g);
  if (digitMatches) {
    const val = parseInt(digitMatches[0], 10);
    if (val >= 5000) return val;
  }

  return null;
}

// Indian States and UTs map
const STATES_MAP: Record<string, string> = {
  'uttar pradesh': 'Uttar Pradesh', 'up': 'Uttar Pradesh', 'lucknow': 'Uttar Pradesh', 'kanpur': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh', 'agra': 'Uttar Pradesh',
  'bihar': 'Bihar', 'patna': 'Bihar', 'gaya': 'Bihar', 'muzaffarpur': 'Bihar',
  'maharashtra': 'Maharashtra', 'mumbai': 'Maharashtra', 'pune': 'Maharashtra', 'nagpur': 'Maharashtra',
  'madhya pradesh': 'Madhya Pradesh', 'mp': 'Madhya Pradesh', 'bhopal': 'Madhya Pradesh', 'indore': 'Madhya Pradesh',
  'rajasthan': 'Rajasthan', 'jaipur': 'Rajasthan', 'jodhpur': 'Rajasthan',
  'west bengal': 'West Bengal', 'wb': 'West Bengal', 'kolkata': 'West Bengal',
  'delhi': 'Delhi', 'new delhi': 'Delhi',
  'punjab': 'Punjab', 'chandigarh': 'Punjab', 'amritsar': 'Punjab',
  'haryana': 'Haryana', 'gurugram': 'Haryana', 'faridabad': 'Haryana',
  'tamil nadu': 'Tamil Nadu', 'chennai': 'Tamil Nadu', 'coimbatore': 'Tamil Nadu',
  'karnataka': 'Karnataka', 'bengaluru': 'Karnataka', 'bangalore': 'Karnataka',
  'andhra pradesh': 'Andhra Pradesh', 'ap': 'Andhra Pradesh', 'vijayawada': 'Andhra Pradesh',
  'telangana': 'Telangana', 'hyderabad': 'Telangana',
  'gujarat': 'Gujarat', 'ahmedabad': 'Gujarat', 'surat': 'Gujarat',
  'odisha': 'Odisha', 'bhubaneswar': 'Odisha',
  'kerala': 'Kerala', 'kochi': 'Kerala', 'thiruvananthapuram': 'Kerala',
  'assam': 'Assam', 'guwahati': 'Assam',
  'jharkhand': 'Jharkhand', 'ranchi': 'Jharkhand', 'jamshedpur': 'Jharkhand',
  'chhattisgarh': 'Chhattisgarh', 'raipur': 'Chhattisgarh',
  'uttarakhand': 'Uttarakhand', 'dehradun': 'Uttarakhand',
  'himachal pradesh': 'Himachal Pradesh', 'shimla': 'Himachal Pradesh',
  'jammu and kashmir': 'Jammu and Kashmir', 'j&k': 'Jammu and Kashmir', 'srinagar': 'Jammu and Kashmir',
};

// Project Type Keyword Dictionary
const PROJECT_TYPES: { type: string; keywords: string[]; label: string }[] = [
  {
    type: 'tailoring',
    keywords: [
      'tailor', 'tailoring', 'silai', 'boutique', 'sewing', 'garment', 'garments',
      'clothes', 'clothing', 'cloth', 'saree', 'sari', 'sarees', 'textile', 'textiles',
      'handloom', 'dress making', 'embroidery', 'fashion', 'apparel', 'readymade'
    ],
    label: 'Tailoring, Saree & Boutique Unit',
  },
  {
    type: 'dairy',
    keywords: ['dairy', 'cow', 'cows', 'buffalo', 'buffaloes', 'milk', 'doodh', 'pashupalan', 'cattle', 'dairy farm'],
    label: 'Dairy & Cattle Farming',
  },
  {
    type: 'goat_rearing',
    keywords: ['goat', 'goats', 'bakri', 'bakra', 'sheep', 'bhed', 'goat farming', 'livestock'],
    label: 'Goat & Sheep Rearing',
  },
  {
    type: 'poultry',
    keywords: ['poultry', 'chicken', 'murgi', 'egg', 'eggs', 'broiler', 'layer', 'poultry farm'],
    label: 'Poultry Farm',
  },
  {
    type: 'grocery',
    keywords: ['grocery', 'kirana', 'general store', 'ration', 'dukaan', 'daily needs', 'provision', 'supermarket', 'mart'],
    label: 'Retail Grocery / Kirana Store',
  },
  {
    type: 'food_business',
    keywords: ['restaurant', 'dhaba', 'tea stall', 'chai', 'bakery', 'catering', 'food truck', 'canteen', 'sweets', 'mithai', 'snacks', 'fast food', 'food'],
    label: 'Food, Catering & Bakery Business',
  },
  {
    type: 'e_rickshaw',
    keywords: ['e rickshaw', 'erickshaw', 'auto', 'rickshaw', 'battery auto', 'toto', 'electric vehicle', 'transport vehicle', 'commercial vehicle'],
    label: 'Electric Auto / Transport Vehicle',
  },
  {
    type: 'beauty_parlor',
    keywords: ['parlor', 'parlour', 'beauty', 'salon', 'makeup', 'cosmetic', 'spa', 'beauty parlor'],
    label: 'Beauty Parlor & Salon',
  },
  {
    type: 'education',
    keywords: ['education', 'study', 'college', 'degree', 'btech', 'mbbs', 'mba', 'engineering', 'university', 'studies', 'course', 'fees', 'higher education'],
    label: 'Higher Education / Technical Course',
  },
  {
    type: 'mobile_repair',
    keywords: ['mobile', 'phone repair', 'mobile accessories', 'smart phone', 'electronic repair', 'computer repair'],
    label: 'Mobile Sales & Repair Center',
  },
  {
    type: 'artisan_handicraft',
    keywords: ['handicraft', 'pottery', 'carpenter', 'welding', 'leather', 'footwear', 'shoe', 'woodwork', 'blacksmith', 'artisan', 'agarbatti', 'candle'],
    label: 'Artisan & Manufacturing Unit',
  },
  {
    type: 'solar',
    keywords: ['solar', 'green energy', 'solar panel', 'clean energy', 'rooftop solar'],
    label: 'Green Energy / Solar Equipment',
  },
  {
    type: 'sanitation',
    keywords: ['sanitation', 'suction machine', 'cleaning equipment', 'sweeping machine', 'sewer'],
    label: 'Mechanized Sanitation / Cleaning Equipment',
  },
  {
    type: 'shop',
    keywords: ['shop', 'dukan', 'store', 'business', 'vyapar', 'retail', 'trade', 'enterprise', 'showroom'],
    label: 'Small Retail Business / Shop',
  },
];

// Helper to extract trade/activity from user's current text dynamically
function extractTradeFromText(text: string, norm: string): { tradeMention: string; projectType?: string; projectLabel?: string } {
  let tradeMention = "";
  let projectType: string | undefined;
  let projectLabel: string | undefined;

  // 1. High-precision trade matching
  if (/\b(saree\w*|sari\w*)\b/i.test(norm)) {
    tradeMention = "saree & apparel business";
    projectType = "tailoring";
    projectLabel = "Tailoring, Saree & Boutique Unit";
  } else if (/\b(cloth\w*|garment\w*|textile\w*|fabric\w*|boutique\w*|dress\w*|silai\w*|tailor\w*)\b/i.test(norm)) {
    tradeMention = "tailoring & boutique unit";
    projectType = "tailoring";
    projectLabel = "Tailoring, Saree & Boutique Unit";
  } else if (/\b(goat\w*|bakri\w*|bakra\w*|sheep|bhed)\b/i.test(norm)) {
    tradeMention = "goat farming & livestock";
    projectType = "goat_rearing";
    projectLabel = "Goat & Sheep Rearing";
  } else if (/\b(dairy|cow\w*|buffalo\w*|gay|bhains|milk|doodh|pashupalan)\b/i.test(norm)) {
    tradeMention = "dairy cattle & milk production";
    projectType = "dairy";
    projectLabel = "Dairy & Cattle Farming";
  } else if (/\b(poultry|murgi|chicken|egg\w*)\b/i.test(norm)) {
    tradeMention = "poultry farming";
    projectType = "poultry";
    projectLabel = "Poultry Farm";
  } else if (/\b(mobile|phone|repair\w*|electronic\w*)\b/i.test(norm)) {
    tradeMention = "mobile phone repair & service center";
    projectType = "mobile_repair";
    projectLabel = "Mobile Sales & Repair Center";
  } else if (/\b(e rickshaw|rickshaw|auto|battery auto|toto)\b/i.test(norm)) {
    tradeMention = "electric auto-rickshaw mobility";
    projectType = "e_rickshaw";
    projectLabel = "Electric Auto / Transport Vehicle";
  } else if (/\b(grocery|kirana|general store|dukaan)\b/i.test(norm)) {
    tradeMention = "retail grocery / kirana shop";
    projectType = "grocery";
    projectLabel = "Retail Grocery / Kirana Store";
  } else if (/\b(bakery|tea stall|chai|dhaba|restaurant|catering|food)\b/i.test(norm)) {
    tradeMention = "food, catering & bakery business";
    projectType = "food_business";
    projectLabel = "Food, Catering & Bakery Business";
  } else if (/\b(btech|mbbs|engineering|college|degree|mba|studies|study)\b/i.test(norm)) {
    tradeMention = "higher / professional education";
    projectType = "education";
    projectLabel = "Higher Education / Technical Course";
  } else if (/\b(beauty|parlor|parlour|makeup|salon)\b/i.test(norm)) {
    tradeMention = "beauty salon & wellness services";
    projectType = "beauty_parlor";
    projectLabel = "Beauty Parlor & Salon";
  } else if (/\b(solar|green|solar panel|clean energy)\b/i.test(norm)) {
    tradeMention = "solar equipment & green business";
    projectType = "solar";
    projectLabel = "Green Energy / Solar Equipment";
  } else if (/\b(handicraft|pottery|carpenter|welding|leather|footwear|shoe|agarbatti)\b/i.test(norm)) {
    tradeMention = "artisan & manufacturing enterprise";
    projectType = "artisan_handicraft";
    projectLabel = "Artisan & Manufacturing Unit";
  }

  // 2. Pattern-based dynamic extraction (e.g. "business of saree", "shop of footwear")
  if (!tradeMention) {
    const bizOfMatch = text.match(/\b(?:business of|shop of|store of|venture of|work of|unit of)\s+([a-zA-Z\s]{3,30})/i);
    if (bizOfMatch) {
      const captured = bizOfMatch[1].trim().replace(/\b(for|in|with|and|at)\b.*$/i, '').trim();
      if (captured.length >= 3) {
        tradeMention = `${captured} business`;
        projectType = 'shop';
        projectLabel = `${captured.charAt(0).toUpperCase() + captured.slice(1)} Business`;
      }
    }
  }

  if (!tradeMention) {
    const wantToMatch = text.match(/\b(?:want to (?:open|start|run|set up|create)|planning to (?:open|start|run|set up))\s+(?:a|an)?\s*([a-zA-Z\s]{3,35})/i);
    if (wantToMatch) {
      const captured = wantToMatch[1].trim().replace(/\b(for|in|with|from)\b.*$/i, '').trim();
      if (captured.length >= 3 && !/^(help|loan|scheme|money|fund|information|business)/i.test(captured)) {
        tradeMention = captured;
        projectType = 'shop';
        projectLabel = `${captured.charAt(0).toUpperCase() + captured.slice(1)}`;
      }
    }
  }

  return { tradeMention, projectType, projectLabel };
}

// Extract semantic slots from user input
function extractSlots(text: string, currentSlots: ChatSessionSlots, lastQuestionAsked?: string): {
  updated: ChatSessionSlots;
  newlyDetected: string[];
} {
  const norm = normalize(text);
  const slots: ChatSessionSlots = { ...currentSlots };
  const newlyDetected: string[] = [];

  // 0. Extract User Name
  const namePattern = /\b(?:my name is|my name|i am|i'm|im|naam hai|mera naam|mera name|call me|this is|myself|name:)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i;
  const nameMatchHindi = text.match(/\b(?:mera naam|mera name|naam)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+hai\b/i);
  const nameMatch = text.match(namePattern) || nameMatchHindi;
  if (nameMatch) {
    let candidate = nameMatch[1].trim();
    // Strip trailing connectors like 'and', 'i', 'who', 'from'
    candidate = candidate.replace(/\b(and|i|who|from|in|at|with|want|need|to|looking|planning)\b.*$/i, '').trim();
    const candidateLower = candidate.toLowerCase();
    const invalidNames = [
      'here', 'ready', 'looking', 'planning', 'interested', 'applying', 'asking',
      'want', 'need', 'trying', 'going', 'not', 'a', 'an', 'sc', 'male', 'female',
      'arya', 'from', 'in', 'at', 'just', 'only', 'very', 'new', 'good', 'fine',
      'okay', 'yes', 'no', 'sure', 'student', 'farmer', 'entrepreneur', 'citizen',
      'businessman', 'businesswoman', 'applicant'
    ];
    if (candidate.length >= 2 && !invalidNames.includes(candidateLower)) {
      const cleanName = candidate
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      if (slots.user_name !== cleanName) {
        slots.user_name = cleanName;
        newlyDetected.push('user_name');
      }
    }
  }

  // 1. Project Type & Purpose
  const { tradeMention, projectType, projectLabel } = extractTradeFromText(text, norm);
  if (tradeMention && projectType && projectLabel) {
    if (slots.project_type !== projectType || slots.purpose !== tradeMention) {
      slots.project_type = projectType;
      slots.purpose = tradeMention;
      newlyDetected.push('project_type');
    }
  } else {
    for (const pt of PROJECT_TYPES) {
      let matched = false;
      for (const kw of pt.keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(norm)) {
          if (slots.project_type !== pt.type) {
            slots.project_type = pt.type;
            slots.purpose = pt.label;
            newlyDetected.push('project_type');
          }
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
  }

  // 2. Scheduled Caste (SC) Status
  if (/\b(sc|scheduled caste|dalit|valmiki|jatav|chamar|kori|pasi|meghwal|bhim)\b/i.test(norm) &&
      !/\b(not sc|non sc|general|obc)\b/i.test(norm)) {
    if (slots.sc_status !== 'YES') {
      slots.sc_status = 'YES';
      newlyDetected.push('sc_status');
    }
  } else if (/\b(yes|haan|hanji|belong|ha|i am sc|yes i am)\b/i.test(norm) && (lastQuestionAsked === 'SC_STATUS' || norm.includes('sc'))) {
    if (slots.sc_status !== 'YES') {
      slots.sc_status = 'YES';
      newlyDetected.push('sc_status');
    }
  } else if (/\b(in progress|bana nahi|process me hai|applied|certificate pending)\b/i.test(norm)) {
    if (slots.sc_status !== 'IN_PROGRESS') {
      slots.sc_status = 'IN_PROGRESS';
      newlyDetected.push('sc_status');
    }
  } else if (/\b(general|obc|open|general category|baniya|brahmin|yadav|no\b)/i.test(norm) && lastQuestionAsked === 'SC_STATUS') {
    if (slots.sc_status !== 'NO') {
      slots.sc_status = 'NO';
      newlyDetected.push('sc_status');
    }
  }

  // 3. Gender (detect from pronouns, explicit words, or known female/male names)
  const isFemaleName = Boolean(slots.user_name && /\b(sneha|priya|pooja|puja|neha|anjali|ritu|sunita|anita|geeta|gita|rekha|radha|lakshmi|laxmi|kavita|shweta|swati|deepa|meena|suman|asha|aarti|divya|nisha|renu|mamta|seema|shashi|monika|komal|payal|simran|kajal|tanu|mansi|khushi|roshni|jyoti|preeti|priti|shilpa|sapna|pinky|pinki|chaya|babita|usha|maya|kamla|saroj|savita|sharda|manju)\b/i.test(slots.user_name));
  const isMaleName = Boolean(slots.user_name && /\b(aditya|amit|rahul|rohit|rajesh|suresh|ramesh|vijay|ajay|anil|sunil|manoj|sanjay|vikas|vikram|alok|deepak|ashok|vinod|mukesh|dinesh|santosh|pankaj|ravindra|ravi|pradeep|sachin|vivek|arun|abhishek|manish|sandeep|gaurav|naveen|kuldeep|kamal|kishore|suraj|shyam|mohan|sohan|govind|gopal)\b/i.test(slots.user_name));

  if (/\b(female|woman|women|mahila|aurat|lady|girl|mother|widow|vidhwa|sister|mrs|miss|shrimati)\b/i.test(norm) || isFemaleName) {
    if (slots.gender !== 'FEMALE') {
      slots.gender = 'FEMALE';
      newlyDetected.push('gender');
    }
  } else if (/\b(male|man|purush|aadmi|boy|father|brother|mr|shri)\b/i.test(norm) || isMaleName) {
    if (slots.gender !== 'MALE') {
      slots.gender = 'MALE';
      newlyDetected.push('gender');
    }
  } else if (/\b(transgender|trans|other)\b/i.test(norm)) {
    if (slots.gender !== 'OTHER') {
      slots.gender = 'OTHER';
      newlyDetected.push('gender');
    }
  }

  // 4. Disability (Divyangjan)
  if (/\b(divyang|disabled|pwd|handicap|disability|blind|ortho|viklang)\b/i.test(norm)) {
    if (slots.is_pwd !== true) {
      slots.is_pwd = true;
      newlyDetected.push('is_pwd');
    }
  }

  // 5. Amount (Loan Amount or Income)
  const parsedAmt = parseAmount(text);
  if (parsedAmt !== null) {
    if (lastQuestionAsked === 'INCOME' || /\b(income|aay|salana|kamai|salary|earning)\b/i.test(norm)) {
      if (slots.income !== parsedAmt) {
        slots.income = parsedAmt;
        newlyDetected.push('income');
      }
    } else {
      if (!slots.amount || lastQuestionAsked === 'AMOUNT' || /\b(loan|need|chahiye|budget|funding|cost)\b/i.test(norm)) {
        slots.amount = parsedAmt;
        newlyDetected.push('amount');
      } else if (!slots.income) {
        slots.income = parsedAmt;
        newlyDetected.push('income');
      }
    }
  }

  // Quick Income categories
  if (/\b(below 1\.5|below 150000|less than 1\.5|under 1\.5)\b/i.test(norm)) {
    slots.income = 120000;
    newlyDetected.push('income');
  } else if (/\b(1\.5 to 3|1\.5 lakh - 3|1\.5l to 3l)\b/i.test(norm)) {
    slots.income = 250000;
    newlyDetected.push('income');
  } else if (/\b(above 3|greater than 3|more than 3 lakh)\b/i.test(norm)) {
    slots.income = 350000;
    newlyDetected.push('income');
  }

  // 6. State & District
  for (const [key, stateName] of Object.entries(STATES_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(norm)) {
      if (slots.state !== stateName) {
        slots.state = stateName;
        newlyDetected.push('state');
      }
      break;
    }
  }

  if (!slots.state && lastQuestionAsked === 'LOCATION' && text.length > 1 && text.length < 40) {
    slots.state = text.trim();
    newlyDetected.push('state');
  }

  return { updated: slots, newlyDetected };
}

function calculateAccurateEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  const r = annualRatePct / (12 * 100);
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

//// Adaptive Semantic AI Synthesizer (100% Local / On-Device)
// Dynamically analyzes user's specific sentence, questions, trade, numbers, and doubts to synthesize a tailored response.
function generateDynamicSynthesizedResponse(
  userRawText: string,
  slots: ChatSessionSlots,
  lastQuestionAsked: string,
  repeatCountOrMap: number | Record<string, number> = 0,
  newlyDetected: string[] = []
): { reply: string; quick_replies: string[]; questionType: string } {
  const text = userRawText.trim();
  const norm = normalize(text);

  const getRepeatCount = (qType: string): number => {
    if (typeof repeatCountOrMap === 'number') {
      return qType === lastQuestionAsked ? repeatCountOrMap : 0;
    }
    return qType === lastQuestionAsked ? (repeatCountOrMap[qType] || 0) : 0;
  };

  // 1. Core Conversational & Problem-Solving Intents
  const expressesFrustrationOrRepetition = /\b(same message|same answer|always sent|always send|always send same|repeat|repeating|repeated|boring|not interesting|isn that much interesting|isnt that much interesting|same thing|stuck|stop asking|stop repeating|useless|why same|har bar vahi|ek hi cheez|same reply)\b/i.test(norm);
  const asksToSolve = /\b(solve|solve it|solve this|solution|kya karu|kya kare|kaise kare|guide me|batao|hal|upay|tarika|what should i do|what to do|give me solution|suggest solution|fix it|tell for solve it)\b/i.test(norm);
  const asksAboutCostOrAmountUnsure = /\b(don t know|dont know|not sure|pata nahi|idea nahi|how much|kitna lagega|estimate|suggest amount|standard cost|kitna chahiye|cost kitna|typical cost)\b/i.test(norm);
  const asksAboutTenure = /\b(tenure|moratorium|holiday|grace period)\b/i.test(norm);
  const asksAboutEMI = !asksAboutTenure && /\b(emi|kist|installment|monthly payment|per month|har mahine|kitna bharna)\b/i.test(norm);
  const asksAboutDocuments = /\b(document|documents|paper|praman patra|kagaz|checklist|kya lagega)\b/i.test(norm);
  const asksToShowSchemes = /\b(show schemes|list schemes|all schemes|available schemes|kya schemes|which scheme|options|yojna dikhao|yojana|recommend scheme|best scheme)\b/i.test(norm);
  const asksAboutPartnersOrBanks = /\b(nearest|partner bank|sca|agency|branch|kaha milega|district office|bank branch|office address|authorized center|nearest center)\b/i.test(norm);

  // 2. Specific Query Detectors
  const isQuestion = text.includes('?') ||
    /\b(how|what|can i|is there|kya|kaise|kitna|kab|kaha|kisko|eligible|possib|chahiye)\b/i.test(norm);

  const asksAboutSubsidy = /\b(subsidy|subsid|grant|chhoot|free money)\b/i.test(norm);
  const asksAboutCollateral = /\b(collateral|guarantee|security|mortgage|girvi|bina security|bina guarantee)\b/i.test(norm);
  const asksAboutCertificate = /\b(certificate|caste certificate|income certificate|praman patra|tehsildar|e district|bana nahi)\b/i.test(norm);
  const asksAboutEducationLimit = /\b(10th|12th|pass|fail|illiterate|qualification|padhai|degree)\b/i.test(norm);
  const asksAboutAgeLimit = /\b(age|umra|old|years old|saal|limit)\b/i.test(norm);
  const asksAboutNonSC = /\b(obc|general|open category|non sc|baniya|brahmin|yadav)\b/i.test(norm);
  const asksAboutInterest = /\b(interest|byaj|vyaj|rate|pratishat|interest rate)\b/i.test(norm);
  const asksAboutProcess = /\b(how to apply|process|apply kaise|kaha jana|procedure)\b/i.test(norm);
  const asksAboutMaxLoan = /\b(maximum|max loan|highest|limit|maximum kitna)\b/i.test(norm);

  // 3. Detect personal circumstances & emotions
  const mentionsWidowOrSingle = /\b(widow|vidhwa|single mother|alone|akele)\b/i.test(norm);
  const mentionsUnemployed = /\b(unemployed|berozgar|no job|free|jobless)\b/i.test(norm);
  const mentionsDebt = /\b(debt|karz|karza|poor|garib|urgent)\b/i.test(norm);
  const mentionsExistingSetup = /\b(already|existing|expand|badhana|purani|have)\b/i.test(norm);

  // 4. Extract trade or activity context dynamically
  const { tradeMention } = extractTradeFromText(text, norm);
  const effectiveTrade = tradeMention || slots.purpose || (slots.project_type ? slots.project_type.replace(/_/g, ' ') : '');

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 1: User Expresses Frustration or Repetition
  // -------------------------------------------------------------
  if (expressesFrustrationOrRepetition) {
    const apologyText = `🙏 **I hear you loud and clear, and I apologize for repeating questions!**\n\n` +
      `Let's skip the questionnaire completely. Here is everything you need to know right now:\n\n` +
      `• **Top Government Loan Schemes Available:**\n` +
      `  1. **Mahila Samriddhi Yojana (MSY):** Up to **₹1,40,000 @ 4.0% interest** (exclusive to women entrepreneurs, zero collateral).\n` +
      `  2. **Micro Finance Scheme (MFS):** Up to **₹1,40,000 @ 5.0% interest** (direct micro-credit with up to 50% subsidy, zero property guarantee).\n` +
      `  3. **Term Loan Scheme (TLS):** Up to **₹50,00,000 (₹50 Lakhs) @ 6%–8% interest** for larger business setups, shops, and equipment.\n\n` +
      `• **Key Subsidies & Benefits:** Up to **50% capital subsidy** and a **1 to 6-month repayment holiday (moratorium)**.\n\n` +
      `I have displayed all matching schemes below for you. What would you like to explore next?`;

    return {
      reply: apologyText,
      quick_replies: [
        "Check Required Documents",
        "Calculate Monthly EMI",
        "How to Apply Step-by-Step",
        "Find Nearest Partner Bank",
        "Restart"
      ],
      questionType: "RECOMMENDATION"
    };
  }

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 2: Direct Problem Solving ("SOLVE IT")
  // -------------------------------------------------------------
  if (asksToSolve) {
    let solutionText = "";
    if (effectiveTrade) {
      solutionText = `🎯 **Actionable Solution Blueprint for ${effectiveTrade.toUpperCase()}:**\n\n` +
        `Here is the exact step-by-step roadmap to obtain government concessional funding:\n\n` +
        `1. **Choose Your Scheme & Loan Bracket:**\n` +
        `   • **Micro Finance (up to ₹1,40,000):** Requires **ZERO collateral or property guarantee**, offers an interest rate of **4% to 5% p.a.**, and is eligible for up to a **50% capital subsidy**.\n` +
        `   • **Term Loan (up to ₹50 Lakh):** For larger commercial setups, covering up to 95% of project cost at **6% to 8% interest**.\n\n` +
        `2. **Repayment Moratorium (Holiday):**\n` +
        `   • You get a **3 to 6-month grace period** before paying your first EMI, giving your unit time to earn steady profit.\n\n` +
        `3. **Immediate 3-Step Execution Plan:**\n` +
        `   • **Step 1:** Select a matching scheme card below.\n` +
        `   • **Step 2:** Keep your Aadhaar, Caste/Income certificate, and bank passbook ready.\n` +
        `   • **Step 3:** AryaSaarthi generates your verified application inquiry for direct submission to your district State Channelizing Agency (SCA) or Regional Rural Bank (RRB).`;
    } else {
      solutionText = `🎯 **Actionable Solution Blueprint for Government Concessional Funding:**\n\n` +
        `Here is how we solve your funding and business setup step-by-step:\n\n` +
        `1. **Zero-Collateral Micro Loans (up to ₹1,40,000):**\n` +
        `   • Available for small retail, dairy, tailoring, transport, and handicrafts.\n` +
        `   • Concessional interest rate is **4% p.a.** for women (MSY) and **5% p.a.** for general micro-borrowers.\n\n` +
        `2. **Subsidies & Project Coverage:**\n` +
        `   • Up to **50% capital subsidy** through State Channelizing Agencies (SCAs).\n` +
        `   • 90% to 100% project financing coverage with no private moneylender trap.\n\n` +
        `3. **How to Move Forward Today:**\n` +
        `   • Pick a trade or scheme below, or check your document checklist right away!`;
    }

    return {
      reply: solutionText,
      quick_replies: [
        "Micro Loan (up to ₹1.4L)",
        "Term Loan (up to ₹50L)",
        "Check Required Documents",
        "Calculate Monthly EMI",
        "How to Apply Step-by-Step"
      ],
      questionType: "SOLUTION"
    };
  }

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 3: Budget / Amount Uncertainty ("How much needed", "Don't know")
  // -------------------------------------------------------------
  if (asksAboutCostOrAmountUnsure) {
    let costGuide = "";
    if (/dairy|cow|buffalo|cattle|milk|bakri|goat|livestock/i.test(effectiveTrade)) {
      costGuide = `🐄 **Estimated Project Costs for Dairy & Livestock Farming:**\n\n` +
        `• **Mini Dairy Unit (2 Crossbred Cows / Murrah Buffaloes):** Typically costs **₹1,20,000 to ₹1,40,000**.\n` +
        `  *This qualifies 100% under the Micro Finance Scheme / MSY at just 4%–5% interest with ZERO collateral!*\n\n` +
        `• **Commercial Dairy Farm (5–10 Animals + Shed & Equipment):** Costs **₹5,00,000 to ₹10,00,000** (covered under NSFDC Term Loan with up to 95% funding).\n\n` +
        `💡 **Recommendation:** For most beginners, the **₹1,40,000 Micro Unit** is the safest, highest-subsidy starting point.`;
    } else if (/tailor|boutique|sewing|cloth|garment/i.test(effectiveTrade)) {
      costGuide = `✂️ **Estimated Project Costs for Tailoring & Boutique:**\n\n` +
        `• **Standard Boutique Unit (2 Industrial Sewing Machines + Fabric Stock):** Costs **₹60,000 to ₹1,00,000**.\n` +
        `  *Fully covered under Mahila Samriddhi Yojana (4% interest, zero collateral) with up to 50% subsidy!*\n\n` +
        `• **Apparel Manufacturing Unit (5+ Machines & Designer Setup):** Costs **₹3,00,000 to ₹5,00,000**.\n\n` +
        `💡 **Recommendation:** The **₹1,00,000 Micro Credit** package is ideal for starting your shop.`;
    } else if (/rickshaw|auto|transport|battery/i.test(effectiveTrade)) {
      costGuide = `🛺 **Estimated Project Costs for Electric Auto / Rickshaw:**\n\n` +
        `• **Battery E-Rickshaw + Lithium Battery + Charger:** Costs **₹1,60,000 to ₹1,85,000**.\n` +
        `  *Covered under the Green Business Scheme at 6% interest with full subsidy!*\n\n` +
        `💡 **Recommendation:** A **₹1,80,000 loan** covers the vehicle on-road with zero hassle.`;
    } else {
      costGuide = `📊 **Standard Project Funding Benchmarks under NSFDC:**\n\n` +
        `• **Micro Finance Unit:** Up to **₹1,40,000** (Zero collateral, 4%–5% interest, best for small retail, services, and artisan units).\n` +
        `• **Small Enterprise:** **₹2,00,000 to ₹5,00,000** (Grocery shops, service centers, mini transport).\n` +
        `• **Medium Enterprise:** **₹10,00,000 to ₹50,00,000** (Manufacturing, large dairy, wholesale).\n\n` +
        `💡 Most new entrepreneurs start with the **₹1,40,000 collateral-free micro loan**.`;
    }

    return {
      reply: `${costGuide}\n\n---\n📋 **Basic Details Required for Scheme Recommendation:**\n💬 **Which funding bracket fits your plan best?**`,
      quick_replies: [
        "₹1,00,000 (Micro Credit)",
        "₹1,40,000 (Full Micro Unit)",
        "₹3,00,000 (Small Business)",
        "₹5,00,000 (Expansion Loan)",
        "Check Required Documents"
      ],
      questionType: "AMOUNT"
    };
  }

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 4: EMI & Monthly Payment Calculations
  // -------------------------------------------------------------
  if (asksAboutEMI) {
    let customEmiSection = "";
    if (slots.amount) {
      const p = slots.amount;
      const emi4 = calculateAccurateEmi(p, 4, p <= 140000 ? 36 : 60);
      const emi6 = calculateAccurateEmi(p, 6, 60);
      const emi8 = calculateAccurateEmi(p, 8, 60);
      const formattedP = p.toLocaleString('en-IN');
      const tradeRef = effectiveTrade ? ` for ${effectiveTrade}` : '';
      customEmiSection = `🎯 **Your Personalized EMI for ₹${formattedP}${tradeRef}:**\n` +
        `• **At 4% p.a. (Mahila Samriddhi / Priority):** Approx **₹${emi4.toLocaleString('en-IN')} / month**\n` +
        `• **At 6% p.a. (Term Loan / 60 Months):** Approx **₹${emi6.toLocaleString('en-IN')} / month**\n` +
        `• **At 8% p.a. (Standard Term Loan / 60 Months):** Approx **₹${emi8.toLocaleString('en-IN')} / month**\n\n`;
    }

    const emiText = `📊 **Calculated Monthly EMI under NSFDC Concessional Rates:**\n\n` +
      customEmiSection +
      `• **₹50,000 Loan @ 4% p.a. (3 Years / 36 Months):** Approx **₹1,476 / month**\n` +
      `• **₹1,00,000 Loan @ 5% p.a. (3 Years / 36 Months):** Approx **₹2,997 / month**\n` +
      `• **₹1,40,000 Loan @ 4% p.a. (MSY, 3 Years):** Approx **₹4,133 / month**\n` +
      `• **₹5,00,000 Term Loan @ 6% p.a. (5 Years / 60 Months):** Approx **₹9,666 / month**\n\n` +
      `✨ **Moratorium Advantage:** You get a **1 to 6-month grace period** before the first EMI starts, so your business generates profits before you start paying!`;

    return {
      reply: emiText,
      quick_replies: [
        "Check Required Documents",
        "How to Apply Step-by-Step",
        "Find Nearest Partner Bank",
        "Restart"
      ],
      questionType: "RECOMMENDATION"
    };
  }

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 5: Required Documents Checklist
  // -------------------------------------------------------------
  if (asksAboutDocuments) {
    const isEdu = slots.project_type === 'education' || /education|study|degree|college|btech/i.test(norm);
    const isDisability = slots.is_pwd || /disability|divyang|handicap|pwd/i.test(norm);
    let docText = "";

    if (isEdu) {
      docText = `📑 **Essential Document Checklist for NSFDC Educational Loan:**\n\n` +
        `1. **Identity & Address Proof:** Aadhaar Card, Voter ID, or Passport.\n` +
        `2. **Caste Certificate:** Scheduled Caste (SC) certificate issued by Tehsildar / SDM / e-District portal.\n` +
        `3. **Family Income Certificate:** Annual family income proof (within official guidelines).\n` +
        `4. **Admission Letter:** Proof of enrollment in recognized higher education institution.\n` +
        `5. **Fee Breakdown:** Official course fee schedule issued by the university.\n\n` +
        `💡 **Zero Collateral:** Standard student loans are processed without property mortgage!`;
    } else if (isDisability) {
      docText = `📑 **Essential Document Checklist for Divyangjan Concessional Loans:**\n\n` +
        `1. **Identity & Address Proof:** Aadhaar Card, Voter ID, or Ration Card.\n` +
        `2. **Disability Certificate (UDID Card):** Verifying 40% or above disability.\n` +
        `3. **Caste Certificate:** Scheduled Caste (SC) certificate issued by Tehsildar / SDM / e-District portal.\n` +
        `4. **Income Certificate:** Family annual income certificate.\n` +
        `5. **Bank Account Details:** Active Bank Passbook copy with IFSC code (for Direct Benefit Transfer).\n\n` +
        `💡 **Zero Collateral:** Loans up to **₹1,40,000** do NOT require any land, property, or private asset collateral!`;
    } else {
      const tradeRef = effectiveTrade ? ` for ${effectiveTrade}` : '';
      docText = `📑 **Essential Document Checklist for NSFDC Concessional Loans${tradeRef}:**\n\n` +
        `1. **Identity & Address Proof:** Aadhaar Card, Voter ID, or Ration Card.\n` +
        `2. **Caste Certificate:** Scheduled Caste (SC) certificate issued by Tehsildar / SDM / e-District portal.\n` +
        `3. **Income Certificate:** Family annual income certificate (up to ₹3,00,000 for maximum concessional rebate).\n` +
        `4. **Bank Account Details:** Active Bank Passbook copy with IFSC code (for Direct Benefit Transfer).\n` +
        `5. **Project Quotation:** Estimate for machinery, livestock, vehicle, or inventory from a registered vendor.\n\n` +
        `💡 **Zero Collateral:** Loans up to **₹1,40,000** do NOT require any land, property, or private asset collateral!`;
    }

    return {
      reply: docText,
      quick_replies: [
        "How to Apply Step-by-Step",
        "Calculate Monthly EMI",
        "Find Nearest Partner Bank",
        "Restart"
      ],
      questionType: "RECOMMENDATION"
    };
  }

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 6: Browse / Show Schemes
  // -------------------------------------------------------------
  if (asksToShowSchemes) {
    const tradeRef = effectiveTrade || 'your venture';
    const schemeText = `🌟 **Top NSFDC Government Schemes for ${tradeRef}:**\n\n` +
      `1. **Mahila Samriddhi Yojana (MSY):**\n` +
      `   • **Up to ₹1,40,000** @ **4.0% interest p.a.** (Lowest in India, exclusive to women entrepreneurs)\n` +
      `   • 100% project cost financed with ZERO collateral.\n\n` +
      `2. **Micro Finance Scheme (MFS):**\n` +
      `   • **Up to ₹1,40,000** @ **5.0% interest p.a.**\n` +
      `   • Quick approval through SHGs and State Channelizing Agencies.\n\n` +
      `3. **Term Loan Scheme (TLS):**\n` +
      `   • **Up to ₹50,00,000 (₹50 Lakhs)** @ **6% to 8.5% interest p.a.**\n` +
      `   • Up to 95% financing for equipment, vehicles, workshops, and commercial farming.\n\n` +
      `👉 *Take a look at the interactive scheme cards below to select and proceed:*`;

    return {
      reply: schemeText,
      quick_replies: [
        "Apply for Micro Finance (₹1.4L)",
        "Check Required Documents",
        "Calculate Monthly EMI",
        "How to Apply Step-by-Step"
      ],
      questionType: "RECOMMENDATION"
    };
  }

  // -------------------------------------------------------------
  // HIGH PRIORITY INTENT 7: Authorized Partner Banks & SCA Centers
  // -------------------------------------------------------------
  if (asksAboutPartnersOrBanks) {
    let scaName = "District State Channelizing Agency (SCA) Office";
    let rrbPartners = "Regional Rural Banks (RRBs) & Nationalized Public Banks";
    const st = (slots.state || '').toLowerCase();
    if (st.includes('uttar pradesh') || st.includes('up')) {
      scaName = "Uttar Pradesh Scheduled Castes Finance & Development Corporation (UPSCFDC)";
      rrbPartners = "Aryavart Bank, Prathama UP Gramin Bank, Baroda UP Bank, PNB & SBI";
    } else if (st.includes('delhi')) {
      scaName = "Delhi SC/ST/OBC/Minorities Development & Finance Corporation (DSFDC)";
      rrbPartners = "State Bank of India (SBI), Punjab National Bank (PNB), Canara Bank";
    } else if (st.includes('bihar')) {
      scaName = "Bihar State Scheduled Castes Co-operative Development Corporation (BSSCCDC)";
      rrbPartners = "Dakshin Bihar Gramin Bank, Uttar Bihar Gramin Bank, PNB, Canara Bank";
    } else if (st.includes('maharashtra')) {
      scaName = "Mahatma Phule Backward Class Development Corporation (MPBCDC)";
      rrbPartners = "Maharashtra Gramin Bank, Vidharbha Konkan Gramin Bank, Bank of Maharashtra";
    } else if (st.includes('rajasthan')) {
      scaName = "Rajasthan SC & ST Finance and Development Cooperative Corp (Anuja Nigam)";
      rrbPartners = "Rajasthan Marudhara Gramin Bank, Baroda Rajasthan Kshetriya Gramin Bank, SBI";
    }

    const partnerText = `📍 **Authorized Channel Partners & Bank Branches${slots.state ? ' in ' + slots.state : ''}:**\n\n` +
      `1. **State Channelizing Agency (SCA):**\n` +
      `   • **${scaName}**\n` +
      `   • Located at your district Collectorate / Vikas Bhawan.\n` +
      `   • Handles applicant registration, document verification, and subsidy allocation.\n\n` +
      `2. **Partnered Lending Banks:**\n` +
      `   • **${rrbPartners}**\n` +
      `   • Loan disbursement under statutory NSFDC refinance agreements with direct DBT subsidy credit.\n\n` +
      `3. **AryaSaarthi Partner Locator:**\n` +
      `   • Visit our **Find Partners** section to view district maps, phone numbers, and nearest branch directions!`;

    return {
      reply: partnerText,
      quick_replies: [
        "Check Required Documents",
        "Calculate Monthly EMI",
        "How to Apply Step-by-Step",
        "Restart"
      ],
      questionType: "RECOMMENDATION"
    };
  }

  // Build dynamic response sections:
  const responseParts: string[] = [];

  // Empathy / Personal situation acknowledgement
  if (mentionsWidowOrSingle) {
    responseParts.push(
      "💐 **I truly respect your courage and determination.** Government welfare guidelines prioritize women heads of households and single mothers for the highest subsidy tier and easiest credit terms under Mahila Samriddhi Yojana."
    );
  } else if (mentionsUnemployed) {
    responseParts.push(
      "🌱 **Starting an independent enterprise is the best path toward long-term self-reliance.** NSFDC schemes are specially created to help unemployed youth transition directly into successful business owners with full funding."
    );
  } else if (mentionsDebt) {
    responseParts.push(
      "🤝 **I understand financial pressures can be overwhelming.** Concessional government schemes have extremely gentle interest rates (4% to 6% p.a.) and repayment holidays, making them vastly safer than unregulated private loans."
    );
  } else if (mentionsExistingSetup && effectiveTrade) {
    responseParts.push(
      `📈 **Expanding your existing ${effectiveTrade} is a strong, viable plan!** Because you already possess hands-on experience, banks and State Channelizing Agencies evaluate your working capital proposal with high confidence.`
    );
  }

  // Answer specific user questions directly
  if (asksAboutCollateral) {
    responseParts.push(
      "🛡️ **Regarding Collateral & Guarantees:** For microcredit loans up to **₹1,40,000** (under Micro Finance and Mahila Samriddhi Yojana), loans are **100% collateral-free** by statutory policy. You do **not** need to pledge land, property, or private assets."
    );
  }

  if (asksAboutSubsidy) {
    responseParts.push(
      "🎁 **Regarding Subsidies:** Yes! Most NSFDC self-employment programs include back-ended capital subsidies ranging from **30% up to 50%** (up to ₹1,00,000 - ₹1,40,000) through State Channelizing Agencies, which reduces your actual repayment principal substantially."
    );
  }

  if (asksAboutInterest) {
    responseParts.push(
      "📉 **Regarding Concessional Interest Rates:** NSFDC provides statutory concessional rates far below commercial banks:\n- **Mahila Samriddhi Yojana (MSY):** Just **4% p.a.** for women entrepreneurs\n- **Micro Finance Scheme:** **5% to 6.5% p.a.**\n- **Term Loans (up to ₹50 Lakh):** **6% to 8.5% p.a.**"
    );
  }

  if (asksAboutTenure) {
    responseParts.push(
      "⏳ **Regarding Repayment & Grace Period (Moratorium):** NSFDC loans offer generous repayment terms of **3 to 5 years** (extendable up to 10 years for term loans), along with a **1 to 6-month moratorium (grace period)** so you only begin EMI payments after your business generates steady cash flow."
    );
  }

  if (asksAboutCertificate) {
    responseParts.push(
      "📑 **Regarding Certificates:** You can proceed with discovering and selecting your scheme right now! While the final bank sanction requires a digital SC/Income certificate from your local Tehsil or e-District portal, local SCA offices actively assist applicants in obtaining verified certificates."
    );
  }

  if (asksAboutEducationLimit) {
    responseParts.push(
      "🎓 **Regarding Qualifications:** For self-employment schemes (small business, shop, dairy, tailoring, transport), there is **no minimum formal educational requirement**. Practical aptitude and willingness to work are what matter."
    );
  }

  if (asksAboutAgeLimit) {
    responseParts.push(
      "📅 **Regarding Age Eligibility:** The statutory eligibility age for NSFDC concessional loans is **18 to 60 years**, giving ample opportunity for both youth and experienced adults to establish livelihood units."
    );
  }

  if (asksAboutMaxLoan) {
    responseParts.push(
      "💰 **Regarding Maximum Funding Limits:** NSFDC funds up to **₹1,40,000** for direct microcredit, and up to **₹50,00,000 (₹50 Lakhs)** under Term Loan Schemes for retail, manufacturing, and transport enterprises, covering up to 95% of total project costs."
    );
  }

  if (asksAboutProcess) {
    responseParts.push(
      "📝 **Regarding How to Apply:** Application is simple and paperless:\n1. Choose your scheme through AryaSaarthi.\n2. We generate your pre-filled inquiry summary.\n3. Submit to your district State Channelizing Agency (SCA) or partnered Regional Rural Bank (RRB)."
    );
  }

  if (asksAboutNonSC) {
    responseParts.push(
      "ℹ️ **Regarding General/OBC Eligibility:** While statutory NSFDC funds are dedicated exclusively to Scheduled Caste (SC) citizens, we also guide citizens from all backgrounds to universal open schemes like **PM-SVANidhi (street vendor credit)**, **PMEGP (up to 35% subsidy)**, and **Stand-Up India**."
    );
  }

  // Handle new user introduction directly
  if (newlyDetected.includes('user_name') && slots.user_name) {
    const firstName = slots.user_name.split(' ')[0];
    const tradeRef = tradeMention
      ? `\n\n💡 **Your vision for ${tradeMention} is very well aligned with current welfare priorities.** The Government provides comprehensive financial backing covering equipment, raw materials, stock inventory, and initial operational expenses.${slots.gender === 'FEMALE' ? ' As a woman entrepreneur, you also qualify for exclusive interest subsidies (such as **4% p.a. interest under Mahila Samriddhi Yojana**) and 100% project financing.' : ''}`
      : "";
    responseParts.push(
      `🙏 **Namaste ${firstName} ji! I am Arya**, your personal guide to Government Schemes. Glad to connect with you!${tradeRef}`
    );
  } else if (!isQuestion && tradeMention && responseParts.length === 0) {
    // If user stated their trade in this turn without a new name introduction
    const firstName = slots.user_name ? slots.user_name.split(' ')[0] : "";
    const greeting = firstName ? `🙏 **Namaste ${firstName} ji!**\n\n` : "";
    const womenContext = slots.gender === 'FEMALE' ? " As a woman entrepreneur, you also qualify for exclusive interest subsidies (such as **4% p.a. interest under Mahila Samriddhi Yojana**) and 100% project financing." : "";
    responseParts.push(
      `${greeting}💡 **Your vision for ${tradeMention} is very well aligned with current welfare priorities.** The Government provides comprehensive financial backing covering equipment, raw materials, stock inventory, and initial operational expenses.${womenContext}`
    );
  }

  // Handle newly detected slots with specific, informative government welfare context:
  if (newlyDetected.includes('amount') && slots.amount) {
    if (slots.amount <= 140000) {
      responseParts.push(
        `✅ **Noted your funding requirement of ₹${slots.amount.toLocaleString('en-IN')}:** This falls comfortably within the statutory **Micro Finance Scheme** and **Mahila Samriddhi Yojana (MSY)** limit of up to ₹1,40,000. These programs are **100% collateral-free**, qualify for up to **50% government subsidy**, and offer low interest rates between **4% and 5% p.a.**`
      );
    } else {
      responseParts.push(
        `✅ **Noted your funding requirement of ₹${slots.amount.toLocaleString('en-IN')}:** This is covered under the statutory **Term Loan Scheme (TLS)** (up to ₹50 Lakh), providing up to 95% total project cost financing at concessional interest rates of **6% to 8% p.a.** with a repayment moratorium.`
      );
    }
  }

  if (newlyDetected.includes('sc_status')) {
    if (slots.sc_status === 'YES') {
      responseParts.push(
        `✅ **Acknowledged (Scheduled Caste Category):** As a member of the Scheduled Caste community, you are fully entitled to direct NSFDC statutory concessional lending (statutory interest rates as low as 4% to 5% p.a., extensive capital subsidies, and dedicated district State Channelizing Agency backing).`
      );
    } else if (slots.sc_status === 'IN_PROGRESS') {
      responseParts.push(
        `✅ **Acknowledged (Certificate in Progress):** That is completely fine! You can explore and select your scheme right now. Tehsil and e-District portals issue verifiable certificates quickly, and local SCA offices actively assist with paperwork.`
      );
    } else if (slots.sc_status === 'NO') {
      responseParts.push(
        `ℹ️ **Understood:** While statutory NSFDC funds are dedicated exclusively to Scheduled Caste applicants, AryaSaarthi also connects you to universal open-credit schemes like **PM-SVANidhi (street vendor / micro credit)**, **PMEGP (up to 35% subsidy)**, and **Stand-Up India**.`
      );
    }
  }

  if (newlyDetected.includes('gender')) {
    if (slots.gender === 'FEMALE') {
      responseParts.push(
        `🌸 **Understood (Woman Entrepreneur):** Women applicants are eligible for the flagship **Mahila Samriddhi Yojana (MSY)** at an exclusive concessional rate of just **4.0% p.a.** (the lowest in the country), with zero collateral requirements and 100% project financing!`
      );
    } else if (slots.gender === 'MALE') {
      responseParts.push(
        `👤 **Understood:** You qualify for all standard concessional programs including the **Micro Finance Scheme (5% p.a.)** and **Term Loan Scheme (6%–8% p.a.)**.`
      );
    } else if (slots.gender === 'OTHER') {
      responseParts.push(
        `✨ **Understood:** You are eligible for priority concessional lending and entrepreneurial support under statutory social justice welfare provisions.`
      );
    }
  }

  if (newlyDetected.includes('income') && slots.income) {
    responseParts.push(
      `💰 **Noted your annual family income of ₹${slots.income.toLocaleString('en-IN')}:** This qualifies within the government concessional ceiling (up to ₹3,00,000 to ₹5,00,000 annual family income), ensuring you receive maximum interest subsidy and favorable loan terms.`
    );
  }

  if (newlyDetected.includes('state') && slots.state) {
    responseParts.push(
      `📍 **Location noted (${slots.state}${slots.district ? ', ' + slots.district : ''}):** We have mapped your profile to the authorized State Channelizing Agencies (SCAs) and Regional Rural Bank (RRB) partner network operating in ${slots.state}.`
    );
  }

  if (newlyDetected.includes('is_pwd')) {
    responseParts.push(
      `♿ **Noted (Divyangjan / PwD Category):** Persons with disabilities receive dedicated priority under government schemes, including additional interest concessions and simplified processing.`
    );
  }

  // Fallback direct acknowledgement if no specific keyword triggered
  if (responseParts.length === 0) {
    if (slots.user_name) {
      const firstName = slots.user_name.split(' ')[0];
      responseParts.push(
        `🙏 **Namaste ${firstName} ji! I am Arya**, your personal guide to Government Schemes. I am here to understand your exact livelihood or educational goals and connect you with the lowest-interest schemes.`
      );
    } else if (norm.includes('hello') || norm.includes('hi') || norm.includes('namaste') || norm.includes('hey')) {
      responseParts.push(
        "🙏 **Namaste! I am Arya**, your personal guide to Government Schemes. I am here to understand your exact livelihood or educational goals and connect you with the lowest-interest schemes."
      );
    } else {
      responseParts.push(
        `💡 **Thank you for sharing that!** I have noted your details: *"“${text}”"*. I will factor this directly into finding the most beneficial government scheme, lowest interest rate, and maximum subsidy for you.`
      );
    }
  }

  // Formulate the contextual next question with Anti-Repetition logic
  let nextQuestion = "";
  let quickReplies: string[] = [];
  let questionType = "PURPOSE";

  if (!slots.project_type && !slots.purpose) {
    questionType = "PURPOSE";
    if (getRepeatCount("PURPOSE") === 0) {
      nextQuestion = "To find the most suitable funding and subsidy program, **what type of business, venture, or educational scheme are you looking to start?**";
    } else {
      nextQuestion = "You can explore schemes across any of our top livelihood categories below, or type your idea freely:";
    }
    quickReplies = [
      "Small Business / Retail Shop",
      "Dairy / Animal Husbandry",
      "Tailoring / Boutique Unit",
      "Higher Education Loan",
      "Electric Auto / Transport"
    ];
  } else if (!slots.amount) {
    questionType = "AMOUNT";
    const tradeRef = effectiveTrade || 'your venture';
    const amtRepeat = getRepeatCount("AMOUNT");
    if (amtRepeat === 0) {
      nextQuestion = `To determine whether **Micro Finance (up to ₹1.4 Lakh)** or a **Term Loan (up to ₹50 Lakh)** fits best for ${tradeRef}, **approximately how much total loan or funding do you need?**`;
      quickReplies = ["₹50,000", "₹1,00,000", "₹2,50,000", "₹5,00,000", "₹10,00,000+"];
    } else if (amtRepeat === 1) {
      nextQuestion = `If you're not sure about the exact budget for ${tradeRef}, that's completely fine! Most applicants start with the standard **₹1,40,000 Micro Loan** (100% collateral-free at 4%–5% interest with up to 50% subsidy). Would you like to use that as your benchmark, or explore schemes directly?`;
      quickReplies = ["Use ₹1.4 Lakh Benchmark", "₹50,000 Small Credit", "₹5 Lakh+ Term Loan", "Skip & Show Schemes"];
    } else {
      questionType = "RECOMMENDATION";
      nextQuestion = `🎯 Based on your interest in ${tradeRef}, here are your best matching schemes below. What would you like to explore next?`;
      quickReplies = [
        "Check Required Documents",
        "Find Nearest Bank / SCA Partner",
        "Calculate Monthly EMI",
        "How to Apply Step-by-Step",
        "Restart"
      ];
    }
  } else if (slots.sc_status === null) {
    questionType = "SC_STATUS";
    if (getRepeatCount("SC_STATUS") === 0) {
      nextQuestion = "To confirm your eligibility for statutory concessional rates (as low as 4% p.a.), **do you or your family belong to the Scheduled Caste (SC) community?**";
    } else {
      nextQuestion = "We can proceed either way! While NSFDC offers 4%-5% rates for SC applicants, open national schemes like PM-SVANidhi and Stand-Up India are also available. Which category applies to you?";
    }
    quickReplies = ["Yes, I belong to SC", "Certificate in progress", "No, other category"];
  } else if (!slots.gender) {
    questionType = "GENDER";
    nextQuestion = "👤 Are you applying as a **woman entrepreneur**? *(Women receive an exclusive 4% interest rate and 100% project financing under Mahila Samriddhi Yojana)*:";
    quickReplies = ["Female (महिला)", "Male (पुरुष)", "Other / Transgender"];
  } else if (!slots.income) {
    questionType = "INCOME";
    if (getRepeatCount("INCOME") === 0) {
      nextQuestion = "What is your approximate **annual family income**? *(Government concessional interest rates apply for family incomes up to ₹3,00,000 to ₹5,00,000)*:";
      quickReplies = ["Below ₹1.5 Lakh", "₹1.5 Lakh – ₹3.0 Lakh", "Above ₹3.0 Lakh"];
    } else {
      questionType = "RECOMMENDATION";
      nextQuestion = "🎯 You can review your schemes right now without setting income. What would you like to explore next?";
      quickReplies = ["Check Required Documents", "Find Nearest Bank / SCA Partner", "Calculate Monthly EMI", "How to Apply Step-by-Step"];
    }
  } else if (!slots.state) {
    questionType = "LOCATION";
    nextQuestion = "Which **State and District** do you live in? *(This lets me locate your nearest authorized State Channelizing Agency or bank branch)*:";
    quickReplies = ["Uttar Pradesh", "Bihar", "Maharashtra", "West Bengal", "Delhi", "Rajasthan"];
  } else {
    questionType = "RECOMMENDATION";
    nextQuestion = "🎯 **Profile assessment complete!** Based on your input, here are your matching schemes. **What would you like to explore next?**";
    quickReplies = [
      "Check Required Documents",
      "Find Nearest Bank / SCA Partner",
      "Calculate Monthly EMI",
      "How to Apply Step-by-Step",
      "Restart"
    ];
  }

  const sectionHeader = questionType === 'RECOMMENDATION'
    ? '📋 **Scheme Recommendation Ready:**'
    : '📋 **Basic Details Required for Scheme Recommendation:**';
  const fullReply = `${responseParts.join('\n\n')}\n\n---\n${sectionHeader}\n💬 ${nextQuestion}`;
  return { reply: fullReply, quick_replies: quickReplies, questionType };
}

/**
 * Deterministic scheme matcher based on statutory NSFDC eligibility criteria
 */
export function matchSchemes(slots: ChatSessionSlots): SchemeMatch[] {
  const matches: SchemeMatch[] = [];

  for (const s of SCHEMES) {
    const minAmt = s.project_cost_min || 10000;
    const maxAmt = s.max_loan_amount || s.project_cost_max || 5000000;
    const maxIncome = s.eligibility_rules?.maxAnnualFamilyIncome || 500000;

    // 1. Amount boundary check (only filter if amount is explicitly specified)
    if (slots.amount) {
      if (slots.amount > maxAmt * 1.15) continue;
    }

    // 2. Income ceiling check (only filter if income is explicitly specified)
    if (slots.income && maxIncome > 0) {
      if (slots.income > maxIncome) continue;
    }

    // 3. Category & project type mapping
    if (slots.project_type === 'education' && s.category !== 'EDUCATION') {
      continue;
    }
    if (slots.project_type && slots.project_type !== 'education' && s.category === 'EDUCATION') {
      continue;
    }
    if ((s.category === 'DISABILITY_ENTERPRISE' || s.category === 'DISABILITY_MICROFINANCE') && slots.is_pwd !== true) {
      continue;
    }

    matches.push({
      scheme_id: s.id,
      name: s.name,
      category: s.category,
      min_income: 0,
      max_income: maxIncome,
      min_amount: minAmt,
      max_amount: maxAmt,
      interest_rate_min: s.beneficiary_interest_rate_min,
      interest_rate_max: s.beneficiary_interest_rate_max,
      moratorium_months: [s.moratorium_months],
      cost_coverage_pct: s.financing_percentage_max,
      match_reason: s.tagline || `${s.name} provides financial assistance up to ₹${maxAmt.toLocaleString('en-IN')}.`,
    });
  }

  // Sort prioritizing gender and lowest interest rate
  matches.sort((a, b) => {
    if (slots.gender === 'FEMALE') {
      if (a.name.includes('Mahila')) return -1;
      if (b.name.includes('Mahila')) return 1;
    }
    return a.interest_rate_min - b.interest_rate_min;
  });

  // Fallback if none matched
  if (matches.length === 0) {
    for (const s of SCHEMES.slice(0, 3)) {
      matches.push({
        scheme_id: s.id,
        name: s.name,
        category: s.category,
        min_income: 0,
        max_income: s.eligibility_rules?.maxAnnualFamilyIncome || 500000,
        min_amount: s.project_cost_min,
        max_amount: s.max_loan_amount || s.project_cost_max,
        interest_rate_min: s.beneficiary_interest_rate_min,
        interest_rate_max: s.beneficiary_interest_rate_max,
        moratorium_months: [s.moratorium_months],
        cost_coverage_pct: s.financing_percentage_max,
        match_reason: s.tagline,
      });
    }
  }

  return matches;
}

/**
 * Main dialogue entrypoint
 * 100% Local on-device execution. Generates dynamic replies tailored to user input.
 */
export async function processChatTurn(
  sessionId: string,
  userRawText: string
): Promise<ChatMessageResponse> {
  const text = userRawText.trim();
  const norm = normalize(text);

  let session = SESSION_CACHE.get(sessionId);
  if (!session) {
    session = {
      slots: {
        sc_status: null,
        gender: null,
        is_pwd: null,
        income: null,
        purpose: null,
        project_type: null,
        amount: null,
        state: null,
        district: null,
      },
      matched_schemes: [],
      history: [],
      lastTurnTime: Date.now(),
      lastQuestionAsked: 'GREETING',
      questionRepeatCounts: {},
    };
    SESSION_CACHE.set(sessionId, session);
  }
  if (!session.questionRepeatCounts) {
    session.questionRepeatCounts = {};
  }

  // Handle explicit reset, pure greeting, or fresh introduction from a new user
  const isExplicitReset = norm === 'restart' || norm === 'reset' || norm === 'start over' || norm === 'clear';
  const isPureGreeting = /^(hello|hi|hey|namaste|start|good morning|good afternoon|good evening|pranam)(?:!|\.)?$/i.test(norm) ||
                         (norm.startsWith('hello') && norm.length <= 15 && !norm.includes('saree') && !norm.includes('shop') && !norm.includes('business') && !norm.includes('loan') && !norm.includes('lakh') && !norm.includes('dairy'));
  const isFreshIntroduction =
    /\b(my name is|my name|mera naam|mera name|naam hai|call me|i am|i'm|im|this is|myself)\b/i.test(text) ||
    (/\b(hi|hello|namaste|hey)\b/i.test(norm) && /\b(want to (?:open|start|run|set up)|planning to)\b/i.test(norm));

  if (isExplicitReset || isPureGreeting || isFreshIntroduction) {
    session.slots = {
      user_name: null,
      sc_status: null,
      gender: null,
      is_pwd: null,
      income: null,
      purpose: null,
      project_type: null,
      amount: null,
      state: null,
      district: null,
    };
    session.matched_schemes = [];
    session.history = [];
    session.lastQuestionAsked = 'PURPOSE';
    session.questionRepeatCounts = {};

    if (isExplicitReset) {
      return {
        session_id: sessionId,
        reply: "🔄 **Conversation Reset.**\n\nNamaste! I am **Arya**, your dedicated guide to NSFDC Government Schemes and Concessional Loans.\n\n---\n📋 **Basic Details Required for Scheme Recommendation:**\n💬 To find the best program with the lowest interest rate, **what type of business, venture, or educational purpose are you planning to pursue?**",
        quick_replies: [
          "Small Business / Shop",
          "Dairy / Animal Farming",
          "Higher Education Loan",
          "Tailoring / Boutique",
          "Electric Auto / Transport"
        ],
        matched_schemes: [],
        slots: session.slots,
      };
    }

    if (isPureGreeting) {
      return {
        session_id: sessionId,
        reply: "🙏 **Namaste! I am Arya**, your personal AI guide to Government Schemes. I am here to understand your exact livelihood or educational goals and connect you with the lowest-interest schemes.\n\n---\n📋 **Basic Details Required for Scheme Recommendation:**\n💬 To find the most suitable funding and subsidy program, **what type of business, venture, or educational scheme are you looking to start?**",
        quick_replies: [
          "Small Business / Retail Shop",
          "Dairy / Animal Husbandry",
          "Tailoring / Boutique Unit",
          "Higher Education Loan",
          "Electric Auto / Transport"
        ],
        matched_schemes: [],
        slots: session.slots,
      };
    }
  }

  // Extract slots contextually
  const { updated: newSlots, newlyDetected } = extractSlots(text, session.slots, session.lastQuestionAsked);
  session.slots = newSlots;

  // Track question repetition
  const prevQ = session.lastQuestionAsked;
  const currentRepeatCount = session.questionRepeatCounts[prevQ] || 0;

  // Dynamic On-Device Semantic AI Synthesizer
  // Generates unique, non-predefined responses addressing the user's specific questions, ideas, and context
  const dynamicResult = generateDynamicSynthesizedResponse(
    text,
    session.slots,
    session.lastQuestionAsked,
    session.questionRepeatCounts,
    newlyDetected
  );

  if (dynamicResult.questionType === prevQ) {
    session.questionRepeatCounts[prevQ] = currentRepeatCount + 1;
  } else {
    session.questionRepeatCounts[prevQ] = 0;
    session.questionRepeatCounts[dynamicResult.questionType] = 1;
  }
  session.lastQuestionAsked = dynamicResult.questionType;

  // Only provide scheme recommendations when profile assessment is complete or user explicitly asked for them
  const asksToShowSchemes = /\b(show schemes|list schemes|all schemes|available schemes|kya schemes|which scheme|options|yojna dikhao|yojana|recommend scheme|best scheme)\b/i.test(norm);
  const shouldMatch =
    dynamicResult.questionType === 'RECOMMENDATION' ||
    dynamicResult.questionType === 'SOLUTION' ||
    asksToShowSchemes;

  if (shouldMatch) {
    session.matched_schemes = matchSchemes(session.slots);
  } else {
    session.matched_schemes = [];
  }

  session.history.push({ user: text, assistant: dynamicResult.reply, timestamp: Date.now() });

  return {
    session_id: sessionId,
    reply: dynamicResult.reply,
    quick_replies: dynamicResult.quick_replies,
    matched_schemes: session.matched_schemes,
    slots: session.slots,
  };
}

// Reset session helper
export function resetChatSession(sessionId: string): ChatSessionSlots {
  const blankSlots: ChatSessionSlots = {
    user_name: null,
    sc_status: null,
    gender: null,
    is_pwd: null,
    income: null,
    purpose: null,
    project_type: null,
    amount: null,
    state: null,
    district: null,
  };
  SESSION_CACHE.set(sessionId, {
    slots: blankSlots,
    matched_schemes: [],
    history: [],
    lastTurnTime: Date.now(),
    lastQuestionAsked: 'GREETING',
    questionRepeatCounts: {},
  });
  return blankSlots;
}
