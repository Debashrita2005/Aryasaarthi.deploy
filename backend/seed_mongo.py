import asyncio
import logging
from config import settings
from engine import DEFAULT_SCHEMES
from models import PartnerModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_mongo")

# Verified Seed Partners across key States & UTs
SEED_PARTNERS = [
    {
        "id": "partner_up_01",
        "name": "Uttar Pradesh Scheduled Castes Finance and Development Corporation (UPSDFC)",
        "nameHi": "उत्तर प्रदेश अनुसूचित जाति वित्त एवं विकास निगम लि. (UPSDFC)",
        "partnerType": "SCA",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "address": "B-2, Picup Bhawan, Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010",
        "latitude": 26.8665,
        "longitude": 81.0020,
        "location": {"type": "Point", "coordinates": [81.0020, 26.8665]},
        "phone": "0522-2720843",
        "email": "md.upsdfc@nic.in",
        "supportedSchemes": ["MFS", "AMY", "TERM_LOAN", "UNY", "ELS", "GBS", "DSY", "VMY"],
        "operationalStatus": "VERIFIED"
    },
    {
        "id": "partner_delhi_01",
        "name": "Delhi SC/ST/OBC/Minorities Development Corporation (DSFDC)",
        "nameHi": "दिल्ली अनुसूचित जाति/जनजाति वित्त एवं विकास निगम",
        "partnerType": "SCA",
        "state": "Delhi",
        "district": "Central Delhi",
        "address": "Ambedkar Bhawan, Sector 16, Rohini, New Delhi - 110085",
        "latitude": 28.7180,
        "longitude": 77.1200,
        "location": {"type": "Point", "coordinates": [77.1200, 28.7180]},
        "phone": "011-27572242",
        "email": "dsfdc.delhi@gov.in",
        "supportedSchemes": ["MFS", "TERM_LOAN", "UNY", "ELS", "GBS", "DSY"],
        "operationalStatus": "VERIFIED"
    },
    {
        "id": "partner_bihar_01",
        "name": "Bihar State Scheduled Castes Co-operative Development Corporation",
        "nameHi": "बिहार राज्य अनुसूचित जाति सहकारिता विकास निगम",
        "partnerType": "SCA",
        "state": "Bihar",
        "district": "Patna",
        "address": "Vikas Bhawan, Bailey Road, Patna, Bihar - 800001",
        "latitude": 25.6090,
        "longitude": 85.1376,
        "location": {"type": "Point", "coordinates": [85.1376, 25.6090]},
        "phone": "0612-2215881",
        "email": "scdevelopment.bihar@gov.in",
        "supportedSchemes": ["MFS", "TERM_LOAN", "UNY", "STAND_UP_INDIA", "DSY"],
        "operationalStatus": "VERIFIED"
    },
    {
        "id": "partner_mh_01",
        "name": "Mahatma Phule Backward Class Development Corporation (MPBCDC)",
        "nameHi": "महात्मा फुले मागासवर्ग विकास महामंडळ मर्यादित (MPBCDC)",
        "partnerType": "SCA",
        "state": "Maharashtra",
        "district": "Mumbai",
        "address": "Supreme Headquarters, Bandra Kurla Complex, Mumbai - 400051",
        "latitude": 19.0660,
        "longitude": 72.8685,
        "location": {"type": "Point", "coordinates": [72.8685, 19.0660]},
        "phone": "022-26592201",
        "email": "md@mpbcdc.maharashtra.gov.in",
        "supportedSchemes": ["MFS", "TERM_LOAN", "ELS", "GBS", "DSY", "VMY"],
        "operationalStatus": "VERIFIED"
    },
    {
        "id": "partner_ka_01",
        "name": "Dr. B.R. Ambedkar Development Corporation Ltd.",
        "nameHi": "डॉ. बी.आर. आंबेडकर विकास निगम (कर्नाटक)",
        "partnerType": "SCA",
        "state": "Karnataka",
        "district": "Bengaluru",
        "address": "9th Floor, Visvesvaraya Main Tower, Dr. Ambedkar Veedhi, Bengaluru - 560001",
        "latitude": 12.9778,
        "longitude": 77.5913,
        "location": {"type": "Point", "coordinates": [77.5913, 12.9778]},
        "phone": "080-22864875",
        "email": "mddradc@karnataka.gov.in",
        "supportedSchemes": ["MFS", "TERM_LOAN", "ELS", "UNY", "DSY", "STAND_UP_INDIA"],
        "operationalStatus": "VERIFIED"
    }
]

async def seed():
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        db = client[settings.MONGODB_DB_NAME]
        
        # Ping
        await client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {settings.MONGODB_URI}")

        # Seed Schemes
        schemes_col = db["schemes"]
        for scheme in DEFAULT_SCHEMES:
            doc = scheme.model_dump()
            await schemes_col.update_one({"code": scheme.code}, {"$set": doc}, upsert=True)
        logger.info(f"Successfully seeded {len(DEFAULT_SCHEMES)} schemes into MongoDB.")

        # Seed Partners
        partners_col = db["partners"]
        for p in SEED_PARTNERS:
            await partners_col.update_one({"id": p["id"]}, {"$set": p}, upsert=True)
        logger.info(f"Successfully seeded {len(SEED_PARTNERS)} partner agencies into MongoDB.")

    except Exception as e:
        logger.error(f"Seeding failed or MongoDB offline: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
