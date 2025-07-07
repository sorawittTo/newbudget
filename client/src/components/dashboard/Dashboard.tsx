import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  TrendingUp, 
  Users, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import { Employee, BudgetItem } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface DashboardProps {
  budgetData: BudgetItem[];
  employees: Employee[];
  currentYear: number;
  nextYear: number;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  budgetData,
  employees,
  currentYear,
  nextYear,
  onNavigate
}) => {
  // Calculate budget summary
  const budgetSummary = budgetData
    .filter(item => !item.type && item.values)
    .reduce((acc, item) => {
      const current = item.values![currentYear] || 0;
      const next = item.values![nextYear] || 0;
      return {
        current: acc.current + current,
        next: acc.next + next,
        difference: acc.difference + (next - current)
      };
    }, { current: 0, next: 0, difference: 0 });

  // Employee statistics
  const employeeStats = {
    total: employees.length,
    byLevel: employees.reduce((acc, emp) => {
      acc[emp.level] = (acc[emp.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    withVisitProvince: employees.filter(emp => 
      emp.visitProvince && emp.visitProvince.trim() !== '' && emp.visitProvince !== 'ขอนแก่น'
    ).length,
    local: employees.filter(emp => emp.level === 'ท้องถิ่น').length
  };

  // Quick actions
  const quickActions = [
    {
      title: 'จัดการข้อมูลพนักงาน',
      description: 'เพิ่ม แก้ไข หรือลบข้อมูลพนักงาน',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => onNavigate('config')
    },
    {
      title: 'คำนวณค่าเดินทาง',
      description: 'คำนวณค่าเดินทางรับของที่ระลึก',
      icon: <Calculator className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => onNavigate('travel')
    },
    {
      title: 'จัดทำงบประมาณ',
      description: 'ดูและแก้ไขตารางงบประมาณ',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => onNavigate('budget')
    },
    {
      title: 'คำนวณวันทำงาน',
      description: 'จัดการวันหยุดและคำนวณวันทำงาน',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-orange-500',
      action: () => onNavigate('workday-calc')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ดภาพรวม</h2>
        <p className="text-gray-600">สรุปข้อมูลสำคัญและการดำเนินงานของระบบ</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">งบประมาณปี {nextYear}</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(budgetSummary.next)}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`flex items-center text-sm ${
              budgetSummary.difference >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {budgetSummary.difference >= 0 ? '↗' : '↘'} {formatCurrency(Math.abs(budgetSummary.difference))}
              <span className="ml-1">จากปีก่อน</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">จำนวนพนักงาน</p>
              <p className="text-2xl font-bold text-green-900">{employeeStats.total} คน</p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-600">
              ท้องถิ่น {employeeStats.local} คน • อื่นๆ {employeeStats.total - employeeStats.local} คน
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">มีสิทธิ์เงินช่วยเหลือ</p>
              <p className="text-2xl font-bold text-purple-900">{employeeStats.withVisitProvince} คน</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-purple-600">
              {Math.round((employeeStats.withVisitProvince / employeeStats.total) * 100)}% ของพนักงานทั้งหมด
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">สถานะระบบ</p>
              <p className="text-lg font-bold text-orange-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                พร้อมใช้งาน
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-orange-600">
              ข้อมูลอัปเดตล่าสุด
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" hover>
              <div className="text-center" onClick={action.action}>
                <div className={`inline-flex p-3 rounded-full ${action.color} mb-4`}>
                  {React.cloneElement(action.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Employee Distribution */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            การกระจายตัวพนักงานตามระดับ
          </h3>
          <div className="space-y-3">
            {Object.entries(employeeStats.byLevel)
              .sort(([a], [b]) => {
                if (a === 'ท้องถิ่น') return 1;
                if (b === 'ท้องถิ่น') return -1;
                return parseFloat(b) - parseFloat(a);
              })
              .map(([level, count]) => {
                const percentage = Math.round((count / employeeStats.total) * 100);
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                      <span className="font-medium">ระดับ {level}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{count} คน</span>
                      <span className="text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            สรุปงบประมาณ
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">งบประมาณปี {currentYear}</span>
              <span className="font-bold text-blue-600">{formatCurrency(budgetSummary.current)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">คำของบประมาณปี {nextYear}</span>
              <span className="font-bold text-green-600">{formatCurrency(budgetSummary.next)}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg ${
              budgetSummary.difference >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-medium">ผลต่าง</span>
              <span className={`font-bold ${
                budgetSummary.difference >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {budgetSummary.difference >= 0 ? '+' : ''}{formatCurrency(budgetSummary.difference)}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* System Status */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ระบบพร้อมใช้งาน</h3>
                <p className="text-gray-600">ข้อมูลทั้งหมดถูกบันทึกในเครื่องของคุณอย่างปลอดภัย</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">อัปเดตล่าสุด</p>
              <p className="font-medium">{new Date().toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};