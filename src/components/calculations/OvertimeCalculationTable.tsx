import React, { useState } from 'react';
import { OvertimeData, OvertimeItem, Holiday } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface OvertimeCalculationTableProps {
  calcYear: number;
  overtimeData: OvertimeData;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onUpdateData: (year: number, field: string, indexOrValue: any, key?: string, value?: any) => void;
  onSave: () => void;
}

export const OvertimeCalculationTable: React.FC<OvertimeCalculationTableProps> = ({
  calcYear,
  overtimeData,
  holidaysData,
  onYearChange,
  onUpdateData,
  onSave
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  const yearCE = calcYear - 543;
  const holidays = holidaysData[yearCE] || [];

  const handleEditStart = (field: string, currentValue: any, index?: number) => {
    const key = index !== undefined ? `${index}_${field}` : field;
    setEditingValues(prev => ({ ...prev, [key]: currentValue }));
    setEditMode(prev => ({ ...prev, [key]: true }));
  };

  const handleEditSave = (field: string, index?: number) => {
    const key = index !== undefined ? `${index}_${field}` : field;
    const newValue = editingValues[key];
    
    if (newValue !== undefined) {
      if (index !== undefined) {
        onUpdateData(calcYear, 'items', index, field, newValue);
      } else {
        onUpdateData(calcYear, field, newValue);
      }
    }
    
    setEditMode(prev => ({ ...prev, [key]: false }));
    setEditingValues(prev => ({ ...prev, [key]: undefined }));
  };

  const handleEditCancel = (field: string, index?: number) => {
    const key = index !== undefined ? `${index}_${field}` : field;
    setEditMode(prev => ({ ...prev, [key]: false }));
    setEditingValues(prev => ({ ...prev, [key]: undefined }));
  };

  const renderEditableValue = (field: string, currentValue: any, index?: number, isText = false) => {
    const key = index !== undefined ? `${index}_${field}` : field;
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
            onClick={() => handleEditSave(field, index)}
            className="p-1 h-6 w-6"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditCancel(field, index)}
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
          onClick={() => handleEditStart(field, currentValue, index)}
          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-50 hover:opacity-100"
          title="แก้ไข"
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  const calculateOvertimeRate = (salary: number) => {
    const dailyRate = salary / 30;
    const hourlyRate = dailyRate / 8;
    return hourlyRate * 1.5; // 1.5 times for overtime
  };

  const calculateItemTotal = (item: OvertimeItem, salary: number) => {
    const overtimeRate = calculateOvertimeRate(salary);
    return item.instances * item.days * item.hours * item.people * overtimeRate;
  };

  const calculateTotal = () => {
    return overtimeData.items.reduce((sum, item) => {
      return sum + calculateItemTotal(item, overtimeData.salary);
    }, 0);
  };

  const addNewItem = () => {
    const newItem: OvertimeItem = {
      item: 'รายการใหม่',
      instances: 1,
      days: 1,
      hours: 8,
      people: 1
    };
    
    const newIndex = overtimeData.items.length;
    onUpdateData(calcYear, 'items', newIndex, 'item', newItem.item);
    onUpdateData(calcYear, 'items', newIndex, 'instances', newItem.instances);
    onUpdateData(calcYear, 'items', newIndex, 'days', newItem.days);
    onUpdateData(calcYear, 'items', newIndex, 'hours', newItem.hours);
    onUpdateData(calcYear, 'items', newIndex, 'people', newItem.people);
  };

  const deleteItem = (index: number) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      const newItems = overtimeData.items.filter((_, i) => i !== index);
      newItems.forEach((item, newIndex) => {
        Object.keys(item).forEach(key => {
          onUpdateData(calcYear, 'items', newIndex, key, item[key as keyof OvertimeItem]);
        });
      });
    }
  };

  // Calculate consecutive holiday patterns for reference
  const getConsecutiveHolidayStats = () => {
    if (holidays.length === 0) return { 3: 0, 4: 0, 5: 0 };
    
    let consecutiveCounts = { 3: 0, 4: 0, 5: 0 };
    let consecutive = 0;
    
    for (let i = 0; i < holidays.length; i++) {
      const currentDay = new Date(holidays[i].date).getTime();
      const prevDay = i > 0 ? new Date(holidays[i-1].date).getTime() : 0;
      
      if (i > 0 && (currentDay - prevDay) / (1000 * 3600 * 24) === 1) {
        consecutive++;
      } else {
        if (consecutive >= 3 && consecutive <= 5) {
          consecutiveCounts[consecutive as keyof typeof consecutiveCounts]++;
        }
        consecutive = 1;
      }
    }
    if (consecutive >= 3 && consecutive <= 5) {
      consecutiveCounts[consecutive as keyof typeof consecutiveCounts]++;
    }
    
    return consecutiveCounts;
  };

  const consecutiveStats = getConsecutiveHolidayStats();
  const overtimeRate = calculateOvertimeRate(overtimeData.salary);

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            ค่าล่วงเวลาทำงานวันหยุด
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
              <p className="font-semibold mb-2">การคำนวณค่าล่วงเวลา:</p>
              <ul className="space-y-1 text-xs">
                <li>• อัตราล่วงเวลา = (เงินเดือน ÷ 30 วัน ÷ 8 ชั่วโมง) × 1.5</li>
                <li>• คำนวณจาก: จำนวนครั้ง × จำนวนวัน × จำนวนชั่วโมง × จำนวนคน × อัตราล่วงเวลา</li>
                <li>• ข้อมูลวันหยุดยาวอ้างอิงจากปี {calcYear - 1}: {consecutiveStats[3]} ครั้ง (3 วัน), {consecutiveStats[4]} ครั้ง (4 วัน), {consecutiveStats[5]} ครั้ง (5 วัน)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-yellow-800">เงินเดือนอ้างอิง</h5>
              <p className="text-sm text-yellow-700">ใช้สำหรับคำนวณอัตราล่วงเวลา</p>
            </div>
            <div className="text-right">
              {renderEditableValue('salary', overtimeData.salary)}
              <div className="text-xs text-orange-600 mt-1">แก้ไขได้</div>
              <div className="text-xs text-gray-600 mt-1">
                อัตราล่วงเวลา: {formatCurrency(overtimeRate)}/ชั่วโมง
              </div>
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
              <th className="px-4 py-3 text-center">จำนวนครั้ง</th>
              <th className="px-4 py-3 text-center">จำนวนวัน</th>
              <th className="px-4 py-3 text-center">จำนวนชั่วโมง</th>
              <th className="px-4 py-3 text-center">จำนวนคน</th>
              <th className="px-4 py-3 text-right">อัตราล่วงเวลา (บาท/ชม.)</th>
              <th className="px-4 py-3 text-right">รวม (บาท)</th>
              <th className="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {overtimeData.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-8">
                  ไม่มีรายการ
                </td>
              </tr>
            ) : (
              overtimeData.items.map((item, index) => {
                const itemTotal = calculateItemTotal(item, overtimeData.salary);
                
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {renderEditableValue('item', item.item, index, true)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue('instances', item.instances, index)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue('days', item.days, index)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue('hours', item.hours, index)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderEditableValue('people', item.people, index)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(overtimeRate)}</div>
                      <div className="text-xs text-blue-600">คำนวณอัตโนมัติ</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(itemTotal)}
                      <div className="text-xs text-gray-500 mt-1">
                        ({item.instances} × {item.days} × {item.hours} × {item.people} × {formatCurrency(overtimeRate)})
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

      <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
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
    </Card>
  );
};