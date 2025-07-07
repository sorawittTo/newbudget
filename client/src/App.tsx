import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetData } from './hooks/useBudgetData';
import { TabNavigation } from './components/tabs/TabNavigation';
import { BudgetTable } from './components/budget/BudgetTable';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { TravelExpenseManager } from './components/travel/TravelExpenseManager';
import { SpecialAssistanceManager } from './components/assistance/SpecialAssistanceManager';
import { WorkdayManager } from './components/workday/WorkdayManager';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toast } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { exportBudgetToExcel, exportEmployeesToExcel, importEmployeesFromExcel } from './utils/excel';
import { Save, Download, Upload, RotateCcw, FileSpreadsheet, FileText } from 'lucide-react';

function App() {
  const {
    budgetData,
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
    updateBudgetItem,
    updateBudgetNotes,
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

  const [activeTab, setActiveTab] = useState('budget');
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

  const handleSave = useCallback(() => {
    try {
      saveAllData();
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  }, [saveAllData, showToast]);

  const handleExportBudget = useCallback(() => {
    try {
      exportBudgetToExcel(budgetData, currentYear, nextYear);
      showToast('ส่งออกข้อมูลงบประมาณเรียบร้อยแล้ว');
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการส่งออกข้อมูล', 'error');
    }
  }, [budgetData, currentYear, nextYear, showToast]);

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

    const budgetRows = (budgetData[currentYear] || []).map(
      (item, idx) => `<tr class="even:bg-blue-50">
        <td class="px-4 py-2 border">${idx + 1}</td>
        <td class="px-4 py-2 border">${item.item}</td>
        <td class="px-4 py-2 border text-right">${item.amount?.toLocaleString() || ""}</td>
        <td class="px-4 py-2 border">${item.notes || ''}</td>
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

  const yearOptions = Array.from({ length: 13 }, (_, i) => 2568 + i);

  const renderTabContent = () => {
    const contentVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };

    switch (activeTab) {
      case 'budget':
        return (
          <motion.div
            key="budget"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <BudgetTable
              budgetData={budgetData}
              currentYear={currentYear}
              nextYear={nextYear}
              onUpdateBudget={updateBudgetItem}
              onUpdateNotes={updateBudgetNotes}
              onYearChange={(current, next) => {
                setCurrentYear(current);
                setNextYear(next);
              }}
              onSave={handleSave}
              onExport={handleExportBudget}
            />
          </motion.div>
        );

      case 'employees':
        return (
          <motion.div
            key="employees"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        );

      case 'travel':
        return (
          <motion.div
            key="travel"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        );

      case 'assistance':
        return (
          <motion.div
            key="assistance"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        );

      case 'workday':
        return (
          <motion.div
            key="workday"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <WorkdayManager
              calcYear={calcYear}
              holidaysData={holidaysData}
              onYearChange={setCalcYear}
              onAddHoliday={addHoliday}
              onDeleteHoliday={deleteHoliday}
              onSave={handleSave}
            />
          </motion.div>
        );

      default:
        return (
          <motion.div
            key="placeholder"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา</p>
                <p className="text-gray-400 mt-2">กรุณาเลือกแท็บอื่นเพื่อใช้งาน</p>
              </div>
            </Card>
          </motion.div>
        );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              ระบบจัดทำงบประมาณประจำปี
            </h1>
            <p className="text-gray-600 text-lg">
              ระบบจัดการและคำนวณงบประมาณอย่างมีประสิทธิภาพ
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                บันทึกทั้งหมด
              </Button>
              <Button onClick={handleExportBudget} variant="secondary" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                ส่งออกงบประมาณ
              </Button>
              <Button onClick={handleExportEmployees} variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                ส่งออกพนักงาน
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportEmployees}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  onClick={() => document.getElementById('import-file')?.click()}
                  variant="secondary"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  นำเข้าพนักงาน
                </Button>
              </div>
              <Button onClick={handleReset} variant="danger" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                รีเซ็ตระบบ
              </Button>
              {/* ปุ่มใหม่: ส่งออกข้อมูล HTML */}
              <Button onClick={handleExportHtml} variant="secondary" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                ส่งออกข้อมูล HTML
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
