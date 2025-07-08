import React, { useState } from 'react';
import { OvertimeData, OvertimeItem, Holiday } from '../../types';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { formatCurrency } from '../../utils/calculations';
import { Save, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Calculator, Info } from 'lucide-react';

interface ModernOvertimeCalculationTableProps {
  calcYear: number;
  overtimeData: OvertimeData;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onUpdateData: (year: number, field: string, indexOrValue: any, key?: string, value?: any) => void;
  onSave: () => void;
}

export const ModernOvertimeCalculationTable: React.FC<ModernOvertimeCalculationTableProps> = ({
  calcYear,
  overtimeData,
  holidaysData,
  onYearChange,
  onUpdateData,
  onSave
}) => {
  const yearCE = calcYear - 543;
  const holidays = holidaysData[yearCE] || [];

  const handleAddItem = () => {
    const newItem: OvertimeItem = {
      item: '',
      instances: 1,
      days: 1,
      hours: 8,
      people: 1,
      rate: overtimeData.salary / 210 // OT rate = salary / 210
    };
    const currentItems = overtimeData.items || [];
    const newIndex = currentItems.length;
    
    Object.entries(newItem).forEach(([key, value]) => {
      onUpdateData(calcYear, 'items', newIndex, key, value);
    });
  };

  const handleDeleteItem = (index: number) => {
    const currentItems = overtimeData.items || [];
    if (currentItems.length <= 1) {
      alert('ต้องมีอย่างน้อย 1 รายการ');
      return;
    }
    
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      const newItems = currentItems.filter((_, i) => i !== index);
      
      // Clear all items first
      currentItems.forEach((_, i) => {
        Object.keys(currentItems[i]).forEach(key => {
          onUpdateData(calcYear, 'items', i, key, undefined);
        });
      });
      
      // Add back the remaining items
      newItems.forEach((item, i) => {
        Object.entries(item).forEach(([key, value]) => {
          onUpdateData(calcYear, 'items', i, key, value);
        });
      });
    }
  };

  const calculateItemTotal = (item: OvertimeItem, salary: number): number => {
    const otRate = item.rate || (salary / 210);
    return item.days * item.hours * item.people * otRate;
  };

  const totalAmount = (overtimeData.items || []).reduce((sum, item) => sum + calculateItemTotal(item, overtimeData.salary), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">ค่าล่วงเวลาวันหยุด</h2>
              <p className="text-slate-600">จัดการค่าล่วงเวลาวันหยุดประจำปี {calcYear}</p>
            </div>
          </div>

          {/* Year Navigation and Save */}
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

      {/* Salary Setting */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">เงินเดือนอ้างอิง</h3>
            <p className="text-sm text-slate-600">เงินเดือนที่ใช้ในการคำนวณค่าล่วงเวลา</p>
          </div>
          <div className="w-64">
            <NeumorphismInput
              type="text"
              value={overtimeData.salary}
              onChange={(e) => onUpdateData(calcYear, 'salary', parseFloat(e.target.value) || 0)}
              className="w-full text-lg font-bold text-right"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">ยอดรวมค่าล่วงเวลา</h3>
              <p className="text-sm text-slate-600">{(overtimeData.items || []).length} รายการ • วันหยุด {holidays.length} วัน</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(totalAmount)}</div>
            <div className="text-sm text-slate-600">บาท</div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">รายการค่าล่วงเวลา</h3>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการ
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {(overtimeData.items || []).map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/80 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-slate-200/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">วัน</label>
                    <NeumorphismInput
                      type="text"
                      value={item.days}
                      onChange={(e) => onUpdateData(calcYear, 'items', index, 'days', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ชั่วโมง</label>
                    <NeumorphismInput
                      type="text"
                      value={item.hours}
                      onChange={(e) => onUpdateData(calcYear, 'items', index, 'hours', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">คน</label>
                    <NeumorphismInput
                      type="text"
                      value={item.people}
                      onChange={(e) => onUpdateData(calcYear, 'items', index, 'people', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">อัตรา/ชม.</label>
                    <NeumorphismInput
                      type="text"
                      value={item.rate || (overtimeData.salary / 210)}
                      onChange={(e) => onUpdateData(calcYear, 'items', index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">รวม</label>
                    <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-emerald-200/30">
                      <span className="font-bold text-emerald-700">{formatCurrency(calculateItemTotal(item, overtimeData.salary))}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-center">
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                      disabled={(overtimeData.items || []).length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="p-6 border-t border-slate-200/50">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">หมายเหตุ</label>
            <NeumorphismInput
              type="text"
              value={overtimeData.notes || ''}
              onChange={(e) => onUpdateData(calcYear, 'notes', e.target.value)}
              className="w-full"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
            />
          </div>
        </div>
      </div>

      {/* Holiday Info */}
      <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-amber-200/50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">วันหยุดประจำปี {calcYear}</h3>
            <p className="text-sm text-amber-700 mb-3">วันหยุดที่ใช้ในการคำนวณค่าล่วงเวลา: {holidays.length} วัน</p>
            <div className="flex flex-wrap gap-2">
              {holidays.slice(0, 6).map((holiday, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200"
                >
                  {holiday.name}
                </span>
              ))}
              {holidays.length > 6 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200">
                  และอีก {holidays.length - 6} วัน...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};