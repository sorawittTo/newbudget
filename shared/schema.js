// JavaScript version of schema for Vercel compatibility
const { pgTable, text, serial, integer, boolean, decimal, json, timestamp } = require("drizzle-orm/pg-core");
const { createInsertSchema } = require("drizzle-zod");
const { z } = require("zod");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  startYear: integer("start_year").notNull(),
  level: text("level").notNull(),
  status: text("status").default('มีสิทธิ์'),
  visitProvince: text("visit_province").notNull(),
  homeVisitBusFare: decimal("home_visit_bus_fare", { precision: 10, scale: 2 }).default('0'),
  workingDays: integer("working_days").default(1),
  travelWorkingDays: integer("travel_working_days").default(1),
  customTravelRates: json("custom_travel_rates"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const masterRates = pgTable("master_rates", {
  id: serial("id").primaryKey(),
  level: text("level").notNull().unique(),
  position: text("position").notNull(),
  rent: decimal("rent", { precision: 10, scale: 2 }).notNull(),
  monthlyAssist: decimal("monthly_assist", { precision: 10, scale: 2 }).notNull(),
  souvenirAllowance: decimal("souvenir_allowance", { precision: 10, scale: 2 }).notNull(),
  travel: decimal("travel", { precision: 10, scale: 2 }).notNull(),
  local: decimal("local", { precision: 10, scale: 2 }).notNull(),
  perDiem: decimal("per_diem", { precision: 10, scale: 2 }).notNull(),
  hotel: decimal("hotel", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  type: text("type"),
  code: text("code"),
  accountCode: text("account_code"),
  name: text("name").notNull(),
  values: json("values"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const specialAssistItems = pgTable("special_assist_items", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  item: text("item").notNull(),
  timesPerYear: integer("times_per_year").notNull(),
  days: integer("days").notNull(),
  people: integer("people").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const overtimeItems = pgTable("overtime_items", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  item: text("item").notNull(),
  days: integer("days").notNull(),
  hours: integer("hours").notNull(),
  people: integer("people").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const assistanceData = pgTable("assistance_data", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertMasterRateSchema = createInsertSchema(masterRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertSpecialAssistItemSchema = createInsertSchema(specialAssistItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertOvertimeItemSchema = createInsertSchema(overtimeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
});

const insertAssistanceDataSchema = createInsertSchema(assistanceData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

module.exports = {
  users,
  employees,
  masterRates,
  budgetItems,
  specialAssistItems,
  overtimeItems,
  holidays,
  assistanceData,
  insertUserSchema,
  insertEmployeeSchema,
  insertMasterRateSchema,
  insertBudgetItemSchema,
  insertSpecialAssistItemSchema,
  insertOvertimeItemSchema,
  insertHolidaySchema,
  insertAssistanceDataSchema,
};