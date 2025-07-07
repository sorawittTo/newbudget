import { useState, useEffect } from 'react';
import { BudgetItem, Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../types';
import { defaultBudgetItems, defaultEmployees, defaultMasterRates, defaultSpecialAssist1Data, holidaysByYear } from '../data/defaults';
import { StorageManager } from '../utils/storage';

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
      setSpecialAssist1DataByYear(prev => ({ ...prev, [year]: newData }));
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
          { item: 'วันหยุดยาว 3 วัน', days: 3, instances: consecutiveCounts[3], hours: 8, people: 1 },
          { item: 'วันหยุดยาว 4 วัน', days: 4, instances: consecutiveCounts[4], hours: 8, people: 1 },
          { item: 'วันหยุดยาว 5 วัน', days: 5, instances: consecutiveCounts[5], hours: 8, people: 1 },
        ]
      };
      setOvertimeDataByYear(prev => ({ ...prev, [year]: newData }));
      return newData;
    }
    return overtimeDataByYear[year];
  };

  useEffect(() => {
    const loadData = () => {
      try {
        // Load budget data
        const savedBudget = StorageManager.load('BUDGET', []);
        const defaultData = initializeBudgetData(defaultBudgetItems);
        
        if (savedBudget.length > 0) {
          const mergedBudget = defaultData.map(defaultItem => {
            if (defaultItem.type) return defaultItem;
            const savedItem = savedBudget.find((s: BudgetItem) => s.code === defaultItem.code);
            if (savedItem) {
              const mergedValues = { ...defaultItem.values, ...savedItem.values };
              return { ...defaultItem, ...savedItem, values: mergedValues };
            }
            return defaultItem;
          });
          setBudgetData(mergedBudget);
        } else {
          setBudgetData(defaultData);
        }

        // Load other data
        const loadedEmployees = StorageManager.load('EMPLOYEES', defaultEmployees);
        setEmployees(loadedEmployees);
        setMasterRates(StorageManager.load('MASTER_RATES', defaultMasterRates));
        setSpecialAssist1DataByYear(StorageManager.load('ASSIST1', {}));
        setOvertimeDataByYear(StorageManager.load('OVERTIME', {}));
        
        // Load holidays data
        const savedHolidays = StorageManager.load('HOLIDAYS', holidaysByYear);
        setHolidaysData(savedHolidays);

        // Initialize employee selections with all employees
        const allEmployeeIds = loadedEmployees.map(emp => emp.id);
        setSelectedTravelEmployees(allEmployeeIds);
        setSelectedSpecialAssistEmployees(allEmployeeIds);
        setSelectedFamilyVisitEmployees(allEmployeeIds);
        setSelectedCompanyTripEmployees(allEmployeeIds);
        setSelectedManagerRotationEmployees(allEmployeeIds);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to defaults
        setBudgetData(initializeBudgetData(defaultBudgetItems));
        setEmployees(defaultEmployees);
        setMasterRates(defaultMasterRates);
        setHolidaysData(holidaysByYear);
        
        // Initialize with default employees
        const allEmployeeIds = defaultEmployees.map(emp => emp.id);
        setSelectedTravelEmployees(allEmployeeIds);
        setSelectedSpecialAssistEmployees(allEmployeeIds);
        setSelectedFamilyVisitEmployees(allEmployeeIds);
        setSelectedCompanyTripEmployees(allEmployeeIds);
        setSelectedManagerRotationEmployees(allEmployeeIds);
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

  const saveAllData = () => {
    StorageManager.save('BUDGET', budgetData);
    StorageManager.save('EMPLOYEES', employees);
    StorageManager.save('MASTER_RATES', masterRates);
    StorageManager.save('ASSIST1', specialAssist1DataByYear);
    StorageManager.save('OVERTIME', overtimeDataByYear);
    StorageManager.save('HOLIDAYS', holidaysData);
  };

  const updateBudgetItem = (index: number, year: number, value: number) => {
    setBudgetData(prev => {
      const updated = [...prev];
      if (updated[index].values) {
        updated[index].values![year] = value;
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

  const updateMasterRate = (level: string, key: string, value: any) => {
    setMasterRates(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [key]: key === 'position' ? value : (parseFloat(value) || 0)
      }
    }));
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
    setOvertimeDataByYear(prev => {
      const yearData = prev[year] || { salary: 15000, items: [] };
      if (field === 'salary') {
        return {
          ...prev,
          [year]: { ...yearData, salary: parseFloat(indexOrValue) || 0 }
        };
      } else if (field === 'items' && key) {
        const updatedItems = [...yearData.items];
        const isNumeric = key !== 'item';
        updatedItems[indexOrValue] = {
          ...updatedItems[indexOrValue],
          [key]: isNumeric ? (parseFloat(value) || 0) : value
        };
        return {
          ...prev,
          [year]: { ...yearData, items: updatedItems }
        };
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
    StorageManager.clear();
    setBudgetData(initializeBudgetData(defaultBudgetItems));
    setEmployees([...defaultEmployees]);
    setMasterRates({ ...defaultMasterRates });
    setSpecialAssist1DataByYear({});
    setOvertimeDataByYear({});
    setHolidaysData(holidaysByYear);
    
    // Reset employee selections
    const allEmployeeIds = defaultEmployees.map(emp => emp.id);
    setSelectedTravelEmployees(allEmployeeIds);
    setSelectedSpecialAssistEmployees(allEmployeeIds);
    setSelectedFamilyVisitEmployees(allEmployeeIds);
    setSelectedCompanyTripEmployees(allEmployeeIds);
    setSelectedManagerRotationEmployees(allEmployeeIds);
  };

  return {
    budgetData,
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
    updateBudgetItem,
    updateBudgetNotes,
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