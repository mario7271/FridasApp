import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Transform "nombre.apellido" to email
            // If user enters full email, use it. Otherwise append domain.
            const email = username.includes('@')
                ? username
                : `${username.toLowerCase()}@fridas.com`;

            const { error } = await login(email, password);

            if (error) {
                // Determine error message
                if (error.message.includes('Invalid login')) {
                    setError('Incorrect username or password');
                } else {
                    setError(error.message);
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
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
                    <p className="text-gray-500">Secure Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Username (firstname.lastname)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-frida-pink focus:border-transparent outline-none transition text-center text-lg"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-frida-pink focus:border-transparent outline-none transition text-center text-lg"
                            required
                        />
                        {error && <p className="text-red-500 text-sm mt-2 text-center font-bold">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-frida-pink hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Authenticating...' : 'Enter'}
                    </button>
                </form>                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Format: firstname.lastname</p>
                    <p>Default Domain: @fridas.com</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
