// JavaScript version of storage for Vercel compatibility
const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const { eq } = require("drizzle-orm");
const schema = require("../shared/schema.js");

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

class DatabaseStorage {
  async getUser(id) {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username) {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(insertUser) {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  async getEmployees() {
    return await db.select().from(schema.employees).orderBy(schema.employees.id);
  }

  async getEmployee(id) {
    const result = await db.select().from(schema.employees).where(eq(schema.employees.id, id));
    return result[0];
  }

  async createEmployee(employee) {
    const result = await db.insert(schema.employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id, employee) {
    const result = await db.update(schema.employees).set(employee).where(eq(schema.employees.id, id)).returning();
    return result[0];
  }

  async deleteEmployee(id) {
    await db.delete(schema.employees).where(eq(schema.employees.id, id));
  }

  async getMasterRates() {
    return await db.select().from(schema.masterRates).orderBy(schema.masterRates.id);
  }

  async createMasterRate(rate) {
    const result = await db.insert(schema.masterRates).values(rate).returning();
    return result[0];
  }

  async updateMasterRate(id, rate) {
    const result = await db.update(schema.masterRates).set(rate).where(eq(schema.masterRates.id, id)).returning();
    return result[0];
  }

  async getBudgetItems() {
    return await db.select().from(schema.budgetItems).orderBy(schema.budgetItems.id);
  }

  async createBudgetItem(item) {
    const result = await db.insert(schema.budgetItems).values(item).returning();
    return result[0];
  }

  async updateBudgetItem(id, item) {
    const result = await db.update(schema.budgetItems).set(item).where(eq(schema.budgetItems.id, id)).returning();
    return result[0];
  }

  async getSpecialAssistItems() {
    return await db.select().from(schema.specialAssistItems).orderBy(schema.specialAssistItems.id);
  }

  async createSpecialAssistItem(item) {
    const result = await db.insert(schema.specialAssistItems).values(item).returning();
    return result[0];
  }

  async updateSpecialAssistItem(id, item) {
    const result = await db.update(schema.specialAssistItems).set(item).where(eq(schema.specialAssistItems.id, id)).returning();
    return result[0];
  }

  async getOvertimeItems() {
    return await db.select().from(schema.overtimeItems).orderBy(schema.overtimeItems.id);
  }

  async createOvertimeItem(item) {
    const result = await db.insert(schema.overtimeItems).values(item).returning();
    return result[0];
  }

  async updateOvertimeItem(id, item) {
    const result = await db.update(schema.overtimeItems).set(item).where(eq(schema.overtimeItems.id, id)).returning();
    return result[0];
  }
}

const storage = new DatabaseStorage();

module.exports = { DatabaseStorage, storage };