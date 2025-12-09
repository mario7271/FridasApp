
import React, { useRef, useState } from 'react';
import { useEmployees } from '../contexts/EmployeeContext';
import { Printer, Share2, Loader } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportsPage: React.FC = () => {
    const { employees, timeFrame, totals } = useEmployees();
    const summaryRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Requirement: Hide inactive employees in reports
    const activeEmployees = employees.filter(e => e.isActive).sort((a, b) => a.name.localeCompare(b.name));

    const handleShare = async () => {
        if (!summaryRef.current) return;

        setIsGenerating(true);
        try {
            // FIX: Force desktop layout for PDF even on mobile
            // Strategy: Clone the node, force a fixed width (e.g. 1200px), append to body offscreen
            const originalElement = summaryRef.current;
            const clone = originalElement.cloneNode(true) as HTMLElement;

            // Apply styles to force desktop view
            clone.style.width = '1200px';
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.left = '-9999px';
            clone.style.backgroundColor = 'white'; // Ensure background

            // We need to ensure Tailwind classes are respected. 
            // Appending to body should generally inherit global styles if they are not scoped.
            // However, spacing might differ if media queries are based on viewport.
            // Since we set width to 1200px, container queries inside might not trigger unless we use viewport simulation,
            // but for a simple table it should be enough to just force the container width.
            document.body.appendChild(clone);

            // 1. Capture the report as an image
            const canvas = await html2canvas(clone, {
                scale: 2, // Retain high quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200 // Trick html2canvas to think window is wide
            } as any);

            // Cleanup
            document.body.removeChild(clone);

            // 2. Convert to PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const fileName = "Fridas_Payroll_" + new Date().toISOString().split('T')[0] + ".pdf";

            // 3. Share or Download
            // Create a blob for sharing
            const pdfBlob = pdf.output('blob');
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Frida's Payroll Report",
                    text: "Here is the payroll report."
                });
            } else {
                // Fallback: Just download it
                pdf.save(fileName);
                alert("PDF Downloaded! You can now attach it to an email or message.");
            }

        } catch (err) {
            console.error("Error generating/sharing PDF", err);
            alert("Could not generate PDF. Please use the Print button instead.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white rounded-none md:rounded-xl shadow-none md:shadow-xl overflow-hidden min-h-screen md:min-h-0 print:shadow-none print:w-full">

            {/* Controls - Hide on Print */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center print:hidden">
                <h1 className="text-xl font-bold text-gray-800">Payroll Report (Active Employees)</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleShare}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        {isGenerating ? 'Generating...' : 'Share PDF'}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* Report Content - Ref needed for capture */}
            <div className="p-8 print:p-0" ref={summaryRef}>
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
                                <th className="border border-black p-2 text-right">Base Earn</th>
                                <th className="border border-black p-2 text-right">Tips</th>
                                <th className="border border-black p-2 text-right bg-black text-white print:bg-gray-300 print:text-black">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeEmployees.map((emp, index) => {
                                const regularPay = emp.hoursWorked * emp.hourlyWage;
                                const otPay = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
                                const baseEarn = regularPay + otPay;
                                const total = baseEarn + (emp.tips || 0);

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
                                        <td className="border border-black p-2 text-right font-bold">${total.toFixed(2)}</td>
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
                                <td className="border border-black p-2 text-right text-lg">${totals.grandTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <style>{`
@media print {
    @page { size: landscape; margin: 10mm; }
          body { -webkit - print - color - adjust: exact; }
    nav, button { display: none!important; }
}
`}</style>
        </div>
    );
};

export default ReportsPage;
