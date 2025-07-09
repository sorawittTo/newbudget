import { pgTable, text, serial, integer, boolean, decimal, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  gender: text("gender").notNull(), // 'ชาย' | 'หญิง'
  startYear: integer("start_year").notNull(),
  level: text("level").notNull(),
  status: text("status").default('มีสิทธิ์'), // 'มีสิทธิ์' | 'หมดสิทธิ์'
  visitProvince: text("visit_province").notNull(),
  homeVisitBusFare: decimal("home_visit_bus_fare", { precision: 10, scale: 2 }).default('0'),
  workingDays: integer("working_days").default(1),
  travelWorkingDays: integer("travel_working_days").default(1),
  customTravelRates: json("custom_travel_rates").$type<{
    hotel?: number;
    perDiem?: number;
    travel?: number;
    local?: number;
    souvenirAllowance?: number;
    other?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masterRates = pgTable("master_rates", {
  id: serial("id").primaryKey(),
  level: text("level").notNull().unique(),
  position: text("position").notNull(),
  rent: decimal("rent", { precision: 10, scale: 2 }).notNull(), // ค่าเช่าบ้าน
  monthlyAssist: decimal("monthly_assist", { precision: 10, scale: 2 }).notNull(), // ค่าช่วยเหลือรายเดือน
  souvenirAllowance: decimal("souvenir_allowance", { precision: 10, scale: 2 }).notNull(), // ค่าซื้อของเหมาจ่าย
  travel: decimal("travel", { precision: 10, scale: 2 }).notNull(), // ค่าพาหนะประจำทาง
  local: decimal("local", { precision: 10, scale: 2 }).notNull(), // ค่าพาหนะรับจ้าง
  perDiem: decimal("per_diem", { precision: 10, scale: 2 }).notNull(), // ค่าเบี้ยเลี้ยง
  hotel: decimal("hotel", { precision: 10, scale: 2 }).notNull(), // ค่าที่พัก
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  type: text("type"), // 'main_header' | 'header' | null
  code: text("code"),
  accountCode: text("account_code"), // รหัสบัญชีสำหรับการอ้างอิง
  name: text("name").notNull(),
  values: json("values").$type<Record<number, number>>().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const specialAssistItems = pgTable("special_assist_items", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  item: text("item").notNull(),
  timesPerYear: integer("times_per_year").default(1),
  days: integer("days").default(1),
  people: integer("people").default(1),
  rate: decimal("rate", { precision: 10, scale: 2 }).default('0'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const overtimeItems = pgTable("overtime_items", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  item: text("item").notNull(),
  instances: integer("instances").default(1),
  days: integer("days").default(1),
  hours: integer("hours").default(8),
  people: integer("people").default(1),
  rate: decimal("rate", { precision: 10, scale: 2 }),
  salary: decimal("salary", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  isSpecial: boolean("is_special").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assistanceData = pgTable("assistance_data", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  months: integer("months").default(12),
  lumpSum: decimal("lump_sum", { precision: 10, scale: 2 }).default('0'),
  purchaseAllowance: decimal("purchase_allowance", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  homeVisitBusFare: z.union([z.string(), z.number()]).transform(val => val.toString()),
  customTravelRates: z.any().optional(),
});

export const insertMasterRateSchema = createInsertSchema(masterRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpecialAssistItemSchema = createInsertSchema(specialAssistItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOvertimeItemSchema = createInsertSchema(overtimeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
});

export const insertAssistanceDataSchema = createInsertSchema(assistanceData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertMasterRate = z.infer<typeof insertMasterRateSchema>;
export type MasterRate = typeof masterRates.$inferSelect;

export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;

export type InsertSpecialAssistItem = z.infer<typeof insertSpecialAssistItemSchema>;
export type SpecialAssistItem = typeof specialAssistItems.$inferSelect;

export type InsertOvertimeItem = z.infer<typeof insertOvertimeItemSchema>;
export type OvertimeItem = typeof overtimeItems.$inferSelect;

export type InsertHoliday = z.infer<typeof insertHolidaySchema>;
export type Holiday = typeof holidays.$inferSelect;

export type InsertAssistanceData = z.infer<typeof insertAssistanceDataSchema>;
export type AssistanceData = typeof assistanceData.$inferSelect;
