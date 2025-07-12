# Vercel Deployment Package

## Files Included:
- `/api/` - Serverless API functions
- `/shared/` - Database schema
- `/client/` - Frontend build
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies

## Environment Variables Required:
DATABASE_URL = postgresql://neondb_owner:npg_m1XNi8rhsxeo@ep-wispy-cloud-adf79qwt.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

## Deploy Steps:
1. Upload these files to Vercel
2. Set DATABASE_URL in environment variables
3. Deploy project