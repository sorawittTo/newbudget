# วิธีการ Deploy บน Vercel เอง

## 📋 ข้อมูลโครงการ
- **ชื่อโครงการ**: ระบบจัดการงบประมาณพนักงาน
- **Database**: Supabase PostgreSQL (พร้อมใช้งาน)
- **ข้อมูล**: 15 พนักงาน, 7 ตารางอัตรา, 35 รายการงบประมาณ

## 🚀 ขั้นตอนการ Deploy

### 1. เตรียม Account Vercel
1. ไปที่ https://vercel.com
2. Sign up หรือ Login ด้วย GitHub, GitLab, หรือ Bitbucket
3. เข้าสู่ Dashboard

### 2. เตรียม Code Repository
1. Push โค้ดไปยัง GitHub repository
2. หรือ import โค้ดจาก Replit ไป GitHub:
   - ใน Replit: Version Control → Connect to GitHub
   - สร้าง repository ใหม่
   - Push โค้ดทั้งหมด

### 3. Create New Project ใน Vercel
1. ใน Vercel Dashboard คลิก "New Project"
2. เลือก "Import Git Repository"
3. เลือก repository ของคุณ
4. คลิก "Import"

### 4. Configuration Settings
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 5. Environment Variables (ไม่ต้องตั้ง)
- ระบบใช้ hardcoded Supabase connection
- ไม่ต้องตั้ง DATABASE_URL

### 6. Deploy
1. คลิก "Deploy"
2. รอ build process เสร็จ (2-5 นาที)
3. ได้ URL ใหม่ที่ลงท้ายด้วย `.vercel.app`

## 📁 ไฟล์ที่สำคัญ
- `vercel.json` - Configuration สำหรับ Vercel
- `api/*.ts` - API endpoints สำหรับ Vercel Functions
- `package.json` - Dependencies และ build scripts

## 🔧 การแก้ไขปัญหา
1. **Build Error**: ตรวจสอบ dependencies ใน package.json
2. **API Error**: ตรวจสอบ API functions ใน folder `api/`
3. **Database Error**: ตรวจสอบ Supabase connection

## 📝 หมายเหตุ
- ไม่ต้องตั้ง environment variables
- Database connection ถูก hardcode แล้ว
- ระบบพร้อม deploy ทันที