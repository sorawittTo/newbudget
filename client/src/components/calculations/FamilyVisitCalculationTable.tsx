import React, { useState } from 'react';
import { Employee, FamilyVisitEmployee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, calculateFamilyVisit } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X, Users, MapPin, Calculator, AlertCircle } from 'lucide-react';

interface FamilyVisitCalculationTableProps {
  employees: Employee[];
  selectedEmployeeIds: string[];
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
}

export const FamilyVisitCalculationTable: React.FC<FamilyVisitCalculationTableProps> = ({
  employees,
  selectedEmployeeIds,
  onSave,
  onUpdateEmployee
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  // Filter employees: not local, has visit province, and not Khon Kaen
  const eligibleEmployees = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) &&
    emp.level !== 'ท้องถิ่น' && 
    emp.visitProvince && 
    emp.visitProvince.trim() !== '' &&
    emp.visitProvince !== 'ขอนแก่น'
  );
  
  const familyVisitData = calculateFamilyVisit(eligibleEmployees);
  const familyVisitTotal = familyVisitData.reduce((sum, emp) => sum + emp.total, 0);

  // Statistics for display
  const stats = {
    totalEmployees: employees.length,
    selectedEmployees: selectedEmployeeIds.length,
    localEmployees: employees.filter(emp => emp.level === 'ท้องถิ่น').length,
    khonKaenEmployees: employees.filter(emp => emp.visitProvince === 'ขอนแก่น').length,
    eligibleEmployees: eligibleEmployees.length,
    noProvinceEmployees: employees.filter(emp => !emp.visitProvince || emp.visitProvince.trim() === '').length
  };

  const handleEditStart = (empId: string, field: string, currentValue: number) => {
    setEditingValues(prev => ({ ...prev, [`${empId}_${field}`]: currentValue }));
    setEditMode(prev => ({ ...prev, [`${empId}_${field}`]: true }));
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

  const renderEditableValue = (empId: string, field: string, currentValue: number, empIndex: number, label: string) => {
    const key = `${empId}_${field}`;
    const isEditing = editMode[key];
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="w-24 p-2 text-right border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            value={editingValues[key] || currentValue}
            onChange={(e) => setEditingValues(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleEditSave(empIndex, field, empId)}
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
        <span className="font-medium">{formatCurrency(currentValue)}</span>
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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">สรุปค่าเดินทางเยี่ยมครอบครัว</h3>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">พนักงานทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">มีสิทธิ์เดินทาง</p>
                <p className="text-2xl font-bold text-green-900">{stats.eligibleEmployees}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">พนักงานท้องถิ่น</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.localEmployees}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">อยู่ขอนแก่น</p>
                <p className="text-2xl font-bold text-purple-900">{stats.khonKaenEmployees}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
        
        {/* Filtering Information */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">เกณฑ์การคำนวณและการกรอง:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-1 text-xs">
                  <li>• <strong>แสดงเฉพาะ:</strong> พนักงานที่ไม่ใช่ "ท้องถิ่น"</li>
                  <li>• <strong>มีจังหวัดเยี่ยมบ้าน:</strong> ระบุจังหวัดแล้ว</li>
                  <li>• <strong>ไม่ใช่ขอนแก่น:</strong> จังหวัดเยี่ยมบ้านไม่ใช่ "ขอนแก่น"</li>
                  <li>• <strong>ถูกเลือก:</strong> อยู่ในรายการที่เลือกไว้</li>
                </ul>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>ค่ารถทัวร์:</strong> สามารถแก้ไขได้ในตาราง</li>
                  <li>• <strong>การคำนวณ:</strong> ค่ารถ × 4 ครั้ง × 2 เที่ยว (ไป-กลับ)</li>
                  <li>• <strong>ที่มาข้อมูล:</strong> จากตารางข้อมูลพนักงาน</li>
                  <li>• <strong>การอัปเดต:</strong> คำนวณใหม่ทันทีเมื่อแก้ไข</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Excluded Employees Summary */}
        {(stats.localEmployees > 0 || stats.khonKaenEmployees > 0 || stats.noProvinceEmployees > 0) && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              พนักงานที่ไม่มีสิทธิ์เดินทางเยี่ยมครอบครัว
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {stats.localEmployees > 0 && (
                <div className="text-yellow-700">
                  <strong>พนักงานท้องถิ่น:</strong> {stats.localEmployees} คน
                  <div className="text-xs text-yellow-600">ไม่มีสิทธิ์เดินทางเยี่ยมครอบครัว</div>
                </div>
              )}
              {stats.khonKaenEmployees > 0 && (
                <div className="text-purple-700">
                  <strong>อยู่ขอนแก่น:</strong> {stats.khonKaenEmployees} คน
                  <div className="text-xs text-purple-600">ไม่ต้องเดินทางเยี่ยมครอบครัว</div>
                </div>
              )}
              {stats.noProvinceEmployees > 0 && (
                <div className="text-red-700">
                  <strong>ไม่ระบุจังหวัด:</strong> {stats.noProvinceEmployees} คน
                  <div className="text-xs text-red-600">ยังไม่ได้ระบุจังหวัดเยี่ยมบ้าน</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-900">รหัสพนักงาน</th>
              <th className="px-4 py-3 font-medium text-gray-900">ชื่อ-สกุล</th>
              <th className="px-4 py-3 font-medium text-gray-900">ระดับ</th>
              <th className="px-4 py-3 font-medium text-gray-900">จังหวัดเยี่ยมบ้าน</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">
                <div className="flex items-center justify-end gap-1">
                  <Calculator className="w-4 h-4" />
                  ค่ารถทัวร์ (ต่อครั้ง)
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">
                <div className="flex items-center justify-end gap-1">
                  <Calculator className="w-4 h-4" />
                  รวม 4 ครั้ง × 2 เที่ยว
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 bg-blue-50">
                <div className="flex items-center justify-end gap-1">
                  <Calculator className="w-4 h-4" />
                  ยอดรวม (บาท)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {familyVisitData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-12">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-12 h-12 text-gray-300" />
                    <div>
                      <p className="font-medium">ไม่พบพนักงานที่เข้าเกณฑ์</p>
                      <p className="text-sm mt-1">
                        พนักงานต้องไม่ใช่ "ท้องถิ่น" และมีจังหวัดเยี่ยมบ้านที่ไม่ใช่ "ขอนแก่น"
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              familyVisitData.map((emp, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                      {emp.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">เพศ{emp.gender}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ระดับ {emp.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {emp.visitProvince}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="space-y-1">
                      {renderEditableValue(emp.id, 'homeVisitBusFare', emp.homeVisitBusFare, index, 'ค่ารถทัวร์')}
                      <div className="text-xs text-orange-600 flex items-center justify-end gap-1">
                        <Edit3 className="w-3 h-3" />
                        แก้ไขได้
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="space-y-1">
                      <div className="font-medium text-blue-600">{formatCurrency(emp.busFareTotal)}</div>
                      <div className="text-xs text-gray-500">
                        ({formatCurrency(emp.homeVisitBusFare)} × 4 × 2)
                      </div>
                      <div className="text-xs text-blue-600 flex items-center justify-end gap-1">
                        <Calculator className="w-3 h-3" />
                        คำนวณอัตโนมัติ
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50">
                    <div className="font-bold text-lg text-blue-900">{formatCurrency(emp.total)}</div>
                    <div className="text-xs text-blue-600">บาท</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {familyVisitData.length > 0 && (
            <tfoot className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200">
              <tr>
                <td colSpan={6} className="px-4 py-4 text-right font-bold text-lg text-blue-900">
                  ยอดรวมทั้งหมด:
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-bold text-2xl text-blue-900">{formatCurrency(familyVisitTotal)}</div>
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
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(familyVisitTotal)} บาท</div>
            </div>
            {familyVisitData.length > 0 && (
              <div className="text-center">
                <div className="text-sm text-gray-600">เฉลี่ยต่อคน</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(familyVisitTotal / familyVisitData.length)} บาท
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