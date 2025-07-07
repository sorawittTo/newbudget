import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../../types';
import { Button } from '../ui/Button';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { 
  Heart, 
  Banknote, 
  Clock, 
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { SimpleSpecialAssistForm } from '../calculations/SimpleSpecialAssistForm';
import { ModernSpecialAssist1CalculationTable } from '../calculations/ModernSpecialAssist1CalculationTable';
import { ModernOvertimeCalculationTable } from '../calculations/ModernOvertimeCalculationTable';

interface SpecialAssistanceManagerProps {
  employees: Employee[];
  masterRates: MasterRates;
  calcYear: number;
  selectedEmployeeIds: string[];
  specialAssist1Data: SpecialAssistData;
  overtimeData: OvertimeData;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onUpdateSelection: (employeeIds: string[]) => void;
  onUpdateSpecialAssist1Item: (year: number, index: number, key: string, value: any) => void;
  onUpdateSpecialAssist1Notes: (year: number, notes: string) => void;
  onUpdateOvertimeData: (year: number, field: string, indexOrValue: any, key?: string, value?: any) => void;
  onSave: () => void;
}

export const SpecialAssistanceManager: React.FC<SpecialAssistanceManagerProps> = ({
  employees,
  masterRates,
  calcYear,
  selectedEmployeeIds,
  specialAssist1Data,
  overtimeData,
  holidaysData,
  onYearChange,
  onUpdateEmployee,
  onUpdateSelection,
  onUpdateSpecialAssist1Item,
  onUpdateSpecialAssist1Notes,
  onUpdateOvertimeData,
  onSave
}) => {
  const [activeSection, setActiveSection] = useState<'assistance' | 'special' | 'overtime'>('assistance');
  const [globalEditMode, setGlobalEditMode] = useState(false);

  const assistanceCount = employees.filter(emp => 
    selectedEmployeeIds.includes(emp.id) && emp.status === 'มีสิทธิ์'
  ).length;

  const sections = [
    { id: 'assistance', label: 'เงินช่วยเหลืออื่นๆ', icon: <Heart className="w-5 h-5" />, count: assistanceCount },
    { id: 'special', label: 'เงินช่วยเหลือพิเศษ', icon: <Banknote className="w-5 h-5" />, count: specialAssist1Data.items.length },
    { id: 'overtime', label: 'ค่าล่วงเวลาวันหยุด', icon: <Clock className="w-5 h-5" />, count: overtimeData.items.length }
  ];

  const renderAssistanceSection = () => {
    return (
      <SimpleSpecialAssistForm
        employees={employees}
        masterRates={masterRates}
        selectedEmployeeIds={selectedEmployeeIds}
        onSave={onSave}
        onUpdateEmployee={onUpdateEmployee}
        globalEditMode={globalEditMode}
      />
    );
  };

  const renderSpecialSection = () => {
    return (
      <ModernSpecialAssist1CalculationTable
        calcYear={calcYear}
        specialAssist1Data={specialAssist1Data}
        onYearChange={onYearChange}
        onUpdateItem={onUpdateSpecialAssist1Item}
        onUpdateNotes={onUpdateSpecialAssist1Notes}
        onSave={onSave}
      />
    );
  };

  const renderOvertimeSection = () => {
    return (
      <ModernOvertimeCalculationTable
        calcYear={calcYear}
        overtimeData={overtimeData}
        holidaysData={holidaysData}
        onYearChange={onYearChange}
        onUpdateData={onUpdateOvertimeData}
        onSave={onSave}
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">จัดการเงินช่วยเหลือ</h2>
              <p className="text-slate-600">จัดการเงินช่วยเหลือพนักงาน ค่าล่วงเวลา และเงินช่วยเหลือพิเศษ</p>
            </div>
          </div>

          {/* Global Edit Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGlobalEditMode(!globalEditMode)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                globalEditMode
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]'
              } hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]`}
            >
              {globalEditMode ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {globalEditMode ? 'เสร็จสิ้น' : 'แก้ไข'}
            </button>
            
            <button
              onClick={onSave}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึก
            </button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 p-2">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 min-w-0 p-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]'
                  : 'bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]'
              }`}
            >
              {section.icon}
              <div className="text-center">
                <div className="font-bold">{section.label}</div>
                <div className="text-xs opacity-80">({section.count} รายการ)</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {activeSection === 'assistance' && renderAssistanceSection()}
          {activeSection === 'special' && renderSpecialSection()}
          {activeSection === 'overtime' && renderOvertimeSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};