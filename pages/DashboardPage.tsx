import React, { useState } from 'react';
import { useEmployees } from '../contexts/EmployeeContext';
import SummaryCards from '../components/SummaryCards';
import PayrollTable from '../components/PayrollTable';
import { Calendar, UserPlus, Save, RotateCcw } from 'lucide-react';
import { TimeFrame } from '../types';

const DashboardPage: React.FC = () => {
    const {
        employees,
        timeFrame,
        totals,
        setTimeFrame,
        addEmployee,
        updateEmployee,
        toggleActive,
        removeEmployee,
        resetData
    } = useEmployees();

    const [newEmpName, setNewEmpName] = useState('');

    // Requirement: Only show active employees in Dashboard
    const activeEmployees = employees.filter(e => e.isActive);

    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmpName.trim()) return;
        addEmployee(newEmpName);
        setNewEmpName('');
    };

    const handleReset = () => {
        if (window.confirm('Do you want to reset all data to defaults?')) {
            resetData();
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-orange-100">

                {/* Timeframe Selector */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
                    <div className="px-3 text-gray-500 font-bold flex items-center gap-2 whitespace-nowrap">
                        <Calendar className="w-4 h-4" /> Period:
                    </div>
                    {(['day', 'week', 'biweekly', 'month', 'year'] as TimeFrame[]).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeFrame(tf)}
                            className={`px-4 py-2 rounded-md capitalize font-bold text-sm transition-all whitespace-nowrap ${timeFrame === tf
                                    ? 'bg-white text-frida-teal shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tf === 'biweekly' ? '2 Weeks' : tf}
                        </button>
                    ))}
                </div>

                {/* Quick Add Employee */}
                <form onSubmit={handleAddEmployee} className="flex w-full md:w-auto gap-2">
                    <input
                        type="text"
                        placeholder="Name..."
                        value={newEmpName}
                        onChange={(e) => setNewEmpName(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-frida-orange focus:border-transparent outline-none flex-grow min-w-[200px]"
                    />
                    <button
                        type="submit"
                        disabled={!newEmpName.trim()}
                        className="bg-frida-orange hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors shadow-sm"
                    >
                        <UserPlus className="w-6 h-6" />
                    </button>
                </form>
            </div>

            <SummaryCards totals={totals} activeCount={activeEmployees.length} />

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-frida-teal font-bold flex items-center gap-2">
                        Payroll: <span className="text-frida-pink capitalize">{timeFrame === 'biweekly' ? '2 Weeks' : timeFrame}</span>
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Save className="w-3 h-3" /> Saved locally
                    </p>
                </div>

                <button
                    onClick={handleReset}
                    className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors self-end sm:self-auto"
                >
                    <RotateCcw className="w-4 h-4" /> Reset Data
                </button>
            </div>

            <PayrollTable
                employees={activeEmployees}
                totals={totals}
                onUpdateEmployee={updateEmployee}
                onToggleActive={toggleActive}
                onRemoveEmployee={removeEmployee}
            />
        </>
    );
};

export default DashboardPage;
