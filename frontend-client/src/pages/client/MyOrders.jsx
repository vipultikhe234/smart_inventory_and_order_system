import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, Chip, Divider,
    CircularProgress, Alert, Stack, IconButton, Button, Tabs, Tab
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../features/cartSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserOrders, verifyPayment } from '../../services/orderService';

const MyOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(location.state?.message || null);
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');

        if (sessionId) {
            handleVerifyPayment(sessionId);
        } else {
            fetchOrders();
        }
    }, [location.search]);

    const handleVerifyPayment = async (sessionId) => {
        setLoading(true);
        try {
            await verifyPayment(sessionId);
            setMessage('Payment successful! Your order has been placed.');
            dispatch(clearCart());
            // Clear the query params after verification
            navigate('/orders', { replace: true });
        } catch (err) {
            console.error('Payment verification error:', err);
            setError('Failed to verify payment. Please contact support.');
            fetchOrders();
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await getUserOrders();
            // Sort by latest first
            setOrders(data.sort((a, b) => b.id - a.id));
            setLoading(false);
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Failed to load your orders.');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'CONFIRMED': return 'primary';
            case 'SHIPPED': return 'info';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            case 'DELIVERED': return 'success';
            default: return 'secondary';
        }
    };

    const handleStatusChange = (event, newValue) => {
        setSelectedStatus(newValue);
    };

    const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter(order => order.status === selectedStatus);

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">My Order History</Typography>
                </Box>
                <Tabs
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { fontWeight: 'bold', minWidth: 100 }
                    }}
                >
                    <Tab label="All Orders" value="ALL" />
                    <Tab label="Pending" value="PENDING" />
                    <Tab label="Confirmed" value="CONFIRMED" />
                    <Tab label="Paid" value="PAID" />
                    <Tab label="Shipped" value="SHIPPED" />
                    <Tab label="Delivered" value="DELIVERED" />
                    <Tab label="Cancelled" value="CANCELLED" />
                </Tabs>
            </Box>

            {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress />
                </Box>
            ) : filteredOrders.length === 0 ? (
                <Paper sx={{ p: 10, textAlign: 'center', bgcolor: '#f1f5f9', borderRadius: 5 }}>
                    <Typography variant="h6" color="text.secondary">
                        {selectedStatus === 'ALL'
                            ? "You haven't placed any orders yet."
                            : `No ${selectedStatus.toLowerCase()} orders found.`}
                    </Typography>
                    {selectedStatus === 'ALL' && (
                        <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate('/')}>Go Shopping</Button>
                    )}
                </Paper>
            ) : (
                <Stack spacing={4}>
                    {filteredOrders.map((order) => (
                        <Paper key={order.id} elevation={0} className="glass-panel" sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">Order #{order.id}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={order.status}
                                    color={getStatusColor(order.status)}
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Purchased Items</Typography>
                                    <Stack spacing={2} sx={{ mt: 1 }}>
                                        {order.items?.map((item, idx) => (
                                            <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body1">
                                                    Product ID #{item.productId} <span style={{ opacity: 0.6 }}>x {item.quantity}</span>
                                                </Typography>
                                                <Typography fontWeight="bold">₹{item.price * item.quantity}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                                    <Typography color="text.secondary">Total Amount Paid</Typography>
                                    <Typography variant="h4" fontWeight="800" color="primary">
                                        ₹{order.totalAmount}
                                    </Typography>
                                    {order.stripeSessionId && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            Payment Ref: {order.stripeSessionId}
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default MyOrders;
