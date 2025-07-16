# วิธีการ Setup GitHub Repository

## 🔗 เชื่อมต่อ Replit กับ GitHub

### ขั้นตอนที่ 1: สร้าง GitHub Repository
1. ไปที่ https://github.com
2. คลิก "New repository"
3. ตั้งชื่อ: `thai-budget-system`
4. เลือก "Public" หรือ "Private"
5. คลิก "Create repository"

### ขั้นตอนที่ 2: เชื่อมต่อใน Replit
1. ใน Replit: เปิด Version Control tab (Git icon)
2. คลิก "Connect to GitHub"
3. Authorize Replit ให้เข้าถึง GitHub
4. เลือก repository ที่สร้าง
5. คลิก "Connect"

### ขั้นตอนที่ 3: Push Code
1. ใน Version Control tab
2. เลือกไฟล์ที่จะ commit
3. เขียน commit message: "Initial commit - Budget management system"
4. คลิก "Commit & Push"

### ขั้นตอนที่ 4: ตรวจสอบ
1. ไปที่ GitHub repository
2. ตรวจสอบว่าไฟล์ทั้งหมดถูก upload แล้ว
3. ควรมีไฟล์:
   - `package.json`
   - `vercel.json`
   - `api/` folder
   - `client/` folder
   - `shared/` folder

## 📋 ไฟล์ที่สำคัญ
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Dependencies
- ✅ `api/employees.ts` - Employee API
- ✅ `api/master-rates.ts` - Master rates API
- ✅ `api/budget-items.ts` - Budget API
- ✅ `api/overtime-items.ts` - Overtime API
- ✅ `shared/schema.ts` - Database schema
- ✅ `client/` - Frontend code

## 🚀 พร้อมสำหรับ Vercel
หลังจาก push code ไป GitHub แล้ว สามารถนำไป deploy บน Vercel ได้ทันที