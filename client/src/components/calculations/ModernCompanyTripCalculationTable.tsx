import React, { useState, useMemo } from 'react';
import { Employee, MasterRates, CompanyTripEmployee } from '../../types';
import { formatCurrency, getRatesForEmployee } from '../../utils/calculations';
import { Save, Users, MapPin, Edit3, Check, X, Car } from 'lucide-react';
import { Button } from '../ui/Button';

interface ModernCompanyTripCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
}

interface TripSettings {
  destination: string;
  busFare: number;
}

export const ModernCompanyTripCalculationTable: React.FC<ModernCompanyTripCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  onSave,
  onUpdateEmployee
}) => {
  const [tripSettings, setTripSettings] = useState<TripSettings>({
    destination: '',
    busFare: 600
  });
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});

  // Calculate company trip data
  const companyTripData = useMemo(() => {
    const allEmployees = employees; // Show all employees as requested
    
    return allEmployees.map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      
      // Check if eligible for accommodation (province doesn't match destination)
      const isEligibleForAccommodation = emp.visitProvince.trim() !== tripSettings.destination.trim();
      
      let accommodationCost = 0;
      if (isEligibleForAccommodation) {
        if (emp.level === '7') {
          // Level 7 gets single room
          accommodationCost = rates.hotel || 0;
        } else {
          // Others share rooms by gender (divide by 2)
          accommodationCost = (rates.hotel || 0) / 2;
        }
      }
      
      const busFareTotal = tripSettings.busFare * 2; // Round trip
      const total = busFareTotal + accommodationCost;
      
      return {
        ...emp,
        busFare: tripSettings.busFare,
        accommodationCost,
        total,
        note: isEligibleForAccommodation ? 
          (emp.level === '7' ? 'พักคนเดียว' : `พักคู่ (${emp.gender})`) : 
          'ไม่มีสิทธิ์ค่าที่พัก'
      } as CompanyTripEmployee;
    });
  }, [employees, masterRates, tripSettings]);

  const companyTripTotal = companyTripData.reduce((sum, emp) => sum + emp.total, 0);

  const handleSettingChange = (field: string, value: any) => {
    setTripSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGlobalUpdate = (employeeId: string, field: string, value: any) => {
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex !== -1) {
      const updatedEmployee = { ...employees[employeeIndex] };
      (updatedEmployee as any)[field] = value;
      onUpdateEmployee(employeeIndex, updatedEmployee);
    }
  };

  const handleEditingChange = (key: string, value: any) => {
    setEditingValues(prev => ({ ...prev, [key]: value }));
  };

  const totalEmployees = companyTripData.length;
  const eligibleEmployees = companyTripData.filter(emp => emp.accommodationCost > 0).length;
  const ineligibleEmployees = totalEmployees - eligibleEmployees;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">เดินทางร่วมงานวันพนักงาน</h2>
            <p className="text-gray-600">คำนวณค่าใช้จ่ายการเดินทางร่วมงานและที่พัก</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setGlobalEditMode(!globalEditMode)}
            variant={globalEditMode ? "default" : "outline"}
            className="neumorphism-button"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {globalEditMode ? 'ปิดการแก้ไข' : 'เปิดการแก้ไข'}
          </Button>
          <Button onClick={onSave} className="neumorphism-button">
            <Save className="w-4 h-4 mr-2" />
            บันทึกข้อมูล
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-blue-700">{totalEmployees}</div>
          <div className="text-sm text-blue-600">พนักงานทั้งหมด</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-green-700">{eligibleEmployees}</div>
          <div className="text-sm text-green-600">มีสิทธิ์ค่าที่พัก</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-red-700">{ineligibleEmployees}</div>
          <div className="text-sm text-red-600">ไม่มีสิทธิ์ค่าที่พัก</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-purple-700">{formatCurrency(companyTripTotal)}</div>
          <div className="text-sm text-purple-600">ยอดรวมทั้งหมด</div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50" style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-yellow-600" />
          ตั้งค่าการเดินทาง
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัดปลายทาง</label>
            <input
              type="text"
              value={tripSettings.destination}
              onChange={(e) => handleSettingChange('destination', e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร"
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ค่ารถโดยสาร (ทางเดียว)</label>
            <input
              type="number"
              value={tripSettings.busFare}
              onChange={(e) => handleSettingChange('busFare', parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '16px 16px 32px #d1d5db, -16px -16px 32px #ffffff' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">รหัส</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ชื่อ-สกุล</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">ค่าที่พัก</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">ค่ารถโดยสารไป-กลับ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">หมายเหตุ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {companyTripData.map((emp, index) => (
                <tr key={emp.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-slate-600 font-medium">{emp.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{emp.name}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-2">
                      {globalEditMode ? (
                        <input
                          type="number"
                          className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                          value={emp.accommodationCost}
                          onChange={(e) => handleEditingChange(`accommodation-${emp.id}`, parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <span className="font-bold text-lg text-slate-700">{formatCurrency(emp.accommodationCost)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-2">
                      {globalEditMode ? (
                        <input
                          type="number"
                          className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                          value={tripSettings.busFare * 2}
                          onChange={(e) => handleSettingChange('busFare', (parseFloat(e.target.value) || 0) / 2)}
                        />
                      ) : (
                        <span className="font-bold text-lg text-slate-700">{formatCurrency(tripSettings.busFare * 2)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{emp.note}</div>
                  </td>
                  <td className="px-6 py-4 text-right bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="font-bold text-xl text-blue-900">{formatCurrency(emp.total)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold">
                <td colSpan={5} className="px-6 py-4 text-right">
                  ยอดรวมทั้งหมด:
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-2xl">{formatCurrency(companyTripTotal)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};