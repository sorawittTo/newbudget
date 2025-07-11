import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertMasterRateSchema, insertBudgetItemSchema, insertOvertimeItemSchema } from "../shared/schema";

// Log utility
function log(message: string, source = "api") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Root health check endpoint for deployment (only for API requests)
  app.get("/", (req, res, next) => {
    // Only respond with JSON for health checks if requested via specific header or in production
    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      res.json({ 
        status: "healthy", 
        message: "Budget Management System is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      // Let other middleware handle the request (like serving static files)
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
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      // Handle both single employee and array of employees
      const data = req.body;
      if (Array.isArray(data)) {
        const employees = [];
        for (const empData of data) {
          try {
            // Check if employeeId already exists
            const allEmployees = await storage.getEmployees();
            const existing = allEmployees.find(emp => emp.employeeId === empData.employeeId);
            
            if (existing) {
              // Update existing employee
              const validatedData = insertEmployeeSchema.partial().parse(empData);
              const updated = await storage.updateEmployee(existing.id, validatedData);
              employees.push(updated);
            } else {
              // Create new employee
              const validatedData = insertEmployeeSchema.parse(empData);
              const created = await storage.createEmployee(validatedData);
              employees.push(created);
            }
          } catch (singleError) {
            console.error(`Error processing employee ${empData.name}:`, singleError);
            // Continue with other employees
          }
        }
        res.status(201).json(employees);
      } else {
        // Single employee
        const validatedData = insertEmployeeSchema.parse(data);
        const employee = await storage.createEmployee(validatedData);
        res.status(201).json(employee);
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(400).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(400).json({ error: "Failed to delete employee" });
    }
  });

  // Master Rates routes
  app.get("/api/master-rates", async (req, res) => {
    try {
      const rates = await storage.getMasterRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching master rates:", error);
      res.status(500).json({ error: "Failed to fetch master rates" });
    }
  });

  app.post("/api/master-rates", async (req, res) => {
    try {
      // Handle both single rate and array of rates
      const data = req.body;
      if (Array.isArray(data)) {
        const rates = [];
        for (const rateData of data) {
          try {
            // Check if level already exists
            const existingRates = await storage.getMasterRates();
            const existing = existingRates.find(rate => rate.level === rateData.level);
            
            if (existing) {
              // Update existing rate
              const validatedData = insertMasterRateSchema.partial().parse(rateData);
              const updated = await storage.updateMasterRate(existing.id, validatedData);
              rates.push(updated);
            } else {
              // Create new rate
              const validatedData = insertMasterRateSchema.parse(rateData);
              const created = await storage.createMasterRate(validatedData);
              rates.push(created);
            }
          } catch (singleError) {
            console.error(`Error processing rate for level ${rateData.level}:`, singleError);
            // Continue with other rates
          }
        }
        res.status(201).json(rates);
      } else {
        // Single rate
        const validatedData = insertMasterRateSchema.parse(data);
        const rate = await storage.createMasterRate(validatedData);
        res.status(201).json(rate);
      }
    } catch (error) {
      console.error("Error creating master rate:", error);
      res.status(400).json({ error: "Invalid master rate data" });
    }
  });

  app.put("/api/master-rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMasterRateSchema.partial().parse(req.body);
      const rate = await storage.updateMasterRate(id, validatedData);
      res.json(rate);
    } catch (error) {
      console.error("Error updating master rate:", error);
      res.status(400).json({ error: "Failed to update master rate" });
    }
  });

  // Budget Items routes
  app.get("/api/budget-items", async (req, res) => {
    try {
      const items = await storage.getBudgetItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      res.status(500).json({ error: "Failed to fetch budget items" });
    }
  });

  app.post("/api/budget-items", async (req, res) => {
    try {
      // Handle both single item and array of items
      const data = req.body;
      if (Array.isArray(data)) {
        const items = [];
        for (const itemData of data) {
          try {
            // Check if budget item with this account code already exists
            const existingItems = await storage.getBudgetItems();
            const existing = existingItems.find(item => item.accountCode === itemData.accountCode || (!itemData.accountCode && item.code === itemData.code));
            
            if (existing) {
              // Update existing item
              const validatedData = insertBudgetItemSchema.partial().parse(itemData);
              const updated = await storage.updateBudgetItem(existing.id, validatedData);
              items.push(updated);
            } else {
              // Create new item
              const validatedData = insertBudgetItemSchema.parse(itemData);
              const created = await storage.createBudgetItem(validatedData);
              items.push(created);
            }
          } catch (singleError) {
            console.error(`Error processing budget item ${itemData.code}:`, singleError);
            // Continue with other items
          }
        }
        res.status(201).json(items);
      } else {
        // Single item
        const validatedData = insertBudgetItemSchema.parse(data);
        const item = await storage.createBudgetItem(validatedData);
        res.status(201).json(item);
      }
    } catch (error) {
      console.error("Error creating budget item:", error);
      res.status(400).json({ error: "Invalid budget item data" });
    }
  });

  app.put("/api/budget-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBudgetItemSchema.partial().parse(req.body);
      const item = await storage.updateBudgetItem(id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating budget item:", error);
      res.status(400).json({ error: "Failed to update budget item" });
    }
  });

  // Overtime Items routes
  app.get("/api/overtime-items", async (req, res) => {
    try {
      const items = await storage.getOvertimeItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching overtime items:", error);
      res.status(500).json({ error: "Failed to fetch overtime items" });
    }
  });

  app.post("/api/overtime-items", async (req, res) => {
    try {
      const data = req.body;
      if (Array.isArray(data)) {
        const items = [];
        for (const itemData of data) {
          try {
            // Check if overtime item for this year already exists
            const existingItems = await storage.getOvertimeItems();
            const existing = existingItems.find(item => item.year === itemData.year);
            
            if (existing) {
              // Update existing item
              const validatedData = insertOvertimeItemSchema.partial().parse(itemData);
              const updated = await storage.updateOvertimeItem(existing.id, validatedData);
              items.push(updated);
            } else {
              // Create new item
              const validatedData = insertOvertimeItemSchema.parse(itemData);
              const created = await storage.createOvertimeItem(validatedData);
              items.push(created);
            }
          } catch (singleError) {
            console.error(`Error processing overtime item:`, singleError);
          }
        }
        res.status(201).json(items);
      } else {
        // Check if overtime item for this year already exists
        const existingItems = await storage.getOvertimeItems();
        const existing = existingItems.find(item => item.year === data.year);
        
        if (existing) {
          // Update existing item
          const validatedData = insertOvertimeItemSchema.partial().parse(data);
          const updated = await storage.updateOvertimeItem(existing.id, validatedData);
          res.json(updated);
        } else {
          // Create new item
          const validatedData = insertOvertimeItemSchema.parse(data);
          const created = await storage.createOvertimeItem(validatedData);
          res.status(201).json(created);
        }
      }
    } catch (error) {
      console.error("Error creating/updating overtime item:", error);
      res.status(400).json({ error: "Invalid overtime item data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
