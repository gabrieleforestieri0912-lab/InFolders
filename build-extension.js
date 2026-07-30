// build-extension.js — icone, bundle JS, zip e cartella dist/packed
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const rootDir = __dirname;

execSync('node scripts/generate-icons.js', { stdio: 'inherit', cwd: rootDir });
execSync('node scripts/bundle-extension.js', { stdio: 'inherit', cwd: rootDir });

const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const zip = new AdmZip();

const extensionFiles = [
  'manifest.json',
  'lucide-icons.js',
  'privacy.html',
  'subscriptions.html',
  'subscriptions.js',
  'subscriptions.css',
  'content.js',
  'content.css',
  'background.js'
];

extensionFiles.forEach((file) => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    zip.addLocalFile(filePath);
    console.log(`✓ Added ${file}`);
  } else {
    console.warn(`✗ Missing: ${file}`);
  }
});

const legacyIcon = path.join(rootDir, 'public', 'Infolders.png');
if (fs.existsSync(legacyIcon)) {
  zip.addLocalFile(legacyIcon, 'public');
  console.log('✓ Added public/Infolders.png');
}

const iconsDir = path.join(rootDir, 'icons');
['icon-16.png', 'icon-48.png', 'icon-128.png'].forEach((name) => {
  const p = path.join(iconsDir, name);
  if (fs.existsSync(p)) {
    zip.addLocalFile(p, 'icons');
    console.log(`✓ Added icons/${name}`);
  }
});

const outputPath = path.join(distDir, 'infolders-extension.zip');
zip.writeZip(outputPath);
console.log(`\n✅ Build completato: ${outputPath}`);
console.log(`📦 Dimensione: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

const packedDir = path.join(distDir, 'packed');
if (!fs.existsSync(packedDir)) {
  fs.mkdirSync(packedDir, { recursive: true });
}
extensionFiles.forEach((file) => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(packedDir, file));
  }
});
if (fs.existsSync(legacyIcon)) {
  const iconDestDir = path.join(packedDir, 'public');
  if (!fs.existsSync(iconDestDir)) fs.mkdirSync(iconDestDir, { recursive: true });
  fs.copyFileSync(legacyIcon, path.join(iconDestDir, 'Infolders.png'));
}
if (fs.existsSync(iconsDir)) {
  const destIcons = path.join(packedDir, 'icons');
  if (!fs.existsSync(destIcons)) fs.mkdirSync(destIcons, { recursive: true });
  fs.readdirSync(iconsDir).forEach((f) => {
    fs.copyFileSync(path.join(iconsDir, f), path.join(destIcons, f));
  });
}
console.log(`📁 dist/packed pronto per "Carica estensione non pacchettizzata"`);
