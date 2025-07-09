import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { BudgetItem, Employee } from '../types';
import { formatCurrency } from './calculations';

export const exportBudgetToExcel = async (
  budgetData: BudgetItem[],
  currentYear: number,
  nextYear: number
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('งบประมาณ');

  // Set up page layout for A4 landscape
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  // Add title
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `ตารางงบประมาณประจำปี ${currentYear} เปรียบเทียบกับปี ${nextYear}`;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { size: 16, bold: true };
  titleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Add headers
  const headers = [
    'รหัสบัญชี',
    'รายการ',
    `งบประมาณปี ${currentYear} (บาท)`,
    `คำของบประมาณปี ${nextYear} (บาท)`,
    'ผลต่าง (+/-)',
    'หมายเหตุ'
  ];

  worksheet.getRow(2).values = headers;
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE3F2FD' }
  };

  // Add borders to header row
  headers.forEach((_, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  let currentRow = 3;
  let totalCurrent = 0;
  let totalNext = 0;

  budgetData.forEach(item => {
    if (item.type === 'main_header') {
      // Main header row
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const headerCell = worksheet.getCell(`A${currentRow}`);
      headerCell.value = item.name;
      headerCell.font = { bold: true, size: 14 };
      headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2196F3' }
      };
      headerCell.font = { ...headerCell.font, color: { argb: 'FFFFFFFF' } };
      headerCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentRow++;
    } else if (item.type === 'header') {
      // Sub header row
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const subHeaderCell = worksheet.getCell(`A${currentRow}`);
      subHeaderCell.value = item.name;
      subHeaderCell.font = { bold: true };
      subHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      subHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
      subHeaderCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentRow++;
    } else if (item.code) {
      // Data row
      const currentValue = item.values?.[currentYear] || 0;
      const nextValue = item.values?.[nextYear] || 0;
      const diff = nextValue - currentValue;

      totalCurrent += currentValue;
      totalNext += nextValue;

      const row = worksheet.getRow(currentRow);
      row.values = [
        item.code,
        item.name,
        currentValue,
        nextValue,
        diff,
        item.notes || ''
      ];

      // Format numbers
      row.getCell(3).numFmt = '#,##0';
      row.getCell(4).numFmt = '#,##0';
      row.getCell(5).numFmt = '#,##0';

      // Add borders
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      currentRow++;
    }
  });

  // Add total row
  const totalRow = worksheet.getRow(currentRow);
  totalRow.values = ['', 'ยอดรวมทั้งหมด', totalCurrent, totalNext, totalNext - totalCurrent, ''];
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEB3B' }
  };
  totalRow.getCell(3).numFmt = '#,##0';
  totalRow.getCell(4).numFmt = '#,##0';
  totalRow.getCell(5).numFmt = '#,##0';

  // Add borders to total row
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = {
      top: { style: 'thick' },
      left: { style: 'thin' },
      bottom: { style: 'thick' },
      right: { style: 'thin' }
    };
  });

  // Set column widths
  worksheet.columns = [
    { width: 12 }, // รหัสบัญชี
    { width: 35 }, // รายการ
    { width: 18 }, // งบประมาณปีปัจจุบัน
    { width: 18 }, // คำของบประมาณปีถัดไป
    { width: 15 }, // ผลต่าง
    { width: 20 }  // หมายเหตุ
  ];

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `งบประมาณประจำปี_${currentYear}_vs_${nextYear}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportEmployeesToExcel = async (employees: Employee[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('รายการพนักงาน');

  // Set up page layout for A4 landscape
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  // Add title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'รายการพนักงาน';
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { size: 16, bold: true };
  titleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Add headers
  const headers = [
    'รหัสพนักงาน',
    'ชื่อ-สกุล',
    'เพศ',
    'ปี พ.ศ. เริ่มงาน',
    'ระดับ',
    'สถานะ',
    'จังหวัดที่เยี่ยม',
    'ค่ารถเยี่ยมบ้าน'
  ];

  worksheet.getRow(2).values = headers;
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE3F2FD' }
  };

  // Add borders to header row
  headers.forEach((_, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  employees.forEach((employee, index) => {
    const row = worksheet.getRow(index + 3);
    row.values = [
      employee.id,
      employee.name,
      employee.gender,
      employee.startYear,
      employee.level,
      employee.status || 'มีสิทธิ์',
      employee.visitProvince,
      employee.homeVisitBusFare
    ];

    // Format numbers
    row.getCell(8).numFmt = '#,##0';

    // Add borders
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Set column widths
  worksheet.columns = [
    { width: 15 }, // รหัสพนักงาน
    { width: 25 }, // ชื่อ-สกุล
    { width: 8 },  // เพศ
    { width: 15 }, // ปี พ.ศ. เริ่มงาน
    { width: 10 }, // ระดับ
    { width: 12 }, // สถานะ
    { width: 18 }, // จังหวัดที่เยี่ยม
    { width: 15 }  // ค่าโดยสารรถบัส
  ];

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `รายการพนักงาน_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

