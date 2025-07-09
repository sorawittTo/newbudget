import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Employee, FamilyVisitEmployee } from '../../types';
import { formatCurrency, calculateFamilyVisit } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X, Users, MapPin, Calculator, AlertCircle, TrendingUp, Target, Award } from 'lucide-react';
import { Card } from '../ui/Card';

interface ModernFamilyVisitCalculationTableProps {
  employees: Employee[];
  selectedEmployeeIds: string[];
  calcYear: number;
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  globalEditMode?: boolean;
}

export const ModernFamilyVisitCalculationTable: React.FC<ModernFamilyVisitCalculationTableProps> = ({
  employees,
  selectedEmployeeIds,
  calcYear,
  onSave,
  onUpdateEmployee,
  globalEditMode = false
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  // Filter employees: only those with eligible status
  const eligibleEmployees = useMemo(() => 
    employees.filter(emp => 
      selectedEmployeeIds.includes(emp.id) &&
      emp.status === 'มีสิทธิ์'
    ), [employees, selectedEmployeeIds]
  );
  
  const familyVisitData = useMemo(() => 
    calculateFamilyVisit(eligibleEmployees, calcYear)
      .sort((a, b) => {
        // Sort by level (7 -> 6 -> 5.5 -> 5 -> 4.5 -> 4 -> 3)
        const levelA = parseFloat(a.level);
        const levelB = parseFloat(b.level);
        if (levelA !== levelB) {
          return levelB - levelA; // Descending order
        }
        // If same level, sort alphabetically by name
        return a.name.localeCompare(b.name, 'th');
      }), 
    [eligibleEmployees, calcYear]
  );
  
  const familyVisitTotal = useMemo(() => 
    familyVisitData.reduce((sum, emp) => sum + emp.total, 0), 
    [familyVisitData]
  );

  // Statistics for display
  const stats = {
    totalEmployees: employees.length,
    selectedEmployees: selectedEmployeeIds.length,
    eligibleEmployees: eligibleEmployees.length,
    ineligibleEmployees: employees.filter(emp => 
      selectedEmployeeIds.includes(emp.id) && emp.status !== 'มีสิทธิ์'
    ).length,
    averagePerEmployee: familyVisitData.length > 0 ? familyVisitTotal / familyVisitData.length : 0
  };

  const handleEditStart = (empId: string, field: string, currentValue: number) => {
    if (!globalEditMode) {
      setEditingValues(prev => ({ ...prev, [`${empId}_${field}`]: currentValue }));
      setEditMode(prev => ({ ...prev, [`${empId}_${field}`]: true }));
    }
  };

  const handleEditSave = (empIndex: number, field: string, empId: string) => {
    const key = `${empId}_${field}`;
    const newValue = editingValues[key];
    
    if (newValue !== undefined) {
      const employee = employees.find(emp => emp.id === empId);
      if (employee) {
        const globalIndex = employees.findIndex(emp => emp.id === empId);
        if (field === 'homeVisitBusFare') {
          onUpdateEmployee(globalIndex, { ...employee, homeVisitBusFare: parseFloat(newValue) || 0 });
        }
      }
    }
    
    setEditMode(prev => ({ ...prev, [key]: false }));
    setEditingValues(prev => ({ ...prev, [key]: undefined }));
  };

  const handleEditCancel = (empId: string, field: string) => {
    const key = `${empId}_${field}`;
    setEditMode(prev => ({ ...prev, [key]: false }));
    setEditingValues(prev => ({ ...prev, [key]: undefined }));
  };

  const handleGlobalUpdate = (empId: string, field: string, value: number) => {
    const employee = employees.find(emp => emp.id === empId);
    if (employee) {
      const globalIndex = employees.findIndex(emp => emp.id === empId);
      if (field === 'homeVisitBusFare') {
        onUpdateEmployee(globalIndex, { ...employee, homeVisitBusFare: value });
      }
      // Add support for editing quantity field if needed in the future
    }
  };

  const renderEditableValue = (empId: string, field: string, currentValue: number, empIndex: number, label: string) => {
    const key = `${empId}_${field}`;
    const isEditing = editMode[key];
    
    if (globalEditMode) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
            value={currentValue}
            onChange={(e) => handleGlobalUpdate(empId, field, parseFloat(e.target.value) || 0)}
          />
        </div>
      );
    }
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
            value={editingValues[key] || currentValue}
            onChange={(e) => setEditingValues(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
            autoFocus
          />
          <button
            onClick={() => handleEditSave(empIndex, field, empId)}
            className="w-8 h-8 rounded-lg bg-emerald-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-600 transition-all duration-200"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCancel(empId, field)}
            className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className="font-bold text-lg text-slate-700">{formatCurrency(currentValue)}</span>
        <button
          onClick={() => handleEditStart(empId, field, currentValue)}
          className="w-8 h-8 rounded-lg bg-slate-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title={`แก้ไข${label}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ค่าเดินทางเยี่ยมครอบครัว</h2>
                <p className="text-gray-600">คำนวณค่าเดินทางเยี่ยมครอบครัวสำหรับพนักงานที่มีสิทธิ์</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'พนักงานทั้งหมด', value: stats.totalEmployees, icon: Users, color: 'text-blue-600' },
              { label: 'มีสิทธิ์เดินทาง', value: stats.eligibleEmployees, icon: Award, color: 'text-green-600' },
              { label: 'ยอดรวมทั้งหมด', value: formatCurrency(familyVisitTotal), icon: Calculator, color: 'text-purple-600' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-2xl bg-gray-100"
                style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${stat.color}`} style={{ boxShadow: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff', backgroundColor: '#f9fafb' }}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>



      {/* Main Table */}
      <Card className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">รหัสพนักงาน</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-สกุล</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">จังหวัดเยี่ยมบ้าน</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ค่ารถเยี่ยมบ้านไป-กลับ</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">จำนวนครั้ง</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ยอดรวม (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {familyVisitData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">ไม่พบพนักงานที่มีสิทธิ์</p>
                        <p className="text-sm text-gray-500 mt-1">
                          พนักงานต้องมีสถานะ "มีสิทธิ์" เท่านั้น
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                familyVisitData.map((emp, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-gray-600 font-medium">
                        {emp.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{emp.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">
                        {emp.visitProvince}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {globalEditMode ? (
                        <input
                          type="text"
                          className="w-32 p-2 border border-gray-300 rounded text-right"
                          value={emp.roundTripFare}
                          onChange={(e) => handleGlobalUpdate(emp.id, 'homeVisitBusFare', (parseFloat(e.target.value) || 0) / 2)}
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{formatCurrency(emp.roundTripFare)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {globalEditMode ? (
                        <input
                          type="text"
                          className="w-20 p-2 border border-gray-300 rounded text-center"
                          value={4}
                          onChange={() => {}} // Fixed at 4 for now
                        />
                      ) : (
                        <span className="font-medium text-gray-900">4</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(emp.total)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </Card>


    </div>
  );
};