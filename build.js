import { build } from 'vite';
import { execSync } from 'child_process';

// Build frontend
console.log('Building frontend...');
await build();

// Build backend
console.log('Building backend...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
  stdio: 'inherit'
});

console.log('Build complete!');