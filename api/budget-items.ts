import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
import ws from 'ws';

// Configure WebSocket for Supabase compatibility
neonConfig.webSocketConstructor = ws;

// Force Supabase URL for Vercel
const SUPABASE_URL = "postgresql://postgres.pytyjeugghucgeexhatr:0927895299Sorawitt@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString: SUPABASE_URL });
const db = drizzle({ client: pool, schema });

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
    // Using Supabase directly
    
    switch (req.method) {
      case 'GET':
        const budgetItems = await db.select().from(schema.budgetItems);
        return res.status(200).json(budgetItems);
      
      case 'POST':
        if (Array.isArray(req.body)) {
          // Bulk operations
          const results = await db.insert(schema.budgetItems).values(req.body).returning();
          return res.status(201).json(results);
        } else {
          // Single item
          const [item] = await db.insert(schema.budgetItems).values(req.body).returning();
          return res.status(201).json(item);
        }
      
      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: errorMessage 
    });
  }
}