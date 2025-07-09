import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, MasterRates } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ModernTravelCalculationTable } from '../calculations/ModernTravelCalculationTable';
import { 
  Car, 
  Home, 
  Users, 
  RotateCcw, 
  Save,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Award,
  MapPin,
  Calendar,
  Edit3,
  Check,
  X,
  FileText
} from 'lucide-react';
import { 
  calculateTravelEmployees, 
  calculateFamilyVisit, 
  calculateCompanyTrip, 
  calculateManagerRotation,
  formatCurrency,
  getRatesForEmployee
} from '../../utils/calculations';
import { ModernFamilyVisitCalculationTable } from '../calculations/ModernFamilyVisitCalculationTable';
import { ModernCompanyTripCalculationTable } from '../calculations/ModernCompanyTripCalculationTable';
import { ModernManagerRotationCalculationTable } from '../calculations/ModernManagerRotationCalculationTable';
import { exportTravelToExcel } from '../../utils/excel';

interface TravelExpenseManagerProps {
  employees: Employee[];
  masterRates: MasterRates;
  calcYear: number;
  selectedEmployees: {
    travel: string[];
    familyVisit: string[];
    companyTrip: string[];
    managerRotation: string[];
  };
  onYearChange: (year: number) => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onUpdateSelection: (type: string, employeeIds: string[]) => void;
  onSave: () => void;
}

export const TravelExpenseManager: React.FC<TravelExpenseManagerProps> = ({
  employees,
  masterRates,
  calcYear,
  selectedEmployees,
  onYearChange,
  onUpdateEmployee,
  onUpdateSelection,
  onSave
}) => {
  const [activeSection, setActiveSection] = useState<'travel' | 'family' | 'company' | 'manager'>('travel');
  const [globalEditMode, setGlobalEditMode] = useState(false);

  const handleExport = async () => {
    let data, title;
    
    switch (activeSection) {
      case 'travel':
        data = travelData;
        title = 'ค่าเดินทางรับของที่ระลึก';
        break;
      case 'family':
        data = familyVisitData;
        title = 'ค่าเดินทางเยี่ยมครอบครัว';
        break;
      case 'company':
        data = companyTripData;
        title = 'ค่าเดินทางร่วมงานวันพนักงาน';
        break;
      case 'manager':
        data = managerRotationData;
        title = 'ค่าเดินทางหมุนเวียน ผจศ.';
        break;
      default:
        return;
    }
    
    try {
      await exportTravelToExcel(data, title);
    } catch (error) {
      console.error('Error exporting travel data:', error);
    }
  };


  // Calculate data for each section with useMemo to ensure updates when calcYear changes
  const travelData = useMemo(() => 
    calculateTravelEmployees(
      employees.filter(emp => selectedEmployees.travel.includes(emp.id)), 
      masterRates, 
      calcYear
    ), [employees, selectedEmployees.travel, masterRates, calcYear]
  );
  
  const familyVisitData = useMemo(() => 
    calculateFamilyVisit(
      employees.filter(emp => 
        selectedEmployees.familyVisit.includes(emp.id) &&
        emp.status === 'มีสิทธิ์' &&
        emp.level !== 'ท้องถิ่น' && 
        emp.visitProvince && 
        emp.visitProvince.trim() !== '' &&
        emp.visitProvince !== 'ขอนแก่น'
      ),
      calcYear
    ), [employees, selectedEmployees.familyVisit, calcYear]
  );
  
  const companyTripData = useMemo(() => 
    calculateCompanyTrip(
      employees.filter(emp => selectedEmployees.companyTrip.includes(emp.id)), 
      masterRates,
      calcYear
    ), [employees, selectedEmployees.companyTrip, masterRates, calcYear]
  );
  
  const managerRotationData = useMemo(() => 
    calculateManagerRotation(
      employees.filter(emp => 
        selectedEmployees.managerRotation.includes(emp.id) && emp.level === '7'
      ), 
      masterRates,
      calcYear,
      3, // perDiemDays
      2, // accommodationDays
      3000, // flightCost
      200, // taxiCost
      600  // busCost
    ), [employees, selectedEmployees.managerRotation, masterRates, calcYear]
  );



  const sections = [
    { id: 'travel', label: 'เดินทางรับของที่ระลึก', icon: <Award className="w-5 h-5" /> },
    { id: 'family', label: 'เดินทางเยี่ยมครอบครัว', icon: <Home className="w-5 h-5" /> },
    { id: 'company', label: 'เดินทางร่วมงานวันพนักงาน', icon: <Users className="w-5 h-5" /> },
    { id: 'manager', label: 'เดินทางหมุนเวียน ผจศ.', icon: <RotateCcw className="w-5 h-5" /> }
  ];

  const renderTravelSection = () => {
    return (
      <ModernTravelCalculationTable
        employees={employees}
        masterRates={masterRates}
        selectedEmployeeIds={selectedEmployees.travel}
        calcYear={calcYear}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
        globalEditMode={globalEditMode}
      />
    );
  };

  const renderFamilySection = () => {
    return (
      <ModernFamilyVisitCalculationTable
        employees={employees}
        selectedEmployeeIds={selectedEmployees.familyVisit}
        calcYear={calcYear}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
        globalEditMode={globalEditMode}
      />
    );
  };

  const renderCompanySection = () => {
    return (
      <ModernCompanyTripCalculationTable
        employees={employees}
        masterRates={masterRates}
        selectedEmployeeIds={selectedEmployees.companyTrip}
        calcYear={calcYear}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
        globalEditMode={globalEditMode}
      />
    );
  };

  const renderManagerSection = () => {
    return (
      <ModernManagerRotationCalculationTable
        employees={employees}
        masterRates={masterRates}
        selectedEmployeeIds={selectedEmployees.managerRotation}
        calcYear={calcYear}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
        globalEditMode={globalEditMode}
      />
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'travel': return renderTravelSection();
      case 'family': return renderFamilySection();
      case 'company': return renderCompanySection();
      case 'manager': return renderManagerSection();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50" style={{ boxShadow: '16px 16px 32px #d1d5db, -16px -16px 32px #ffffff' }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff' }}>
              <Car className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">ค่าใช้จ่ายในการเดินทาง</h2>
              <p className="text-slate-600">จัดการค่าใช้จ่ายในการเดินทาง</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Year Selection */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/80" style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onYearChange(calcYear - 1)}
                className="neumorphism-button w-10 h-10 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center px-4">
                <div className="text-sm text-slate-500">คำนวณสำหรับปี</div>
                <div className="font-bold text-lg text-slate-800">{calcYear}</div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onYearChange(calcYear + 1)}
                className="neumorphism-button w-10 h-10 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={globalEditMode ? "danger" : "default"}
                onClick={() => setGlobalEditMode(!globalEditMode)}
                className="neumorphism-button px-6 py-3"
              >
                {globalEditMode ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    ปิดการแก้ไข
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    แก้ไข
                  </>
                )}
              </Button>
              <Button 
                onClick={onSave}
                className="neumorphism-button px-6 py-3"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
              <Button 
                onClick={handleExport}
                className="neumorphism-button px-6 py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                ส่งออก Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      
      {/* Section Navigation */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <nav className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`p-4 rounded-2xl font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-200'
                  : 'bg-white/80 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80'
              }`}
              style={{ 
                boxShadow: activeSection === section.id 
                  ? 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' 
                  : '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff' 
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {section.icon}
                <span className="text-sm font-semibold">{section.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};