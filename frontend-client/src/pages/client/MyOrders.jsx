import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, CircularProgress,
    Alert, Stack, IconButton, Button, Divider, Tooltip
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../features/cartSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserOrders, verifyPayment } from '../../services/orderService';
import { getAllInventory, updateStock } from '../../services/inventoryService';

const STATUS = {
    PAID: { label: 'Paid', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    CONFIRMED: { label: 'Confirmed', color: '#a78bfa', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
    SHIPPED: { label: 'Shipped', color: '#38bdf8', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    DELIVERED: { label: 'Delivered', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    PENDING: { label: 'Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    CANCELLED: { label: 'Cancelled', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
};

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const MyOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(location.state?.message || null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const sid = new URLSearchParams(location.search).get('session_id');
        if (sid) handleVerify(sid); else fetchOrders();
    }, [location.search]);

    const handleVerify = async (sid) => {
        try {
            await verifyPayment(sid);
            setMessage('Payment successful. Your order has been confirmed.');
            dispatch(clearCart());
            // Decrement inventory based on the latest order
            await decrementInventoryForLatestOrder();
            navigate('/orders', { replace: true });
        } catch { setError('Payment verification failed.'); fetchOrders(); }
    };

    // Helper to decrement inventory for the most recent order
    const decrementInventoryForLatestOrder = async () => {
        try {
            // Get latest order (assuming highest id is most recent)
            const orders = await getUserOrders();
            if (!orders || orders.length === 0) return;
            const latest = orders.reduce((a, b) => (a.id > b.id ? a : b));
            // Load current inventory
            const inventory = await getAllInventory();
            // For each item, update quantity
            await Promise.all(latest.items.map(async (item) => {
                const inv = inventory.find(i => i.productId === item.productId);
                if (!inv) return;
                const newQty = Math.max(0, inv.quantity - item.quantity);
                await updateStock({ productId: item.productId, quantity: newQty, status: inv.status });
            }));
        } catch (e) {
            console.error('Failed to decrement inventory:', e);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await getUserOrders();
            setOrders(data.sort((a, b) => b.id - a.id));
        } catch { setError('Failed to load orders.'); }
        finally { setLoading(false); }
    };

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
    const countFor = (s) => s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0d0d14' }} className="page-container">
            <Box className="top-accent-bar" />

            {/* ── HEADER ──────────────────────────────────────── */}
            <Box sx={{ bgcolor: '#0f0f1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Container maxWidth="lg">
                    <Box display="flex" alignItems="center" justifyContent="space-between" py={2.5} flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton size="small" onClick={() => navigate('/')} sx={{
                                color: '#64748b', border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '6px', p: 0.8,
                                '&:hover': { color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.15)' }
                            }}>
                                <ArrowBackIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                            <Box>
                                <Typography fontWeight="700" sx={{ color: '#e2e8f0', letterSpacing: '-0.01em' }}>My Orders</Typography>
                                <Typography variant="caption" sx={{ color: '#334155' }}>{orders.length} total orders</Typography>
                            </Box>
                        </Box>

                        {/* Filter pills */}
                        <Stack direction="row" sx={{ bgcolor: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                            {FILTERS.map(f => {
                                const c = countFor(f);
                                if (f !== 'ALL' && c === 0) return null;
                                const active = filter === f;
                                return (
                                    <Box key={f} onClick={() => setFilter(f)} sx={{
                                        px: 2, py: 1, cursor: 'pointer', fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                                        color: active ? '#e2e8f0' : '#334155',
                                        bgcolor: active ? '#1a1a2e' : 'transparent',
                                        borderRight: '1px solid rgba(255,255,255,0.06)',
                                        transition: 'all 0.15s',
                                        '&:last-child': { borderRight: 'none' },
                                        '&:hover': { color: '#94a3b8' }
                                    }}>
                                        {f.charAt(0) + f.slice(1).toLowerCase()}{' '}
                                        <span style={{ opacity: 0.45, marginLeft: 2 }}>{c}</span>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* ── BODY ────────────────────────────────────────── */}
            <Container maxWidth="lg" sx={{ py: 5 }}>
                {message && <Alert severity="success" sx={{ mb: 4 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                {loading ? (
                    <Box display="flex" justifyContent="center" py={12}>
                        <CircularProgress size={32} sx={{ color: '#7c3aed' }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box textAlign="center" py={14} className="animate-in">
                        <Box sx={{
                            width: 72, height: 72, borderRadius: '8px',
                            bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4
                        }}>
                            <ShoppingBagOutlinedIcon sx={{ fontSize: 30, color: '#1e293b' }} />
                        </Box>
                        <Typography fontWeight="700" sx={{ color: '#64748b', fontSize: '1rem', mb: 1 }}>
                            {filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}
                        </Typography>
                        <Typography sx={{ color: '#1e293b', fontSize: '0.875rem', mb: 5 }}>
                            {filter === 'ALL' ? 'Place your first order to see it here.' : 'Use the filter above to browse other statuses.'}
                        </Typography>
                        {filter === 'ALL' && (
                            <Button variant="contained" color="primary" onClick={() => navigate('/')} endIcon={<KeyboardArrowRightIcon />}>
                                Shop now
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {/* Column header row */}
                        <Box sx={{
                            display: { xs: 'none', md: 'grid' },
                            gridTemplateColumns: '1fr 1fr 120px 120px',
                            gap: 3, pb: 1.5, px: 3,
                            borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            {['Order', 'Items', 'Status', 'Total'].map(h => (
                                <Typography key={h} sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                    {h}
                                </Typography>
                            ))}
                        </Box>

                        {filtered.map((order, idx) => {
                            const s = STATUS[order.status] || { label: order.status, color: '#64748b', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' };
                            return (
                                <Box
                                    key={order.id}
                                    className="animate-in"
                                    sx={{
                                        bgcolor: '#13131f', border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px', overflow: 'hidden',
                                        animationDelay: `${idx * 0.04}s`,
                                        transition: 'border-color 0.18s',
                                        '&:hover': { borderColor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    {/* Order row desktop */}
                                    <Box sx={{
                                        display: { xs: 'none', md: 'grid' },
                                        gridTemplateColumns: '1fr 1fr 120px 120px',
                                        gap: 3, alignItems: 'center', px: 3, py: 2.5
                                    }}>
                                        {/* Order info */}
                                        <Box>
                                            <Typography fontWeight="700" sx={{ color: '#e2e8f0', fontSize: '0.875rem', letterSpacing: '-0.01em' }}>
                                                #{order.id}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#334155' }}>
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </Typography>
                                        </Box>

                                        {/* Items summary */}
                                        <Box>
                                            <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#1e293b' }}>
                                                {order.items?.map(i => `×${i.quantity}`).join(', ')}
                                            </Typography>
                                        </Box>

                                        {/* Status badge */}
                                        <Box sx={{ px: 1.5, py: 0.5, border: `1px solid ${s.border}`, bgcolor: s.bg, display: 'inline-flex', borderRadius: '4px', width: 'fit-content' }}>
                                            <Typography sx={{ color: s.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                                {s.label.toUpperCase()}
                                            </Typography>
                                        </Box>

                                        {/* Total */}
                                        <Typography fontWeight="800" sx={{ color: '#a78bfa', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                                            ₹{order.totalAmount}
                                        </Typography>
                                    </Box>

                                    {/* Mobile layout */}
                                    <Box sx={{ display: { xs: 'block', md: 'none' }, p: 3 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box>
                                                <Typography fontWeight="700" sx={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Order #{order.id}</Typography>
                                                <Typography variant="caption" sx={{ color: '#334155' }}>
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ px: 1.5, py: 0.5, border: `1px solid ${s.border}`, bgcolor: s.bg, borderRadius: '4px' }}>
                                                <Typography sx={{ color: s.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                                    {s.label.toUpperCase()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography fontWeight="800" sx={{ color: '#a78bfa', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                                            ₹{order.totalAmount}
                                        </Typography>
                                    </Box>

                                    {/* Expanded items */}
                                    {order.items && order.items.length > 0 && (
                                        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: '#0f0f1a' }}>
                                            {order.items.map((item, i) => (
                                                <Box key={i} sx={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    px: 3, py: 1.8,
                                                    borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                                                }}>
                                                    <Typography sx={{ color: '#475569', fontSize: '0.82rem' }}>
                                                        Product #{item.productId}{' '}
                                                        <span style={{ color: '#1e293b', marginLeft: 8 }}>× {item.quantity}</span>
                                                    </Typography>
                                                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Container>
        </Box>
    );
};

export default MyOrders;
