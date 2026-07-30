// Sintassi JS estensione dopo bundle
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const files = ['content.js', 'popup.js', 'subscriptions.js', 'background.js'];

for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) {
    console.error('verify: manca', p);
    process.exit(1);
  }
  execSync(`node --check "${p}"`, { stdio: 'inherit', cwd: root });
  console.log('OK', f);
}
