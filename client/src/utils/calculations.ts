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
    souvenirAllowance: 0,
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
      souvenirAllowance: employee.customTravelRates.souvenirAllowance ?? baseRates.souvenirAllowance,
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
      // Dynamic calculation based on travel working days (separate from manager rotation)
      const travelWorkingDays = emp.travelWorkingDays || 1;
      const hotelNights = travelWorkingDays + 1; // Travel working days + 1 night
      const perDiemDays = travelWorkingDays + 2; // Travel working days + 2 days
      const hotel = hotelNights * (rates.hotel || 0);
      const perDiem = perDiemDays * (rates.perDiem || 0);
      const travelRoundTrip = rates.travel || 0;
      const localRoundTrip = rates.local || 0;
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
      const lumpSum = 0; // Remove lump sum from new schema
      const total = totalRent + totalMonthlyAssist;
      
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
  // Filter eligible employees for accommodation (visit province doesn't match destination)
  const eligibleEmployees = employees.filter(emp => 
    emp.visitProvince !== destination
  );
  
  const genderCounts = eligibleEmployees.reduce((acc, emp) => {
    if (emp.level !== '7') {  // Don't count level 7 employees in pairing calculations
      acc[emp.gender] = (acc[emp.gender] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Create pairing symbols for employees who share rooms
  const pairSymbols = ['🔵', '🔴', '🟢', '🟡', '🟣', '🟠', '⚫', '⚪'];
  const genderPairs: Record<string, string[]> = {};
  let symbolIndex = 0;
  
  // Group eligible employees by gender for pairing (exclude level 7 as they get single rooms)
  eligibleEmployees.forEach(emp => {
    if (emp.level !== '7') {  // Level 7 employees get single rooms, don't include in pairing
      if (!genderPairs[emp.gender]) {
        genderPairs[emp.gender] = [];
      }
      genderPairs[emp.gender].push(emp.id);
    }
  });
  
  // Assign symbols to pairs
  const employeePairSymbols: Record<string, string> = {};
  Object.entries(genderPairs).forEach(([gender, employeeIds]) => {
    if (employeeIds.length > 1) {
      // Create pairs for this gender - only assign symbols to complete pairs
      for (let i = 0; i < employeeIds.length - 1; i += 2) {
        const symbol = pairSymbols[symbolIndex % pairSymbols.length];
        employeePairSymbols[employeeIds[i]] = symbol;
        employeePairSymbols[employeeIds[i + 1]] = symbol;
        symbolIndex++;
      }
      // Note: If odd number, the last person gets no symbol (single room)
    }
  });
  
  return employees.map(emp => {
    const rates = getRatesForEmployee(emp, masterRates);
    
    // Check if eligible for accommodation (visit province doesn't match destination)
    const isEligibleForAccommodation = emp.visitProvince !== destination;
    
    let accommodationCost = 0;
    let note = 'ไม่มีสิทธิ์ค่าที่พัก';
    
    if (isEligibleForAccommodation) {
      if (emp.level === '7') {
        // Level 7 gets single room
        accommodationCost = rates.hotel || 0;
        note = 'พักคนเดียว';
      } else {
        // Check if this employee has a pair symbol (means they share a room)
        const pairSymbol = employeePairSymbols[emp.id];
        
        if (pairSymbol) {
          // Has pair, share accommodation cost using own standard rate divided by 2
          accommodationCost = (rates.hotel || 0) / 2;
          note = `${pairSymbol} พักคู่ (${emp.gender})`;
        } else {
          // No pair available, gets full accommodation cost using own standard rate
          accommodationCost = rates.hotel || 0;
          note = `ไม่มีคู่ - พักคนเดียว`;
        }
      }
    }
    
    const busFareTotal = busFare * 2; // Round trip
    const total = busFareTotal + accommodationCost;
    
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
  calcYear: number = 2568,
  perDiemDays: number = 3,
  accommodationDays: number = 2,
  flightCost: number = 3000,
  taxiCost: number = 200,
  busCost: number = 600
): ManagerRotationEmployee[] => {
  return employees
    .filter(emp => emp.level === '7')
    .map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      
      // Dynamic calculation based on working days
      const workingDays = emp.workingDays || 1;
      const hotelNights = workingDays + 1; // Working days + 1 night
      const perDiemDaysCalc = workingDays + 2; // Working days + 2 days (arrival + departure)
      
      const perDiemCost = (rates.perDiem || 0) * perDiemDaysCalc;
      const accommodationCost = (rates.hotel || 0) * hotelNights;
      
      // Use rates from master rates table
      const travelCost = rates.travel || 0;
      const localCost = rates.local || 0;
      
      // Other vehicle costs (editable)
      const otherVehicleCost = emp.customTravelRates?.other || 0;
      
      const total = perDiemCost + accommodationCost + travelCost + localCost + otherVehicleCost;
      
      return {
        ...emp,
        perDiemCost,
        accommodationCost,
        travelCost,
        taxiCost: localCost,
        busCost: 0,
        flightCost: travelCost,
        otherVehicleCost,
        total,
        totalTravel: travelCost + localCost + otherVehicleCost,
        perDiemDay: perDiemDaysCalc,
        hotelNight: hotelNights
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