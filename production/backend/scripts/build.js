const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function removeAndRecreateDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
}

function runBuild() {
  removeAndRecreateDist();

  copyIfExists(path.join(rootDir, 'src'), path.join(distDir, 'src'));
  copyIfExists(path.join(rootDir, 'prisma'), path.join(distDir, 'prisma'));
  copyIfExists(path.join(rootDir, 'package.json'), path.join(distDir, 'package.json'));
  copyIfExists(path.join(rootDir, 'package-lock.json'), path.join(distDir, 'package-lock.json'));

  // Keep the same server entrypoint pattern as root package.
  copyIfExists(path.join(rootDir, 'src', 'server.js'), path.join(distDir, 'server.js'));

  console.log('Backend build completed - dist folder created');
}

runBuild();