// Travel Export Functions
export const exportTravelToExcel = async (employees: any[], title: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  // Set up page layout for A4 landscape
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  // Add title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { size: 16, bold: true };
  titleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Add headers based on travel type
  let headers: string[] = [];
  if (title.includes('ค่าเดินทาง')) {
    headers = ['รหัสพนักงาน', 'ชื่อ-สกุล', 'ปีรับราชการ', 'ค่าโรงแรม', 'ค่าเบี้ยเลี้ยง', 'ค่าเดินทาง', 'ค่าท้องถิ่น', 'รวมทั้งหมด'];
  } else if (title.includes('ช่วยเหลือพิเศษ')) {
    headers = ['รหัสพนักงาน', 'ชื่อ-สกุล', 'ปีรับราชการ', 'ค่าเช่าที่พัก', 'ค่าช่วยเหลือรายเดือน', 'เงินก้อน', 'รวมทั้งหมด'];
  } else if (title.includes('เยี่ยมครอบครัว')) {
    headers = ['รหัสพนักงาน', 'ชื่อ-สกุล', 'จังหวัดที่เยี่ยม', 'ค่าโดยสารไป-กลับ', 'รวมทั้งหมด'];
  } else if (title.includes('ทริปบริษัท')) {
    headers = ['รหัสพนักงาน', 'ชื่อ-สกุล', 'ค่าโดยสาร', 'ค่าที่พัก', 'รวมทั้งหมด', 'หมายเหตุ'];
  } else if (title.includes('หมุนเวียน')) {
    headers = ['รหัสพนักงาน', 'ชื่อ-สกุล', 'ค่าเบี้ยเลี้ยง', 'ค่าที่พัก', 'ค่าเดินทาง', 'รวมทั้งหมด'];
  }

  worksheet.getRow(2).values = headers;
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE3F2FD' }
  };

  // Add borders to header row
  headers.forEach((_, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  employees.forEach((employee, index) => {
    const row = worksheet.getRow(index + 3);
    let values: any[] = [];
    
    if (title.includes('ค่าเดินทาง')) {
      values = [
        employee.id,
        employee.name,
        employee.startYear,
        employee.hotel || 0,
        employee.perDiem || 0,
        employee.travelRoundTrip || 0,
        employee.localRoundTrip || 0,
        employee.total || 0
      ];
    } else if (title.includes('ช่วยเหลือพิเศษ')) {
      values = [
        employee.id,
        employee.name,
        employee.startYear,
        employee.totalRent || 0,
        employee.totalMonthlyAssist || 0,
        employee.lumpSum || 0,
        employee.total || 0
      ];
    } else if (title.includes('เยี่ยมครอบครัว')) {
      values = [
        employee.id,
        employee.name,
        employee.visitProvince,
        employee.roundTripFare || 0,
        employee.total || 0
      ];
    } else if (title.includes('ทริปบริษัท')) {
      values = [
        employee.id,
        employee.name,
        employee.busFare || 0,
        employee.accommodationCost || 0,
        employee.total || 0,
        employee.note || ''
      ];
    } else if (title.includes('หมุนเวียน')) {
      values = [
        employee.id,
        employee.name,
        employee.perDiemCost || 0,
        employee.accommodationCost || 0,
        employee.totalTravel || 0,
        employee.total || 0
      ];
    }

    row.values = values;

    // Format numbers (skip text columns)
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0';
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Set column widths
  worksheet.columns = headers.map(() => ({ width: 15 }));

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

// Special Assistance Export
export const exportSpecialAssistanceToExcel = async (data: any, overtimeData: any, year: number) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ข้อมูลความช่วยเหลือพิเศษ');

  // Set up page layout for A4 landscape
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  // Add title
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `ข้อมูลความช่วยเหลือพิเศษ ปี ${year}`;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { size: 16, bold: true };
  titleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  let currentRow = 3;

  // Special Assistance Items
  worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const assistHeader = worksheet.getCell(`A${currentRow}`);
  assistHeader.value = 'รายการช่วยเหลือพิเศษ';
  assistHeader.font = { bold: true, size: 14 };
  assistHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  assistHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2196F3' }
  };
  assistHeader.font = { ...assistHeader.font, color: { argb: 'FFFFFFFF' } };
  currentRow++;

  const assistHeaders = ['รายการ', 'ครั้งต่อปี', 'วัน', 'คน', 'อัตรา', 'จำนวนเงิน', 'หมายเหตุ'];
  worksheet.getRow(currentRow).values = assistHeaders;
  worksheet.getRow(currentRow).font = { bold: true };
  worksheet.getRow(currentRow).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE3F2FD' }
  };
  currentRow++;

  // Add special assistance data
  data.items.forEach((item: any) => {
    const row = worksheet.getRow(currentRow);
    row.values = [
      item.item,
      item.timesPerYear,
      item.days,
      item.people,
      item.rate,
      item.timesPerYear * item.days * item.people * item.rate,
      ''
    ];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (typeof cell.value === 'number' && colNumber > 1) {
        cell.numFmt = '#,##0';
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
  });

  // Add overtime section
  currentRow += 2;
  worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const overtimeHeader = worksheet.getCell(`A${currentRow}`);
  overtimeHeader.value = 'ข้อมูลล่วงเวลา';
  overtimeHeader.font = { bold: true, size: 14 };
  overtimeHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  overtimeHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4CAF50' }
  };
  overtimeHeader.font = { ...overtimeHeader.font, color: { argb: 'FFFFFFFF' } };
  currentRow++;

  const overtimeHeaders = ['รายการ', 'ครั้ง', 'วัน', 'ชั่วโมง', 'คน', 'อัตรา', 'จำนวนเงิน'];
  worksheet.getRow(currentRow).values = overtimeHeaders;
  worksheet.getRow(currentRow).font = { bold: true };
  worksheet.getRow(currentRow).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F5E8' }
  };
  currentRow++;

  // Add overtime data
  overtimeData.items.forEach((item: any) => {
    const row = worksheet.getRow(currentRow);
    const hourlyRate = (overtimeData.salary / 30 / 8) * 1.5;
    const totalAmount = item.instances * item.days * item.hours * item.people * hourlyRate;
    
    row.values = [
      item.item,
      item.instances,
      item.days,
      item.hours,
      item.people,
      hourlyRate,
      totalAmount
    ];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (typeof cell.value === 'number' && colNumber > 1) {
        cell.numFmt = '#,##0';
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
  });

  // Set column widths
  worksheet.columns = [
    { width: 25 }, // รายการ
    { width: 12 }, // ครั้งต่อปี/ครั้ง
    { width: 10 }, // วัน
    { width: 12 }, // ชั่วโมง/คน
    { width: 10 }, // คน
    { width: 15 }, // อัตรา
    { width: 18 }  // จำนวนเงิน
  ];

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ข้อมูลความช่วยเหลือพิเศษ_${year}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

// Master Rates Export Function
export const exportMasterRatesToExcel = async (masterRates: Record<string, any>) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ตารางค่าใช้จ่ายมาตรฐาน');

  // Set up page layout for A4 landscape
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  // Add title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'ตารางค่าใช้จ่ายมาตรฐาน';
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { size: 16, bold: true };
  titleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Add headers
  const headers = [
    'ระดับ',
    'ตำแหน่ง',
    'ค่าเช่าที่พัก',
    'ค่าช่วยเหลือรายเดือน',
    'เงินก้อน',
    'ค่าเดินทาง',
    'ค่าท้องถิ่น',
    'ค่าเบี้ยเลี้ยง',
    'ค่าโรงแรม'
  ];

  worksheet.getRow(2).values = headers;
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE3F2FD' }
  };

  // Add borders to header row
  headers.forEach((_, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  const levels = Object.keys(masterRates).sort((a, b) => parseFloat(b) - parseFloat(a));
  levels.forEach((level, index) => {
    const rate = masterRates[level];
    const row = worksheet.getRow(index + 3);
    row.values = [
      level,
      rate.position || '',
      rate.rent || 0,
      rate.monthlyAssist || 0,
      rate.lumpSum || 0,
      rate.travel || 0,
      rate.local || 0,
      rate.perDiem || 0,
      rate.hotel || 0
    ];

    // Format numbers
    for (let i = 3; i <= 9; i++) {
      row.getCell(i).numFmt = '#,##0';
    }

    // Add borders
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Set column widths
  worksheet.columns = [
    { width: 10 }, // ระดับ
    { width: 20 }, // ตำแหน่ง
    { width: 15 }, // ค่าเช่าที่พัก
    { width: 20 }, // ค่าช่วยเหลือรายเดือน
    { width: 15 }, // เงินก้อน
    { width: 15 }, // ค่าเดินทาง
    { width: 15 }, // ค่าท้องถิ่น
    { width: 15 }, // ค่าเบี้ยเลี้ยง
    { width: 15 }  // ค่าโรงแรม
  ];

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ตารางค่าใช้จ่ายมาตรฐาน_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

// Legacy XLSX function for backward compatibility
export const exportEmployeesToExcelLegacy = (employees: Employee[]) => {
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