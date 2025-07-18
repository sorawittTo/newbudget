export interface BudgetItem {
  type?: 'main_header' | 'header';
  code?: string;
  accountCode?: string; // รหัสบัญชีสำหรับการอ้างอิง
  name: string;
  values?: Record<number, number>;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  gender: 'ชาย' | 'หญิง';
  startYear: number;
  level: string;
  status?: 'มีสิทธิ์' | 'หมดสิทธิ์';
  visitProvince: string;
  homeVisitBusFare: number;
  workingDays?: number; // วันทำการ for manager rotation calculations
  travelWorkingDays?: number; // วันทำการ for travel expense calculations (separate field)
  // Add custom travel rates for overriding master rates
  customTravelRates?: {
    hotel?: number;
    perDiem?: number;
    travel?: number;
    local?: number;
    souvenirAllowance?: number;
    other?: number;
  };
}

export interface MasterRates {
  [level: string]: {
    position: string;
    rent: number; // ค่าเช่าบ้าน
    monthlyAssist: number; // ค่าช่วยเหลือรายเดือน
    souvenirAllowance: number; // ค่าซื้อของเหมาจ่าย
    travel: number; // ค่าพาหนะประจำทาง
    local: number; // ค่าพาหนะรับจ้าง
    perDiem: number; // ค่าเบี้ยเลี้ยง
    hotel: number; // ค่าที่พัก
  };
}

export interface TravelEmployee extends Employee {
  serviceYears: number;
  hotel: number;
  perDiem: number;
  travelRoundTrip: number;
  localRoundTrip: number;
  total: number;
  hotelNights: number;
  perDiemDays: number;
}

export interface SpecialAssistEmployee extends Employee {
  totalRent: number;
  totalMonthlyAssist: number;
  lumpSum: number;
  total: number;
  rentPerMonth: number;
  monthlyAssistPerMonth: number;
}

export interface FamilyVisitEmployee extends Employee {
  roundTripFare: number;
  busFareTotal: number;
  total: number;
}

export interface CompanyTripEmployee extends Employee {
  busFare: number;
  accommodationCost: number;
  total: number;
  note: string;
}

export interface ManagerRotationEmployee extends Employee {
  perDiemCost: number;
  accommodationCost: number;
  totalTravel: number;
  total: number;
  busCost: number;
  flightCost: number;
  taxiCost: number;
  perDiemDay: number;
  hotelNight: number;
}

export interface SpecialAssistItem {
  item: string;
  timesPerYear: number;
  days: number;
  people: number;
  rate: number;
}

export interface SpecialAssistData {
  items: SpecialAssistItem[];
  notes: string;
}

export interface OvertimeItem {
  item: string;
  days: number;
  hours: number;
  people: number;
  hourlyRate: number;
}

export interface OvertimeData {
  salary: number;
  items: OvertimeItem[];
  notes?: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface WorkDayCalculation {
  weekdays: number;
  holidaysOnWeekdays: number;
  totalWorkDays: number;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Gamified Employee Performance Interfaces
export interface PerformanceMetrics {
  productivity: number; // 0-100
  collaboration: number; // 0-100
  innovation: number; // 0-100
  leadership: number; // 0-100
  reliability: number; // 0-100
  adaptability: number; // 0-100
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'collaboration' | 'innovation' | 'leadership' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100 for progress-based achievements
  target?: number; // target value for completion
}

export interface EmployeePerformance extends Employee {
  metrics: PerformanceMetrics;
  achievements: Achievement[];
  totalScore: number;
  rank: number;
  level: number;
  experience: number;
  nextLevelXp: number;
  streak: number; // consecutive performance days
  badges: string[];
  lastUpdated: Date;
}

export interface PerformanceComparison {
  employeeId: string;
  previousScore: number;
  currentScore: number;
  improvement: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TeamPerformance {
  averageScore: number;
  topPerformers: EmployeePerformance[];
  improvementLeaders: PerformanceComparison[];
  departmentRankings: { department: string; score: number }[];
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: Date;
  category: keyof PerformanceMetrics;
  reward: string;
  isCompleted: boolean;
}