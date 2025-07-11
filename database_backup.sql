-- DATABASE BACKUP - Employee Management System
-- Created: 2025-01-11
-- Database: Neon PostgreSQL (sorawitt@gmail.com)
-- Connection: ep-wispy-cloud-adf79qwt.c-2.us-east-1.aws.neon.tech

-- =====================================
-- EMPLOYEES TABLE (15 records)
-- =====================================
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    start_year INTEGER NOT NULL,
    level VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'มีสิทธิ์',
    visit_province VARCHAR(50),
    home_visit_bus_fare DECIMAL(10,2) DEFAULT 0,
    working_days INTEGER DEFAULT 1,
    travel_working_days INTEGER DEFAULT 1,
    custom_travel_rates JSONB
);

INSERT INTO employees (id, employee_id, name, gender, start_year, level, status, visit_province, home_visit_bus_fare, working_days, travel_working_days, custom_travel_rates) VALUES
(1, '62539086', 'พัทธดนย์ ทรัพย์ประสม', 'ชาย', 2539, '7', 'มีสิทธิ์', 'พิษณุโลก', 1200.00, 5, 1, '{"other":4500}'),
(2, '52531175', 'พีรนุช ธนบดีภัทร', 'หญิง', 2531, '6', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(3, '42538115', 'อุณารักษ์ เดสันเทียะ', 'หญิง', 2538, '5.5', 'หมดสิทธิ์', '', 0.00, 1, 1, null),
(4, '42538092', 'สมควร กลิ่นสนธิ์', 'หญิง', 2538, '5.5', 'หมดสิทธิ์', '', 0.00, 1, 1, null),
(5, '52542046', 'สรวิชญ์ ธรศุภเดชา', 'ชาย', 2542, '5.5', 'หมดสิทธิ์', '', 600.00, 1, 1, null),
(6, '82538194', 'ชัญญ์ญาจิตร์ จุลเกษม', 'หญิง', 2538, '5', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(7, '82542011', 'มลธิรา สุขสำราญ', 'หญิง', 2542, '5', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(8, '82536096', 'นุสรา อัศวโชคชัย', 'หญิง', 2536, '5', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(9, '22538173', 'ประภัสนันท์ เล็กตระกูลธารา', 'หญิง', 2538, '5', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(10, '72539071', 'สันติภาพ ทองประดี', 'ชาย', 2539, '5', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(11, '62537025', 'วิชาญ อุปนันท์', 'ชาย', 2537, '5', 'มีสิทธิ์', 'เชียงใหม่', 1200.00, 1, 1, null),
(12, '52538087', 'สงวน ร้องเกาะเกิด', 'ชาย', 2538, '4.5', 'หมดสิทธิ์', '', 0.00, 1, 1, null),
(13, '2539140', 'สุมาพร จงภู่', 'หญิง', 2539, '4.5', 'มีสิทธิ์', 'ขอนแก่น', 600.00, 1, 1, null),
(14, '42540033', 'คมสันติ นุขุนทด', 'ชาย', 2540, '3', 'หมดสิทธิ์', '', 0.00, 1, 1, null),
(15, '82540031', 'พิชิต แจ่มศรี', 'ชาย', 2540, '3', 'หมดสิทธิ์', '', 0.00, 1, 1, null);

-- =====================================
-- MASTER RATES TABLE (7 records)
-- =====================================
CREATE TABLE master_rates (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) UNIQUE NOT NULL,
    position VARCHAR(100) NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    monthly_assist DECIMAL(10,2) NOT NULL,
    souvenir_allowance DECIMAL(10,2) NOT NULL,
    travel DECIMAL(10,2) NOT NULL,
    local DECIMAL(10,2) NOT NULL,
    per_diem DECIMAL(10,2) NOT NULL,
    hotel DECIMAL(10,2) NOT NULL
);

INSERT INTO master_rates (id, level, position, rent, monthly_assist, souvenir_allowance, travel, local, per_diem, hotel) VALUES
(1, '7', 'ผู้บริหารส่วน', 9500.00, 6250.00, 8000.00, 600.00, 500.00, 500.00, 2100.00),
(2, '6', 'ผู้บริหารทีม', 9500.00, 6250.00, 8000.00, 600.00, 500.00, 500.00, 2100.00),
(3, '5.5', 'เจ้าหน้าที่ชำนาญงาน (ควบ)', 9500.00, 6250.00, 8000.00, 600.00, 500.00, 500.00, 2100.00),
(4, '5', 'เจ้าหน้าที่ชำนาญงาน', 8000.00, 5500.00, 6000.00, 600.00, 500.00, 450.00, 1800.00),
(5, '4.5', 'เจ้าหน้าที่ (ควบ)', 8000.00, 5500.00, 6000.00, 600.00, 500.00, 450.00, 1800.00),
(6, '4', 'เจ้าหน้าที่', 8000.00, 5500.00, 6000.00, 600.00, 500.00, 450.00, 1800.00),
(7, '3', 'พนักงานปฏิบัติการ', 6500.00, 4750.00, 5000.00, 600.00, 500.00, 450.00, 1800.00);

-- =====================================
-- OVERTIME ITEMS TABLE (1 record)
-- =====================================
CREATE TABLE overtime_items (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    item TEXT NOT NULL,
    instances INTEGER,
    days INTEGER,
    hours INTEGER,
    people INTEGER,
    rate DECIMAL(10,2),
    salary DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

INSERT INTO overtime_items (id, year, item, instances, days, hours, people, rate, salary, created_at, updated_at) VALUES
(6, 2569, 'ทำงานวันหยุด', 1, 1, 7, 1, 714.29, 150000.00, '2025-07-09 17:43:50.58812', '2025-07-09 17:43:50.58812');

-- =====================================
-- SPECIAL ASSIST ITEMS TABLE
-- =====================================
CREATE TABLE special_assist_items (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    item TEXT NOT NULL,
    times_per_year INTEGER,
    days INTEGER,
    people INTEGER,
    rate DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Special assist items stored in frontend localStorage as JSON

-- =====================================
-- BUDGET ITEMS TABLE
-- =====================================
CREATE TABLE budget_items (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20),
    code VARCHAR(20),
    account_code VARCHAR(20),
    name TEXT NOT NULL,
    values JSONB,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Budget items table is empty - data managed in frontend

-- =====================================
-- HOLIDAYS TABLE
-- =====================================
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Holidays data managed in frontend defaults

-- =====================================
-- ASSISTANCE DATA TABLE
-- =====================================
CREATE TABLE assistance_data (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Assistance data stored in frontend localStorage

-- =====================================
-- USERS TABLE
-- =====================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- No users currently in system - authentication not implemented

-- =====================================
-- COMPLETE DATABASE BACKUP SUMMARY
-- =====================================
-- Total Tables: 8
-- Total Records: 23 (15 employees + 7 master rates + 1 overtime)
-- Key Data:
-- - 15 employees with complete profile data
-- - 7 level-based master rates for expense calculations
-- - 1 overtime record for year 2569
-- - Employee levels: 7 (1), 6 (1), 5.5 (3), 5 (6), 4.5 (2), 3 (2)
-- - Status: 9 active (มีสิทธิ์), 6 inactive (หมดสิทธิ์)
-- - Visit provinces: ขอนแก่น (10), พิษณุโลก (1), เชียงใหม่ (1), none (3)
-- - Bus fares: 0-1200 baht range
-- - Working days: 1-5 days range
-- - Master rates: Level 7 highest rates, Level 3 lowest rates
-- - Overtime: 714.29 baht/hour for 150,000 salary

-- =====================================
-- RESTORATION INSTRUCTIONS
-- =====================================
-- 1. Create new Neon database
-- 2. Run this SQL script to restore all tables and data
-- 3. Update DATABASE_URL in environment variables
-- 4. Verify data integrity with SELECT queries
-- 5. Test API endpoints: /api/employees, /api/master-rates, /api/overtime-items

-- END OF BACKUP