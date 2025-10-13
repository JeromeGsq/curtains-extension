import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import manifest from './manifest.json' with { type: 'json' };

// Get package.json version
function getPackageVersion(): string {
  const packageJson = JSON.parse(
    readFileSync('./package.json', 'utf-8')
  );
  return packageJson.version;
}

// Get build version: date + commit hash
function getBuildVersion(): string {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const commitHash = execSync('git rev-parse --short HEAD')
      .toString()
      .trim();
    return `${date}-${commitHash}`;
  } catch (error) {
    return 'dev';
  }
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
  define: {
    __BUILD_VERSION__: JSON.stringify(getBuildVersion()),
  },
});
