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
    switch (req.method) {
      case 'GET':
        const masterRates = await db.select().from(schema.masterRates);
        return res.status(200).json(masterRates);
      
      case 'POST':
        if (Array.isArray(req.body)) {
          // Bulk operations
          const results = await db.insert(schema.masterRates).values(req.body).returning();
          return res.status(201).json(results);
        } else {
          // Single rate
          const [rate] = await db.insert(schema.masterRates).values(req.body).returning();
          return res.status(201).json(rate);
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