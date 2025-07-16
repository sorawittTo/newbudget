-- Export all data from current database to SQL file
-- This will be used to import data into Supabase

-- Export employees data
SELECT 'INSERT INTO employees (employee_id, name, gender, start_year, level, status, visit_province, home_visit_bus_fare, working_days, travel_working_days, custom_travel_rates, created_at, updated_at) VALUES ' ||
string_agg(
  '(''' || employee_id || ''', ''' || name || ''', ''' || gender || ''', ' || start_year || ', ''' || level || ''', ''' || status || ''', ''' || visit_province || ''', ' || home_visit_bus_fare || ', ' || working_days || ', ' || travel_working_days || ', ' || 
  CASE 
    WHEN custom_travel_rates IS NULL THEN 'NULL'
    ELSE '''' || custom_travel_rates::text || '''::jsonb'
  END || ', ''' || created_at || ''', ''' || updated_at || ''')', 
  ', '
) || ';' as insert_statement
FROM employees;

-- Export master_rates data
SELECT 'INSERT INTO master_rates (level, position, rent, monthly_assist, souvenir_allowance, travel, local, per_diem, hotel, created_at, updated_at) VALUES ' ||
string_agg(
  '(''' || level || ''', ''' || position || ''', ' || rent || ', ' || monthly_assist || ', ' || souvenir_allowance || ', ' || travel || ', ' || local || ', ' || per_diem || ', ' || hotel || ', ''' || created_at || ''', ''' || updated_at || ''')', 
  ', '
) || ';' as insert_statement
FROM master_rates;

-- Export budget_items data
SELECT 'INSERT INTO budget_items (type, code, account_code, name, year, amount, notes, created_at, updated_at) VALUES ' ||
string_agg(
  '(' || 
  CASE WHEN type IS NULL THEN 'NULL' ELSE '''' || type || '''' END || ', ' ||
  CASE WHEN code IS NULL THEN 'NULL' ELSE '''' || code || '''' END || ', ' ||
  CASE WHEN account_code IS NULL THEN 'NULL' ELSE '''' || account_code || '''' END || ', ''' || 
  name || ''', ' || year || ', ' || amount || ', ''' || notes || ''', ''' || created_at || ''', ''' || updated_at || ''')', 
  ', '
) || ';' as insert_statement
FROM budget_items;

-- Export overtime_items data  
SELECT 'INSERT INTO overtime_items (year, item, instances, days, hours, people, rate, salary, created_at, updated_at) VALUES ' ||
string_agg(
  '(' || year || ', ''' || item || ''', ' || instances || ', ' || days || ', ' || hours || ', ' || people || ', ' || rate || ', ' || salary || ', ''' || created_at || ''', ''' || updated_at || ''')', 
  ', '
) || ';' as insert_statement
FROM overtime_items;