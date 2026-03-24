const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendRoot = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(backendRoot, '..');

const envCandidates = [
  path.join(backendRoot, '.env'),
  path.join(backendRoot, '.env.local'),
  path.join(repoRoot, '.env'),
  path.join(repoRoot, '.env.local'),
];
const existingBundledDb = path.join(backendRoot, 'prisma', 'prisma', 'dev.db');

let loadedEnvPath = null;

for (const envPath of envCandidates) {
  if (!fs.existsSync(envPath)) continue;
  dotenv.config({ path: envPath, override: false });
  loadedEnvPath = envPath;
}

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  process.env.DATABASE_URL = fs.existsSync(existingBundledDb)
    ? 'file:./prisma/dev.db'
    : 'file:./dev.db';
}

module.exports = {
  backendRoot,
  repoRoot,
  loadedEnvPath,
};
