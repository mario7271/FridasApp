export type TimeFrame = 'day' | 'week' | 'month' | 'year';

export interface Employee {
  id: string;
  name: string;
  hourlyWage: number;
  hoursWorked: number;
  overtimePay: number;
  tips: number;
  isActive: boolean;
}

export interface PayrollTotals {
  totalHours: number;
  totalBasePay: number;
  totalOvertime: number;
  totalTips: number;
  grandTotal: number;
  avgWage: number;
}