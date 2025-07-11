import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
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

const sql = neon(process.env.DATABASE_URL!);
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
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(schema.employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await db.select().from(schema.employees).where(eq(schema.employees.id, id));
    return result[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(schema.employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const result = await db.update(schema.employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(schema.employees.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(schema.employees).where(eq(schema.employees.id, id));
  }

  // Master Rates methods
  async getMasterRates(): Promise<MasterRate[]> {
    return await db.select().from(schema.masterRates);
  }

  async createMasterRate(rate: InsertMasterRate): Promise<MasterRate> {
    const result = await db.insert(schema.masterRates).values(rate).returning();
    return result[0];
  }

  async updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate> {
    const result = await db.update(schema.masterRates)
      .set({ ...rate, updatedAt: new Date() })
      .where(eq(schema.masterRates.id, id))
      .returning();
    return result[0];
  }

  // Budget Items methods
  async getBudgetItems(): Promise<BudgetItem[]> {
    return await db.select().from(schema.budgetItems);
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const result = await db.insert(schema.budgetItems).values(item).returning();
    return result[0];
  }

  async updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    const result = await db.update(schema.budgetItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.budgetItems.id, id))
      .returning();
    return result[0];
  }
  
  // Special Assist Items methods
  async getSpecialAssistItems(): Promise<SpecialAssistItem[]> {
    return await db.select().from(schema.specialAssistItems);
  }

  async createSpecialAssistItem(item: InsertSpecialAssistItem): Promise<SpecialAssistItem> {
    const result = await db.insert(schema.specialAssistItems).values(item).returning();
    return result[0];
  }

  async updateSpecialAssistItem(id: number, item: Partial<InsertSpecialAssistItem>): Promise<SpecialAssistItem> {
    const result = await db.update(schema.specialAssistItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.specialAssistItems.id, id))
      .returning();
    return result[0];
  }
  
  // Overtime Items methods
  async getOvertimeItems(): Promise<OvertimeItem[]> {
    return await db.select().from(schema.overtimeItems);
  }

  async createOvertimeItem(item: InsertOvertimeItem): Promise<OvertimeItem> {
    const result = await db.insert(schema.overtimeItems).values(item).returning();
    return result[0];
  }

  async updateOvertimeItem(id: number, item: Partial<InsertOvertimeItem>): Promise<OvertimeItem> {
    const result = await db.update(schema.overtimeItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(schema.overtimeItems.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
