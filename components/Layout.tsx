import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Users, LayoutDashboard, FileText, Menu, X, ChevronDown, Store, LogOut } from 'lucide-react';
import FridaAssistant from './FridaAssistant';
import { useEmployees } from '../contexts/EmployeeContext';
import { useRestaurant } from '../contexts/RestaurantContext';

const themeColors: Record<string, string> = {
    rose: 'bg-rose-600',
    amber: 'bg-amber-600',
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    teal: 'bg-teal-700'
};

const Layout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isRestaurantMenuOpen, setIsRestaurantMenuOpen] = useState(false);
    const { employees, timeFrame } = useEmployees();
    const { currentRestaurant, restaurants, setRestaurant } = useRestaurant();
    const { logout } = useAuth();
    const location = useLocation();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // Dynamic theme color
    const navbarColor = currentRestaurant?.themeColor && themeColors[currentRestaurant.themeColor]
        ? themeColors[currentRestaurant.themeColor]
        : 'bg-frida-teal';

    return (
        <div className="min-h-screen pb-20 bg-frida-cream">
            {/* Navbar */}
            <nav className={`${navbarColor} shadow-lg sticky top-0 z-40 transition-all duration-500`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white font-bold text-xl font-serif shadow-md">
                                {currentRestaurant ? currentRestaurant.name.charAt(0) : 'F'}
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsRestaurantMenuOpen(!isRestaurantMenuOpen)}
                                    className="flex items-center gap-2 text-white text-lg md:text-xl font-serif font-bold tracking-wide hover:opacity-90 transition"
                                >
                                    {currentRestaurant ? currentRestaurant.name : "Frida's Payroll"}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isRestaurantMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Restaurant Dropdown */}
                                {isRestaurantMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {restaurants.map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setRestaurant(r.id);
                                                    setIsRestaurantMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors ${currentRestaurant?.id === r.id ? 'bg-frida-pink/10 text-frida-pink font-bold' : 'text-gray-700'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${themeColors[r.themeColor] || 'bg-gray-400'}`} />
                                                {r.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}`}
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/employees"
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Employees
                            </NavLink>
                            <NavLink
                                to="/reports"
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}`}
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

                            <button
                                onClick={() => logout()}
                                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
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

                            <button
                                onClick={() => {
                                    logout();
                                    closeMobileMenu();
                                }}
                                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-200 hover:bg-teal-700 mt-2"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
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
