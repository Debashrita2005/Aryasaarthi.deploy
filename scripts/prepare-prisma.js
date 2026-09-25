const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('[prepare-prisma] Error: prisma/schema.prisma not found at', schemaPath);
  process.exit(1);
}

const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const dbUrl = process.env.DATABASE_URL || '';
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://') || (isRailway && !dbUrl.startsWith('file:'));
const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

const currentProviderMatch = schemaContent.match(/datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"([^"]+)"/);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider && currentProvider !== targetProvider) {
  console.log(`[prepare-prisma] Detected ${isPostgres ? 'PostgreSQL' : 'SQLite'} DATABASE_URL. Switching provider from "${currentProvider}" to "${targetProvider}".`);
  const updatedContent = schemaContent.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+(")/,
    `$1${targetProvider}$2`
  );
  fs.writeFileSync(schemaPath, updatedContent, 'utf8');
  console.log(`[prepare-prisma] Updated prisma/schema.prisma datasource provider to "${targetProvider}".`);
} else {
  console.log(`[prepare-prisma] Prisma datasource provider is already "${targetProvider}".`);
}
