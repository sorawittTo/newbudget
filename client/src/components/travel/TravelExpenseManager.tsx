import React, { useState } from 'react';
import { Employee, MasterRates } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Car, 
  Home, 
  Users, 
  RotateCcw, 
  Save,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Edit3,
  Check,
  X,
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
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [customSettings, setCustomSettings] = useState({
    hotelNights: 2,
    perDiemDays: 3,
    busFare: 600,
    workDays: 245
  });

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

  const handleEditStart = (field: string, currentValue: number) => {
    setEditingValues(prev => ({ ...prev, [field]: currentValue }));
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleEditSave = (field: string) => {
    const newValue = editingValues[field];
    if (newValue !== undefined) {
      setCustomSettings(prev => ({ ...prev, [field]: parseFloat(newValue) || 0 }));
    }
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const handleEditCancel = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const renderEditableValue = (field: string, currentValue: number, label: string) => {
    const isEditing = editMode[field];
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            className="w-20 p-2 text-center border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={editingValues[field] || currentValue}
            onChange={(e) => setEditingValues(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
            autoFocus
          />
          <Button size="sm" onClick={() => handleEditSave(field)} className="p-1 h-7 w-7">
            <Check className="w-3 h-3" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleEditCancel(field)} className="p-1 h-7 w-7">
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className="font-bold text-blue-600 text-lg">{currentValue}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleEditStart(field, currentValue)}
          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
          title={`แก้ไข${label}`}
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  const sections = [
    { id: 'travel', label: 'เดินทางรับของที่ระลึก', icon: <Award className="w-5 h-5" />, count: travelData.length },
    { id: 'family', label: 'เดินทางเยี่ยมครอบครัว', icon: <Home className="w-5 h-5" />, count: familyVisitData.length },
    { id: 'company', label: 'เดินทางร่วมงานวันพนักงาน', icon: <Users className="w-5 h-5" />, count: companyTripData.length },
    { id: 'manager', label: 'เดินทางหมุนเวียน ผจศ.', icon: <RotateCcw className="w-5 h-5" />, count: managerRotationData.length }
  ];

  const renderTravelSection = () => {
    const total = travelData.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const hotel = customSettings.hotelNights * (rates.hotel || 0);
      const perDiem = customSettings.perDiemDays * (rates.perDiem || 0);
      const travelRoundTrip = 2 * (rates.travel || 0);
      const localRoundTrip = 2 * (rates.local || 0);
      return sum + hotel + perDiem + travelRoundTrip + localRoundTrip;
    }, 0);

    return (
      <div className="space-y-6">
        {/* Settings */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-4">ตั้งค่าการคำนวณ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-yellow-700 mb-2 block">จำนวนคืนที่พัก</label>
              {renderEditableValue('hotelNights', customSettings.hotelNights, 'จำนวนคืน')}
            </div>
            <div>
              <label className="text-sm font-medium text-yellow-700 mb-2 block">จำนวนวันเบี้ยเลี้ยง</label>
              {renderEditableValue('perDiemDays', customSettings.perDiemDays, 'จำนวนวัน')}
            </div>
            <div>
              <label className="text-sm font-medium text-yellow-700 mb-2 block">จำนวนวันทำการ/ปี</label>
              {renderEditableValue('workDays', customSettings.workDays, 'วันทำการ')}
            </div>
          </div>
        </Card>

        {/* Results Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">รหัสพนักงาน</th>
                  <th className="px-4 py-3 text-left">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-center">อายุงาน (ปี)</th>
                  <th className="px-4 py-3 text-right">ค่าที่พัก</th>
                  <th className="px-4 py-3 text-right">ค่าเบี้ยเลี้ยง</th>
                  <th className="px-4 py-3 text-right">ค่าเดินทาง</th>
                  <th className="px-4 py-3 text-right font-semibold">รวม</th>
                </tr>
              </thead>
              <tbody>
                {travelData.map((emp, index) => {
                  const rates = getRatesForEmployee(emp, masterRates);
                  const hotel = customSettings.hotelNights * (rates.hotel || 0);
                  const perDiem = customSettings.perDiemDays * (rates.perDiem || 0);
                  const travel = 2 * (rates.travel || 0) + 2 * (rates.local || 0);
                  const total = hotel + perDiem + travel;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-600">{emp.id}</td>
                      <td className="px-4 py-3 font-medium">{emp.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Award className="w-4 h-4 mr-1" />
                          {emp.serviceYears}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(hotel)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(perDiem)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(travel)}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right">ยอดรวมทั้งหมด:</td>
                  <td className="px-4 py-3 text-right text-lg text-blue-600">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderFamilySection = () => {
    const total = familyVisitData.reduce((sum, emp) => sum + emp.total, 0);

    return (
      <div className="space-y-6">


        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">รหัสพนักงาน</th>
                  <th className="px-4 py-3 text-left">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-left">จังหวัดเยี่ยมบ้าน</th>
                  <th className="px-4 py-3 text-right">ค่ารถต่อครั้ง</th>
                  <th className="px-4 py-3 text-right">รวม 4 ครั้ง × 2 เที่ยว</th>
                  <th className="px-4 py-3 text-right font-semibold">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                {familyVisitData.map((emp, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-600">{emp.id}</td>
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <MapPin className="w-4 h-4 mr-1" />
                        {emp.visitProvince}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(emp.homeVisitBusFare)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(emp.busFareTotal)}</td>
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
      </div>
    );
  };

  const renderCompanySection = () => {
    const total = companyTripData.reduce((sum, emp) => sum + customSettings.busFare + emp.accommodationCost, 0);

    return (
      <div className="space-y-6">
        {/* Settings */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-4">ตั้งค่าการคำนวณ</h4>
          <div>
            <label className="text-sm font-medium text-yellow-700 mb-2 block">ค่ารถทัวร์ (ทุกคน)</label>
            {renderEditableValue('busFare', customSettings.busFare, 'ค่ารถทัวร์')}
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">รหัสพนักงาน</th>
                  <th className="px-4 py-3 text-left">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-right">ค่ารถทัวร์</th>
                  <th className="px-4 py-3 text-right">ค่าที่พัก</th>
                  <th className="px-4 py-3 text-left">หมายเหตุ</th>
                  <th className="px-4 py-3 text-right font-semibold">รวม</th>
                </tr>
              </thead>
              <tbody>
                {companyTripData.map((emp, index) => {
                  const total = customSettings.busFare + emp.accommodationCost;
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-600">{emp.id}</td>
                      <td className="px-4 py-3 font-medium">{emp.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(customSettings.busFare)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(emp.accommodationCost)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{emp.note}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
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
      </div>
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