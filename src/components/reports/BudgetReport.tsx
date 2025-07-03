import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BudgetItem, Employee, MasterRates } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Filter,
  Calendar
} from 'lucide-react';

interface BudgetReportProps {
  budgetData: BudgetItem[];
  employees: Employee[];
  masterRates: MasterRates;
  currentYear: number;
  nextYear: number;
}

export const BudgetReport: React.FC<BudgetReportProps> = ({
  budgetData,
  employees,
  masterRates,
  currentYear,
  nextYear
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'difference' | 'percentage'>('amount');

  // Process budget data
  const processedData = budgetData
    .filter(item => !item.type && item.values)
    .map(item => {
      const current = item.values![currentYear] || 0;
      const next = item.values![nextYear] || 0;
      const difference = next - current;
      const percentage = current > 0 ? ((difference / current) * 100) : 0;
      
      return {
        ...item,
        current,
        next,
        difference,
        percentage,
        category: item.code?.substring(0, 2) || 'other'
      };
    });

  // Filter and sort data
  const filteredData = processedData
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.next - a.next;
        case 'difference':
          return Math.abs(b.difference) - Math.abs(a.difference);
        case 'percentage':
          return Math.abs(b.percentage) - Math.abs(a.percentage);
        default:
          return 0;
      }
    });

  // Calculate totals
  const totals = filteredData.reduce((acc, item) => ({
    current: acc.current + item.current,
    next: acc.next + item.next,
    difference: acc.difference + item.difference
  }), { current: 0, next: 0, difference: 0 });

  // Category analysis
  const categories = processedData.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) {
      acc[cat] = { current: 0, next: 0, difference: 0, count: 0 };
    }
    acc[cat].current += item.current;
    acc[cat].next += item.next;
    acc[cat].difference += item.difference;
    acc[cat].count += 1;
    return acc;
  }, {} as Record<string, { current: number; next: number; difference: number; count: number }>);

  const categoryNames: Record<string, string> = {
    '52': 'ค่าใช้จ่ายเกี่ยวกับพนักงาน',
    '53': 'ค่าใช้จ่ายดำเนินงานทั่วไป',
    '55': 'เงินช่วยเหลือและเงินบริจาค',
    '10': 'ครุภัณฑ์และสินทรัพย์',
    'other': 'อื่นๆ'
  };

  const exportReport = () => {
    const reportData = {
      title: `รายงานงบประมาณ ปี ${currentYear} เปรียบเทียบ ปี ${nextYear}`,
      summary: totals,
      categories: Object.entries(categories).map(([key, data]) => ({
        category: categoryNames[key] || key,
        ...data
      })),
      details: filteredData,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${currentYear}-${nextYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">รายงานงบประมาณ</h2>
          <p className="text-gray-600">วิเคราะห์และเปรียบเทียบงบประมาณ ปี {currentYear} กับ ปี {nextYear}</p>
        </div>
        <Button onClick={exportReport} variant="success">
          <Download className="w-4 h-4 mr-2" />
          ส่งออกรายงาน
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">งบประมาณปี {currentYear}</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totals.current)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">คำของบประมาณปี {nextYear}</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.next)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-6 bg-gradient-to-br ${
          totals.difference >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                totals.difference >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>ผลต่าง</p>
              <p className={`text-2xl font-bold ${
                totals.difference >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {totals.difference >= 0 ? '+' : ''}{formatCurrency(totals.difference)}
              </p>
            </div>
            {totals.difference >= 0 ? 
              <TrendingUp className="w-8 h-8 text-green-500" /> :
              <TrendingDown className="w-8 h-8 text-red-500" />
            }
          </div>
        </Card>
      </div>

      {/* Category Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          วิเคราะห์ตามหมวดงบประมาณ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categories).map(([key, data]) => {
            const percentage = totals.next > 0 ? (data.next / totals.next) * 100 : 0;
            return (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {categoryNames[key] || `หมวด ${key}`}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>ปี {nextYear}:</span>
                    <span className="font-medium">{formatCurrency(data.next)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>สัดส่วน:</span>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className={`flex justify-between ${
                    data.difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>เปลี่ยนแปลง:</span>
                    <span className="font-medium">
                      {data.difference >= 0 ? '+' : ''}{formatCurrency(data.difference)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกหมวด</option>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">เรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="amount">จำนวนเงิน</option>
                <option value="difference">ผลต่าง</option>
                <option value="percentage">เปอร์เซ็นต์การเปลี่ยนแปลง</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            แสดง {filteredData.length} รายการ จากทั้งหมด {processedData.length} รายการ
          </div>
        </div>
      </Card>

      {/* Detailed Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">รหัสบัญชี</th>
                <th className="px-6 py-3 font-medium text-gray-900">รายการ</th>
                <th className="px-6 py-3 font-medium text-gray-900 text-right">ปี {currentYear}</th>
                <th className="px-6 py-3 font-medium text-gray-900 text-right">ปี {nextYear}</th>
                <th className="px-6 py-3 font-medium text-gray-900 text-right">ผลต่าง</th>
                <th className="px-6 py-3 font-medium text-gray-900 text-right">%เปลี่ยนแปลง</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-mono text-sm">{item.code}</td>
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(item.current)}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.next)}</td>
                  <td className={`px-6 py-4 text-right font-medium ${
                    item.difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${
                    item.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.current > 0 ? `${item.percentage >= 0 ? '+' : ''}${item.percentage.toFixed(1)}%` : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={2} className="px-6 py-4">รวมทั้งหมด</td>
                <td className="px-6 py-4 text-right">{formatCurrency(totals.current)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(totals.next)}</td>
                <td className={`px-6 py-4 text-right ${
                  totals.difference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.difference >= 0 ? '+' : ''}{formatCurrency(totals.difference)}
                </td>
                <td className={`px-6 py-4 text-right ${
                  totals.difference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.current > 0 ? 
                    `${totals.difference >= 0 ? '+' : ''}${((totals.difference / totals.current) * 100).toFixed(1)}%` : 
                    '-'
                  }
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};