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
        const employees = await db.select().from(schema.employees);
        return res.status(200).json(employees);
      
      case 'POST':
        if (Array.isArray(req.body)) {
          // Bulk operations - handle upsert logic
          const results = [];
          for (const empData of req.body) {
            try {
              // Check if employee exists by employeeId
              const existing = await db.select().from(schema.employees).where(eq(schema.employees.employeeId, empData.employeeId)).limit(1);
              
              if (existing.length > 0) {
                // Update existing employee
                const [updated] = await db.update(schema.employees)
                  .set({
                    name: empData.name,
                    gender: empData.gender,
                    startYear: empData.startYear,
                    level: empData.level,
                    status: empData.status || 'มีสิทธิ์',
                    visitProvince: empData.visitProvince || '',
                    homeVisitBusFare: empData.homeVisitBusFare || '0',
                    workingDays: empData.workingDays || 1,
                    travelWorkingDays: empData.travelWorkingDays || 1,
                    customTravelRates: empData.customTravelRates || null,
                    updatedAt: new Date()
                  })
                  .where(eq(schema.employees.id, existing[0].id))
                  .returning();
                results.push(updated);
              } else {
                // Create new employee
                const [created] = await db.insert(schema.employees).values({
                  employeeId: empData.employeeId,
                  name: empData.name,
                  gender: empData.gender,
                  startYear: empData.startYear,
                  level: empData.level,
                  status: empData.status || 'มีสิทธิ์',
                  visitProvince: empData.visitProvince || '',
                  homeVisitBusFare: empData.homeVisitBusFare || '0',
                  workingDays: empData.workingDays || 1,
                  travelWorkingDays: empData.travelWorkingDays || 1,
                  customTravelRates: empData.customTravelRates || null
                }).returning();
                results.push(created);
              }
            } catch (singleError) {
              console.error(`Error processing employee ${empData.name}:`, singleError);
              // Continue with other employees
            }
          }
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: errorMessage,
      database: 'Supabase'
    });
  }
}