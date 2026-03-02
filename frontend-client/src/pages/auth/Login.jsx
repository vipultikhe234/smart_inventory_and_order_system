import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../services/authService';
import { loginSuccess } from '../../features/authSlice';
import { addToCart } from '../../features/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, InputAdornment, Divider, Alert
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const resp = await loginUser(formData);
            dispatch(loginSuccess({ token: resp.token, role: resp.role || 'ROLE_CUSTOMER', username: formData.username }));
            if (resp.role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard');
            } else {
                const pending = sessionStorage.getItem('pendingCartItem');
                if (pending) {
                    dispatch(addToCart(JSON.parse(pending)));
                    sessionStorage.removeItem('pendingCartItem');
                    navigate('/cart');
                } else {
                    navigate('/');
                }
            }
        } catch {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', bgcolor: '#0d0d14',
            display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
        }}>
            {/* Left Panel — Branding */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#0f0f1a',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                p: 6
            }}>
                <Box>
                    <Typography fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
                        SMART<span style={{ color: '#a78bfa' }}>STORE</span>
                    </Typography>
                </Box>
                <Box>
                    {/* Feature bullets */}
                    {[
                        { icon: '⚡', text: 'Real-time inventory tracking' },
                        { icon: '🔒', text: 'Secure payments via Stripe' },
                        { icon: '📦', text: 'Order history & tracking' },
                        { icon: '🛒', text: 'Smart cart management' },
                    ].map((f) => (
                        <Box key={f.text} display="flex" alignItems="center" gap={2} mb={3}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '6px',
                                bgcolor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                            }}>
                                {f.icon}
                            </Box>
                            <Typography sx={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{f.text}</Typography>
                        </Box>
                    ))}
                </Box>
                <Typography sx={{ color: '#1e293b', fontSize: '0.78rem' }}>
                    © 2025 SmartStore Inc.
                </Typography>
            </Box>

            {/* Right Panel — Form */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: { xs: 4, md: 8 }
            }}>
                <Box sx={{ width: '100%', maxWidth: 380 }} className="animate-in">
                    {/* Mobile logo */}
                    <Typography fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', fontSize: '1.1rem', mb: 8, display: { md: 'none' } }}>
                        SMART<span style={{ color: '#a78bfa' }}>STORE</span>
                    </Typography>

                    <Box mb={7}>
                        <Typography variant="h4" fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.03em', mb: 1 }}>
                            Welcome back
                        </Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>
                            Sign in to your account to continue
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box mb={2.5}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', mb: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Username
                            </Typography>
                            <TextField
                                fullWidth required size="small"
                                placeholder="your_username"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 17, color: '#334155' }} /></InputAdornment>
                                }}
                            />
                        </Box>
                        <Box mb={4}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', mb: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Password
                            </Typography>
                            <TextField
                                fullWidth required size="small" type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 17, color: '#334155' }} /></InputAdornment>
                                }}
                            />
                        </Box>

                        <Button
                            fullWidth type="submit" variant="contained" color="primary"
                            disabled={loading} size="large"
                            endIcon={<KeyboardArrowRightIcon />}
                            sx={{ py: 1.4, fontSize: '0.9rem', letterSpacing: '-0.01em', fontWeight: 700 }}
                        >
                            {loading ? 'Signing in...' : 'Continue'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Typography sx={{ color: '#334155', fontSize: '0.78rem', px: 2 }}>OR</Typography>
                    </Divider>

                    <Box sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.015)' }}>
                        <Typography sx={{ color: '#475569', fontSize: '0.875rem', mb: 0 }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                                Create one for free →
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
