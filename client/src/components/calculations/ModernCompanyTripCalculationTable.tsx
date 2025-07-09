import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Employee, MasterRates, CompanyTripEmployee } from '../../types';
import { formatCurrency, calculateCompanyTrip } from '../../utils/calculations';
import { Save, Users, MapPin, Edit3, Check, X, Car, Award, Calculator, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ModernCompanyTripCalculationTableProps {
  employees: Employee[];
  masterRates: MasterRates;
  selectedEmployeeIds: string[];
  calcYear: number;
  onSave: () => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  globalEditMode?: boolean;
}

interface TripSettings {
  destination: string;
  busFare: number;
}

export const ModernCompanyTripCalculationTable: React.FC<ModernCompanyTripCalculationTableProps> = ({
  employees,
  masterRates,
  selectedEmployeeIds,
  calcYear,
  onSave,
  onUpdateEmployee,
  globalEditMode = false
}) => {
  const [tripSettings, setTripSettings] = useState<TripSettings>({
    destination: 'ขอนแก่น',
    busFare: 600
  });
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});

  // Calculate company trip data using unified function
  const companyTripData = useMemo(() => {
    return calculateCompanyTrip(employees, masterRates, calcYear, tripSettings.destination, tripSettings.busFare);
  }, [employees, masterRates, calcYear, tripSettings]);

  const companyTripTotal = companyTripData.reduce((sum, emp) => sum + emp.total, 0);

  const handleSettingChange = (field: string, value: any) => {
    setTripSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGlobalUpdate = (employeeId: string, field: string, value: any) => {
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex !== -1) {
      const updatedEmployee = { ...employees[employeeIndex] };
      (updatedEmployee as any)[field] = value;
      onUpdateEmployee(employeeIndex, updatedEmployee);
    }
  };

  const handleEditingChange = (key: string, value: any) => {
    setEditingValues(prev => ({ ...prev, [key]: value }));
  };

  const handleAccommodationUpdate = (employeeId: string, value: number) => {
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex !== -1) {
      const updatedEmployee = { ...employees[employeeIndex] };
      // Store custom accommodation cost in customTravelRates
      if (!updatedEmployee.customTravelRates) {
        updatedEmployee.customTravelRates = {};
      }
      updatedEmployee.customTravelRates.hotel = value;
      onUpdateEmployee(employeeIndex, updatedEmployee);
    }
  };

  const totalEmployees = companyTripData.length;
  const eligibleEmployees = companyTripData.filter(emp => emp.accommodationCost > 0).length;
  const ineligibleEmployees = totalEmployees - eligibleEmployees;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">เดินทางร่วมงานวันพนักงาน</h2>
                <p className="text-gray-600">คำนวณค่าใช้จ่ายการเดินทางร่วมงานและที่พัก</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'พนักงานทั้งหมด', value: totalEmployees, icon: Users, color: 'text-blue-600' },
              { label: 'มีสิทธิ์ค่าที่พัก', value: eligibleEmployees, icon: Award, color: 'text-green-600' },
              { label: 'ยอดรวมทั้งหมด', value: formatCurrency(companyTripTotal), icon: Calculator, color: 'text-purple-600' }
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

      {/* Settings Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50" style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-yellow-600" />
          ตั้งค่าการเดินทาง
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัดปลายทาง</label>
            <input
              type="text"
              value={tripSettings.destination}
              onChange={(e) => handleSettingChange('destination', e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร"
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ค่ารถโดยสาร (ทางเดียว)</label>
            <input
              type="text"
              value={tripSettings.busFare}
              onChange={(e) => handleSettingChange('busFare', parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">รหัส</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-สกุล</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ค่าที่พัก</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ค่ารถโดยสารไป-กลับ</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">หมายเหตุ</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {companyTripData.map((emp, index) => (
                <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-gray-600 font-medium">{emp.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{emp.name}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {globalEditMode ? (
                      <input
                        type="text"
                        className="w-32 p-2 border border-gray-300 rounded text-right"
                        value={editingValues[`accommodation-${emp.id}`] ?? emp.accommodationCost}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleEditingChange(`accommodation-${emp.id}`, value);
                        }}
                        onBlur={() => {
                          const value = editingValues[`accommodation-${emp.id}`];
                          if (value !== undefined) {
                            handleAccommodationUpdate(emp.id, value);
                          }
                        }}
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{formatCurrency(emp.accommodationCost)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-gray-900">{formatCurrency(tripSettings.busFare * 2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">{emp.note}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(emp.total)}</div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </Card>
    </div>
  );
};