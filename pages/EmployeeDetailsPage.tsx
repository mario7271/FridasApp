import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployees } from '../contexts/EmployeeContext';
import { Trash2, DollarSign, Clock, Save, ArrowLeft, Briefcase } from 'lucide-react';
import { Employee } from '../types';

const EmployeeDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { employees, updateEmployee, toggleActive, removeEmployee, addEmployee } = useEmployees();

    const isNew = id === 'new';
    const existingEmployee = employees.find(e => e.id === id);

    // Local state for form
    const [formData, setFormData] = useState<Partial<Employee>>({
        name: '',
        hourlyWage: 0,
        hoursWorked: 0,
        tips: 0,
        overtimePay: 0,
        isActive: true
    });

    useEffect(() => {
        if (existingEmployee) {
            setFormData(existingEmployee);
        }
    }, [existingEmployee]);

    const handleChange = (field: keyof Employee, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculateTotal = () => {
        const wage = Number(formData.hourlyWage) || 0;
        const hours = Number(formData.hoursWorked) || 0;
        const tips = Number(formData.tips) || 0;
        const overtime = Number(formData.overtimePay) || 0;

        const base = wage * hours;
        return {
            base,
            total: base + tips + overtime
        };
    };

    const { total } = calculateTotal();

    const handleSave = () => {
        if (!formData.name) return alert('El nombre es requerido');

        if (isNew) {
            addEmployee(formData.name, Number(formData.hourlyWage));
            // Note context addEmployee is simple, in real app we'd pass all fields or have a more robust update
            // For now, we add then redirect or we might need to update the context to accept full object
            navigate('/employees');
        } else {
            // Update all fields
            if (id) {
                updateEmployee(id, 'name', formData.name!);
                updateEmployee(id, 'hourlyWage', Number(formData.hourlyWage));
                updateEmployee(id, 'hoursWorked', Number(formData.hoursWorked));
                updateEmployee(id, 'tips', Number(formData.tips));
                updateEmployee(id, 'overtimePay', Number(formData.overtimePay));
                navigate('/employees');
            }
        }
    };

    const handleDelete = () => {
        if (id && window.confirm('¿Borrar empleado permanentemente?')) {
            removeEmployee(id);
            navigate('/employees');
        }
    }

    if (!existingEmployee && !isNew) {
        return <div>Empleado no encontrado</div>;
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-frida-pink/20">
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-200 p-2 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{isNew ? 'Agregar Empleado' : 'Detalles de Empleado'}</h1>
                </div>
                <button onClick={handleSave} className="text-frida-orange font-bold hover:text-orange-700 transition">
                    {isNew ? 'Crear' : 'Guardar'}
                </button>
            </div>

            <div className="p-8">
                {/* Profile Header */}
                {!isNew && (
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <img src={`https://ui-avatars.com/api/?name=${formData.name}&background=0D8ABC&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500">Colaborador</span>
                            </div>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${formData.isActive ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-600'}`}>
                                {formData.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-6">

                    {/* Name validation input for new employees */}
                    <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-frida-pink/50 outline-none transition font-medium text-lg"
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-lg mb-4">Cálculo de Nómina</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Salario por Hora</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.hourlyWage}
                                        onChange={e => handleChange('hourlyWage', e.target.value)}
                                        className="w-full p-3 pl-8 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-frida-teal/20 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Horas Trabajadas</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.hoursWorked}
                                        onChange={e => handleChange('hoursWorked', e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-frida-teal/20 outline-none font-medium"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">hrs</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Propinas</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.tips}
                                        onChange={e => handleChange('tips', e.target.value)}
                                        className="w-full p-3 pl-8 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-frida-teal/20 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Pago Horas Extra</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.overtimePay}
                                        onChange={e => handleChange('overtimePay', e.target.value)}
                                        className="w-full p-3 pl-8 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-frida-teal/20 outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Totals Preview */}
                    <div className="bg-frida-cream/30 p-4 rounded-xl flex justify-between items-center border border-orange-100">
                        <div className="text-gray-600 font-medium">Total con Propina</div>
                        <div className="text-2xl font-bold text-frida-orange">${total.toFixed(2)}</div>
                    </div>

                    {/* Actions */}
                    {!isNew && (
                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <h3 className="font-bold text-lg">Acciones</h3>

                            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                                <span className="text-gray-700 font-medium">Estado Activo</span>
                                <button
                                    onClick={() => id && toggleActive(id)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <button
                                onClick={handleDelete}
                                className="w-full p-4 flex items-center justify-between text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100"
                            >
                                <span>Remover Empleado (Permanente)</span>
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailsPage;
