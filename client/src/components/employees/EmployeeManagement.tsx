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
            type={isText ? "text" : "number"}
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
            
            <div className="flex flex-wrap gap-3">
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
              <Button onClick={handleExportClick} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <FileText className="w-4 h-4 mr-2" />
                ส่งออก Excel
              </Button>
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
              <Button onClick={onAddEmployee}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มพนักงาน
              </Button>
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
                  <th className="px-4 py-3 text-right font-semibold">ค่ารถทัวร์</th>
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
                  employees.map((emp, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <NeumorphismInput
                          type="text"
                          value={emp.id}
                          onChange={(e) => updateEmployeeField(index, 'id', e.target.value)}
                          placeholder="รหัสพนักงาน"
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismInput
                          type="text"
                          value={emp.name}
                          onChange={(e) => updateEmployeeField(index, 'name', e.target.value)}
                          placeholder="ชื่อ-สกุล"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateEmployeeField(index, 'gender', 'ชาย')}
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
                          type="number"
                          value={emp.startYear}
                          onChange={(e) => updateEmployeeField(index, 'startYear', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-3">
                        <NeumorphismSelect
                          value={emp.level}
                          onChange={(e) => updateEmployeeField(index, 'level', e.target.value)}
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
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={emp.homeVisitBusFare}
                          onChange={(e) => updateEmployeeField(index, 'homeVisitBusFare', parseFloat(e.target.value) || 0)}
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

      {/* Modern Neumorphism Rates Section */}
      {activeSection === 'rates' && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] p-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ตารางอัตราค่าใช้จ่ายมาตรฐาน
              </h2>
              <p className="text-slate-600 mt-2">จัดการอัตราค่าใช้จ่ายสำหรับแต่ละระดับตำแหน่ง</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {globalEditMode && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3 shadow-[inset_4px_4px_8px_#bfdbfe,inset_-4px_-4px_8px_#ffffff]">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm font-medium">โหมดแก้ไขเปิดอยู่ - แก้ไขได้ทุกช่องในตาราง</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setGlobalEditMode(!globalEditMode)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                    globalEditMode 
                      ? "bg-orange-100 shadow-[inset_8px_8px_16px_#fed7aa,inset_-8px_-8px_16px_#ffffff] text-orange-700" 
                      : "bg-purple-100 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] text-purple-700 hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  {globalEditMode ? 'ปิดการแก้ไข' : 'เปิดการแก้ไข'}
                </button>
                
                <button 
                  onClick={onSave}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
                
                <button 
                  onClick={handleExportClick}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  ส่งออก Excel
                </button>
              </div>
            </div>
          </div>
          
          {/* Modern Rates Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-[inset_10px_10px_20px_#e2e8f0,inset_-10px_-10px_20px_#ffffff] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                {/* Enhanced Table Header */}
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
                    <th className="px-6 py-4 text-left font-bold text-white">ตำแหน่ง</th>
                    <th className="px-6 py-4 text-center font-bold text-white">ระดับ</th>
                    <th className="px-6 py-4 text-right font-bold text-white">ค่าเช่าบ้าน</th>
                    <th className="px-6 py-4 text-right font-bold text-white">เงินช่วยเหลือรายเดือน</th>
                    <th className="px-6 py-4 text-right font-bold text-white">ค่าซื้อของเหมาจ่าย</th>
                    <th className="px-6 py-4 text-right font-bold text-white">ค่ารถประจำทาง</th>
                    <th className="px-6 py-4 text-right font-bold text-white">ค่ารถรับจ้าง</th>
                    <th className="px-6 py-4 text-right font-bold text-white">ค่าเบี้ยเลี้ยง</th>
                    <th className="px-6 py-4 text-right font-bold text-white">ค่าที่พัก</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(masterRates)
                    .sort((a, b) => parseFloat(b) - parseFloat(a))
                    .map((level, index) => {
                      const data = masterRates[level];
                      return (
                        <tr 
                          key={level} 
                          className="border-b border-slate-200/30 hover:bg-white/60 transition-all duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            {renderEditableCell(level, 'position', data.position, true)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] border border-blue-200/50">
                              <span className="text-blue-700 font-bold">ระดับ {level}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'rent', data.rent)}</td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'monthlyAssist', data.monthlyAssist)}</td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'lumpSum', data.lumpSum)}</td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'travel', data.travel)}</td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'local', data.local)}</td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'perDiem', data.perDiem)}</td>
                          <td className="px-6 py-4">{renderEditableCell(level, 'hotel', data.hotel)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};