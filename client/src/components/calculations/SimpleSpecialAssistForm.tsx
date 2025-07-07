import React, { useState, useMemo } from 'react';
import { Employee, MasterRates, SpecialAssistEmployee } from '../../types';
import { formatCurrency, calculateSpecialAssist, getRatesForEmployee } from '../../utils/calculations';
import { Heart, Users, Calculator, TrendingUp, CheckCircle, AlertCircle, Edit3, Save, DollarSign } from 'lucide-react';

interface SimpleSpecialAssistFormProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  globalEditMode?: boolean;
}

export const SimpleSpecialAssistForm: React.FC<SimpleSpecialAssistFormProps> = ({
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

  // Helper functions
  const getMonthsForEmployee = (empId: string) => {
    return customMonths[empId] || 12;
  };

  const getLumpSumForEmployee = (empId: string) => {
    return customLumpSum[empId] || 0;
  };

  const handleMonthsChange = (empId: string, months: number) => {
    setCustomMonths(prev => ({ ...prev, [empId]: months }));
  };

  const handleLumpSumChange = (empId: string, amount: number) => {
    setCustomLumpSum(prev => ({ ...prev, [empId]: amount }));
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalEmployees = selectedEmployeeIds.length;
    const eligibleCount = eligibleEmployees.length;
    const ineligibleCount = totalEmployees - eligibleCount;
    
    const totalAmount = eligibleEmployees.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const months = getMonthsForEmployee(emp.id);
      const lumpSum = getLumpSumForEmployee(emp.id) || rates.lumpSum;
      return sum + (rates.rent * months) + (rates.monthlyAssist * months) + lumpSum;
    }, 0);

    const avgAmount = eligibleCount > 0 ? totalAmount / eligibleCount : 0;

    return {
      totalEmployees,
      eligibleCount,
      ineligibleCount,
      totalAmount,
      avgAmount
    };
  }, [eligibleEmployees, masterRates, customMonths, customLumpSum, selectedEmployeeIds.length]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">เงินช่วยเหลืออื่นๆ</h2>
              <p className="text-slate-600">จัดการข้อมูลเงินช่วยเหลือสำหรับพนักงานที่มีสิทธิ์</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึก
            </button>
          </div>
        </div>
      </div>

      {/* Employee List Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-800">รายชื่อพนักงานที่มีสิทธิ์</h3>
          <p className="text-sm text-slate-600 mt-1">ข้อมูลพนักงานสำหรับเงินช่วยเหลืออื่นๆ</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {eligibleEmployees.map((emp, index) => {
              const rates = getRatesForEmployee(emp, masterRates);
              const months = getMonthsForEmployee(emp.id);
              const lumpSum = getLumpSumForEmployee(emp.id) || rates.lumpSum;

              return (
                <div
                  key={emp.id}
                  className="bg-slate-50/80 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-slate-200/30"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {emp.id.slice(-2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{emp.name}</p>
                          <p className="text-sm text-slate-600">รหัส: {emp.id} | ระดับ: {emp.level}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">จำนวนเดือน</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-center"
                        value={months}
                        onChange={(e) => handleMonthsChange(emp.id, parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">เงินก้อน (บาท)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                        value={lumpSum}
                        onChange={(e) => handleLumpSumChange(emp.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">ค่าเช่าบ้าน: {formatCurrency(rates.rent)}/เดือน</span>
                      <span className="text-slate-600">เงินช่วยเหลือ: {formatCurrency(rates.monthlyAssist)}/เดือน</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">สรุปข้อมูล</h3>
              <p className="text-sm text-slate-600">พนักงานที่มีสิทธิ์: {statistics.eligibleCount} คน จากทั้งหมด {statistics.totalEmployees} คน</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(statistics.totalAmount)}</div>
            <div className="text-sm text-slate-600">บาท</div>
          </div>
        </div>
      </div>
    </div>
  );
};