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
  Users, 
  Calendar, 
  Calculator, 
  Award, 
  AlertCircle,
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



export const ModernTravelCalculationTable: React.FC<ModernTravelCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  calcYear,
  onSave,
  onUpdateEmployee,
  globalEditMode = false
}) => {
  const [currentCalcYear, setCurrentCalcYear] = useState(calcYear);
  const [customSettings, setCustomSettings] = useState({
    hotelNights: 2,
    perDiemDays: 3,
    showDetails: false,
    autoCalculate: true
  });

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));
  const travelEmployees = calculateTravelEmployees(selectedEmployees, masterRates, currentCalcYear);

  // Calculate employee cost function
  const calculateEmployeeCost = (employee: TravelEmployee) => {
    const rates = getRatesForEmployee(employee, masterRates);
    const workingDays = employee.workingDays || 1;
    
    // Calculate hotel nights and per diem days based on working days
    // 1 working day = 2 hotel nights + 3 per diem days
    // Each additional day adds 1 hotel night + 1 per diem day
    const hotelNights = workingDays === 1 ? 2 : 2 + (workingDays - 1);
    const perDiemDays = workingDays === 1 ? 3 : 3 + (workingDays - 1);
    
    const hotel = hotelNights * (rates.hotel || 0);
    const perDiem = perDiemDays * (rates.perDiem || 0);
    const travelRoundTrip = 2 * (rates.travel || 0);
    const localRoundTrip = 2 * (rates.local || 0);
    
    return {
      hotel,
      perDiem,
      travel: travelRoundTrip,
      local: localRoundTrip,
      total: hotel + perDiem + travelRoundTrip + localRoundTrip,
      hotelNights,
      perDiemDays
    };
  };

  // Enhanced statistics calculation
  const statistics = useMemo(() => {
    const totalCost = travelEmployees.reduce((sum, emp) => {
      const costs = calculateEmployeeCost(emp);
      return sum + costs.total;
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
      maxCost: Math.max(...travelEmployees.map(emp => calculateEmployeeCost(emp).total)),
      minCost: Math.min(...travelEmployees.map(emp => calculateEmployeeCost(emp).total))
    };
  }, [travelEmployees, masterRates]);



  const handleSettingChange = (field: string, value: any) => {
    setCustomSettings(prev => ({ ...prev, [field]: value }));
  };

  const renderEditableCell = (employeeId: string, field: string, currentValue: any, type: 'text' | 'number' = 'text') => {
    if (globalEditMode) {
      return (
        <NeumorphismInput
          type={type}
          value={currentValue}
          onChange={(e) => {
            const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
            if (employeeIndex !== -1) {
              const updatedEmployee = { ...employees[employeeIndex] };
              
              if (field.startsWith('customTravelRates.')) {
                const rateField = field.split('.')[1];
                updatedEmployee.customTravelRates = {
                  ...updatedEmployee.customTravelRates,
                  [rateField]: newValue
                };
              } else if (field === 'workingDays') {
                updatedEmployee.workingDays = newValue;
              } else {
                (updatedEmployee as any)[field] = newValue;
              }
              
              onUpdateEmployee(employeeIndex, updatedEmployee);
            }
          }}
          className="w-20 text-center text-sm"
          disabled={!globalEditMode}
        />
      );
    }

    return (
      <div className="font-semibold text-gray-900">
        {type === 'number' ? formatCurrency(currentValue) : currentValue}
      </div>
    );
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'พนักงานทั้งหมด', value: statistics.totalEmployees, icon: Users, color: 'text-blue-600' },
              { label: 'มีสิทธิ์เดินทาง', value: statistics.eligibleEmployees, icon: Award, color: 'text-green-600' },
              { label: 'ค่าใช้จ่ายรวม', value: formatCurrency(statistics.totalCost), icon: Calculator, color: 'text-purple-600' }
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
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="overflow-hidden rounded-2xl" style={{ boxShadow: 'inset 12px 12px 24px #d1d5db, inset -12px -12px 24px #ffffff' }}>
            <div className="overflow-x-auto bg-gray-50 p-4">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="text-left bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                    <th className="p-4 text-sm font-bold text-blue-800 w-32 border-r border-blue-200">รหัสพนักงาน</th>
                    <th className="p-4 text-sm font-bold text-blue-800 w-48 border-r border-blue-200">ชื่อ-นามสกุล</th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-24 border-r border-blue-200">อายุงาน<br/><span className="text-xs text-blue-600">(ปี)</span></th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-24 border-r border-blue-200">วันทำการ<br/><span className="text-xs text-blue-600">(วัน)</span></th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-32 border-r border-blue-200">ค่าที่พัก<br/><span className="text-xs text-blue-600">(บาท)</span></th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-32 border-r border-blue-200">ค่าเบี้ยเลี้ยง<br/><span className="text-xs text-blue-600">(บาท)</span></th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-32 border-r border-blue-200">ค่าเดินทาง<br/><span className="text-xs text-blue-600">(บาท)</span></th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-32 border-r border-blue-200">ค่ารถรับจ้าง<br/><span className="text-xs text-blue-600">(บาท)</span></th>
                    <th className="p-4 text-sm font-bold text-blue-800 text-center w-32 bg-gradient-to-r from-emerald-100 to-emerald-200">รวมทั้งหมด<br/><span className="text-xs text-emerald-700">(บาท)</span></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <AnimatePresence>
                    {travelEmployees.map((employee, index) => {
                      const costs = calculateEmployeeCost(employee);
                      
                      return (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-blue-50 transition-all duration-200 border-b border-gray-200"
                        >
                          <td className="p-4 border-r border-gray-200">
                            <div className="font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg text-center"
                                 style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                              {employee.id}
                            </div>
                          </td>
                          <td className="p-4 border-r border-gray-200">
                            <div className="bg-gray-100 px-3 py-2 rounded-lg"
                                 style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                              <p className="font-semibold text-gray-900">{employee.name}</p>
                              <p className="text-sm text-blue-600">ระดับ {employee.level}</p>
                            </div>
                          </td>
                          <td className="p-4 text-center border-r border-gray-200">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                 style={{ boxShadow: 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff' }}>
                              {employee.serviceYears} ปี
                            </div>
                          </td>
                          <td className="p-4 text-center border-r border-gray-200">
                            {globalEditMode ? renderEditableCell(employee.id, 'workingDays', employee.workingDays || 1, 'number') : (
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                   style={{ boxShadow: 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff' }}>
                                {employee.workingDays || 1} วัน
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center border-r border-gray-200">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.hotel', costs.hotel, 'number') : (
                              <div className="bg-gray-100 px-3 py-2 rounded-lg"
                                   style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.hotel)}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {costs.hotelNights} คืน × {formatCurrency(getRatesForEmployee(employee, masterRates).hotel || 0)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center border-r border-gray-200">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.perDiem', costs.perDiem, 'number') : (
                              <div className="bg-gray-100 px-3 py-2 rounded-lg"
                                   style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.perDiem)}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {costs.perDiemDays} วัน × {formatCurrency(getRatesForEmployee(employee, masterRates).perDiem || 0)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center border-r border-gray-200">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.travel', costs.travel, 'number') : (
                              <div className="bg-gray-100 px-3 py-2 rounded-lg"
                                   style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.travel)}</div>
                                {customSettings.showDetails && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    ไป-กลับ × {formatCurrency(getRatesForEmployee(employee, masterRates).travel || 0)}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center border-r border-gray-200">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.local', costs.local, 'number') : (
                              <div className="bg-gray-100 px-3 py-2 rounded-lg"
                                   style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.local)}</div>
                                {customSettings.showDetails && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    ไป-กลับ × {formatCurrency(getRatesForEmployee(employee, masterRates).local || 0)}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center bg-gradient-to-r from-emerald-50 to-emerald-100">
                            <div className="bg-emerald-100 px-4 py-3 rounded-lg border border-emerald-200"
                                 style={{ boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff' }}>
                              <div className="font-bold text-lg text-emerald-800">{formatCurrency(costs.total)}</div>
                            </div>
                          </td>

                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>


        </div>
      </Card>
    </div>
  );
};