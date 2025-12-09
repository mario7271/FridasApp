import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Sparkles, Users, LayoutDashboard, FileText, Menu, X } from 'lucide-react';
import FridaAssistant from './FridaAssistant';
import { useEmployees } from '../contexts/EmployeeContext';

const Layout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const { employees, timeFrame } = useEmployees();
    const location = useLocation();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen pb-20 bg-frida-cream">
            {/* Navbar */}
            <nav className="bg-frida-teal shadow-lg sticky top-0 z-40 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-frida-pink border-2 border-frida-yellow flex items-center justify-center text-white font-bold text-xl font-serif shadow-md">
                                F
                            </div>
                            <h1 className="text-white text-2xl md:text-3xl font-serif font-bold tracking-wide">
                                Frida's Payroll
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white' : 'text-teal-100 hover:bg-teal-600'}`}
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/employees"
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white' : 'text-teal-100 hover:bg-teal-600'}`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Employees
                            </NavLink>
                            <NavLink
                                to="/reports"
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white' : 'text-teal-100 hover:bg-teal-600'}`}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Reports
                            </NavLink>

                            <div className="h-6 w-px bg-teal-600 mx-2"></div>

                            <button
                                onClick={() => setIsAssistantOpen(true)}
                                className="flex items-center gap-2 bg-frida-pink hover:bg-pink-700 text-white px-4 py-2 rounded-full font-bold transition-all shadow-md transform hover:scale-105 active:scale-95 text-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Ask AI</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-teal-100 hover:text-white hover:bg-teal-600 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-teal-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavLink
                                to="/"
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-teal-900 text-white' : 'text-teal-100 hover:bg-teal-700'}`}
                            >
                                <LayoutDashboard className="w-5 h-5 mr-3" />
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/employees"
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-teal-900 text-white' : 'text-teal-100 hover:bg-teal-700'}`}
                            >
                                <Users className="w-5 h-5 mr-3" />
                                Employees
                            </NavLink>
                            <NavLink
                                to="/reports"
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-teal-900 text-white' : 'text-teal-100 hover:bg-teal-700'}`}
                            >
                                <FileText className="w-5 h-5 mr-3" />
                                Reports
                            </NavLink>
                            <button
                                onClick={() => {
                                    setIsAssistantOpen(true);
                                    closeMobileMenu();
                                }}
                                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-frida-pink hover:bg-teal-700 mt-4"
                            >
                                <Sparkles className="w-5 h-5 mr-3" />
                                Ask Frida AI
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>

            <FridaAssistant
                employees={employees}
                timeFrame={timeFrame}
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
            />
        </div>
    );
};

export default Layout;
