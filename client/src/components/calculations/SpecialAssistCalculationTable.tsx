import React, { useState } from 'react';
import { Employee, MasterRates, SpecialAssistEmployee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, calculateSpecialAssist, getRatesForEmployee } from '../../utils/calculations';
import { Save, Edit3, Check, X, Users, Calculator, AlertCircle, Heart, CheckCircle, Info, TrendingUp, DollarSign } from 'lucide-react';

interface SpecialAssistCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
}

export const SpecialAssistCalculationTable: React.FC<SpecialAssistCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  onSave,
  onUpdateEmployee
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [customMonths, setCustomMonths] = useState<Record<string, number>>({});
  const [customLumpSum, setCustomLumpSum] = useState<Record<string, number>>({});

  // Filter employees: selected and has eligible status only
  const eligibleEmployees = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) &&
    (emp as any).status === 'มีสิทธิ์'
  );
  
  const specialAssistData = calculateSpecialAssist(eligibleEmployees, masterRates);

  // Define helper functions before they are used
  const getMonthsForEmployee = (empId: string) => {
    return customMonths[empId] || 12;
  };

  const getLumpSumForEmployee = (empId: string) => {
    return customLumpSum[empId] || 0;
  };

  function calculateCustomTotal() {
    return specialAssistData.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const months = getMonthsForEmployee(emp.id);
      const totalRent = rates.rent * months;
      const totalMonthlyAssist = rates.monthlyAssist * months;
      const lumpSum = getLumpSumForEmployee(emp.id);
      return sum + totalRent + totalMonthlyAssist + lumpSum;
    }, 0);
  }

  // Statistics for executive summary - now calculated after helper functions are defined
  const stats = {
    totalEmployees: employees.length,
    eligibleEmployees: eligibleEmployees.length,
    totalBudget: calculateCustomTotal(),
    averagePerEmployee: eligibleEmployees.length > 0 ? calculateCustomTotal() / eligibleEmployees.length : 0,
    byLevel: eligibleEmployees.reduce((acc, emp) => {
      acc[emp.level] = (acc[emp.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const handleEditStart = (empId: string, field: string, currentValue: number) => {
    setEditingValues(prev => ({ ...prev, [`${empId}_${field}`]: currentValue }));
    setEditMode(prev => ({ ...prev, [`${empId}_${field}`]: true }));
  };

  const handleEditSave = (empId: string, field: string) => {
    const key = `${empId}_${field}`;
    const newValue = editingValues[key];
    
    if (newValue !== undefined) {
      if (field === 'months') {
        setCustomMonths(prev => ({ ...prev, [empId]: parseInt(newValue) || 12 }));
      } else if (field === 'lumpSum') {
        setCustomLumpSum(prev => ({ ...prev, [empId]: parseFloat(newValue) || 0 }));
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

  const renderEditableValue = (empId: string, field: string, currentValue: number, label: string) => {
    const key = `${empId}_${field}`;
    const isEditing = editMode[key];
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            min={field === 'months' ? "1" : "0"}
            max={field === 'months' ? "12" : undefined}
            className="w-20 p-2 text-center border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            value={editingValues[key] || currentValue}
            onChange={(e) => setEditingValues(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleEditSave(empId, field)}
            className="p-1 h-7 w-7"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditCancel(empId, field)}
            className="p-1 h-7 w-7"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className="font-bold text-blue-600">{field === 'months' ? currentValue : formatCurrency(currentValue)}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleEditStart(empId, field, currentValue)}
          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
          title={`แก้ไข${label}`}
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">สรุปยอดเงินช่วยเหลืออื่นๆ</h3>
        
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            สรุปสำหรับผู้บริหาร
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.eligibleEmployees}</div>
              <div className="text-sm text-blue-700">พนักงานที่มีสิทธิ์</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalBudget)}</div>
              <div className="text-sm text-green-700">งบประมาณรวม</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.averagePerEmployee)}</div>
              <div className="text-sm text-purple-700">เฉลี่ยต่อคน</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{Object.keys(stats.byLevel).length}</div>
              <div className="text-sm text-orange-700">ระดับที่เกี่ยวข้อง</div>
            </div>
          </div>
        </div>

        {/* Calculation Methodology */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
          <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            วิธีการคำนวณและที่มาของข้อมูล
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div>
              <p className="font-medium mb-2">🏠 ค่าเช่าบ้าน</p>
              <ul className="space-y-1 text-xs">
                <li>• อ้างอิงจากตารางอัตราค่าใช้จ่ายมาตรฐาน</li>
                <li>• คำนวณ: อัตราต่อเดือน × จำนวนเดือน</li>
                <li>• จำนวนเดือนสามารถปรับแต่งได้</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">💰 เงินช่วยเหลือรายเดือน</p>
              <ul className="space-y-1 text-xs">
                <li>• อ้างอิงจากตารางอัตราค่าใช้จ่ายมาตรฐาน</li>
                <li>• คำนวณ: อัตราต่อเดือน × จำนวนเดือน</li>
                <li>• เชื่อมโยงกับระดับพนักงาน</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">🛒 ค่าซื้อของเหมาจ่าย</p>
              <ul className="space-y-1 text-xs">
                <li>• ค่าใช้จ่ายเพิ่มเติมตามความจำเป็น</li>
                <li>• สามารถกรอกและแก้ไขได้</li>
                <li>• คำนวณรวมในยอดรวมอัตโนมัติ</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">✅ เกณฑ์การมีสิทธิ์</p>
              <ul className="space-y-1 text-xs">
                <li>• สถานะพนักงาน: "มีสิทธิ์"</li>
                <li>• ถูกเลือกในรายการคำนวณ</li>
                <li>• มีข้อมูลระดับในตารางอัตรา</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Level Distribution */}
        {Object.keys(stats.byLevel).length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              การกระจายตามระดับพนักงาน
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.byLevel)
                .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
                .map(([level, count]) => (
                  <div key={level} className="text-center p-3 bg-green-100 rounded-lg">
                    <div className="text-lg font-bold text-green-900">{count}</div>
                    <div className="text-xs text-green-700">ระดับ {level}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-900 w-32">รหัสพนักงาน</th>
              <th className="px-4 py-3 font-medium text-gray-900 w-48">ชื่อ-สกุล</th>
              <th className="px-4 py-3 font-medium text-gray-900 w-24 text-center">ระดับ</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 w-44">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="w-4 h-4" />
                  ค่าเช่าบ้าน
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 w-44">
                <div className="flex items-center justify-end gap-1">
                  <Heart className="w-4 h-4" />
                  เงินช่วยเหลือรายเดือน
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 w-40">
                <div className="flex items-center justify-end gap-1">
                  <Edit3 className="w-4 h-4" />
                  ค่าซื้อของเหมาจ่าย
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 bg-blue-50 w-32">
                <div className="flex items-center justify-end gap-1">
                  <Calculator className="w-4 h-4" />
                  รวม (บาท)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {specialAssistData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-12">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-12 h-12 text-gray-300" />
                    <div>
                      <p className="font-medium">ไม่มีข้อมูลพนักงานที่เข้าเกณฑ์</p>
                      <p className="text-sm mt-1">พนักงานต้องมีสถานะ "มีสิทธิ์"</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              specialAssistData.map((emp, index) => {
                const rates = getRatesForEmployee(emp, masterRates);
                const months = getMonthsForEmployee(emp.id);
                const totalRent = rates.rent * months;
                const totalMonthlyAssist = rates.monthlyAssist * months;
                const lumpSum = getLumpSumForEmployee(emp.id);
                const total = totalRent + totalMonthlyAssist + lumpSum;
                
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                        {emp.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>เพศ{emp.gender}</span>
                        <span>•</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          มีสิทธิ์
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-green-600">{formatCurrency(totalRent)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(rates.rent)} × {renderEditableValue(emp.id, 'months', months, 'จำนวนเดือน')} เดือน
                        </div>
                        <div className="text-xs text-blue-600">จากตารางมาตรฐาน</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-purple-600">{formatCurrency(totalMonthlyAssist)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(rates.monthlyAssist)} × {months} เดือน
                        </div>
                        <div className="text-xs text-blue-600">จากตารางมาตรฐาน</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        {renderEditableValue(emp.id, 'lumpSum', lumpSum, 'ค่าซื้อของเหมาจ่าย')}
                        <div className="text-xs text-orange-600 flex items-center justify-end gap-1">
                          <Edit3 className="w-3 h-3" />
                          แก้ไขได้
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right bg-blue-50">
                      <div className="font-bold text-lg text-blue-900">{formatCurrency(total)}</div>
                      <div className="text-xs text-blue-600">บาท</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {specialAssistData.length > 0 && (
            <tfoot className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200">
              <tr>
                <td colSpan={6} className="px-4 py-4 text-right font-bold text-lg text-blue-900">
                  ยอดรวมทั้งหมด:
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-bold text-2xl text-blue-900">{formatCurrency(calculateCustomTotal())}</div>
                  <div className="text-sm text-blue-700">บาท</div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">พนักงานที่มีสิทธิ์</div>
              <div className="text-2xl font-bold text-green-600">{stats.eligibleEmployees} คน</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">ยอดรวมทั้งหมด</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(calculateCustomTotal())} บาท</div>
            </div>
            {specialAssistData.length > 0 && (
              <div className="text-center">
                <div className="text-sm text-gray-600">เฉลี่ยต่อคน</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(calculateCustomTotal() / specialAssistData.length)} บาท
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={onSave} size="lg">
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};