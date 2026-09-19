// AryaSaarthi — Verified Scheme Database Seeder & Synchronizer
// Persists all 17 Central and 76 State/UT schemes into Prisma / SQLite database

import prisma from './db';
import { ALL_VERIFIED_SCHEMES } from './verifiedSchemesData';

export async function syncVerifiedSchemesToDatabase() {
  console.log(`[syncVerifiedSchemesToDatabase] Starting sync of ${ALL_VERIFIED_SCHEMES.length} verified schemes...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const scheme of ALL_VERIFIED_SCHEMES) {
    const existing = await prisma.verifiedScheme.findUnique({
      where: { code: scheme.code },
    });

    const data = {
      code: scheme.code,
      slug: scheme.slug,
      name: scheme.name,
      nameHi: scheme.nameHi || null,
      level: scheme.level,
      state: scheme.state || null,
      category: scheme.category,
      typeLabel: scheme.typeLabel,
      eligibility: scheme.eligibility,
      documentsJson: JSON.stringify(scheme.documents),
      officialRoute: scheme.officialRoute,
      officialSourceUrl: scheme.officialSourceUrl,
      verifiedAt: scheme.verifiedAt,
      lastVerifiedDate: scheme.lastVerifiedDate || '17 Sep 2026',
      status: 'VERIFIED_ACTIVE',
    };

    if (existing) {
      await prisma.verifiedScheme.update({
        where: { code: scheme.code },
        data,
      });
      updatedCount++;
    } else {
      await prisma.verifiedScheme.create({
        data,
      });
      createdCount++;
    }
  }

  const totalInDb = await prisma.verifiedScheme.count();
  console.log(`[syncVerifiedSchemesToDatabase] Sync complete: ${createdCount} created, ${updatedCount} updated. Total in DB: ${totalInDb}`);

  return {
    totalSeeded: ALL_VERIFIED_SCHEMES.length,
    createdCount,
    updatedCount,
    totalInDb,
  };
}

// Auto-run if executed directly via node or npx tsx
if (require.main === module) {
  syncVerifiedSchemesToDatabase()
    .then((res) => {
      console.log('Seeding finished successfully:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
