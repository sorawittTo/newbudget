import React, { useState } from 'react';
import { Employee, MasterRates } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { NeumorphismSelect } from '../ui/NeumorphismSelect';
import { exportEmployeesToExcel, exportMasterRatesToExcel } from '../../utils/excel';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  RotateCcw,
  Users,
  Settings,
  Edit3,
  Check,
  X,
  User,
  UserCheck,
  Crown,
  ShieldCheck,
  XCircle,
  FileText
} from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  masterRates: MasterRates;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onAddEmployee: () => void;
  onDeleteEmployee: (index: number) => void;
  onUpdateMasterRate: (level: string, key: string, value: any) => void;
  onSave: () => void;
  onExport: () => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  masterRates,
  onUpdateEmployee,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateMasterRate,
  onSave,
  onExport
}) => {
  const [activeSection, setActiveSection] = useState<'employees' | 'rates'>('employees');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [globalEditMode, setGlobalEditMode] = useState(false);

  const updateEmployeeField = (index: number, field: keyof Employee, value: any) => {
    const employee = employees[index];
    const updatedEmployee = { ...employee, [field]: value };
    onUpdateEmployee(index, updatedEmployee);
  };

  const levelOptions = Object.keys(masterRates).sort((a, b) => parseFloat(b) - parseFloat(a));

  const handleRateEdit = (level: string, field: string, value: string) => {
    const cellKey = `${level}-${field}`;
    setEditingCell(cellKey);
    setTempValue(value);
  };

  const handleRateSave = (level: string, field: string) => {
    onUpdateMasterRate(level, field, tempValue);
    setEditingCell(null);
    setTempValue('');
  };

  const handleRateCancel = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const handleExportClick = async () => {
    if (activeSection === 'employees') {
      await exportEmployeesToExcel(employees);
    } else if (activeSection === 'rates') {
      await exportMasterRatesToExcel(masterRates);
    }
  };

  const renderEditableCell = (level: string, field: string, value: any, isText = false) => {
    const cellKey = `${level}-${field}`;
    const isEditing = editingCell === cellKey;

    if (globalEditMode) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700 font-medium text-right"
            value={value}
            onChange={(e) => {
              onUpdateMasterRate(level, field, isText ? e.target.value : parseFloat(e.target.value) || 0);
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`p-3 rounded-xl transition-all duration-300 ${
          isText ? 'text-left' : 'text-right font-mono text-lg font-bold'
        } ${
          'cursor-default'
        }`}
        onClick={() => null}
      >
        {isText ? value : (
          <span className="text-slate-700">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">จัดการข้อมูลพนักงาน</h2>
              <p className="text-green-100">จัดการข้อมูลพนักงานและตารางอัตราค่าใช้จ่ายมาตรฐาน</p>
            </div>
            

          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveSection('employees')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeSection === 'employees'
                  ? 'bg-white text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                ข้อมูลพนักงาน ({employees.length} คน)
              </div>
            </button>
            <button
              onClick={() => setActiveSection('rates')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeSection === 'rates'
                  ? 'bg-white text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" />
                ตารางอัตราค่าใช้จ่าย ({Object.keys(masterRates).length} ระดับ)
              </div>
            </button>
          </nav>
        </div>
      </Card>

      {/* Employee Section */}
      {activeSection === 'employees' && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">รายชื่อพนักงาน</h3>
              <div className="flex gap-3">
                <Button onClick={onAddEmployee}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มพนักงาน
                </Button>
                <Button 
                  onClick={() => setGlobalEditMode(!globalEditMode)}
                  variant={globalEditMode ? "secondary" : "primary"}
                  className={globalEditMode 
                    ? "bg-orange-600 hover:bg-orange-700 text-white" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                  }
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {globalEditMode ? 'ปิดการแก้ไข' : 'แก้ไข'}
                </Button>
                <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </Button>
                <Button onClick={handleExportClick} variant="secondary" className="bg-gray-600 hover:bg-gray-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  ส่งออก Excel
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">รหัสพนักงาน</th>
                  <th className="px-4 py-3 text-left font-semibold">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-center font-semibold">เพศ</th>
                  <th className="px-4 py-3 text-center font-semibold">ปีเริ่มงาน</th>
                  <th className="px-4 py-3 text-center font-semibold">ระดับ</th>
                  <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                  <th className="px-4 py-3 text-left font-semibold">จังหวัดเยี่ยมบ้าน</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่ารถเยี่ยมบ้าน</th>
                  <th className="px-4 py-3 text-center font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center gap-3">
                        <User className="w-12 h-12 text-gray-300" />
                        <p>ไม่มีข้อมูลพนักงาน</p>
                        <Button onClick={onAddEmployee} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มพนักงานคนแรก
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees
                    .sort((a, b) => {
                      // เรียงตามระดับจากสูงไปต่ำ (7 -> 6 -> 5.5 -> 5 -> 4.5 -> 4 -> 3)
                      const levelA = parseFloat(a.level);
                      const levelB = parseFloat(b.level);
                      if (levelA !== levelB) {
                        return levelB - levelA;
                      }
                      // ถ้าระดับเดียวกัน เรียงตามชื่อ
                      return a.name.localeCompare(b.name, 'th');
                    })
                    .map((emp, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <NeumorphismInput
                          type="text"
                          value={emp.id}
                          onChange={(e) => updateEmployeeField(index, 'id', e.target.value)}
                          placeholder="รหัสพนักงาน"
                          disabled={!globalEditMode}
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="text"
                          value={emp.name}
                          onChange={(e) => updateEmployeeField(index, 'name', e.target.value)}
                          placeholder="ชื่อ-สกุล"
                          disabled={!globalEditMode}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateEmployeeField(index, 'gender', 'ชาย')}
                            disabled={!globalEditMode}
                            className={`p-3 rounded-2xl transition-all duration-300 ${
                              emp.gender === 'ชาย' 
                                ? 'bg-gray-100 text-blue-600 shadow-inner' 
                                : 'bg-gray-100 text-gray-400 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:text-blue-500'
                            }`}
                            style={{
                              boxShadow: emp.gender === 'ชาย' 
                                ? 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
                                : '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff'
                            }}
                            title="ชาย"
                          >
                            <User className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEmployeeField(index, 'gender', 'หญิง')}
                            disabled={!globalEditMode}
                            className={`p-3 rounded-2xl transition-all duration-300 ${
                              emp.gender === 'หญิง' 
                                ? 'bg-gray-100 text-pink-600 shadow-inner' 
                                : 'bg-gray-100 text-gray-400 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:text-pink-500'
                            }`}
                            style={{
                              boxShadow: emp.gender === 'หญิง' 
                                ? 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
                                : '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff'
                            }}
                            title="หญิง"
                          >
                            <Crown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="text"
                          value={emp.startYear}
                          onChange={(e) => updateEmployeeField(index, 'startYear', parseInt(e.target.value) || 0)}
                          className="text-center"
                          disabled={!globalEditMode}
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismSelect
                          value={emp.level}
                          onChange={(e) => updateEmployeeField(index, 'level', e.target.value)}
                          disabled={!globalEditMode}
                        >
                          {levelOptions.map(level => (
                            <option key={level} value={level}>ระดับ {level}</option>
                          ))}
                        </NeumorphismSelect>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateEmployeeField(index, 'status', 'มีสิทธิ์')}
                            disabled={!globalEditMode}
                            className={`p-3 rounded-2xl transition-all duration-300 ${
                              (emp as any).status === 'มีสิทธิ์' || !(emp as any).status
                                ? 'bg-gray-100 text-green-600 shadow-inner' 
                                : 'bg-gray-100 text-gray-400 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:text-green-500'
                            }`}
                            style={{
                              boxShadow: (emp as any).status === 'มีสิทธิ์' || !(emp as any).status
                                ? 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
                                : '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff'
                            }}
                            title="มีสิทธิ์"
                          >
                            <ShieldCheck className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEmployeeField(index, 'status', 'หมดสิทธิ์')}
                            disabled={!globalEditMode}
                            className={`p-3 rounded-2xl transition-all duration-300 ${
                              (emp as any).status === 'หมดสิทธิ์'
                                ? 'bg-gray-100 text-red-600 shadow-inner' 
                                : 'bg-gray-100 text-gray-400 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:text-red-500'
                            }`}
                            style={{
                              boxShadow: (emp as any).status === 'หมดสิทธิ์'
                                ? 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
                                : '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff'
                            }}
                            title="หมดสิทธิ์"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={emp.visitProvince}
                          onChange={(e) => updateEmployeeField(index, 'visitProvince', e.target.value)}
                          placeholder="จังหวัด"
                          disabled={!globalEditMode}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={emp.homeVisitBusFare}
                          onChange={(e) => updateEmployeeField(index, 'homeVisitBusFare', parseFloat(e.target.value) || 0)}
                          disabled={!globalEditMode}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDeleteEmployee(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Master Rates Section */}
      {activeSection === 'rates' && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">ตารางอัตราค่าใช้จ่ายมาตรฐาน</h3>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setGlobalEditMode(!globalEditMode)}
                  variant={globalEditMode ? "secondary" : "primary"}
                  className={globalEditMode 
                    ? "bg-orange-600 hover:bg-orange-700 text-white" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                  }
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {globalEditMode ? 'ปิดการแก้ไข' : 'แก้ไข'}
                </Button>
                <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </Button>
                <Button onClick={handleExportClick} variant="secondary" className="bg-gray-600 hover:bg-gray-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  ส่งออก Excel
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ตำแหน่ง</th>
                  <th className="px-4 py-3 text-center font-semibold">ระดับ</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่าเช่าบ้าน</th>
                  <th className="px-4 py-3 text-right font-semibold">เงินช่วยเหลือรายเดือน</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่าซื้อของเหมาจ่าย</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่าพาหนะประจำทาง<br />ศนร.-กทม. ไปกลับ</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่าพาหนะรับจ้าง<br />ขนส่ง-ที่พัก ไป-กลับ</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่าเบี้ยเลี้ยง</th>
                  <th className="px-4 py-3 text-right font-semibold">ค่าที่พัก</th>
                </tr>
              </thead>
              <tbody>
                {levelOptions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Settings className="w-12 h-12 text-gray-300" />
                        <p>ไม่มีข้อมูลอัตราค่าใช้จ่าย</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  levelOptions.map((level) => {
                    const rate = masterRates[level] || {
                      position: '', rent: 0, monthlyAssist: 0, souvenirAllowance: 0, 
                      travel: 0, local: 0, perDiem: 0, hotel: 0
                    };
                    return (
                      <tr key={level} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <NeumorphismInput
                            type="text"
                            value={rate.position}
                            onChange={(e) => onUpdateMasterRate(level, 'position', e.target.value)}
                            placeholder="ตำแหน่ง"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {level}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.rent}
                            onChange={(e) => onUpdateMasterRate(level, 'rent', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.monthlyAssist}
                            onChange={(e) => onUpdateMasterRate(level, 'monthlyAssist', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.souvenirAllowance}
                            onChange={(e) => onUpdateMasterRate(level, 'souvenirAllowance', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.travel}
                            onChange={(e) => onUpdateMasterRate(level, 'travel', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.local}
                            onChange={(e) => onUpdateMasterRate(level, 'local', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.perDiem}
                            onChange={(e) => onUpdateMasterRate(level, 'perDiem', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <NeumorphismInput
                            type="text"
                            value={rate.hotel}
                            onChange={(e) => onUpdateMasterRate(level, 'hotel', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!globalEditMode}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};