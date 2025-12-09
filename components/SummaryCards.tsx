import React from 'react';
import { PayrollTotals } from '../types';
import { DollarSign, Clock, TrendingUp, Users } from 'lucide-react';

interface SummaryCardsProps {
    totals: PayrollTotals;
    activeCount: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totals, activeCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-l-4 border-frida-pink shadow-lg rounded-r-lg p-4 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 font-sans text-sm font-bold uppercase">Total Paid</p>
                    <p className="text-2xl font-serif text-frida-pink font-bold">${totals.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-pink-100 p-3 rounded-full">
                    <DollarSign className="text-frida-pink w-6 h-6" />
                </div>
            </div>

            <div className="bg-white border-l-4 border-frida-teal shadow-lg rounded-r-lg p-4 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 font-sans text-sm font-bold uppercase">Total Hours</p>
                    <p className="text-2xl font-serif text-frida-teal font-bold">{totals.totalHours.toFixed(1)} hrs</p>
                </div>
                <div className="bg-teal-100 p-3 rounded-full">
                    <Clock className="text-frida-teal w-6 h-6" />
                </div>
            </div>

            <div className="bg-white border-l-4 border-frida-orange shadow-lg rounded-r-lg p-4 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 font-sans text-sm font-bold uppercase">Tips</p>
                    <p className="text-2xl font-serif text-frida-orange font-bold">${totals.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                    <TrendingUp className="text-frida-orange w-6 h-6" />
                </div>
            </div>

            <div className="bg-white border-l-4 border-frida-blue shadow-lg rounded-r-lg p-4 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 font-sans text-sm font-bold uppercase">Active Employees</p>
                    <p className="text-2xl font-serif text-frida-blue font-bold">{activeCount}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                    <Users className="text-frida-blue w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;