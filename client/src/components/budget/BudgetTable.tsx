import React, { useState, useEffect } from 'react';
import { BudgetItem } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Save, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  X
} from 'lucide-react';

interface BudgetTableProps {
  budgetData: BudgetItem[];
  currentYear: number;
  nextYear: number;
  onUpdateBudget: (index: number, year: number, value: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onYearChange: (currentYear: number, nextYear: number) => void;
  onSave: () => void;
  onExport: () => void;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
  budgetData,
  currentYear,
  nextYear,
  onUpdateBudget,
  onUpdateNotes,
  onYearChange,
  onSave,
  onExport
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleCellClick = (index: number, year: number, currentValue: number) => {
    const cellKey = `${index}-${year}`;
    setEditingCell(cellKey);
    setTempValue(currentValue.toString());
  };

  const handleCellSave = (index: number, year: number) => {
    const value = parseFloat(tempValue) || 0;
    onUpdateBudget(index, year, value);
    setEditingCell(null);
    setTempValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number, year: number) => {
    if (e.key === 'Enter') {
      handleCellSave(index, year);
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const calculateTotals = () => {
    const totalCurrent = budgetData.reduce((sum, item) => 
      sum + (item.values ? (item.values[currentYear] || 0) : 0), 0
    );
    const totalNext = budgetData.reduce((sum, item) => 
      sum + (item.values ? (item.values[nextYear] || 0) : 0), 0
    );
    const totalDiff = totalNext - totalCurrent;
    
    return { totalCurrent, totalNext, totalDiff };
  };

  const { totalCurrent, totalNext, totalDiff } = calculateTotals();
  const diffPercentage = totalCurrent > 0 ? ((totalDiff / totalCurrent) * 100) : 0;

  const getDiffIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getDiffClass = (diff: number) => {
    if (diff > 0) return "text-green-600 bg-green-50 border-green-200";
    if (diff < 0) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-500 bg-gray-50 border-gray-200";
  };

  const yearOptions = Array.from({ length: 13 }, (_, i) => 2568 + i);

  return (
    <Card className="overflow-hidden">
      {/* Header Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">ตารางงบประมาณประจำปี</h2>
            <p className="text-blue-100">จัดการและเปรียบเทียบงบประมาณระหว่างปี</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Year Selection */}
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onYearChange(currentYear - 1, nextYear - 1)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-sm text-blue-100">เปรียบเทียบ</div>
                <div className="font-bold">ปี {currentYear} vs {nextYear}</div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onYearChange(currentYear + 1, nextYear + 1)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
              <Button onClick={onExport} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                ส่งออก
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">งบประมาณปี {currentYear}</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalCurrent)}</div>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">คำของบประมาณปี {nextYear}</div>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(totalNext)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className={`rounded-xl p-4 border ${getDiffClass(totalDiff)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium flex items-center gap-1">
                  {getDiffIcon(totalDiff)}
                  ผลต่าง
                </div>
                <div className="text-2xl font-bold">
                  {totalDiff >= 0 ? '+' : ''}{formatCurrency(totalDiff)}
                </div>
                <div className="text-sm">
                  ({totalDiff >= 0 ? '+' : ''}{diffPercentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 w-32">ตัวชี้วัดส่วนกลาง</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 w-96">รายการ</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900 w-40">
                <div className="flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4" />
                  ปี {currentYear}
                </div>
              </th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900 w-40">
                <div className="flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4" />
                  ปี {nextYear}
                </div>
              </th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900 w-32">ผลต่าง</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900 w-48">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map((item, index) => {
              if (item.type) {
                const headerClass = item.type === 'main_header' 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold" 
                  : "bg-gradient-to-r from-blue-100 to-indigo-100 font-semibold text-blue-800";
                
                return (
                  <tr key={index} className={headerClass}>
                    <td colSpan={6} className="px-6 py-4 text-lg">{item.name}</td>
                  </tr>
                );
              }

              const currentValue = item.values?.[currentYear] || 0;
              const nextValue = item.values?.[nextYear] || 0;
              const diff = nextValue - currentValue;
              const diffClass = getDiffClass(diff);

              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  
                  {/* Current Year Cell */}
                  <td className="px-6 py-4">
                    {editingCell === `${index}-${currentYear}` ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="w-full p-2 text-right bg-blue-50 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleCellSave(index, currentYear)}
                          onKeyDown={(e) => handleKeyPress(e, index, currentYear)}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleCellSave(index, currentYear)} className="p-1 h-8 w-8">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleCellCancel} className="p-1 h-8 w-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="group/cell flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() => handleCellClick(index, currentYear, currentValue)}
                      >
                        <span className="font-medium text-right flex-1">{formatCurrency(currentValue)}</span>
                        <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover/cell:opacity-100 transition-opacity ml-2" />
                      </div>
                    )}
                  </td>
                  
                  {/* Next Year Cell */}
                  <td className="px-6 py-4">
                    {editingCell === `${index}-${nextYear}` ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="w-full p-2 text-right bg-green-50 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleCellSave(index, nextYear)}
                          onKeyDown={(e) => handleKeyPress(e, index, nextYear)}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleCellSave(index, nextYear)} className="p-1 h-8 w-8">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleCellCancel} className="p-1 h-8 w-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="group/cell flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all"
                        onClick={() => handleCellClick(index, nextYear, nextValue)}
                      >
                        <span className="font-medium text-right flex-1">{formatCurrency(nextValue)}</span>
                        <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover/cell:opacity-100 transition-opacity ml-2" />
                      </div>
                    )}
                  </td>
                  
                  {/* Difference Cell */}
                  <td className="px-6 py-4">
                    <div className={`p-3 rounded-lg border text-center ${diffClass}`}>
                      <div className="flex items-center justify-center gap-1 font-medium">
                        {getDiffIcon(diff)}
                        {formatCurrency(diff)}
                      </div>
                      {currentValue > 0 && (
                        <div className="text-xs mt-1">
                          ({diff >= 0 ? '+' : ''}{((diff / currentValue) * 100).toFixed(1)}%)
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Notes Cell */}
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={item.notes || ''}
                      onChange={(e) => onUpdateNotes(index, e.target.value)}
                      placeholder="หมายเหตุ..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          
          {/* Footer */}
          <tfoot className="bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-300">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-lg font-bold text-gray-900">ยอดรวมทั้งหมด</td>
              <td className="px-6 py-4 text-center">
                <div className="font-bold text-lg text-blue-900">{formatCurrency(totalCurrent)}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="font-bold text-lg text-green-900">{formatCurrency(totalNext)}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className={`font-bold text-lg ${totalDiff >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  <div className="flex items-center justify-center gap-1">
                    {getDiffIcon(totalDiff)}
                    {formatCurrency(totalDiff)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Instructions */}
      <div className="p-6 bg-blue-50 border-t border-blue-200">
        <div className="text-sm text-blue-700">
          <strong>วิธีใช้งาน:</strong> คลิกที่ช่องตัวเลขเพื่อแก้ไข • กด Enter เพื่อบันทึก • กด Escape เพื่อยกเลิก • ระบบจะคำนวณผลต่างอัตโนมัติ
        </div>
      </div>
    </Card>
  );
};