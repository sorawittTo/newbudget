import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!);
const db = drizzle(sql, { schema });

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
    // Check database URL
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({
        error: 'Database URL not configured',
        env: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEON'))
      });
    }
    
    switch (req.method) {
      case 'GET':
        const employees = await db.select().from(schema.employees);
        return res.status(200).json(employees);
      
      case 'POST':
        if (Array.isArray(req.body)) {
          // Bulk operations
          const results = await db.insert(schema.employees).values(req.body).returning();
          return res.status(201).json(results);
        } else {
          // Single employee
          const [employee] = await db.insert(schema.employees).values(req.body).returning();
          return res.status(201).json(employee);
        }
      
      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', error?.message || error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error?.message || 'Unknown error',
      hasDB: !!process.env.DATABASE_URL || !!process.env.NEON_DATABASE_URL
    });
  }
}