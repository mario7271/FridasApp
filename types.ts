export type TimeFrame = 'day' | 'week' | 'month' | 'year';
export interface Employee {
    id: string;
    name: string;
    hourlyWage: number;
    hoursWorked: number;
    overtimeHours: number;
    tips: number;
    isActive: boolean;
    address?: string; // Street
    cityStateZip?: string; // City, State, Zip
    ssn?: string;
    dependents?: number;
    signature?: string; // Base64 image
}



export interface PayrollTotals {
    totalHours: number;
    totalBasePay: number;
    totalOvertimePay: number; // calculated value
    totalTips: number;
    grandTotal: number;
    avgWage: number;
    hourlyWageSum: number;
}