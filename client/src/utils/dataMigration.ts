import { StorageManager } from './storage';
import { BudgetItem, Employee, MasterRates } from '../types';

export const migrateLocalStorageToDatabase = async (): Promise<void> => {
  try {
    console.log('Starting data migration from localStorage to Neon PostgreSQL...');
    
    // Load all data from localStorage
    const budgetData = StorageManager.load<BudgetItem[]>('BUDGET', []);
    const employees = StorageManager.load<Employee[]>('EMPLOYEES', []);
    const masterRates = StorageManager.load<MasterRates>('MASTER_RATES', {});
    
    console.log('Loaded data:', { 
      budgetItems: budgetData.length, 
      employees: employees.length, 
      masterRates: Object.keys(masterRates).length 
    });

    // Migrate employees
    if (employees.length > 0) {
      console.log('Migrating employees...');
      for (const employee of employees) {
        try {
          const response = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: employee.id,
              name: employee.name,
              gender: employee.gender,
              start_year: employee.startYear,
              level: employee.level,
              status: employee.status || 'มีสิทธิ์',
              visit_province: employee.visitProvince,
              home_visit_bus_fare: employee.homeVisitBusFare,
              custom_travel_rates: employee.customTravelRates || {}
            })
          });
          
          if (!response.ok) {
            console.error(`Failed to migrate employee ${employee.name}:`, await response.text());
          }
        } catch (error) {
          console.error(`Error migrating employee ${employee.name}:`, error);
        }
      }
    }

    // Migrate master rates
    if (Object.keys(masterRates).length > 0) {
      console.log('Migrating master rates...');
      for (const [level, rateData] of Object.entries(masterRates)) {
        try {
          const response = await fetch('/api/master-rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: level,
              position: rateData.position,
              rent: rateData.rent,
              monthly_assist: rateData.monthlyAssist,
              lump_sum: rateData.lumpSum,
              travel: rateData.travel,
              local: rateData.local,
              per_diem: rateData.perDiem,
              hotel: rateData.hotel
            })
          });
          
          if (!response.ok) {
            console.error(`Failed to migrate master rate for level ${level}:`, await response.text());
          }
        } catch (error) {
          console.error(`Error migrating master rate for level ${level}:`, error);
        }
      }
    }

    // Migrate budget items
    if (budgetData.length > 0) {
      console.log('Migrating budget items...');
      for (const item of budgetData) {
        // Skip header items
        if (item.type) continue;
        
        try {
          const response = await fetch('/api/budget-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: item.type,
              code: item.code,
              name: item.name,
              values: item.values || {},
              notes: item.notes || ''
            })
          });
          
          if (!response.ok) {
            console.error(`Failed to migrate budget item ${item.name}:`, await response.text());
          }
        } catch (error) {
          console.error(`Error migrating budget item ${item.name}:`, error);
        }
      }
    }

    console.log('Data migration completed successfully!');
    
  } catch (error) {
    console.error('Error during data migration:', error);
    throw error;
  }
};

export const verifyMigration = async (): Promise<void> => {
  try {
    console.log('Verifying migration...');
    
    // Check employees
    const employeesResponse = await fetch('/api/employees');
    const employees = await employeesResponse.json();
    console.log(`Database has ${employees.length} employees`);
    
    // Check master rates
    const ratesResponse = await fetch('/api/master-rates');
    const rates = await ratesResponse.json();
    console.log(`Database has ${rates.length} master rates`);
    
    // Check budget items
    const budgetResponse = await fetch('/api/budget-items');
    const budgetItems = await budgetResponse.json();
    console.log(`Database has ${budgetItems.length} budget items`);
    
    console.log('Migration verification completed!');
    
  } catch (error) {
    console.error('Error during migration verification:', error);
    throw error;
  }
};