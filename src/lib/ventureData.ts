export interface FinanceVenture {
  id: string;
  name: string;
  nameHi: string;
  sector: 'AGRICULTURE' | 'SMALL_INDUSTRIES' | 'SERVICE_TRANSPORT';
  sectorName: string;
  sectorNameHi: string;
  suitable_schemes: string[];
  cost_range_min: number;
  cost_range_max: number;
}

export const VENTURE_SECTORS = [
  {
    id: 'AGRICULTURE',
    name: 'Agricultural & Allied Sector',
    nameHi: 'कृषि एवं संबद्ध क्षेत्र',
    description: 'Farming, land purchase, animal husbandry, poultry, fisheries, and agro-equipment.',
    descriptionHi: 'कृषि भूमि, पशुपालन, पोल्ट्री, मत्स्य पालन, डेरी एवं कृषि उपकरण।'
  },
  {
    id: 'SMALL_INDUSTRIES',
    name: 'Small Industries Sector',
    nameHi: 'लघु उद्योग क्षेत्र',
    description: 'Manufacturing, processing, handicrafts, textiles, fabrication, and cottage enterprises.',
    descriptionHi: 'विनिर्माण, प्रसंस्करण, हस्तशिल्प, कपड़ा उद्योग, फैब्रिकेशन व कुटीर उद्योग।'
  },
  {
    id: 'SERVICE_TRANSPORT',
    name: 'Service & Transport Sector',
    nameHi: 'सेवा एवं परिवहन क्षेत्र',
    description: 'Commercial vehicles, retail shops, computer centers, clinics, repair, and trade.',
    descriptionHi: 'व्यावसायिक वाहन, खुदरा दुकानें, कंप्यूटर केंद्र, क्लिनिक, मरम्मत व व्यापार।'
  }
];

