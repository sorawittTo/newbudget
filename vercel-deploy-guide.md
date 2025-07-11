# Vercel Deployment Guide
## Account: sorawitt@gmail.com

### 🚀 Quick Deploy Steps:

**1. Connect to Vercel Dashboard:**
- Go to https://vercel.com/dashboard
- Login with sorawitt@gmail.com

**2. Import Project:**
- Click "Add New..." → "Project"
- Choose "Import Git Repository"
- Connect to GitHub: https://github.com/kimhun645/newbudget
- OR Upload project files directly

**3. Configure Build Settings:**
- Framework Preset: **Other**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**4. Environment Variables:**
```
DATABASE_URL=postgresql://neondb_owner:npg_m1XNi8rhsxeo@ep-wispy-cloud-adf79qwt.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**5. Deploy:**
- Click "Deploy"
- Wait for build completion
- Test API endpoints after deployment

### 🔧 Technical Details:

**Project Structure:**
- Frontend: React + TypeScript + Vite
- Backend: Node.js serverless functions
- Database: Neon PostgreSQL
- API Endpoints: `/api/employees`, `/api/master-rates`, `/api/overtime-items`, `/api/budget-items`

**Files Ready:**
- ✅ `vercel.json` - Deployment configuration
- ✅ `api/*.ts` - Serverless functions
- ✅ `.vercelignore` - Ignore unnecessary files
- ✅ `package.json` - Dependencies and scripts
- ✅ Database backup in `database_backup.sql`

**Post-Deploy Testing:**
1. Visit deployed URL
2. Test frontend functionality
3. Check API endpoints: `https://your-domain.vercel.app/api/employees`
4. Verify database connection

### 📊 Expected Results:
- 15 employees loaded
- 7 master rates levels
- 1 overtime record (2569)
- All travel calculations working
- Dashboard showing correct data

### 🔄 Alternative: Direct GitHub Push
If you prefer to update GitHub first:
```bash
git remote set-url origin https://github.com/sorawitt/budget-system
git push -u origin main
```
Then connect Vercel to your new repository.