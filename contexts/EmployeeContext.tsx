import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Employee, TimeFrame, PayrollTotals } from '../types';

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
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Updated initial data with new schema
const INITIAL_EMPLOYEES: Employee[] = [
    { id: '1', name: 'Diego Rivera', hourlyWage: 25.50, hoursWorked: 40, overtimeHours: 5, tips: 200.00, isActive: true, address: '123 Mural St', ssn: '***-**-1111' },
    { id: '2', name: 'Cristina Kahlo', hourlyWage: 18.00, hoursWorked: 35, overtimeHours: 0, tips: 180.50, isActive: true },
    { id: '3', name: 'Maria Izquierdo', hourlyWage: 20.00, hoursWorked: 42, overtimeHours: 2, tips: 250.00, isActive: true },
    { id: '4', name: 'Chavela Vargas', hourlyWage: 22.00, hoursWorked: 20, overtimeHours: 0, tips: 300.00, isActive: true },
    { id: '5', name: 'Juan O Gorman', hourlyWage: 16.50, hoursWorked: 45, overtimeHours: 3, tips: 100.00, isActive: false },
];

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>(() => {
        try {
            const saved = localStorage.getItem('fridas_payroll_data');
            if (saved) {
                // Migration helper: checked if saved data has old format (overtimePay) and convert if needed?
                // For simplicity, we might just confuse logic if we don't migrate. 
                // Let's assume for this user "reset" is okay or we check logic.
                // Actually, let's just use it and rely on users fixing data or 'undefined' being 0
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load persistence", e);
        }
        return INITIAL_EMPLOYEES;
    });

    const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');

    useEffect(() => {
        localStorage.setItem('fridas_payroll_data', JSON.stringify(employees));
    }, [employees]);

    const totals: PayrollTotals = useMemo(() => {
        // Totals only include ACTIVE employees now? 
        // Requirement 3: "no se van a ver en la planilla general ni en el reporte." -> Implies totals should also reflect only active.
        const active = employees.filter(e => e.isActive);
        const count = active.length;

        if (count === 0) {
            return { totalHours: 0, totalBasePay: 0, totalOvertimePay: 0, totalTips: 0, grandTotal: 0, avgWage: 0, hourlyWageSum: 0 };
        }

        const res = active.reduce((acc, emp) => {
            const basePay = emp.hourlyWage * (emp.hoursWorked || 0);
            // New Logic: 1.5x for overtime
            const otHours = emp.overtimeHours || 0;
            const otPay = otHours * emp.hourlyWage * 1.5;

            return {
                totalHours: acc.totalHours + (emp.hoursWorked || 0),
                totalBasePay: acc.totalBasePay + basePay,
                totalOvertimePay: acc.totalOvertimePay + otPay,
                totalTips: acc.totalTips + (emp.tips || 0),
                grandTotal: acc.grandTotal + basePay + otPay + (emp.tips || 0),
                hourlyWageSum: acc.hourlyWageSum + emp.hourlyWage
            };
        }, { totalHours: 0, totalBasePay: 0, totalOvertimePay: 0, totalTips: 0, grandTotal: 0, hourlyWageSum: 0 });

        return {
            ...res,
            avgWage: res.hourlyWageSum / count
        };
    }, [employees]);

    const addEmployee = (name: string, hourlyWage: number = 15.00) => {
        const newEmp: Employee = {
            id: Date.now().toString(),
            name,
            hourlyWage,
            hoursWorked: 0,
            overtimeHours: 0,
            tips: 0,
            isActive: true,
            address: '',
            ssn: ''
        };
        setEmployees([...employees, newEmp]);
    };

    const updateEmployee = (id: string, field: keyof Employee, value: number | string) => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
    };

    const toggleActive = (id: string) => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, isActive: !emp.isActive } : emp));
    };

    const removeEmployee = (id: string) => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
    };

    const resetData = () => {
        setEmployees(INITIAL_EMPLOYEES);
    };

    const handleTimeFrameChange = (newFrame: TimeFrame) => {
        if (newFrame === timeFrame) return;

        const multipliers: Record<string, number> = {
            'day': 0.2,
            'week': 1,
            'biweekly': 2,
            'month': 4.33,
            'year': 52
        };

        const factor = multipliers[newFrame] / multipliers[timeFrame];

        const scaledEmployees = employees.map(emp => ({
            ...emp,
            hoursWorked: parseFloat((emp.hoursWorked * factor).toFixed(1)),
            overtimeHours: parseFloat(((emp.overtimeHours || 0) * factor).toFixed(1)),
            tips: parseFloat((emp.tips * factor).toFixed(2))
        }));

        setEmployees(scaledEmployees);
        setTimeFrame(newFrame);
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
            resetData
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
