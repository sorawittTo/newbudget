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
  const [customSettings, setCustomSettings] = useState({
    hotelNights: 2,
    perDiemDays: 3,
    showDetails: false,
    autoCalculate: true
  });

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));
  const travelEmployees = calculateTravelEmployees(selectedEmployees, masterRates, calcYear)
    .sort((a, b) => {
      // Sort by level (7 -> 6 -> 5.5 -> 5 -> 4.5 -> 4 -> 3)
      const levelA = parseFloat(a.level);
      const levelB = parseFloat(b.level);
      if (levelA !== levelB) {
        return levelB - levelA; // Descending order
      }
      // If same level, sort alphabetically by name
      return a.name.localeCompare(b.name, 'th');
    });

  // Statistics calculation
  const statistics = useMemo(() => {
    const totalEmployees = selectedEmployees.length;
    const eligibleEmployees = travelEmployees.length;
    const totalCost = travelEmployees.reduce((sum, emp) => sum + emp.total, 0);
    const avgCostPerEmployee = eligibleEmployees > 0 ? totalCost / eligibleEmployees : 0;
    
    return {
      totalEmployees,
      eligibleEmployees,
      totalCost,
      avgCostPerEmployee
    };
  }, [selectedEmployees, travelEmployees, masterRates]);

  // Render editable cell
  const renderEditableCell = (employeeId: string, field: string, value: any, type: 'text' | 'number') => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return <div>{value}</div>;

    const employeeIndex = employees.indexOf(employee);
    const currentValue = type === 'number' ? Number(value) || 0 : value;

    if (globalEditMode) {
      return (
        <NeumorphismInput
          type="text"
          value={currentValue.toString()}
          onChange={(e) => {
            const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            const updatedEmployee = { ...employee };
            
            if (field.includes('.')) {
              const [parent, child] = field.split('.');
              if (parent === 'customTravelRates') {
                updatedEmployee.customTravelRates = {
                  ...updatedEmployee.customTravelRates,
                  [child]: newValue
                };
              }
            } else {
              (updatedEmployee as any)[field] = newValue;
            }
            
            onUpdateEmployee(employeeIndex, updatedEmployee);
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
                  <th className="px-4 py-3 text-center font-semibold">ค่าพาหนะประจำทาง<br />ศนร.-กทม. ไปกลับ</th>
                  <th className="px-4 py-3 text-center font-semibold">ค่าพาหนะรับจ้าง<br />ขนส่ง-ที่พัก ไป-กลับ</th>
                  <th className="px-4 py-3 text-center font-semibold">รวมทั้งหมด</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {travelEmployees.map((employee, index) => {
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
                          {globalEditMode ? renderEditableCell(employee.id, 'travelWorkingDays', employee.travelWorkingDays || 1, 'number') : (
                            <span className="font-medium text-gray-900">{employee.travelWorkingDays || 1} วัน</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <div className="font-semibold text-gray-900">{formatCurrency(employee.hotel)}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {employee.hotelNights} คืน × {formatCurrency(getRatesForEmployee(employee, masterRates).hotel || 0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <div className="font-semibold text-gray-900">{formatCurrency(employee.perDiem)}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {employee.perDiemDays} วัน × {formatCurrency(getRatesForEmployee(employee, masterRates).perDiem || 0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <div className="font-semibold text-gray-900">{formatCurrency(employee.travelRoundTrip)}</div>
                            {customSettings.showDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                ศนร.-กทม. ไปกลับ
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <div className="font-semibold text-gray-900">{formatCurrency(employee.localRoundTrip)}</div>
                            {customSettings.showDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                ขนส่ง-ที่พัก ไป-กลับ
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="font-bold text-lg text-indigo-600">{formatCurrency(employee.total)}</div>
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