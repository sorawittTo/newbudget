import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Holiday, WorkDayCalculation } from '../../types';
import { calculateWorkDays, formatCurrency } from '../../utils/calculations';
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar, Info, TrendingUp, Clock } from 'lucide-react';

interface WorkDayCalculatorProps {
  calcYear: number;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onAddHoliday: (yearCE: number, holiday: Holiday) => void;
  onDeleteHoliday: (yearCE: number, index: number) => void;
  onSave: () => void;
}

export const WorkDayCalculator: React.FC<WorkDayCalculatorProps> = ({
  calcYear,
  holidaysData,
  onYearChange,
  onAddHoliday,
  onDeleteHoliday,
  onSave
}) => {
  const yearCE = calcYear - 543;
  const holidays = holidaysData[yearCE] || [];
  const workDayCalc = calculateWorkDays(calcYear, holidays);

  const handleAddHoliday = () => {
    const dateInput = document.getElementById('new-holiday-date') as HTMLInputElement;
    const nameInput = document.getElementById('new-holiday-name') as HTMLInputElement;
    
    if (!dateInput.value || !nameInput.value) {
      alert('กรุณาระบุวันที่และชื่อวันหยุด');
      return;
    }

    onAddHoliday(yearCE, {
      date: dateInput.value,
      name: nameInput.value
    });

    dateInput.value = '';
    nameInput.value = '';
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
    
    // Get most common holidays from recent years for estimation
    const holidayFrequency: Record<string, { name: string; count: number; months: Set<string> }> = {};
    
    yearlyData.forEach(({ holidays }) => {
      holidays.forEach(holiday => {
        const month = holiday.date.split('-')[1];
        const key = holiday.name.replace(/ชดเชย|วันหยุดพิเศษ/g, '').trim();
        
        if (!holidayFrequency[key]) {
          holidayFrequency[key] = { name: holiday.name, count: 0, months: new Set() };
        }
        holidayFrequency[key].count++;
        holidayFrequency[key].months.add(month);
      });
    });
    
    // Get most frequent holidays for estimation
    const commonHolidays = Object.entries(holidayFrequency)
      .filter(([_, data]) => data.count >= Math.ceil(recentYears.length * 0.6)) // Appears in 60%+ of years
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, averageHolidays)
      .map(([key, data]) => ({
        name: data.name,
        frequency: `${data.count}/${recentYears.length} ปี`,
        months: Array.from(data.months).sort()
      }));
    
    return {
      recentYears: recentYears.map(y => y + 543),
      yearlyData,
      averageHolidays,
      estimatedWorkDays: workDayCalc.weekdays - averageHolidays,
      commonHolidays
    };
  };

  const stats = getHolidayStats();

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            คำนวณและจัดการวันทำงานประจำปี
          </h3>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onYearChange(calcYear - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              ปีก่อนหน้า
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-xl font-bold text-blue-600">{calcYear}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onYearChange(calcYear + 1)}
            >
              ปีถัดไป
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Results Section */}
          <div>
            {holidays.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 p-6 rounded-lg space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h4 className="text-xl font-bold text-blue-800">
                    สรุปวันทำงานปี พ.ศ. {calcYear}
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-base">
                  <span className="font-semibold">วันทำงาน (จันทร์-ศุกร์):</span>
                  <span className="text-right">{workDayCalc.weekdays} วัน</span>
                  
                  <span className="font-semibold">วันหยุดที่ตกในวันทำงาน:</span>
                  <span className="text-right text-red-600">-{workDayCalc.holidaysOnWeekdays} วัน</span>
                </div>
                
                <div className="border-t border-blue-200 pt-4 mt-4 flex justify-between items-center text-xl font-bold">
                  <span>สรุปวันทำงานจริง:</span>
                  <span className="text-blue-700">{workDayCalc.totalWorkDays} วัน</span>
                </div>

                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <strong>รายละเอียด:</strong> จากวันทำงานทั้งหมด {workDayCalc.weekdays} วัน 
                    หักวันหยุดสถาบันการเงิน {workDayCalc.holidaysOnWeekdays} วัน 
                    คงเหลือวันทำงานจริง {workDayCalc.totalWorkDays} วัน
                  </div>
                </div>
              </motion.div>
            ) : stats ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 p-6 rounded-lg space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <h4 className="text-xl font-bold text-yellow-800">
                    ประมาณการวันทำงานปี พ.ศ. {calcYear}
                  </h4>
                </div>
                
                <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700 mb-3">
                    <strong>หมายเหตุ:</strong> เนื่องจากไม่มีข้อมูลประกาศของปีที่เลือก ระบบจึงคำนวณจากค่าเฉลี่ย 5 ปีย้อนหลัง
                  </p>
                  
                  <div className="text-xs text-yellow-600">
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
                
                <div className="grid grid-cols-2 gap-4 text-base">
                  <span className="font-semibold">วันทำงาน (จันทร์-ศุกร์):</span>
                  <span className="text-right">{workDayCalc.weekdays} วัน</span>
                  
                  <span className="font-semibold">ประมาณการวันหยุด:</span>
                  <span className="text-right text-red-600">-{stats.averageHolidays} วัน</span>
                </div>
                
                <div className="border-t border-yellow-300 pt-4 mt-4 flex justify-between items-center text-xl font-bold">
                  <span>ประมาณการวันทำงานจริง:</span>
                  <span className="text-yellow-700">{stats.estimatedWorkDays} วัน</span>
                </div>

                {/* Holiday Estimation Details */}
                {stats.commonHolidays.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <h5 className="font-semibold text-yellow-800">
                        วันหยุดที่คาดว่าจะมี (ประมาณการ {stats.averageHolidays} วัน)
                      </h5>
                    </div>
                    <div className="space-y-2 text-sm text-yellow-700">
                      {stats.commonHolidays.map((holiday, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="flex-1">{holiday.name}</span>
                          <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                            {holiday.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-yellow-200 text-xs text-yellow-600">
                      * ประมาณการจากความถี่ของวันหยุดในช่วง 5 ปีที่ผ่านมา
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-red-600" />
                  <h4 className="font-bold text-red-800">ไม่สามารถคำนวณได้</h4>
                </div>
                <p className="text-red-700">
                  ไม่มีข้อมูลวันหยุดย้อนหลังเพื่อใช้ในการคำนวณประมาณการ
                </p>
              </div>
            )}
          </div>

          {/* Holiday Management Section */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              จัดการวันหยุดสถาบันการเงิน
            </h4>
            
            {/* Add Holiday Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h5 className="font-semibold mb-3">เพิ่มวันหยุดใหม่</h5>
              <div className="flex gap-2">
                <input
                  type="date"
                  id="new-holiday-date"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  id="new-holiday-name"
                  placeholder="ชื่อวันหยุด"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button onClick={handleAddHoliday} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  เพิ่ม
                </Button>
              </div>
            </div>

            {/* Holiday List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {holidays.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>ไม่มีข้อมูลวันหยุดสำหรับปีนี้</p>
                  <p className="text-sm mt-1">เพิ่มวันหยุดใหม่เพื่อเริ่มต้นการคำนวณ</p>
                </div>
              ) : (
                <>
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700">
                      <strong>สถิติปี {calcYear}:</strong> มีวันหยุดทั้งหมด {holidays.length} วัน 
                      ตกในวันทำงาน {workDayCalc.holidaysOnWeekdays} วัน
                    </div>
                  </div>
                  
                  {holidays.map((holiday, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex-grow">
                        <span className="font-semibold text-blue-600">
                          {formatThaiDate(holiday.date)}
                        </span>
                        <span className="text-gray-700 ml-3">{holiday.name}</span>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDeleteHoliday(yearCE, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <Button onClick={onSave} size="lg">
            บันทึกข้อมูลวันหยุด
          </Button>
        </div>
      </div>
    </Card>
  );
};