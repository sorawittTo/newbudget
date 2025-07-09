import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, MasterRates, ManagerRotationEmployee } from '../../types';
import { formatCurrency, getRatesForEmployee } from '../../utils/calculations';
import { Save, RotateCcw, MapPin, Edit3, Check, X, Plane, Car, Hotel, DollarSign, Award, Calculator, TrendingUp, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ModernManagerRotationCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  calcYear: number;
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
  calcYear,
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

  // Calculate manager rotation data - Dynamic calculation based on working days
  const managerRotationData = useMemo(() => {
    return level7Employees.map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      
      // Dynamic calculation based on working days
      const workingDays = emp.workingDays || 1;
      const hotelNights = workingDays + 1; // Working days + 1 night
      const perDiemDaysCalc = workingDays + 2; // Working days + 2 days (arrival + departure)
      
      const perDiemCost = (rates.perDiem || 0) * perDiemDaysCalc;
      const accommodationCost = (rates.hotel || 0) * hotelNights;
      
      // Use rates from master rates table
      const travelCost = rates.travel || 0;
      const localCost = rates.local || 0;
      
      // Other vehicle costs (editable)
      const otherVehicleCost = emp.customTravelRates?.other || 0;
      
      const total = perDiemCost + accommodationCost + travelCost + localCost + otherVehicleCost;
      
      return {
        ...emp,
        perDiemCost,
        accommodationCost,
        travelCost,
        taxiCost: localCost,
        busCost: 0,
        flightCost: travelCost,
        otherVehicleCost,
        total,
        totalTravel: travelCost + localCost + otherVehicleCost,
        perDiemDay: perDiemDaysCalc,
        hotelNight: hotelNights
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
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
                <RotateCcw className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">เดินทางหมุนเวียน ผจศ.</h2>
                <p className="text-gray-600">คำนวณค่าใช้จ่ายการเดินทางหมุนเวียนสำหรับผู้จัดการศูนย์</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'ผู้จัดการศูนย์', value: totalEmployees, icon: Users, color: 'text-blue-600' },
              { label: 'ระดับ 7 ที่มีสิทธิ์', value: eligibleEmployees, icon: Award, color: 'text-green-600' },
              { label: 'ยอดรวมทั้งหมด', value: formatCurrency(managerRotationTotal), icon: Calculator, color: 'text-purple-600' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-2xl bg-gray-100"
                style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${stat.color}`} style={{ boxShadow: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff', backgroundColor: '#f9fafb' }}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">รหัสพนักงาน</th>
                  <th className="px-4 py-3 text-left font-semibold">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-center font-semibold">จำนวนวัน</th>
                  <th className="px-4 py-3 text-center font-semibold">ค่าที่พัก</th>
                  <th className="px-4 py-3 text-center font-semibold">ค่าเบี้ยเลี้ยง</th>
                  <th className="px-4 py-3 text-center font-semibold">ค่าพาหนะประจำทาง<br />ศนร.-กทม. ไปกลับ</th>
                  <th className="px-4 py-3 text-center font-semibold">ค่าพาหนะรับจ้าง<br />ขนส่ง-ที่พัก ไป-กลับ</th>
                  <th className="px-4 py-3 text-center font-semibold">ค่าพาหนะอื่นๆ</th>
                  <th className="px-4 py-3 text-center font-semibold">รวมทั้งหมด</th>
                </tr>
              </thead>
            <tbody>
              <AnimatePresence>
                {managerRotationData.map((emp, index) => (
                  <motion.tr 
                  key={emp.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">ระดับ {emp.level}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {globalEditMode ? renderEditableCell(emp.id, 'workingDays', emp.workingDays || 1, 'number') : (
                      <span className="font-medium text-gray-900">{emp.workingDays || 1} วัน</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className="font-semibold text-gray-900">{formatCurrency(emp.accommodationCost)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        อัตรา {formatCurrency(getRatesForEmployee(emp, masterRates).hotel || 0)} x{emp.hotelNight} คืน
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className="font-semibold text-gray-900">{formatCurrency(emp.perDiemCost)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        อัตรา {formatCurrency(getRatesForEmployee(emp, masterRates).perDiem || 0)} x{emp.perDiemDay} วัน
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className="font-semibold text-gray-900">{formatCurrency(emp.travelCost)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ศนร.-กทม. ไปกลับ
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className="font-semibold text-gray-900">{formatCurrency(emp.taxiCost)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ขนส่ง-ที่พัก ไป-กลับ
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {globalEditMode ? renderEditableCell(emp.id, 'customTravelRates.other', emp.otherVehicleCost, 'number') : (
                      <div>
                        <div className="font-semibold text-gray-900">{formatCurrency(emp.otherVehicleCost)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          อื่นๆ
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-lg text-purple-600">{formatCurrency(emp.total)}</div>
                  </td>
                </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          </div>
        </div>
      </Card>
    </div>
  );
};