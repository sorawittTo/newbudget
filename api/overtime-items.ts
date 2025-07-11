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
        const overtimeItems = await storage.getOvertimeItems();
        return res.status(200).json(overtimeItems);
      
      case 'POST':
        if (Array.isArray(req.body)) {
          // Bulk operations
          const results = [];
          for (const itemData of req.body) {
            const result = await storage.createOvertimeItem(itemData);
            results.push(result);
          }
          return res.status(201).json(results);
        } else {
          // Single item - check for upsert logic
          const existingItems = await storage.getOvertimeItems();
          const existingItem = existingItems.find(item => item.year === req.body.year);
          
          if (existingItem) {
            // Update existing
            const updated = await storage.updateOvertimeItem(existingItem.id, req.body);
            return res.status(200).json(updated);
          } else {
            // Create new
            const created = await storage.createOvertimeItem(req.body);
            return res.status(201).json(created);
          }
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