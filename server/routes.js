// JavaScript version of routes for Vercel compatibility
const { createServer } = require("http");
const { storage } = require("./storage.js");
const { insertEmployeeSchema, insertMasterRateSchema, insertBudgetItemSchema, insertOvertimeItemSchema } = require("../shared/schema.js");

// Log utility
function log(message, source = "api") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

async function registerRoutes(app) {
  // Root health check endpoint for deployment
  app.get("/", (req, res, next) => {
    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      res.json({ 
        status: "healthy", 
        message: "Budget Management System is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      next();
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Budget Management System API is running" });
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      log(`Error fetching employees: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        const employees = [];
        for (const employeeData of req.body) {
          const validatedData = insertEmployeeSchema.parse(employeeData);
          const employee = await storage.createEmployee(validatedData);
          employees.push(employee);
        }
        log(`Created ${employees.length} employees`);
        res.status(201).json(employees);
      } else {
        const validatedData = insertEmployeeSchema.parse(req.body);
        const employee = await storage.createEmployee(validatedData);
        log(`Created employee: ${employee.name}`);
        res.status(201).json(employee);
      }
    } catch (error) {
      log(`Error creating employee: ${error.message}`);
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(parseInt(req.params.id), req.body);
      log(`Updated employee ID: ${req.params.id}`);
      res.json(employee);
    } catch (error) {
      log(`Error updating employee: ${error.message}`);
      res.status(400).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      await storage.deleteEmployee(parseInt(req.params.id));
      log(`Deleted employee ID: ${req.params.id}`);
      res.status(204).send();
    } catch (error) {
      log(`Error deleting employee: ${error.message}`);
      res.status(400).json({ error: "Failed to delete employee" });
    }
  });

  // Master rates routes
  app.get("/api/master-rates", async (req, res) => {
    try {
      const rates = await storage.getMasterRates();
      res.json(rates);
    } catch (error) {
      log(`Error fetching master rates: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch master rates" });
    }
  });

  app.post("/api/master-rates", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        const rates = [];
        for (const rateData of req.body) {
          const validatedData = insertMasterRateSchema.parse(rateData);
          const rate = await storage.createMasterRate(validatedData);
          rates.push(rate);
        }
        log(`Created ${rates.length} master rates`);
        res.status(201).json(rates);
      } else {
        const validatedData = insertMasterRateSchema.parse(req.body);
        const rate = await storage.createMasterRate(validatedData);
        log(`Created master rate: ${rate.level}`);
        res.status(201).json(rate);
      }
    } catch (error) {
      log(`Error creating master rate: ${error.message}`);
      res.status(400).json({ error: "Invalid master rate data" });
    }
  });

  app.put("/api/master-rates/:id", async (req, res) => {
    try {
      const rate = await storage.updateMasterRate(parseInt(req.params.id), req.body);
      log(`Updated master rate ID: ${req.params.id}`);
      res.json(rate);
    } catch (error) {
      log(`Error updating master rate: ${error.message}`);
      res.status(400).json({ error: "Failed to update master rate" });
    }
  });

  // Budget items routes
  app.get("/api/budget-items", async (req, res) => {
    try {
      const items = await storage.getBudgetItems();
      res.json(items);
    } catch (error) {
      log(`Error fetching budget items: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch budget items" });
    }
  });

  app.post("/api/budget-items", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        const items = [];
        for (const itemData of req.body) {
          const validatedData = insertBudgetItemSchema.parse(itemData);
          const item = await storage.createBudgetItem(validatedData);
          items.push(item);
        }
        log(`Created ${items.length} budget items`);
        res.status(201).json(items);
      } else {
        const validatedData = insertBudgetItemSchema.parse(req.body);
        const item = await storage.createBudgetItem(validatedData);
        log(`Created budget item: ${item.name}`);
        res.status(201).json(item);
      }
    } catch (error) {
      log(`Error creating budget item: ${error.message}`);
      res.status(400).json({ error: "Invalid budget item data" });
    }
  });

  app.put("/api/budget-items/:id", async (req, res) => {
    try {
      const item = await storage.updateBudgetItem(parseInt(req.params.id), req.body);
      log(`Updated budget item ID: ${req.params.id}`);
      res.json(item);
    } catch (error) {
      log(`Error updating budget item: ${error.message}`);
      res.status(400).json({ error: "Failed to update budget item" });
    }
  });

  // Overtime items routes
  app.get("/api/overtime-items", async (req, res) => {
    try {
      const items = await storage.getOvertimeItems();
      res.json(items);
    } catch (error) {
      log(`Error fetching overtime items: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch overtime items" });
    }
  });

  app.post("/api/overtime-items", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        const items = [];
        for (const itemData of req.body) {
          const validatedData = insertOvertimeItemSchema.parse(itemData);
          const item = await storage.createOvertimeItem(validatedData);
          items.push(item);
        }
        log(`Created ${items.length} overtime items`);
        res.status(201).json(items);
      } else {
        const existingItems = await storage.getOvertimeItems();
        const existingItem = existingItems.find(item => item.year === req.body.year);
        
        if (existingItem) {
          const updated = await storage.updateOvertimeItem(existingItem.id, req.body);
          log(`Updated overtime item for year: ${req.body.year}`);
          res.json(updated);
        } else {
          const validatedData = insertOvertimeItemSchema.parse(req.body);
          const created = await storage.createOvertimeItem(validatedData);
          log(`Created overtime item for year: ${req.body.year}`);
          res.status(201).json(created);
        }
      }
    } catch (error) {
      log(`Error creating overtime item: ${error.message}`);
      res.status(400).json({ error: "Invalid overtime item data" });
    }
  });

  const server = createServer(app);
  return server;
}

module.exports = { registerRoutes };