import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Holiday } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NeumorphismInput } from '../ui/NeumorphismInput';
import { calculateWorkDays } from '../../utils/calculations';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Save,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Target,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';

interface ModernWorkdayManagerProps {
  calcYear: number;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onAddHoliday: (year: number, holiday: Holiday) => void;
  onDeleteHoliday: (year: number, index: number) => void;
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
  const [showAddForm, setShowAddForm] = useState(false);

  const currentYearHolidays = holidaysData[calcYear] || [];
  const workDayCalc = calculateWorkDays(calcYear, currentYearHolidays);

  const handleAddHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      onAddHoliday(calcYear, newHoliday);
      setNewHoliday({ date: '', name: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteHoliday = (index: number) => {
    if (window.confirm('คุณต้องการลบวันหยุดนี้ใช่หรือไม่?')) {
      onDeleteHoliday(calcYear, index);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 rounded-2xl"
                style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}
                whileHover={{ scale: 1.05 }}
              >
                <Calendar className="w-6 h-6 text-indigo-600" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">จัดการวันทำการ</h2>
                <p className="text-gray-600">ระบบจัดการวันหยุดและคำนวณวันทำการ</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onYearChange(calcYear - 1)}
                  className="p-2 rounded-xl text-blue-600 hover:text-blue-700 transition-colors"
                  style={{
                    boxShadow: '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <motion.div 
                  className="px-6 py-3 rounded-2xl min-w-[120px] text-center"
                  style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff', backgroundColor: '#f9fafb' }}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-lg font-bold text-blue-900">ปี พ.ศ. {calcYear}</span>
                </motion.div>
                <button
                  onClick={() => onYearChange(calcYear + 1)}
                  className="p-2 rounded-xl text-blue-600 hover:text-blue-700 transition-colors"
                  style={{
                    boxShadow: '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Button onClick={onSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                บันทึก
              </Button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'วันทำการ', value: workDayCalc.totalWorkDays, icon: Clock, color: 'text-green-600' },
              { label: 'วันหยุดราชการ', value: workDayCalc.holidaysOnWeekdays, icon: Sun, color: 'text-red-600' },
              { label: 'วันจันทร์-ศุกร์', value: workDayCalc.weekdays, icon: Target, color: 'text-blue-600' },
              { label: 'วันหยุดทั้งหมด', value: currentYearHolidays.length, icon: Moon, color: 'text-purple-600' }
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

      {/* Add Holiday Form */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">เพิ่มวันหยุดใหม่</h3>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "secondary" : "primary"}
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAddForm ? 'ยกเลิก' : 'เพิ่มวันหยุด'}
            </Button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
                  <NeumorphismInput
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อวันหยุด</label>
                  <NeumorphismInput
                    type="text"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="เช่น วันแรงงานแห่งชาติ"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddHoliday}
                    disabled={!newHoliday.date || !newHoliday.name}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มวันหยุด
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Holidays List */}
      <Card className="bg-gray-100" style={{ boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff' }}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">รายการวันหยุดราชการ</h3>
          
          <div className="overflow-hidden rounded-2xl" style={{ boxShadow: 'inset 12px 12px 24px #d1d5db, inset -12px -12px 24px #ffffff' }}>
            <div className="overflow-x-auto bg-gray-50 p-4">
              {currentYearHolidays.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">ยังไม่มีวันหยุดราชการ</p>
                  <p className="text-sm text-gray-400">เพิ่มวันหยุดเพื่อคำนวณวันทำการที่แม่นยำ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {currentYearHolidays.map((holiday, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-between p-4 rounded-2xl transition-all duration-300"
                        style={{
                          boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
                          backgroundColor: '#f9fafb'
                        }}
                        whileHover={{
                          boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-xl text-red-600" style={{ boxShadow: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff', backgroundColor: '#f9fafb' }}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{holiday.name}</h4>
                            <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(index)}
                          className="p-2 rounded-xl text-red-600 hover:text-red-700 transition-colors"
                          style={{
                            boxShadow: '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
                            backgroundColor: '#f9fafb'
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};