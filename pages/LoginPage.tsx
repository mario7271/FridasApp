import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/');
        } else {
            setError('Contraseña incorrecta');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-frida-cream flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-4 border-frida-pink/20">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-frida-teal text-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-frida-yellow shadow-lg">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-gray-800">Frida's Payroll</h1>
                    <p className="text-gray-500">Acceso Restringido</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-frida-pink focus:border-transparent outline-none transition text-center text-lg tracking-widest"
                        />
                        {error && <p className="text-red-500 text-sm mt-2 text-center font-bold">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-frida-pink hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md"
                    >
                        Entrar
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-8">
                    Solo personal autorizado
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
