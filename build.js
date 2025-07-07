import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Building for Vercel deployment...');

try {
  // Build frontend only (backend will be handled by Vercel)
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}