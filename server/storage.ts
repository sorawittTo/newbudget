import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
// Mock data for when database is not available
const mockEmployees: any[] = [];
const mockMasterRates: any[] = [];
const mockBudgetItems: any[] = [];
const mockOvertimeItems: any[] = [];

import type { 
  User, 
  InsertUser, 
  Employee,
  InsertEmployee,
  MasterRate,
  InsertMasterRate,
  BudgetItem,
  InsertBudgetItem,
  SpecialAssistItem,
  InsertSpecialAssistItem,
  OvertimeItem,
  InsertOvertimeItem
} from "../shared/schema";

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!);
const db = drizzle(sql, { schema });

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;
  
  // Master Rates methods
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockEmployees;
    }
  getMasterRates(): Promise<MasterRate[]>;
  createMasterRate(rate: InsertMasterRate): Promise<MasterRate>;
  updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate>;
  
      return mockEmployees;
  getBudgetItems(): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem>;
  
    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id: Date.now(), ...data };
    }
  // Special Assist Items methods
  getSpecialAssistItems(): Promise<SpecialAssistItem[]>;
  createSpecialAssistItem(item: InsertSpecialAssistItem): Promise<SpecialAssistItem>;
  updateSpecialAssistItem(id: number, item: Partial<InsertSpecialAssistItem>): Promise<SpecialAssistItem>;
  
      return { id: Date.now(), ...data };
  getOvertimeItems(): Promise<OvertimeItem[]>;
  createOvertimeItem(item: InsertOvertimeItem): Promise<OvertimeItem>;
  updateOvertimeItem(id: number, item: Partial<InsertOvertimeItem>): Promise<OvertimeItem>;
}
    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id, ...data };
    }

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

      return { id, ...data };
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

    if (!db) {
      console.warn('Database not available, mock delete');
      return;
    }
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }
      // Fail silently for mock
  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(schema.employees);
  }
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockMasterRates;
    }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await db.select().from(schema.employees).where(eq(schema.employees.id, id));
    return result[0];
      return mockMasterRates;

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(schema.employees).values(employee).returning();
    return result[0];
    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id: Date.now(), ...data };
    }
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const result = await db.update(schema.employees)
      .set({ ...employee, updatedAt: new Date() })
      return { id: Date.now(), ...data };
      .returning();
    return result[0];
  }

    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id, ...data };
    }
  async deleteEmployee(id: number): Promise<void> {
    await db.delete(schema.employees).where(eq(schema.employees.id, id));
  }

  // Master Rates methods
  async getMasterRates(): Promise<MasterRate[]> {
    return await db.select().from(schema.masterRates);
  }
      return { id, ...data };
  async createMasterRate(rate: InsertMasterRate): Promise<MasterRate> {
    const result = await db.insert(schema.masterRates).values(rate).returning();
    return result[0];
  }
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockBudgetItems;
    }

  async updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate> {
    const result = await db.update(schema.masterRates)
      .set({ ...rate, updatedAt: new Date() })
      return mockBudgetItems;
      .returning();
    return result[0];
  }

    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id: Date.now(), ...data };
    }
  // Budget Items methods
  async getBudgetItems(): Promise<BudgetItem[]> {
    return await db.select().from(schema.budgetItems);
  }

      return { id: Date.now(), ...data };
    const result = await db.insert(schema.budgetItems).values(item).returning();
    return result[0];
  }

    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id, ...data };
    }
  async updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    const result = await db.update(schema.budgetItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.budgetItems.id, id))
      .returning();
    return result[0];
  }
  
      return { id, ...data };
  async getSpecialAssistItems(): Promise<SpecialAssistItem[]> {
    return await db.select().from(schema.specialAssistItems);
  }

    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockOvertimeItems;
    }
  async createSpecialAssistItem(item: InsertSpecialAssistItem): Promise<SpecialAssistItem> {
    const result = await db.insert(schema.specialAssistItems).values(item).returning();
    return result[0];
  }
      return mockOvertimeItems;
  async updateSpecialAssistItem(id: number, item: Partial<InsertSpecialAssistItem>): Promise<SpecialAssistItem> {
    const result = await db.update(schema.specialAssistItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.specialAssistItems.id, id))
    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id: Date.now(), ...data };
    }
      .returning();
    return result[0];
  }
  
  // Overtime Items methods
      return { id: Date.now(), ...data };
    return await db.select().from(schema.overtimeItems);
  }

  async createOvertimeItem(item: InsertOvertimeItem): Promise<OvertimeItem> {
    if (!db) {
      console.warn('Database not available, returning mock data');
      return { id, ...data };
    }
    const result = await db.insert(schema.overtimeItems).values(item).returning();
    return result[0];
  }

  async updateOvertimeItem(id: number, item: Partial<InsertOvertimeItem>): Promise<OvertimeItem> {
    const result = await db.update(schema.overtimeItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.overtimeItems.id, id))
      return { id, ...data };
    return result[0];
  }
}

export const storage = new DatabaseStorage();
