import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BudgetItem, Employee, MasterRates } from '../../types';
import { formatCurrency, calculateTravelEmployees, calculateSpecialAssist, calculateFamilyVisit, calculateCompanyTrip, calculateManagerRotation, getRatesForEmployee } from '../../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';

interface ModernDashboardProps {
  employees: Employee[];
  masterRates: MasterRates;
  currentYear: number;
  nextYear: number;
  specialAssist1DataByYear: Record<number, any>;
  overtimeDataByYear: Record<number, any>;
  onNavigate: (tab: string) => void;
  onYearChange: (year: number) => void;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, color, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-3 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {trend === 'up' && <ArrowUpRight className="w-5 h-5 text-green-200" />}
        {trend === 'down' && <ArrowDownRight className="w-5 h-5 text-red-200" />}
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-200' : trend === 'down' ? 'text-red-200' : 'text-white/80'
        }`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    </div>
  </motion.div>
);

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  employees,
  masterRates,
  currentYear,
  nextYear,
  specialAssist1DataByYear,
  overtimeDataByYear,
  onNavigate,
  onYearChange
}) => {
  const [activeTimeRange, setActiveTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const yearOptions = [2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575, 2576, 2577, 2578, 2579, 2580];

  const metrics = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'มีสิทธิ์').length;
    const employeeChange = 5.2; // Mock data
    
    // Calculate travel expenses - only eligible employees (service years 20, 25, 30, 35, 40)
    const travelData = calculateTravelEmployees(employees, masterRates, currentYear);
    const travelTotal = travelData.reduce((sum, emp) => sum + (isNaN(emp.total) ? 0 : emp.total), 0);
    
    // Calculate special assistance from real data
    const specialAssistCurrentYear = specialAssist1DataByYear[currentYear] || { items: [] };
    console.log('Dashboard specialAssist1DataByYear ALL KEYS:', Object.keys(specialAssist1DataByYear));
    console.log('Dashboard specialAssist1DataByYear:', JSON.stringify(specialAssist1DataByYear, null, 2));
    console.log('Dashboard specialAssistCurrentYear:', JSON.stringify(specialAssistCurrentYear, null, 2));
    console.log('Dashboard currentYear:', currentYear);
    console.log('Dashboard specialAssistCurrentYear.items:', specialAssistCurrentYear.items);
    console.log('Dashboard specialAssistCurrentYear.items.length:', specialAssistCurrentYear.items?.length);
    
    const specialAssistTotal = (specialAssistCurrentYear.items || []).reduce((sum, item) => {
      const timesPerYear = Number(item.timesPerYear) || 0;
      const days = Number(item.days) || 0;
      const people = Number(item.people) || 0;
      const rate = Number(item.rate) || 0;
      const itemTotal = timesPerYear * days * people * rate;
      console.log('Dashboard special assist item:', { item, timesPerYear, days, people, rate, itemTotal });
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    
    console.log('Dashboard specialAssistTotal:', specialAssistTotal);
    
    // Calculate family visit - only eligible employees (status = มีสิทธิ์)
    const familyVisitEligible = employees.filter(emp => emp.status === 'มีสิทธิ์');
    const familyVisitData = calculateFamilyVisit(familyVisitEligible, currentYear);
    const familyVisitTotal = familyVisitData.reduce((sum, emp) => sum + emp.total, 0);
    
    // Calculate company trip - all employees with default destination 'ขอนแก่น' and busFare 600
    const companyTripData = calculateCompanyTrip(employees, masterRates, currentYear, 'ขอนแก่น', 600);
    const companyTripTotal = companyTripData.reduce((sum, emp) => sum + emp.total, 0);
    
    // Calculate manager rotation - only level 7 employees
    const managerRotationEligible = employees.filter(emp => emp.level === '7');
    const managerRotationData = calculateManagerRotation(managerRotationEligible, masterRates, currentYear, 3, 2, 3000, 200, 600);
    const managerRotationTotal = managerRotationData.reduce((sum, emp) => sum + emp.total, 0);
    
    // Calculate overtime from real data
    const overtimeData = overtimeDataByYear[currentYear] || { items: [], salary: 15000 };
    const overtimeTotal = overtimeData.items.reduce((sum: number, item: any) => {
      const hourlyRate = item.hourlyRate || overtimeData.salary / 210;
      const itemTotal = (item.people || 0) * (item.days || 0) * (item.hours || 0) * hourlyRate;
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);

    // Calculate assistance data (เงินช่วยเหลืออื่นๆ)
    const assistanceTotal = employees
      .filter(emp => emp.status === 'มีสิทธิ์')
      .reduce((sum, emp) => {
        const rates = getRatesForEmployee(emp, masterRates);
        const totalRent = (rates.rent || 0) * 12;
        const totalMonthlyAssist = (rates.monthlyAssist || 0) * 12;
        return sum + totalRent + totalMonthlyAssist;
      }, 0);
    
    return {
      activeEmployees,
      employeeChange,
      totalEmployees: employees.length,
      travelTotal,
      specialAssistTotal,
      assistanceTotal,
      familyVisitTotal,
      companyTripTotal,
      managerRotationTotal,
      overtimeTotal,
      totalExpenses: (travelTotal || 0) + (specialAssistTotal || 0) + (assistanceTotal || 0) + (familyVisitTotal || 0) + (companyTripTotal || 0) + (managerRotationTotal || 0) + (overtimeTotal || 0)
    };
  }, [employees, masterRates, currentYear, specialAssist1DataByYear, overtimeDataByYear]);

  // Mock data for charts
  const employeeData = [
    { level: 'ระดับ 1', count: 2, percentage: 12.5 },
    { level: 'ระดับ 2', count: 3, percentage: 18.8 },
    { level: 'ระดับ 3', count: 4, percentage: 25.0 },
    { level: 'ระดับ 4', count: 3, percentage: 18.8 },
    { level: 'ระดับ 5', count: 2, percentage: 12.5 },
    { level: 'ระดับ 6', count: 1, percentage: 6.2 },
    { level: 'ระดับ 7', count: 1, percentage: 6.2 },
  ];

  const statusData = [
    { name: 'พนักงานมีสิทธิ์', value: metrics.activeEmployees, color: '#10B981' },
    { name: 'พนักงานหมดสิทธิ์', value: metrics.totalEmployees - metrics.activeEmployees, color: '#EF4444' },
  ];

  const activityData = [
    { type: 'success', message: 'อัพเดทข้อมูลพนักงานสำเร็จ', time: '2 นาทีที่แล้ว' },
    { type: 'info', message: 'เพิ่มพนักงานใหม่ 3 คน', time: '15 นาทีที่แล้ว' },
    { type: 'warning', message: 'พนักงานหมดสิทธิ์เพิ่มขึ้น', time: '1 ชั่วโมงที่แล้ว' },
    { type: 'success', message: 'ส่งออกรายงานสำเร็จ', time: '2 ชั่วโมงที่แล้ว' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DASHBOARD</h1>
          <p className="text-gray-600 mt-1">ภาพรวมระบบจัดการพนักงาน ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">ปีงบประมาณ:</span>
          <div className="flex gap-2">
            {yearOptions.map((year) => (
              <Button
                key={year}
                variant={currentYear === year ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onYearChange(year)}
                className="min-w-[70px]"
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="พนักงานทั้งหมด"
          value={metrics.totalEmployees.toString()}
          change={metrics.employeeChange}
          trend={metrics.employeeChange > 0 ? 'up' : 'down'}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          gradient="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="พนักงานมีสิทธิ์"
          value={metrics.activeEmployees.toString()}
          change={8.2}
          trend="up"
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          gradient="from-green-500 to-green-600"
        />
        <MetricCard
          title="ค่าใช้จ่ายรวม"
          value={formatCurrency(metrics.totalExpenses)}
          change={12.5}
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
          gradient="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="ประสิทธิภาพ"
          value="92%"
          change={3.2}
          trend="up"
          icon={<Activity className="w-6 h-6" />}
          color="orange"
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Expense Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">ค่าใช้จ่ายในการเดินทาง</h3>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('travel')}>
              ดูรายละเอียด
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เดินทางรับของที่ระลึก</span>
              <span className="font-semibold text-blue-600">{formatCurrency(metrics.travelTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เดินทางเยี่ยมครอบครัว</span>
              <span className="font-semibold text-green-600">{formatCurrency(metrics.familyVisitTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เดินทางร่วมงานวันพนักงาน</span>
              <span className="font-semibold text-purple-600">{formatCurrency(metrics.companyTripTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เดินทางหมุนเวียน ผจศ.</span>
              <span className="font-semibold text-orange-600">{formatCurrency(metrics.managerRotationTotal)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">รวมค่าเดินทาง</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(metrics.travelTotal + metrics.familyVisitTotal + metrics.companyTripTotal + metrics.managerRotationTotal)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">เงินช่วยเหลือ</h3>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('assistance')}>
              ดูรายละเอียด
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เงินช่วยเหลือพิเศษ</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(metrics.specialAssistTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เงินช่วยเหลืออื่นๆ</span>
              <span className="font-semibold text-teal-600">{formatCurrency(metrics.assistanceTotal)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">รวมเงินช่วยเหลือ</span>
                <span className="font-bold text-lg text-emerald-600">
                  {formatCurrency(metrics.specialAssistTotal + metrics.assistanceTotal)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">ค่าล่วงเวลา</h3>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('assistance')}>
              ดูรายละเอียด
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ค่าล่วงเวลาวันหยุด</span>
              <span className="font-semibold text-amber-600">{formatCurrency(metrics.overtimeTotal)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">รวมค่าล่วงเวลา</span>
                <span className="font-bold text-lg text-amber-600">
                  {formatCurrency(metrics.overtimeTotal)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">สถิติพนักงาน</h3>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onNavigate('employees')}
            >
              ดูรายละเอียด
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `เดือน ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="current" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.1}
                name="ปีปัจจุบัน"
              />
              <Area 
                type="monotone" 
                dataKey="next" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.1}
                name="ปีหน้า"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Budget Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">สถิติสิทธิ์พนักงาน</h3>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onNavigate('employees')}
            >
              ดูรายงาน
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                  <RechartsPieChart>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.value} คน</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h3>
          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full justify-start"
              onClick={() => onNavigate('travel')}
            >
              <Activity className="w-4 h-4 mr-2" />
              จัดการเดินทาง
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start"
              onClick={() => onNavigate('employees')}
            >
              <Users className="w-4 h-4 mr-2" />
              เพิ่มพนักงาน
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start"
              onClick={() => onNavigate('travel')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              คำนวณค่าเดินทาง
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
          <div className="space-y-3">
            {activityData.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100 text-green-600' :
                  activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {activity.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {activity.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                  {activity.type === 'info' && <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};