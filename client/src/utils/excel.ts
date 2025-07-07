import * as XLSX from 'xlsx';
import { BudgetItem, Employee } from '../types';
import { formatCurrency } from './calculations';

export const exportBudgetToExcel = (
  budgetData: BudgetItem[],
  currentYear: number,
  nextYear: number
) => {
  const dataRows = budgetData
    .filter(item => item.code)
    .map(item => {
      const currentValue = item.values?.[currentYear] || 0;
      const nextValue = item.values?.[nextYear] || 0;
      return [
        item.code,
        item.name,
        currentValue,
        nextValue,
        nextValue - currentValue,
        item.notes || ''
      ];
    });

  const totalCurrent = dataRows.reduce((sum, row) => sum + row[2], 0);
  const totalNext = dataRows.reduce((sum, row) => sum + row[3], 0);
  const totalRow = ['', 'ยอดรวมทั้งหมด', totalCurrent, totalNext, totalNext - totalCurrent, ''];

  const headers = [
    'รหัสบัญชี',
    'รายการ',
    `งบประมาณปี ${currentYear} (บาท)`,
    `คำของบประมาณปี ${nextYear} (บาท)`,
    'ผลต่าง (+/-)',
    'หมายเหตุ'
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows, totalRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'งบประมาณ');
  XLSX.writeFile(wb, `งบประมาณประจำปี_${currentYear}_vs_${nextYear}.xlsx`);
};

export const exportEmployeesToExcel = (employees: Employee[]) => {
  const headers = {
    id: 'รหัสพนักงาน',
    name: 'ชื่อ-สกุล',
    gender: 'เพศ',
    startYear: 'ปี พ.ศ. เริ่มงาน',
    level: 'ระดับ',
    visitProvince: 'จังหวัดเยี่ยมบ้าน',
    homeVisitBusFare: 'ค่ารถทัวร์เยี่ยมบ้าน'
  };

  const dataToExport = employees.map(emp => {
    const row: Record<string, any> = {};
    for (const [key, header] of Object.entries(headers)) {
      row[header] = emp[key as keyof Employee];
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลพนักงาน');
  XLSX.writeFile(wb, 'ข้อมูลพนักงาน.xlsx');
};

export const importEmployeesFromExcel = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const headerMapping = {
          'รหัสพนักงาน': 'id',
          'ชื่อ-สกุล': 'name',
          'เพศ': 'gender',
          'ปี พ.ศ. เริ่มงาน': 'startYear',
          'ระดับ': 'level',
          'จังหวัดเยี่ยมบ้าน': 'visitProvince',
          'ค่ารถทัวร์เยี่ยมบ้าน': 'homeVisitBusFare'
        };

        const importedData = jsonData.map((row: any) => {
          const newEmp: Partial<Employee> = {};
          for (const [thaiHeader, jsKey] of Object.entries(headerMapping)) {
            newEmp[jsKey as keyof Employee] = row[thaiHeader] !== undefined ? row[thaiHeader] : '';
          }
          return newEmp as Employee;
        });

        resolve(importedData);
      } catch (error) {
        reject(new Error('ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์และหัวข้อตาราง'));
      }
    };
    reader.readAsArrayBuffer(file);
  });
};