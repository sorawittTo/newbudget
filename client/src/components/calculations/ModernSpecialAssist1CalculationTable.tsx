import React, { useState } from 'react';
import { SpecialAssistData, SpecialAssistItem } from '../../types';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { formatCurrency } from '../../utils/calculations';
import { Save, ChevronLeft, ChevronRight, Plus, Trash2, Banknote, FileText, Calculator } from 'lucide-react';

interface ModernSpecialAssist1CalculationTableProps {
  calcYear: number;
  specialAssist1Data: SpecialAssistData;
  onYearChange: (year: number) => void;
  onUpdateItem: (year: number, index: number, key: string, value: any) => void;
  onUpdateNotes: (year: number, notes: string) => void;
  onSave: () => void;
}

export const ModernSpecialAssist1CalculationTable: React.FC<ModernSpecialAssist1CalculationTableProps> = ({
  calcYear,
  specialAssist1Data,
  onYearChange,
  onUpdateItem,
  onUpdateNotes,
  onSave
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddItem = () => {
    const newItem: SpecialAssistItem = {
      item: 'รายการใหม่',
      timesPerYear: 1,
      days: 1,
      people: 1,
      rate: 0
    };
    const items = [...specialAssist1Data.items, newItem];
    onUpdateItem(calcYear, items.length - 1, 'item', newItem.item);
  };

  const handleDeleteItem = (index: number) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      const items = specialAssist1Data.items.filter((_, i) => i !== index);
      // Update the items array by setting it through individual updates
      items.forEach((item, i) => {
        Object.entries(item).forEach(([key, value]) => {
          onUpdateItem(calcYear, i, key, value);
        });
      });
    }
  };

  const calculateItemTotal = (item: SpecialAssistItem): number => {
    return item.timesPerYear * item.days * item.people * item.rate;
  };

  const totalAmount = specialAssist1Data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">เงินช่วยเหลือพิเศษ</h2>
              <p className="text-slate-600">จัดการรายการเงินช่วยเหลือพิเศษประจำปี {calcYear}</p>
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

      {/* Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">ยอดรวมทั้งหมด</h3>
              <p className="text-sm text-slate-600">{specialAssist1Data.items.length} รายการ</p>
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
            <h3 className="text-lg font-bold text-slate-800">รายการเงินช่วยเหลือพิเศษ</h3>
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
            {specialAssist1Data.items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/80 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-slate-200/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">รายการ</label>
                    <NeumorphismInput
                      type="text"
                      value={item.item}
                      onChange={(e) => onUpdateItem(calcYear, index, 'item', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ครั้ง/ปี</label>
                    <NeumorphismInput
                      type="text"
                      value={item.timesPerYear}
                      onChange={(e) => onUpdateItem(calcYear, index, 'timesPerYear', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">วัน</label>
                    <NeumorphismInput
                      type="text"
                      value={item.days}
                      onChange={(e) => onUpdateItem(calcYear, index, 'days', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">คน</label>
                    <NeumorphismInput
                      type="text"
                      value={item.people}
                      onChange={(e) => onUpdateItem(calcYear, index, 'people', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">อัตรา (บาท)</label>
                    <NeumorphismInput
                      type="text"
                      value={item.rate}
                      onChange={(e) => onUpdateItem(calcYear, index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">รวม</label>
                      <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-emerald-200/30">
                        <span className="font-bold text-emerald-700">{formatCurrency(calculateItemTotal(item))}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="mt-2 w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800">หมายเหตุ</h3>
          </div>
        </div>
        <div className="p-6">
          <textarea
            value={specialAssist1Data.notes}
            onChange={(e) => onUpdateNotes(calcYear, e.target.value)}
            className="w-full h-32 p-4 bg-slate-50/80 border-0 rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-500 resize-none"
            placeholder="เพิ่มหมายเหตุเพิ่มเติม..."
          />
        </div>
      </div>
    </div>
  );
};