import { execSync } from 'child_process';

console.log('🚀 Building for Vercel deployment...');

try {
  // Simple build command
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}