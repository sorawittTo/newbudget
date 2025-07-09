import { useState, useEffect } from 'react';
import { BudgetItem, Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../types';
import { defaultBudgetItems, defaultMasterRates, defaultSpecialAssist1Data, holidaysByYear } from '../data/defaults';

export const useBudgetData = () => {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [masterRates, setMasterRates] = useState<MasterRates>({});
  const [specialAssist1DataByYear, setSpecialAssist1DataByYear] = useState<Record<number, SpecialAssistData>>({});
  const [overtimeDataByYear, setOvertimeDataByYear] = useState<Record<number, OvertimeData>>({});
  const [holidaysData, setHolidaysData] = useState<Record<number, Holiday[]>>(holidaysByYear);
  
  // Employee selection states for different calculations
  const [selectedTravelEmployees, setSelectedTravelEmployees] = useState<string[]>([]);
  const [selectedSpecialAssistEmployees, setSelectedSpecialAssistEmployees] = useState<string[]>([]);
  const [selectedFamilyVisitEmployees, setSelectedFamilyVisitEmployees] = useState<string[]>([]);
  const [selectedCompanyTripEmployees, setSelectedCompanyTripEmployees] = useState<string[]>([]);
  const [selectedManagerRotationEmployees, setSelectedManagerRotationEmployees] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Initialize budget data with default values for all years
  const initializeBudgetData = (items: BudgetItem[]): BudgetItem[] => {
    return items.map(item => {
      if (item.type) return item;
      const newItem = { ...item, values: {} };
      for (let year = 2568; year <= 2580; year++) {
        newItem.values![year] = 0;
      }
      return newItem;
    });
  };

  const getSpecialAssist1DataForYear = (year: number): SpecialAssistData => {
    if (!specialAssist1DataByYear[year]) {
      const newData = {
        items: JSON.parse(JSON.stringify(defaultSpecialAssist1Data)),
        notes: ''
      };
      console.log('useBudgetData - Creating new data for year:', year, 'Data:', newData);
      setSpecialAssist1DataByYear(prev => {
        const updated = { ...prev, [year]: newData };
        console.log('useBudgetData - Updated specialAssist1DataByYear:', updated);
        return updated;
      });
      return newData;
    }
    return specialAssist1DataByYear[year];
  };

  const getOvertimeDataForYear = (year: number): OvertimeData => {
    if (!overtimeDataByYear[year]) {
      const refYear = year - 1;
      const refYearCE = refYear - 543;
      const refHolidays = holidaysData[refYearCE] || [];
      
      // Calculate consecutive holiday patterns
      let consecutiveCounts = { 3: 0, 4: 0, 5: 0 };
      if (refHolidays.length > 0) {
        let consecutive = 0;
        for (let i = 0; i < refHolidays.length; i++) {
          const currentDay = new Date(refHolidays[i].date).getTime();
          const prevDay = i > 0 ? new Date(refHolidays[i-1].date).getTime() : 0;
          
          if (i > 0 && (currentDay - prevDay) / (1000 * 3600 * 24) === 1) {
            consecutive++;
          } else {
            if (consecutive >= 3 && consecutive <= 5) {
              consecutiveCounts[consecutive as keyof typeof consecutiveCounts]++;
            }
            consecutive = 1;
          }
        }
        if (consecutive >= 3 && consecutive <= 5) {
          consecutiveCounts[consecutive as keyof typeof consecutiveCounts]++;
        }
      }

      const newData = {
        salary: 15000,
        items: [
          { item: '', days: 0, hours: 0, people: 0, hourlyRate: 15000 / 210 }
        ],
        notes: ''
      };
      setOvertimeDataByYear(prev => ({ ...prev, [year]: newData }));
      return newData;
    }
    return overtimeDataByYear[year];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data from database
        const [budgetResponse, employeesResponse, masterRatesResponse, overtimeResponse] = await Promise.all([
          fetch('/api/budget-items'),
          fetch('/api/employees'),
          fetch('/api/master-rates'),
          fetch('/api/overtime-items')
        ]);
        
        const [budgetItems, employees, masterRatesArray, overtimeItems] = await Promise.all([
          budgetResponse.json(),
          employeesResponse.json(),
          masterRatesResponse.json(),
          overtimeResponse.json()
        ]);
        
        // Transform budget items to match frontend format
        if (budgetItems.length > 0) {
          const transformed = budgetItems.map((item: any) => {
            const transformedItem = {
              type: item.type || undefined,
              code: item.code || undefined,
              accountCode: item.accountCode || item.account_code || undefined,
              name: item.name,
              values: item.values || {},
              notes: item.notes || ''
            };

            return transformedItem;
          });
          setBudgetData(transformed);
        } else {
          setBudgetData([]);
        }
        
        // Set employees
        if (employees.length > 0) {
          const formattedEmployees = employees.map((emp: any) => ({
            id: emp.employeeId || emp.employee_id || emp.id.toString(),
            name: emp.name,
            gender: emp.gender,
            startYear: emp.startYear || emp.start_year,
            level: emp.level,
            status: emp.status,
            visitProvince: emp.visitProvince || emp.visit_province || '',
            homeVisitBusFare: parseFloat(emp.homeVisitBusFare || emp.home_visit_bus_fare || 0),
            workingDays: emp.workingDays || emp.working_days || 1,
            travelWorkingDays: emp.travelWorkingDays || emp.travel_working_days || 1,
            customTravelRates: emp.customTravelRates
          }));
          setEmployees(formattedEmployees);
          
          // Initialize employee selections with all employees from API
          const allEmployeeIds = formattedEmployees.map(emp => emp.id);
          setSelectedTravelEmployees(allEmployeeIds);
          setSelectedSpecialAssistEmployees(allEmployeeIds);
          setSelectedFamilyVisitEmployees(allEmployeeIds);
          setSelectedCompanyTripEmployees(allEmployeeIds);
          setSelectedManagerRotationEmployees(allEmployeeIds);
        } else {
          setEmployees([]);
        }
        
        // Transform master rates to object format
        const masterRatesObj: MasterRates = {};
        masterRatesArray.forEach((rate: any) => {
          masterRatesObj[rate.level] = {
            position: rate.position,
            rent: parseFloat(rate.rent || 0),
            monthlyAssist: parseFloat(rate.monthlyAssist || rate.monthly_assist || 0),
            travel: parseFloat(rate.travel || 0),
            local: parseFloat(rate.local || 0),
            perDiem: parseFloat(rate.perDiem || rate.per_diem || 0),
            hotel: parseFloat(rate.hotel || 0),
            souvenirAllowance: parseFloat(rate.souvenirAllowance || rate.souvenir_allowance || 0)
          };
        });
        
        if (Object.keys(masterRatesObj).length > 0) {
          setMasterRates(masterRatesObj);
        } else {
          setMasterRates({});
        }
        
        // Initialize other data with defaults
        setSpecialAssist1DataByYear({});
        setOvertimeDataByYear({});
        setHolidaysData(holidaysByYear);
        
        // Transform overtime items by year (one record per year)
        const overtimeByYear: Record<number, any> = {};
        if (overtimeItems && overtimeItems.length > 0) {
          overtimeItems.forEach((item: any) => {
            overtimeByYear[item.year] = {
              salary: parseFloat(item.salary) || 15000,
              items: [{
                item: item.item || '',
                days: item.days || 0,
                hours: item.hours || 0,
                people: item.people || 0,
                hourlyRate: parseFloat(item.rate) || (parseFloat(item.salary) || 15000) / 210
              }],
              notes: ''
            };
          });
        }
        
        // Initialize special assistance data for current year (2569)
        const currentYear = 2569;
        const specialAssistData = {
          items: JSON.parse(JSON.stringify(defaultSpecialAssist1Data)),
          notes: ''
        };
        setSpecialAssist1DataByYear(prev => ({ ...prev, [currentYear]: specialAssistData }));
        
        // Set overtime data from database or initialize defaults
        if (Object.keys(overtimeByYear).length > 0) {
          setOvertimeDataByYear(overtimeByYear);
        } else {
          // Initialize overtime data for current year (2569)
          const overtimeData = {
            salary: 15000,
            items: [
              { item: '', days: 0, hours: 0, people: 0, hourlyRate: 15000 / 210 }
            ],
            notes: ''
          };
          setOvertimeDataByYear(prev => ({ ...prev, [currentYear]: overtimeData }));
        }

        // Employee selections are now initialized above after formatting employees
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty data - force using database only
        setBudgetData([]);
        setEmployees([]);
        setMasterRates({});
        setHolidaysData(holidaysByYear);
        
        // Initialize with empty arrays
        setSelectedTravelEmployees([]);
        setSelectedSpecialAssistEmployees([]);
        setSelectedFamilyVisitEmployees([]);
        setSelectedCompanyTripEmployees([]);
        setSelectedManagerRotationEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update selections when employees change
  useEffect(() => {
    const allEmployeeIds = employees.map(emp => emp.id);
    
    // Update each selection to include new employees and remove deleted ones
    setSelectedTravelEmployees(prev => {
      const validIds = prev.filter(id => allEmployeeIds.includes(id));
      const newIds = allEmployeeIds.filter(id => !prev.includes(id));
      return [...validIds, ...newIds];
    });
    
    setSelectedSpecialAssistEmployees(prev => {
      const validIds = prev.filter(id => allEmployeeIds.includes(id));
      const newIds = allEmployeeIds.filter(id => !prev.includes(id));
      return [...validIds, ...newIds];
    });
    
    setSelectedFamilyVisitEmployees(prev => {
      const validIds = prev.filter(id => allEmployeeIds.includes(id));
      const newIds = allEmployeeIds.filter(id => !prev.includes(id));
      return [...validIds, ...newIds];
    });
    
    setSelectedCompanyTripEmployees(prev => {
      const validIds = prev.filter(id => allEmployeeIds.includes(id));
      const newIds = allEmployeeIds.filter(id => !prev.includes(id));
      return [...validIds, ...newIds];
    });
    
    setSelectedManagerRotationEmployees(prev => {
      const validIds = prev.filter(id => allEmployeeIds.includes(id));
      const newIds = allEmployeeIds.filter(id => !prev.includes(id));
      return [...validIds, ...newIds];
    });
  }, [employees]);

  const saveAllData = async () => {
    try {
      console.log('Saving data to Neon PostgreSQL...');
      console.log('Current overtimeDataByYear:', overtimeDataByYear);
      
      // Save budget items
      const budgetItemsToSave = budgetData.filter(item => !item.type).map(item => ({
        code: item.code,
        accountCode: item.accountCode,
        name: item.name,
        values: item.values || {},
        notes: item.notes || ''
      }));
      
      // Save employees - transform to database format
      const employeesToSave = employees.map(emp => ({
        employeeId: emp.id,
        name: emp.name,
        gender: emp.gender,
        startYear: emp.startYear,
        level: emp.level,
        status: emp.status || 'มีสิทธิ์',
        visitProvince: emp.visitProvince,
        homeVisitBusFare: emp.homeVisitBusFare.toString(),
        workingDays: emp.workingDays || 1,
        travelWorkingDays: emp.travelWorkingDays || 1,
        customTravelRates: emp.customTravelRates || null
      }));
      
      // Save master rates - transform to database format
      const masterRatesToSave = Object.entries(masterRates).map(([level, rates]) => ({
        level,
        position: rates.position,
        rent: rates.rent.toString(),
        monthlyAssist: rates.monthlyAssist.toString(),
        souvenirAllowance: rates.souvenirAllowance.toString(),
        travel: rates.travel.toString(),
        local: rates.local.toString(),
        perDiem: rates.perDiem.toString(),
        hotel: rates.hotel.toString()
      }));
      
      // Prepare overtime items for saving (one record per year)
      const overtimeItemsToSave: any[] = [];
      console.log('Preparing overtime data for saving:', overtimeDataByYear);
      Object.entries(overtimeDataByYear).forEach(([year, data]) => {
        console.log(`Processing year ${year}:`, data);
        // For each year, find the first non-empty item or create default
        const firstItem = data.items.find(item => item.item && item.item.trim());
        
        if (firstItem) {
          const overtimeItem = {
            year: parseInt(year),
            item: firstItem.item,
            days: firstItem.days || 0,
            hours: firstItem.hours || 0,
            people: firstItem.people || 0,
            rate: firstItem.hourlyRate?.toString() || '0',
            salary: data.salary?.toString() || '15000'
          };
          console.log('Adding overtime item for year:', overtimeItem);
          overtimeItemsToSave.push(overtimeItem);
        } else if (data.items.length > 0) {
          // If no items have content, create default record for the year
          const overtimeItem = {
            year: parseInt(year),
            item: '',
            days: 0,
            hours: 0,
            people: 0,
            rate: '0',
            salary: data.salary?.toString() || '15000'
          };
          console.log('Adding default overtime item for year:', overtimeItem);
          overtimeItemsToSave.push(overtimeItem);
        }
      });
      console.log('Final overtime items to save:', overtimeItemsToSave);

      // Save all data
      const responses = await Promise.all([
        // Save budget items
        fetch('/api/budget-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetItemsToSave)
        }),
        // Save employees
        fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeesToSave)
        }),
        // Save master rates
        fetch('/api/master-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(masterRatesToSave)
        }),
        // Save overtime items
        fetch('/api/overtime-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(overtimeItemsToSave)
        })
      ]);
      
      // Check if all requests were successful
      responses.forEach((response, index) => {
        if (!response.ok) {
          const endpoints = ['budget-items', 'employees', 'master-rates', 'overtime-items'];
          throw new Error(`Failed to save ${endpoints[index]}: ${response.status}`);
        }
      });
      
      console.log('Data saved to Neon PostgreSQL successfully');
      return { success: true, message: 'บันทึกข้อมูลสำเร็จ' };
    } catch (error) {
      console.error('Error saving to database:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error };
    }
  };

  const updateBudgetItem = (index: number, year: number, value: number) => {
    console.log('Updating budget item:', { index, year, value });
    setBudgetData(prev => {
      const updated = [...prev];
      if (updated[index]) {
        if (!updated[index].values) {
          updated[index] = { ...updated[index], values: {} };
        }
        updated[index] = {
          ...updated[index],
          values: {
            ...updated[index].values,
            [year]: value
          }
        };
        console.log('Updated item:', updated[index]);
      }
      return updated;
    });
  };

  const updateBudgetNotes = (index: number, notes: string) => {
    setBudgetData(prev => {
      const updated = [...prev];
      updated[index].notes = notes;
      return updated;
    });
  };

  const updateBudgetField = (index: number, field: string, value: string) => {
    console.log('Updating budget field:', { index, field, value });
    setBudgetData(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
        console.log('Updated field:', updated[index]);
      }
      return updated;
    });
  };

  const updateEmployee = (index: number, employee: Employee) => {
    setEmployees(prev => {
      const updated = [...prev];
      updated[index] = employee;
      return updated;
    });
  };

  const addEmployee = () => {
    const newEmployee: Employee = {
      id: '',
      name: '',
      gender: 'ชาย',
      startYear: new Date().getFullYear() + 543,
      level: '3',
      visitProvince: '',
      homeVisitBusFare: 0
    };
    setEmployees(prev => [newEmployee, ...prev]);
  };

  const deleteEmployee = (index: number) => {
    setEmployees(prev => prev.filter((_, i) => i !== index));
  };

  const updateMasterRate = async (level: string, key: string, value: any) => {
    // Update local state first for immediate UI feedback
    setMasterRates(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [key]: key === 'position' ? value : (parseFloat(value) || 0)
      }
    }));

    try {
      // Find the master rate ID for this level
      const allRates = await fetch('/api/master-rates').then(res => res.json());
      const rateToUpdate = allRates.find((rate: any) => rate.level === level);
      
      if (rateToUpdate) {
        // Prepare data for database update (snake_case)
        const updateData: any = {};
        
        // Map camelCase to snake_case for database
        const fieldMapping: { [key: string]: string } = {
          position: 'position',
          rent: 'rent',
          monthlyAssist: 'monthlyAssist',
          souvenirAllowance: 'souvenirAllowance',
          travel: 'travel',
          local: 'local',
          perDiem: 'perDiem',
          hotel: 'hotel'
        };
        
        const dbField = fieldMapping[key] || key;
        updateData[dbField] = key === 'position' ? value : value.toString();
        
        // Update database
        const response = await fetch(`/api/master-rates/${rateToUpdate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update master rate: ${response.status}`);
        }
        
        console.log(`Successfully updated ${key} for level ${level}`);
      }
    } catch (error) {
      console.error('Error updating master rate:', error);
      // Revert local state on error
      setMasterRates(prev => ({
        ...prev,
        [level]: {
          ...prev[level],
          [key]: prev[level][key] // Revert to previous value
        }
      }));
    }
  };

  const updateSpecialAssist1Item = (year: number, index: number, key: string, value: any) => {
    setSpecialAssist1DataByYear(prev => {
      const yearData = prev[year] || { items: [], notes: '' };
      const updatedItems = [...yearData.items];
      const isNumeric = key !== 'item';
      updatedItems[index] = {
        ...updatedItems[index],
        [key]: isNumeric ? (parseFloat(value) || 0) : value
      };
      return {
        ...prev,
        [year]: { ...yearData, items: updatedItems }
      };
    });
  };

  const updateSpecialAssist1Notes = (year: number, notes: string) => {
    setSpecialAssist1DataByYear(prev => ({
      ...prev,
      [year]: { ...prev[year], notes }
    }));
  };

  const updateOvertimeData = (year: number, field: string, indexOrValue: any, key?: string, value?: any) => {
    console.log('updateOvertimeData called:', { year, field, indexOrValue, key, value });
    setOvertimeDataByYear(prev => {
      const yearData = prev[year] || { salary: 15000, items: [] };
      console.log('Current yearData:', yearData);
      if (field === 'salary') {
        const updated = {
          ...prev,
          [year]: { ...yearData, salary: parseFloat(indexOrValue) || 0 }
        };
        console.log('Updated overtime data (salary):', updated);
        return updated;
      } else if (field === 'items' && key) {
        const updatedItems = [...yearData.items];
        const isNumeric = key !== 'item';
        updatedItems[indexOrValue] = {
          ...updatedItems[indexOrValue],
          [key]: isNumeric ? (parseFloat(value) || 0) : value
        };
        const updated = {
          ...prev,
          [year]: { ...yearData, items: updatedItems }
        };
        console.log('Updated overtime data (items):', updated);
        return updated;
      }
      return prev;
    });
  };

  const addHoliday = (yearCE: number, holiday: Holiday) => {
    setHolidaysData(prev => {
      const yearHolidays = [...(prev[yearCE] || []), holiday];
      yearHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { ...prev, [yearCE]: yearHolidays };
    });
  };

  const deleteHoliday = (yearCE: number, index: number) => {
    setHolidaysData(prev => ({
      ...prev,
      [yearCE]: prev[yearCE]?.filter((_, i) => i !== index) || []
    }));
  };

  const resetAllData = () => {
    setBudgetData(initializeBudgetData(defaultBudgetItems));
    setEmployees([]);
    setMasterRates({ ...defaultMasterRates });
    setSpecialAssist1DataByYear({});
    setOvertimeDataByYear({});
    setHolidaysData(holidaysByYear);
    
    // Reset selections to empty arrays
    setSelectedTravelEmployees([]);
    setSelectedSpecialAssistEmployees([]);
    setSelectedFamilyVisitEmployees([]);
    setSelectedCompanyTripEmployees([]);
    setSelectedManagerRotationEmployees([]);
  };

  return {
    employees,
    masterRates,
    specialAssist1DataByYear,
    overtimeDataByYear,
    holidaysData,
    selectedTravelEmployees,
    selectedSpecialAssistEmployees,
    selectedFamilyVisitEmployees,
    selectedCompanyTripEmployees,
    selectedManagerRotationEmployees,
    isLoading,
    updateEmployee,
    addEmployee,
    deleteEmployee,
    updateMasterRate,
    setEmployees,
    getSpecialAssist1DataForYear,
    getOvertimeDataForYear,
    updateSpecialAssist1Item,
    updateSpecialAssist1Notes,
    updateOvertimeData,
    addHoliday,
    deleteHoliday,
    setSelectedTravelEmployees,
    setSelectedSpecialAssistEmployees,
    setSelectedFamilyVisitEmployees,
    setSelectedCompanyTripEmployees,
    setSelectedManagerRotationEmployees,
    saveAllData,
    resetAllData
  };
};