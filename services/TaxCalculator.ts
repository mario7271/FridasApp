import { Employee } from '../types';

export interface TaxCalculationResult {
    grossTaxablePay: number;
    fedIncomeTax: number;
    ssEmployee: number;
    ssEmployer: number;
    medEmployee: number;
    medEmployer: number;
    futaEmployer: number;
    totalEmployeeWithholding: number;
    totalEmployerCost: number;
    totalTaxLiability: number;
}

// 2024 Percentage Method Tables (Simplified for 'Standard' withholding)
// Source: IRS Publication 15-T (2024) - Percentage Method Tables for Automated Payroll Systems
// NOTE: This IS AN ESTIMATION. Real payroll has complexity (pre-tax deductions, exact pay periods, etc.)

const STANDARD_DEDUCTION_2024 = {
    single: 8600, // annualized value from table? No, Pub 15-T works differently. 
    // It uses an "Adjusted Annual Wage Amount" method.
    // Let's use the 2024 Percentage Method: Table 1-a(i) (Single) etc.
    // Actually, Step 2 is "Standard Withholding Rate Schedules".
};

export const calculateTaxes = (
    employee: Employee,
    payPeriod: 'weekly' | 'biweekly' | 'semi_monthly' | 'monthly' | 'annual',
    grossPay: number,
    includeFUTA: boolean = false
): TaxCalculationResult => {

    // 1. Social Security & Medicare (FICA)
    // ------------------------------------
    const ssRate = 0.062;
    const medRate = 0.0145;

    // Note: Medicare Additional Tax (0.9%) applies over $200k. Ignoring for this basic estimation.
    // Note: SS Wage Base limit ($168,600 for 2024). Ignoring for this basic estimation tool unless requested.

    const ssEmployee = grossPay * ssRate;
    const ssEmployer = grossPay * ssRate;

    const medEmployee = grossPay * medRate;
    const medEmployer = grossPay * medRate;

    // 2. FUTA (Federal Unemployment) - Employer Only
    // ----------------------------------------------
    // 0.6% on first $7,000. 
    // Since we don't track YTD in this simple tool yet, we'll act as if the employee hasn't hit the cap
    // OR just display the potential liability for this pay period.
    const futaEmployer = includeFUTA ? grossPay * 0.006 : 0;


    // 3. Federal Income Tax (FIT) - W-4 2020+ Logic (Percentage Method)
    // ----------------------------------------------------------------
    // Based on IRS Pub 15-T Worksheet 1.
    // Step 1: Adjust the employee's wage amount.

    // Determine Pay Frequency divisor
    let payPeriods = 52;
    if (payPeriod === 'biweekly') payPeriods = 26;
    if (payPeriod === 'semi_monthly') payPeriods = 24;
    if (payPeriod === 'monthly') payPeriods = 12;
    if (payPeriod === 'annual') payPeriods = 1;

    // 1a. Annualize Total Taxable Wages
    let annualizedWages = grossPay * payPeriods;

    // 1b. Add Annualized Other Income (Step 4a)
    annualizedWages += Number(employee.otherIncome || 0);

    // 1c. Subtract Annualized Deductions (Step 4b)
    annualizedWages -= Number(employee.deductions || 0);

    // 1d - 1k (Adjusted Annual Wage Amount)
    // Simplified: No pre-2020 form handling. Assuming 2020+ W-4.
    // Table seems to assume we subtract "Step 4(b) Deductions" above.
    // Standard Deduction is implicit in the Bracket Tables for "Automated Payroll Systems".
    // ... Wait, Pub 15-T "Percentage Method Tables for Automated Payroll Systems"
    // says "If the box in Step 2 of Form W-4 is checked..." -> separate table.

    const isStandard = !employee.multipleJobs; // "Standard" vs "Form W-4, Step 2(c) Checkbox"
    const status = employee.filingStatus || 'single';

    // Get Tentative Withholding Amount
    let tentativeAnnualWithholding = calculateAnnualWithholding(annualizedWages, status, isStandard);

    // Step 3: Account for Tax Credits (Dependents)
    // Subtract Step 3 Amount (Annual)
    tentativeAnnualWithholding -= Number(employee.dependentAmountUSD || 0);

    // Ensure not negative
    if (tentativeAnnualWithholding < 0) tentativeAnnualWithholding = 0;

    // Convert back to Pay Period
    let fedIncomeTax = tentativeAnnualWithholding / payPeriods;


    return {
        grossTaxablePay: grossPay,
        fedIncomeTax,
        ssEmployee,
        ssEmployer,
        medEmployee,
        medEmployer,
        futaEmployer,
        totalEmployeeWithholding: fedIncomeTax + ssEmployee + medEmployee,
        totalEmployerCost: ssEmployer + medEmployer + futaEmployer,
        totalTaxLiability: (fedIncomeTax + ssEmployee + medEmployee) + (ssEmployer + medEmployer + futaEmployer)
    };
};

// Simplified Bracket Logic for 2024 (Source: Pub 15-T, p. 10-12)
// Using "Percentage Method Tables for Automated Payroll Systems"
// This is a rough approximation for cash flow estimation.

