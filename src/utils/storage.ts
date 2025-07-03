import { BudgetItem, Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../types';

const STORAGE_KEYS = {
  BUDGET: 'budgetSystem_budgetData_v3',
  EMPLOYEES: 'budgetSystem_employeeData_v2',
  ASSIST1: 'budgetSystem_assist1Data_v1',
  OVERTIME: 'budgetSystem_overtimeData_v1',
  MASTER_RATES: 'budgetSystem_masterRates_v1',
  HOLIDAYS: 'budgetSystem_holidaysData_v1',
} as const;

export class StorageManager {
  static save<T>(key: keyof typeof STORAGE_KEYS, data: T): void {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('ไม่สามารถบันทึกข้อมูลได้ อาจเป็นเพราะพื้นที่จัดเก็บเต็ม');
    }
  }

  static load<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS[key]);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key: keyof typeof STORAGE_KEYS): void {
    localStorage.removeItem(STORAGE_KEYS[key]);
  }

  static clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
}