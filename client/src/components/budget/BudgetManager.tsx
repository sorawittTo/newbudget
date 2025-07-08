import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Banknote, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit3,
  Save,
  FileText,
  Plus,
  Minus,
  Calculator
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface BudgetItem {
  type?: 'main_header' | 'header';
  code?: string;
  name: string;
  values?: Record<number, number>;
  notes?: string;
}

interface BudgetManagerProps {
  onSave?: () => void;
}

const defaultBudgetItems: BudgetItem[] = [
  { type: 'main_header', name: 'รวมงบประมาณรายจ่ายดำเนินงาน' },
  { type: 'header', name: 'หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน' },
  { code: '52021100', name: 'ค่าใช้จ่ายกิจกรรมส่งเสริมค่านิยมร่วมขององค์กร', notes: '' },
  { code: '52010700', name: 'ค่าล่วงเวลา', notes: '' },
  { type: 'header', name: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป' },
  { code: '53010200', name: 'ค่าไฟฟ้า', notes: '' },
  { code: '53010300', name: 'ค่าน้ำประปา', notes: '' },
  { code: '53010400', name: 'ค่าโทรศัพท์', notes: '' },
  { code: '53040100', name: 'ค่าวัสดุทั่วไป', notes: '' },
  { code: '53040200', name: 'ค่าวัสดุงานธนบัตร', notes: '' },
  { code: '53050100', name: 'ค่าน้ำมันเชื้อเพลิง', notes: '' },
  { code: '53100001', name: 'ค่าจ้าง', notes: '' },
  { code: '53010100', name: 'ค่าไปรษณียากรและพัสดุไปรษณีย์', notes: '' },
  { code: '53050500', name: 'ค่าขนส่ง', notes: '' },
  { code: '53100400', name: 'ค่าจ้างแรงงานและทำของ', notes: '' },
  { code: '53103900', name: 'ค่าจ้างแรงงาน/ทำของ-งานตามพันธกิจหลัก', notes: '' },
  { code: '53021100', name: 'ค่าซ่อมแซมและบำรุงรักษา', notes: '' },
  { code: '53060600', name: 'ค่าตอบแทน', notes: '' },
  { code: '53100004', name: 'ค่าเช่า', notes: '' },
  { code: '53040300', name: 'ค่าเช่าเครื่องถ่ายเอกสาร', notes: '' },
  { code: '53050200', name: 'ค่าเช่ายานพาหนะ', notes: '' },
  { code: '53070400', name: 'ค่าธรรมเนียม', notes: '' },
  { code: '53100100', name: 'ค่ารับรอง', notes: '' },
  { code: '53100200', name: 'ค่าใช้จ่ายในการเดินทาง', notes: '' },
  { code: '53100201', name: 'ค่าเดินทางเยี่ยมครอบครัว', notes: '' },
  { code: '53100202', name: 'ค่าเดินทางหมุนเวียนงาน ผจศ.', notes: '' },
  { code: '53101000', name: 'ค่าทรัพยากรสาสนเทศห้องสมุด', notes: '' },
  { code: '53103600', name: 'ค่าจัดประชุม/ชี้แจง', notes: '' },
  { code: '53101500', name: 'ค่าใช้จ่ายในการจัดงานและพิธีต่าง ๆ', notes: '' },
  { code: '53109900', name: 'ค่าใช้จ่ายเบ็ดเตล็ด', notes: '' },
  { type: 'header', name: 'หมวด 4 : เงินช่วยเหลือภายในนอกและเงินบริจาค' },
  { code: '55080300', name: 'เงินบริจาค', notes: '' },
  { code: '55080400', name: 'เงินช่วยเหลืออื่นๆ', notes: '' },
  { type: 'header', name: 'หมวด 58: ค่าใช้จ่ายด้านการผลิต' },
  { code: '53110700', name: 'ค่าวัสดุผลิต - ทั่วไป', notes: '' },
  { type: 'main_header', name: 'รวมงบประมาณรายจ่ายสินทรัพย์' },
  { type: 'header', name: 'หมวด 7 : สินทรัพย์ถาวร' },
  { code: '10', name: 'ครุภัณฑ์เครื่องใช้ไฟฟ้าและประปา', notes: '' },
  { code: '16', name: 'ครุภัณฑ์เบ็ดเตล็ด', notes: '' },
  { code: '25', name: 'ครุภัณฑ์ยานพาหนะและขนส่ง', notes: '' },
  { code: '5', name: 'ค่าเสริมสร้างปรับปรุงอาคารสถานที่', notes: '' },
];

export const BudgetManager: React.FC<BudgetManagerProps> = ({ onSave }) => {
  const [currentYear, setCurrentYear] = useState<number>(2568);
  const [compareYear, setCompareYear] = useState<number>(2569);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(
    defaultBudgetItems.map(item => ({
      ...item,
      values: {
        [currentYear]: 0,
        [compareYear]: 0
      }
    }))
  );
  const [editMode, setEditMode] = useState<boolean>(false);

  const budgetSummary = useMemo(() => {
    const operatingItems = budgetItems.filter(item => 
      !item.type && item.code && !['10', '16', '25', '5'].includes(item.code)
    );
    const assetItems = budgetItems.filter(item => 
      !item.type && item.code && ['10', '16', '25', '5'].includes(item.code)
    );

    const operatingCurrent = operatingItems.reduce((sum, item) => 
      sum + (item.values?.[currentYear] || 0), 0
    );
    const operatingCompare = operatingItems.reduce((sum, item) => 
      sum + (item.values?.[compareYear] || 0), 0
    );
    const assetCurrent = assetItems.reduce((sum, item) => 
      sum + (item.values?.[currentYear] || 0), 0
    );
    const assetCompare = assetItems.reduce((sum, item) => 
      sum + (item.values?.[compareYear] || 0), 0
    );

    return {
      operatingCurrent,
      operatingCompare,
      operatingDiff: operatingCompare - operatingCurrent,
      assetCurrent,
      assetCompare,
      assetDiff: assetCompare - assetCurrent,
      totalCurrent: operatingCurrent + assetCurrent,
      totalCompare: operatingCompare + assetCompare,
      totalDiff: (operatingCompare + assetCompare) - (operatingCurrent + assetCurrent)
    };
  }, [budgetItems, currentYear, compareYear]);

  const updateBudgetValue = (index: number, year: number, value: number) => {
    setBudgetItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, values: { ...item.values, [year]: value } }
        : item
    ));
  };

  const updateBudgetNotes = (index: number, notes: string) => {
    setBudgetItems(prev => prev.map((item, i) => 
      i === index ? { ...item, notes } : item
    ));
  };

  const renderBudgetItem = (item: BudgetItem, index: number) => {
    if (item.type === 'main_header') {
      return (
        <motion.tr
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100"
        >
          <td colSpan={6} className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">{item.name}</h3>
            </div>
          </td>
        </motion.tr>
      );
    }

    if (item.type === 'header') {
      return (
        <motion.tr
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="bg-gradient-to-r from-slate-50 to-slate-100"
        >
          <td colSpan={6} className="px-6 py-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-slate-600"></div>
              <h4 className="text-md font-semibold text-slate-800">{item.name}</h4>
            </div>
          </td>
        </motion.tr>
      );
    }

    const currentValue = item.values?.[currentYear] || 0;
    const compareValue = item.values?.[compareYear] || 0;
    const difference = compareValue - currentValue;
    const percentChange = currentValue > 0 ? (difference / currentValue) * 100 : 0;

    return (
      <motion.tr
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className="hover:bg-slate-50 transition-colors"
      >
        <td className="px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              {item.code}
            </span>
            <span className="text-sm text-slate-800">{item.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 border-b">
          {editMode ? (
            <input
              type="number"
              value={currentValue}
              onChange={(e) => updateBudgetValue(index, currentYear, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <span className="text-right font-mono">{formatCurrency(currentValue)}</span>
          )}
        </td>
        <td className="px-6 py-4 border-b">
          {editMode ? (
            <input
              type="number"
              value={compareValue}
              onChange={(e) => updateBudgetValue(index, compareYear, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <span className="text-right font-mono">{formatCurrency(compareValue)}</span>
          )}
        </td>
        <td className="px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            {difference > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : difference < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span className={`font-mono ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(Math.abs(difference))}
            </span>
            {currentValue > 0 && (
              <span className="text-xs text-slate-500">
                ({percentChange.toFixed(1)}%)
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 border-b">
          {editMode ? (
            <textarea
              value={item.notes || ''}
              onChange={(e) => updateBudgetNotes(index, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="หมายเหตุ..."
            />
          ) : (
            <span className="text-sm text-slate-600">{item.notes}</span>
          )}
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <Banknote className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">การจัดการงบประมาณประจำปี</h1>
                <p className="text-slate-600">จัดการงบประมาณรายจ่ายดำเนินงานและสินทรัพย์</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  editMode 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{editMode ? 'หยุดแก้ไข' : 'แก้ไข'}</span>
              </button>
              <button
                onClick={onSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>บันทึก</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Year Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-6 bg-white rounded-2xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">เลือกปีที่เปรียบเทียบ</h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-slate-700">ปีปัจจุบัน:</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[2568, 2569, 2570, 2571, 2572].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <label className="text-sm font-medium text-slate-700">ปีเปรียบเทียบ:</label>
                <select
                  value={compareYear}
                  onChange={(e) => setCompareYear(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {[2568, 2569, 2570, 2571, 2572].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">งบดำเนินงาน</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(budgetSummary.operatingCurrent)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {budgetSummary.operatingDiff > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : budgetSummary.operatingDiff < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${budgetSummary.operatingDiff > 0 ? 'text-green-600' : budgetSummary.operatingDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(budgetSummary.operatingDiff))}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">งบสินทรัพย์</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(budgetSummary.assetCurrent)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {budgetSummary.assetDiff > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : budgetSummary.assetDiff < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${budgetSummary.assetDiff > 0 ? 'text-green-600' : budgetSummary.assetDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(budgetSummary.assetDiff))}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">รวมทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(budgetSummary.totalCurrent)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {budgetSummary.totalDiff > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : budgetSummary.totalDiff < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${budgetSummary.totalDiff > 0 ? 'text-green-600' : budgetSummary.totalDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(budgetSummary.totalDiff))}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Banknote className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Budget Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">รายการ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    ปี {currentYear}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    ปี {compareYear}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    ผลต่าง
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    หมายเหตุ
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item, index) => renderBudgetItem(item, index))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};