import React, { useState } from 'react';
import {
    Box, Container, Typography, Grid, Button, IconButton,
    Divider, Stack, Alert, CircularProgress, Tooltip
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, incrementInCart, deleteFromCart } from '../../features/cartSlice';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../../services/orderService';

const Cart = () => {
    const { cartData } = useSelector(s => s.cart);
    const items = cartData?.items || [];
    const totalAmount = cartData?.totalAmount || 0;
    const subtotal = cartData?.subtotal || 0;
    const tax = cartData?.tax || 0;
    const { isAuthenticated } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        if (!isAuthenticated) { navigate('/login', { state: { from: '/cart' } }); return; }
        setLoading(true); setError(null);
        try {
            const resp = await placeOrder({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
            if (resp.stripeSessionUrl) window.location.href = resp.stripeSessionUrl;
            else throw new Error();
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed. Please try again.');
        } finally { setLoading(false); }
    };

    if (items.length === 0) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#0d0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box className="top-accent-bar" />
                <Box textAlign="center" className="animate-in">
                    <Box sx={{
                        width: 72, height: 72, borderRadius: '8px',
                        bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4
                    }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 30, color: '#1e293b' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', mb: 1 }}>
                        Your cart is empty
                    </Typography>
                    <Typography sx={{ color: '#334155', fontSize: '0.9rem', mb: 5 }}>
                        Browse products and add items to get started.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/')} endIcon={<KeyboardArrowRightIcon />}>
                        Browse products
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0d0d14' }} className="page-container">
            <Box className="top-accent-bar" />

            {/* ── HEADER ──────────────────────────────────────── */}
            <Box sx={{ bgcolor: '#0f0f1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Container maxWidth="lg">
                    <Box display="flex" alignItems="center" gap={2} py={2.5}>
                        <IconButton size="small" onClick={() => navigate('/')} sx={{
                            color: '#64748b', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '6px', p: 0.8,
                            '&:hover': { color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.15)' }
                        }}>
                            <ArrowBackIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                        <Box>
                            <Typography fontWeight="700" sx={{ color: '#e2e8f0', letterSpacing: '-0.01em' }}>
                                Shopping Cart
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#334155' }}>
                                {items.length} item{items.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ── CONTENT ─────────────────────────────────────── */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                <Grid container spacing={5}>
                    {/* ─ Items list ─ */}
                    <Grid item xs={12} md={8}>
                        {/* Column headers */}
                        <Box sx={{
                            display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                            gap: 2, pb: 1.5, mb: 0,
                            borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Product
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', minWidth: 80 }}>
                                Qty
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'right', minWidth: 80 }}>
                                Total
                            </Typography>
                            <Box sx={{ width: 32 }} />
                        </Box>

                        {items.map((item) => (
                            <Box key={item.productId} sx={{
                                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                                gap: 2, alignItems: 'center', py: 3,
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                transition: 'background 0.15s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }
                            }}>
                                {/* Product info */}
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box sx={{
                                        width: 44, height: 44, flexShrink: 0,
                                        bgcolor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                    }}>
                                        📦
                                    </Box>
                                    <Box>
                                        <Typography fontWeight="600" sx={{ color: '#e2e8f0', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                                            {item.productName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#334155' }}>
                                            ₹{item.price} / unit
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Qty stepper */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    bgcolor: '#13131f', minWidth: 100
                                }}>
                                    <IconButton size="small"
                                        onClick={() => dispatch(removeFromCart(item.productId))}
                                        sx={{ borderRadius: 0, color: '#334155', p: 0.8, '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                        <RemoveIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <Typography sx={{ color: '#e2e8f0', fontWeight: 700, px: 2, fontSize: '0.9rem', flexGrow: 1, textAlign: 'center' }}>
                                        {item.quantity}
                                    </Typography>
                                    <IconButton size="small"
                                        onClick={() => dispatch(incrementInCart(item.productId))}
                                        sx={{ borderRadius: 0, color: '#334155', p: 0.8, '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                        <AddIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>

                                {/* Line total */}
                                <Typography fontWeight="700" sx={{ color: '#a78bfa', textAlign: 'right', fontSize: '0.95rem', letterSpacing: '-0.01em', minWidth: 80 }}>
                                    ₹{item.itemTotal}
                                </Typography>

                                {/* Delete */}
                                <Tooltip title="Remove">
                                    <IconButton size="small"
                                        onClick={() => dispatch(deleteFromCart(item.productId))}
                                        sx={{ borderRadius: '6px', color: '#1e293b', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ))}
                    </Grid>

                    {/* ─ Order summary ─ */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{
                            bgcolor: '#13131f', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '8px', overflow: 'hidden', position: 'sticky', top: 24
                        }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <Typography fontWeight="700" sx={{ color: '#e2e8f0', fontSize: '0.875rem', letterSpacing: '-0.01em' }}>
                                    Order Summary
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Stack spacing={2.5} mb={3}>
                                    {[
                                        { label: 'Subtotal', value: `₹${subtotal}` },
                                        { label: 'GST (18%)', value: `₹${tax}` },
                                        { label: 'Shipping', value: 'Free', accent: true },
                                    ].map(row => (
                                        <Box key={row.label} display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ color: '#475569', fontSize: '0.875rem' }}>{row.label}</Typography>
                                            <Typography sx={{ color: row.accent ? '#34d399' : '#94a3b8', fontWeight: 600, fontSize: '0.875rem' }}>
                                                {row.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

                                <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={4}>
                                    <Typography fontWeight="700" sx={{ color: '#e2e8f0', fontSize: '0.9rem' }}>Total</Typography>
                                    <Typography fontWeight="800" sx={{ color: '#a78bfa', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
                                        ₹{totalAmount}
                                    </Typography>
                                </Box>

                                <Button fullWidth variant="contained" color="primary" size="large"
                                    onClick={handleCheckout} disabled={loading}
                                    endIcon={!loading && <KeyboardArrowRightIcon />}
                                    sx={{ py: 1.5, fontWeight: 700, fontSize: '0.9rem' }}>
                                    {loading ? <CircularProgress size={18} color="inherit" /> : 'Proceed to checkout'}
                                </Button>

                                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2.5}>
                                    <LockOutlinedIcon sx={{ fontSize: 12, color: '#1e293b' }} />
                                    <Typography variant="caption" sx={{ color: '#1e293b', fontSize: '0.72rem' }}>
                                        Secured by Stripe · End-to-end encrypted
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Cart;
