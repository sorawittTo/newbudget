import fs from 'fs';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { 
  employees, 
  masterRates, 
  budgetItems, 
  overtimeItems 
} from './shared/schema.js';

// Supabase connection
const supabaseUrl = 'postgresql://postgres.pytyjeugghucgeexhatr:0927895299Sorawitt@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';
const supabasePool = new Pool({ connectionString: supabaseUrl });
const supabaseDb = drizzle({ client: supabasePool });

async function migrateData() {
  try {
    console.log('🚀 เริ่มการย้ายข้อมูลไป Supabase...');
    
    // Load backup data
    const employeesData = JSON.parse(fs.readFileSync('employees_backup.json', 'utf8'));
    const masterRatesData = JSON.parse(fs.readFileSync('master_rates_backup.json', 'utf8'));
    const budgetItemsData = JSON.parse(fs.readFileSync('budget_items_backup.json', 'utf8'));
    const overtimeItemsData = JSON.parse(fs.readFileSync('overtime_items_backup.json', 'utf8'));
    
    console.log(`📊 ข้อมูลที่จะย้าย:
    - พนักงาน: ${employeesData.length} คน
    - ตารางอัตรา: ${masterRatesData.length} ระดับ
    - งบประมาณ: ${budgetItemsData.length} รายการ
    - ล่วงเวลา: ${overtimeItemsData.length} รายการ`);
    
    // Migrate employees
    console.log('👥 กำลังย้ายข้อมูลพนักงาน...');
    for (const emp of employeesData) {
      await supabaseDb.insert(employees).values({
        employeeId: emp.employeeId,
        name: emp.name,
        gender: emp.gender,
        startYear: emp.startYear,
        level: emp.level,
        status: emp.status,
        visitProvince: emp.visitProvince,
        homeVisitBusFare: emp.homeVisitBusFare,
        workingDays: emp.workingDays,
        travelWorkingDays: emp.travelWorkingDays,
        customTravelRates: emp.customTravelRates
      });
    }
    console.log('✅ ย้ายข้อมูลพนักงานเสร็จ');
    
    // Migrate master rates
    console.log('💰 กำลังย้ายตารางอัตรา...');
    for (const rate of masterRatesData) {
      await supabaseDb.insert(masterRates).values({
        level: rate.level,
        position: rate.position,
        rent: rate.rent,
        monthlyAssist: rate.monthlyAssist,
        souvenirAllowance: rate.souvenirAllowance,
        travel: rate.travel,
        local: rate.local,
        perDiem: rate.perDiem,
        hotel: rate.hotel
      });
    }
    console.log('✅ ย้ายตารางอัตราเสร็จ');
    
    // Migrate budget items
    console.log('📋 กำลังย้ายงบประมาณ...');
    for (const item of budgetItemsData) {
      await supabaseDb.insert(budgetItems).values({
        type: item.type,
        code: item.code,
        accountCode: item.accountCode,
        name: item.name,
        year: item.year,
        amount: item.amount,
        notes: item.notes
      });
    }
    console.log('✅ ย้ายงบประมาณเสร็จ');
    
    // Migrate overtime items
    console.log('⏰ กำลังย้ายข้อมูลล่วงเวลา...');
    for (const item of overtimeItemsData) {
      await supabaseDb.insert(overtimeItems).values({
        year: item.year,
        item: item.item,
        instances: item.instances,
        days: item.days,
        hours: item.hours,
        people: item.people,
        rate: item.rate,
        salary: item.salary
      });
    }
    console.log('✅ ย้ายข้อมูลล่วงเวลาเสร็จ');
    
    console.log('🎉 ย้ายข้อมูลทั้งหมดเสร็จเรียบร้อย!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await supabasePool.end();
  }
}

migrateData();