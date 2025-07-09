import { Employee, MasterRates, TravelEmployee, SpecialAssistEmployee, FamilyVisitEmployee, CompanyTripEmployee, ManagerRotationEmployee, Holiday, WorkDayCalculation } from '../types';

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const getRatesForEmployee = (employee: Employee, masterRates: MasterRates) => {
  const defaultRates = {
    position: 'ไม่ระบุ',
    rent: 0,
    monthlyAssist: 0,
    lumpSum: 0,
    travel: 0,
    local: 0,
    perDiem: 0,
    hotel: 0
  };
  
  const baseRates = masterRates[employee.level] || defaultRates;
  
  // Override with custom rates if available
  if (employee.customTravelRates) {
    return {
      ...baseRates,
      hotel: employee.customTravelRates.hotel ?? baseRates.hotel,
      perDiem: employee.customTravelRates.perDiem ?? baseRates.perDiem,
      travel: employee.customTravelRates.travel ?? baseRates.travel,
      local: employee.customTravelRates.local ?? baseRates.local,
    };
  }
  
  return baseRates;
};

export const calculateTravelEmployees = (
  employees: Employee[],
  masterRates: MasterRates,
  calcYear: number
): TravelEmployee[] => {
  const eligibleServiceYears = [20, 25, 30, 35, 40];
  
  return employees
    .map(emp => ({ ...emp, serviceYears: calcYear - emp.startYear }))
    .filter(emp => eligibleServiceYears.includes(emp.serviceYears))
    .map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      const hotelNights = 2;
      const perDiemDays = 3;
      const hotel = hotelNights * (rates.hotel || 0);
      const perDiem = perDiemDays * (rates.perDiem || 0);
      const travelRoundTrip = 2 * (rates.travel || 0);
      const localRoundTrip = 2 * (rates.local || 0);
      const total = hotel + perDiem + travelRoundTrip + localRoundTrip;
      
      return {
        ...emp,
        hotel,
        perDiem,
        travelRoundTrip,
        localRoundTrip,
        total,
        hotelNights,
        perDiemDays
      };
    });
};

export const calculateSpecialAssist = (
  employees: Employee[],
  masterRates: MasterRates
): SpecialAssistEmployee[] => {
  return employees
    .filter(emp => 
      // Only show employees with 'มีสิทธิ์' status
      (emp as any).status === 'มีสิทธิ์'
    )
    .map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      const totalRent = (rates.rent || 0) * 12;
      const totalMonthlyAssist = (rates.monthlyAssist || 0) * 12;
      const lumpSum = rates.lumpSum || 0;
      const total = totalRent + totalMonthlyAssist; // Remove lump sum from total calculation
      
      return {
        ...emp,
        totalRent,
        totalMonthlyAssist,
        lumpSum,
        total,
        rentPerMonth: rates.rent || 0,
        monthlyAssistPerMonth: rates.monthlyAssist || 0
      };
    });
};

export const calculateFamilyVisit = (
  employees: Employee[],
  calcYear: number = 2568
): FamilyVisitEmployee[] => {
  return employees.map(emp => {
    const roundTripFare = (emp.homeVisitBusFare || 0) * 2; // One way fare x 2 = round trip
    const busFareTotal = 4 * roundTripFare; // 4 times per year
    
    return {
      ...emp,
      roundTripFare,
      busFareTotal,
      total: busFareTotal
    };
  });
};

export const calculateCompanyTrip = (
  employees: Employee[],
  masterRates: MasterRates,
  calcYear: number = 2568,
  destination: string = '',
  busFare: number = 600
): CompanyTripEmployee[] => {
  return employees.map(emp => {
    const rates = getRatesForEmployee(emp, masterRates);
    
    // Check if eligible for accommodation (province doesn't match destination)
    const isEligibleForAccommodation = emp.visitProvince.trim() !== destination.trim();
    
    let accommodationCost = 0;
    let note = 'ไม่มีสิทธิ์ค่าที่พัก';
    
    if (isEligibleForAccommodation) {
      if (emp.level === '7') {
        // Level 7 gets single room
        accommodationCost = rates.hotel || 0;
        note = 'พักคนเดียว';
      } else {
        // Others share rooms by gender (cost divided by 2)
        accommodationCost = (rates.hotel || 0) / 2;
        note = `พักคู่ (${emp.gender})`;
      }
    }
    
    // Year-based calculation adjustments
    let yearMultiplier = 1;
    if (calcYear >= 2570) {
      yearMultiplier = 1.1; // 10% increase for 2570 and beyond
    } else if (calcYear >= 2569) {
      yearMultiplier = 1.05; // 5% increase for 2569
    }
    
    const busFareTotal = busFare * 2 * yearMultiplier; // Round trip with year adjustment
    const total = busFareTotal + (accommodationCost * yearMultiplier);
    
    return {
      ...emp,
      busFare,
      accommodationCost,
      total,
      note
    } as CompanyTripEmployee;
  });
};

