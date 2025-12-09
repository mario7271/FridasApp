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
                            const baseEarn = emp.hoursWorked * emp.hourlyWage;
                            const otPay = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
                            const totalWithTip = baseEarn + (emp.tips || 0) + otPay;

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
                                <tr key={emp.id} className="hover:bg-rose-50/50 transition-colors group">
                                    <td className="p-4 font-bold text-frida-teal">{emp.name}</td>
                                    <td className="p-4 text-right">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs pointer-events-none">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.50"
                                                value={emp.hourlyWage}
                                                onFocus={handleFocus}
                                                onChange={(e) => onUpdateEmployee(emp.id, 'hourlyWage', parseFloat(e.target.value) || 0)}
                                                className="w-24 text-right border border-gray-300 rounded-md p-1 pl-4 focus:ring-2 focus:ring-frida-pink focus:border-transparent outline-none transition-shadow"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={emp.hoursWorked}
                                            onFocus={handleFocus}
                                            onChange={(e) => onUpdateEmployee(emp.id, 'hoursWorked', parseFloat(e.target.value) || 0)}
                                            className="w-20 text-right border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-frida-pink focus:border-transparent outline-none transition-shadow font-medium"
                                        />
                                    </td>
                                    <td className="p-4 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={emp.overtimeHours || 0}
                                            onFocus={handleFocus}
                                            onChange={(e) => onUpdateEmployee(emp.id, 'overtimeHours', parseFloat(e.target.value) || 0)}
                                            className="w-20 text-right border border-orange-200 bg-orange-50/30 rounded-md p-1 focus:ring-2 focus:ring-frida-orange focus:border-transparent outline-none transition-shadow font-medium text-frida-orange"
                                        />
                                    </td>
                                    <td className="p-4 text-right font-medium text-gray-700 bg-gray-50/50">
                                        ${baseEarn.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs pointer-events-none">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1.00"
                                                value={emp.tips}
                                                onFocus={handleFocus}
                                                onChange={(e) => onUpdateEmployee(emp.id, 'tips', parseFloat(e.target.value) || 0)}
                                                className="w-24 text-right border border-gray-300 rounded-md p-1 pl-4 focus:ring-2 focus:ring-frida-pink focus:border-transparent outline-none transition-shadow"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-bold text-frida-pink text-lg bg-pink-50/50 group-hover:bg-pink-100/50 transition-colors">
                                        ${totalWithTip.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => onToggleActive(emp.id)}
                                            className="p-2 text-gray-500 hover:text-frida-blue hover:bg-indigo-50 rounded-full transition-colors"
                                            title="Deactivate"
                                        >
                                            <EyeOff className="w-5 h-5" />
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
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold text-gray-800">
                        {/* Totals Row */}
                        <tr className="border-t-2 border-frida-teal">
                            <td className="p-4 text-frida-teal font-serif text-lg">TOTALS</td>
                            <td className="p-4 text-right">-</td>
                            <td className="p-4 text-right">{totals.totalHours.toFixed(1)}</td>
                            <td className="p-4 text-right">-</td> {/* OT Hours Total not tracked in context yet, skipping for now */}
                            <td className="p-4 text-right">${totals.totalBasePay.toFixed(2)}</td>
                            <td className="p-4 text-right">${totals.totalTips.toFixed(2)}</td>
                            <td className="p-4 text-right text-frida-pink text-xl">${totals.grandTotal.toFixed(2)}</td>
                            <td className="p-4"></td>
                        </tr>
                        {/* Averages Row */}
                        <tr className="bg-gray-50 text-sm text-gray-600">
                            <td className="p-4 font-serif italic">Average</td>
                            <td className="p-4 text-right">${totals.avgWage.toFixed(2)}</td>
                            <td className="p-4 text-right">
                                {employees.filter(e => e.isActive).length > 0
                                    ? (totals.totalHours / employees.filter(e => e.isActive).length).toFixed(1)
                                    : 0}
                            </td>
                            <td className="p-4 text-right">-</td>
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