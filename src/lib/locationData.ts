export interface IndianRegion {
  code: string;
  name: string;
  nameHi: string;
  type: 'STATE' | 'UT';
  hasActiveSca?: boolean;
}

export const INDIAN_STATES_AND_UTS: IndianRegion[] = [
  // 28 States
  { code: 'AP', name: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश', type: 'STATE', hasActiveSca: true },
  { code: 'AR', name: 'Arunachal Pradesh', nameHi: 'अरुणाचल प्रदेश', type: 'STATE' },
  { code: 'AS', name: 'Assam', nameHi: 'असम', type: 'STATE', hasActiveSca: true },
  { code: 'BR', name: 'Bihar', nameHi: 'बिहार', type: 'STATE', hasActiveSca: true },
  { code: 'CG', name: 'Chhattisgarh', nameHi: 'छत्तीसगढ़', type: 'STATE', hasActiveSca: true },
  { code: 'GA', name: 'Goa', nameHi: 'गोवा', type: 'STATE' },
  { code: 'GJ', name: 'Gujarat', nameHi: 'गुजरात', type: 'STATE', hasActiveSca: true },
  { code: 'HR', name: 'Haryana', nameHi: 'हरियाणा', type: 'STATE', hasActiveSca: true },
  { code: 'HP', name: 'Himachal Pradesh', nameHi: 'हिमाचल प्रदेश', type: 'STATE', hasActiveSca: true },
  { code: 'JH', name: 'Jharkhand', nameHi: 'झारखंड', type: 'STATE', hasActiveSca: true },
  { code: 'KA', name: 'Karnataka', nameHi: 'कर्नाटक', type: 'STATE', hasActiveSca: true },
  { code: 'KL', name: 'Kerala', nameHi: 'केरल', type: 'STATE', hasActiveSca: true },
  { code: 'MP', name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश', type: 'STATE', hasActiveSca: true },
  { code: 'MH', name: 'Maharashtra', nameHi: 'महाराष्ट्र', type: 'STATE', hasActiveSca: true },
  { code: 'MN', name: 'Manipur', nameHi: 'मणिपुर', type: 'STATE' },
  { code: 'ML', name: 'Meghalaya', nameHi: 'मेघालय', type: 'STATE' },
  { code: 'MZ', name: 'Mizoram', nameHi: 'मिजोरम', type: 'STATE' },
  { code: 'NL', name: 'Nagaland', nameHi: 'नागालैंड', type: 'STATE' },
  { code: 'OD', name: 'Odisha', nameHi: 'ओडिशा', type: 'STATE', hasActiveSca: true },
  { code: 'PB', name: 'Punjab', nameHi: 'पंजाब', type: 'STATE', hasActiveSca: true },
  { code: 'RJ', name: 'Rajasthan', nameHi: 'राजस्थान', type: 'STATE', hasActiveSca: true },
  { code: 'SK', name: 'Sikkim', nameHi: 'सिक्किम', type: 'STATE' },
  { code: 'TN', name: 'Tamil Nadu', nameHi: 'तमिलनाडु', type: 'STATE', hasActiveSca: true },
  { code: 'TG', name: 'Telangana', nameHi: 'तेलंगाना', type: 'STATE', hasActiveSca: true },
  { code: 'TR', name: 'Tripura', nameHi: 'त्रिपुरा', type: 'STATE' },
  { code: 'UP', name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश', type: 'STATE', hasActiveSca: true },
  { code: 'UK', name: 'Uttarakhand', nameHi: 'उत्तराखंड', type: 'STATE', hasActiveSca: true },
  { code: 'WB', name: 'West Bengal', nameHi: 'पश्चिम बंगाल', type: 'STATE', hasActiveSca: true },

  // 8 Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', nameHi: 'अंडमान और निकोबार द्वीप समूह', type: 'UT' },
  { code: 'CH', name: 'Chandigarh', nameHi: 'चंडीगढ़', type: 'UT', hasActiveSca: true },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', nameHi: 'दादरा और नगर हवेली एवं दमन और दीव', type: 'UT' },
  { code: 'DL', name: 'Delhi (NCT)', nameHi: 'दिल्ली (राष्ट्रीय राजधानी क्षेत्र)', type: 'UT', hasActiveSca: true },
  { code: 'JK', name: 'Jammu and Kashmir', nameHi: 'जम्मू और कश्मीर', type: 'UT', hasActiveSca: true },
  { code: 'LA', name: 'Ladakh', nameHi: 'लद्दाख', type: 'UT' },
  { code: 'LD', name: 'Lakshadweep', nameHi: 'लक्षद्वीप', type: 'UT' },
  { code: 'PY', name: 'Puducherry', nameHi: 'पुडुचेरी', type: 'UT' },
];

export const DISTRICTS_BY_STATE: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Varanasi', 'Prayagraj', 'Agra', 'Gorakhpur', 'Gautam Buddha Nagar', 'Ghaziabad', 'Meerut', 'Aligarh', 'Bareilly', 'Moradabad', 'Ayodhya', 'Jhansi', 'Saharanpur'],
  'Maharashtra': ['Mumbai', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Rohtas', 'Saran', 'Begusarai', 'Nalanda'],
  'Delhi (NCT)': ['Central Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North East Delhi', 'South West Delhi'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'],
  'West Bengal': ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly', 'Murshidabad', 'Purba Medinipur', 'Paschim Bardhaman', 'Nadia'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur'],
  'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Hubballi-Dharwad', 'Mangaluru', 'Kalaburagi', 'Davanagere', 'Ballari'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Kapurthala', 'Hoshiarpur', 'Mohali', 'Pathankot'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Jharkhand': ['Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih'],
  'Odisha': ['Khurda (Bhubaneswar)', 'Cuttack', 'Ganjam', 'Sundargarh', 'Puri', 'Balasore', 'Bhadrak', 'Sambalpur'],
  'Telangana': ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada'],
  'Assam': ['Kamrup Metropolitan (Guwahati)', 'Kamrup', 'Dibrugarh', 'Silchar (Cachar)', 'Jorhat', 'Nagaon'],
  'Kerala': ['Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur', 'Malappuram', 'Kollam', 'Kannur'],
  'Chhattisgarh': ['Raipur', 'Durg (Bhilai)', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Jagdalpur (Bastar)'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar', 'Almora', 'Pauri Garhwal'],
};
