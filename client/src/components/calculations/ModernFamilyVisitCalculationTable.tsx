import React, { useState } from 'react';
import { Employee, FamilyVisitEmployee } from '../../types';
import { formatCurrency, calculateFamilyVisit } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X, Users, MapPin, Calculator, AlertCircle, TrendingUp, Target } from 'lucide-react';

interface ModernFamilyVisitCalculationTableProps {
  employees: Employee[];
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
}

export const ModernFamilyVisitCalculationTable: React.FC<ModernFamilyVisitCalculationTableProps> = ({
  employees,
  selectedEmployeeIds,
  onSave,
  onUpdateEmployee
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [globalEditMode, setGlobalEditMode] = useState(false);

  // Filter employees: only those with eligible status
  const eligibleEmployees = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) &&
    emp.status === 'มีสิทธิ์'
  );
  
  const familyVisitData = calculateFamilyVisit(eligibleEmployees);
  const familyVisitTotal = familyVisitData.reduce((sum, emp) => sum + emp.total, 0);

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
            type="number"
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
            type="number"
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
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">ค่าเดินทางเยี่ยมครอบครัว</h2>
            <p className="text-slate-600">คำนวณค่าเดินทางเยี่ยมครอบครัวสำหรับพนักงานที่มีสถานะ "มีสิทธิ์"</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setGlobalEditMode(!globalEditMode)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                globalEditMode 
                  ? 'bg-orange-500 text-white shadow-[inset_8px_8px_16px_#d97706,inset_-8px_-8px_16px_#fbbf24] hover:shadow-[inset_6px_6px_12px_#d97706,inset_-6px_-6px_12px_#fbbf24]' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]'
              }`}
            >
              <Edit3 className="w-4 h-4 mr-2 inline" />
              {globalEditMode ? 'ปิดการแก้ไข' : 'เปิดการแก้ไข'}
            </button>
            
            <button
              onClick={onSave}
              className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              บันทึก
            </button>
          </div>
        </div>
        
        {globalEditMode && (
          <div className="mt-4 bg-blue-100/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-sm font-medium">โหมดแก้ไขเปิดอยู่ - แก้ไขค่าเดินทางได้โดยตรงในตาราง</span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">พนักงานทั้งหมด</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 shadow-[8px_8px_16px_#bfdbfe,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">มีสิทธิ์เดินทาง</p>
              <p className="text-3xl font-bold text-emerald-900">{stats.eligibleEmployees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 shadow-[8px_8px_16px_#a7f3d0,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">ยอดรวมทั้งหมด</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(familyVisitTotal)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 shadow-[8px_8px_16px_#ddd6fe,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-amber-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium">ไม่มีสิทธิ์</p>
              <p className="text-3xl font-bold text-amber-900">{stats.ineligibleEmployees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 shadow-[8px_8px_16px_#fde68a,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>



      {/* Main Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-600 to-blue-600 text-white">
                <th className="px-6 py-4 text-left font-bold">รหัสพนักงาน</th>
                <th className="px-6 py-4 text-left font-bold">ชื่อ-สกุล</th>
                <th className="px-6 py-4 text-left font-bold">จังหวัดเยี่ยมบ้าน</th>
                <th className="px-6 py-4 text-right font-bold">ค่ารถทัวร์ไป-กลับ</th>
                <th className="px-6 py-4 text-right font-bold">จำนวนครั้ง</th>
                <th className="px-6 py-4 text-right font-bold bg-gradient-to-r from-blue-600 to-purple-600">ยอดรวม (บาท)</th>
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
                  <tr key={index} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] font-mono text-sm font-medium text-slate-700">
                        {emp.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{emp.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 shadow-[4px_4px_8px_#a7f3d0,-4px_-4px_8px_#ffffff] flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100 shadow-[inset_4px_4px_8px_#a7f3d0,inset_-4px_-4px_8px_#ffffff] text-sm font-medium text-emerald-800">
                          {emp.visitProvince}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-2">
                        {globalEditMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-32 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
                              value={emp.homeVisitBusFare}
                              onChange={(e) => handleGlobalUpdate(emp.id, 'homeVisitBusFare', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        ) : (
                          renderEditableValue(emp.id, 'homeVisitBusFare', emp.homeVisitBusFare, index, 'ค่ารถทัวร์')
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-2">
                        {globalEditMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-20 p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-center"
                              value={4}
                              onChange={() => {}} // Fixed at 4 for now
                            />
                          </div>
                        ) : (
                          <div className="font-bold text-lg text-blue-700">4</div>
                        )}
                        <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                          <Calculator className="w-3 h-3" />
                          ครั้ง/ปี
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="font-bold text-xl text-blue-900">{formatCurrency(emp.total)}</div>
                      <div className="text-sm text-blue-600">บาท</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {familyVisitData.length > 0 && (
              <tfoot className="bg-gradient-to-r from-slate-600 to-blue-600 text-white">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-bold text-lg">
                    ยอดรวมทั้งหมด:
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-2xl">{formatCurrency(familyVisitTotal)}</div>
                    <div className="text-sm opacity-90">บาท</div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-slate-600">พนักงานที่มีสิทธิ์</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.eligibleEmployees}</div>
            <div className="text-sm text-slate-500">คน</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">ยอดรวมทั้งหมด</div>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(familyVisitTotal)}</div>
            <div className="text-sm text-slate-500">บาท</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">เฉลี่ยต่อคน</div>
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.averagePerEmployee)}</div>
            <div className="text-sm text-slate-500">บาท</div>
          </div>
        </div>
      </div>
    </div>
  );
};