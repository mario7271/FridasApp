import React, { useState } from 'react';
import { useEmployees } from '../contexts/EmployeeContext';
import { Search, Plus, MoreVertical, Trash2, Eye, EyeOff, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const EmployeesPage: React.FC = () => {
    const { employees, toggleActive, removeEmployee } = useEmployees();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h1 className="text-xl font-bold font-sans flex-grow text-center mr-10">Lista de Empleados</h1>
            </div>

            {/* Search */}
            <div className="px-6 py-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar empleado"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-frida-pink/20 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-24">
                <div className="space-y-3">
                    {filteredEmployees.map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${emp.isActive ? 'bg-frida-teal' : 'bg-gray-300'}`}>
                                    {emp.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-gray-800 ${!emp.isActive && 'text-gray-400'}`}>{emp.name}</h3>
                                    <p className="text-xs text-gray-500">{emp.isActive ? 'Activo' : 'Inactivo'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Link
                                    to={`/employees/${emp.id}`}
                                    className="p-2 text-gray-400 hover:text-frida-teal hover:bg-teal-50 rounded-full transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>
                                <button onClick={() => toggleActive(emp.id)} className="p-2 text-gray-400 hover:text-frida-blue hover:bg-blue-50 rounded-full">
                                    {emp.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                                <button onClick={() => {
                                    if (window.confirm('¿Eliminar empleado?')) removeEmployee(emp.id)
                                }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            No se encontraron empleados.
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Add Button */}
            <div className="absolute bottom-8 right-8">
                <Link to="/employees/new" className="w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-green-600 transition-transform hover:scale-110 active:scale-95">
                    <Plus className="w-8 h-8" />
                </Link>
            </div>
        </div>
    );
};

export default EmployeesPage;
