import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Employee, TimeFrame, PayrollTotals } from '../types';
import { supabase } from '../lib/supabase';
import { useRestaurant } from './RestaurantContext';

interface EmployeeContextType {
    employees: Employee[];
    timeFrame: TimeFrame;
    totals: PayrollTotals;
    addEmployee: (name: string, hourlyWage?: number) => void;
    updateEmployee: (id: string, field: keyof Employee, value: number | string) => void;
    toggleActive: (id: string) => void;
    removeEmployee: (id: string) => void;
    setTimeFrame: (timeFrame: TimeFrame) => void;
    resetData: () => void;
    calculateGrossWages: (emp: Employee) => number;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Helper to map DB snake_case to App camelCase
const mapFromDB = (data: any[]): Employee[] => {
    return data.map(d => ({
        id: d.id,
        name: d.name,
        hourlyWage: Number(d.hourly_wage), // Ensure numbers
        hoursWorked: Number(d.hours_worked),
        overtimeHours: Number(d.overtime_hours),
        tips: Number(d.tips),
        isActive: d.is_active,
        address: d.address || '',
        cityStateZip: d.city_state_zip || '',
        ssn: d.ssn || '',
        dependents: Number(d.dependents || 0),
        signature: d.signature || '',
        role: d.role || 'FOH',
        salary: Number(d.salary || 0),
        restaurantId: d.restaurant_id,
        filingStatus: d.filing_status || 'single',
        multipleJobs: d.multiple_jobs || false,
        dependentAmountUSD: Number(d.dependent_amount_usd || 0),
        otherIncome: Number(d.other_income || 0),
        deductions: Number(d.deductions || 0)
    }));
};

// Helper to map App camelCase to DB snake_case for single field updates
const mapFieldToDB = (field: keyof Employee): string => {
    switch (field) {
        case 'hourlyWage': return 'hourly_wage';
        case 'hoursWorked': return 'hours_worked';
        case 'overtimeHours': return 'overtime_hours';
        case 'isActive': return 'is_active';
        case 'cityStateZip': return 'city_state_zip';
        case 'filingStatus': return 'filing_status';
        case 'multipleJobs': return 'multiple_jobs';
        case 'dependentAmountUSD': return 'dependent_amount_usd';
        case 'otherIncome': return 'other_income';
        // role and salary map directly if columns match name, but let's be explicit if needed or default
        default: return field;
    }
};

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('biweekly');
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch
    const { currentRestaurant } = useRestaurant();

    // Initial Fetch & Refetch when restaurant changes
    useEffect(() => {
        if (currentRestaurant) {
            fetchEmployees();
        }
    }, [currentRestaurant]);

    const fetchEmployees = async () => {
        try {
            let query = supabase
                .from('employees')
                .select('*')
                .eq('restaurant_id', currentRestaurant?.id) // Filter by restaurant
                .order('name');

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                setEmployees(mapFromDB(data));
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            // Optional: Fallback to empty or show error
        } finally {
            setIsLoading(false);
        }
    };

    const totals: PayrollTotals = useMemo(() => {
        const active = employees.filter(e => e.isActive);
        const count = active.length;

        if (count === 0) {
            return { totalHours: 0, totalBasePay: 0, totalOvertimePay: 0, totalTips: 0, grandTotal: 0, avgWage: 0, hourlyWageSum: 0 };
        }

        const res = active.reduce((acc, emp) => {
            let baseEarn = 0;
            let otPay = 0;

            if (emp.role === 'BOH') {
                // BOH Logic: 
                // Scenario A: Salaried. Gross = Base Salary.
                // Scenario B: Hourly. Gross = (Hours * Rate) + (OT * Rate * 1.5)
                // We determine if salaried by checking if hourlyWage is 0 or low? Or imply structure?
                // The prompt says "Salaried (Usually BOH)" but also "Hourly (BOH)".
                // We'll use: if salary > 0, treat as salaried. Else hourly.

                if (emp.salary && emp.salary > 0) {
                    baseEarn = emp.salary;
                    // Salaried usually doesn't get OT in this context unless specified, assuming exempt.
                } else {
                    const regularPay = emp.hourlyWage * (emp.hoursWorked || 0);
                    const otPayCalc = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
                    baseEarn = regularPay; // Base logic for totals
                    otPay = otPayCalc;
                }
            } else {
                // FOH Logic (Tipped)
                // Gross Wages = (Hours * Rate) + (OT * Rate * 1.5) + Tips Amount.
                // Note: 'baseEarn' in this reduce is usually just wage earnings. 
                // But for tax purposed strictly, tips are wages.
                // For the 'Totals' display object, 'totalBasePay' typically means Employer paid wages.
                // 'Grand Total' is what shows up as total earnings.

                const regularPay = emp.hourlyWage * (emp.hoursWorked || 0);
                const otHours = emp.overtimeHours || 0;
                otPay = otHours * emp.hourlyWage * 1.5;
                baseEarn = regularPay + otPay;
            }

            return {
                totalHours: acc.totalHours + (emp.hoursWorked || 0),
                totalBasePay: acc.totalBasePay + baseEarn,
                totalOvertimePay: acc.totalOvertimePay + otPay,
                totalTips: acc.totalTips + (emp.tips || 0),
                grandTotal: acc.grandTotal + baseEarn + (emp.tips || 0),
                hourlyWageSum: acc.hourlyWageSum + (emp.hourlyWage || 0)
            };
        }, { totalHours: 0, totalBasePay: 0, totalOvertimePay: 0, totalTips: 0, grandTotal: 0, hourlyWageSum: 0 });

        return {
            ...res,
            avgWage: res.hourlyWageSum / count
        };
    }, [employees]);

