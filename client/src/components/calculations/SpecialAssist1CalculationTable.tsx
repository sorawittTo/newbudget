import React, { useState } from 'react';
import { SpecialAssistData, SpecialAssistItem } from '../../types';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { formatCurrency } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X, ChevronLeft, ChevronRight, Plus, Trash2, Banknote } from 'lucide-react';

interface SpecialAssist1CalculationTableProps {
  calcYear: number;
  specialAssist1Data: SpecialAssistData;
  onYearChange: (year: number) => void;
  onUpdateItem: (year: number, index: number, key: string, value: any) => void;
  onUpdateNotes: (year: number, notes: string) => void;
  onSave: () => void;
}

export const SpecialAssist1CalculationTable: React.FC<SpecialAssist1CalculationTableProps> = ({
  calcYear,
  specialAssist1Data,
  onYearChange,
  onUpdateItem,
  onUpdateNotes,
  onSave
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  const handleEditStart = (index: number, field: string, currentValue: any) => {
    const key = `${index}_${field}`;
    setEditingValues(prev => ({ ...prev, [key]: currentValue }));
    setEditMode(prev => ({ ...prev, [key]: true }));
  };

  const handleEditSave = (index: number, field: string) => {
    const key = `${index}_${field}`;
    const newValue = editingValues[key];
    
    if (newValue !== undefined) {
      onUpdateItem(calcYear, index, field, newValue);
    }
    
    setEditMode(prev => ({ ...prev, [key]: false }));
    setEditingValues(prev => ({ ...prev, [key]: undefined }));
  };

  const handleEditCancel = (index: number, field: string) => {
    const key = `${index}_${field}`;
    setEditMode(prev => ({ ...prev, [key]: false }));
    setEditingValues(prev => ({ ...prev, [key]: undefined }));
  };

  const renderEditableValue = (index: number, field: string, currentValue: any, isText = false) => {
    const key = `${index}_${field}`;
    const isEditing = editMode[key];
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type={isText ? "text" : "number"}
            className="w-full p-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            value={editingValues[key] !== undefined ? editingValues[key] : currentValue}
            onChange={(e) => setEditingValues(prev => ({ 
              ...prev, 
              [key]: isText ? e.target.value : (parseFloat(e.target.value) || 0)
            }))}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleEditSave(index, field)}
            className="p-1 h-6 w-6"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditCancel(index, field)}
            className="p-1 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className="flex-1">{isText ? currentValue : formatCurrency(currentValue)}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleEditStart(index, field, currentValue)}
          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-50 hover:opacity-100"
          title="แก้ไข"
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  const calculateTotal = () => {
    return specialAssist1Data.items.reduce((sum, item) => {
      return sum + (item.timesPerYear * item.days * item.people * item.rate);
    }, 0);
  };

  const addNewItem = () => {
    const newItem: SpecialAssistItem = {
      item: 'รายการใหม่',
      timesPerYear: 1,
      days: 1,
      people: 1,
      rate: 250
    };
    
    const newIndex = specialAssist1Data.items.length;
    onUpdateItem(calcYear, newIndex, 'item', newItem.item);
    onUpdateItem(calcYear, newIndex, 'timesPerYear', newItem.timesPerYear);
    onUpdateItem(calcYear, newIndex, 'days', newItem.days);
    onUpdateItem(calcYear, newIndex, 'people', newItem.people);
    onUpdateItem(calcYear, newIndex, 'rate', newItem.rate);
  };

  const deleteItem = (index: number) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      // Create new array without the deleted item
      const newItems = specialAssist1Data.items.filter((_, i) => i !== index);
      // Update all items with new indices
      newItems.forEach((item, newIndex) => {
        Object.keys(item).forEach(key => {
          onUpdateItem(calcYear, newIndex, key, item[key as keyof SpecialAssistItem]);
        });
      });
      // Clear the last item if array got smaller
      if (newItems.length < specialAssist1Data.items.length) {
        const lastIndex = specialAssist1Data.items.length - 1;
        onUpdateItem(calcYear, lastIndex, 'item', '');
      }
    }
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            เงินช่วยเหลือพิเศษ
          </h3>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onYearChange(calcYear - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              ปีก่อนหน้า
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-xl font-bold text-blue-600">{calcYear}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onYearChange(calcYear + 1)}
            >
              ปีถัดไป
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">รายการเงินช่วยเหลือพิเศษ:</p>
              <ul className="space-y-1 text-xs">
                <li>• ค่าใช้จ่ายสำหรับงานพิเศษและการควบคุมงานต่างๆ</li>
                <li>• สามารถแก้ไขรายการ จำนวนครั้ง วัน คน และอัตราได้</li>
                <li>• คำนวณจาก: จำนวนครั้งต่อปี × จำนวนวัน × จำนวนคน × อัตราต่อวัน</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={addNewItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มรายการ
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">รายการ</th>
              <th className="px-4 py-3 text-center">จำนวนครั้งต่อปี</th>
              <th className="px-4 py-3 text-center">จำนวนวัน</th>
              <th className="px-4 py-3 text-center">จำนวนคน</th>
              <th className="px-4 py-3 text-right">อัตราต่อวัน (บาท)</th>
              <th className="px-4 py-3 text-right">รวม (บาท)</th>
              <th className="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {specialAssist1Data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-8">
                  ไม่มีรายการ
                </td>
              </tr>
            ) : (
              specialAssist1Data.items.map((item, index) => {
                const itemTotal = item.timesPerYear * item.days * item.people * item.rate;
                
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {renderEditableValue(index, 'item', item.item, true)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue(index, 'timesPerYear', item.timesPerYear)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue(index, 'days', item.days)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue(index, 'people', item.people)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {renderEditableValue(index, 'rate', item.rate)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(itemTotal)}
                      <div className="text-xs text-gray-500 mt-1">
                        ({item.timesPerYear} × {item.days} × {item.people} × {formatCurrency(item.rate)})
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteItem(index)}
                        className="p-1 h-6 w-6"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={specialAssist1Data.notes || ''}
            onChange={(e) => onUpdateNotes(calcYear, e.target.value)}
            placeholder="ระบุหมายเหตุเพิ่มเติม..."
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">ยอดรวมทั้งหมด:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculateTotal())} บาท
            </span>
          </div>
          <div className="flex gap-4">
            <Button onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};