export const calculateManagerRotation = (
  employees: Employee[],
  masterRates: MasterRates,
  calcYear: number = 2568
): ManagerRotationEmployee[] => {
  return employees
    .filter(emp => emp.level === '7')
    .map(emp => {
      const serviceYears = calcYear - emp.startYear;
      const rates = getRatesForEmployee(emp, masterRates);
      const workingDays = emp.workingDays || 1;
      
      // Manager rotation calculation rules:
      // 1 working day = 3 days per diem + 2 days accommodation  
      // Each additional working day = +1 day per diem + +1 day accommodation
      let perDiemDays: number;
      let accommodationDays: number;
      
      if (workingDays === 1) {
        perDiemDays = 3;
        accommodationDays = 2;
      } else {
        perDiemDays = 3 + (workingDays - 1);
        accommodationDays = 2 + (workingDays - 1);
      }
      
      // Year-based calculation adjustments
      let yearMultiplier = 1;
      if (calcYear >= 2570) {
        yearMultiplier = 1.15; // 15% increase for 2570 and beyond
      } else if (calcYear >= 2569) {
        yearMultiplier = 1.08; // 8% increase for 2569
      }
      
      const perDiemCost = (rates.perDiem || 0) * perDiemDays * yearMultiplier;
      const accommodationCost = (rates.hotel || 0) * accommodationDays * yearMultiplier;
      
      // Travel costs (round trip) with year adjustment
      const travelCost = (rates.travel || 0) * 2 * yearMultiplier;
      const taxiCost = (rates.local || 0) * 2 * yearMultiplier;
      
      // Other vehicle costs (editable)
      const otherVehicleCost = (emp.customTravelRates?.other || 0) * yearMultiplier;
      
      const total = perDiemCost + accommodationCost + travelCost + taxiCost + otherVehicleCost;
      
      return {
        ...emp,
        perDiemCost,
        accommodationCost,
        travelCost,
        taxiCost,
        otherVehicleCost,
        total,
        busCost: 0, // No longer used
        flightCost: 0, // No longer used
        totalTravel: travelCost + taxiCost + otherVehicleCost,
        perDiemDay: perDiemDays,
        hotelNight: accommodationDays
      } as ManagerRotationEmployee;
    });
};

export const calculateWorkDays = (year: number, holidays: Holiday[] = [], includeSpecialHolidays: boolean = true): WorkDayCalculation => {
  const yearCE = year - 543;
  let weekdays = 0;
  
  // Count weekdays (Monday to Friday)
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(yearCE, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(yearCE, m, d).getDay();
      if (dayOfWeek > 0 && dayOfWeek < 6) {
        weekdays++;
      }
    }
  }
  
  // Filter holidays based on includeSpecialHolidays flag
  const filteredHolidays = includeSpecialHolidays 
    ? holidays 
    : holidays.filter(h => !h.name.includes('วันหยุดพิเศษ'));
  
  // Count holidays that fall on weekdays
  let holidaysOnWeekdays = 0;
  filteredHolidays.forEach(holiday => {
    const date = new Date(holiday.date + 'T00:00:00');
    const dayOfWeek = date.getDay();
    if (dayOfWeek > 0 && dayOfWeek < 6) {
      holidaysOnWeekdays++;
    }
  });
  
  return {
    weekdays,
    holidaysOnWeekdays,
    totalWorkDays: weekdays - holidaysOnWeekdays
  };
};