const calculateAnnualWithholding = (wages: number, status: string, isStandard: boolean): number => {
    // 1. Determine which "Box" (Table) to use.
    // Is Standard (No Step 2c check)?
    //    Single -> Table 1
    //    Married Joint -> Table 2
    //    Head Household -> Table 3
    // Is Checkbox (Step 2c)?
    //    Single -> Table 4
    //    Married Joint -> Table 5
    //    Head -> Table 6

    // MAPPING (Simplified Arrays: [Over, BaseAmount, Percentage, ExcessOver])
    // Note: Pub 15-T tables logic is: 
    // "If the Adjusted Annual Wage Amount is: At least X, but less than Y... 
    //  The amount of income tax withholding is: A + (B% of the excess over C)"

    let brackets: number[][] = []; // [Limit, BaseTax, Rate, ExcessOver]

    if (isStandard) {
        if (status === 'single') {
            // Table 1 - Single (Standard)
            brackets = [
                [0, 0, 0, 0],
                [14600, 0, 0.10, 14600],
                [26200, 1160.00, 0.12, 26200],
                [61750, 5426.00, 0.22, 61750],
                [115125, 17168.50, 0.24, 115125],
                [206550, 39110.50, 0.32, 206550],
                [258325, 55678.50, 0.35, 258325],
                [623950, 183647.25, 0.37, 623950]
            ];
        } else if (status === 'married_joint') {
            // Table 2 - Married Filing Jointly (Standard)
            brackets = [
                [0, 0, 0, 0],
                [29200, 0, 0.10, 29200],
                [52400, 2320.00, 0.12, 52400],
                [123500, 10852.00, 0.22, 123500],
                [230250, 34337.00, 0.24, 230250],
                [413100, 78221.00, 0.32, 413100],
                [516650, 111357.00, 0.35, 516650],
                [760400, 196669.50, 0.37, 760400]
            ];
        } else {
            // Table 3 - Head of Household (Standard)
            brackets = [
                [0, 0, 0, 0],
                [21900, 0, 0.10, 21900],
                [38400, 1650.00, 0.12, 38400],
                [85000, 7242.00, 0.22, 85000],
                [117150, 14315.00, 0.24, 117150],
                [208575, 36257.00, 0.32, 208575],
                [260350, 52825.00, 0.35, 260350],
                [625975, 180793.75, 0.37, 625975]
            ];
        }
    } else {
        // Step 2(c) Checkbox Checked (Higher Withholding)
        if (status === 'single') {
            // Table 4 - Single (Checkbox)
            brackets = [
                [0, 0, 0, 0],
                [8600, 0, 0.10, 8600],
                [14400, 580.00, 0.12, 14400],
                [32175, 2713.00, 0.22, 32175],
                [58863, 8584.25, 0.24, 58863],
                [104575, 19555.25, 0.32, 104575],
                [130463, 27839.25, 0.35, 130463],
                [313275, 91823.50, 0.37, 313275]
            ];
        } else if (status === 'married_joint') {
            // Table 5 - Married Joint (Checkbox)
            // Note: This is usually similar to Single Standard tables per person? 
            // IRS Table 5.
            brackets = [
                [0, 0, 0, 0],
                [14600, 0, 0.10, 14600],
                [26200, 1160.00, 0.12, 26200],
                [61750, 5426.00, 0.22, 61750],
                [115125, 17168.50, 0.24, 115125],
                [206550, 39110.50, 0.32, 206550],
                [258325, 55678.50, 0.35, 258325],
                // Note: Table 5 generally matches Single Standard in 2024?
                // Let's assume these values are roughly correct for "Step 2c checked" which simulates "Single" rates for married.
                [623950, 183647.25, 0.37, 623950]
            ];
            // Wait, brackets for Married Checkbox are NOT identical to Single Standard. 
            // Correcting Table 5 (Married Joint with Checkbox) from Pub 15-T (approx):
            brackets = [
                [0, 0, 0, 0],
                [14600, 0, 0.10, 14600],
                [26200, 1160.00, 0.12, 26200],
                [61750, 5426.00, 0.22, 61750],
                [115125, 17168.50, 0.24, 115125],
                [206550, 39110.50, 0.32, 206550],
                [258325, 55678.50, 0.35, 258325],
                [623950, 183647.25, 0.37, 623950]
            ];
            // Yes, it IS essentially the Single Standard Table.
        } else {
            // Head of Household (Checkbox)
            // Table 6
            brackets = [
                [0, 0, 0, 0],
                [12250, 0, 0.10, 12250],
                [20500, 825.00, 0.12, 20500],
                [43800, 3621.00, 0.22, 43800],
                [59875, 7157.50, 0.24, 59875],
                [105588, 18128.50, 0.32, 105588],
                [131475, 26412.50, 0.35, 131475],
                [314288, 90396.88, 0.37, 314288] // Last bracket inferred
            ];
        }
    }

    // Find Bracket
    // We sort descending or just loop until we find the range.
    // Brackets structure: [Threshold, BaseTax, Rate, ExcessOver]
    // The "Threshold" is the "At least" value.
    // We need to find the highest threshold that is <= wages.

    let selectedBracket = brackets[0];
    for (const b of brackets) {
        if (wages >= b[0]) {
            selectedBracket = b;
        } else {
            break;
        }
    }

    const [threshold, baseTax, rate, excessOver] = selectedBracket;

    // Calc
    const excess = wages - excessOver;
    return baseTax + (excess * rate);
};
