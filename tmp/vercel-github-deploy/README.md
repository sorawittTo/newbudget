# Employee Management System

## Overview
Thai workplace management system with comprehensive employee data handling, travel expense tracking, and financial management.

## Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Drizzle ORM
- **Database**: Neon PostgreSQL
- **Deployment**: Vercel

## Environment Variables
```
DATABASE_URL=postgresql://neondb_owner:npg_mr5SMkcHC7IZ@ep-twilight-truth-adspew7w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Features
- Employee Management (15 employees)
- Master Rates System (7 levels)
- Travel Expense Calculations
- Special Assistance Tracking
- Overtime Management
- Excel Export Functionality

## API Endpoints
- `/api/employees` - Employee CRUD operations
- `/api/master-rates` - Rate management
- `/api/budget-items` - Budget tracking
- `/api/overtime-items` - Overtime data
- `/api/test` - Database connection test

## Deployment
1. Push to GitHub repository
2. Connect Vercel to GitHub
3. Set DATABASE_URL environment variable
4. Deploy automatically

## Local Development
```bash
npm install
npm run dev
```

Access: http://localhost:5000