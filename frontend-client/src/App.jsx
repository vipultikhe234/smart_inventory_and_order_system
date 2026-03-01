import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from './features/cartSlice';
import Home from './pages/client/Home';
import Cart from './pages/client/Cart';
import MyOrders from './pages/client/MyOrders';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock Protected Route setup
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, userRole } = useSelector((state) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (requiredRole && requiredRole !== userRole) return <Navigate to="/" />;

    return children;
};

const App = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [isAuthenticated, dispatch]);

    return (
        <Router>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <Routes>
                {/* Public / Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={
                    <ProtectedRoute>
                        <MyOrders />
                    </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<h2>404 - Not Found</h2>} />
            </Routes>
        </Router>
    );
};

export default App;
