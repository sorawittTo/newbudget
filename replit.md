# Budget Management System

## Overview

This is a comprehensive employee management system built for organizational expense tracking and employee cost calculations. The system features a modern React frontend with TypeScript, Express.js backend, and PostgreSQL database with Drizzle ORM. It specializes in Thai government employee management with features for employee travel expenses, special assistance calculations, overtime tracking, and comprehensive employee administration.

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
- July 09, 2025. Fixed Critical UnifiedSpecialAssistanceManager Syntax Error
  * Fixed major syntax error in UnifiedSpecialAssistanceManager.tsx causing application crash
  * Completely rebuilt component with proper structure to eliminate duplicate return statements
  * Maintained all existing functionality including total calculation and debugging features
  * Application now runs successfully with proper frontend-backend communication
  * Special assistance total calculation system remains intact with console logging
- July 09, 2025. Added Special Assistance Total Summary
  * Added total amount summary footer to special assistance tab (เงินช่วยเหลือพิเศษ)
  * Shows calculated total from all special assistance items: timesPerYear × days × people × rate
  * Displays prominently with blue color scheme to match tab theme
  * Provides clear total amount visibility for special assistance calculations
- July 09, 2025. Fixed Dashboard Travel Calculation Accuracy
  * Fixed family visit calculation in Dashboard to match table filtering (only มีสิทธิ์ employees)
  * Fixed company trip calculation to use correct destination and bus fare parameters
  * Dashboard now shows accurate travel expense totals matching actual table calculations
  * Travel expense calculations now properly filter eligible employees in both Dashboard and tables
- July 09, 2025. Completely Separated Working Days Fields for Travel and Manager Rotation
  * Added separate travelWorkingDays field for travel expense table (souvenir collection)
  * Travel expense table uses travelWorkingDays: hotel nights = travelWorkingDays + 1, per diem days = travelWorkingDays + 2
  * Manager rotation table uses workingDays: hotel nights = workingDays + 1, per diem days = workingDays + 2
  * Both tables now operate completely independently with separate database fields
  * User can edit working days in both tables without affecting each other
  * Addresses critical requirement: travel and manager rotation tables must not be connected
- July 09, 2025. Removed Fixed Bus Cost from Manager Rotation Table
  * Removed default bus cost (600 baht) from manager rotation calculation
  * Total now calculated without fixed vehicle cost: perDiemCost + accommodationCost + travelCost + localCost + otherVehicleCost
  * Updated both ModernManagerRotationCalculationTable and utils/calculations.ts
  * System now uses only standard rates from master rates table plus editable other vehicle costs
