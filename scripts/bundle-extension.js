// Bundle script estensione (content, popup, subscriptions, background) con esbuild
const esbuild = require('esbuild');
const path = require('path');

const root = path.join(__dirname, '..');

const common = {
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  logLevel: 'info',
  define: {
    'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }
};

async function run() {
  // Bundle background (service worker)
  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'src/extension/background.ts')],
    outfile: path.join(root, 'background.js')
  });
  // Bundle content script
  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'src/extension/entries/content-entry.ts')],
    outfile: path.join(root, 'content.js')
  });
  // Bundle popup
  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'src/extension/entries/popup-entry.ts')],
    outfile: path.join(root, 'popup.js')
  });
  // Bundle subscriptions
  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'src/extension/entries/subscriptions-entry.ts')],
    outfile: path.join(root, 'subscriptions.js')
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
