import fs from 'fs';

// อ่านข้อมูลจากไฟล์สำรอง
const employeesData = JSON.parse(fs.readFileSync('employees_backup.json', 'utf8'));
const masterRatesData = JSON.parse(fs.readFileSync('master_rates_backup.json', 'utf8'));
const budgetItemsData = JSON.parse(fs.readFileSync('budget_items_backup.json', 'utf8'));
const overtimeItemsData = JSON.parse(fs.readFileSync('overtime_items_backup.json', 'utf8'));

console.log('📊 ข้อมูลที่พร้อมย้าย:');
console.log(`- พนักงาน: ${employeesData.length} คน`);
console.log(`- ตารางอัตรา: ${masterRatesData.length} ระดับ`);
console.log(`- งบประมาณ: ${budgetItemsData.length} รายการ`);
console.log(`- ล่วงเวลา: ${overtimeItemsData.length} รายการ`);

// สร้างไฟล์ INSERT SQL สำหรับ Supabase
let sqlContent = '-- Data Migration to Supabase\n\n';

// Employees
sqlContent += '-- Insert employees\n';
for (const emp of employeesData) {
  const customRates = emp.customTravelRates ? `'${JSON.stringify(emp.customTravelRates)}'::jsonb` : 'NULL';
  sqlContent += `INSERT INTO employees (employee_id, name, gender, start_year, level, status, visit_province, home_visit_bus_fare, working_days, travel_working_days, custom_travel_rates) VALUES ('${emp.employeeId}', '${emp.name}', '${emp.gender}', ${emp.startYear}, '${emp.level}', '${emp.status}', '${emp.visitProvince}', ${emp.homeVisitBusFare}, ${emp.workingDays}, ${emp.travelWorkingDays}, ${customRates});\n`;
}

// Master Rates
sqlContent += '\n-- Insert master rates\n';
for (const rate of masterRatesData) {
  sqlContent += `INSERT INTO master_rates (level, position, rent, monthly_assist, souvenir_allowance, travel, local, per_diem, hotel) VALUES ('${rate.level}', '${rate.position}', ${rate.rent}, ${rate.monthlyAssist}, ${rate.souvenirAllowance}, ${rate.travel}, ${rate.local}, ${rate.perDiem}, ${rate.hotel});\n`;
}

// Budget Items
sqlContent += '\n-- Insert budget items\n';
for (const item of budgetItemsData) {
  const type = item.type ? `'${item.type}'` : 'NULL';
  const code = item.code ? `'${item.code}'` : 'NULL';
  const accountCode = item.accountCode ? `'${item.accountCode}'` : 'NULL';
  sqlContent += `INSERT INTO budget_items (type, code, account_code, name, year, amount, notes) VALUES (${type}, ${code}, ${accountCode}, '${item.name}', ${item.year}, ${item.amount}, '${item.notes}');\n`;
}

// Overtime Items
sqlContent += '\n-- Insert overtime items\n';
for (const item of overtimeItemsData) {
  sqlContent += `INSERT INTO overtime_items (year, item, instances, days, hours, people, rate, salary) VALUES (${item.year}, '${item.item}', ${item.instances}, ${item.days}, ${item.hours}, ${item.people}, ${item.rate}, ${item.salary});\n`;
}

// เขียนไฟล์ SQL
fs.writeFileSync('supabase_migration.sql', sqlContent);
console.log('\n✅ สร้างไฟล์ supabase_migration.sql เสร็จเรียบร้อย');
console.log('📝 ใช้ไฟล์นี้ใน Supabase SQL Editor เพื่อย้ายข้อมูล');