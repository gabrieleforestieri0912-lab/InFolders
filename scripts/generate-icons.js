// Genera icons/icon-{16,48,128}.png da public/Infolders.png (sharp se disponibile)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcPng = path.join(root, 'public', 'Infolders.png');
const outDir = path.join(root, 'icons');

async function main() {
  if (!fs.existsSync(srcPng)) {
    console.warn('generate-icons: file non trovato', srcPng);
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    sharp = null;
  }
  const sizes = [16, 48, 128];
  if (sharp) {
    await Promise.all(
      sizes.map((s) =>
        sharp(srcPng)
          .resize(s, s)
          .png()
          .toFile(path.join(outDir, `icon-${s}.png`))
          .then(() => console.log(`✓ icons/icon-${s}.png`))
      )
    );
    return;
  }
  const buf = fs.readFileSync(srcPng);
  for (const s of sizes) {
    const dest = path.join(outDir, `icon-${s}.png`);
    fs.writeFileSync(dest, buf);
    console.log(`✓ icons/icon-${s}.png (copia; npm i sharp per ridimensionare)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
