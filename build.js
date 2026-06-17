/**
 * build.js — cross-platform production build script
 * 1. npm install inside client/
 * 2. vite build inside client/
 * 3. copy client/dist → public/
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const root   = __dirname;
const client = path.join(root, 'client');
const dist   = path.join(client, 'dist');
const pub    = path.join(root, 'public');

function run(cmd, cwd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// 1. Install client dependencies
run('npm install', client);

// 2. Build with Vite
run('npm run build', client);

// 3. Copy dist → public
console.log('\n> Copying dist → public/');
if (fs.existsSync(pub)) fs.rmSync(pub, { recursive: true, force: true });
copyDir(dist, pub);

console.log('\n✅ Build complete — public/ is ready.\n');
