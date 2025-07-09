import React, { useState } from 'react';
import { 
  Heart, 
  Banknote, 
  Clock, 
  Edit3, 
  Save, 
  FileText, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Calculator,
  Plus,
  Trash2
} from 'lucide-react';
import { Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../../types';
import { getRatesForEmployee, formatCurrency } from '../../utils/calculations';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { exportSpecialAssistanceToExcel } from '../../utils/excel';

interface UnifiedSpecialAssistanceManagerProps {
  employees: Employee[];
  masterRates: MasterRates;
  calcYear: number;
  selectedEmployeeIds: string[];
  specialAssist1Data: SpecialAssistData;
  overtimeData: OvertimeData;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onUpdateSelection: (employeeIds: string[]) => void;
  onUpdateSpecialAssist1Item: (year: number, index: number, key: string, value: any) => void;
  onUpdateSpecialAssist1Notes: (year: number, notes: string) => void;
  onUpdateOvertimeData: (year: number, field: string, indexOrValue: any, key?: string, value?: any) => void;
  onSave: () => void;
}

export const UnifiedSpecialAssistanceManager: React.FC<UnifiedSpecialAssistanceManagerProps> = ({
  employees,
  masterRates,
  calcYear,
  selectedEmployeeIds,
  specialAssist1Data,
  overtimeData,
  holidaysData,
  onYearChange,
  onUpdateEmployee,
  onUpdateSelection,
  onUpdateSpecialAssist1Item,
  onUpdateSpecialAssist1Notes,
  onUpdateOvertimeData,
  onSave
}) => {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'assistance' | 'special' | 'overtime'>('assistance');
  const [customMonths, setCustomMonths] = useState<Record<string, number>>({});
  const [customLumpSum, setCustomLumpSum] = useState<Record<string, number>>({});
  const [customPurchaseAllowance, setCustomPurchaseAllowance] = useState<Record<string, number>>({});

  const handleExport = async () => {
    try {
      await exportSpecialAssistanceToExcel(specialAssist1Data, overtimeData, calcYear);
    } catch (error) {
      console.error('Error exporting special assistance data:', error);
    }
  };

  // Helper functions for assistance tab
  const getMonthsForEmployee = (empId: string) => customMonths[empId] || 12;
  const getLumpSumForEmployee = (empId: string) => customLumpSum[empId] || 0;
  const getPurchaseAllowanceForEmployee = (empId: string) => customPurchaseAllowance[empId] || 0;
  const handleMonthsChange = (empId: string, months: number) => {
    setCustomMonths(prev => ({ ...prev, [empId]: months }));
  };
  const handleLumpSumChange = (empId: string, amount: number) => {
    setCustomLumpSum(prev => ({ ...prev, [empId]: amount }));
  };
  const handlePurchaseAllowanceChange = (empId: string, amount: number) => {
    setCustomPurchaseAllowance(prev => ({ ...prev, [empId]: amount }));
  };

  // Filter eligible employees
  const eligibleEmployees = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) && (emp as any).status === 'มีสิทธิ์'
  );

  const tabs = [
    { id: 'assistance', label: 'เงินช่วยเหลืออื่นๆ', icon: <Heart className="w-5 h-5" /> },
    { id: 'special', label: 'เงินช่วยเหลือพิเศษ', icon: <Banknote className="w-5 h-5" /> },
    { id: 'overtime', label: 'ค่าล่วงเวลาวันหยุด', icon: <Clock className="w-5 h-5" /> }
  ];

  const handleSave = () => {
    setEditMode(false);
    onSave();
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const renderAssistanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">รายชื่อพนักงานที่มีสิทธิ์เงินช่วยเหลืออื่นๆ</h3>
              <p className="text-sm text-slate-600 mt-1">ข้อมูลพนักงานและจำนวนเงินช่วยเหลือรายบุคคล</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {eligibleEmployees.map((emp, index) => {
            const rates = getRatesForEmployee(emp, masterRates);
            const months = getMonthsForEmployee(emp.id);
            const lumpSum = getLumpSumForEmployee(emp.id);
            const purchaseAllowance = getPurchaseAllowanceForEmployee(emp.id);
            
            const totalRent = rates.rent * months;
            const totalMonthlyAssist = rates.monthlyAssist * months;
            const grandTotal = totalRent + totalMonthlyAssist + lumpSum + purchaseAllowance;

            return (
              <div key={emp.id} className="bg-slate-50/80 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-slate-200/30">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">รหัส-ชื่อพนักงาน</label>
                    <div className="space-y-2">
                      <div className="font-bold text-lg text-slate-800">{emp.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">รหัส: {emp.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] text-slate-700 font-medium text-xs">
                          ระดับ {emp.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ค่าเช่าบ้าน</label>
                    <div className="h-10 flex items-center justify-center bg-blue-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-blue-200/30">
                      <span className="font-bold text-blue-700">{formatCurrency(rates.rent)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">เงินช่วยเหลือ</label>
                    <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-emerald-200/30">
                      <span className="font-bold text-emerald-700">{formatCurrency(rates.monthlyAssist)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">จำนวนเดือน</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        min="1"
                        max="12"
                        value={months}
                        onChange={(e) => handleMonthsChange(emp.id, parseInt(e.target.value) || 1)}
                        className="w-full text-center"
                      />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-slate-100 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-slate-200/30">
                        <span className="font-bold text-slate-700">{months}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">เงินซื้อของเหมาจ่าย</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        min="0"
                        value={purchaseAllowance}
                        onChange={(e) => handlePurchaseAllowanceChange(emp.id, parseFloat(e.target.value) || 0)}
                        className="w-full text-right"
                      />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-purple-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-purple-200/30">
                        <span className="font-bold text-purple-700">{formatCurrency(purchaseAllowance)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ยอดรวม</label>
                      <div className="h-10 flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] border border-purple-200/50">
                        <span className="font-bold text-lg text-purple-900">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-100/50 to-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-800">สรุปยอดรวมทั้งหมด</h3>
                <p className="text-sm text-slate-600">พนักงานที่มีสิทธิ์: {eligibleEmployees.length} คน</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-900">
                {formatCurrency(
                  eligibleEmployees.reduce((sum, emp) => {
                    const rates = getRatesForEmployee(emp, masterRates);
                    const months = getMonthsForEmployee(emp.id);
                    const lumpSum = getLumpSumForEmployee(emp.id);
                    const purchaseAllowance = getPurchaseAllowanceForEmployee(emp.id);
                    return sum + (rates.rent * months) + (rates.monthlyAssist * months) + lumpSum + purchaseAllowance;
                  }, 0)
                )}
              </div>
              <div className="text-sm text-slate-600">บาท</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpecialTab = () => {
    console.log('renderSpecialTab - specialAssist1Data:', specialAssist1Data);
    console.log('renderSpecialTab - specialAssist1Data.items:', specialAssist1Data.items);
    
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800">รายการเงินช่วยเหลือพิเศษ</h3>
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-900">
                      {formatCurrency(
                        (specialAssist1Data.items || []).reduce((sum, item) => {
                          const timesPerYear = Number(item.timesPerYear) || 0;
                          const days = Number(item.days) || 0;
                          const people = Number(item.people) || 0;
                          const rate = Number(item.rate) || 0;
                          console.log('Special assist calculation:', { item, timesPerYear, days, people, rate, total: timesPerYear * days * people * rate });
                          return sum + (timesPerYear * days * people * rate);
                        }, 0)
                      )}
                    </div>
                    <div className="text-xs text-slate-600">ยอดรวมทั้งหมด</div>
                  </div>
                </div>
              </div>
              {editMode && (
                <button
                  onClick={() => {
                    const newIndex = (specialAssist1Data.items || []).length;
                    onUpdateSpecialAssist1Item(calcYear, newIndex, 'item', 'รายการใหม่');
                    onUpdateSpecialAssist1Item(calcYear, newIndex, 'timesPerYear', 1);
                    onUpdateSpecialAssist1Item(calcYear, newIndex, 'days', 1);
                    onUpdateSpecialAssist1Item(calcYear, newIndex, 'people', 1);
                    onUpdateSpecialAssist1Item(calcYear, newIndex, 'rate', 0);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {(specialAssist1Data.items || []).map((item, index) => (
              <div key={index} className="bg-slate-50/80 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-slate-200/30">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">รายการ</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        value={item.item}
                        onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'item', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-slate-100 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-slate-200/30">
                        <span className="font-bold text-slate-700">{item.item}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ครั้ง/ปี</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        value={item.timesPerYear}
                        onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'timesPerYear', parseInt(e.target.value) || 0)}
                        className="w-full text-center"
                      />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-blue-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-blue-200/30">
                        <span className="font-bold text-blue-700">{item.timesPerYear}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">วัน</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        value={item.days}
                        onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'days', parseInt(e.target.value) || 0)}
                        className="w-full text-center"
                      />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-emerald-200/30">
                        <span className="font-bold text-emerald-700">{item.days}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">คน</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        value={item.people}
                        onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'people', parseInt(e.target.value) || 0)}
                        className="w-full text-center"
                      />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-purple-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-purple-200/30">
                        <span className="font-bold text-purple-700">{item.people}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">อัตรา</label>
                    {editMode ? (
                      <NeumorphismInput
                        type="text"
                        value={item.rate}
                        onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full text-right"
                      />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-yellow-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-yellow-200/30">
                        <span className="font-bold text-yellow-700">{formatCurrency(item.rate)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ยอดรวม</label>
                      <div className="h-10 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] border border-blue-200/50">
                        <span className="font-bold text-lg text-blue-900">
                          {formatCurrency(item.timesPerYear * item.days * item.people * item.rate)}
                        </span>
                      </div>
                    </div>
                    {editMode && (
                      <button
                        onClick={() => {
                          if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
                            const currentItems = specialAssist1Data.items || [];
                            const newItems = currentItems.filter((_, i) => i !== index);
                            
                            // Clear all items first
                            currentItems.forEach((_, i) => {
                              Object.keys(currentItems[i]).forEach(key => {
                                onUpdateSpecialAssist1Item(calcYear, i, key, undefined);
                              });
                            });
                            
                            // Add back the remaining items
                            newItems.forEach((item, i) => {
                              Object.entries(item).forEach(([key, value]) => {
                                onUpdateSpecialAssist1Item(calcYear, i, key, value);
                              });
                            });
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200 mt-2"
                        disabled={(specialAssist1Data.items || []).length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="p-6 border-t border-slate-200/50">
            <label className="block text-sm font-medium text-slate-700 mb-2">หมายเหตุ</label>
            {editMode ? (
              <NeumorphismInput
                type="text"
                value={specialAssist1Data.notes || ''}
                onChange={(e) => onUpdateSpecialAssist1Notes(calcYear, e.target.value)}
                className="w-full"
                placeholder="ระบุหมายเหตุเพิ่มเติม..."
              />
            ) : (
              <div className="min-h-10 p-4 bg-slate-50/80 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-slate-200/30">
                <span className="text-slate-700">{specialAssist1Data.notes || 'ไม่มีหมายเหตุ'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOvertimeTab = () => (
    <div className="space-y-6">
      {/* Salary Input */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="p-6 border-b border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-800">เงินเดือนฐาน</h3>
          <p className="text-sm text-slate-600 mt-1">สำหรับคำนวณอัตราค่าล่วงเวลา</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เงินเดือน</label>
              {editMode ? (
                <NeumorphismInput
                  type="text"
                  value={overtimeData.salary}
                  onChange={(e) => {
                    const salary = parseFloat(e.target.value) || 0;
                    onUpdateOvertimeData(calcYear, 'salary', salary);
                    
                    // Auto-update all items with default rate
                    const currentItems = overtimeData.items || [];
                    currentItems.forEach((item, index) => {
                      onUpdateOvertimeData(calcYear, 'items', index, 'hourlyRate', salary / 210);
                    });
                  }}
                  className="w-full text-right"
                />
              ) : (
                <div className="h-10 flex items-center justify-center bg-blue-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-blue-200/30">
                  <span className="font-bold text-blue-700">{formatCurrency(overtimeData.salary)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Items */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">รายการค่าล่วงเวลา</h3>
            {editMode && (
              <button
                onClick={() => {
                  const newIndex = (overtimeData.items || []).length;
                  onUpdateOvertimeData(calcYear, 'items', newIndex, 'item', '');
                  onUpdateOvertimeData(calcYear, 'items', newIndex, 'days', 0);
                  onUpdateOvertimeData(calcYear, 'items', newIndex, 'hours', 0);
                  onUpdateOvertimeData(calcYear, 'items', newIndex, 'people', 0);
                  onUpdateOvertimeData(calcYear, 'items', newIndex, 'hourlyRate', overtimeData.salary / 210);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                เพิ่มรายการ
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {(overtimeData.items || []).map((item, index) => (
            <div key={index} className="bg-slate-50/80 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-slate-200/30">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">รายการ</label>
                  {editMode ? (
                    <NeumorphismInput
                      type="text"
                      value={item.item}
                      onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'item', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-slate-200/30">
                      <span className="font-bold text-slate-700">{item.item}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">คน</label>
                  {editMode ? (
                    <NeumorphismInput
                      type="text"
                      value={item.people}
                      onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'people', parseInt(e.target.value) || 0)}
                      className="w-full text-center"
                    />
                  ) : (
                    <div className="h-10 flex items-center justify-center bg-blue-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-blue-200/30">
                      <span className="font-bold text-blue-700">{item.people}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">วัน</label>
                  {editMode ? (
                    <NeumorphismInput
                      type="text"
                      value={item.days}
                      onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'days', parseInt(e.target.value) || 0)}
                      className="w-full text-center"
                    />
                  ) : (
                    <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-emerald-200/30">
                      <span className="font-bold text-emerald-700">{item.days}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ชม.</label>
                  {editMode ? (
                    <NeumorphismInput
                      type="text"
                      value={item.hours}
                      onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'hours', parseInt(e.target.value) || 0)}
                      className="w-full text-center"
                    />
                  ) : (
                    <div className="h-10 flex items-center justify-center bg-purple-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-purple-200/30">
                      <span className="font-bold text-purple-700">{item.hours}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">อัตราต่อชั่วโมง</label>
                  {editMode ? (
                    <NeumorphismInput
                      type="text"
                      value={item.hourlyRate}
                      onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                      className="w-full text-right"
                    />
                  ) : (
                    <div className="h-10 flex items-center justify-center bg-yellow-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-yellow-200/30">
                      <span className="font-bold text-yellow-700">{formatCurrency(item.hourlyRate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ยอดรวม</label>
                    <div className="h-10 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] border border-blue-200/50">
                      <span className="font-bold text-lg text-blue-900">
                        {formatCurrency((item.people || 0) * (item.days || 0) * (item.hours || 0) * (item.hourlyRate || 0))}
                      </span>
                    </div>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
                          const currentItems = overtimeData.items || [];
                          const newItems = currentItems.filter((_, i) => i !== index);
                          
                          // Clear all items first
                          currentItems.forEach((_, i) => {
                            Object.keys(currentItems[i]).forEach(key => {
                              onUpdateOvertimeData(calcYear, 'items', i, key, undefined);
                            });
                          });
                          
                          // Add back the remaining items
                          newItems.forEach((item, i) => {
                            Object.entries(item).forEach(([key, value]) => {
                              onUpdateOvertimeData(calcYear, 'items', i, key, value);
                            });
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                      disabled={(overtimeData.items || []).length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total Summary Section */}
        <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
                <Calculator className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-800">ยอดรวมค่าล่วงเวลา</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-900">
                {formatCurrency(
                  (overtimeData.items || []).reduce((total, item) => 
                    total + (item.people || 0) * (item.days || 0) * (item.hours || 0) * (item.hourlyRate || 0), 0
                  )
                )}
              </div>
              <p className="text-sm text-red-600 mt-1">รวมทั้งหมด {(overtimeData.items || []).length} รายการ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800">หมายเหตุ</h3>
          </div>
        </div>
        <div className="p-6">
          {editMode ? (
            <NeumorphismInput
              type="text"
              value={overtimeData.notes || ''}
              onChange={(e) => onUpdateOvertimeData(calcYear, 'notes', e.target.value)}
              className="w-full"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
            />
          ) : (
            <div className="min-h-10 p-4 bg-slate-50/80 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-slate-200/30">
              <span className="text-slate-700">{overtimeData.notes || 'ไม่มีหมายเหตุ'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">เงินช่วยเหลือ</h2>
              <p className="text-slate-600">จัดการข้อมูลเงินช่วยเหลือทุกประเภทในปี {calcYear}</p>
            </div>
          </div>

          {/* Year Navigation and Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
              <button
                onClick={() => onYearChange(calcYear - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="px-4 py-2 font-bold text-lg text-slate-800">
                ปี {calcYear}
              </div>
              <button
                onClick={() => onYearChange(calcYear + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  editMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]'
                }`}
              >
                {editMode ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {editMode ? 'เสร็จสิ้น' : 'แก้ไข'}
              </button>
              
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                บันทึก
              </button>
              
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                ส่งออก Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]'
                  : 'text-slate-600 hover:bg-slate-50/50 hover:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'assistance' && renderAssistanceTab()}
      {activeTab === 'special' && renderSpecialTab()}
      {activeTab === 'overtime' && renderOvertimeTab()}
    </div>
  );
};