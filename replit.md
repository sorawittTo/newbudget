# Budget Management System

## Overview

This is a comprehensive budget management system built for organizational expense tracking and employee cost calculations. The system features a modern React frontend with TypeScript, Express.js backend, and PostgreSQL database with Drizzle ORM. It specializes in Thai government budget management with features for employee travel expenses, special assistance calculations, overtime tracking, and comprehensive budget planning.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with custom storage management
- **Animations**: Framer Motion for smooth transitions and interactions
- **Data Fetching**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: Hot module replacement with Vite integration

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Located in `shared/schema.ts` for type sharing between frontend and backend
- **Migrations**: Managed through Drizzle Kit with PostgreSQL dialect
- **Current Schema**: Basic user table with plans for budget-related tables

## Key Components

### Modern Layout System
- **AppLayout**: Professional sidebar navigation with collapsible design
- **ModernDashboard**: Advanced analytics dashboard with interactive charts and metrics
- **DataTable**: Sophisticated table component with search, filtering, sorting, and pagination
- **FormBuilder**: Dynamic form generation with validation and array field support

### Budget Management
- **ModernBudgetTable**: Advanced budget table with real-time calculations and visual analytics
- **BudgetTable**: Enhanced interactive table for budget item management with inline editing
- **BudgetReport**: Comprehensive reporting with filtering and sorting capabilities
- **Multi-year Planning**: Support for budget comparison across multiple years (2568-2580 BE)

### Employee Management
- **EmployeeManagement**: Complete CRUD operations for employee data
- **MasterRates**: Configurable rate tables for different employee levels
- **Excel Integration**: Import/export functionality for employee data

### Travel Expense Calculations
- **TravelExpenseManager**: Centralized travel expense management
- **Multiple Travel Types**: Support for regular travel, family visits, company trips, and manager rotations
- **Service Year Calculations**: Automatic eligibility based on years of service

### Special Assistance & Overtime
- **SpecialAssistanceManager**: Handles various assistance programs
- **OvertimeCalculationTable**: Comprehensive overtime tracking with holiday considerations
- **WorkdayManager**: Holiday management and working day calculations

### Data Management
- **StorageManager**: Local storage abstraction with versioning
- **BackupManager**: Data export/import functionality
- **DataValidator**: Data integrity checking and validation

## Data Flow

### Client-Side Data Flow
1. **Initial Load**: Data loaded from localStorage with fallback to defaults
2. **State Management**: React hooks manage application state
3. **Calculations**: Real-time calculations for travel, assistance, and overtime
4. **Persistence**: Automatic saving to localStorage with manual save triggers

### Server-Side Data Flow
1. **API Routes**: RESTful endpoints for CRUD operations
2. **Database Operations**: Drizzle ORM handles all database interactions
3. **Session Management**: User sessions stored in PostgreSQL
4. **Error Handling**: Centralized error handling with proper HTTP status codes

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth interactions
- **Lucide React**: Icon library

### Data Processing
- **XLSX**: Excel file processing for import/export functionality
- **date-fns**: Date manipulation and formatting
- **Zod**: Schema validation for type safety

### Development Tools
- **Vite**: Fast build tool with HMR
- **ESBuild**: Fast JavaScript bundler
- **Drizzle Kit**: Database migration and schema management
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Both frontend and backend support hot reloading
- **Environment Variables**: DATABASE_URL required for database connection

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code into single file
- **Database**: Drizzle migrations handle schema updates
- **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string
- **Replit Integration**: Special handling for Replit deployment environment

## Changelog

```
Changelog:
- July 07, 2025. Advanced Budget Table Redesign and Customization
  * Created NeumorphismBudgetTable with clean, soothing UI design using slate, blue, emerald color tones
  * Changed title from "ตารางงบประมาณขั้นสูง" to "ตารางงบประมาณ" per user request
  * Replaced DollarSign icon with Banknote icon (Thai Baht symbol) throughout the budget interface
  * Removed "เงินช่วยเหลืออื่นๆ" (Other assistance funds) budget item from table
  * Added category header rows with visual distinction (main headers in blue, sub headers in gray)
  * Implemented category totals display showing sum for each budget category in both years
  * Enhanced filtering system to show relevant headers when filtering by category
  * Added gradient backgrounds, backdrop blur effects, and neumorphism shadows for modern appearance
  * Maintained global edit mode functionality and comprehensive budget analytics
- July 07, 2025. Complete Neumorphism Design Implementation - System-wide redesign
  * Completed comprehensive neumorphism conversion for all components
  * Created ModernTravelCalculationTable with advanced neumorphism styling and global edit mode
  * Updated SpecialAssistanceManager with full neumorphism design and NeumorphismInput components
  * Created ModernWorkdayManager with advanced neumorphism styling and modern interface
  * Converted all input elements throughout the system to use NeumorphismInput and NeumorphismSelect
  * Updated all main components to use consistent neumorphism design patterns
  * Enhanced UI with professional shadow effects, inset elements, and smooth transitions
  * Integrated comprehensive statistics and metrics dashboard across all modules
  * Added advanced edit functionality with intuitive user interactions
  * Implemented consistent design language with soft shadows and rounded corners
- July 07, 2025. Neumorphism Design Implementation - System-wide button conversion
  * Updated all buttons to use neumorphism design with soft shadows and inset effects
  * Converted Button.tsx to use neumorphism styling with proper hover and active states
  * Updated TabNavigation.tsx with neumorphism tab buttons and container styling
  * Updated AppLayout.tsx with neumorphism navigation buttons and search bar
  * Updated gender and status buttons in EmployeeManagement and EmployeeTable
  * Created NeumorphismInput.tsx and NeumorphismSelect.tsx components
  * Enhanced UI with smooth transitions and professional shadow effects
- July 07, 2025. Major System Upgrade - Implemented modern UI/UX architecture
  * Complete redesign with AppLayout and ModernDashboard components
  * Advanced DataTable and FormBuilder components with sophisticated features
  * Enhanced budget management with real-time calculations and visual analytics
  * Implemented responsive design with Framer Motion animations
  * Added comprehensive metrics and filtering capabilities
  * Modern navigation with collapsible sidebar and theme switching
  * Professional error handling and user feedback systems
- July 07, 2025. Initial setup and migration from Bolt to Replit
```

## User Preferences

Preferred communication style: Simple, everyday language.