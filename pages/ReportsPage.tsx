import React, { useRef } from 'react';
import { useEmployees } from '../contexts/EmployeeContext';
import { Printer, Share2 } from 'lucide-react';

const ReportsPage: React.FC = () => {
    const { employees, timeFrame, totals } = useEmployees();
    const summaryRef = useRef<HTMLDivElement>(null);

    // Requirement: Hide inactive employees in reports
    const activeEmployees = employees.filter(e => e.isActive).sort((a, b) => a.name.localeCompare(b.name));

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Frida's Payroll Report",
                    text: `Payroll Report for period: ${timeFrame}. Total: $${totals.grandTotal.toFixed(2)}`,
                    url: window.location.href
                });
            } catch (err) {
                console.error("Error sharing", err);
            }
        } else {
            alert("Sharing not supported on this browser. Use Print/PDF instead.");
        }
    };

    return (
        <div className="bg-white rounded-none md:rounded-xl shadow-none md:shadow-xl overflow-hidden min-h-screen md:min-h-0 print:shadow-none print:w-full" ref={summaryRef}>

            {/* Controls - Hide on Print */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center print:hidden">
                <h1 className="text-xl font-bold text-gray-800">Payroll Report</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                        <Printer className="w-4 h-4" /> Print / PDF
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div className="p-8 print:p-0">
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-serif font-bold uppercase tracking-widest">Frida's Payroll</h1>
                    <div className="mt-2 flex justify-between items-end">
                        <span className="font-bold text-lg">Period: <span className="capitalize">{timeFrame}</span></span>
                        <span className="text-sm">Generated: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-black text-sm">
                        <thead>
                            <tr className="bg-gray-100 print:bg-gray-200 text-black font-bold uppercase text-xs">
                                <th className="border border-black p-2">Name</th>
                                <th className="border border-black p-2 text-right">Wage/Hr</th>
                                <th className="border border-black p-2 text-center">Hours</th>
                                <th className="border border-black p-2 text-center">OT Hours</th>
                                <th className="border border-black p-2 text-right">Total Earn (Base)</th>
                                <th className="border border-black p-2 text-right">Tips</th>
                                <th className="border border-black p-2 text-right">Overtime Pay</th>
                                <th className="border border-black p-2 text-right bg-black text-white print:bg-gray-300 print:text-black">Total w/ Tips</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeEmployees.map((emp, index) => {
                                const baseEarn = emp.hoursWorked * emp.hourlyWage;
                                const otPay = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
                                const totalWithTip = baseEarn + (emp.tips || 0) + otPay;

                                return (
                                    <tr key={emp.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border border-black p-2 font-medium">
                                            {emp.name}
                                        </td>
                                        <td className="border border-black p-2 text-right">${emp.hourlyWage.toFixed(2)}</td>
                                        <td className="border border-black p-2 text-center">{emp.hoursWorked}</td>
                                        <td className="border border-black p-2 text-center">{emp.overtimeHours || 0}</td>
                                        <td className="border border-black p-2 text-right">${baseEarn.toFixed(2)}</td>
                                        <td className="border border-black p-2 text-right">${(emp.tips || 0).toFixed(2)}</td>
                                        <td className="border border-black p-2 text-right">${otPay.toFixed(2)}</td>
                                        <td className="border border-black p-2 text-right font-bold">${totalWithTip.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-black text-white print:bg-black print:text-white font-bold">
                                <td className="border border-black p-2">TOTALS</td>
                                <td className="border border-black p-2 text-right">-</td>
                                <td className="border border-black p-2 text-center">{totals.totalHours.toFixed(1)}</td>
                                <td className="border border-black p-2 text-center">-</td>
                                <td className="border border-black p-2 text-right">${totals.totalBasePay.toFixed(2)}</td>
                                <td className="border border-black p-2 text-right">${totals.totalTips.toFixed(2)}</td>
                                <td className="border border-black p-2 text-right">${totals.totalOvertimePay.toFixed(2)}</td>
                                <td className="border border-black p-2 text-right text-lg">${totals.grandTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; }
          nav, button { display: none !important; }
        }
      `}</style>
        </div>
    );
};

export default ReportsPage;