- July 09, 2025. Fixed Manager Rotation Table Calculation System
  * Fixed critical bug where table was using rotationSettings instead of workingDays-based calculation
  * Corrected hotel nights = working days + 1 (dynamic calculation based on each employee's working days)
  * Corrected per diem days = working days + 2 (dynamic calculation based on each employee's working days)
  * Changed "ค่าเดินทาง" to "ค่าพาหนะประจำทาง ศนร.-กทม. ไปกลับ"
  * Changed "ค่ารถรับจ้าง" to "ค่าพาหนะรับจ้าง ขนส่ง-ที่พัก ไป-กลับ"
  * Now correctly uses rates from master rates table for travel and local transport
  * Fixed text "x{emp.hotelNight} วัน" to "x{emp.hotelNight} คืน" for hotel nights
  * Table now properly calculates based on individual employee working days rather than fixed settings
- July 09, 2025. Set Default Destination for Company Trip to Khon Kaen
  * Changed default destination from empty string to 'ขอนแก่น' in ModernCompanyTripCalculationTable
  * Trip settings now initialize with Khon Kaen as default destination
  * Improves user experience by providing meaningful default value
- July 09, 2025. Level-Based Sorting in Family Visit Travel Table
  * Added employee sorting by level in descending order (7→6→5.5→5→4.5→4→3)
  * Within same level, employees sorted alphabetically by name
  * Applied to ModernFamilyVisitCalculationTable for consistent hierarchy display
  * Family visit travel table now shows employees in level-based order matching other calculation tables
- July 09, 2025. Dynamic Hotel and Per Diem Calculation Based on Working Days
  * Changed from fixed values (2 hotel nights, 3 per diem days) to dynamic calculation
  * Hotel nights = working days + 1 (for overnight stay)
  * Per diem days = working days + 2 (arrival + working days + departure)
  * When working days increase by 1, both hotel nights and per diem days increase by 1
  * Applied to both ModernTravelCalculationTable and utils/calculations.ts
  * Travel expense calculations now accurately reflect actual working day requirements
- July 09, 2025. Removed Footer and Added Level-Based Sorting in Travel Expense Table
  * Removed Summary Card footer from travel expense table (ModernTravelCalculationTable)
  * Added employee sorting by level in descending order (7→6→5.5→5→4.5→4→3)
  * Within same level, employees sorted alphabetically by name
  * Table now displays employees in consistent level-based hierarchy
  * Simplified table display without summary statistics footer
- July 09, 2025. Updated Travel Expense Table Headers and Removed Trip Calculation Logic
  * Changed "ค่ารถโดยสาร/เที่ยว" to "ค่าพาหนะประจำทาง ศนร.-กทม. ไปกลับ"
  * Changed "ค่ารถรับจ้าง/เที่ยว" to "ค่าพาหนะรับจ้าง ขนส่ง-ที่พัก ไป-กลับ"
  * Removed automatic x2 multiplication for round-trip calculations
  * Now uses direct values from master rates table without additional calculations
  * Updated detail descriptions to match master rates table terminology
  * Travel expense calculations now reflect actual standard rates directly
- July 09, 2025. Updated Master Rates Table Headers with Transport Details
  * Added line break and details to "ค่าพาหนะประจำทาง" header: "ศนร.-กทม. ไปกลับ"
  * Added line break and details to "ค่าพาหนะรับจ้าง" header: "ขนส่ง-ที่พัก ไป-กลับ"
  * Master rates table now shows more specific transport information for clarity
  * Headers now provide context about transport routes and coverage
- July 09, 2025. Removed Souvenir Allowance Column from Travel Expense Table
  * Removed "ค่าซื้อของเหมาจ่าย" column from travel expense calculation table
  * Updated calculateTravelEmployees function to exclude souvenirAllowance from total calculation
  * Updated TravelEmployee interface to remove souvenirAllowance field
  * Updated ModernTravelCalculationTable to remove souvenirAllowance column display
  * Travel expense calculations now only include: hotel, per diem, travel, and local transportation
- July 09, 2025. Updated Field Names - Changed "ค่ารถทัวร์" to "ค่ารถเยี่ยมบ้าน" Throughout System
  * Updated field display names in EmployeeManagement.tsx table header
  * Updated field names in EmployeeTable.tsx component 
  * Updated Excel export headers in excel.ts utility functions
  * Updated ModernFamilyVisitCalculationTable.tsx column header
  * All UI components now consistently use "ค่ารถเยี่ยมบ้าน" instead of "ค่ารถทัวร์"
  * Database field name remains home_visit_bus_fare (unchanged for data consistency)
- July 09, 2025. Employee Database Update - Updated All Employee Records with Real Data
  * Updated all 15 employee records with authentic data from user-provided file
  * Changed employee IDs from sequential format (42540xxx) to actual IDs (62539086, 52531175, etc.)
  * Updated personal information: gender changes (อุณารักษ์, สมควร from ชาย to หญิง)
  * Updated start years: พีรนุช (2540→2531), อุณารักษ์ (2541→2538), สมควร (2542→2538), etc.
  * Updated visit provinces: พัทธดนย์ (ขอนแก่น→พิษณุโลก), วิชาญ (ขอนแก่น→เชียงใหม่)
  * Updated bus fares: พัทธดนย์ (0→1200), วิชาญ (0→1200), สรวิชญ์ (0→600), etc.
  * Updated status: Inactive employees now marked as 'หมดสิทธิ์' (อุณารักษ์, สมควร, สรวิชญ์, สงวน, คมสันติ, พิชิต)
  * Employee sorting maintained: level 7→6→5.5→5→4.5→3 with alphabetical sub-sorting
  * Database now contains accurate employee information matching organizational records
- July 09, 2025. Travel and Manager Rotation Tables Decoupled - Removed Shared Dependencies
  * Removed workingDays dependency between travel (souvenir collection) and manager rotation tables
  * ModernTravelCalculationTable now uses fixed values: 2 hotel nights, 3 per diem days
  * ModernManagerRotationCalculationTable uses independent rotation settings parameters
  * Updated calculateManagerRotation function to accept configurable parameters instead of workingDays
  * Each table now operates independently with its own calculation logic
  * Addresses user requirement: "ตารางช้อมูลค่าเดินทางรับของที่ระลึกและตารางข้อมูลหน้าเดินทางหมุนเวียน ผจศ. ไม่มีส่วนเกี่ยวข้องกัน ให้ลบการเชื่อมต่อ"
- July 09, 2025. Employee Sorting by Level - Reorganized Database Order
  * Reorganized all employee records to sort by level (highest to lowest): 7 → 6 → 5.5
  * Updated employee IDs to start from 1 and maintain level-based ordering
  * Repositioned พิชิต แจ่มศรี to ID 2 (level 7) from previous bottom position
  * Within same level, employees sorted alphabetically by name
  * All employee-related displays now show level-based hierarchy
  * Database sequence reset to 16 for new employee additions
- July 09, 2025. Fixed Company Trip Calculation System - Unified Functions and Enhanced Editing
  * Unified calculateCompanyTrip function to use consistent parameters (destination, busFare)
  * Fixed accommodation cost editing - now properly saves to customTravelRates.hotel
  * Enhanced editing system with proper onBlur save functionality
  * Removed duplicate calculation logic - now uses single calculateCompanyTrip function
  * Fixed accommodation editing to work with individual employee records
  * Removed year multiplier system - now uses simple calculation: busFare × 2
- July 09, 2025. Removed Service Year Bonus from Family Visit Calculations
  * Removed multiplier calculation based on service years (20+ years: 1.1x, 30+ years: 1.2x)
  * Simplified family visit calculation to: 4 × roundTripFare (no bonus)
  * Updated calculateFamilyVisit function to use straightforward calculation
  * Example: 2,400 baht × 4 = 9,600 baht (instead of 11,520 with 20% bonus)
  * System now uses consistent calculation without age-based bonuses
- July 09, 2025. Added Cache Control System to Prevent Browser Caching Issues
  * Added comprehensive cache control meta tags to client/index.html
  * Implemented server-side cache control headers for API responses and static assets
  * Created Service Worker (sw.js) for aggressive cache management
  * Added cache-busting headers to prevent stale content on different machines
  * System now forces fresh content loading without requiring redeployment
  * Addresses user reported issue: "ถ้าไม่redeploy หน้าเว็บไม่ยอมเปลี่ยนเมื่อเข้าจากเครื่องอื่น"
- July 09, 2025. Added Year Selection to Dashboard Display
  * Added year selector (2568-2580) to Dashboard header section
  * Integrated year selection with currentYear state management
  * Updated ModernDashboard to receive onYearChange prop
  * All expense calculations now update dynamically based on selected year
  * Dashboard displays accurate year-based data for travel, assistance, and overtime expenses
- July 09, 2025. Fixed Travel Expense Calculation Accuracy for Year-Based Data Display  
  * Corrected Dashboard travel expense calculations to use proper employee filtering criteria
  * Fixed calculateCompanyTrip function to use simplified logic matching table components
  * Updated calculateManagerRotation to use working days-based calculations
  * Enhanced family visit calculations to filter eligible employees (non-local, non-Khon Kaen, with permission)
  * All travel expense types now display accurate totals in Dashboard matching actual table data
  * Verified souvenir collection travel expenses: 12,100 baht (2568), 18,900 baht (2569)
  * System now properly updates all travel calculation tables when year selection changes
- July 09, 2025. Fixed Dashboard Assistance and Overtime Display Names
  * Updated assistance section to show "เงินช่วยเหลือพิเศษ" instead of "ช่วยเหลือพิเศษ"
  * Changed "โครงการอื่นๆ" to "เงินช่วยเหลืออื่นๆ"
  * Simplified overtime section to show only "ค่าล่วงเวลาวันหยุด" instead of splitting into regular/special
  * Removed duplicate overtime breakdown (ล่วงเวลาปกติ/ล่วงเวลาพิเศษ)
  * Dashboard now displays exactly three assistance categories as requested
- July 09, 2025. Removed Numbers from Assistance Navigation Tabs
  * Completely removed employee and item count numbers from assistance navigation tabs per user request  
  * Removed count property from tabs array in UnifiedSpecialAssistanceManager.tsx
  * Removed count display element from tab button rendering
  * Assistance navigation now has clean, minimal design without any numerical indicators
  * All three assistance tabs (เงินช่วยเหลืออื่นๆ, เงินช่วยเหลือพิเศษ, ค่าล่วงเวลาวันหยุด) now show only icon and label
- July 09, 2025. Fixed Travel Expense Display Names in Dashboard
  * Updated travel expense item names in Dashboard to match user requirements exactly
  * Changed "เดินทางปกติ" to "เดินทางรับของที่ระลึก" 
  * Changed "เยี่ยมครอบครัว" to "เดินทางเยี่ยมครอบครัว"
  * Changed "เดินทางบริษัท" to "เดินทางร่วมงานวันพนักงาน"
  * Changed "หมุนเวียน ผจศ" to "เดินทางหมุนเวียน ผจศ."
  * Dashboard now shows all four travel expense types with correct naming convention
- July 09, 2025. Removed Numbers from Travel Navigation Tabs
  * Completely removed employee count numbers from travel navigation tabs per user request
  * Removed calculation logic for eligible employee counts in each travel type
  * Simplified tab display to show only icon and label without numerical indicators
  * Travel navigation now has clean, minimal design without any count displays
  * Updated TravelExpenseManager.tsx to eliminate all count-related code
- July 09, 2025. Fixed Travel Tab Number Display Issue
  * Fixed incorrect number display in travel expense navigation tabs
  * Updated calculation logic to show accurate eligible employee counts for each travel type
  * Family visit tab now shows only eligible employees (not local, not Khon Kaen, has permission)
  * Manager rotation tab now shows only level 7 employees who are selected
  * All travel navigation tabs now display correct employee counts based on selection and eligibility criteria
  * Enhanced user experience with accurate information display in travel expense management
- July 08, 2025. Fixed Edit Mode Bypass Issue in Employee Management
  * Fixed critical issue where employee data could be edited without clicking Edit button first
  * Added disabled={!globalEditMode} to ALL input fields in EmployeeManagement.tsx
  * Applied edit mode control to buttons (gender, status) and input fields (name, ID, year, province, busFare)
  * Fixed NeumorphismSelect dropdown to respect edit mode state
  * Removed all dropdown icons and browser arrows per user request
  * System now properly enforces Edit button requirement before allowing any data modifications
  * All employee data editing now requires explicit Edit button click as intended
- July 08, 2025. Complete Arrow Controls Removal from Employee Table
  * Fixed remaining arrow controls in EmployeeTable.tsx for startYear and homeVisitBusFare fields  
  * Added global CSS in index.css to force remove all browser arrows with !important
  * Applied appearance: none to all select elements with NO dropdown icon
  * Added browser-specific CSS to remove dropdown arrows: ::-webkit-dropdown-arrow, ::-moz-dropdown-arrow, ::-ms-expand
  * Removed all dropdown icons including custom chevron-down per user request
  * Added inputMode="numeric" and pattern="[0-9]*" for numeric fields
  * Applied CSS styles to hide spinners: MozAppearance: 'textfield', WebkitAppearance: 'none'
  * Added onWheel preventDefault to prevent accidental value changes
  * All input fields and dropdowns now completely free of arrow controls and icons as requested
- July 08, 2025. Complete Removal of Default Employee Data - Database Only System
  * Removed all defaultEmployees references from useBudgetData.ts hook
  * Deleted defaultEmployees export from defaults.ts file
  * Eliminated fallback to default employee data in error handling
  * System now uses database as exclusive source of employee data
  * Fixed employee table display issues by removing conflicting default data
  * All employee data now loaded purely from Neon PostgreSQL database
- July 08, 2025. Final Arrow Controls Removal from Master Rates Table
  * Fixed remaining arrow controls in EmployeeManagement.tsx renderEditableCell function
  * Changed type from "number" to "text" for all master rates input fields
  * Eliminated final remaining arrow controls from level selection interface
  * System now completely free of arrow-style editing controls as requested
  * All numeric inputs throughout system now use text type only
- July 08, 2025. Remove Unused ModernOvertimeCalculationTable Component
  * Deleted ModernOvertimeCalculationTable.tsx - unused component that was not imported anywhere
  * System now uses only UnifiedSpecialAssistanceManager for overtime calculations
  * Cleaned up codebase by removing redundant overtime calculation component
  * Removed holiday information footer from UnifiedSpecialAssistanceManager overtime tab
- July 08, 2025. Auto-Update Overtime Rates When Salary Changes
  * Enhanced overtime calculation system to automatically recalculate all item rates when salary changes
  * When salary is modified, all overtime items using default rate (salary ÷ 210) are updated automatically
  * Prevents manual recalculation errors and ensures consistency across all overtime items
  * Applied to UnifiedSpecialAssistanceManager overtime calculation section
  * Maintains custom rates that users have manually set while updating default rates
- July 08, 2025. Complete Travel Expense Tables UI Standardization
  * Updated all 4 travel expense tables to match system's consistent UI design
  * Standardized headers across all tables: bg-gray-100 with gray-700 text
  * Converted table containers from fancy neumorphism to standard Card components
  * Updated all table rows to use standard styling: border-gray-200 with hover:bg-gray-50
  * Simplified input fields to use standard border styling instead of complex shadows
  * Standardized table footers to use gray-100 background with gray-700 text
  * Updated all travel tables: Main Travel, Family Visit, Company Trip, Manager Rotation
  * Maintained clear data presentation while following consistent system UI patterns
- July 08, 2025. Complete Removal of Arrow-Style Editing Controls
  * Removed ALL number input types (type="number") from entire system - replaced with text inputs
  * Removed ALL step attributes from input fields throughout the system
  * Updated NeumorphismInput component to force text type for all numeric inputs
  * Eliminated all up/down arrow controls that users explicitly don't want
  * All numeric inputs now use text type with proper validation to prevent arrow controls
  * System now has zero arrow-style editing interfaces anywhere
- July 08, 2025. Button Standardization Complete
  * Removed Import and Reset buttons from Employee Management component
  * All pages now have ONLY Edit, Save, and Export buttons as requested
  * Updated component interfaces to remove unused onImport and onReset functions
  * Cleaned up unused import statements and function definitions
  * System now has consistent button layout: Edit, Save, Export Excel across all components
- July 08, 2025. HTML Export Function Removal
  * Completely removed handleExportHtml function from App.tsx
  * Removed all HTML export functionality and template generation
  * Eliminated budget-related export templates and references
  * System now has no HTML export capabilities - focuses purely on Excel export for employees
- July 08, 2025. Complete Budget Functionality Removal
  * Completely removed all budget-related functionality from the system
  * Removed budgetData variable and all budget-related imports from App.tsx
  * Cleaned up useBudgetData hook to remove budget functions (updateBudgetItem, updateBudgetNotes, updateBudgetField)
  * Fixed HTML export function to remove budget table references
  * Updated export filename from budget-export.html to employee-export.html
  * System now operates purely as employee management system without any budget features
  * All budget menu items and navigation completely removed
- July 08, 2025. Production Deployment Issues Fixed
  * Fixed server startup logic to properly listen on port 5000 in both development and production
  * Removed Vercel-specific globalThis.app assignment that prevented server startup
  * Added proper health check endpoints: /, /health, and /api/health for deployment monitoring
  * Fixed handleExportBudget function error that was causing JavaScript runtime errors
  * Added budgetData to App.tsx destructuring to resolve undefined variable issues
  * Server now starts correctly with proper port binding using process.env.PORT || 5000
  * Health check endpoints return JSON responses for deployment validation
  * All deployment issues resolved - application ready for production deployment
- July 08, 2025. System Restructured to Remove All Budget Functionality
  * Completely removed budget menu and navigation from AppLayout
  * Removed budget tab handling from App.tsx and associated imports
  * Restructured ModernDashboard to focus on employee management instead of budget
  * Converted dashboard metrics to show employee statistics (total, eligible, ineligible)
  * Replaced budget trend charts with employee level statistics
  * Updated quick actions to remove budget management, added employee and travel management
  * Changed dashboard title from "budget overview" to "employee management system"
  * System now operates as pure employee management system without budget features
- July 08, 2025. Account Code Display System Implemented Successfully (REMOVED)
  * Successfully implemented account code (รหัสบัญชี) display in budget table
  * Added account_code field to budget_items database table with proper format (5XXX-XXXX)
  * Fixed data transformation in useBudgetData.ts to properly handle accountCode from API
  * Enhanced NeumorphismBudgetTable to display account codes in emerald-colored column
  * Added comprehensive budget data with 37 items including main_header, header, and budget items
  * Account codes now display correctly: 5202-1100, 5301-0200, 5304-0100, AS-10, etc.
  * System now uses account codes as primary reference for budget item identification
- July 08, 2025. Server Deployment Issues Fixed
  * Fixed server binding to properly listen on 0.0.0.0:5000 in development mode
  * Added health check endpoints at "/" and "/health" for deployment monitoring
  * Updated server startup logic to use proper environment variable detection
  * Added graceful shutdown handling for SIGINT and SIGTERM signals
  * Fixed port binding issues causing "address already in use" errors
  * Server now runs consistently in development mode without conflicts
- July 08, 2025. Database Update System Fixed
  * Fixed database update issues - data now properly saves to Neon PostgreSQL
  * Enhanced saveAllData function with proper error handling and success feedback
  * Added toast notifications to show save operation results
  * Improved API routes for budget items, employees, and master rates
  * Fixed server restart issues and port conflicts
  * System now fully operational with real-time database updates
- July 07, 2025. Vercel Deployment Fix
  * Fixed TypeScript configuration for Vercel compatibility
  * Updated tsconfig.json to use "moduleResolution": "node" instead of "bundler"
  * Upgraded drizzle-orm to version 0.44.2 to resolve dependency conflicts
  * Created tsconfig.vercel.json for production builds
  * Simplified build.js for frontend-only building (backend handled by Vercel)
  * Updated vercel.json with proper serverless function configuration
  * Created api/index.ts as Vercel serverless function entry point
  * Modified server/index.ts to export app for Vercel while maintaining dev server
  * Added comprehensive README.md with deployment instructions
  * Fixed TypeScript errors related to module resolution and imports
- July 07, 2025. Code Cleanup and localStorage Removal
  * Removed all localStorage-related files: storage.ts, dataMigration.ts, BackupManager.tsx
  * Cleaned up imports and function calls related to localStorage
  * Removed migration and localStorage clear functions from App.tsx
  * Removed backup management buttons from ModernDashboard
  * System now operates purely on PostgreSQL database with no localStorage dependencies
  * Code is cleaner and more maintainable with reduced complexity
- July 07, 2025. Vercel Deployment Configuration
  * Created vercel.json configuration for Node.js serverless functions
  * Added build script and deployment configuration
  * Set up .vercelignore to exclude unnecessary files
  * Created comprehensive README.md with deployment instructions
  * Prepared system for production deployment on Vercel platform
- July 07, 2025. Database Integration with Neon PostgreSQL
  * Migrated from localStorage to Neon PostgreSQL database for persistent data storage
  * Created comprehensive database schema with 8 tables: users, employees, masterRates, budgetItems, specialAssistItems, overtimeItems, holidays, assistanceData
  * Implemented full CRUD API endpoints for employees, master rates, and budget items
  * Updated storage layer to use Drizzle ORM with type-safe database operations
  * All database tables created and ready for production use
- July 07, 2025. Complete System Unification with Modern Components
  * Updated Thai banking holidays for 2568 (2025 CE) with official Bank of Thailand data
  * Created ModernWorkdayManager with advanced neumorphism design and holiday management
  * Updated SpecialAssistanceManager to use ModernSpecialAssistCalculationTable for consistent UI
  * Integrated all modern components into the system for unified design language
  * Added special 2568 year indicator for official banking holidays compliance
  * Enhanced workday statistics with banking holidays categorization
  * Streamlined assistance tab UI with consolidated edit controls
- July 07, 2025. Manager Rotation Tab Modernization with Advanced UI
  * Created ModernManagerRotationCalculationTable with neumorphism design matching other travel tabs
  * Added comprehensive settings panel for destination, per diem days, hotel nights, and transportation costs
  * Implemented statistics cards showing manager count, eligible level 7 employees, per diem days, and total amount
  * Added global edit mode functionality for real-time editing of all calculation fields
  * Included detailed breakdown of travel costs (bus, flight, taxi) with configurable rates
  * Enhanced UI with gradient backgrounds, shadow effects, and smooth transitions
  * Maintained automatic filtering for level 7 employees only (managers eligible for rotation)
- July 07, 2025. Company Trip Tab Complete Modernization
  * Created ModernCompanyTripCalculationTable with advanced neumorphism design
  * Added destination input and bus fare configuration in header settings panel
  * Implemented accommodation eligibility logic based on employee home province vs destination
  * Level 7 employees get single rooms, others share rooms by gender (cost divided by 2)
  * Bus fare calculated as input × 2 for round trip travel
  * Added comprehensive statistics showing total employees, eligible/ineligible counts, and total costs
  * Integrated global edit mode for all fields with neumorphism input styling
- July 07, 2025. Family Visit Travel Tab Simplification
  * Removed filtering criteria information panel from ModernFamilyVisitCalculationTable
  * Simplified employee filtering to show only employees with status "มีสิทธิ์" (eligible)
  * Updated statistics cards to show: total employees, eligible employees, total amount, and ineligible count
  * Removed complex filtering conditions (local employees, Khon Kaen location, province requirements)
  * Streamlined interface to focus on eligible employees only
  * Maintained modern neumorphism design and global edit functionality
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

**CRITICAL UI/UX Preferences:**
- DO NOT modify existing UI designs without explicit user instruction
- Master rates table should maintain its existing neumorphism design
- Only make changes when specifically requested by the user
- System requires Edit button to be clicked before data can be modified
- All sections must have exactly three buttons: Edit, Save, and Export
- CRITICAL: Cannot edit fields that reference standard rates table across all pages in the system
- Fields from master rates (hotel, per diem, travel rates, local transport) are read-only in all calculation tables

**CRITICAL Analysis Requirements:**
- Always analyze thoroughly before making changes: "วิเคราะห์ให้ละเอียดก่อนทำ"
- Test all cases including edge cases with real data from database
- Analyze all related components and algorithms comprehensively
- Never make assumptions - verify with actual testing and evidence
- Document step-by-step analysis and testing results before implementing changes