    const addEmployee = async (name: string, hourlyWage: number = 15.00) => {
        const id = crypto.randomUUID(); // Use standard UUID
        const newEmp: Employee = {
            id,
            name,
            hourlyWage,
            hoursWorked: 0,
            overtimeHours: 0,
            tips: 0,
            isActive: true,
            address: '',
            cityStateZip: '',
            ssn: '',
            dependents: 0,
            signature: '',
            role: 'FOH',
            salary: 0,
            restaurantId: currentRestaurant?.id
        };

        // Optimistic Update
        setEmployees(prev => [...prev, newEmp]);

        // DB Update
        const { error } = await supabase.from('employees').insert({
            id,
            name,
            hourly_wage: hourlyWage,
            hours_worked: 0,
            overtime_hours: 0,
            tips: 0,
            is_active: true,
            role: 'FOH',
            salary: 0,
            restaurant_id: currentRestaurant?.id
        });

        if (error) {
            console.error('Error adding employee:', error);
            // Revert on error could be implemented here
        }
    };

    const updateEmployee = async (id: string, field: keyof Employee, value: number | string) => {
        // Optimistic Update
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));

        // DB Update
        const dbField = mapFieldToDB(field);
        const { error } = await supabase
            .from('employees')
            .update({ [dbField]: value })
            .eq('id', id);

        if (error) {
            console.error(`Error updating employee ${field}:`, error);
        }
    };

    const toggleActive = async (id: string) => {
        const emp = employees.find(e => e.id === id);
        if (!emp) return;

        const newValue = !emp.isActive;

        // Optimistic Update
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, isActive: newValue } : e));

        // DB Update
        const { error } = await supabase
            .from('employees')
            .update({ is_active: newValue })
            .eq('id', id);

        if (error) {
            console.error('Error toggling active:', error);
        }
    };

    const removeEmployee = async (id: string) => {
        // Optimistic Update
        setEmployees(prev => prev.filter(emp => emp.id !== id));

        // DB Update
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error removing employee:', error);
        }
    };

    const resetData = async () => {
        // Caution: Resetting in DB means deleting all and re-seeding!
        // For safety, let's just clear values to 0 instead of deleting everyone.
        // Or re-implement "Seed" functionality?
        // Let's make "Reset" just zero out hours/tips for a new period.

        const updates = employees.map(e => ({
            ...e,
            hoursWorked: 0,
            overtimeHours: 0,
            tips: 0
        }));

        setEmployees(updates);

        // Batch update is tricky in Supabase without RPC, loop for now (not efficient but safe for small teams)
        for (const emp of updates) {
            await supabase.from('employees').update({
                hours_worked: 0,
                overtime_hours: 0,
                tips: 0
            }).eq('id', emp.id);
        }
    };

    const handleTimeFrameChange = async (newFrame: TimeFrame) => {
        if (newFrame === timeFrame) return;

        const multipliers: Record<string, number> = {
            'day': 0.2,
            'week': 1,
            'biweekly': 2,
            'month': 4.33,
            'year': 52
        };

        const factor = multipliers[newFrame] / multipliers[timeFrame];

        // Optimistically scale
        const scaledEmployees = employees.map(emp => ({
            ...emp,
            hoursWorked: parseFloat((emp.hoursWorked * factor).toFixed(1)),
            overtimeHours: parseFloat(((emp.overtimeHours || 0) * factor).toFixed(1)),
            tips: parseFloat((emp.tips * factor).toFixed(2)),
            salary: emp.salary ? parseFloat((emp.salary * factor).toFixed(2)) : 0
        }));

        setEmployees(scaledEmployees);
        setTimeFrame(newFrame);

        // Update DB with scaled values
        for (const emp of scaledEmployees) {
            await supabase.from('employees').update({
                hours_worked: emp.hoursWorked,
                overtime_hours: emp.overtimeHours,
                tips: emp.tips,
                salary: emp.salary
            }).eq('id', emp.id);
        }
    };

    const calculateGrossWages = (emp: Employee): number => {
        let gross = 0;
        if (emp.role === 'BOH') {
            // Scenario A: Salaried
            if (emp.salary && emp.salary > 0) {
                gross = emp.salary;
            } else {
                // Scenario B: Hourly (BOH)
                const regular = emp.hourlyWage * (emp.hoursWorked || 0);
                const ot = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
                gross = regular + ot;
            }
        } else {
            // Scenario C: Tipped Hourly (FOH)
            const regular = emp.hourlyWage * (emp.hoursWorked || 0);
            const ot = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
            const tips = emp.tips || 0;
            gross = regular + ot + tips;
        }
        return gross;
    };

    return (
        <EmployeeContext.Provider value={{
            employees,
            timeFrame,
            totals,
            addEmployee,
            updateEmployee,
            toggleActive,
            removeEmployee,
            setTimeFrame: handleTimeFrameChange,
            resetData,
            calculateGrossWages
        }}>
            {children}
        </EmployeeContext.Provider>
    );
};

export const useEmployees = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error('useEmployees must be used within an EmployeeProvider');
    }
    return context;
};
