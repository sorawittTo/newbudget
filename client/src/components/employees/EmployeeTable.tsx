import React, { useState } from 'react';
import { Employee, MasterRates } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Trash2, FileText, Upload, User, UserCheck, UserX, Users, User as MaleIcon, Crown, CheckCircle, XCircle, Shield, ShieldCheck } from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedTravelEmployees: string[];
  selectedSpecialAssistEmployees: string[];
  selectedFamilyVisitEmployees: string[];
  selectedCompanyTripEmployees: string[];
  selectedManagerRotationEmployees: string[];
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onAddEmployee: () => void;
  onDeleteEmployee: (index: number) => void;
  onUpdateSelection: (type: string, employeeIds: string[]) => void;
  globalEditMode?: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  masterRates,
  selectedTravelEmployees,
  onUpdateEmployee,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateSelection,
  globalEditMode = false
}) => {
  const [attachedDocuments, setAttachedDocuments] = useState<Array<{
    name: string;
    url: string;
    uploadDate: Date;
  }>>([]);

  const updateEmployeeField = (index: number, field: keyof Employee, value: any) => {
    const employee = employees[index];
    const updatedEmployee = { ...employee, [field]: value };
    onUpdateEmployee(index, updatedEmployee);
  };

  const levelOptions = Object.keys(masterRates).sort((a, b) => parseFloat(b) - parseFloat(a));

  const handleSelectionChange = (employeeId: string, isSelected: boolean) => {
    let newSelection;
    if (isSelected) {
      newSelection = [...selectedTravelEmployees, employeeId];
    } else {
      newSelection = selectedTravelEmployees.filter(id => id !== employeeId);
    }
    
    // Update all calculation types with the same selection
    onUpdateSelection('travel', newSelection);
    onUpdateSelection('special-assist', newSelection);
    onUpdateSelection('family-visit', newSelection);
    onUpdateSelection('company-trip', newSelection);
    onUpdateSelection('manager-rotation', newSelection);
  };

  const handleSelectAll = () => {
    const allEmployeeIds = employees.map(emp => emp.id);
    onUpdateSelection('travel', allEmployeeIds);
    onUpdateSelection('special-assist', allEmployeeIds);
    onUpdateSelection('family-visit', allEmployeeIds);
    onUpdateSelection('company-trip', allEmployeeIds);
    onUpdateSelection('manager-rotation', allEmployeeIds);
  };

  const handleSelectNone = () => {
    onUpdateSelection('travel', []);
    onUpdateSelection('special-assist', []);
    onUpdateSelection('family-visit', []);
    onUpdateSelection('company-trip', []);
    onUpdateSelection('manager-rotation', []);
  };

  const isEmployeeSelected = (employeeId: string) => {
    return selectedTravelEmployees.includes(employeeId);
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Create a URL for the PDF file
      const url = URL.createObjectURL(file);
      const newDoc = {
        name: file.name,
        url: url,
        uploadDate: new Date()
      };
      setAttachedDocuments(prev => [...prev, newDoc]);
      
      // Open the PDF in a new tab
      window.open(url, '_blank');
    } else {
      alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
    }
    // Reset the input
    event.target.value = '';
  };

  const removeDocument = (index: number) => {
    setAttachedDocuments(prev => {
      const doc = prev[index];
      URL.revokeObjectURL(doc.url); // Clean up the URL
      return prev.filter((_, i) => i !== index);
    });
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Employee Management */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">รายชื่อพนักงาน</h3>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <Button
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  variant="secondary"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  แนบระเบียบ PDF
                </Button>
              </div>
              <Button onClick={onAddEmployee} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มพนักงาน
              </Button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-semibold text-blue-700 text-lg flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  เลือกพนักงานสำหรับการคำนวณ
                </h5>
                <p className="text-sm text-blue-700 opacity-80">
                  เลือกแล้ว {selectedTravelEmployees.length} คน จากทั้งหมด {employees.length} คน
                  (ใช้สำหรับการคำนวณทุกประเภท)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedTravelEmployees.length === employees.length}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  เลือกทั้งหมด
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectNone}
                  disabled={selectedTravelEmployees.length === 0}
                >
                  <UserX className="w-4 h-4 mr-1" />
                  ยกเลิกทั้งหมด
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-16 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedTravelEmployees.length === employees.length && employees.length > 0}
                      onChange={(e) => e.target.checked ? handleSelectAll() : handleSelectNone()}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </th>
                <th className="px-4 py-3">รหัสพนักงาน</th>
                <th className="px-4 py-3">ชื่อ-สกุล</th>
                <th className="px-4 py-3 text-center">เพศ</th>
                <th className="px-4 py-3">ปีเริ่มงาน</th>
                <th className="px-4 py-3">ระดับ</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3">จังหวัดเยี่ยมบ้าน</th>
                <th className="px-4 py-3 text-right">ค่ารถเยี่ยมบ้าน</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-8">
                    ไม่มีข้อมูลพนักงาน
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr key={index} className={`border-b border-gray-200 transition-colors ${
                    isEmployeeSelected(emp.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isEmployeeSelected(emp.id)}
                        onChange={(e) => handleSelectionChange(emp.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emp.id}
                        onChange={(e) => updateEmployeeField(index, 'id', e.target.value)}
                        disabled={!globalEditMode}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emp.name}
                        onChange={(e) => updateEmployeeField(index, 'name', e.target.value)}
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
                          <MaleIcon className="w-5 h-5" />
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
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emp.startYear}
                        onChange={(e) => updateEmployeeField(index, 'startYear', parseInt(e.target.value) || 0)}
                        disabled={!globalEditMode}
                        style={{
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none'
                        }}
                        onWheel={(e) => e.preventDefault()}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emp.level}
                        onChange={(e) => updateEmployeeField(index, 'level', e.target.value)}
                        disabled={!globalEditMode}
                      >
                        {levelOptions.map(level => (
                          <option key={level} value={level}>ระดับ {level}</option>
                        ))}
                      </select>
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emp.visitProvince}
                        onChange={(e) => updateEmployeeField(index, 'visitProvince', e.target.value)}
                        disabled={!globalEditMode}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full p-2 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emp.homeVisitBusFare}
                        onChange={(e) => updateEmployeeField(index, 'homeVisitBusFare', parseFloat(e.target.value) || 0)}
                        disabled={!globalEditMode}
                        style={{
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none'
                        }}
                        onWheel={(e) => e.preventDefault()}
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

      {/* Attached Documents */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            เอกสารที่แนบ
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            เอกสารระเบียบและไฟล์ที่เกี่ยวข้องกับการจัดการพนักงาน
          </p>
        </div>
        
        <div className="p-6">
          {attachedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">ยังไม่มีเอกสารที่แนบ</p>
              <p className="text-sm text-gray-400 mt-1">
                ใช้ปุ่ม "แนบระเบียบ PDF" ด้านบนเพื่อเพิ่มเอกสาร
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attachedDocuments.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate" title={doc.name}>
                          {doc.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          แนบเมื่อ: {doc.uploadDate.toLocaleDateString('th-TH')}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openDocument(doc.url)}
                          >
                            เปิดดู
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeDocument(index)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};