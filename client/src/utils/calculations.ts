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
  employees: Employee[]
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
  masterRates: MasterRates
): CompanyTripEmployee[] => {
  const busFare = 600; // Base bus fare
  const results: CompanyTripEmployee[] = [];
  
  // Separate employees by category
  const nonLocalEmployees = employees.filter(emp => 
    emp.visitProvince !== 'ขอนแก่น' && emp.level !== 'ท้องถิ่น'
  );
  
  const managers = nonLocalEmployees.filter(emp => emp.level === '7');
  const maleStaff = nonLocalEmployees.filter(emp => 
    emp.level !== '7' && emp.gender === 'ชาย'
  ).sort((a, b) => getRatesForEmployee(b, masterRates).hotel - getRatesForEmployee(a, masterRates).hotel);
  
  const femaleStaff = nonLocalEmployees.filter(emp => 
    emp.level !== '7' && emp.gender === 'หญิง'
  ).sort((a, b) => getRatesForEmployee(b, masterRates).hotel - getRatesForEmployee(a, masterRates).hotel);
  
  // Managers get single rooms
  managers.forEach(emp => {
    const accommodationCost = getRatesForEmployee(emp, masterRates).hotel;
    results.push({
      ...emp,
      busFare,
      accommodationCost,
      total: busFare + accommodationCost,
      note: 'พักเดี่ยว'
    });
  });
  
  // Pair male staff
  for (let i = 0; i < maleStaff.length; i += 2) {
    const emp1 = maleStaff[i];
    const emp2 = maleStaff[i + 1];
    
    if (emp2) {
      const roomCost = Math.max(
        getRatesForEmployee(emp1, masterRates).hotel,
        getRatesForEmployee(emp2, masterRates).hotel
      );
      const costPerPerson = roomCost / 2;
      
      results.push({
        ...emp1,
        busFare,
        accommodationCost: costPerPerson,
        total: busFare + costPerPerson,
        note: `พักคู่ (ห้องละ ${roomCost})`
      });
      
      results.push({
        ...emp2,
        busFare,
        accommodationCost: costPerPerson,
        total: busFare + costPerPerson,
        note: `พักคู่ (ห้องละ ${roomCost})`
      });
    } else {
      const accommodationCost = getRatesForEmployee(emp1, masterRates).hotel;
      results.push({
        ...emp1,
        busFare,
        accommodationCost,
        total: busFare + accommodationCost,
        note: 'พักเดี่ยว'
      });
    }
  }
  
  // Pair female staff
  for (let i = 0; i < femaleStaff.length; i += 2) {
    const emp1 = femaleStaff[i];
    const emp2 = femaleStaff[i + 1];
    
    if (emp2) {
      const roomCost = Math.max(
        getRatesForEmployee(emp1, masterRates).hotel,
        getRatesForEmployee(emp2, masterRates).hotel
      );
      const costPerPerson = roomCost / 2;
      
      results.push({
        ...emp1,
        busFare,
        accommodationCost: costPerPerson,
        total: busFare + costPerPerson,
        note: `พักคู่ (ห้องละ ${roomCost})`
      });
      
      results.push({
        ...emp2,
        busFare,
        accommodationCost: costPerPerson,
        total: busFare + costPerPerson,
        note: `พักคู่ (ห้องละ ${roomCost})`
      });
    } else {
      const accommodationCost = getRatesForEmployee(emp1, masterRates).hotel;
      results.push({
        ...emp1,
        busFare,
        accommodationCost,
        total: busFare + accommodationCost,
        note: 'พักเดี่ยว'
      });
    }
  }
  
  // Local employees (no accommodation cost)
  employees
    .filter(emp => emp.visitProvince === 'ขอนแก่น' || emp.level === 'ท้องถิ่น')
    .forEach(emp => {
      results.push({
        ...emp,
        busFare,
        accommodationCost: 0,
        total: busFare,
        note: 'ไม่คิดค่าที่พัก'
      });
    });
  
  // Sort by original employee order
  return results.sort((a, b) => 
    employees.findIndex(e => e.id === a.id) - employees.findIndex(e => e.id === b.id)
  );
};

export const calculateManagerRotation = (
  employees: Employee[],
  masterRates: MasterRates
): ManagerRotationEmployee[] => {
  return employees
    .filter(emp => emp.level === '7')
    .map(emp => {
      const rates = getRatesForEmployee(emp, masterRates);
      const perDiemCost = (rates.perDiem || 0) * 7;
      const accommodationCost = (rates.hotel || 0) * 6;
      const totalTravel = 600 + 4000 + 1000; // Bus + Flight + Taxi
      const total = perDiemCost + accommodationCost + totalTravel;
      
      return {
        ...emp,
        perDiemCost,
        accommodationCost,
        totalTravel,
        total,
        busCost: 600,
        flightCost: 4000,
        taxiCost: 1000,
        perDiemDay: rates.perDiem || 0,
        hotelNight: rates.hotel || 0
      };
    });
};

export const calculateWorkDays = (year: number, holidays: Holiday[] = []): WorkDayCalculation => {
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
  
  // Count holidays that fall on weekdays
  let holidaysOnWeekdays = 0;
  holidays.forEach(holiday => {
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