import React, { useState, useMemo } from 'react';
import { Holiday, WorkDayCalculation } from '../../types';
import { calculateWorkDays } from '../../utils/calculations';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Save,
  TrendingUp, 
  Clock,
  AlertCircle,
  Info,
  Check,
  X,
  Edit3,
  Building
} from 'lucide-react';

interface ModernWorkdayManagerProps {
  calcYear: number;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onAddHoliday: (yearCE: number, holiday: Holiday) => void;
  onDeleteHoliday: (yearCE: number, index: number) => void;
  onSave: () => void;
}

export const ModernWorkdayManager: React.FC<ModernWorkdayManagerProps> = ({
  calcYear,
  holidaysData,
  onYearChange,
  onAddHoliday,
  onDeleteHoliday,
  onSave
}) => {
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingHoliday, setEditingHoliday] = useState({ date: '', name: '' });

  const yearCE = calcYear - 543;
  const holidays = holidaysData[yearCE] || [];
  const workDayCalc = calculateWorkDays(calcYear, holidays, true); // รวมวันหยุดพิเศษ
  const workDayCalcWithoutSpecial = calculateWorkDays(calcYear, holidays, false); // ไม่รวมวันหยุดพิเศษ

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalHolidays = holidays.length;
    const weekendCount = Math.floor(365 / 7) * 2 + (365 % 7 >= 6 ? 1 : 0);
    const workingDays = workDayCalc.totalWorkDays;
    const workingDaysWithoutSpecial = workDayCalcWithoutSpecial.totalWorkDays;
    const bankingHolidays = holidays.filter(h => 
      !h.name.includes('วันหยุดพิเศษ') && !h.name.includes('ชดเชย')
    ).length;
    
    return {
      totalHolidays,
      bankingHolidays,
      specialHolidays: totalHolidays - bankingHolidays,
      workingDays,
      workingDaysWithoutSpecial,
      weekendCount
    };
  }, [holidays, workDayCalc, workDayCalcWithoutSpecial]);

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) {
      alert('กรุณาระบุวันที่และชื่อวันหยุด');
      return;
    }

    onAddHoliday(yearCE, {
      date: newHoliday.date,
      name: newHoliday.name
    });

    setNewHoliday({ date: '', name: '' });
  };

  const handleEditStart = (index: number, holiday: Holiday) => {
    setEditingIndex(index);
    setEditingHoliday({ ...holiday });
  };

  const handleEditSave = () => {
    if (editingIndex !== null) {
      // Remove old and add new (simplified update)
      onDeleteHoliday(yearCE, editingIndex);
      onAddHoliday(yearCE, editingHoliday);
      setEditingIndex(null);
      setEditingHoliday({ date: '', name: '' });
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingHoliday({ date: '', name: '' });
  };

  const isCurrentYear = yearCE === 2025; // ปี 2568

  return (
    <div className="space-y-8">
      {/* Header with Year Navigation */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}>
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">จัดการวันทำการ</h2>
              <p className="text-slate-600">จัดการวันหยุดและคำนวณวันทำการในปี {calcYear}</p>
              {isCurrentYear && (
                <div className="flex items-center gap-2 mt-2 text-emerald-600">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">วันหยุดสถาบันการเงิน ธนาคารแห่งประเทศไทย</span>
                </div>
              )}
            </div>
          </div>

          {/* Year Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
              <button
                onClick={() => onYearChange(calcYear - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="px-4 py-2 font-bold text-lg text-slate-800">
                ปี {calcYear} ({yearCE})
              </div>
              <button
                onClick={() => onYearChange(calcYear + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">วันทำการ</p>
              <p className="text-3xl font-bold text-blue-900">{statistics.workingDays}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 shadow-[8px_8px_16px_#93c5fd,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">วันหยุดรวม</p>
              <p className="text-3xl font-bold text-emerald-900">{statistics.totalHolidays}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 shadow-[8px_8px_16px_#a7f3d0,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">วันหยุดธนาคาร</p>
              <p className="text-3xl font-bold text-purple-900">{statistics.bankingHolidays}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 shadow-[8px_8px_16px_#ddd6fe,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-amber-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium">วันหยุดพิเศษ</p>
              <p className="text-3xl font-bold text-amber-900">{statistics.specialHolidays}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 shadow-[8px_8px_16px_#fde68a,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">วันหยุดสุดสัปดาห์</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.weekendCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-500 shadow-[8px_8px_16px_#cbd5e1,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add New Holiday */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">เพิ่มวันหยุดใหม่</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">วันที่</label>
            <input
              type="date"
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="flex-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อวันหยุด</label>
            <input
              type="text"
              placeholder="ระบุชื่อวันหยุด"
              className="w-full p-3 bg-white/80 border-0 rounded-xl shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 text-slate-700"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddHoliday}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] transition-all duration-300 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Holidays List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[20px_20px_40px_#d1d5db,-20px_-20px_40px_#ffffff] border border-slate-200/50 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-600 to-blue-600">
          <h3 className="text-xl font-bold text-white">วันหยุดประจำปี {calcYear}</h3>
          {isCurrentYear && (
            <p className="text-blue-100 text-sm mt-1">ข้อมูลตามประกาศธนาคารแห่งประเทศไทย ไม่รวมวันหยุดพิเศษ</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-3 text-left font-bold text-slate-700">วันที่</th>
                <th className="px-6 py-3 text-left font-bold text-slate-700">ชื่อวันหยุด</th>
                <th className="px-6 py-3 text-left font-bold text-slate-700">ประเภท</th>
                <th className="px-6 py-3 text-center font-bold text-slate-700">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => {
                const isSpecial = holiday.name.includes('วันหยุดพิเศษ') || holiday.name.includes('ชดเชย');
                const isEditing = editingIndex === index;

                return (
                  <tr key={index} className="border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="date"
                          className="w-full p-2 bg-white/80 border-0 rounded-lg shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none text-slate-700"
                          value={editingHoliday.date}
                          onChange={(e) => setEditingHoliday(prev => ({ ...prev, date: e.target.value }))}
                        />
                      ) : (
                        <span className="font-medium text-slate-700">
                          {new Date(holiday.date).toLocaleDateString('th-TH')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full p-2 bg-white/80 border-0 rounded-lg shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none text-slate-700"
                          value={editingHoliday.name}
                          onChange={(e) => setEditingHoliday(prev => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        <span className="text-slate-700">{holiday.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isSpecial 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isSpecial ? 'วันหยุดพิเศษ' : 'วันหยุดทั่วไป'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleEditSave}
                              className="w-8 h-8 rounded-lg bg-emerald-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-emerald-600 transition-all duration-200"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStart(index, holiday)}
                              className="w-8 h-8 rounded-lg bg-blue-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-blue-600 transition-all duration-200"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteHoliday(yearCE, index)}
                              className="w-8 h-8 rounded-lg bg-red-100 shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-600 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800">{workDayCalc.weekdays}</div>
              <div className="text-sm text-slate-600">วันจันทร์-ศุกร์</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{workDayCalc.holidaysOnWeekdays}</div>
              <div className="text-sm text-slate-600">วันหยุดในสัปดาห์</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{workDayCalc.totalWorkDays}</div>
              <div className="text-sm text-slate-600">วันทำการรวมพิเศษ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{statistics.workingDaysWithoutSpecial}</div>
              <div className="text-sm text-slate-600">วันทำการ (ไม่รวมพิเศษ)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{statistics.specialHolidays}</div>
              <div className="text-sm text-slate-600">วันหยุดพิเศษ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Math.round((workDayCalc.totalWorkDays / 365) * 100)}%</div>
              <div className="text-sm text-slate-600">สัดส่วนวันทำการ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};