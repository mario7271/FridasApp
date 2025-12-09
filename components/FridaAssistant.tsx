import React, { useState } from 'react';
import { generatePayrollInsights } from '../services/geminiService';
import { Employee, TimeFrame } from '../types';
import { Sparkles, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FridaAssistantProps {
  employees: Employee[];
  timeFrame: TimeFrame;
  isOpen: boolean;
  onClose: () => void;
}

const FridaAssistant: React.FC<FridaAssistantProps> = ({ employees, timeFrame, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleConsult = async () => {
    setLoading(true);
    setReport(null);
    try {
      const result = await generatePayrollInsights(employees, timeFrame);
      setReport(result);
    } catch (e) {
      setReport("Hubo un error al comunicarse con el espíritu de las finanzas.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-frida-pink flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-frida-pink p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             {/* Simple flower icon placeholder */}
            <div className="w-8 h-8 rounded-full bg-frida-yellow flex items-center justify-center text-frida-pink">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-serif font-bold">Consultar a Frida (AI)</h2>
          </div>
          <button onClick={onClose} className="hover:bg-pink-700 p-1 rounded transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-rose-50">
          {!report && !loading && (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-6 font-sans text-lg">
                ¿Quieres un resumen ejecutivo de tu nómina para este periodo de <strong>{timeFrame}</strong>?
              </p>
              <button
                onClick={handleConsult}
                className="bg-frida-teal text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles size={20} />
                Generar Reporte
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-frida-teal">
              <Loader2 className="animate-spin w-12 h-12 mb-4" />
              <p className="font-serif text-xl animate-pulse">Analizando los números...</p>
            </div>
          )}

          {report && (
            <div className="prose prose-pink max-w-none font-sans text-gray-800">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {report && (
            <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
                 <button
                onClick={handleConsult}
                className="text-frida-teal hover:text-teal-800 font-bold underline px-4 py-2 text-sm"
              >
                Regenerar
              </button>
                <button
                    onClick={onClose}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-bold"
                >
                    Cerrar
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FridaAssistant;