import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
import { db } from "./db";

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
  getMasterRates(): Promise<MasterRate[]>;
  createMasterRate(rate: InsertMasterRate): Promise<MasterRate>;
  updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate>;
  
  // Budget Items methods
  getBudgetItems(): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem>;
  
  // Special Assist Items methods
  getSpecialAssistItems(): Promise<SpecialAssistItem[]>;
  createSpecialAssistItem(item: InsertSpecialAssistItem): Promise<SpecialAssistItem>;
  updateSpecialAssistItem(id: number, item: Partial<InsertSpecialAssistItem>): Promise<SpecialAssistItem>;
  
  // Overtime Items methods
  getOvertimeItems(): Promise<OvertimeItem[]>;
  createOvertimeItem(item: InsertOvertimeItem): Promise<OvertimeItem>;
  updateOvertimeItem(id: number, item: Partial<InsertOvertimeItem>): Promise<OvertimeItem>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!db) {
      console.warn('Database not available, returning undefined');
      return undefined;
    }
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) {
      console.warn('Database not available, returning undefined');
      return undefined;
    }
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockEmployees;
    }
    return await db.select().from(schema.employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    if (!db) {
      console.warn('Database not available, returning undefined');
      return undefined;
    }
    const result = await db.select().from(schema.employees).where(eq(schema.employees.id, id));
    return result[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.insert(schema.employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.update(schema.employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(schema.employees.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployee(id: number): Promise<void> {
    if (!db) {
      console.warn('Database not available, mock delete');
      return;
    }
    await db.delete(schema.employees).where(eq(schema.employees.id, id));
  }

  // Master Rates methods
  async getMasterRates(): Promise<MasterRate[]> {
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockMasterRates;
    }
    return await db.select().from(schema.masterRates);
  }

  async createMasterRate(rate: InsertMasterRate): Promise<MasterRate> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.insert(schema.masterRates).values(rate).returning();
    return result[0];
  }

  async updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.update(schema.masterRates)
      .set({ ...rate, updatedAt: new Date() })
      .where(eq(schema.masterRates.id, id))
      .returning();
    return result[0];
  }

  // Budget Items methods
  async getBudgetItems(): Promise<BudgetItem[]> {
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockBudgetItems;
    }
    return await db.select().from(schema.budgetItems);
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.insert(schema.budgetItems).values(item).returning();
    return result[0];
  }

  async updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.update(schema.budgetItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.budgetItems.id, id))
      .returning();
    return result[0];
  }
  
  // Special Assist Items methods
  async getSpecialAssistItems(): Promise<SpecialAssistItem[]> {
    if (!db) {
      console.warn('Database not available, returning mock data');
      return [];
    }
    return await db.select().from(schema.specialAssistItems);
  }

  async createSpecialAssistItem(item: InsertSpecialAssistItem): Promise<SpecialAssistItem> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.insert(schema.specialAssistItems).values(item).returning();
    return result[0];
  }

  async updateSpecialAssistItem(id: number, item: Partial<InsertSpecialAssistItem>): Promise<SpecialAssistItem> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.update(schema.specialAssistItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.specialAssistItems.id, id))
      .returning();
    return result[0];
  }
  
  // Overtime Items methods
  async getOvertimeItems(): Promise<OvertimeItem[]> {
    if (!db) {
      console.warn('Database not available, returning mock data');
      return mockOvertimeItems;
    }
    return await db.select().from(schema.overtimeItems);
  }

  async createOvertimeItem(item: InsertOvertimeItem): Promise<OvertimeItem> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.insert(schema.overtimeItems).values(item).returning();
    return result[0];
  }

  async updateOvertimeItem(id: number, item: Partial<InsertOvertimeItem>): Promise<OvertimeItem> {
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.update(schema.overtimeItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.overtimeItems.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
