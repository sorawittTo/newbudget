import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetItem } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileSpreadsheet,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Edit3,
  Banknote,
  BarChart3,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X
} from 'lucide-react';

interface BudgetTableProps {
  budgetData: BudgetItem[];
  currentYear: number;
  nextYear: number;
  onUpdateBudget: (index: number, year: number, value: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onUpdateBudgetField: (index: number, field: string, value: string) => void;
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

export const NeumorphismBudgetTable: React.FC<BudgetTableProps> = ({
  budgetData,
  currentYear,
  nextYear,
  onUpdateBudget,
  onUpdateNotes,
  onUpdateBudgetField,
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

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals = new Map<string, { current: number; next: number }>();
    
    budgetData.forEach(item => {
      if (item.type === 'header' && !item.type.includes('main_header')) {
        const headerName = item.name;
        const categoryItems = budgetData.filter(dataItem => {
          if (dataItem.type) return false;
          const itemIndex = budgetData.findIndex(i => i === dataItem);
          const headerIndex = budgetData.findIndex(i => i === item);
          const nextHeaderIndex = budgetData.findIndex((i, idx) => 
            idx > headerIndex && (i.type === 'header' || i.type === 'main_header')
          );
          return itemIndex > headerIndex && (nextHeaderIndex === -1 || itemIndex < nextHeaderIndex);
        });
        
        const currentTotal = categoryItems.reduce((sum, item) => sum + (item.values?.[currentYear] || 0), 0);
        const nextTotal = categoryItems.reduce((sum, item) => sum + (item.values?.[nextYear] || 0), 0);
        
        totals.set(headerName, { current: currentTotal, next: nextTotal });
      }
    });
    
    return totals;
  }, [budgetData, currentYear, nextYear]);

  // Filter data with category headers and totals
  const filteredData = useMemo(() => {
    let result: BudgetItem[] = [];

    if (selectedCategory === 'all') {
      // Show all data with category headers and totals
      result = budgetData.filter(item => {
        if (!showOnlyChanges) return true;
        if (item.type) return true; // Always include headers
        
        const current = item.values?.[currentYear] || 0;
        const next = item.values?.[nextYear] || 0;
        return current !== next;
      });
    } else {
      // Show specific category with its header
      const categoryHeader = budgetData.find(item => 
        item.type === 'header' && 
        budgetData.some(dataItem => 
          !dataItem.type && 
          dataItem.code?.startsWith(selectedCategory)
        )
      );
      
      if (categoryHeader) {
        result.push(categoryHeader);
      }
      
      const categoryItems = budgetData.filter(item => 
        !item.type && item.code?.startsWith(selectedCategory)
      );
      
      if (showOnlyChanges) {
        const filteredItems = categoryItems.filter(item => {
          const current = item.values?.[currentYear] || 0;
          const next = item.values?.[nextYear] || 0;
          return current !== next;
        });
        result.push(...filteredItems);
      } else {
        result.push(...categoryItems);
      }
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
    if (!globalEditMode) return;
    const cellKey = `${index}-${year}`;
    setEditingCell(cellKey);
    setTempValue(currentValue.toString());
  }, [globalEditMode]);

  const handleCellSave = useCallback((index: number, year: number) => {
    const numValue = parseFloat(tempValue) || 0;
    onUpdateBudget(index, year, numValue);
    setEditingCell(null);
    setTempValue('');
  }, [tempValue, onUpdateBudget]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
    setTempValue('');
  }, []);

  const getDiffIcon = (diff: number) => {
    if (diff > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
    if (diff < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Modern Header with Soft Shadows */}
        <div className="relative">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] border border-white/20">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="text-4xl font-light text-slate-800 mb-3">
                  ตารางงบประมาณ
                </h1>
                <p className="text-slate-600 text-lg font-light">
                  จัดการและวิเคราะห์งบประมาณ ปี {currentYear} และ {nextYear}
                </p>
              </div>
              
              {/* Year Navigation with Neumorphism */}
              <div className="flex items-center gap-4">
                <div className="bg-white/50 rounded-2xl p-4 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onYearChange(currentYear - 1, nextYear - 1)}
                      className="w-10 h-10 rounded-xl bg-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all duration-300 hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="text-center px-4">
                      <div className="text-sm text-slate-500 font-light">เปรียบเทียบ</div>
                      <div className="font-medium text-slate-700">ปี {currentYear} vs {nextYear}</div>
                    </div>
                    
                    <button
                      onClick={() => onYearChange(currentYear + 1, nextYear + 1)}
                      className="w-10 h-10 rounded-xl bg-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all duration-300 hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Year Budget */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-[15px_15px_30px_#d1d5db,-15px_-15px_30px_#ffffff] border border-white/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 shadow-[inset_6px_6px_12px_#bfdbfe,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-light">งบประมาณปี {currentYear}</p>
                <p className="text-xl font-medium text-slate-700">{formatCurrency(metrics.totalCurrent)}</p>
              </div>
            </div>
          </div>

          {/* Next Year Budget */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-[15px_15px_30px_#d1d5db,-15px_-15px_30px_#ffffff] border border-white/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 shadow-[inset_6px_6px_12px_#a7f3d0,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-light">งบประมาณปี {nextYear}</p>
                <p className="text-xl font-medium text-slate-700">{formatCurrency(metrics.totalNext)}</p>
              </div>
            </div>
          </div>

          {/* Budget Difference */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-[15px_15px_30px_#d1d5db,-15px_-15px_30px_#ffffff] border border-white/30">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center ${
                metrics.totalDiff >= 0 ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {metrics.totalDiff >= 0 ? 
                  <TrendingUp className="w-6 h-6 text-emerald-600" /> : 
                  <TrendingDown className="w-6 h-6 text-red-500" />
                }
              </div>
              <div>
                <p className="text-sm text-slate-500 font-light">ผลต่าง</p>
                <p className={`text-xl font-medium ${metrics.totalDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {metrics.totalDiff >= 0 ? '+' : ''}{formatCurrency(metrics.totalDiff)}
                </p>
                <p className="text-xs text-slate-400">
                  ({metrics.totalDiff >= 0 ? '+' : ''}{metrics.diffPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Items Statistics */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-[15px_15px_30px_#d1d5db,-15px_-15px_30px_#ffffff] border border-white/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 shadow-[inset_6px_6px_12px_#ddd6fe,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-light">รายการเปลี่ยนแปลง</p>
                <p className="text-xl font-medium text-slate-700">{metrics.increaseItems + metrics.decreaseItems}</p>
                <p className="text-xs text-slate-400">
                  เพิ่ม {metrics.increaseItems} | ลด {metrics.decreaseItems}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-[15px_15px_30px_#d1d5db,-15px_-15px_30px_#ffffff] border border-white/30">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
                  <Filter className="w-4 h-4 text-slate-600" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Changes Filter */}
              <button
                onClick={() => setShowOnlyChanges(!showOnlyChanges)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  showOnlyChanges 
                    ? 'bg-blue-100 shadow-[inset_6px_6px_12px_#bfdbfe,inset_-6px_-6px_12px_#ffffff] text-blue-700' 
                    : 'bg-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] text-slate-600 hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]'
                }`}
              >
                {showOnlyChanges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-sm font-medium">แสดงเฉพาะที่เปลี่ยนแปลง</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {globalEditMode && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3 shadow-[inset_4px_4px_8px_#bfdbfe,inset_-4px_-4px_8px_#ffffff]">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm font-medium">เมื่อเปิดการแก้ไข สามารถแก้ไขได้ทุกช่องในตาราง</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setGlobalEditMode(!globalEditMode)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                    globalEditMode 
                      ? "bg-orange-100 shadow-[inset_8px_8px_16px_#fed7aa,inset_-8px_-8px_16px_#ffffff] text-orange-700" 
                      : "bg-purple-100 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] text-purple-700 hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  {globalEditMode ? 'ปิดการแก้ไข' : 'เปิดการแก้ไข'}
                </button>
              
                <button 
                  onClick={onSave}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
                
                <button 
                  onClick={onExport}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  ส่งออก
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Data Table */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-700 to-purple-800 border-b-4 border-indigo-900 shadow-[0_10px_40px_rgba(67,56,202,0.8)]">
                <tr className="h-20">
                  <th className="px-4 py-4 text-left font-bold text-white tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <Layers className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">รหัสงบประมาณ</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-white tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <Layers className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">รหัสบัญชี</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-white tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <FileSpreadsheet className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">รายการ</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-white tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <Calculator className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">ปี {currentYear}</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-white tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <Target className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">ปี {nextYear}</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-white tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">ผลต่าง</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-white tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/25 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.15),inset_-6px_-6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center backdrop-blur-sm">
                        <FileSpreadsheet className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-white text-base font-extrabold drop-shadow-lg">หมายเหตุ</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredData.map((item, index) => {
                    const actualIndex = budgetData.findIndex(budgetItem => budgetItem === item);
                    
                    // Render category headers
                    if (item.type === 'main_header') {
                      return (
                        <motion.tr
                          key={actualIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className="bg-gradient-to-r from-blue-200/90 to-indigo-200/90 backdrop-blur-sm border-y-2 border-blue-400/60 shadow-[0_6px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.35)] transition-all duration-300"
                        >
                          <td colSpan={7} className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[8px_8px_16px_#93c5fd,-8px_-8px_16px_#ffffff] flex items-center justify-center">
                                <Banknote className="w-5 h-5 text-white" />
                              </div>
                              <h2 className="text-lg font-bold text-blue-900 tracking-wide drop-shadow-sm">{item.name}</h2>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }

                    if (item.type === 'header') {
                      const totals = categoryTotals.get(item.name);
                      const totalDiff = totals ? totals.next - totals.current : 0;
                      
                      return (
                        <motion.tr
                          key={actualIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className="bg-gradient-to-r from-indigo-200/95 to-blue-300/95 backdrop-blur-sm border-t-2 border-b-2 border-indigo-400/70 shadow-[0_6px_20px_rgba(67,56,202,0.4)] hover:shadow-[0_8px_25px_rgba(67,56,202,0.5)] transition-all duration-300"
                        >
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[6px_6px_12px_#a5b4fc,-6px_-6px_12px_#ffffff] flex items-center justify-center">
                                <Layers className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-bold text-indigo-700 tracking-wide">หมวด</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-50 shadow-[inset_3px_3px_6px_#ddd6fe,inset_-3px_-3px_6px_#ffffff] text-purple-700 font-mono text-xs font-bold">
                              TOTAL
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <h3 className="text-base font-bold text-indigo-800 tracking-wide">{item.name}</h3>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {totals ? (
                              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg shadow-[6px_6px_12px_#a7f3d0,-6px_-6px_12px_#ffffff] border border-emerald-200/50">
                                <div className="text-lg font-bold text-emerald-700">
                                  {formatCurrency(totals.current)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400">-</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {totals ? (
                              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg shadow-[6px_6px_12px_#93c5fd,-6px_-6px_12px_#ffffff] border border-blue-200/50">
                                <div className="text-lg font-bold text-blue-700">
                                  {formatCurrency(totals.next)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400">-</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {totals ? (
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] border font-bold ${
                                totalDiff > 0 
                                  ? 'text-emerald-600 bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-200/50' 
                                  : totalDiff < 0 
                                  ? 'text-red-600 bg-gradient-to-r from-red-100 to-pink-100 border-red-200/50' 
                                  : 'text-slate-600 bg-gradient-to-r from-slate-100 to-gray-100 border-slate-200/50'
                              }`}>
                                {getDiffIcon(totalDiff)}
                                <span className="text-lg">
                                  {totalDiff >= 0 ? '+' : ''}{formatCurrency(totalDiff)}
                                </span>
                              </div>
                            ) : (
                              <div className="text-slate-400">-</div>
                            )}
                          </td>
                          <td className="px-4 py-2">
                          </td>
                        </motion.tr>
                      );
                    }

                    // Render data rows
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
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="border-b border-slate-200/30 hover:bg-white/40 transition-all duration-300 h-12"
                      >
                        {/* Budget Code */}
                        <td className="px-4 py-2">
                          {globalEditMode ? (
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-white/80 border-0 rounded-lg shadow-[inset_4px_4px_8px_#bfdbfe,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#bfdbfe,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 text-blue-700 font-mono text-sm"
                              value={item.code || ''}
                              onChange={(e) => onUpdateBudgetField(actualIndex, 'code', e.target.value)}
                              placeholder="รหัสงบประมาณ"
                            />
                          ) : (
                            <div className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 shadow-[inset_3px_3px_6px_#bfdbfe,inset_-3px_-3px_6px_#ffffff] text-blue-700 font-mono text-xs">
                              {item.code}
                            </div>
                          )}
                        </td>

                        {/* Account Code */}
                        <td className="px-4 py-2">
                          {globalEditMode ? (
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-white/80 border-0 rounded-lg shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 text-slate-700 font-mono text-sm"
                              value={item.accountCode || ''}
                              onChange={(e) => {
                                e.preventDefault();
                                onUpdateBudgetField(actualIndex, 'accountCode', e.target.value);
                              }}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                              }}
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                onUpdateBudgetField(actualIndex, 'accountCode', target.value);
                              }}
                              placeholder="รหัสบัญชี"
                              autoComplete="off"
                              spellCheck={false}
                            />
                          ) : (
                            <div className="inline-flex items-center px-2 py-1 text-slate-700 font-mono text-sm">
                              {item.accountCode || '-'}
                            </div>
                          )}
                        </td>

                        {/* Item Name */}
                        <td className="px-4 py-2">
                          {globalEditMode ? (
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-white/80 border-0 rounded-lg shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 text-slate-700 font-medium"
                              value={item.name || ''}
                              onChange={(e) => {
                                e.preventDefault();
                                onUpdateBudgetField(actualIndex, 'name', e.target.value);
                              }}
                              onKeyDown={(e) => {
                                // Allow all key events including backspace and delete
                                e.stopPropagation();
                              }}
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                onUpdateBudgetField(actualIndex, 'name', target.value);
                              }}
                              placeholder="รายการ"
                              autoComplete="off"
                              spellCheck={false}
                            />
                          ) : (
                            <div className="font-medium text-slate-700">
                              {item.name}
                            </div>
                          )}
                        </td>

                        {/* Current Year Value */}
                        <td className="px-4 py-2">
                          {globalEditMode || editingCell === `${actualIndex}-${currentYear}` ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className="w-full p-3 text-right bg-white/80 border-0 rounded-xl shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] focus:outline-none focus:shadow-[inset_10px_10px_20px_#d1d5db,inset_-10px_-10px_20px_#ffffff] transition-all duration-300 text-slate-700 text-lg font-semibold"
                                value={editingCell === `${actualIndex}-${currentYear}` ? tempValue : currentValue.toString()}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  if (globalEditMode) {
                                    onUpdateBudget(actualIndex, currentYear, newValue);
                                  } else {
                                    setTempValue(e.target.value);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !globalEditMode) {
                                    handleCellSave(actualIndex, currentYear);
                                  }
                                  if (e.key === 'Escape' && !globalEditMode) {
                                    handleCellCancel();
                                  }
                                }}
                                autoFocus={editingCell === `${actualIndex}-${currentYear}`}
                              />
                              {!globalEditMode && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleCellSave(actualIndex, currentYear)}
                                    className="w-8 h-8 rounded-lg bg-emerald-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-600 transition-all duration-200"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCellCancel}
                                    className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`text-right font-mono text-xl font-bold p-3 rounded-xl transition-all duration-300 ${
                                globalEditMode 
                                  ? 'cursor-pointer hover:bg-blue-50/50 hover:shadow-[inset_4px_4px_8px_#bfdbfe,inset_-4px_-4px_8px_#ffffff]' 
                                  : 'cursor-not-allowed text-slate-400'
                              }`}
                              onClick={() => globalEditMode && handleCellEdit(actualIndex, currentYear, currentValue)}
                            >
                              {formatCurrency(currentValue)}
                            </div>
                          )}
                        </td>

                        {/* Next Year Value */}
                        <td className="px-4 py-2">
                          {globalEditMode || editingCell === `${actualIndex}-${nextYear}` ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className="w-full p-3 text-right bg-white/80 border-0 rounded-xl shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] focus:outline-none focus:shadow-[inset_10px_10px_20px_#d1d5db,inset_-10px_-10px_20px_#ffffff] transition-all duration-300 text-slate-700 text-lg font-semibold"
                                value={editingCell === `${actualIndex}-${nextYear}` ? tempValue : nextValue.toString()}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  if (globalEditMode) {
                                    onUpdateBudget(actualIndex, nextYear, newValue);
                                  } else {
                                    setTempValue(e.target.value);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !globalEditMode) {
                                    handleCellSave(actualIndex, nextYear);
                                  }
                                  if (e.key === 'Escape' && !globalEditMode) {
                                    handleCellCancel();
                                  }
                                }}
                                autoFocus={editingCell === `${actualIndex}-${nextYear}`}
                              />
                              {!globalEditMode && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleCellSave(actualIndex, nextYear)}
                                    className="w-8 h-8 rounded-lg bg-emerald-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-600 transition-all duration-200"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCellCancel}
                                    className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`text-right font-mono text-xl font-bold p-3 rounded-xl transition-all duration-300 ${
                                globalEditMode 
                                  ? 'cursor-pointer hover:bg-emerald-50/50 hover:shadow-[inset_4px_4px_8px_#a7f3d0,inset_-4px_-4px_8px_#ffffff]' 
                                  : 'cursor-not-allowed text-slate-400'
                              }`}
                              onClick={() => globalEditMode && handleCellEdit(actualIndex, nextYear, nextValue)}
                            >
                              {formatCurrency(nextValue)}
                            </div>
                          )}
                        </td>

                        {/* Difference */}
                        <td className="px-4 py-2">
                          <div className="text-center">
                            <div className={`flex items-center justify-center gap-1 font-bold text-xl ${
                              diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'
                            }`}>
                              {getDiffIcon(diff)}
                              <span>
                                {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                              </span>
                            </div>
                            {currentValue > 0 && (
                              <div className="text-xs mt-1 text-slate-500">
                                ({diff >= 0 ? '+' : ''}{diffPercentage.toFixed(1)}%)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 text-sm"
                            placeholder="เพิ่มหมายเหตุ..."
                            value={item.notes || ''}
                            onChange={(e) => onUpdateNotes(actualIndex, e.target.value)}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-slate-200/30 bg-slate-50/30 p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600 font-light">
                แสดง {filteredData.length} รายการ จากทั้งหมด {budgetData.filter(item => !item.type).length} รายการ
              </div>
              <div className="text-lg font-medium text-slate-700">
                รวมผลต่าง: <span className={`font-semibold ${metrics.totalDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {metrics.totalDiff >= 0 ? '+' : ''}{formatCurrency(metrics.totalDiff)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};