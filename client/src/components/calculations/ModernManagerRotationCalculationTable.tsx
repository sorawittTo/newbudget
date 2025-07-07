import React, { useState, useMemo } from 'react';
import { Employee, MasterRates, ManagerRotationEmployee } from '../../types';
import { formatCurrency, getRatesForEmployee } from '../../utils/calculations';
import { Save, RotateCcw, MapPin, Edit3, Check, X, Plane, Car, Hotel, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';

interface ModernManagerRotationCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  globalEditMode?: boolean;
}

interface RotationSettings {
  destination: string;
  perDiemDays: number;
  hotelNights: number;
  busCost: number;
  flightCost: number;
  taxiCost: number;
}

interface EditingState {
  [key: string]: {
    isEditing: boolean;
    value: any;
  };
}

export const ModernManagerRotationCalculationTable: React.FC<ModernManagerRotationCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  onSave,
  onUpdateEmployee,
  globalEditMode = false
}) => {
  const [rotationSettings, setRotationSettings] = useState<RotationSettings>({
    destination: '',
    perDiemDays: 3,
    hotelNights: 2,
    busCost: 600,
    flightCost: 3000,
    taxiCost: 200
  });
  const [editingState, setEditingState] = useState<EditingState>({});

  // Filter for level 7 employees only
  const level7Employees = employees.filter(emp => emp.level === '7');

  // Calculate manager rotation data
  const managerRotationData = useMemo(() => {
    return level7Employees.map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      
      const perDiemCost = (rates.perDiem || 0) * rotationSettings.perDiemDays;
      const accommodationCost = (rates.hotel || 0) * rotationSettings.hotelNights;
      const totalTravel = rotationSettings.busCost + rotationSettings.flightCost + rotationSettings.taxiCost;
      const total = perDiemCost + accommodationCost + totalTravel;
      
      return {
        ...emp,
        perDiemCost,
        accommodationCost,
        totalTravel,
        total,
        busCost: rotationSettings.busCost,
        flightCost: rotationSettings.flightCost,
        taxiCost: rotationSettings.taxiCost,
        perDiemDay: rotationSettings.perDiemDays,
        hotelNight: rotationSettings.hotelNights
      } as ManagerRotationEmployee;
    });
  }, [level7Employees, masterRates, rotationSettings]);

  const managerRotationTotal = managerRotationData.reduce((sum, emp) => sum + emp.total, 0);

  const handleSettingChange = (field: string, value: any) => {
    setRotationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleEditStart = (employeeId: string, field: string, currentValue: any) => {
    const editKey = `${employeeId}-${field}`;
    setEditingState(prev => ({
      ...prev,
      [editKey]: { isEditing: true, value: currentValue }
    }));
  };

  const handleEditChange = (employeeId: string, field: string, value: any) => {
    const editKey = `${employeeId}-${field}`;
    setEditingState(prev => ({
      ...prev,
      [editKey]: { ...prev[editKey], value }
    }));
  };

  const handleEditSave = (employeeId: string, field: string) => {
    const editKey = `${employeeId}-${field}`;
    const editData = editingState[editKey];
    
    if (editData) {
      const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
      if (employeeIndex !== -1) {
        const updatedEmployee = { ...employees[employeeIndex] };
        
        if (field.startsWith('customTravelRates.')) {
          const rateField = field.split('.')[1];
          updatedEmployee.customTravelRates = {
            ...updatedEmployee.customTravelRates,
            [rateField]: parseFloat(editData.value) || 0
          };
        } else {
          (updatedEmployee as any)[field] = editData.value;
        }
        
        onUpdateEmployee(employeeIndex, updatedEmployee);
      }
      
      setEditingState(prev => ({
        ...prev,
        [editKey]: { isEditing: false, value: undefined }
      }));
    }
  };

  const handleEditCancel = (employeeId: string, field: string) => {
    const editKey = `${employeeId}-${field}`;
    setEditingState(prev => ({
      ...prev,
      [editKey]: { isEditing: false, value: undefined }
    }));
  };

  const handleGlobalUpdate = (employeeId: string, field: string, value: any) => {
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex !== -1) {
      const updatedEmployee = { ...employees[employeeIndex] };
      if (field.startsWith('customTravelRates.')) {
        const rateField = field.split('.')[1];
        updatedEmployee.customTravelRates = {
          ...updatedEmployee.customTravelRates,
          [rateField]: parseFloat(value) || 0
        };
      } else {
        (updatedEmployee as any)[field] = value;
      }
      onUpdateEmployee(employeeIndex, updatedEmployee);
    }
  };

  const renderEditableCell = (employeeId: string, field: string, currentValue: any, type: 'text' | 'number' = 'text') => {
    const editKey = `${employeeId}-${field}`;
    const editData = editingState[editKey];
    
    if (editData?.isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={editData.value}
            onChange={(e) => handleEditChange(employeeId, field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            className="w-32 p-2 bg-white/80 border-0 rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-300"
          />
          <div className="flex gap-1">
            <Button
              onClick={() => handleEditSave(employeeId, field)}
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleEditCancel(employeeId, field)}
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div
        className="flex items-center gap-2 group cursor-pointer"
        onClick={() => handleEditStart(employeeId, field, currentValue)}
      >
        <span className="font-medium">{type === 'number' ? formatCurrency(currentValue) : currentValue}</span>
        <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  const totalEmployees = managerRotationData.length;
  const eligibleEmployees = level7Employees.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
            <RotateCcw className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">เดินทางหมุนเวียน ผจศ.</h2>
            <p className="text-gray-600">คำนวณค่าใช้จ่ายการเดินทางหมุนเวียนสำหรับผู้จัดการศูนย์</p>
          </div>
        </div>

      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-blue-700">{totalEmployees}</div>
          <div className="text-sm text-blue-600">ผู้จัดการศูนย์</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-green-700">{eligibleEmployees}</div>
          <div className="text-sm text-green-600">ระดับ 7 ที่มีสิทธิ์</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-orange-700">{rotationSettings.perDiemDays}</div>
          <div className="text-sm text-orange-600">วันเบี้ยเลี้ยง</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
          <div className="text-3xl font-bold text-purple-700">{formatCurrency(managerRotationTotal)}</div>
          <div className="text-sm text-purple-600">ยอดรวมทั้งหมด</div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50" style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-yellow-600" />
          ตั้งค่าการเดินทางหมุนเวียน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">จุดหมายปลายทาง</label>
            <input
              type="text"
              value={rotationSettings.destination}
              onChange={(e) => handleSettingChange('destination', e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร"
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">วันเบี้ยเลี้ยง</label>
            <input
              type="number"
              value={rotationSettings.perDiemDays}
              onChange={(e) => handleSettingChange('perDiemDays', parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คืนที่พัก</label>
            <input
              type="number"
              value={rotationSettings.hotelNights}
              onChange={(e) => handleSettingChange('hotelNights', parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ค่ารถทัวร์</label>
            <input
              type="number"
              value={rotationSettings.busCost}
              onChange={(e) => handleSettingChange('busCost', parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ค่าเครื่องบิน</label>
            <input
              type="number"
              value={rotationSettings.flightCost}
              onChange={(e) => handleSettingChange('flightCost', parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ค่าแท็กซี่</label>
            <input
              type="number"
              value={rotationSettings.taxiCost}
              onChange={(e) => handleSettingChange('taxiCost', parseFloat(e.target.value) || 0)}
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">เบี้ยเลี้ยง</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">ค่าที่พัก</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">ค่าเดินทาง</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {managerRotationData.map((emp, index) => (
                <tr key={emp.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-slate-600 font-medium">{emp.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{emp.name}</div>
                    <div className="text-sm text-slate-500">ระดับ {emp.level}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-2">
                      {globalEditMode ? (
                        <input
                          type="number"
                          className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                          value={emp.perDiemCost}
                          onChange={(e) => handleGlobalUpdate(emp.id, 'customTravelRates.perDiem', (parseFloat(e.target.value) || 0) / rotationSettings.perDiemDays)}
                        />
                      ) : (
                        <span className="font-bold text-lg text-slate-700">{formatCurrency(emp.perDiemCost)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-2">
                      {globalEditMode ? (
                        <input
                          type="number"
                          className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                          value={emp.accommodationCost}
                          onChange={(e) => handleGlobalUpdate(emp.id, 'customTravelRates.hotel', (parseFloat(e.target.value) || 0) / rotationSettings.hotelNights)}
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
                          value={emp.totalTravel}
                          onChange={(e) => {
                            const newTotal = parseFloat(e.target.value) || 0;
                            const avgCost = newTotal / 3; // Split evenly between bus, flight, taxi
                            handleSettingChange('busCost', avgCost);
                            handleSettingChange('flightCost', avgCost);
                            handleSettingChange('taxiCost', avgCost);
                          }}
                        />
                      ) : (
                        <span className="font-bold text-lg text-slate-700">{formatCurrency(emp.totalTravel)}</span>
                      )}
                    </div>
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
                  <div className="font-bold text-2xl">{formatCurrency(managerRotationTotal)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};