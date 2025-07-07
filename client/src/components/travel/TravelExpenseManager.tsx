import React, { useState } from 'react';
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
  Calendar
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


  // Calculate data for each section
  const travelData = calculateTravelEmployees(
    employees.filter(emp => selectedEmployees.travel.includes(emp.id)), 
    masterRates, 
    calcYear
  );
  
  const familyVisitData = calculateFamilyVisit(
    employees.filter(emp => 
      selectedEmployees.familyVisit.includes(emp.id) &&
      emp.level !== 'ท้องถิ่น' && 
      emp.visitProvince && 
      emp.visitProvince.trim() !== '' &&
      emp.visitProvince !== 'ขอนแก่น'
    )
  );
  
  const companyTripData = calculateCompanyTrip(
    employees.filter(emp => selectedEmployees.companyTrip.includes(emp.id)), 
    masterRates
  );
  
  const managerRotationData = calculateManagerRotation(
    employees.filter(emp => 
      selectedEmployees.managerRotation.includes(emp.id) && emp.level === '7'
    ), 
    masterRates
  );



  const sections = [
    { id: 'travel', label: 'เดินทางรับของที่ระลึก', icon: <Award className="w-5 h-5" />, count: travelData.length },
    { id: 'family', label: 'เดินทางเยี่ยมครอบครัว', icon: <Home className="w-5 h-5" />, count: familyVisitData.length },
    { id: 'company', label: 'เดินทางร่วมงานวันพนักงาน', icon: <Users className="w-5 h-5" />, count: companyTripData.length },
    { id: 'manager', label: 'เดินทางหมุนเวียน ผจศ.', icon: <RotateCcw className="w-5 h-5" />, count: managerRotationData.length }
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
      />
    );
  };

  const renderFamilySection = () => {
    return (
      <ModernFamilyVisitCalculationTable
        employees={employees}
        selectedEmployeeIds={selectedEmployees.familyVisit}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
      />
    );
  };

  const renderCompanySection = () => {
    return (
      <ModernCompanyTripCalculationTable
        employees={employees}
        masterRates={masterRates}
        selectedEmployeeIds={selectedEmployees.companyTrip}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
      />
    );
  };

  const renderManagerSection = () => {
    const total = managerRotationData.reduce((sum, emp) => sum + emp.total, 0);

    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">รหัสพนักงาน</th>
                <th className="px-4 py-3 text-left">ชื่อ-สกุล</th>
                <th className="px-4 py-3 text-right">ค่าเบี้ยเลี้ยง (7 วัน)</th>
                <th className="px-4 py-3 text-right">ค่าที่พัก (6 คืน)</th>
                <th className="px-4 py-3 text-right">ค่าเดินทาง</th>
                <th className="px-4 py-3 text-right font-semibold">รวม</th>
              </tr>
            </thead>
            <tbody>
              {managerRotationData.map((emp, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">{emp.id}</td>
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(emp.perDiemCost)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(emp.accommodationCost)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(emp.totalTravel)}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(emp.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right">ยอดรวมทั้งหมด:</td>
                <td className="px-4 py-3 text-right text-lg text-blue-600">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
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
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">จัดการค่าเดินทางทุกประเภท</h2>
              <p className="text-orange-100">คำนวณและจัดการค่าเดินทางสำหรับกิจกรรมต่างๆ</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Year Selection */}
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onYearChange(calcYear - 1)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="text-sm text-orange-100">คำนวณสำหรับปี</div>
                  <div className="font-bold">{calcYear}</div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onYearChange(calcYear + 1)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex-1 min-w-0 py-4 px-6 text-center font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-white text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {section.icon}
                  <span className="hidden sm:inline">{section.label}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    {section.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Content */}
      {renderContent()}
    </div>
  );
};