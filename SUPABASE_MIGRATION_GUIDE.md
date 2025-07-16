# การย้ายฐานข้อมูลไป Supabase

## ขั้นตอนการตั้งค่า Supabase

### 1. สร้างโปรเจค Supabase
1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. คลิก "New Project" เพื่อสร้างโปรเจคใหม่
3. เลือกองค์กรของคุณและกรอกข้อมูลโปรเจค:
   - **Name**: Budget Management System
   - **Database Password**: ตั้งรหัสผ่านที่แข็งแกร่ง (เก็บไว้ใช้ในขั้นตอนต่อไป)
   - **Region**: เลือกภูมิภาคที่ใกล้ที่สุด (แนะนำ: Southeast Asia)
4. คลิก "Create new project"

### 2. รับ Database URL
1. หลังจากโปรเจคสร้างเสร็จแล้ว ไปที่หน้า Project Dashboard
2. คลิก "Connect" ที่แถบด้านบน
3. เลือก "Transaction pooler" (สำหรับ Production)
4. คัดลอก URI ภายใต้ "Connection string"
5. แทนที่ `[YOUR-PASSWORD]` ด้วยรหัสผ่านที่ตั้งไว้ในขั้นตอนที่ 1

### 3. อัพเดท Environment Variables
1. เปิดไฟล์ `.env` ในโปรเจค
2. แทนที่ `your_supabase_database_url_here` ด้วย Database URL ที่คัดลอกมา
3. รูปแบบ URL จะเป็น:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

### 4. ย้ายข้อมูลฐานข้อมูล
1. รันคำสั่ง: `npm run db:push`
2. ระบบจะสร้างตารางทั้งหมดใน Supabase อัตโนมัติ:
   - `users` - ข้อมูลผู้ใช้
   - `employees` - ข้อมูลพนักงาน (14 คน)
   - `master_rates` - ตารางอัตราค่าใช้จ่าย (7 ระดับ)
   - `budget_items` - รายการงบประมาณ (74 รายการ)
   - `special_assist_items` - รายการเงินช่วยเหลือพิเศษ
   - `overtime_items` - รายการค่าล่วงเวลา
   - `holidays` - รายการวันหยุด
   - `assistance_data` - ข้อมูลเงินช่วยเหลือ

### 5. ตัวอย่าง Database URL
```
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 6. ตรวจสอบการเชื่อมต่อ
1. รีสตาร์ท application: `npm run dev`
2. ตรวจสอบ console logs ว่าไม่มี error
3. ทดสอบการโหลดข้อมูลในเว็บแอป

## ข้อดีของ Supabase
- **Real-time subscriptions**: รองรับการอัพเดทแบบ real-time
- **Row Level Security**: ความปลอดภัยระดับแถว
- **API อัตโนมัติ**: สร้าง REST API และ GraphQL API อัตโนมัติ
- **Dashboard**: เครื่องมือจัดการฐานข้อมูลที่สมบูรณ์
- **Backup**: ระบบสำรองข้อมูลอัตโนมัติ
- **Scaling**: ขยายขนาดได้ง่าย

## การใช้งาน Supabase Dashboard
1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. เลือกโปรเจคของคุณ
3. ใช้ **Table Editor** เพื่อดูและแก้ไขข้อมูล
4. ใช้ **SQL Editor** เพื่อเขียน query
5. ใช้ **Database** เพื่อดูโครงสร้างตาราง

## หมายเหตุ
- ระบบใช้ Drizzle ORM เชื่อมต่อกับ Supabase โดยตรง
- ไม่ต้องติดตั้ง `@supabase/supabase-js` package
- Database URL ถูกเก็บใน environment variable เพื่อความปลอดภัย