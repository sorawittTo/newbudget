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
      <Card className="bg-white shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ค่าใช้จ่ายในการเดินทาง</h2>
                <p className="text-gray-600">จัดการค่าใช้จ่ายในการเดินทางรับของที่ระลึก</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-500">‹</span>
                </button>
                <span className="text-sm text-gray-600">ค่าใช้จ่ายประจำปี</span>
                <span className="text-xl font-bold text-gray-900">{currentCalcYear}</span>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-500">›</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  แก้ไข
                </Button>
                <Button variant="default" size="sm">
                  บันทึก
                </Button>
                <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                  ส่งออก Excel
                </Button>
              </div>
            </div>

          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">พนักงานทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-900">{statistics.totalEmployees}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">มีสิทธิ์เดินทาง</p>
                  <p className="text-2xl font-bold text-green-900">{statistics.eligibleEmployees}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">ยอดรวมทั้งหมด</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(statistics.totalCost)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-600">ไม่มีสิทธิ์</p>
                  <p className="text-2xl font-bold text-orange-900">{statistics.totalEmployees - statistics.eligibleEmployees}</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </Card>

      {/* Travel Calculation Summary */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ค่าเดินทางรับของที่ระลึก</h3>
              <p className="text-sm text-gray-600">คำนวณค่าเดินทางรับของที่ระลึกสำหรับพนักงานที่มีสิทธิ์</p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">พนักงานทั้งหมด</p>
                  <p className="text-xl font-bold text-blue-900">{statistics.totalEmployees}</p>
                  <p className="text-xs text-blue-500">คน</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">มีสิทธิ์เดินทาง</p>
                  <p className="text-xl font-bold text-green-900">{statistics.eligibleEmployees}</p>
                  <p className="text-xs text-green-500">คน</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calculator className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">ค่าใช้จ่ายรวม</p>
                  <p className="text-lg font-bold text-purple-900">{formatCurrency(statistics.totalCost)}</p>
                  <p className="text-xs text-purple-500">บาท</p>
                </div>
              </div>
            </div>
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
                    <th className="px-4 py-3 text-center font-semibold">อายุงาน</th>
                    <th className="px-4 py-3 text-center font-semibold">วันทำการ</th>
                    <th className="px-4 py-3 text-center font-semibold">ค่าที่พัก</th>
                    <th className="px-4 py-3 text-center font-semibold">ค่าเบี้ยเลี้ยง</th>
                    <th className="px-4 py-3 text-center font-semibold">ค่าเดินทาง</th>
                    <th className="px-4 py-3 text-center font-semibold">ค่ารถรับจ้าง</th>
                    <th className="px-4 py-3 text-center font-semibold">รวมทั้งหมด</th>
                  </tr>
                </thead>
                <tbody>
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
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">{employee.id}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900">{employee.name}</p>
                              <p className="text-sm text-gray-600">ระดับ {employee.level}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium text-gray-900">{employee.serviceYears} ปี</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {globalEditMode ? renderEditableCell(employee.id, 'workingDays', employee.workingDays || 1, 'number') : (
                              <span className="font-medium text-gray-900">{employee.workingDays || 1} วัน</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.hotel', costs.hotel, 'number') : (
                              <div>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.hotel)}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {costs.hotelNights} คืน × {formatCurrency(getRatesForEmployee(employee, masterRates).hotel || 0)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.perDiem', costs.perDiem, 'number') : (
                              <div>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.perDiem)}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {costs.perDiemDays} วัน × {formatCurrency(getRatesForEmployee(employee, masterRates).perDiem || 0)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.travel', costs.travel, 'number') : (
                              <div>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.travel)}</div>
                                {customSettings.showDetails && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    ไป-กลับ × {formatCurrency(getRatesForEmployee(employee, masterRates).travel || 0)}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {globalEditMode ? renderEditableCell(employee.id, 'customTravelRates.local', costs.local, 'number') : (
                              <div>
                                <div className="font-semibold text-gray-900">{formatCurrency(costs.local)}</div>
                                {customSettings.showDetails && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    ไป-กลับ × {formatCurrency(getRatesForEmployee(employee, masterRates).local || 0)}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-bold text-lg text-blue-600">{formatCurrency(costs.total)}</div>
                          </td>

                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
        </div>
      </Card>
    </div>
  );
};