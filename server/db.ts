import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

let pool: Pool | null;
let db: any;

if (!DATABASE_URL || DATABASE_URL === 'your_neon_postgresql_url_here') {
  console.warn('Warning: No valid database URL found. Using mock database connection.');
  // Create a mock pool that will fail gracefully
  pool = null;
  db = null;
} else {
  try {
    pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle({ client: pool, schema });
  } catch (error) {
    console.warn('Warning: Failed to connect to database. Using mock database connection.');
    pool = null;
    db = null;
  }
}

export { pool, db };