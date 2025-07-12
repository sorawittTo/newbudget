import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetData } from './hooks/useBudgetData';
import { AppLayout } from './components/layout/AppLayout';
import { ModernDashboard } from './components/dashboard/ModernDashboard';

import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { TravelExpenseManager } from './components/travel/TravelExpenseManager';
import { UnifiedSpecialAssistanceManager } from './components/assistance/UnifiedSpecialAssistanceManager';
import { ModernWorkdayManager } from './components/workday/ModernWorkdayManager';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toast } from './components/ui/Toast';
import { exportEmployeesToExcel } from './utils/excel';


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


  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ModernDashboard
            employees={employees}
            masterRates={masterRates}
            currentYear={currentYear}
            nextYear={nextYear}
            specialAssist1DataByYear={specialAssist1DataByYear}
            overtimeDataByYear={overtimeDataByYear}
            onNavigate={setActiveTab}
            onYearChange={setCurrentYear}
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
          <UnifiedSpecialAssistanceManager
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



      default:
        console.log('App.tsx - Passing specialAssist1DataByYear to Dashboard:', JSON.stringify(specialAssist1DataByYear, null, 2));
        console.log('App.tsx - calcYear:', calcYear);
        return (
          <ModernDashboard
            employees={employees}
            masterRates={masterRates}
            currentYear={calcYear}
            nextYear={nextYear}
            specialAssist1DataByYear={specialAssist1DataByYear}
            overtimeDataByYear={overtimeDataByYear}
            onNavigate={setActiveTab}
            onYearChange={setCalcYear}
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
        onExport={handleExportEmployees}
        onImport={() => document.getElementById('import-file')?.click()}
        onRefresh={() => window.location.reload()}
      >
        {renderTabContent()}
      </AppLayout>




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
