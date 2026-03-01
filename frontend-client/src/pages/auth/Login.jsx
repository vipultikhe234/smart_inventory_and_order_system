import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../services/authService';
import { loginSuccess } from '../../features/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Card, CardContent } from '@mui/material';

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
                navigate('/');
            }
        } catch (err) {
            setError('Invalid username or password.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" mb={3} textAlign="center">Login</Typography>
                    {error && <Typography color="error" mb={2} textAlign="center">{error}</Typography>}
                    <form onSubmit={handleSubmit}>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </Box>
                        <Box mb={3}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </Box>
                        <Button fullWidth variant="contained" type="submit" size="large">
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
