import React from 'react';
import { Employee, MasterRates, SpecialAssistData, OvertimeData, Holiday } from '../../types';
import { UnifiedSpecialAssistanceManager } from './UnifiedSpecialAssistanceManager';

interface SpecialAssistanceManagerProps {
  employees: Employee[];
  masterRates: MasterRates;
  calcYear: number;
  selectedEmployeeIds: string[];
  specialAssist1Data: SpecialAssistData;
  overtimeData: OvertimeData;
  holidaysData: Record<number, Holiday[]>;
  onYearChange: (year: number) => void;
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onUpdateSelection: (employeeIds: string[]) => void;
  onUpdateSpecialAssist1Item: (year: number, index: number, key: string, value: any) => void;
  onUpdateSpecialAssist1Notes: (year: number, notes: string) => void;
  onUpdateOvertimeData: (year: number, field: string, indexOrValue: any, key?: string, value?: any) => void;
  onSave: () => void;
}

export const SpecialAssistanceManager: React.FC<SpecialAssistanceManagerProps> = (props) => {
  return <UnifiedSpecialAssistanceManager {...props} />;
};