import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Container, Grid, CircularProgress,
    Alert, Stack, IconButton, Badge, Snackbar, Divider, Tooltip, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementInCart, removeFromCart, fetchCart } from '../../features/cartSlice';
import { logout } from '../../features/authSlice';
import { getAllProducts } from '../../services/productService';
import { getAllInventory } from '../../services/inventoryService';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    { icon: <SpeedOutlinedIcon sx={{ fontSize: 20 }} />, title: 'Real-time Inventory', body: 'Live stock levels — only available items shown.' },
    { icon: <ShieldOutlinedIcon sx={{ fontSize: 20 }} />, title: 'Secure Checkout', body: 'Stripe-powered payments with full encryption.' },
    { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />, title: 'Fast Dispatch', body: 'Orders processed and dispatched same day.' },
    { icon: <SupportAgentOutlinedIcon sx={{ fontSize: 20 }} />, title: '24/7 Support', body: 'Always-on support via chat and email.' },
];

const CARD_ACCENTS = ['#7c3aed', '#0891b2', '#059669', '#d97706'];

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, userRole } = useSelector(s => s.auth);
    const { cartData } = useSelector(s => s.cart);
    const totalQuantity = cartData?.totalItems || 0;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState(false);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            const [pRes, iRes] = await Promise.allSettled([getAllProducts(0, 50), getAllInventory()]);
            if (pRes.status === 'rejected') { setError('Failed to load products.'); setLoading(false); return; }
            const all = pRes.value?.content || [];
            const inv = iRes.status === 'fulfilled' ? iRes.value : [];
            const available = inv.length > 0
                ? all.filter(p => { const i = inv.find(x => x.productId === p.id); return i && i.status === 'ACTIVE' && i.quantity > 0; })
                : all;
            setProducts(available.slice(0, 8));
            if (isAuthenticated) dispatch(fetchCart());
        } catch { setError('Failed to load products.'); }
        finally { setLoading(false); }
    };

    const handleAdd = (product) => {
        if (!isAuthenticated) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify(product));
            navigate('/login');
            return;
        }
        dispatch(addToCart(product));
        setSnackbar(true);
    };

    const getQty = (id) => cartData?.items?.find(i => i.productId === id)?.quantity || 0;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0d0d14' }} className="page-container">
            <Box className="top-accent-bar" />

            {/* ── TOPNAV ──────────────────────────────────────── */}
            <Box sx={{
                bgcolor: 'rgba(13,13,20,0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={1.8}>
                        {/* Brand */}
                        <Typography fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', fontSize: '1.05rem', cursor: 'default' }}>
                            SMART<span style={{ color: '#a78bfa' }}>STORE</span>
                        </Typography>

                        {/* Center links (desktop) */}
                        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Box className="nav-link" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Products</Box>
                            {isAuthenticated && (
                                <Box className="nav-link" onClick={() => navigate(userRole === 'ROLE_ADMIN' ? '/admin/dashboard' : '/orders')}>
                                    {userRole === 'ROLE_ADMIN' ? 'Dashboard' : 'My Orders'}
                                </Box>
                            )}
                        </Stack>

                        {/* Actions */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title={`Cart (${totalQuantity})`}>
                                <IconButton size="small" onClick={() => navigate('/cart')} sx={{
                                    color: '#64748b', border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '6px', p: 0.85,
                                    '&:hover': { color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.15)' }
                                }}>
                                    <Badge badgeContent={totalQuantity} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                                        <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            {isAuthenticated ? (
                                <Button size="small" startIcon={<LogoutOutlinedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => dispatch(logout())}
                                    sx={{ color: '#64748b', border: '1px solid rgba(255,255,255,0.07)', '&:hover': { color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', bgcolor: 'rgba(239,68,68,0.05)' } }}>
                                    Sign out
                                </Button>
                            ) : (
                                <>
                                    <Button size="small" onClick={() => navigate('/login')}
                                        sx={{ color: '#64748b', '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                        Sign in
                                    </Button>
                                    <Button size="small" variant="contained" color="primary"
                                        onClick={() => navigate('/register')} sx={{ px: 2 }}>
                                        Get started
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* ── HERO ────────────────────────────────────────── */}
            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                {/* Ambient glow */}
                <Box sx={{
                    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                    width: '600px', height: '400px',
                    background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 }, position: 'relative' }}>
                    <Box sx={{ maxWidth: 640 }} className="animate-in">
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 1, mb: 4,
                            px: 1.5, py: 0.6,
                            border: '1px solid rgba(124,58,237,0.3)',
                            bgcolor: 'rgba(124,58,237,0.08)',
                            borderRadius: '4px'
                        }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#a78bfa' }} />
                            <Typography sx={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                INVENTORY MANAGEMENT PLATFORM
                            </Typography>
                        </Box>

                        <Typography variant="h2" fontWeight="800" sx={{
                            color: '#e2e8f0', letterSpacing: '-0.04em', lineHeight: 1.1,
                            fontSize: { xs: '2.4rem', md: '3.6rem' }, mb: 3
                        }}>
                            The smarter way to<br />
                            <span style={{ color: '#a78bfa' }}>buy & sell products</span>
                        </Typography>

                        <Typography sx={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.8, mb: 6, maxWidth: 500 }}>
                            Real-time inventory tracking, seamless checkout, and order management — all in one modern platform.
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained" color="primary" size="large"
                                endIcon={<KeyboardArrowRightIcon />}
                                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                                sx={{ py: 1.4, px: 3.5, fontWeight: 700 }}
                            >
                                Browse products
                            </Button>
                            {!isAuthenticated && (
                                <Button size="large" onClick={() => navigate('/register')}
                                    sx={{ py: 1.4, px: 3, color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontWeight: 500, '&:hover': { color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.03)' } }}>
                                    Create free account
                                </Button>
                            )}
                        </Stack>

                        {/* Trust bar */}
                        <Box display="flex" alignItems="center" gap={3} mt={6} flexWrap="wrap">
                            {[
                                { value: '500+', label: 'Products' },
                                { value: '99.9%', label: 'Uptime' },
                                { value: '₹0', label: 'Shipping' },
                                { value: '24/7', label: 'Support' },
                            ].map(s => (
                                <Box key={s.label} display="flex" alignItems="baseline" gap={1}>
                                    <Typography fontWeight="800" sx={{ color: '#e2e8f0', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>{s.value}</Typography>
                                    <Typography sx={{ color: '#334155', fontSize: '0.8rem', fontWeight: 500 }}>{s.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ── FEATURES ROW ────────────────────────────────── */}
            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', bgcolor: '#0f0f1a' }}>
                <Container maxWidth="lg">
                    <Grid container>
                        {FEATURES.map((f, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Box sx={{
                                    p: 3.5,
                                    borderRight: { md: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' },
                                    borderBottom: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' },
                                    '&:last-child': { borderBottom: 'none' },
                                    transition: 'background 0.2s',
                                    '&:hover': { bgcolor: 'rgba(124,58,237,0.04)' }
                                }}>
                                    <Box sx={{ color: '#64748b', mb: 2 }}>{f.icon}</Box>
                                    <Typography fontWeight="700" sx={{ color: '#e2e8f0', mb: 0.5, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                                        {f.title}
                                    </Typography>
                                    <Typography sx={{ color: '#334155', fontSize: '0.82rem', lineHeight: 1.6 }}>{f.body}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── PRODUCTS ────────────────────────────────────── */}
            <Box id="products" sx={{ py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    {/* Section header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={6}>
                        <Box>
                            <Typography variant="h5" fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', mb: 0.5 }}>
                                Available Products
                            </Typography>
                            <Typography sx={{ color: '#334155', fontSize: '0.875rem' }}>
                                {loading ? 'Fetching inventory...' : `${products.length} items in stock and ready to ship`}
                            </Typography>
                        </Box>
                        {isAuthenticated && totalQuantity > 0 && (
                            <Button
                                size="small" variant="outlined" color="primary"
                                startIcon={<ShoppingCartOutlinedIcon sx={{ fontSize: 15 }} />}
                                onClick={() => navigate('/cart')}
                                sx={{ fontSize: '0.8rem' }}
                            >
                                View cart ({totalQuantity})
                            </Button>
                        )}
                    </Box>

                    <Divider sx={{ mb: 5, borderColor: 'rgba(255,255,255,0.06)' }} />

                    {loading && (
                        <Box display="flex" justifyContent="center" py={12}>
                            <CircularProgress size={32} sx={{ color: '#7c3aed' }} />
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        {!loading && !error && products.map((product, idx) => {
                            const qty = getQty(product.id);
                            const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                            return (
                                <Grid item xs={12} sm={6} md={3} key={product.id}>
                                    <Box className="product-card" sx={{
                                        height: '100%', display: 'flex', flexDirection: 'column',
                                        animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${idx * 0.05}s both`,
                                        borderTop: `2px solid ${accent}20`,
                                        overflow: 'hidden'
                                    }}>
                                        {/* Image area */}
                                        <Box sx={{
                                            height: 140, bgcolor: '#0f0f1a',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 44, position: 'relative'
                                        }}>
                                            📦
                                            <Box sx={{
                                                position: 'absolute', top: 10, right: 10,
                                                px: 1, py: 0.3,
                                                border: '1px solid rgba(16,185,129,0.25)',
                                                bgcolor: 'rgba(16,185,129,0.08)',
                                                fontSize: '0.62rem', fontWeight: 700,
                                                color: '#34d399', letterSpacing: '0.04em'
                                            }}>
                                                IN STOCK
                                            </Box>
                                        </Box>

                                        {/* Content */}
                                        <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Typography fontWeight="700" noWrap sx={{ color: '#e2e8f0', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                                                {product.name}
                                            </Typography>
                                            <Typography sx={{
                                                color: '#334155', fontSize: '0.78rem', lineHeight: 1.6, flexGrow: 1,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>
                                                {product.description || 'Premium quality product ready for delivery.'}
                                            </Typography>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                <Typography fontWeight="800" sx={{ color: accent, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                                                    ₹{product.price}
                                                </Typography>
                                                {product.category && (
                                                    <Typography sx={{ color: '#334155', fontSize: '0.72rem', fontWeight: 500 }}>
                                                        {product.category.name}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Action */}
                                        <Box sx={{ px: 2.5, pb: 2.5 }}>
                                            {qty > 0 ? (
                                                <Box sx={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    border: `1px solid ${accent}30`, bgcolor: `${accent}08`, p: 0.5
                                                }}>
                                                    <IconButton size="small"
                                                        onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } dispatch(removeFromCart(product.id)); }}
                                                        sx={{ borderRadius: '4px', color: '#64748b', '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                                        <RemoveIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                    <Typography fontWeight="700" sx={{ color: '#e2e8f0', minWidth: 28, textAlign: 'center' }}>
                                                        {qty}
                                                    </Typography>
                                                    <IconButton size="small"
                                                        onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } dispatch(incrementInCart(product.id)); }}
                                                        sx={{ borderRadius: '4px', color: '#64748b', '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                                        <AddIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Button fullWidth size="small" variant="contained" color="primary"
                                                    startIcon={<ShoppingCartOutlinedIcon sx={{ fontSize: 15 }} />}
                                                    onClick={() => handleAdd(product)}
                                                    sx={{ py: 1.1, fontWeight: 600 }}>
                                                    Add to cart
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {!loading && !error && products.length === 0 && (
                        <Box textAlign="center" py={14}>
                            <Typography sx={{ color: '#1e293b', fontSize: '2rem', mb: 2 }}>🏪</Typography>
                            <Typography fontWeight="600" sx={{ color: '#334155' }}>No products in stock right now.</Typography>
                            <Typography sx={{ color: '#1e293b', fontSize: '0.875rem', mt: 1 }}>Check back later — inventory is updated in real time.</Typography>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* ── FOOTER ──────────────────────────────────────── */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', bgcolor: '#0f0f1a', py: 5 }}>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                        <Typography fontWeight="800" sx={{ color: '#e2e8f0', letterSpacing: '-0.02em', fontSize: '0.95rem' }}>
                            SMART<span style={{ color: '#a78bfa' }}>STORE</span>
                        </Typography>
                        <Stack direction="row" spacing={4}>
                            {!isAuthenticated && (
                                <>
                                    <Typography onClick={() => navigate('/login')} sx={{ color: '#334155', fontSize: '0.8rem', cursor: 'pointer', '&:hover': { color: '#64748b' } }}>Sign in</Typography>
                                    <Typography onClick={() => navigate('/register')} sx={{ color: '#334155', fontSize: '0.8rem', cursor: 'pointer', '&:hover': { color: '#64748b' } }}>Register</Typography>
                                </>
                            )}
                        </Stack>
                        <Typography sx={{ color: '#1e293b', fontSize: '0.78rem' }}>© 2025 SmartStore Inc.</Typography>
                    </Box>
                </Container>
            </Box>

            <Snackbar
                open={snackbar}
                autoHideDuration={3000}
                onClose={() => setSnackbar(false)}
                message="Added to cart"
                action={
                    <Button size="small" sx={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.78rem' }} onClick={() => navigate('/cart')}>
                        VIEW CART
                    </Button>
                }
                sx={{ '& .MuiSnackbarContent-root': { bgcolor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '0.875rem' } }}
            />
        </Box>
    );
};

export default Home;
