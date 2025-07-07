import React, { useState } from 'react';
import { Employee, MasterRates, CompanyTripEmployee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, calculateCompanyTrip, getRatesForEmployee } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X } from 'lucide-react';

interface CompanyTripCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
}

export const CompanyTripCalculationTable: React.FC<CompanyTripCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  onSave
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [customBusFare, setCustomBusFare] = useState(600);

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));
  const companyTripData = calculateCompanyTrip(selectedEmployees, masterRates);
  const companyTripTotal = companyTripData.reduce((sum, emp) => sum + emp.total, 0);

  const handleEditStart = (field: string, currentValue: number) => {
    setEditingValues(prev => ({ ...prev, [field]: currentValue }));
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleEditSave = (field: string) => {
    const newValue = editingValues[field];
    if (newValue !== undefined && field === 'busFare') {
      setCustomBusFare(parseFloat(newValue) || 600);
    }
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const handleEditCancel = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const renderEditableValue = (field: string, currentValue: number, label: string) => {
    const isEditing = editMode[field];
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="w-20 p-1 text-right border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            value={editingValues[field] || currentValue}
            onChange={(e) => setEditingValues(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleEditSave(field)}
            className="p-1 h-6 w-6"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditCancel(field)}
            className="p-1 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span>{formatCurrency(currentValue)}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleEditStart(field, currentValue)}
          className="p-1 h-6 w-6 opacity-50 hover:opacity-100"
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
        <h3 className="text-xl font-semibold text-gray-900">สรุปค่าเดินทางร่วมงานวันพนักงาน</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">เกณฑ์การคำนวณ:</p>
              <ul className="space-y-1 text-xs">
                <li>• ค่ารถทัวร์: ค่าคงที่ (สามารถแก้ไขได้)</li>
                <li>• ค่าที่พัก: อ้างอิงจากตารางอัตราค่าใช้จ่ายมาตรฐาน</li>
                <li>• ผู้บริหารระดับ 7: พักเดี่ยว</li>
                <li>• พนักงานอื่นๆ: จับคู่พักตามเพศ (ใช้อัตราสูงสุดของคู่)</li>
                <li>• พนักงานท้องถิ่น/ขอนแก่น: ไม่คิดค่าที่พัก</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-yellow-800">ค่ารถทัวร์ (ทุกคน)</h5>
              <p className="text-sm text-yellow-700">ค่าคงที่สำหรับทุกคน</p>
            </div>
            <div className="text-right">
              {renderEditableValue('busFare', customBusFare, 'ค่ารถทัวร์')}
              <div className="text-xs text-orange-600 mt-1">แก้ไขได้</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">รหัสพนักงาน</th>
              <th className="px-4 py-3">ชื่อ-สกุล</th>
              <th className="px-4 py-3 text-right">ค่ารถทัวร์</th>
              <th className="px-4 py-3 text-right">ค่าที่พัก</th>
              <th className="px-4 py-3 text-right font-semibold">รวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {companyTripData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-8">
                  ไม่มีข้อมูลพนักงาน
                </td>
              </tr>
            ) : (
              companyTripData.map((emp, index) => {
                const rates = getRatesForEmployee(emp, masterRates);
                const actualBusFare = customBusFare;
                const actualTotal = actualBusFare + emp.accommodationCost;
                
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{emp.id}</td>
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(actualBusFare)}</div>
                      <div className="text-xs text-orange-600">ค่าคงที่ (แก้ไขได้)</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(emp.accommodationCost)}</div>
                      <div className="text-xs text-gray-500">{emp.note}</div>
                      {emp.accommodationCost > 0 && (
                        <div className="text-xs text-blue-600">
                          อัตรา {formatCurrency(rates.hotel)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(actualTotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">ยอดรวมทั้งหมด:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(companyTripData.reduce((sum, emp) => sum + customBusFare + emp.accommodationCost, 0))} บาท
          </span>
        </div>
        <div className="flex gap-4">
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
        </div>
      </div>
    </Card>
  );
};