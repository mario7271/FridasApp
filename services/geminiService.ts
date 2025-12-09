import { GoogleGenAI } from "@google/genai";
import { Employee, TimeFrame } from "../types";

const getAiClient = () => {
    const apiKey = (import.meta as any).env?.GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing. AI features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generatePayrollInsights = async (employees: Employee[], timeFrame: TimeFrame): Promise<string> => {
    const ai = getAiClient();

    if (!ai) {
        return "⚠️ No se ha configurado la API Key de Gemini. Agrega GEMINI_API_KEY al archivo .env";
    }

    const activeEmployees = employees.filter(e => e.isActive);

    // Format data for the model
    const payrollData = activeEmployees.map(e => {
        const basePay = e.hourlyWage * e.hoursWorked;
        const total = basePay + e.overtimePay + e.tips;
        return `${e.name}: Wages $${basePay.toFixed(2)}, Tips $${e.tips.toFixed(2)}, Overtime $${e.overtimePay.toFixed(2)}, Total $${total.toFixed(2)}`;
    }).join('\n');

    const prompt = `
    Act as a financial manager for a Mexican restaurant called "Frida's".
    Analyze the following payroll data for the time frame: ${timeFrame}.
    
    Data:
    ${payrollData}

    Please provide a concise, friendly executive summary in Spanish (Mexican dialect).
    1. Highlight the total labor cost.
    2. Identify who earned the most tips.
    3. Point out any anomalies (like high overtime).
    4. Give a brief motivating quote inspired by Frida Kahlo.
    
    Format the response using Markdown.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "No se pudo generar el reporte en este momento.";
    } catch (error) {
        console.error("Error generating insights:", error);
        return "Ocurrió un error al consultar a Frida. Por favor intenta de nuevo.";
    }
};