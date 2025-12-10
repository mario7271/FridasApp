
import { useRef, useState, useMemo } from 'react';
import { useEmployees } from '../contexts/EmployeeContext';
import { Printer, Share2, Loader, Receipt, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { calculateTaxes, TaxCalculationResult } from '../services/TaxCalculator';

const ReportsPage: React.FC = () => {
    const { employees, timeFrame, totals, calculateGrossWages } = useEmployees();
    const summaryRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'payroll' | 'tax'>('payroll');
    const [includeFUTA, setIncludeFUTA] = useState(false);

    // Requirement: Hide inactive employees in reports
    const activeEmployees = employees.filter(e => e.isActive).sort((a, b) => a.name.localeCompare(b.name));

    // Calculate Tax Data
    const taxData = useMemo(() => {
        return activeEmployees.map(emp => {
            const gross = calculateGrossWages(emp);
            // Map timeframe to payPeriod string for calculator
            // Simplification: treating everything as 'biweekly' if that's the view, or just annualizing based on the view multiplier?
            // The calculator takes 'weekly', 'biweekly' etc.
            // Our context 'timeFrame' is 'day' | 'week' | 'biweekly' | 'month' | 'year'.
            // scaling is already done in 'employees' by context. 
            // So if 'week' is selected, emp.hoursWorked is 1 week worth.
            // The calculator uses Annualization. So we need to pass the correct frequency.

            let freq: any = 'biweekly'; // default
            if (timeFrame === 'week') freq = 'weekly';
            if (timeFrame === 'biweekly') freq = 'biweekly';
            if (timeFrame === 'month') freq = 'monthly';
            if (timeFrame === 'year') freq = 'annual';
            // Day? Not supported well by tax calc, fallback to weekly logic (annualize * 260?) 
            // or just assume weekly for estimation if day selected.

            return {
                ...emp,
                taxResult: calculateTaxes(emp, freq, gross, includeFUTA)
            };
        });
    }, [activeEmployees, timeFrame, includeFUTA, calculateGrossWages]);

    const taxTotals = useMemo(() => {
        return taxData.reduce((acc, curr) => ({
            totalDeposit: acc.totalDeposit + curr.taxResult.totalTaxLiability,
            totalEmployeeWithholding: acc.totalEmployeeWithholding + curr.taxResult.totalEmployeeWithholding,
            totalEmployerCost: acc.totalEmployerCost + curr.taxResult.totalEmployerCost
        }), { totalDeposit: 0, totalEmployeeWithholding: 0, totalEmployerCost: 0 });
    }, [taxData]);

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

            // Standard A4 Landscape width in mm is 297
            // We calculate the required height in mm to fit the entire image without cropping
            const pdfWidth = 297;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Initialize PDF with the exact dimensions needed for the content
            // We use 'portrait' conceptually because we are defining the [width, height] explicitly
            // and we want width to be 297mm.
            const pdf = new jsPDF({
                orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

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
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col gap-4 print:hidden">
                <div className="flex justify-between items-center">
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

                {/* Tab Switcher */}
                <div className="flex bg-gray-200 p-1 rounded-lg self-center mx-auto max-w-sm">
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'payroll' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        <FileText className="w-4 h-4" /> Payroll Report
                    </button>
                    <button
                        onClick={() => setActiveTab('tax')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'tax' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        <Receipt className="w-4 h-4" /> Tax Liability
                    </button>
                </div>

                {activeTab === 'tax' && (
                    <div className="flex items-center gap-2 justify-end">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={includeFUTA}
                                onChange={e => setIncludeFUTA(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            Include FUTA Estimate (0.6%)
                        </label>
                    </div>
                )}
            </div>

            {/* Content Switcher */}
            <div className="p-8 print:p-0" ref={summaryRef}>
                {activeTab === 'payroll' ? (
                    // --- EXISTING PAYROLL REPORT ---
                    <div>
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
                                    {/* --- FOH SECTION --- */}
                                    {activeEmployees.filter(e => (!e.role || e.role === 'FOH')).length > 0 && (
                                        <>
                                            <tr className="bg-gray-200">
                                                <td colSpan={7} className="p-2 font-bold uppercase tracking-widest text-center text-xs text-gray-600">Front of House (FOH)</td>
                                            </tr>
                                            {activeEmployees.filter(e => (!e.role || e.role === 'FOH')).map((emp, index) => {
                                                const regularPay = emp.hoursWorked * emp.hourlyWage;
                                                const otPay = (emp.overtimeHours || 0) * emp.hourlyWage * 1.5;
                                                const baseEarn = regularPay + otPay;
                                                const total = baseEarn + (emp.tips || 0);

                                                return (
                                                    <tr key={emp.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="border border-black p-2 font-medium">{emp.name}</td>
                                                        <td className="border border-black p-2 text-right">${emp.hourlyWage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="border border-black p-2 text-center">{emp.hoursWorked}</td>
                                                        <td className="border border-black p-2 text-center">{emp.overtimeHours || 0}</td>
                                                        <td className="border border-black p-2 text-right">${baseEarn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="border border-black p-2 text-right">${(emp.tips || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="border border-black p-2 text-right font-bold">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}

                                    {/* --- BOH SECTION --- */}
                                    {activeEmployees.filter(e => e.role === 'BOH').length > 0 && (
                                        <>
                                            <tr className="bg-gray-200">
                                                <td colSpan={7} className="p-2 font-bold uppercase tracking-widest text-center text-xs text-gray-600">Back of House (BOH)</td>
                                            </tr>
                                            {activeEmployees.filter(e => e.role === 'BOH').map((emp, index) => {
                                                const salary = emp.salary || 0;
                                                const tips = emp.tips || 0;
                                                const total = salary + tips;
                                                return (
                                                    <tr key={emp.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="border border-black p-2 font-medium">{emp.name}</td>
                                                        <td className="border border-black p-2 text-center text-gray-400" colSpan={3}>-</td>
                                                        <td className="border border-black p-2 text-right">${salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="border border-black p-2 text-right">${tips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="border border-black p-2 text-right font-bold">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-black text-white print:bg-black print:text-white font-bold">
                                        <td className="border border-black p-2">TOTALS</td>
                                        <td className="border border-black p-2 text-right">-</td>
                                        <td className="border border-black p-2 text-center">{totals.totalHours.toFixed(1)}</td>
                                        <td className="border border-black p-2 text-center">-</td>
                                        <td className="border border-black p-2 text-right">${totals.totalBasePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="border border-black p-2 text-right">${totals.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="border border-black p-2 text-right text-lg">${totals.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div >
                ) : (
                    // --- NEW TAX LIABILITY REPORT ---
                    <div>
                        <div className="text-center mb-8 border-b-2 border-indigo-900 pb-4">
                            <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-indigo-900">Estimated Fed. Tax Liability</h1>
                            <p className="text-gray-500 italic text-sm mt-1">Internal Use Only</p>
                            <div className="mt-4 flex justify-between items-end">
                                <span className="font-bold text-lg text-indigo-900">Period: <span className="capitalize">{timeFrame}</span></span>
                                <span className="text-sm">Generated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* 1. Header Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md border-b-4 border-indigo-500 print:bg-gray-100 print:text-black print:border-black">
                                <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Total Est. Deposit</h3>
                                <p className="text-3xl font-bold font-serif">
                                    ${taxTotals.totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] mt-2 opacity-60">Emp + Employer Liability</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 border-b-4 border-gray-400 print:border-black">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Withheld from Employees</h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    ${taxTotals.totalEmployeeWithholding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2">FIT + SS + Med (Employee Side)</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 border-b-4 border-orange-400 print:border-black">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Total Employer Cost</h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    ${taxTotals.totalEmployerCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2">SS Match + Med Match + FUTA</p>
                            </div>
                        </div>

                        {/* 2. Detailed Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-indigo-900 text-sm">
                                <thead>
                                    <tr className="bg-indigo-100 print:bg-gray-200 text-indigo-900 font-bold uppercase text-xs">
                                        <th className="border border-indigo-300 p-2">Name</th>
                                        <th className="border border-indigo-300 p-2 text-right">Gross Taxable</th>
                                        <th className="border border-indigo-300 p-2 text-right bg-indigo-50">Est. FIT</th>
                                        <th className="border border-indigo-300 p-2 text-right">Emp. FICA/Med</th>
                                        <th className="border border-indigo-300 p-2 text-right">Employer Cost</th>
                                        <th className="border border-indigo-300 p-2 text-right bg-indigo-900 text-white print:bg-gray-300 print:text-black">Total Tax Generated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxData.map((data, index) => {
                                        const res = data.taxResult;
                                        const empFica = res.ssEmployee + res.medEmployee;
                                        const employerCost = res.ssEmployer + res.medEmployer + res.futaEmployer;

                                        return (
                                            <tr key={data.id} className={index % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'}>
                                                <td className="border border-indigo-100 p-2 font-medium text-indigo-900">{data.name}</td>
                                                <td className="border border-indigo-100 p-2 text-right font-bold text-gray-700">
                                                    ${res.grossTaxablePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="border border-indigo-100 p-2 text-right bg-indigo-50 text-indigo-700 font-medium">
                                                    ${res.fedIncomeTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="border border-indigo-100 p-2 text-right text-gray-600">
                                                    ${empFica.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="border border-indigo-100 p-2 text-right text-gray-600">
                                                    ${employerCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="border border-indigo-100 p-2 text-right font-bold text-indigo-900">
                                                    ${res.totalTaxLiability.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-indigo-900 text-white print:bg-black print:text-white font-bold">
                                        <td className="border border-indigo-900 p-2">TOTALS</td>
                                        <td className="border border-indigo-900 p-2 text-right">
                                            ${taxData.reduce((acc, curr) => acc + curr.taxResult.grossTaxablePay, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="border border-indigo-900 p-2 text-right">
                                            ${taxData.reduce((acc, curr) => acc + curr.taxResult.fedIncomeTax, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="border border-indigo-900 p-2 text-right">
                                            ${taxData.reduce((acc, curr) => acc + (curr.taxResult.ssEmployee + curr.taxResult.medEmployee), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="border border-indigo-900 p-2 text-right">
                                            ${taxData.reduce((acc, curr) => acc + (curr.taxResult.ssEmployer + curr.taxResult.medEmployer + curr.taxResult.futaEmployer), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="border border-indigo-900 p-2 text-right text-lg">
                                            ${taxTotals.totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div className="mt-8 text-xs text-gray-500 border-t pt-4">
                                <p className="font-bold">Disclaimer:</p>
                                <p>This report is an estimate for cash flow planning purposes only. Final tax amounts are determined by the accountant/payroll processor based on exact filing statuses, pre-tax deductions, and YTD limits. FUTA estimates are based on current period gross and may not reflect annual caps.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div >
            <style>{`
@media print {
    @page { size: landscape; margin: 10mm; }
          body { -webkit - print - color - adjust: exact; }
    nav, button { display: none!important; }
}
`}</style>
        </div >
    );
};

export default ReportsPage;
