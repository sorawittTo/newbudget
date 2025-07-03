import React, { useState } from 'react';
import { Employee, MasterRates, ManagerRotationEmployee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, calculateManagerRotation, getRatesForEmployee } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X } from 'lucide-react';

interface ManagerRotationCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  onSave: () => void;
}

export const ManagerRotationCalculationTable: React.FC<ManagerRotationCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  onSave
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [customRates, setCustomRates] = useState({
    busCost: 600,
    flightCost: 4000,
    taxiCost: 1000
  });

  const selectedEmployees = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) && emp.level === '7'
  );
  const managerRotationData = calculateManagerRotation(selectedEmployees, masterRates);

  const handleEditStart = (field: string, currentValue: number) => {
    setEditingValues(prev => ({ ...prev, [field]: currentValue }));
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleEditSave = (field: string) => {
    const newValue = editingValues[field];
    if (newValue !== undefined) {
      setCustomRates(prev => ({ ...prev, [field]: parseFloat(newValue) || 0 }));
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

  const calculateCustomTotal = () => {
    return managerRotationData.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const perDiemCost = rates.perDiem * 7;
      const accommodationCost = rates.hotel * 6;
      const totalTravel = customRates.busCost + customRates.flightCost + customRates.taxiCost;
      return sum + perDiemCost + accommodationCost + totalTravel;
    }, 0);
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">สรุปค่าเดินทางหมุนเวียนงาน ผจศ. ระดับ 7</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">เกณฑ์การคำนวณ:</p>
              <ul className="space-y-1 text-xs">
                <li>• แสดงเฉพาะพนักงานระดับ 7</li>
                <li>• ค่าเบี้ยเลี้ยง, ค่าที่พัก: อ้างอิงจากตารางอัตราค่าใช้จ่ายมาตรฐาน</li>
                <li>• ค่าเดินทาง: ค่าคงที่ (สามารถแก้ไขได้)</li>
                <li>• ระยะเวลา: เบี้ยเลี้ยง 7 วัน, ที่พัก 6 คืน</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mt-4">
          <h5 className="font-semibold text-yellow-800 mb-3">ค่าเดินทาง (ค่าคงที่)</h5>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-yellow-700">ค่ารถประจำทาง</label>
              <div className="mt-1">
                {renderEditableValue('busCost', customRates.busCost, 'ค่ารถประจำทาง')}
                <div className="text-xs text-orange-600 mt-1">แก้ไขได้</div>
              </div>
            </div>
            <div>
              <label className="text-sm text-yellow-700">ค่าเครื่องบิน</label>
              <div className="mt-1">
                {renderEditableValue('flightCost', customRates.flightCost, 'ค่าเครื่องบิน')}
                <div className="text-xs text-orange-600 mt-1">แก้ไขได้</div>
              </div>
            </div>
            <div>
              <label className="text-sm text-yellow-700">ค่ารถรับจ้าง</label>
              <div className="mt-1">
                {renderEditableValue('taxiCost', customRates.taxiCost, 'ค่ารถรับจ้าง')}
                <div className="text-xs text-orange-600 mt-1">แก้ไขได้</div>
              </div>
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
              <th className="px-4 py-3 text-right">ค่าเบี้ยเลี้ยง (7 วัน)</th>
              <th className="px-4 py-3 text-right">ค่าที่พัก (6 คืน)</th>
              <th className="px-4 py-3 text-right">ค่ารถประจำทาง โคราช - กทม</th>
              <th className="px-4 py-3 text-right">ค่ารถรับจ้าง ขนส่ง-ที่พัก</th>
              <th className="px-4 py-3 text-right font-semibold">รวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {managerRotationData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-8">
                  ไม่พบพนักงานระดับ 7
                </td>
              </tr>
            ) : (
              managerRotationData.map((emp, index) => {
                const rates = getRatesForEmployee(emp, masterRates);
                const perDiemCost = rates.perDiem * 7;
                const accommodationCost = rates.hotel * 6;
                const totalTravel = customRates.busCost + customRates.flightCost;
                const total = perDiemCost + accommodationCost + totalTravel + customRates.taxiCost;
                
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{emp.id}</td>
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(perDiemCost)}</div>
                      <div className="text-xs text-gray-500">
                        ({formatCurrency(rates.perDiem)} × 7 วัน)
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(accommodationCost)}</div>
                      <div className="text-xs text-gray-500">
                        ({formatCurrency(rates.hotel)} × 6 คืน)
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(totalTravel)}</div>
                      <div className="text-xs text-gray-500">
                        รถ {formatCurrency(customRates.busCost)} + เครื่องบิน {formatCurrency(customRates.flightCost)}
                      </div>
                      <div className="text-xs text-orange-600">ค่าคงที่ (แก้ไขได้)</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>{formatCurrency(customRates.taxiCost)}</div>
                      <div className="text-xs text-orange-600">ค่าคงที่ (แก้ไขได้)</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(total)}</td>
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
            {formatCurrency(calculateCustomTotal())} บาท
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