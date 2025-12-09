import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/RequireAuth';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <RestaurantProvider>
                <EmployeeProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />

                            <Route path="/" element={
                                <RequireAuth>
                                    <Layout />
                                </RequireAuth>
                            }>
                                <Route index element={<DashboardPage />} />
                                <Route path="employees" element={<EmployeesPage />} />
                                <Route path="employees/:id" element={<EmployeeDetailsPage />} />
                                <Route path="reports" element={<ReportsPage />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Router>
                </EmployeeProvider>
            </RestaurantProvider>
        </AuthProvider>
    );
};

export default App;