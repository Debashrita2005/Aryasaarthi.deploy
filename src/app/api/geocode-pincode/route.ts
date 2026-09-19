import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Postal zone regional fallbacks for India (covering all postal zones 1 to 8)
const PINCODE_ZONE_COORDS: Record<string, { lat: number; lng: number; region: string }> = {
  '11': { lat: 28.6139, lng: 77.2090, region: 'Delhi NCR' },
  '12': { lat: 28.4595, lng: 77.0266, region: 'Gurugram / Haryana South' },
  '13': { lat: 30.1290, lng: 77.2674, region: 'Ambala / Haryana North' },
  '14': { lat: 30.9010, lng: 75.8573, region: 'Ludhiana / Punjab Central' },
  '15': { lat: 30.2110, lng: 74.9455, region: 'Bathinda / Punjab West' },
  '16': { lat: 30.7333, lng: 76.7794, region: 'Chandigarh' },
  '17': { lat: 31.1048, lng: 77.1734, region: 'Shimla / Himachal Pradesh' },
  '18': { lat: 32.7266, lng: 74.8570, region: 'Jammu' },
  '19': { lat: 34.0837, lng: 74.7973, region: 'Srinagar / Kashmir' },
  '20': { lat: 28.5355, lng: 77.3910, region: 'Noida / Gautam Buddha Nagar' },
  '21': { lat: 25.4358, lng: 81.8463, region: 'Prayagraj / UP South' },
  '22': { lat: 26.8467, lng: 80.9462, region: 'Lucknow / UP Central' },
  '23': { lat: 25.1337, lng: 82.5644, region: 'Mirzapur / UP East' },
  '24': { lat: 30.3165, lng: 78.0322, region: 'Dehradun / Uttarakhand' },
  '25': { lat: 28.9845, lng: 77.7064, region: 'Meerut / UP West' },
  '26': { lat: 29.3803, lng: 79.4636, region: 'Nainital / Kumaon' },
  '27': { lat: 26.7606, lng: 83.3732, region: 'Gorakhpur / UP Northeast' },
  '28': { lat: 27.1767, lng: 78.0081, region: 'Agra / Jhansi' },
  '30': { lat: 26.9124, lng: 75.7873, region: 'Jaipur / Rajasthan East' },
  '31': { lat: 24.5854, lng: 73.7125, region: 'Udaipur / Rajasthan South' },
  '32': { lat: 25.2138, lng: 75.8648, region: 'Kota / Rajasthan Southeast' },
  '33': { lat: 28.0229, lng: 73.3119, region: 'Bikaner / Rajasthan North' },
  '34': { lat: 26.2389, lng: 73.0243, region: 'Jodhpur / Rajasthan West' },
  '36': { lat: 22.3039, lng: 70.8022, region: 'Rajkot / Saurashtra' },
  '37': { lat: 23.2420, lng: 69.6669, region: 'Bhuj / Kutch' },
  '38': { lat: 23.0225, lng: 72.5714, region: 'Ahmedabad / Gandhinagar' },
  '39': { lat: 21.1702, lng: 72.8311, region: 'Surat / Gujarat South' },
  '40': { lat: 18.9220, lng: 72.8347, region: 'Mumbai South & Central' },
  '41': { lat: 18.5204, lng: 73.8567, region: 'Pune / Western Maharashtra' },
  '42': { lat: 19.2183, lng: 72.9781, region: 'Thane / Navi Mumbai' },
  '43': { lat: 19.8762, lng: 75.3433, region: 'Chhatrapati Sambhajinagar / Marathwada' },
  '44': { lat: 21.1458, lng: 79.0882, region: 'Nagpur / Vidarbha' },
  '45': { lat: 22.7196, lng: 75.8577, region: 'Indore / Malwa MP' },
  '46': { lat: 23.2599, lng: 77.4126, region: 'Bhopal / Central MP' },
  '47': { lat: 26.2183, lng: 78.1828, region: 'Gwalior / Chambal MP' },
  '48': { lat: 23.1815, lng: 79.9864, region: 'Jabalpur / Mahakoshal MP' },
  '49': { lat: 21.2514, lng: 81.6296, region: 'Raipur / Chhattisgarh' },
  '50': { lat: 17.3850, lng: 78.4867, region: 'Hyderabad / Telangana' },
  '51': { lat: 13.6288, lng: 79.4192, region: 'Tirupati / Rayalaseema AP' },
  '52': { lat: 16.5062, lng: 80.6480, region: 'Vijayawada / Andhra Central' },
  '53': { lat: 17.6868, lng: 83.2185, region: 'Visakhapatnam / North Coastal AP' },
  '56': { lat: 12.9716, lng: 77.5946, region: 'Bengaluru / Karnataka South' },
  '57': { lat: 12.9141, lng: 74.8560, region: 'Mangaluru / Coastal Karnataka' },
  '58': { lat: 15.3647, lng: 75.1240, region: 'Hubballi / Karnataka North' },
  '59': { lat: 15.8497, lng: 74.4977, region: 'Belagavi / Karnataka' },
  '60': { lat: 13.0827, lng: 80.2707, region: 'Chennai / Tamil Nadu North' },
  '61': { lat: 10.7905, lng: 79.1378, region: 'Thanjavur / Delta TN' },
  '62': { lat: 9.9252, lng: 78.1198, region: 'Madurai / Tamil Nadu South' },
  '63': { lat: 12.9165, lng: 79.1325, region: 'Vellore / North Arcot' },
  '64': { lat: 11.0168, lng: 76.9558, region: 'Coimbatore / Kongu TN' },
  '67': { lat: 11.2588, lng: 75.7804, region: 'Kozhikode / Malabar Kerala' },
  '68': { lat: 9.9312, lng: 76.2673, region: 'Kochi / Central Kerala' },
  '69': { lat: 8.5241, lng: 76.9366, region: 'Thiruvananthapuram / South Kerala' },
  '70': { lat: 22.5726, lng: 88.3639, region: 'Kolkata / South Bengal' },
  '71': { lat: 23.5204, lng: 87.3119, region: 'Durgapur / Burdwan WB' },
  '72': { lat: 22.4257, lng: 87.3199, region: 'Midnapore / West Medinipur' },
  '73': { lat: 26.7271, lng: 88.3953, region: 'Siliguri / North Bengal' },
  '74': { lat: 22.7533, lng: 88.3476, region: 'Barrackpore / 24 Parganas' },
  '75': { lat: 20.2961, lng: 85.8245, region: 'Bhubaneswar / Odisha Central' },
  '76': { lat: 19.3149, lng: 84.7941, region: 'Berhampur / Odisha South' },
  '77': { lat: 22.2604, lng: 84.8536, region: 'Rourkela / Odisha North' },
  '78': { lat: 26.1445, lng: 91.7362, region: 'Guwahati / Assam' },
  '79': { lat: 25.5788, lng: 91.8933, region: 'Shillong / Meghalaya & NE' },
  '80': { lat: 25.5941, lng: 85.1376, region: 'Patna / Central Bihar' },
  '81': { lat: 25.2425, lng: 86.9842, region: 'Bhagalpur / East Bihar' },
  '82': { lat: 24.7914, lng: 85.0002, region: 'Gaya / South Bihar' },
  '83': { lat: 23.3441, lng: 85.3096, region: 'Ranchi / Jharkhand' },
  '84': { lat: 26.1209, lng: 85.3647, region: 'Muzaffarpur / North Bihar' },
  '85': { lat: 25.7796, lng: 87.4753, region: 'Purnia / Seemanchal' },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPincode = searchParams.get('pincode') || '';
    const cleanPincode = rawPincode.replace(/\D/g, '').slice(0, 6);

    if (cleanPincode.length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit Indian PIN code.' },
        { status: 400 }
      );
    }

    // 1. Try OpenStreetMap Nominatim with official User-Agent
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cleanPincode}&country=india&format=json`,
        {
          headers: {
            'User-Agent': 'AryaSaarthi-Citizen-GIS/1.0 (contact: support@aryasaarthi.gov.in)',
            'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (Array.isArray(osmData) && osmData.length > 0) {
          const item = osmData[0];
          return NextResponse.json({
            success: true,
            pincode: cleanPincode,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            source: 'openstreetmap',
          });
        }
      }
    } catch (err) {
      console.warn('Nominatim geocode timed out or failed, falling back to postal API:', err);
    }

    // 2. Try India Post API for District & State resolution
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const postRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (postRes.ok) {
        const postData = await postRes.json();
        if (
          Array.isArray(postData) &&
          postData.length > 0 &&
          postData[0].Status === 'Success' &&
          Array.isArray(postData[0].PostOffice) &&
          postData[0].PostOffice.length > 0
        ) {
          const po = postData[0].PostOffice[0];
          const district = po.District;
          const state = po.State;
          const placeName = po.Name;

          // Query Nominatim for District centroid
          try {
            const districtRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${district}, ${state}, India`)}&format=json`,
              {
                headers: {
                  'User-Agent': 'AryaSaarthi-Citizen-GIS/1.0 (contact: support@aryasaarthi.gov.in)',
                },
              }
            );
            if (districtRes.ok) {
              const districtData = await districtRes.json();
              if (Array.isArray(districtData) && districtData.length > 0) {
                return NextResponse.json({
                  success: true,
                  pincode: cleanPincode,
                  lat: parseFloat(districtData[0].lat),
                  lng: parseFloat(districtData[0].lon),
                  displayName: `${cleanPincode}, ${placeName}, ${district}, ${state}`,
                  district,
                  state,
                  source: 'india-post-nominatim',
                });
              }
            }
          } catch (e) {
            console.warn('District geocoding fallback failed:', e);
          }
        }
      }
    } catch (err) {
      console.warn('India Post API failed:', err);
    }

    // 3. Guaranteed Geographic Postal Zone Fallback
    const prefix2 = cleanPincode.slice(0, 2);
    if (PINCODE_ZONE_COORDS[prefix2]) {
      const zone = PINCODE_ZONE_COORDS[prefix2];
      return NextResponse.json({
        success: true,
        pincode: cleanPincode,
        lat: zone.lat,
        lng: zone.lng,
        displayName: `${cleanPincode}, ${zone.region}, India`,
        source: 'postal-zone-centroid',
      });
    }

    // Default India Geographic Center if prefix is unusual
    return NextResponse.json({
      success: true,
      pincode: cleanPincode,
      lat: 22.9734,
      lng: 78.6569,
      displayName: `${cleanPincode}, India`,
      source: 'national-centroid',
    });
  } catch (error) {
    console.error('Pincode Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode pincode.' },
      { status: 500 }
    );
  }
}
