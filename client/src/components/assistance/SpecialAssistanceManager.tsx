import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { NeumorphismSelect } from '../ui/NeumorphismSelect';
import { 
  Heart, 
  Banknote, 
  Clock, 
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Calculator,
  Calendar
} from 'lucide-react';
import { 
  calculateSpecialAssist, 
  formatCurrency,
  getRatesForEmployee
} from '../../utils/calculations';

interface SpecialAssistanceManagerProps {
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

export const SpecialAssistanceManager: React.FC<SpecialAssistanceManagerProps> = ({
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
  const [activeSection, setActiveSection] = useState<'assistance' | 'special' | 'overtime'>('assistance');
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [customMonths, setCustomMonths] = useState<Record<string, number>>({});
  const [customLumpSum, setCustomLumpSum] = useState<Record<string, number>>({});

  // Calculate assistance data
  const assistanceData = calculateSpecialAssist(
    employees.filter(emp => selectedEmployeeIds.includes(emp.id)), 
    masterRates
  );

  const getMonthsForEmployee = (empId: string) => customMonths[empId] || 12;
  const getLumpSumForEmployee = (empId: string) => customLumpSum[empId] || 0;

  const calculateCustomTotal = () => {
    return assistanceData.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const months = getMonthsForEmployee(emp.id);
      const totalRent = rates.rent * months;
      const totalMonthlyAssist = rates.monthlyAssist * months;
      const lumpSum = getLumpSumForEmployee(emp.id);
      return sum + totalRent + totalMonthlyAssist + lumpSum;
    }, 0);
  };

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingValues(prev => ({ ...prev, [field]: currentValue }));
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleEditSave = (field: string, empId?: string) => {
    const newValue = editingValues[field];
    if (newValue !== undefined) {
      if (field.includes('months') && empId) {
        setCustomMonths(prev => ({ ...prev, [empId]: parseInt(newValue) || 12 }));
      } else if (field.includes('lumpSum') && empId) {
        setCustomLumpSum(prev => ({ ...prev, [empId]: parseFloat(newValue) || 0 }));
      }
    }
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const handleEditCancel = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const renderEditableValue = (field: string, currentValue: any, empId?: string, isText = false) => {
    const isEditing = editMode[field];
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <NeumorphismInput
            type={isText ? "text" : "number"}
            min={field.includes('months') ? "1" : "0"}
            max={field.includes('months') ? "12" : undefined}
            value={editingValues[field] !== undefined ? editingValues[field] : currentValue}
            onChange={(e) => setEditingValues(prev => ({ 
              ...prev, 
              [field]: isText ? e.target.value : (parseFloat(e.target.value) || 0)
            }))}
            className="text-center"
          />
          <button
            onClick={() => handleEditSave(field, empId)}
            className="p-2 rounded-xl text-green-600 hover:text-green-700 transition-colors"
            style={{
              boxShadow: '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
              backgroundColor: '#f9fafb'
            }}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCancel(field)}
            className="p-2 rounded-xl text-red-600 hover:text-red-700 transition-colors"
            style={{
              boxShadow: '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
              backgroundColor: '#f9fafb'
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <motion.div 
        className="group/cell flex items-center justify-center p-3 cursor-pointer transition-all duration-300 rounded-2xl"
        style={{
          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
          backgroundColor: '#f9fafb'
        }}
        whileHover={{
          boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff',
        }}
        onClick={() => handleEditStart(field, currentValue)}
      >
        <span className="font-bold text-blue-600 text-lg mr-2">
          {field.includes('months') ? currentValue : formatCurrency(currentValue)}
        </span>
        {field.includes('months') && <Calendar className="w-4 h-4 text-blue-500" />}
        <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover/cell:opacity-100 transition-opacity ml-2" />
      </motion.div>
    );
  };

  const sections = [
    { id: 'assistance', label: 'เงินช่วยเหลืออื่นๆ', icon: <Heart className="w-5 h-5" />, count: assistanceData.length },
    { id: 'special', label: 'เงินช่วยเหลือพิเศษ', icon: <Banknote className="w-5 h-5" />, count: specialAssist1Data.items.length },
    { id: 'overtime', label: 'ค่าล่วงเวลาวันหยุด', icon: <Clock className="w-5 h-5" />, count: overtimeData.items.length }
  ];

  const renderAssistanceSection = () => {
    const total = calculateCustomTotal();

    return (
      <div className="space-y-6">
        {/* Main Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 w-40">รหัสพนักงาน</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 w-64">ชื่อ-สกุล</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 w-24">ระดับ</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 w-32">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-4 h-4" />
                      จำนวนเดือน
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 w-40">ค่าเช่าบ้าน</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 w-40">เงินช่วยเหลือรายเดือน</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 w-40">ค่าซื้อของเหมาจ่าย</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 bg-blue-50 w-48">
                    <div className="flex items-center justify-end gap-1">
                      <Calculator className="w-4 h-4" />
                      รวม (บาท)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {assistanceData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Heart className="w-12 h-12 text-gray-300" />
                        <p className="font-medium">ไม่มีพนักงานที่เข้าเกณฑ์</p>
                        <p className="text-sm">พนักงานต้องมีสถานะ "มีสิทธิ์"</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assistanceData.map((emp, index) => {
                    const rates = getRatesForEmployee(emp, masterRates);
                    const months = getMonthsForEmployee(emp.id);
                    const totalRent = rates.rent * months;
                    const totalMonthlyAssist = rates.monthlyAssist * months;
                    const lumpSum = getLumpSumForEmployee(emp.id);
                    const total = totalRent + totalMonthlyAssist + lumpSum;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-center font-mono font-bold shadow-sm">
                            {emp.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 text-lg">{emp.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {emp.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {renderEditableValue(`${emp.id}_months`, months, emp.id)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-green-600 text-lg">{formatCurrency(totalRent)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-purple-600 text-lg">{formatCurrency(totalMonthlyAssist)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderEditableValue(`${emp.id}_lumpSum`, lumpSum, emp.id)}
                        </td>
                        <td className="px-6 py-4 text-right bg-blue-50">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg text-center shadow-sm">
                            <div className="font-bold text-xl">{formatCurrency(total)}</div>
                            <div className="text-xs text-blue-100">บาท</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {assistanceData.length > 0 && (
                <tfoot className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200">
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-right font-bold text-xl text-blue-900">
                      ยอดรวมทั้งหมด:
                    </td>
                    <td className="px-6 py-6 text-right bg-blue-100">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg text-center shadow-lg">
                        <div className="font-bold text-2xl">{formatCurrency(total)}</div>
                        <div className="text-sm text-green-100">บาท</div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderSpecialSection = () => {
    const total = specialAssist1Data.items.reduce((sum, item) => 
      sum + (item.timesPerYear * item.days * item.people * item.rate), 0
    );

    const addNewItem = () => {
      const newIndex = specialAssist1Data.items.length;
      onUpdateSpecialAssist1Item(calcYear, newIndex, 'item', 'รายการใหม่');
      onUpdateSpecialAssist1Item(calcYear, newIndex, 'timesPerYear', 1);
      onUpdateSpecialAssist1Item(calcYear, newIndex, 'days', 1);
      onUpdateSpecialAssist1Item(calcYear, newIndex, 'people', 1);
      onUpdateSpecialAssist1Item(calcYear, newIndex, 'rate', 250);
    };

    const deleteItem = (index: number) => {
      if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        const newItems = specialAssist1Data.items.filter((_, i) => i !== index);
        newItems.forEach((item, newIndex) => {
          Object.keys(item).forEach(key => {
            onUpdateSpecialAssist1Item(calcYear, newIndex, key, item[key as keyof typeof item]);
          });
        });
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">รายการเงินช่วยเหลือพิเศษ</h4>
            <Button onClick={addNewItem}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">รายการ</th>
                  <th className="px-4 py-3 text-center">ครั้งต่อปี</th>
                  <th className="px-4 py-3 text-center">จำนวนวัน</th>
                  <th className="px-4 py-3 text-center">จำนวนคน</th>
                  <th className="px-4 py-3 text-right">อัตราต่อวัน</th>
                  <th className="px-4 py-3 text-right">รวม</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {specialAssist1Data.items.map((item, index) => {
                  const itemTotal = item.timesPerYear * item.days * item.people * item.rate;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <NeumorphismInput
                          type="text"
                          value={item.item}
                          onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'item', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="number"
                          value={item.timesPerYear}
                          onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'timesPerYear', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="number"
                          value={item.days}
                          onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'days', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="number"
                          value={item.people}
                          onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'people', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="number"
                          value={item.rate}
                          onChange={(e) => onUpdateSpecialAssist1Item(calcYear, index, 'rate', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(itemTotal)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="danger" size="sm" onClick={() => deleteItem(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right">ยอดรวมทั้งหมด:</td>
                  <td className="px-4 py-3 text-right text-lg text-blue-600">{formatCurrency(total)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
            <textarea
              className="w-full p-3 rounded-2xl resize-none transition-all duration-300 focus:outline-none text-gray-900"
              style={{
                boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff',
                backgroundColor: '#f9fafb'
              }}
              rows={3}
              value={specialAssist1Data.notes || ''}
              onChange={(e) => onUpdateSpecialAssist1Notes(calcYear, e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
            />
          </div>
        </Card>
      </div>
    );
  };

  const renderOvertimeSection = () => {
    const calculateOvertimeRate = (salary: number) => {
      const dailyRate = salary / 30;
      const hourlyRate = dailyRate / 8;
      return hourlyRate * 1.5;
    };

    const calculateItemTotal = (item: any, salary: number) => {
      const overtimeRate = calculateOvertimeRate(salary);
      return item.instances * item.days * item.hours * item.people * overtimeRate;
    };

    const total = overtimeData.items.reduce((sum, item) => 
      sum + calculateItemTotal(item, overtimeData.salary), 0
    );

    const addNewItem = () => {
      const newIndex = overtimeData.items.length;
      onUpdateOvertimeData(calcYear, 'items', newIndex, 'item', 'รายการใหม่');
      onUpdateOvertimeData(calcYear, 'items', newIndex, 'instances', 1);
      onUpdateOvertimeData(calcYear, 'items', newIndex, 'days', 1);
      onUpdateOvertimeData(calcYear, 'items', newIndex, 'hours', 8);
      onUpdateOvertimeData(calcYear, 'items', newIndex, 'people', 1);
    };

    const deleteItem = (index: number) => {
      if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        const newItems = overtimeData.items.filter((_, i) => i !== index);
        newItems.forEach((item, newIndex) => {
          Object.keys(item).forEach(key => {
            onUpdateOvertimeData(calcYear, 'items', newIndex, key, item[key as keyof typeof item]);
          });
        });
      }
    };

    const overtimeRate = calculateOvertimeRate(overtimeData.salary);

    return (
      <div className="space-y-6">
        {/* Salary Setting */}
        <Card className="bg-gray-100" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff' }}>
          <div className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              เงินเดือนอ้างอิง
            </h4>
            <div className="flex items-center gap-4">
              <NeumorphismInput
                type="number"
                value={overtimeData.salary}
                onChange={(e) => onUpdateOvertimeData(calcYear, 'salary', parseFloat(e.target.value) || 0)}
                className="w-32 text-right"
              />
              <span className="text-gray-700 font-medium">บาท</span>
              <motion.div 
                className="text-sm text-gray-600 p-3 rounded-2xl"
                style={{ boxShadow: 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff', backgroundColor: '#f9fafb' }}
              >
                อัตราล่วงเวลา: <span className="font-bold text-orange-600">{formatCurrency(overtimeRate)}/ชั่วโมง</span>
              </motion.div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">รายการค่าล่วงเวลา</h4>
            <Button onClick={addNewItem}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">รายการ</th>
                  <th className="px-4 py-3 text-center">จำนวนครั้ง</th>
                  <th className="px-4 py-3 text-center">จำนวนวัน</th>
                  <th className="px-4 py-3 text-center">จำนวนชั่วโมง</th>
                  <th className="px-4 py-3 text-center">จำนวนคน</th>
                  <th className="px-4 py-3 text-right">อัตราล่วงเวลา</th>
                  <th className="px-4 py-3 text-right">รวม</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {overtimeData.items.map((item, index) => {
                  const itemTotal = calculateItemTotal(item, overtimeData.salary);
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={item.item}
                          onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'item', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                          value={item.instances}
                          onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'instances', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                          value={item.days}
                          onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'days', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                          value={item.hours}
                          onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'hours', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                          value={item.people}
                          onChange={(e) => onUpdateOvertimeData(calcYear, 'items', index, 'people', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(overtimeRate)}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(itemTotal)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="danger" size="sm" onClick={() => deleteItem(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right">ยอดรวมทั้งหมด:</td>
                  <td className="px-4 py-3 text-right text-lg text-blue-600">{formatCurrency(total)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'assistance': return renderAssistanceSection();
      case 'special': return renderSpecialSection();
      case 'overtime': return renderOvertimeSection();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">จัดการเงินช่วยเหลือและค่าล่วงเวลา</h2>
              <p className="text-purple-100">คำนวณและจัดการเงินช่วยเหลือทุกประเภท</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Year Selection */}
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onYearChange(calcYear - 1)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="text-sm text-purple-100">คำนวณสำหรับปี</div>
                  <div className="font-bold">{calcYear}</div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onYearChange(calcYear + 1)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex-1 min-w-0 py-4 px-6 text-center font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {section.icon}
                  <span className="hidden sm:inline">{section.label}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    {section.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Content */}
      {renderContent()}
    </div>
  );
};