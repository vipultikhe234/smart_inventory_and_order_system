import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../services/authService';
import { loginSuccess } from '../../features/authSlice';
import { addToCart } from '../../features/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Card, CardContent, InputAdornment } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await loginUser(formData);
            dispatch(loginSuccess({
                token: resp.token,
                role: resp.role || 'ROLE_CUSTOMER', // defaulting for mock/test
                username: formData.username
            }));
            if (resp.role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard');
            } else {
                // Check for pending cart item from Home page
                const pendingItem = sessionStorage.getItem('pendingCartItem');
                if (pendingItem) {
                    dispatch(addToCart(JSON.parse(pendingItem)));
                    sessionStorage.removeItem('pendingCartItem');
                    navigate('/cart'); // Direct to cart to complete checkout
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError('Invalid username or password.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Card className="glass-panel" sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', mb: 2 }}>
                            <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Typography variant="h3" fontWeight="800" gutterBottom>Welcome Back</Typography>
                        <Typography color="text.secondary">Enter your credentials to access your store</Typography>
                    </Box>

                    {error && <Box mb={3} sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', textAlign: 'center' }}>{error}</Box>}

                    <form onSubmit={handleSubmit}>
                        <Box mb={3}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3 }
                                }}
                            />
                        </Box>
                        <Box mb={4}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3 }
                                }}
                            />
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            className="premium-btn"
                            sx={{ py: 2, fontSize: '1.1rem' }}
                        >
                            Sign In
                        </Button>
                    </form>
                    <Box mt={3} textAlign="center">
                        <Typography variant="body2">
                            Don't have an account? <Link to="/register">Register here</Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
