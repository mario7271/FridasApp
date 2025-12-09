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
              <th className="p-4 rounded-tl-xl">Empleado</th>
              <th className="p-4 text-right">Wage / Hr</th>
              <th className="p-4 text-right">Hours Worked</th>
              <th className="p-4 text-right bg-teal-800/30">Total Earn (Base)</th>
              <th className="p-4 text-right">Tips</th>
              <th className="p-4 text-right">Overtime ($)</th>
              <th className="p-4 text-right font-bold text-frida-yellow bg-teal-800/50">Total w/ Tip</th>
              <th className="p-4 text-center rounded-tr-xl">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {employees.map((emp) => {
              const baseEarn = emp.hoursWorked * emp.hourlyWage;
              const totalWithTip = baseEarn + emp.tips + emp.overtimePay;
              
              if (!emp.isActive) {
                return (
                  <tr key={emp.id} className="bg-gray-50 opacity-60 hover:opacity-80 transition-opacity">
                    <td className="p-4 font-medium text-gray-500 italic">{emp.name} (Inactivo)</td>
                     <td colSpan={6} className="p-4 text-center text-sm text-gray-400">
                        Usuario inactivo - Actívelo para editar datos
                     </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => onToggleActive(emp.id)}
                        className="p-2 text-frida-blue hover:bg-indigo-50 rounded-full transition-colors"
                        title="Activar"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                       <button
                        onClick={() => onRemoveEmployee(emp.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar"
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
                  <td className="p-4 text-right">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-gray-400 text-xs pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1.00"
                        value={emp.overtimePay}
                        onFocus={handleFocus}
                        onChange={(e) => onUpdateEmployee(emp.id, 'overtimePay', parseFloat(e.target.value) || 0)}
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
                      title="Desactivar"
                    >
                      <EyeOff className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onRemoveEmployee(emp.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar"
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
              <td className="p-4 text-frida-teal font-serif text-lg">TOTALES</td>
              <td className="p-4 text-right">-</td>
              <td className="p-4 text-right">{totals.totalHours.toFixed(1)}</td>
              <td className="p-4 text-right">${totals.totalBasePay.toFixed(2)}</td>
              <td className="p-4 text-right">${totals.totalTips.toFixed(2)}</td>
              <td className="p-4 text-right">${totals.totalOvertime.toFixed(2)}</td>
              <td className="p-4 text-right text-frida-pink text-xl">${totals.grandTotal.toFixed(2)}</td>
              <td className="p-4"></td>
            </tr>
            {/* Averages Row */}
            <tr className="bg-gray-50 text-sm text-gray-600">
              <td className="p-4 font-serif italic">Promedio (Average)</td>
              <td className="p-4 text-right">${totals.avgWage.toFixed(2)}</td>
              <td className="p-4 text-right">
                {employees.filter(e => e.isActive).length > 0 
                  ? (totals.totalHours / employees.filter(e => e.isActive).length).toFixed(1) 
                  : 0}
              </td>
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
                  ? (totals.totalOvertime / employees.filter(e => e.isActive).length).toFixed(2) 
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