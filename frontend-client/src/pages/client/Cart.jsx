import React, { useState } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    IconButton, Divider, Stack, Alert, CircularProgress, Paper
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, incrementInCart, deleteFromCart } from '../../features/cartSlice';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { placeOrder, verifyPayment } from '../../services/orderService';

const Cart = () => {
    const { cartData } = useSelector((state) => state.cart);
    const items = cartData?.items || [];
    const totalAmount = cartData?.totalAmount || 0;
    const subtotal = cartData?.subtotal || 0;
    const tax = cartData?.tax || 0;
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderRequest = {
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const orderResponse = await placeOrder(orderRequest);
            const { stripeSessionUrl } = orderResponse;

            if (stripeSessionUrl) {
                // Redirect user to Stripe Checkout
                window.location.href = stripeSessionUrl;
            } else {
                throw new Error('Failed to get checkout URL');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.message || 'Failed to initiate checkout.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                <ShoppingBagOutlinedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 3 }} />
                <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>Looks like you haven't added anything to your cart yet.</Typography>
                <Button
                    variant="contained"
                    className="premium-btn"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                >
                    Back to Shopping
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box display="flex" alignItems="center" mb={4}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">My Shopping Cart</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Stack spacing={2}>
                        {items.map((item) => (
                            <Paper key={item.productId} elevation={0} className="glass-panel" sx={{ p: 2, borderRadius: 4 }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item sx={{ fontSize: 40, bgcolor: '#f1f5f9', p: 2, borderRadius: 3 }}>
                                        📦
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h6" fontWeight="bold">{item.productName}</Typography>
                                        <Typography variant="body2" color="text.secondary">Price: ₹{item.price}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#f1f5f9', borderRadius: 10, p: 0.5 }}>
                                            <IconButton size="small" onClick={() => dispatch(removeFromCart(item.productId))}>
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <Typography fontWeight="bold" sx={{ width: 30, textAlign: 'center' }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton size="small" onClick={() => dispatch(incrementInCart(item.productId))}>
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Grid>
                                    <Grid item sx={{ minWidth: 100, textAlign: 'right' }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            ₹{item.itemTotal}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton color="error" onClick={() => dispatch(deleteFromCart(item.productId))}>
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card className="glass-panel" sx={{ borderRadius: 5, p: 1 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Order Summary</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography fontWeight="bold">₹{subtotal}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Tax (18%)</Typography>
                                <Typography fontWeight="bold">₹{tax}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Typography color="text.secondary">Shipping</Typography>
                                <Typography color="success.main" fontWeight="bold">FREE</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={4}>
                                <Typography variant="h5" fontWeight="bold">Total</Typography>
                                <Typography variant="h5" color="primary" fontWeight="bold">₹{totalAmount}</Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                className="premium-btn"
                                size="large"
                                onClick={handleCheckout}
                                disabled={loading}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Checkout & Pay'}
                            </Button>
                        </CardContent>
                    </Card>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                        Secure payments by Stripe
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart;
