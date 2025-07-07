# ระบบจัดทำงบประมาณประจำปี (Budget Management System)

## ข้อกำหนดสำหรับการ Deploy บน Vercel

### 1. ตั้งค่า Environment Variables

ก่อน deploy ให้ตั้งค่า environment variables ใน Vercel Dashboard:

```
DATABASE_URL=your_neon_postgresql_connection_string
```

### 2. การ Deploy

1. เชื่อมต่อ repository กับ Vercel
2. ตั้งค่า Build Command: `npm run build`
3. ตั้งค่า Output Directory: `dist`
4. Deploy!

### 3. ข้อมูลสำคัญ

- ใช้ Neon PostgreSQL สำหรับฐานข้อมูล
- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript + Drizzle ORM
- UI: Tailwind CSS + Radix UI (Neumorphism Design)

### 4. คำสั่งหลัก

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database push
npm run db:push
```

### 5. ฟีเจอร์หลัก

- ✅ จัดการงบประมาณประจำปี
- ✅ คำนวณค่าใช้จ่ายเดินทาง
- ✅ จัดการข้อมูลพนักงาน
- ✅ ระบบช่วยเหลือพิเศษ
- ✅ คำนวณเงินล่วงเวลา
- ✅ จัดการวันหยุดราชการ

### 6. การติดตั้ง Dependencies

```bash
npm install
```

### 7. สำหรับนักพัฒนา

- TypeScript ครบทุกไฟล์
- Type-safe database operations
- Modern React patterns
- Responsive design
- Professional UI/UX