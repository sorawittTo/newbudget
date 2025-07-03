import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  RefreshCw,
  FileText,
  Users,
  Calculator
} from 'lucide-react';
import { Employee, BudgetItem, MasterRates } from '../../types';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'employee' | 'budget' | 'rates' | 'calculation';
  message: string;
  details?: string;
  fix?: () => void;
}

interface DataValidatorProps {
  employees: Employee[];
  budgetData: BudgetItem[];
  masterRates: MasterRates;
  onFixIssue?: (fix: () => void) => void;
}

export const DataValidator: React.FC<DataValidatorProps> = ({
  employees,
  budgetData,
  masterRates,
  onFixIssue
}) => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  const validateData = () => {
    setIsValidating(true);
    const foundIssues: ValidationIssue[] = [];

    // Employee validation
    employees.forEach((emp, index) => {
      if (!emp.id || emp.id.trim() === '') {
        foundIssues.push({
          type: 'error',
          category: 'employee',
          message: `พนักงานลำดับที่ ${index + 1} ไม่มีรหัสพนักงาน`,
          details: 'รหัสพนักงานเป็นข้อมูลที่จำเป็น'
        });
      }

      if (!emp.name || emp.name.trim() === '') {
        foundIssues.push({
          type: 'error',
          category: 'employee',
          message: `พนักงานรหัส ${emp.id} ไม่มีชื่อ`,
          details: 'ชื่อพนักงานเป็นข้อมูลที่จำเป็น'
        });
      }

      if (emp.startYear < 2500 || emp.startYear > new Date().getFullYear() + 543) {
        foundIssues.push({
          type: 'warning',
          category: 'employee',
          message: `พนักงาน ${emp.name} มีปีเริ่มงานไม่สมเหตุสมผล (${emp.startYear})`,
          details: 'ปีเริ่มงานควรอยู่ในช่วงที่เหมาะสม'
        });
      }

      if (!masterRates[emp.level] && emp.level !== 'ท้องถิ่น') {
        foundIssues.push({
          type: 'error',
          category: 'employee',
          message: `พนักงาน ${emp.name} มีระดับที่ไม่มีในตารางอัตรา (${emp.level})`,
          details: 'ระดับพนักงานต้องมีในตารางอัตราค่าใช้จ่ายมาตรฐาน'
        });
      }

      // Check for duplicate IDs
      const duplicates = employees.filter(e => e.id === emp.id);
      if (duplicates.length > 1) {
        foundIssues.push({
          type: 'error',
          category: 'employee',
          message: `รหัสพนักงาน ${emp.id} ซ้ำกัน`,
          details: 'รหัสพนักงานต้องไม่ซ้ำกัน'
        });
      }
    });

    // Budget validation
    budgetData.forEach((item, index) => {
      if (!item.type && item.values) {
        const hasAnyValue = Object.values(item.values).some(v => v > 0);
        if (!hasAnyValue) {
          foundIssues.push({
            type: 'info',
            category: 'budget',
            message: `รายการ ${item.name} ไม่มีงบประมาณในปีใดๆ`,
            details: 'อาจต้องการตรวจสอบว่าเป็นรายการที่ใช้งานจริง'
          });
        }

        // Check for extremely high values
        Object.entries(item.values).forEach(([year, value]) => {
          if (value > 10000000) { // 10 million
            foundIssues.push({
              type: 'warning',
              category: 'budget',
              message: `รายการ ${item.name} ปี ${year} มีจำนวนเงินสูงมาก (${value.toLocaleString()})`,
              details: 'ควรตรวจสอบความถูกต้องของตัวเลข'
            });
          }
        });
      }
    });

    // Master rates validation
    Object.entries(masterRates).forEach(([level, rates]) => {
      if (!rates.position || rates.position.trim() === '') {
        foundIssues.push({
          type: 'warning',
          category: 'rates',
          message: `ระดับ ${level} ไม่มีชื่อตำแหน่ง`,
          details: 'ควรระบุชื่อตำแหน่งเพื่อความชัดเจน'
        });
      }

      if (rates.rent < 0 || rates.monthlyAssist < 0 || rates.perDiem < 0 || rates.hotel < 0) {
        foundIssues.push({
          type: 'error',
          category: 'rates',
          message: `ระดับ ${level} มีอัตราค่าใช้จ่ายติดลบ`,
          details: 'อัตราค่าใช้จ่ายต้องเป็นจำนวนบวก'
        });
      }
    });

    // Calculation consistency checks
    const eligibleEmployees = employees.filter(emp => 
      emp.level !== 'ท้องถิ่น' && 
      emp.visitProvince && 
      emp.visitProvince.trim() !== '' &&
      emp.visitProvince !== 'ขอนแก่น'
    );

    if (eligibleEmployees.length === 0) {
      foundIssues.push({
        type: 'warning',
        category: 'calculation',
        message: 'ไม่มีพนักงานที่มีสิทธิ์รับเงินช่วยเหลือ',
        details: 'ตรวจสอบข้อมูลจังหวัดเยี่ยมบ้านและระดับพนักงาน'
      });
    }

    setIssues(foundIssues);
    setLastValidation(new Date());
    setIsValidating(false);
  };

  useEffect(() => {
    validateData();
  }, [employees, budgetData, masterRates]);

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: ValidationIssue['category']) => {
    switch (category) {
      case 'employee':
        return <Users className="w-4 h-4" />;
      case 'budget':
        return <FileText className="w-4 h-4" />;
      case 'rates':
        return <Calculator className="w-4 h-4" />;
      case 'calculation':
        return <Calculator className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: ValidationIssue['category']) => {
    switch (category) {
      case 'employee':
        return 'ข้อมูลพนักงาน';
      case 'budget':
        return 'งบประมาณ';
      case 'rates':
        return 'ตารางอัตรา';
      case 'calculation':
        return 'การคำนวณ';
    }
  };

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ตรวจสอบความถูกต้องของข้อมูล</h2>
          <p className="text-gray-600">
            ตรวจสอบและแก้ไขปัญหาในข้อมูลระบบ
            {lastValidation && (
              <span className="ml-2 text-sm">
                (ตรวจสอบล่าสุด: {lastValidation.toLocaleTimeString('th-TH')})
              </span>
            )}
          </p>
        </div>
        <Button 
          onClick={validateData} 
          disabled={isValidating}
          variant="secondary"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          ตรวจสอบใหม่
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 ${issues.length === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-center">
            {issues.length === 0 ? (
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
            )}
            <div>
              <p className="font-medium">สถานะรวม</p>
              <p className={`text-sm ${issues.length === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                {issues.length === 0 ? 'ไม่พบปัญหา' : `พบ ${issues.length} ปัญหา`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <p className="font-medium">ข้อผิดพลาด</p>
              <p className="text-sm text-red-600">{errorCount} รายการ</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium">คำเตือน</p>
              <p className="text-sm text-yellow-600">{warningCount} รายการ</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <Info className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <p className="font-medium">ข้อมูล</p>
              <p className="text-sm text-blue-600">{infoCount} รายการ</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Issues List */}
      {issues.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">รายการปัญหาที่พบ</h3>
          <div className="space-y-4">
            <AnimatePresence>
              {issues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    issue.type === 'error' ? 'bg-red-50 border-red-400' :
                    issue.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getCategoryIcon(issue.category)}
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {getCategoryName(issue.category)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{issue.message}</p>
                        {issue.details && (
                          <p className="text-sm text-gray-600 mt-1">{issue.details}</p>
                        )}
                      </div>
                    </div>
                    {issue.fix && onFixIssue && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onFixIssue(issue.fix!)}
                      >
                        แก้ไข
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center bg-green-50 border-green-200">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">ข้อมูลถูกต้องครบถ้วน</h3>
          <p className="text-green-700">
            ไม่พบปัญหาในข้อมูลระบบ ระบบพร้อมใช้งานได้อย่างเต็มประสิทธิภาพ
          </p>
        </Card>
      )}
    </div>
  );
};