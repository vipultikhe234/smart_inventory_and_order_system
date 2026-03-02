import React, { useState } from 'react';
import { registerUser } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Divider, Alert,
    InputAdornment, Select, MenuItem, FormControl
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await registerUser(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{
                minHeight: '100vh', bgcolor: '#0d0d14',
                display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4
            }}>
                <Box textAlign="center" className="animate-in">
                    <Box sx={{
                        width: 60, height: 60, borderRadius: '6px',
                        bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3
                    }}>
                        <CheckCircleOutlineIcon sx={{ color: '#34d399', fontSize: 30 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', mb: 1 }}>
                        Account created
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>
                        Redirecting you to sign in...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh', bgcolor: '#0d0d14',
            display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
        }}>
            {/* Left branding */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column', justifyContent: 'space-between',
                bgcolor: '#0f0f1a', borderRight: '1px solid rgba(255,255,255,0.06)', p: 6
            }}>
                <Typography fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
                    SMART<span style={{ color: '#a78bfa' }}>STORE</span>
                </Typography>
                <Box>
                    <Typography variant="h3" fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.03em', mb: 2, lineHeight: 1.15 }}>
                        Start managing<br />
                        <span style={{ color: '#a78bfa' }}>inventory today</span>
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.8 }}>
                        Join thousands of businesses using SmartStore to track inventory, manage orders, and grow with confidence.
                    </Typography>
                </Box>
                <Typography sx={{ color: '#1e293b', fontSize: '0.78rem' }}>© 2025 SmartStore Inc.</Typography>
            </Box>

            {/* Right form */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 8 } }}>
                <Box sx={{ width: '100%', maxWidth: 400 }} className="animate-in">
                    <Typography fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', fontSize: '1.1rem', mb: 8, display: { md: 'none' } }}>
                        SMART<span style={{ color: '#a78bfa' }}>STORE</span>
                    </Typography>

                    <Box mb={6}>
                        <Typography variant="h4" fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.03em', mb: 1 }}>
                            Create account
                        </Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>
                            Fill in a few details to get started
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        {[
                            { label: 'Username', key: 'username', type: 'text', placeholder: 'your_username', icon: <PersonOutlineIcon sx={{ fontSize: 17, color: '#334155' }} /> },
                            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com', icon: <EmailOutlinedIcon sx={{ fontSize: 17, color: '#334155' }} /> },
                            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••', icon: <LockOutlinedIcon sx={{ fontSize: 17, color: '#334155' }} /> },
                        ].map((f) => (
                            <Box mb={2.5} key={f.key}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', mb: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                    {f.label}
                                </Typography>
                                <TextField
                                    fullWidth required size="small" type={f.type}
                                    placeholder={f.placeholder}
                                    value={formData[f.key]}
                                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                    InputProps={{ startAdornment: <InputAdornment position="start">{f.icon}</InputAdornment> }}
                                />
                            </Box>
                        ))}

                        <Box mb={4}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', mb: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Account Type
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.03)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } }}
                                >
                                    <MenuItem value="CUSTOMER">Customer</MenuItem>
                                    <MenuItem value="MANAGER">Manager</MenuItem>
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Button
                            fullWidth type="submit" variant="contained" color="primary"
                            disabled={loading} size="large"
                            endIcon={<KeyboardArrowRightIcon />}
                            sx={{ py: 1.4, fontWeight: 700, letterSpacing: '-0.01em' }}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Typography sx={{ color: '#334155', fontSize: '0.78rem', px: 2 }}>OR</Typography>
                    </Divider>

                    <Box sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.015)' }}>
                        <Typography sx={{ color: '#475569', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                                Sign in →
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Register;
