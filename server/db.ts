import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Supabase compatibility
neonConfig.webSocketConstructor = ws;

// Force Supabase URL - remove Neon dependency
const SUPABASE_URL = "postgresql://postgres.pytyjeugghucgeexhatr:0927895299Sorawitt@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

console.log('🚀 Connecting to Supabase database...');

export const pool = new Pool({ connectionString: SUPABASE_URL });
export const db = drizzle({ client: pool, schema });