import React, { useState } from 'react';
import { Employee, MasterRates, TravelEmployee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, calculateTravelEmployees, getRatesForEmployee } from '../../utils/calculations';
import { Save, Info, Edit3, Check, X, ChevronLeft, ChevronRight, Users, Calendar, Calculator, Award, AlertCircle } from 'lucide-react';

interface TravelCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  calcYear: number;
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
}

export const TravelCalculationTable: React.FC<TravelCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  calcYear,
  onSave,
  onUpdateEmployee
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [currentCalcYear, setCurrentCalcYear] = useState(calcYear);
  const [customDays, setCustomDays] = useState({ hotelNights: 2, perDiemDays: 3, workDays: 245 });

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));
  const travelEmployees = calculateTravelEmployees(selectedEmployees, masterRates, currentCalcYear);
  
  // Calculate statistics
  const stats = {
    totalEmployees: selectedEmployees.length,
    eligibleEmployees: travelEmployees.length,
    totalCost: travelEmployees.reduce((sum, emp) => {
      const rates = getRatesForEmployee(emp, masterRates);
      const hotel = customDays.hotelNights * (rates.hotel || 0);
      const perDiem = customDays.perDiemDays * (rates.perDiem || 0);
      const travelRoundTrip = 2 * (rates.travel || 0);
      const localRoundTrip = 2 * (rates.local || 0);
      return sum + hotel + perDiem + travelRoundTrip + localRoundTrip;
    }, 0),
    byServiceYears: travelEmployees.reduce((acc, emp) => {
      acc[emp.serviceYears] = (acc[emp.serviceYears] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  };

  const handleDaysEditStart = (field: string, currentValue: number) => {
    setEditingValues(prev => ({ ...prev, [field]: currentValue }));
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleDaysEditSave = (field: string) => {
    const newValue = editingValues[field];
    if (newValue !== undefined) {
      setCustomDays(prev => ({ ...prev, [field]: parseInt(newValue) || 0 }));
    }
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const handleDaysEditCancel = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditingValues(prev => ({ ...prev, [field]: undefined }));
  };

  const renderEditableDays = (field: string, currentValue: number, label: string) => {
    const isEditing = editMode[field];
    const isWorkDays = field === 'workDays';
    const inputWidth = isWorkDays ? 'w-20' : 'w-16';
    const maxValue = isWorkDays ? 365 : 10;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={maxValue}
            className={`${inputWidth} p-2 text-center border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500`}
            value={editingValues[field] || currentValue}
            onChange={(e) => setEditingValues(prev => ({ ...prev, [field]: parseInt(e.target.value) || 0 }))}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleDaysEditSave(field)}
            className="p-1 h-7 w-7"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDaysEditCancel(field)}
            className="p-1 h-7 w-7"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className="font-bold text-blue-600 text-lg">{currentValue}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleDaysEditStart(field, currentValue)}
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            สรุปค่าใช้จ่ายการเดินทาง
          </h3>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentCalcYear(prev => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              ปีก่อนหน้า
            </Button>
            <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-xl font-bold text-blue-900">{currentCalcYear}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentCalcYear(prev => prev + 1)}
            >
              ปีถัดไป
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">พนักงานที่เลือก</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">มีสิทธิ์รับของ</p>
                <p className="text-2xl font-bold text-green-900">{stats.eligibleEmployees}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">ปีคำนวณ</p>
                <p className="text-2xl font-bold text-purple-900">{currentCalcYear}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">ยอดรวม</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(stats.totalCost)}</p>
              </div>
              <Calculator className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Service Years Breakdown */}
        {Object.keys(stats.byServiceYears).length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              การกระจายตามอายุงาน (ปี {currentCalcYear})
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.byServiceYears)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([years, count]) => (
                  <div key={years} className="text-center p-2 bg-green-100 rounded">
                    <div className="text-lg font-bold text-green-900">{count}</div>
                    <div className="text-xs text-green-700">{years} ปี</div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">เกณฑ์การคำนวณและที่มาของข้อมูล:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-1 text-xs">
                  <li>• <strong>เกณฑ์สิทธิ์:</strong> อายุงาน 20, 25, 30, 35, หรือ 40 ปี</li>
                  <li>• <strong>อัตราค่าใช้จ่าย:</strong> อ้างอิงจากตารางมาตรฐาน (ไม่แก้ไขได้)</li>
                  <li>• <strong>ค่าที่พัก:</strong> ตามระดับพนักงาน × จำนวนคืน</li>
                  <li>• <strong>ค่าเบี้ยเลี้ยง:</strong> ตามระดับพนักงาน × จำนวนวัน</li>
                </ul>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>ค่าเดินทาง:</strong> รถประจำทาง + รถรับจ้าง (ไป-กลับ)</li>
                  <li>• <strong>จำนวนวัน/คืน:</strong> แก้ไขได้ (ใช้สำหรับทุกคน)</li>
                  <li>• <strong>การคำนวณ:</strong> อัตโนมัติตามจำนวนที่กำหนด</li>
                  <li>• <strong>อัปเดต:</strong> ทันทีเมื่อเปลี่ยนแปลงค่า</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h5 className="font-semibold text-yellow-800 mb-4 flex items-center">
            <Edit3 className="w-4 h-4 mr-2" />
            ตั้งค่าการคำนวณ (แก้ไขได้)
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-yellow-300">
              <label className="text-sm font-medium text-yellow-700 mb-2 block">จำนวนคืนที่พัก</label>
              <div className="flex items-center gap-3">
                {renderEditableDays('hotelNights', customDays.hotelNights, 'จำนวนคืน')}
                <span className="text-sm text-yellow-700 font-medium">คืน</span>
              </div>
              <div className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                คลิกเพื่อแก้ไข
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-300">
              <label className="text-sm font-medium text-yellow-700 mb-2 block">จำนวนวันเบี้ยเลี้ยง</label>
              <div className="flex items-center gap-3">
                {renderEditableDays('perDiemDays', customDays.perDiemDays, 'จำนวนวัน')}
                <span className="text-sm text-yellow-700 font-medium">วัน</span>
              </div>
              <div className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                คลิกเพื่อแก้ไข
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-300">
              <label className="text-sm font-medium text-yellow-700 mb-2 block">วันทำการ/ปี</label>
              <div className="flex items-center gap-3">
                {renderEditableDays('workDays', customDays.workDays, 'วันทำการ')}
                <span className="text-sm text-yellow-700 font-medium">วัน</span>
              </div>
              <div className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                คลิกเพื่อแก้ไข
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-900">รหัสพนักงาน</th>
              <th className="px-4 py-3 font-medium text-gray-900">ชื่อ-สกุล</th>
              <th className="px-4 py-3 text-center font-medium text-gray-900">
                <div className="flex items-center justify-center gap-1">
                  <Award className="w-4 h-4" />
                  อายุงาน (ปี)
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">
                <div className="flex items-center justify-end gap-1">
                  ค่าที่พัก ({customDays.hotelNights} คืน)
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">
                <div className="flex items-center justify-end gap-1">
                  ค่าเบี้ยเลี้ยง ({customDays.perDiemDays} วัน)
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">
                <div className="flex items-center justify-end gap-1">
                  ค่ารถประจำทาง (ไป-กลับ)
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">
                <div className="flex items-center justify-end gap-1">
                  ค่ารถรับจ้าง (ไป-กลับ)
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 bg-blue-50">
                <div className="flex items-center justify-end gap-1">
                  <Calculator className="w-4 h-4" />
                  รวม (บาท)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {travelEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-12">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-12 h-12 text-gray-300" />
                    <div>
                      <p className="font-medium">ไม่พบพนักงานที่เข้าเกณฑ์สำหรับปี พ.ศ. {currentCalcYear}</p>
                      <p className="text-sm mt-1">
                        พนักงานต้องมีอายุงาน 20, 25, 30, 35, หรือ 40 ปี ในปีที่คำนวณ
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              travelEmployees.map((emp, index) => {
                const rates = getRatesForEmployee(emp, masterRates);
                const hotel = customDays.hotelNights * (rates.hotel || 0);
                const perDiem = customDays.perDiemDays * (rates.perDiem || 0);
                const travelRoundTrip = 2 * (rates.travel || 0);
                const localRoundTrip = 2 * (rates.local || 0);
                const total = hotel + perDiem + travelRoundTrip + localRoundTrip;
                
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                        {emp.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">ระดับ {emp.level} • เพศ{emp.gender}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        <Award className="w-4 h-4 mr-1" />
                        {emp.serviceYears}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-blue-600">{formatCurrency(hotel)}</div>
                        <div className="text-xs text-gray-500">
                          ({formatCurrency(rates.hotel)} × {customDays.hotelNights} คืน)
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-green-600">{formatCurrency(perDiem)}</div>
                        <div className="text-xs text-gray-500">
                          ({formatCurrency(rates.perDiem)} × {customDays.perDiemDays} วัน)
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-purple-600">{formatCurrency(travelRoundTrip)}</div>
                        <div className="text-xs text-gray-500">
                          ({formatCurrency(rates.travel)} × 2 เที่ยว)
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-orange-600">{formatCurrency(localRoundTrip)}</div>
                        <div className="text-xs text-gray-500">
                          ({formatCurrency(rates.local)} × 2 เที่ยว)
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
          {travelEmployees.length > 0 && (
            <tfoot className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200">
              <tr>
                <td colSpan={7} className="px-4 py-4 text-right font-bold text-lg text-blue-900">
                  ยอดรวมทั้งหมด:
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-bold text-2xl text-blue-900">{formatCurrency(stats.totalCost)}</div>
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
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCost)} บาท</div>
            </div>
            {stats.eligibleEmployees > 0 && (
              <div className="text-center">
                <div className="text-sm text-gray-600">เฉลี่ยต่อคน</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(stats.totalCost / stats.eligibleEmployees)} บาท
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