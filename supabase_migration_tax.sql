-- Add Tax Calculation columns to employees table
alter table public.employees 
add column if not exists filing_status text default 'single', -- single, married_joint, head_household
add column if not exists multiple_jobs boolean default false,
add column if not exists dependent_amount_usd numeric default 0,
add column if not exists other_income numeric default 0,
add column if not exists deductions numeric default 0;

-- Drop deprecated column if desired, or keep for legacy compatibility
-- alter table public.employees drop column dependents;
