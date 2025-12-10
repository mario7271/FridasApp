export type TimeFrame = 'day' | 'week' | 'biweekly' | 'month' | 'year';
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
    role: 'FOH' | 'BOH';
    salary?: number; // Fixed salary for BOH
    restaurantId?: string;

    // Tax / W-4 Info
    filingStatus?: 'single' | 'married_joint' | 'head_household';
    multipleJobs?: boolean;
    dependentAmountUSD?: number;
    otherIncome?: number;
    deductions?: number;
}

export interface Restaurant {
    id: string;
    name: string;
    location: string;
    themeColor: string; // 'rose' | 'amber' | 'emerald' etc.
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