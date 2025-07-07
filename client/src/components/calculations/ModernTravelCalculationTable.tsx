import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, MasterRates, TravelEmployee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { NeumorphismSelect } from '../ui/NeumorphismSelect';
import { formatCurrency, calculateTravelEmployees, getRatesForEmployee } from '../../utils/calculations';
import { 
  Save, 
  Edit3, 
  Check, 
  X, 
  Users, 
  Calendar, 
  Calculator, 
  Award, 
  AlertCircle,
  Settings,
  Car,
  Hotel,
  Coffee,
  MapPin,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface ModernTravelCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  calcYear: number;
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  globalEditMode?: boolean;
}

interface EditingState {
  [key: string]: {
    isEditing: boolean;
    value: any;
  };
}

export const ModernTravelCalculationTable: React.FC<ModernTravelCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  calcYear,
  onSave,
  onUpdateEmployee,
  globalEditMode = false
}) => {
  const [editingState, setEditingState] = useState<EditingState>({});
  const [currentCalcYear, setCurrentCalcYear] = useState(calcYear);
  const [customSettings, setCustomSettings] = useState({
    hotelNights: 2,
    perDiemDays: 3,
    showDetails: false,
    autoCalculate: true
  });
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<string | null>(null);

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));
  const travelEmployees = calculateTravelEmployees(selectedEmployees, masterRates, currentCalcYear);

  // Enhanced statistics calculation
  const statistics = useMemo(() => {
    const totalCost = travelEmployees.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const hotel = customSettings.hotelNights * (rates.hotel || 0);
      const perDiem = customSettings.perDiemDays * (rates.perDiem || 0);
      const travelRoundTrip = 2 * (rates.travel || 0);
      const localRoundTrip = 2 * (rates.local || 0);
      return sum + hotel + perDiem + travelRoundTrip + localRoundTrip;
    }, 0);

    const byServiceYears = travelEmployees.reduce((acc, emp) => {
      acc[emp.serviceYears] = (acc[emp.serviceYears] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const avgCostPerEmployee = travelEmployees.length > 0 ? totalCost / travelEmployees.length : 0;

    return {
      totalEmployees: selectedEmployees.length,
      eligibleEmployees: travelEmployees.length,
      totalCost,
      avgCostPerEmployee,
      byServiceYears,
      maxCost: Math.max(...travelEmployees.map(emp => {
        const rates = getRatesForEmployee(emp, masterRates);
        return customSettings.hotelNights * (rates.hotel || 0) + 
               customSettings.perDiemDays * (rates.perDiem || 0) + 
               2 * (rates.travel || 0) + 
               2 * (rates.local || 0);
      })),
      minCost: Math.min(...travelEmployees.map(emp => {
        const rates = getRatesForEmployee(emp, masterRates);
        return customSettings.hotelNights * (rates.hotel || 0) + 
               customSettings.perDiemDays * (rates.perDiem || 0) + 
               2 * (rates.travel || 0) + 
               2 * (rates.local || 0);
      }))
    };
  }, [travelEmployees, customSettings, masterRates]);

  const handleEditStart = (employeeId: string, field: string, currentValue: any) => {
    setEditingState(prev => ({
      ...prev,
      [`${employeeId}-${field}`]: {
        isEditing: true,
        value: currentValue
      }
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

  const handleSettingChange = (field: string, value: any) => {
    setCustomSettings(prev => ({ ...prev, [field]: value }));
  };

  const renderEditableCell = (employeeId: string, field: string, currentValue: any, type: 'text' | 'number' = 'text') => {
    const editKey = `${employeeId}-${field}`;
    const editData = editingState[editKey];
    const isEditing = editData?.isEditing || false;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <NeumorphismInput
            type={type}
            value={editData.value}
            onChange={(e) => setEditingState(prev => ({
              ...prev,
              [editKey]: { ...prev[editKey], value: e.target.value }
            }))}
            className="w-20 text-center text-sm"
          />
          <div className="flex gap-1">
            <button
              onClick={() => handleEditSave(employeeId, field)}
              className="p-1 rounded-lg text-green-600 hover:text-green-700 transition-colors"
              style={{
                boxShadow: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
                backgroundColor: '#f9fafb'
              }}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditCancel(employeeId, field)}
              className="p-1 rounded-lg text-red-600 hover:text-red-700 transition-colors"
              style={{
                boxShadow: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
                backgroundColor: '#f9fafb'
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
        onClick={() => handleEditStart(employeeId, field, currentValue)}
      >
        <span className="font-medium">
          {type === 'number' ? formatCurrency(currentValue) : currentValue}
        </span>
        <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  const calculateEmployeeCost = (employee: TravelEmployee) => {
    const rates = getRatesForEmployee(employee, masterRates);
    const hotel = customSettings.hotelNights * (rates.hotel || 0);
    const perDiem = customSettings.perDiemDays * (rates.perDiem || 0);
    const travelRoundTrip = 2 * (rates.travel || 0);
    const localRoundTrip = 2 * (rates.local || 0);
    return {
      hotel,
      perDiem,
      travel: travelRoundTrip,
      local: localRoundTrip,
      total: hotel + perDiem + travelRoundTrip + localRoundTrip
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ค่าเดินทางรับของที่ระลึก</h2>
                <p className="text-gray-600">คำนวณค่าใช้จ่ายในการเดินทางรับของที่ระลึก</p>
              </div>
            </div>

          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'พนักงานทั้งหมด', value: statistics.totalEmployees, icon: Users, color: 'text-blue-600' },
              { label: 'มีสิทธิ์เดินทาง', value: statistics.eligibleEmployees, icon: Award, color: 'text-green-600' },
              { label: 'ค่าใช้จ่ายรวม', value: formatCurrency(statistics.totalCost), icon: Calculator, color: 'text-purple-600' },
              { label: 'เฉลี่ยต่อคน', value: formatCurrency(statistics.avgCostPerEmployee), icon: TrendingUp, color: 'text-orange-600' }
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

          {/* Settings Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ปีคำนวณ</label>
              <NeumorphismSelect
                value={currentCalcYear}
                onChange={(e) => setCurrentCalcYear(parseInt(e.target.value))}
              >
                {[2567, 2568, 2569, 2570].map(year => (
                  <option key={year} value={year}>พ.ศ. {year}</option>
                ))}
              </NeumorphismSelect>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">คืนที่พัก</label>
              <NeumorphismInput
                type="number"
                min="1"
                max="10"
                value={customSettings.hotelNights}
                onChange={(e) => handleSettingChange('hotelNights', parseInt(e.target.value) || 1)}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">วันเบี้ยเลี้ยง</label>
              <NeumorphismInput
                type="number"
                min="1"
                max="10"
                value={customSettings.perDiemDays}
                onChange={(e) => handleSettingChange('perDiemDays', parseInt(e.target.value) || 1)}
                className="text-center"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="overflow-hidden rounded-2xl" style={{ boxShadow: 'inset 12px 12px 24px #d1d5db, inset -12px -12px 24px #ffffff' }}>
            <div className="overflow-x-auto bg-gray-50 p-4">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="text-left">
                    <th className="p-4 text-sm font-semibold text-gray-700 w-48">พนักงาน</th>
                    <th className="p-4 text-sm font-semibold text-gray-700 text-center w-24">อายุงาน</th>
                    <th className="p-4 text-sm font-semibold text-gray-700 text-center w-32">ค่าที่พัก</th>
                    <th className="p-4 text-sm font-semibold text-gray-700 text-center w-32">ค่าเบี้ยเลี้ยง</th>
                    <th className="p-4 text-sm font-semibold text-gray-700 text-center w-32">ค่าเดินทาง</th>
                    <th className="p-4 text-sm font-semibold text-gray-700 text-center w-32">ค่ารถรับจ้าง</th>
                    <th className="p-4 text-sm font-semibold text-gray-700 text-center w-32">รวมทั้งหมด</th>
                    {globalEditMode && <th className="p-4 text-sm font-semibold text-gray-700 text-center w-24">จัดการ</th>}
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <AnimatePresence>
                    {travelEmployees.map((employee, index) => {
                      const costs = calculateEmployeeCost(employee);
                      const isSelected = selectedEmployeeForEdit === employee.id;
                      
                      return (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'} transition-all duration-200`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm"
                                   style={{ boxShadow: '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff' }}>
                                {employee.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{employee.name}</p>
                                <p className="text-sm text-gray-600">ระดับ {employee.level}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                 style={{ boxShadow: 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff' }}>
                              {employee.serviceYears} ปี
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.hotel', costs.hotel, 'number') : (
                              <div className="font-semibold text-gray-900">{formatCurrency(costs.hotel)}</div>
                            )}
                            {customSettings.showDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                {customSettings.hotelNights} คืน × {formatCurrency(getRatesForEmployee(employee, masterRates).hotel || 0)}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.perDiem', costs.perDiem, 'number') : (
                              <div className="font-semibold text-gray-900">{formatCurrency(costs.perDiem)}</div>
                            )}
                            {customSettings.showDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                {customSettings.perDiemDays} วัน × {formatCurrency(getRatesForEmployee(employee, masterRates).perDiem || 0)}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.travel', costs.travel, 'number') : (
                              <div className="font-semibold text-gray-900">{formatCurrency(costs.travel)}</div>
                            )}
                            {customSettings.showDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                ไป-กลับ × {formatCurrency(getRatesForEmployee(employee, masterRates).travel || 0)}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.local', costs.local, 'number') : (
                              <div className="font-semibold text-gray-900">{formatCurrency(costs.local)}</div>
                            )}
                            {customSettings.showDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                ไป-กลับ × {formatCurrency(getRatesForEmployee(employee, masterRates).local || 0)}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="font-bold text-lg text-blue-600">{formatCurrency(costs.total)}</div>
                          </td>
                          {globalEditMode && (
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setSelectedEmployeeForEdit(isSelected ? null : employee.id)}
                                className={`p-2 rounded-xl transition-all duration-300 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                                }`}
                                style={{
                                  boxShadow: isSelected
                                    ? 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
                                    : '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
                                  backgroundColor: '#f9fafb'
                                }}
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50"
               style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">พนักงานมีสิทธิ์</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.eligibleEmployees}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">ค่าใช้จ่ายรวม</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics.totalCost)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">เฉลี่ยต่อคน</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(statistics.avgCostPerEmployee)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  รีเซ็ต
                </Button>
                <Button onClick={onSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 rounded-2xl bg-yellow-50"
               style={{ boxShadow: 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">วิธีใช้งาน:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>กดปุ่ม "เปิดการแก้ไข" เพื่อแก้ไขค่าใช้จ่ายแต่ละรายการ</li>
                  <li>คลิกที่ตัวเลขในตารางเพื่อแก้ไขค่าใช้จ่าย</li>
                  <li>ปรับค่าคืนที่พักและวันเบี้ยเลี้ยงเพื่อคำนวณอัตโนมัติ</li>
                  <li>บันทึกการเปลี่ยนแปลงเมื่อเสร็จสิ้น</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};