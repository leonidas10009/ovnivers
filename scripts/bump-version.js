const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Usage: node scripts/bump-version.js <semver>');
  console.error('Example: node scripts/bump-version.js 1.6.0');
  process.exit(1);
}

// 1. package.json
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
console.log(`  package.json → ${newVersion}`);

// 2. manifest.json (top-level version only, not scrapers)
const manPath = path.join(ROOT, 'manifest.json');
const man = JSON.parse(fs.readFileSync(manPath, 'utf-8'));
man.version = newVersion;
fs.writeFileSync(manPath, JSON.stringify(man, null, 2) + '\n');
console.log(`  manifest.json → ${newVersion}`);

// 3. server.js — VERSION constant
const srvPath = path.join(ROOT, 'server.js');
let srv = fs.readFileSync(srvPath, 'utf-8');
srv = srv.replace(
  /(const VERSION = )'[\d.]+'/,
  `$1'${newVersion}'`
);
// Also update comment header if present
srv = srv.replace(
  /(Ovnivers — Stremio Addon Backend v)[\d.]+/,
  `$1${newVersion}`
);
// Update version in footer HTML
srv = srv.replace(
  /(Ovnivers v)[\d.]+/g,
  `$1${newVersion}`
);
fs.writeFileSync(srvPath, srv);
console.log(`  server.js → ${newVersion}`);

// 4. README.md — title line
const readmePath = path.join(ROOT, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf-8');
readme = readme.replace(
  /^(# Ovnivers — Stream Provider v)[\d.]+/m,
  `$1${newVersion}`
);
fs.writeFileSync(readmePath, readme);
console.log(`  README.md → ${newVersion}`);

console.log(`\n✓ Version bumped to ${newVersion}`);
