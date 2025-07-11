import { VercelRequest, VercelResponse } from '@vercel/node';
import { DatabaseStorage } from './server-storage';

const storage = new DatabaseStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const employees = await storage.getEmployees();
        return res.status(200).json(employees);
      
      case 'POST':
        if (Array.isArray(req.body)) {
          // Bulk operations
          const results = [];
          for (const employeeData of req.body) {
            const result = await storage.createEmployee(employeeData);
            results.push(result);
          }
          return res.status(201).json(results);
        } else {
          // Single employee
          const employee = await storage.createEmployee(req.body);
          return res.status(201).json(employee);
        }
      
      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}