export const OFFICIAL_VENTURES: FinanceVenture[] = [
  // 1. Agricultural & Allied Sector (20 official activities)
  {
    id: 'agri_01',
    name: 'Agricultural Land Purchase',
    nameHi: 'कृषि भूमि क्रय',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 100000,
    cost_range_max: 1000000
  },
  {
    id: 'agri_02',
    name: 'Hatcheries & Poultry Farming',
    nameHi: 'हैचरी व पोल्ट्री फार्मिंग',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN', 'UNY'],
    cost_range_min: 50000,
    cost_range_max: 500000
  },
  {
    id: 'agri_03',
    name: 'Duckery (Duck Farming)',
    nameHi: 'बतख पालन',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY'],
    cost_range_min: 25000,
    cost_range_max: 140000
  },
  {
    id: 'agri_04',
    name: 'Goat Rearing',
    nameHi: 'बकरी पालन',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN'],
    cost_range_min: 30000,
    cost_range_max: 250000
  },
  {
    id: 'agri_05',
    name: 'Sheep Farming',
    nameHi: 'भेड़ पालन',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN'],
    cost_range_min: 30000,
    cost_range_max: 250000
  },
  {
    id: 'agri_06',
    name: 'Fisheries & Fish Ponds',
    nameHi: 'मत्स्य पालन व तालाब',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 50000,
    cost_range_max: 500000
  },
  {
    id: 'agri_07',
    name: 'Ornamental Fish Rearing',
    nameHi: 'सजावटी मछली पालन',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'UNY'],
    cost_range_min: 40000,
    cost_range_max: 300000
  },
  {
    id: 'agri_08',
    name: 'Tractor with Agricultural Accessories',
    nameHi: 'ट्रैक्टर एवं कृषि उपकरण',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 400000,
    cost_range_max: 1200000
  },
  {
    id: 'agri_09',
    name: 'Power Tillers',
    nameHi: 'पावर टिलर',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 150000,
    cost_range_max: 350000
  },
  {
    id: 'agri_10',
    name: 'Cultivation & Processing of Medicinal Plants',
    nameHi: 'औषधीय पौधों की खेती व प्रसंस्करण',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 100000,
    cost_range_max: 600000
  },
  {
    id: 'agri_11',
    name: 'Honey Bee Cultivation (Apiculture)',
    nameHi: 'मधुमक्खी पालन (शहद उत्पादन)',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'UNY'],
    cost_range_min: 30000,
    cost_range_max: 200000
  },
  {
    id: 'agri_12',
    name: 'Irrigation Borewells & Minor Irrigation',
    nameHi: 'सिंचाई बोरवेल व लघु सिंचाई',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 60000,
    cost_range_max: 300000
  },
  {
    id: 'agri_13',
    name: 'Agricultural Implements & Harvesters',
    nameHi: 'कृषि उपकरण व हार्वेस्टर',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 100000,
    cost_range_max: 800000
  },
  {
    id: 'agri_14',
    name: 'Horticulture & Fruit Orchards',
    nameHi: 'बागवानी एवं फलदार वृक्षारोपण',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 80000,
    cost_range_max: 500000
  },
  {
    id: 'agri_15',
    name: 'Sericulture (Silk Farming)',
    nameHi: 'रेशम कीट पालन (सेरीकल्चर)',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'UNY'],
    cost_range_min: 40000,
    cost_range_max: 250000
  },
  {
    id: 'agri_16',
    name: 'Layers & Broilers Farming',
    nameHi: 'लेयर्स एवं ब्रॉयलर कुक्कुट पालन',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN'],
    cost_range_min: 50000,
    cost_range_max: 500000
  },
  {
    id: 'agri_17',
    name: 'Dairy Units (Cows & Buffaloes)',
    nameHi: 'दुग्ध व्यवसाय (गाय व भैंस पालन)',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN', 'UNY'],
    cost_range_min: 60000,
    cost_range_max: 500000
  },
  {
    id: 'agri_18',
    name: 'Piggery Units',
    nameHi: 'सूअर पालन इकाई',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN'],
    cost_range_min: 40000,
    cost_range_max: 300000
  },
  {
    id: 'agri_19',
    name: 'Aquaculture & Shrimp Farming',
    nameHi: 'झींगा पालन व जलीय कृषि',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 100000,
    cost_range_max: 800000
  },
  {
    id: 'agri_20',
    name: 'Floriculture (Commercial Flower Cultivation)',
    nameHi: 'फूलों की व्यावसायिक खेती',
    sector: 'AGRICULTURE',
    sectorName: 'Agricultural & Allied Sector',
    sectorNameHi: 'कृषि एवं संबद्ध क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 50000,
    cost_range_max: 400000
  },

  // 2. Small Industries Sector (Key selected official activities)
  {
    id: 'ind_01',
    name: 'Automobile Repair & Servicing Units',
    nameHi: 'ऑटोमोबाइल मरम्मत एवं सर्विस सेंटर',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 80000,
    cost_range_max: 600000
  },
  {
    id: 'ind_02',
    name: 'Brick Making & Cement Blocks',
    nameHi: 'ईंट निर्माण व सीमेंट ब्लॉक इकाई',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 200000,
    cost_range_max: 1500000
  },
  {
    id: 'ind_03',
    name: 'Readymade Garment Manufacturing',
    nameHi: 'रेडीमेड गारमेंट निर्माण इकाई',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN', 'UNY'],
    cost_range_min: 50000,
    cost_range_max: 1000000
  },
  {
    id: 'ind_04',
    name: 'Ginger & Turmeric Processing',
    nameHi: 'अदरक व हल्दी प्रसंस्करण',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 100000,
    cost_range_max: 800000
  },
  {
    id: 'ind_05',
    name: 'Bakery & Confectionery Unit',
    nameHi: 'बेकरी व कन्फेक्शनरी इकाई',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 80000,
    cost_range_max: 500000
  },
  {
    id: 'ind_06',
    name: 'Flour Mill & Spice Grinding (Atta Chakki)',
    nameHi: 'आटा चक्की व मसाला पिसाई',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'UNY', 'TERM_LOAN'],
    cost_range_min: 60000,
    cost_range_max: 400000
  },
  {
    id: 'ind_07',
    name: 'Handloom & Powerloom Weaving',
    nameHi: 'हथकरघा व पावरलूम बुनाई',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN'],
    cost_range_min: 40000,
    cost_range_max: 500000
  },
  {
    id: 'ind_08',
    name: 'Footwear & Leather Articles Making',
    nameHi: 'जूता-चप्पल व चमड़ा उत्पाद निर्माण',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'TERM_LOAN', 'UNY'],
    cost_range_min: 40000,
    cost_range_max: 600000
  },
  {
    id: 'ind_09',
    name: 'Furniture Making (Wooden, Steel & Bamboo)',
    nameHi: 'फर्नीचर निर्माण (लकड़ी, स्टील व बांस)',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 70000,
    cost_range_max: 700000
  },
  {
    id: 'ind_10',
    name: 'Printing Press & Digital Flex Printing',
    nameHi: 'प्रिंटिंग प्रेस व फ्लेक्स छपाई',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 150000,
    cost_range_max: 1200000
  },
  {
    id: 'ind_11',
    name: 'Mineral Water Bottling & Purified Water Plant',
    nameHi: 'आरओ मिनरल वाटर प्लांट',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 300000,
    cost_range_max: 2000000
  },
  {
    id: 'ind_12',
    name: 'Oil Mill (Mustard/Groundnut Extraction)',
    nameHi: 'तेल मिल (सरसों/मूंगफली पिराई)',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 150000,
    cost_range_max: 800000
  },
  {
    id: 'ind_13',
    name: 'Handicrafts & Incense Stick (Agarbatti) Making',
    nameHi: 'हस्तशिल्प व अगरबत्ती निर्माण',
    sector: 'SMALL_INDUSTRIES',
    sectorName: 'Small Industries Sector',
    sectorNameHi: 'लघु उद्योग क्षेत्र',
    suitable_schemes: ['MFS', 'AMY'],
    cost_range_min: 20000,
    cost_range_max: 140000
  },

  // 3. Service & Transport Sector (Key selected official activities)
  {
    id: 'serv_01',
    name: 'Auto Rickshaw & E-Rickshaw',
    nameHi: 'ऑटो रिक्शा एवं ई-रिक्शा',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 120000,
    cost_range_max: 350000
  },
  {
    id: 'serv_02',
    name: 'Commercial Transport (Taxies, LCVs, Mini Buses)',
    nameHi: 'व्यावसायिक टैक्सी, पिकअप व मिनी बस',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 400000,
    cost_range_max: 3000000
  },
  {
    id: 'serv_03',
    name: 'Earth Movers & JCB Loaders',
    nameHi: 'अर्थ मूवर्स व जेसीबी लोडर',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 1500000,
    cost_range_max: 4500000
  },
  {
    id: 'serv_04',
    name: 'Departmental Grocery Store (Kirana)',
    nameHi: 'किराना दुकान व डिपार्टमेंटल स्टोर',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 50000,
    cost_range_max: 600000
  },
  {
    id: 'serv_05',
    name: 'Computer Hardware, Cyber Cafe & Xerox Center',
    nameHi: 'कंप्यूटर सेंटर, ग्राहक सेवा केंद्र व फोटोकॉपी',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'UNY', 'TERM_LOAN'],
    cost_range_min: 60000,
    cost_range_max: 400000
  },
  {
    id: 'serv_06',
    name: 'Diagnostic Centre, Pathology & Dental Clinic',
    nameHi: 'पैथोलॉजी लैब, डायग्नोस्टिक व क्लिनिक',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['TERM_LOAN'],
    cost_range_min: 300000,
    cost_range_max: 2500000
  },
  {
    id: 'serv_07',
    name: 'Chemist & Medical Pharmacy Shop',
    nameHi: 'मेडिकल स्टोर व दवा दुकान',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 150000,
    cost_range_max: 1000000
  },
  {
    id: 'serv_08',
    name: 'Beauty Parlour, Spa & Saloon',
    nameHi: 'ब्यूटी पार्लर व सैलून',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'UNY'],
    cost_range_min: 40000,
    cost_range_max: 300000
  },
  {
    id: 'serv_09',
    name: 'Tailoring, Boutique & Embroidery Work',
    nameHi: 'सिलाई, बुटीक व कशीदाकारी',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'AMY', 'UNY'],
    cost_range_min: 30000,
    cost_range_max: 200000
  },
  {
    id: 'serv_10',
    name: 'Dhaba, Restaurant & Catering Services',
    nameHi: 'ढाबा, रेस्टोरेंट व खानपान सेवा',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'TERM_LOAN', 'UNY'],
    cost_range_min: 80000,
    cost_range_max: 1200000
  },
  {
    id: 'serv_11',
    name: 'Electrical Goods, Wiring & Repair Shop',
    nameHi: 'इलेक्ट्रिकल सामान व मरम्मत की दुकान',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['MFS', 'UNY', 'TERM_LOAN'],
    cost_range_min: 50000,
    cost_range_max: 500000
  },
  {
    id: 'serv_12',
    name: 'Tent House, Sound & Event Decoration',
    nameHi: 'टेंट हाउस, साउंड व इवेंट डेकोरेशन',
    sector: 'SERVICE_TRANSPORT',
    sectorName: 'Service & Transport Sector',
    sectorNameHi: 'सेवा एवं परिवहन क्षेत्र',
    suitable_schemes: ['TERM_LOAN', 'UNY'],
    cost_range_min: 150000,
    cost_range_max: 1000000
  }
];

export function getVenturesBySector(sector: string): FinanceVenture[] {
  return OFFICIAL_VENTURES.filter((v) => v.sector === sector);
}

export function getVenturesForScheme(schemeCode: string): FinanceVenture[] {
  return OFFICIAL_VENTURES.filter((v) => v.suitable_schemes.includes(schemeCode));
}
