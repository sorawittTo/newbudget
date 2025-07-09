import React, { useState, useMemo } from 'react';
import { Employee, MasterRates, SpecialAssistEmployee } from '../../types';
import { formatCurrency, calculateSpecialAssist, getRatesForEmployee } from '../../utils/calculations';
import { Heart, Users, Calculator, TrendingUp, CheckCircle, AlertCircle, Edit3, Save, DollarSign } from 'lucide-react';

interface ModernSpecialAssistCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  globalEditMode?: boolean;
}

export const ModernSpecialAssistCalculationTable: React.FC<ModernSpecialAssistCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  onSave,
  onUpdateEmployee,
  globalEditMode = false
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [customMonths, setCustomMonths] = useState<Record<string, number>>({});
  const [customLumpSum, setCustomLumpSum] = useState<Record<string, number>>({});

  // Filter employees: selected and has eligible status only
  const eligibleEmployees = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) &&
    (emp as any).status === 'มีสิทธิ์'
  );
  
  const specialAssistData = calculateSpecialAssist(eligibleEmployees, masterRates);

  // Helper functions
  const getMonthsForEmployee = (empId: string) => {
    return customMonths[empId] || 12;
  };

  const getLumpSumForEmployee = (empId: string) => {
    return customLumpSum[empId] || 0;
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalEmployees = selectedEmployeeIds.length;
    const eligibleCount = eligibleEmployees.length;
    const ineligibleCount = totalEmployees - eligibleCount;
    
    const totalAmount = specialAssistData.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const months = getMonthsForEmployee(emp.id);
      const totalRent = rates.rent * months;
      const totalMonthlyAssist = rates.monthlyAssist * months;
      const lumpSum = getLumpSumForEmployee(emp.id) || 0;
      return sum + totalRent + totalMonthlyAssist + lumpSum;
    }, 0);

    return {
      totalEmployees,
      eligibleCount,
      ineligibleCount,
      totalAmount,
      avgAmount: eligibleCount > 0 ? totalAmount / eligibleCount : 0
    };
  }, [specialAssistData, selectedEmployeeIds, eligibleEmployees, customMonths, customLumpSum, masterRates]);

  const handleEditingChange = (key: string, value: any) => {
    setEditingValues(prev => ({ ...prev, [key]: value }));
  };

  const handleMonthsChange = (empId: string, months: number) => {
    setCustomMonths(prev => ({ ...prev, [empId]: months }));
  };

  const handleLumpSumChange = (empId: string, lumpSum: number) => {
    setCustomLumpSum(prev => ({ ...prev, [empId]: lumpSum }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">เงินช่วยเหลืออื่นๆ</h2>
              <p className="text-slate-600">คำนวณเงินช่วยเหลือพิเศษสำหรับพนักงานที่มีสถานะ "มีสิทธิ์"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">พนักงานทั้งหมด</p>
              <p className="text-3xl font-bold text-blue-900">{statistics.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 shadow-[8px_8px_16px_#93c5fd,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">มีสิทธิ์</p>
              <p className="text-3xl font-bold text-emerald-900">{statistics.eligibleCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 shadow-[8px_8px_16px_#a7f3d0,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-amber-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium">ไม่มีสิทธิ์</p>
              <p className="text-3xl font-bold text-amber-900">{statistics.ineligibleCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 shadow-[8px_8px_16px_#fde68a,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">ยอดรวม</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(statistics.totalAmount)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 shadow-[8px_8px_16px_#ddd6fe,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-orange-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">เฉลี่ย/คน</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(statistics.avgAmount)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500 shadow-[8px_8px_16px_#fed7aa,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-600 to-purple-600 text-white">
                <th className="px-6 py-4 text-left font-bold">รหัสพนักงาน</th>
                <th className="px-6 py-4 text-left font-bold">ชื่อ-สกุล</th>
                <th className="px-6 py-4 text-left font-bold">ระดับ</th>
                <th className="px-6 py-4 text-right font-bold">ค่าเช่าบ้าน (เดือน)</th>
                <th className="px-6 py-4 text-right font-bold">เงินช่วยเหลือ (เดือน)</th>
                <th className="px-6 py-4 text-right font-bold">จำนวนเดือน</th>
                <th className="px-6 py-4 text-right font-bold">รวมค่าเช่า</th>
                <th className="px-6 py-4 text-right font-bold">รวมเงินช่วยเหลือ</th>
                <th className="px-6 py-4 text-right font-bold">เงินก้อน</th>
                <th className="px-6 py-4 text-right font-bold">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {specialAssistData.map((emp, index) => {
                const rates = getRatesForEmployee(emp, masterRates);
                const months = getMonthsForEmployee(emp.id);
                const totalRent = rates.rent * months;
                const totalMonthlyAssist = rates.monthlyAssist * months;
                const lumpSum = getLumpSumForEmployee(emp.id) || 0;
                const grandTotal = totalRent + totalMonthlyAssist + lumpSum;

                return (
                  <tr key={emp.id} className="border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{emp.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{emp.name}</td>
                    <td className="px-6 py-4 text-slate-600">{emp.level}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-slate-700">{formatCurrency(rates.rent)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-slate-700">{formatCurrency(rates.monthlyAssist)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {globalEditMode ? (
                        <input
                          type="text"
                          min="1"
                          max="12"
                          className="w-20 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-center"
                          value={months}
                          onChange={(e) => handleMonthsChange(emp.id, parseInt(e.target.value) || 1)}
                        />
                      ) : (
                        <span className="font-bold text-lg text-slate-700">{months}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-blue-700">{formatCurrency(totalRent)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-emerald-700">{formatCurrency(totalMonthlyAssist)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {globalEditMode ? (
                        <input
                          type="text"
                          min="0"
                          
                          className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                          value={lumpSum}
                          onChange={(e) => handleLumpSumChange(emp.id, parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <span className="font-bold text-lg text-purple-700">{formatCurrency(lumpSum)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="font-bold text-xl text-purple-900">{formatCurrency(grandTotal)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold">
                <td colSpan={9} className="px-6 py-4 text-right text-lg">
                  ยอดรวมทั้งหมด:
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-2xl text-purple-900">{formatCurrency(statistics.totalAmount)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};