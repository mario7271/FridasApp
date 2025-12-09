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

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 mb-10 transition-shadow hover:shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-frida-teal text-white font-serif uppercase text-sm tracking-wider">
                            <th className="p-4 rounded-tl-xl">Employee</th>
                            <th className="p-4 text-right">Wage / Hr</th>
                            <th className="p-4 text-right">Hours Worked</th>
                            <th className="p-4 text-right">Overtime (Hrs)</th>
                            <th className="p-4 text-right bg-teal-800/30">Base Earn</th>
                            <th className="p-4 text-right">Tips</th>
                            <th className="p-4 text-right font-bold text-frida-yellow bg-teal-800/50">Total</th>
                            <th className="p-4 text-center rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                        {employees.map((emp) => {
                            const wage = emp.hourlyWage || 0;
                            const hours = emp.hoursWorked || 0;
                            const overtimeHours = emp.overtimeHours || 0;
                            const tips = emp.tips || 0;

                            const regularPay = wage * hours;
                            const otPay = overtimeHours * wage * 1.5;

                            // UPDATED: Base Earn includes regularPay + otPay
                            const baseEarn = regularPay + otPay;
                            const total = baseEarn + tips;

                            if (!emp.isActive) {
                                return (
                                    <tr key={emp.id} className="bg-gray-50 opacity-60 hover:opacity-80 transition-opacity">
                                        <td className="p-4 font-medium text-gray-500 italic">{emp.name} (Inactive)</td>
                                        <td colSpan={6} className="p-4 text-center text-sm text-gray-400">
                                            User inactive - Activate to edit
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <button
                                                onClick={() => onToggleActive(emp.id)}
                                                className="p-2 text-frida-blue hover:bg-indigo-50 rounded-full transition-colors"
                                                title="Activate"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onRemoveEmployee(emp.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={emp.id} className={`bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors`}>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{emp.name}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200 focus-within:border-frida-teal focus-within:ring-2 focus-within:ring-frida-teal/20 transition-all w-28">
                                            <span className="text-gray-400 font-serif mr-1">$</span>
                                            <input
                                                type="number"
                                                value={emp.hourlyWage}
                                                onChange={(e) => onUpdateEmployee(emp.id, 'hourlyWage', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent outline-none font-medium text-gray-700 text-right"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200 focus-within:border-frida-teal focus-within:ring-2 focus-within:ring-frida-teal/20 transition-all w-24 mx-auto">
                                            <input
                                                type="number"
                                                value={emp.hoursWorked}
                                                onChange={(e) => onUpdateEmployee(emp.id, 'hoursWorked', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent outline-none font-medium text-gray-700 text-center"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-red-100 focus-within:border-frida-orange focus-within:ring-2 focus-within:ring-frida-orange/20 transition-all w-24 mx-auto">
                                            <input
                                                type="number"
                                                value={emp.overtimeHours || 0}
                                                onChange={(e) => onUpdateEmployee(emp.id, 'overtimeHours', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent outline-none font-bold text-frida-orange text-center"
                                                placeholder="0"
                                            />
                                        </div>
                                    </td>
                                    {/* Base Earn now includes Regular + OT Pay */}
                                    <td className="p-4 text-right font-medium text-gray-600">
                                        ${baseEarn.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-2 border border-green-100 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all w-24 ml-auto">
                                            <span className="text-green-500 font-serif mr-1">$</span>
                                            <input
                                                type="number"
                                                value={emp.tips || 0}
                                                onChange={(e) => onUpdateEmployee(emp.id, 'tips', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent outline-none font-bold text-green-600 text-right"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-bold text-xl text-frida-pink font-serif">
                                            ${total.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onToggleActive(emp.id)}
                                                className={`p-2 rounded-lg transition-colors ${emp.isActive ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={emp.isActive ? "Deactivate" : "Activate"}
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
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold text-gray-800">
                        <tr className="border-t-2 border-frida-teal">
                            <td className="p-4 text-frida-teal font-serif text-lg">TOTALS</td>
                            <td className="p-4 text-right">-</td>
                            <td className="p-4 text-center">{totals.totalHours.toFixed(1)}</td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-right">${totals.totalBasePay.toFixed(2)}</td>
                            <td className="p-4 text-right">${totals.totalTips.toFixed(2)}</td>
                            <td className="p-4 text-right text-frida-pink text-xl">${totals.grandTotal.toFixed(2)}</td>
                            <td className="p-4"></td>
                        </tr>
                        <tr className="bg-gray-50 text-sm text-gray-600">
                            <td className="p-4 font-serif italic">Average</td>
                            <td className="p-4 text-right">${totals.avgWage.toFixed(2)}</td>
                            <td className="p-4 text-center">
                                {employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalHours / employees.filter(e => e.isActive).length).toFixed(1)
                                    : 0}
                            </td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-right">
                                ${employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalBasePay / employees.filter(e => e.isActive).length).toFixed(2)
                                    : 0}
                            </td>
                            <td className="p-4 text-right">
                                ${employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalTips / employees.filter(e => e.isActive).length).toFixed(2)
                                    : 0}
                            </td>
                            <td className="p-4 text-right">
                                ${employees.filter(e => e.isActive).length > 0
                                    ? (totals.grandTotal / employees.filter(e => e.isActive).length).toFixed(2)
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