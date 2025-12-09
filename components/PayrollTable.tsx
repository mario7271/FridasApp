import React from 'react';
import { Employee, PayrollTotals } from '../types';
import { Trash2, Eye, EyeOff } from 'lucide-react';

interface PayrollTableProps {
    employees: Employee[];
    totals: PayrollTotals;
    onUpdateEmployee: (id: string, field: keyof Employee, value: number) => void;
    onToggleActive: (id: string) => void;
    onRemoveEmployee: (id: string) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
    employees,
    totals,
    onUpdateEmployee,
    onToggleActive,
    onRemoveEmployee
}) => {

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const fohEmployees = employees.filter(e => (!e.role || e.role === 'FOH'));
    const bohEmployees = employees.filter(e => e.role === 'BOH');

    // Reusable Header for FOH
    const FOHHeader = () => (
        <thead className="bg-frida-teal text-white font-serif uppercase text-sm tracking-wider">
            <tr>
                <th className="p-4 rounded-tl-xl">FOH Employee</th>
                <th className="p-4 text-right">Wage / Hr</th>
                <th className="p-4 text-right">Hours Worked</th>
                <th className="p-4 text-right">Overtime (Hrs)</th>
                <th className="p-4 text-right bg-teal-800/30">Base Earn</th>
                <th className="p-4 text-right">Tips</th>
                <th className="p-4 text-right font-bold text-frida-yellow bg-teal-800/50">Total</th>
                <th className="p-4 text-center rounded-tr-xl">Actions</th>
            </tr>
        </thead>
    );

    // Reusable Header for BOH (Simpler columns)
    const BOHHeader = () => (
        <thead className="bg-gray-700 text-white font-serif uppercase text-sm tracking-wider">
            <tr>
                <th className="p-4 rounded-tl-xl">BOH Employee</th>
                <th className="p-4 text-right" colSpan={4}></th>
                <th className="p-4 text-right bg-gray-800/30">Base Salary</th>
                <th className="p-4 text-right font-bold text-frida-yellow bg-gray-800/50">Total</th>
                <th className="p-4 text-center rounded-tr-xl">Actions</th>
            </tr>
        </thead>
    );

    const renderActionButtons = (emp: Employee) => (
        <div className="flex justify-center gap-2">
            <button
                onClick={() => onToggleActive(emp.id)}
                className={`p-2 rounded-lg transition-colors ${emp.isActive ? 'text-frida-blue hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                title="Activate/Deactivate"
            >
                {emp.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
                onClick={() => onRemoveEmployee(emp.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );

    return (
        <div className="space-y-8 mb-10">
            {/* --- FOH SECTION --- */}
            {fohEmployees.length > 0 && (
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transition-shadow hover:shadow-2xl">
                    <div className="bg-gray-50 p-2 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-4">Front of House (FOH)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <FOHHeader />
                            <tbody className="divide-y divide-gray-100 font-sans">
                                {fohEmployees.map((emp) => {
                                    if (!emp.isActive) return null; // Or handle inactive differently if requested

                                    const regularPay = (emp.hourlyWage || 0) * (emp.hoursWorked || 0);
                                    const otPay = (emp.overtimeHours || 0) * (emp.hourlyWage || 0) * 1.5;
                                    const baseEarn = regularPay + otPay;
                                    const total = baseEarn + (emp.tips || 0);

                                    return (
                                        <tr key={emp.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-gray-800">{emp.name}</td>
                                            <td className="p-4">
                                                <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200 focus-within:border-frida-teal w-28 ml-auto">
                                                    <span className="text-gray-400 font-serif mr-1">$</span>
                                                    <input
                                                        type="number"
                                                        value={emp.hourlyWage}
                                                        onChange={(e) => onUpdateEmployee(emp.id, 'hourlyWage', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent outline-none text-right"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 w-24 mx-auto">
                                                    <input
                                                        type="number"
                                                        value={emp.hoursWorked}
                                                        onChange={(e) => onUpdateEmployee(emp.id, 'hoursWorked', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent outline-none text-center"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="bg-gray-50 rounded-lg p-2 border border-red-100 w-24 mx-auto">
                                                    <input
                                                        type="number"
                                                        value={emp.overtimeHours || 0}
                                                        onChange={(e) => onUpdateEmployee(emp.id, 'overtimeHours', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent outline-none text-center text-frida-orange font-bold"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-medium text-gray-600">
                                                ${baseEarn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-green-100 w-24 ml-auto">
                                                    <span className="text-green-500 font-serif mr-1">$</span>
                                                    <input
                                                        type="number"
                                                        value={emp.tips || 0}
                                                        onChange={(e) => onUpdateEmployee(emp.id, 'tips', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent outline-none text-right text-green-600 font-bold"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-xl text-frida-pink font-serif">
                                                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-center">
                                                {renderActionButtons(emp)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- BOH SECTION --- */}
            {bohEmployees.length > 0 && (
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transition-shadow hover:shadow-2xl">
                    <div className="bg-gray-50 p-2 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-4">Back of House (BOH)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <BOHHeader />
                            <tbody className="divide-y divide-gray-100 font-sans">
                                {bohEmployees.map((emp) => {
                                    if (!emp.isActive) return null;

                                    // BOH Total IS the Salary directly
                                    const total = emp.salary || 0;

                                    return (
                                        <tr key={emp.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-gray-800">{emp.name}</td>
                                            <td className="p-4" colSpan={4}>
                                                <div className="text-xs text-center text-gray-300 uppercase tracking-widest">Base Salary Only</div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200 focus-within:border-frida-teal w-32 ml-auto">
                                                    <span className="text-gray-400 font-serif mr-1">$</span>
                                                    <input
                                                        type="text"
                                                        value={(emp.salary || 0).toLocaleString()}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/,/g, '');
                                                            if (!isNaN(Number(rawValue))) {
                                                                onUpdateEmployee(emp.id, 'salary', parseFloat(rawValue) || 0);
                                                            }
                                                        }}
                                                        className="w-full bg-transparent outline-none text-right font-bold"
                                                    />
                                                </div>
                                            </td>

                                            <td className="p-4 text-right font-bold text-xl text-frida-teal font-serif">
                                                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-center">
                                                {renderActionButtons(emp)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* --- GRAND TOTALS SECTION --- */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 mt-8">
                <div className="bg-gray-800 p-2 border-b border-gray-700">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-4">Period Grand Totals</h3>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="p-4">Metric</th>
                            <th className="p-4 text-right">Label</th>
                            <th className="p-4 text-center">Hours</th>
                            <th className="p-4 text-center">OT</th>
                            <th className="p-4 text-right">Base Pay</th>
                            <th className="p-4 text-right">Tips</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tfoot className="bg-white font-bold text-gray-800">
                        <tr className="border-t-2 border-frida-teal">
                            <td className="p-4 text-frida-teal font-serif text-lg">TOTALS</td>
                            <td className="p-4 text-right">-</td>
                            <td className="p-4 text-center">{totals.totalHours.toFixed(1)}</td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-right">${totals.totalBasePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-4 text-right">${totals.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-4 text-right text-frida-pink text-xl">${totals.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-4"></td>
                        </tr>
                        <tr className="bg-gray-50 text-sm text-gray-600">
                            <td className="p-4 font-serif italic">Averages</td>
                            <td className="p-4 text-right"></td>
                            <td className="p-4 text-center">
                                {employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalHours / employees.filter(e => e.isActive).length).toFixed(1)
                                    : 0}
                            </td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-right">
                                ${employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalBasePay / employees.filter(e => e.isActive).length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : 0}
                            </td>
                            <td className="p-4 text-right">
                                ${employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalTips / employees.filter(e => e.isActive).length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : 0}
                            </td>
                            <td className="p-4 text-right">
                                ${employees.filter(e => e.isActive).length > 0
                                    ? (totals.grandTotal / employees.filter(e => e.isActive).length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : 0}
                            </td>
                            <td className="p-4"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PayrollTable;