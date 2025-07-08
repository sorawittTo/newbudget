import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetData } from './hooks/useBudgetData';
import { AppLayout } from './components/layout/AppLayout';
import { ModernDashboard } from './components/dashboard/ModernDashboard';

import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { TravelExpenseManager } from './components/travel/TravelExpenseManager';
import { SpecialAssistanceManager } from './components/assistance/SpecialAssistanceManager';
import { ModernWorkdayManager } from './components/workday/ModernWorkdayManager';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toast } from './components/ui/Toast';
import { exportEmployeesToExcel, importEmployeesFromExcel } from './utils/excel';


function App() {
  const {

    employees,
    masterRates,
    specialAssist1DataByYear,
    overtimeDataByYear,
    holidaysData,
    selectedTravelEmployees,
    selectedSpecialAssistEmployees,
    selectedFamilyVisitEmployees,
    selectedCompanyTripEmployees,
    selectedManagerRotationEmployees,
    isLoading,

    updateEmployee,
    addEmployee,
    deleteEmployee,
    updateMasterRate,
    setEmployees,
    getSpecialAssist1DataForYear,
    getOvertimeDataForYear,
    updateSpecialAssist1Item,
    updateSpecialAssist1Notes,
    updateOvertimeData,
    addHoliday,
    deleteHoliday,
    setSelectedTravelEmployees,
    setSelectedSpecialAssistEmployees,
    setSelectedFamilyVisitEmployees,
    setSelectedCompanyTripEmployees,
    setSelectedManagerRotationEmployees,
    saveAllData,
    resetAllData
  } = useBudgetData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentYear, setCurrentYear] = useState(2568);
  const [nextYear, setNextYear] = useState(2569);
  const [calcYear, setCalcYear] = useState(2569);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'success' | 'error' }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ isVisible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const result = await saveAllData();
      if (result.success) {
        showToast('บันทึกข้อมูลไปยัง Neon PostgreSQL เรียบร้อยแล้ว');
      } else {
        showToast(result.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
      console.error('Save error:', error);
    }
  }, [saveAllData, showToast]);



  const handleExportEmployees = useCallback(() => {
    try {
      exportEmployeesToExcel(employees);
      showToast('ส่งออกข้อมูลพนักงานเรียบร้อยแล้ว');
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการส่งออกข้อมูล', 'error');
    }
  }, [employees, showToast]);

  const handleImportEmployees = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedEmployees = await importEmployeesFromExcel(file);
      setEmployees(importedEmployees);
      showToast(`นำเข้าข้อมูลพนักงาน ${importedEmployees.length} รายการเรียบร้อยแล้ว`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error');
    }
    event.target.value = '';
  }, [setEmployees, showToast]);

  const handleReset = useCallback(() => {
    if (window.confirm('คุณต้องการลบข้อมูลที่บันทึกไว้ทั้งหมดและกลับไปใช้ค่าเริ่มต้นใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      resetAllData();
      showToast('ล้างข้อมูลเรียบร้อยแล้ว');
    }
  }, [resetAllData, showToast]);



  const handleUpdateSelection = useCallback((type: string, employeeIds: string[]) => {
    switch (type) {
      case 'travel':
        setSelectedTravelEmployees(employeeIds);
        break;
      case 'special-assist':
        setSelectedSpecialAssistEmployees(employeeIds);
        break;
      case 'family-visit':
        setSelectedFamilyVisitEmployees(employeeIds);
        break;
      case 'company-trip':
        setSelectedCompanyTripEmployees(employeeIds);
        break;
      case 'manager-rotation':
        setSelectedManagerRotationEmployees(employeeIds);
        break;
    }
  }, [
    setSelectedTravelEmployees,
    setSelectedSpecialAssistEmployees,
    setSelectedFamilyVisitEmployees,
    setSelectedCompanyTripEmployees,
    setSelectedManagerRotationEmployees
  ]);

  // ส่วนสำคัญ: Export HTML เหมือนหน้าระบบจริง (ด้วย TailwindCDN)
  const handleExportHtml = () => {
    const employeeRows = employees.map(
      (emp, idx) => `<tr class="even:bg-blue-50">
        <td class="px-4 py-2 border">${idx+1}</td>
        <td class="px-4 py-2 border">${emp.name}</td>
        <td class="px-4 py-2 border">${emp.level}</td>
        <td class="px-4 py-2 border">${emp.status}</td>
      </tr>`
    ).join('');



    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>สำรองข้อมูลงบประมาณ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
  <div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 text-center">ระบบจัดทำงบประมาณประจำปี</h1>
      <p class="text-gray-600 text-lg text-center">ระบบจัดการและคำนวณงบประมาณอย่างมีประสิทธิภาพ</p>
      <div class="flex flex-wrap justify-center gap-3 mt-6">
        <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center text-sm" disabled>
          <span class="w-4 h-4 mr-2 inline-block">💾</span>
          บันทึกทั้งหมด
        </button>
        <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center text-sm" disabled>
          <span class="w-4 h-4 mr-2 inline-block">📄</span>
          ส่งออกงบประมาณ
        </button>
        <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center text-sm" disabled>
          <span class="w-4 h-4 mr-2 inline-block">⬇️</span>
          ส่งออกพนักงาน
        </button>
        <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center text-sm" disabled>
          <span class="w-4 h-4 mr-2 inline-block">⬆️</span>
          นำเข้าพนักงาน
        </button>
        <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center text-sm" disabled>
          <span class="w-4 h-4 mr-2 inline-block">♻️</span>
          รีเซ็ตระบบ
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded flex items-center text-sm" disabled>
          <span class="w-4 h-4 mr-2 inline-block">📝</span>
          ส่งออกข้อมูล HTML
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-6">
      <h2 class="text-2xl font-bold text-blue-700 mb-4">ตารางพนักงาน</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border border-blue-100">
          <thead>
            <tr>
              <th class="px-4 py-2 border bg-blue-50">ลำดับ</th>
              <th class="px-4 py-2 border bg-blue-50">ชื่อ</th>
              <th class="px-4 py-2 border bg-blue-50">ระดับ</th>
              <th class="px-4 py-2 border bg-blue-50">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${employeeRows}
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-6 mt-8">
      <h2 class="text-2xl font-bold text-blue-700 mb-4">ตารางงบประมาณ ปี ${currentYear}</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border border-blue-100">
          <thead>
            <tr>
              <th class="px-4 py-2 border bg-blue-50">ลำดับ</th>
              <th class="px-4 py-2 border bg-blue-50">รายการ</th>
              <th class="px-4 py-2 border bg-blue-50">จำนวนเงิน</th>
              <th class="px-4 py-2 border bg-blue-50">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            ${budgetRows}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-export.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ModernDashboard
            employees={employees}
            currentYear={currentYear}
            nextYear={nextYear}
            onNavigate={setActiveTab}
          />
        );



      case 'employees':
        return (
          <EmployeeManagement
            employees={employees}
            masterRates={masterRates}
            onUpdateEmployee={updateEmployee}
            onAddEmployee={addEmployee}
            onDeleteEmployee={deleteEmployee}
            onUpdateMasterRate={updateMasterRate}
            onSave={handleSave}
            onExport={handleExportEmployees}
            onImport={handleImportEmployees}
            onReset={handleReset}
          />
        );

      case 'travel':
        return (
          <TravelExpenseManager
            employees={employees}
            masterRates={masterRates}
            calcYear={calcYear}
            selectedEmployees={{
              travel: selectedTravelEmployees,
              familyVisit: selectedFamilyVisitEmployees,
              companyTrip: selectedCompanyTripEmployees,
              managerRotation: selectedManagerRotationEmployees
            }}
            onYearChange={setCalcYear}
            onUpdateEmployee={updateEmployee}
            onUpdateSelection={handleUpdateSelection}
            onSave={handleSave}
          />
        );

      case 'assistance':
        return (
          <SpecialAssistanceManager
            employees={employees}
            masterRates={masterRates}
            calcYear={calcYear}
            selectedEmployeeIds={selectedSpecialAssistEmployees}
            specialAssist1Data={getSpecialAssist1DataForYear(calcYear)}
            overtimeData={getOvertimeDataForYear(calcYear)}
            holidaysData={holidaysData}
            onYearChange={setCalcYear}
            onUpdateEmployee={updateEmployee}
            onUpdateSelection={(ids) => handleUpdateSelection('special-assist', ids)}
            onUpdateSpecialAssist1Item={updateSpecialAssist1Item}
            onUpdateSpecialAssist1Notes={updateSpecialAssist1Notes}
            onUpdateOvertimeData={updateOvertimeData}
            onSave={handleSave}
          />
        );

      case 'workdays':
        return (
          <ModernWorkdayManager
            calcYear={calcYear}
            holidaysData={holidaysData}
            onYearChange={setCalcYear}
            onAddHoliday={addHoliday}
            onDeleteHoliday={deleteHoliday}
            onSave={handleSave}
          />
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">รายงานสรุป</h2>
            <p className="text-gray-600">ระบบรายงานจะพัฒนาต่อไป</p>
          </div>
        );

      default:
        return (
          <ModernDashboard
            budgetData={budgetData}
            employees={employees}
            currentYear={currentYear}
            nextYear={nextYear}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={handleSave}
        onExport={handleExportBudget}
        onImport={() => document.getElementById('import-file')?.click()}
        onRefresh={() => window.location.reload()}
      >
        {renderTabContent()}
      </AppLayout>

      {/* Hidden file input for employee import */}
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImportEmployees}
        className="hidden"
        id="import-file"
      />

      {/* Toast Notifications */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}

export default App;
