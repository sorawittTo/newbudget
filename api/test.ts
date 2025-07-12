import { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Test database connection
    console.log('Environment check:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NEON_DATABASE_URL exists:', !!process.env.NEON_DATABASE_URL);
    
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    console.log('Database URL available:', !!dbUrl);
    
    if (!dbUrl) {
      return res.status(500).json({
        error: 'Database URL not configured',
        env: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEON'))
      });
    }

    // Try to import and test database connection
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { neon } = await import("@neondatabase/serverless");
    
    const sql = neon(dbUrl);
    const db = drizzle(sql);
    
    // Test query
    const result = await sql`SELECT 1 as test`;
    
    return res.status(200).json({
      status: 'success',
      message: 'Database connection test passed',
      test_result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({
      error: 'Test failed',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}