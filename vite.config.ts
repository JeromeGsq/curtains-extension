import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import manifest from './manifest.json' with { type: 'json' };

// Get package.json version
function getPackageVersion(): string {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
  return packageJson.version;
}

// Sync manifest version with package.json
const manifestWithVersion = {
  ...manifest,
  version: getPackageVersion(),
};

export default defineConfig({
  plugins: [crx({ manifest: manifestWithVersion })],
  build: {
    outDir: 'dist',
  },
});
