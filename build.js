import { execSync } from 'child_process';

console.log('🚀 Building frontend for Vercel...');

try {
  // Build frontend only - backend handled by Vercel functions
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}