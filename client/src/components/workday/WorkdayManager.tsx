import React, { useState } from 'react';
import { Holiday, WorkDayCalculation } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { calculateWorkDays, formatCurrency } from '../../utils/calculations';
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
  Info
} from 'lucide-react';

interface WorkdayManagerProps {
  calcYear: number;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onAddHoliday: (yearCE: number, holiday: Holiday) => void;
  onDeleteHoliday: (yearCE: number, index: number) => void;
  onSave: () => void;
}

export const WorkdayManager: React.FC<WorkdayManagerProps> = ({
  calcYear,
  holidaysData,
  onYearChange,
  onAddHoliday,
  onDeleteHoliday,
  onSave
}) => {
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  const yearCE = calcYear - 543;
  const holidays = holidaysData[yearCE] || [];
  const workDayCalc = calculateWorkDays(calcYear, holidays);

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

  const formatThaiDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${parseInt(year) + 543}`;
  };

  const getHolidayStats = () => {
    const recentYears = Object.keys(holidaysData)
      .map(Number)
      .filter(year => year >= yearCE - 5 && year < yearCE)
      .sort((a, b) => b - a);
    
    if (recentYears.length === 0) return null;
    
    const yearlyData = recentYears.map(year => ({
      year: year + 543,
      holidays: holidaysData[year] || [],
      count: holidaysData[year]?.length || 0
    }));
    
    const holidayCounts = yearlyData.map(data => data.count);
    const averageHolidays = Math.round(holidayCounts.reduce((s, c) => s + c, 0) / recentYears.length);
    
    return {
      recentYears: recentYears.map(y => y + 543),
      yearlyData,
      averageHolidays,
      estimatedWorkDays: workDayCalc.weekdays - averageHolidays
    };
  };

  const stats = getHolidayStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">จัดการวันทำงานและวันหยุด</h2>
              <p className="text-indigo-100">คำนวณวันทำงานจริงและจัดการวันหยุดสถาบันการเงิน</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Year Selection */}
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onYearChange(calcYear - 1)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="text-sm text-indigo-100">คำนวณสำหรับปี</div>
                  <div className="font-bold">{calcYear}</div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onYearChange(calcYear + 1)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results Section */}
        <div className="space-y-6">
          {/* Work Days Calculation */}
          {holidays.length > 0 ? (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">สรุปวันทำงานปี {calcYear}</h3>
                  <p className="text-blue-700">คำนวณจากข้อมูลวันหยุดที่ประกาศแล้ว</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">วันทำงาน (จ-ศ)</div>
                  <div className="text-2xl font-bold text-blue-900">{workDayCalc.weekdays}</div>
                  <div className="text-xs text-blue-600">วัน</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-medium">วันหยุดในวันทำงาน</div>
                  <div className="text-2xl font-bold text-red-900">-{workDayCalc.holidaysOnWeekdays}</div>
                  <div className="text-xs text-red-600">วัน</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-100 text-sm font-medium">วันทำงานจริง</div>
                    <div className="text-3xl font-bold">{workDayCalc.totalWorkDays}</div>
                    <div className="text-green-100 text-sm">วัน</div>
                  </div>
                  <Clock className="w-12 h-12 text-green-200" />
                </div>
              </div>
            </Card>
          ) : stats ? (
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-900">ประมาณการวันทำงานปี {calcYear}</h3>
                  <p className="text-yellow-700">คำนวณจากค่าเฉลี่ย 5 ปีย้อนหลัง</p>
                </div>
              </div>
              
              <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                <div className="text-sm text-yellow-800">
                  <strong>ข้อมูลอ้างอิง:</strong>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {stats.yearlyData.map(({ year, count }) => (
                      <div key={year} className="flex justify-between">
                        <span>ปี {year}:</span>
                        <span>{count} วัน</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-600 font-medium">วันทำงาน (จ-ศ)</div>
                  <div className="text-2xl font-bold text-yellow-900">{workDayCalc.weekdays}</div>
                  <div className="text-xs text-yellow-600">วัน</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-medium">ประมาณการวันหยุด</div>
                  <div className="text-2xl font-bold text-red-900">-{stats.averageHolidays}</div>
                  <div className="text-xs text-red-600">วัน</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-orange-100 text-sm font-medium">ประมาณการวันทำงานจริง</div>
                    <div className="text-3xl font-bold">{stats.estimatedWorkDays}</div>
                    <div className="text-orange-100 text-sm">วัน</div>
                  </div>
                  <AlertCircle className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">ไม่สามารถคำนวณได้</h3>
                  <p className="text-red-700">ไม่มีข้อมูลวันหยุดเพื่อใช้ในการคำนวณ</p>
                </div>
              </div>
            </Card>
          )}

          {/* Information Card */}
          <Card className="p-6 bg-gray-50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">คำแนะนำการใช้งาน</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• เพิ่มวันหยุดสถาบันการเงินตามประกาศของธนาคารแห่งประเทศไทย</li>
                  <li>• ระบบจะคำนวณวันทำงานจริงโดยหักวันหยุดที่ตกในวันจันทร์-ศุกร์</li>
                  <li>• ข้อมูลจะใช้สำหรับคำนวณค่าล่วงเวลาในวันหยุด</li>
                  <li>• สามารถดูประมาณการจากข้อมูลปีก่อนหน้าได้</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Holiday Management Section */}
        <div className="space-y-6">
          {/* Add Holiday Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">เพิ่มวันหยุดใหม่</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อวันหยุด</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="เช่น วันขึ้นปีใหม่"
                />
              </div>
              
              <Button 
                onClick={handleAddHoliday} 
                className="w-full"
                disabled={!newHoliday.date || !newHoliday.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มวันหยุด
              </Button>
            </div>
          </Card>

          {/* Holiday List */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  วันหยุดสถาบันการเงิน ปี {calcYear}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {holidays.length} วัน
                </span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {holidays.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">ไม่มีข้อมูลวันหยุดสำหรับปีนี้</p>
                  <p className="text-sm text-gray-400 mt-1">เพิ่มวันหยุดใหม่เพื่อเริ่มต้นการคำนวณ</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {holidays.map((holiday, index) => {
                    const date = new Date(holiday.date);
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
                    
                    return (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-indigo-600">
                                  {formatThaiDate(holiday.date)}
                                </div>
                                <div className={`text-xs font-medium ${
                                  isWeekend ? 'text-red-500' : 'text-green-600'
                                }`}>
                                  วัน{dayNames[dayOfWeek]}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{holiday.name}</div>
                                <div className="text-sm text-gray-500">
                                  {isWeekend ? 'ตกในวันหยุดสุดสัปดาห์' : 'ตกในวันทำงาน'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDeleteHoliday(yearCE, index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {holidays.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong>สถิติ:</strong> วันหยุดทั้งหมด {holidays.length} วัน • 
                  ตกในวันทำงาน {workDayCalc.holidaysOnWeekdays} วัน • 
                  ตกในวันหยุดสุดสัปดาห์ {holidays.length - workDayCalc.holidaysOnWeekdays} วัน
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};