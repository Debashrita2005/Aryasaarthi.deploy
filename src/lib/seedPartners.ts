import prisma from './db';
import { PARTNERS } from './partnerData';

export async function syncPartnersToDatabase() {
  let created = 0;
  let updated = 0;

  for (const p of PARTNERS) {
    const supportedSchemesJson = JSON.stringify(p.supported_scheme_codes || []);
    const npa = p.partnerHealth?.npaPercentage ?? 4.2;
    const utilization = p.partnerHealth?.fundUtilizationPercentage ?? 68.0;
    const overdue = p.partnerHealth?.overdueFlag ?? false;
    const opStatus = p.operational_status === 'VERIFIED' ? 'active' : 'active';

    const existing = await prisma.schemeProvider.findUnique({
      where: { code: p.id },
    });

    if (existing) {
      await prisma.schemeProvider.update({
        where: { code: p.id },
        data: {
          name: p.name,
          nameHi: p.nameHi || null,
          partnerType: p.partner_type,
          state: p.state,
          district: p.district,
          address: p.address,
          phone: p.phone || null,
          email: p.email || null,
          latitude: p.latitude,
          longitude: p.longitude,
          supportedSchemesJson,
          npaPercentage: npa,
          fundUtilizationPercentage: utilization,
          overdueFlag: overdue,
          operationalStatus: opStatus,
        },
      });
      updated++;
    } else {
      await prisma.schemeProvider.create({
        data: {
          code: p.id,
          name: p.name,
          nameHi: p.nameHi || null,
          partnerType: p.partner_type,
          state: p.state,
          district: p.district,
          address: p.address,
          phone: p.phone || null,
          email: p.email || null,
          latitude: p.latitude,
          longitude: p.longitude,
          supportedSchemesJson,
          npaPercentage: npa,
          fundUtilizationPercentage: utilization,
          overdueFlag: overdue,
          operationalStatus: opStatus,
        },
      });
      created++;
    }
  }

  const total = await prisma.schemeProvider.count();
  console.log(`[syncPartnersToDatabase] Sync complete: ${created} created, ${updated} updated. Total in DB: ${total}`);
  return { created, updated, total };
}

// Auto-run if executed directly via node or npx tsx
if (require.main === module || process.argv[1]?.includes('seedPartners')) {
  syncPartnersToDatabase()
    .then((res) => {
      console.log('Partner seeding finished successfully:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Partner seeding failed:', err);
      process.exit(1);
    });
}
