import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Eye,
  EyeOff,
  ArrowUpDown,
  Target,
  DollarSign
} from 'lucide-react';
import { BudgetItem } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataTable } from '../ui/DataTable';

interface ModernBudgetTableProps {
  budgetData: BudgetItem[];
  currentYear: number;
  nextYear: number;
  onUpdateBudget: (index: number, year: number, value: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onYearChange: (currentYear: number, nextYear: number) => void;
  onSave: () => void;
  onExport: () => void;
}

interface BudgetMetrics {
  totalCurrent: number;
  totalNext: number;
  totalDiff: number;
  diffPercentage: number;
  increaseItems: number;
  decreaseItems: number;
  noChangeItems: number;
}

export const ModernBudgetTable: React.FC<ModernBudgetTableProps> = ({
  budgetData,
  currentYear,
  nextYear,
  onUpdateBudget,
  onUpdateNotes,
  onYearChange,
  onSave,
  onExport
}) => {
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [globalEditMode, setGlobalEditMode] = useState(false);

  // Calculate comprehensive metrics
  const metrics = useMemo((): BudgetMetrics => {
    const dataItems = budgetData.filter(item => !item.type);
    
    const totalCurrent = dataItems.reduce((sum, item) => 
      sum + (item.values?.[currentYear] || 0), 0
    );
    
    const totalNext = dataItems.reduce((sum, item) => 
      sum + (item.values?.[nextYear] || 0), 0
    );
    
    const totalDiff = totalNext - totalCurrent;
    const diffPercentage = totalCurrent > 0 ? ((totalDiff / totalCurrent) * 100) : 0;
    
    const increaseItems = dataItems.filter(item => {
      const current = item.values?.[currentYear] || 0;
      const next = item.values?.[nextYear] || 0;
      return next > current;
    }).length;
    
    const decreaseItems = dataItems.filter(item => {
      const current = item.values?.[currentYear] || 0;
      const next = item.values?.[nextYear] || 0;
      return next < current;
    }).length;
    
    const noChangeItems = dataItems.filter(item => {
      const current = item.values?.[currentYear] || 0;
      const next = item.values?.[nextYear] || 0;
      return next === current;
    }).length;

    return {
      totalCurrent,
      totalNext,
      totalDiff,
      diffPercentage,
      increaseItems,
      decreaseItems,
      noChangeItems
    };
  }, [budgetData, currentYear, nextYear]);

  // Filter data
  const filteredData = useMemo(() => {
    let result = budgetData.filter(item => !item.type);

    // Category filter (based on code prefixes)
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.code?.startsWith(selectedCategory));
    }

    // Changes filter
    if (showOnlyChanges) {
      result = result.filter(item => {
        const current = item.values?.[currentYear] || 0;
        const next = item.values?.[nextYear] || 0;
        return current !== next;
      });
    }

    return result;
  }, [budgetData, selectedCategory, showOnlyChanges, currentYear, nextYear]);

  // Categories based on budget codes - clearly separated expense categories
  const categories = useMemo(() => {
    const codeMap: Record<string, string> = {
      'all': 'ทุกหมวดค่าใช้จ่าย',
      '52': 'หมวดที่ 1: ค่าใช้จ่ายบุคลากร',
      '53': 'หมวดที่ 2: ค่าใช้สอยและวัสดุ', 
      '54': 'หมวดที่ 3: ค่าสาธารณูปโภค',
      '55': 'หมวดที่ 4: เงินช่วยเหลือและเงินอุดหนุน',
      '56': 'หมวดที่ 5: ค่าใช้จ่ายในการเดินทาง',
      '57': 'หมวดที่ 6: ค่าใช้จ่ายในการฝึกอบรม',
      '10': 'หมวดที่ 7: ครุภัณฑ์',
      '16': 'หมวดที่ 8: ครุภัณฑ์เบ็ดเตล็ด',
      '25': 'หมวดที่ 9: ยานพาหนะและขนส่ง',
      '5': 'หมวดที่ 10: ปรับปรุงอาคารสถานที่'
    };

    const found = new Set<string>();
    budgetData.forEach(item => {
      if (item.code) {
        const prefix = item.code.substring(0, 2);
        if (codeMap[prefix]) found.add(prefix);
      }
    });

    return [
      { value: 'all', label: 'ทุกหมวดค่าใช้จ่าย' },
      ...Array.from(found).sort().map(prefix => ({
        value: prefix,
        label: codeMap[prefix]
      }))
    ];
  }, [budgetData]);

  const handleCellEdit = useCallback((index: number, year: number, currentValue: number) => {
    const cellKey = `${index}-${year}`;
    setEditingCell(cellKey);
    setTempValue(currentValue.toString());
  }, []);

  const handleCellSave = useCallback((index: number, year: number) => {
    const value = parseFloat(tempValue) || 0;
    onUpdateBudget(index, year, value);
    setEditingCell(null);
    setTempValue('');
  }, [tempValue, onUpdateBudget]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
    setTempValue('');
  }, []);

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
    <div className="space-y-6">
      {/* Modern Header with Metrics */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">ตารางงบประมาณขั้นสูง</h1>
            <p className="text-blue-100 text-lg">
              จัดการและวิเคราะห์งบประมาณระหว่างปี {currentYear} และ {nextYear}
            </p>
          </div>
          
          {/* Year Controls */}
          <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onYearChange(currentYear - 1, nextYear - 1)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center px-4">
              <div className="text-sm text-blue-100">เปรียบเทียบ</div>
              <div className="font-bold text-lg">ปี {currentYear} vs {nextYear}</div>
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
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-200" />
              <div>
                <p className="text-sm text-blue-200">งบประมาณปี {currentYear}</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.totalCurrent)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-200" />
              <div>
                <p className="text-sm text-blue-200">คำของบประมาณปี {nextYear}</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.totalNext)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {getDiffIcon(metrics.totalDiff)}
              <div>
                <p className="text-sm text-blue-200">ผลต่าง</p>
                <p className="text-xl font-bold">
                  {metrics.totalDiff >= 0 ? '+' : ''}{formatCurrency(metrics.totalDiff)}
                </p>
                <p className="text-xs text-blue-200">
                  ({metrics.totalDiff >= 0 ? '+' : ''}{metrics.diffPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-yellow-200" />
              <div>
                <p className="text-sm text-blue-200">รายการที่เปลี่ยนแปลง</p>
                <p className="text-xl font-bold">{metrics.increaseItems + metrics.decreaseItems}</p>
                <p className="text-xs text-blue-200">
                  เพิ่ม {metrics.increaseItems} | ลด {metrics.decreaseItems}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Toggle Filters */}
            <Button
              variant={showOnlyChanges ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowOnlyChanges(!showOnlyChanges)}
            >
              {showOnlyChanges ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              แสดงเฉพาะที่เปลี่ยนแปลง
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setGlobalEditMode(!globalEditMode)}
              variant={globalEditMode ? "secondary" : "primary"}
              className={globalEditMode 
                ? "bg-orange-600 hover:bg-orange-700 text-white" 
                : "bg-purple-600 hover:bg-purple-700 text-white"
              }
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {globalEditMode ? 'ปิดการแก้ไข' : 'เปิดการแก้ไข'}
            </Button>
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
            <Button onClick={onExport} variant="secondary">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              ส่งออก
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left font-semibold text-gray-900 w-24">
                  รหัสงบประมาณ
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-900 w-24">
                  รหัสบัญชี
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 w-80">
                  รายการ
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900 w-40">
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="w-4 h-4" />
                    ปี {currentYear}
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900 w-40">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    ปี {nextYear}
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900 w-32">
                  ผลต่าง
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900 w-48">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredData.map((item, index) => {
                  const actualIndex = budgetData.findIndex(budgetItem => budgetItem === item);
                  const currentValue = item.values?.[currentYear] || 0;
                  const nextValue = item.values?.[nextYear] || 0;
                  const diff = nextValue - currentValue;
                  const diffPercentage = currentValue > 0 ? ((diff / currentValue) * 100) : 0;

                  return (
                    <motion.tr
                      key={actualIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200 group"
                    >
                      {/* Budget Code */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-lg text-blue-800 font-medium">
                          {item.code}
                        </span>
                      </td>

                      {/* Account Code */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-lg text-green-800 font-medium">
                          {item.code}
                        </span>
                      </td>

                      {/* Item Name */}
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>

                      {/* Current Year Value */}
                      <td className="px-6 py-4">
                        {globalEditMode || editingCell === `${actualIndex}-${currentYear}` ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="w-full p-2 text-right bg-blue-50 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={editingCell === `${actualIndex}-${currentYear}` ? tempValue : currentValue}
                              onChange={(e) => {
                                if (globalEditMode) {
                                  onUpdateBudget(actualIndex, currentYear, parseFloat(e.target.value) || 0);
                                } else {
                                  setTempValue(e.target.value);
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !globalEditMode) handleCellSave(actualIndex, currentYear);
                                if (e.key === 'Escape' && !globalEditMode) handleCellCancel();
                              }}
                              autoFocus={editingCell === `${actualIndex}-${currentYear}`}
                            />
                            {!globalEditMode && (
                              <div className="flex gap-1">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleCellSave(actualIndex, currentYear)}
                                  className="p-1"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleCellCancel}
                                  className="p-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`text-right font-mono text-lg p-2 rounded transition-colors ${
                              globalEditMode ? 'cursor-pointer hover:bg-blue-100' : 'cursor-not-allowed text-gray-400'
                            }`}
                            onClick={() => globalEditMode && handleCellEdit(actualIndex, currentYear, currentValue)}
                          >
                            {formatCurrency(currentValue)}
                          </div>
                        )}
                      </td>

                      {/* Next Year Value */}
                      <td className="px-6 py-4">
                        {globalEditMode || editingCell === `${actualIndex}-${nextYear}` ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="w-full p-2 text-right bg-green-50 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              value={editingCell === `${actualIndex}-${nextYear}` ? tempValue : nextValue}
                              onChange={(e) => {
                                if (globalEditMode) {
                                  onUpdateBudget(actualIndex, nextYear, parseFloat(e.target.value) || 0);
                                } else {
                                  setTempValue(e.target.value);
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !globalEditMode) handleCellSave(actualIndex, nextYear);
                                if (e.key === 'Escape' && !globalEditMode) handleCellCancel();
                              }}
                              autoFocus={editingCell === `${actualIndex}-${nextYear}`}
                            />
                            {!globalEditMode && (
                              <div className="flex gap-1">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleCellSave(actualIndex, nextYear)}
                                  className="p-1"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleCellCancel}
                                  className="p-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`text-right font-mono text-lg p-2 rounded transition-colors ${
                              globalEditMode ? 'cursor-pointer hover:bg-green-100' : 'cursor-not-allowed text-gray-400'
                            }`}
                            onClick={() => globalEditMode && handleCellEdit(actualIndex, nextYear, nextValue)}
                          >
                            {formatCurrency(nextValue)}
                          </div>
                        )}
                      </td>

                      {/* Difference */}
                      <td className="px-6 py-4">
                        <div className={`text-center p-3 rounded-lg border ${getDiffClass(diff)}`}>
                          <div className="flex items-center justify-center gap-1 font-medium">
                            {getDiffIcon(diff)}
                            <span>
                              {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                            </span>
                          </div>
                          {currentValue > 0 && (
                            <div className="text-xs mt-1">
                              ({diff >= 0 ? '+' : ''}{diffPercentage.toFixed(1)}%)
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            !globalEditMode ? 'cursor-not-allowed bg-gray-100 text-gray-400' : ''
                          }`}
                          placeholder="เพิ่มหมายเหตุ..."
                          value={item.notes || ''}
                          onChange={(e) => globalEditMode && onUpdateNotes(actualIndex, e.target.value)}
                          disabled={!globalEditMode}
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              แสดง {filteredData.length} รายการ จากทั้งหมด {budgetData.filter(item => !item.type).length} รายการ
            </div>
            <div className="text-lg font-bold text-gray-900">
              รวมผลต่าง: <span className={metrics.totalDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
                {metrics.totalDiff >= 0 ? '+' : ''}{formatCurrency(metrics.totalDiff)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};