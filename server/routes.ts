import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertMasterRateSchema, insertBudgetItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
          if (empData.id) {
            // Update existing employee
            const existingEmp = await storage.getEmployee(parseInt(empData.id));
            if (existingEmp) {
              const validatedData = insertEmployeeSchema.partial().parse(empData);
              const updated = await storage.updateEmployee(existingEmp.id, validatedData);
              employees.push(updated);
            } else {
              // Create new employee
              const validatedData = insertEmployeeSchema.parse(empData);
              const created = await storage.createEmployee(validatedData);
              employees.push(created);
            }
          } else {
            // Create new employee
            const validatedData = insertEmployeeSchema.parse(empData);
            const created = await storage.createEmployee(validatedData);
            employees.push(created);
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
          if (rateData.id) {
            // Update existing rate
            const existingRates = await storage.getMasterRates();
            const found = existingRates.find(rate => rate.id === parseInt(rateData.id));
            if (found) {
              const validatedData = insertMasterRateSchema.partial().parse(rateData);
              const updated = await storage.updateMasterRate(found.id, validatedData);
              rates.push(updated);
            } else {
              // Create new rate
              const validatedData = insertMasterRateSchema.parse(rateData);
              const created = await storage.createMasterRate(validatedData);
              rates.push(created);
            }
          } else {
            // Create new rate
            const validatedData = insertMasterRateSchema.parse(rateData);
            const created = await storage.createMasterRate(validatedData);
            rates.push(created);
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
          if (itemData.id) {
            // Update existing item
            const existingItem = await storage.getBudgetItems();
            const found = existingItem.find(item => item.id === parseInt(itemData.id));
            if (found) {
              const validatedData = insertBudgetItemSchema.partial().parse(itemData);
              const updated = await storage.updateBudgetItem(found.id, validatedData);
              items.push(updated);
            } else {
              // Create new item
              const validatedData = insertBudgetItemSchema.parse(itemData);
              const created = await storage.createBudgetItem(validatedData);
              items.push(created);
            }
          } else {
            // Create new item
            const validatedData = insertBudgetItemSchema.parse(itemData);
            const created = await storage.createBudgetItem(validatedData);
            items.push(created);
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

  const httpServer = createServer(app);
  return httpServer;
}
