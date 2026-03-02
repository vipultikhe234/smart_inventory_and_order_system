import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Container, Grid, Card, CardContent,
    CardActions, CircularProgress, Alert, Paper, Divider, Stack,
    IconButton
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Badge, Snackbar, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementInCart, removeFromCart, fetchCart } from '../../features/cartSlice';
import { logout } from '../../features/authSlice';
import { getAllProducts } from '../../services/productService';
import { getAllInventory } from '../../services/inventoryService';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, username, userRole } = useSelector((state) => state.auth);
    const { cartData } = useSelector((state) => state.cart);
    const totalQuantity = cartData?.totalItems || 0;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Use allSettled so one failing API doesn't block the whole page
            const [productResult, inventoryResult] = await Promise.allSettled([
                getAllProducts(0, 50),
                getAllInventory()
            ]);

            if (productResult.status === 'rejected') {
                console.error('Products API failed:', productResult.reason);
                setError('Failed to load available products. Please try again later.');
                setLoading(false);
                return;
            }

            const allProducts = productResult.value?.content || [];
            const inventoryData = inventoryResult.status === 'fulfilled' ? inventoryResult.value : [];

            if (inventoryResult.status === 'rejected') {
                console.warn('Inventory API failed, showing all products:', inventoryResult.reason);
            }

            // If inventory is available, filter by stock. Otherwise show all products.
            const availableProducts = inventoryData.length > 0
                ? allProducts.filter(product => {
                    const invItem = inventoryData.find(inv => inv.productId === product.id);
                    if (!invItem) return false;
                    return invItem.status === 'ACTIVE' && invItem.quantity > 0;
                })
                : allProducts;

            setProducts(availableProducts.slice(0, 8));

            // Only fetch cart if authenticated to avoid 401 redirects
            if (isAuthenticated) {
                dispatch(fetchCart());
            }

            setLoading(false);
        } catch (err) {
            console.error('Home page loading error:', err);
            setError('Failed to load available products. Please try again later.');
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        if (!isAuthenticated) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify(product));
            navigate('/login');
            return;
        }
        dispatch(addToCart(product));
        setSnackbar(true);
    };

    const handleIncrement = (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        dispatch(incrementInCart(productId));
    };

    const handleDecrement = (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        dispatch(removeFromCart(productId));
    };

    const getProductQuantity = (productId) => {
        const item = cartData?.items?.find(i => i.productId === productId);
        return item ? item.quantity : 0;
    };

    return (
        <Box sx={{ overflow: 'hidden' }}>
            <Snackbar
                open={snackbar}
                autoHideDuration={3000}
                onClose={() => setSnackbar(false)}
                message="Item added to cart!"
                action={
                    <Button color="secondary" size="small" onClick={() => navigate('/cart')}>
                        VIEW CART
                    </Button>
                }
            />
            {/* --- Hero Section --- */}
            <Box
                sx={{
                    background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2064&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: 'white',
                    position: 'relative'
                }}
            >
                {/* Navbar within Hero */}
                <Container maxWidth="lg" sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', py: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1, color: 'white' }}>
                            SMART<span style={{ color: '#6366f1' }}>STORE</span>
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton sx={{ color: 'white' }} onClick={() => navigate('/cart')}>
                                <Badge badgeContent={totalQuantity} color="secondary">
                                    <ShoppingCartOutlinedIcon />
                                </Badge>
                            </IconButton>
                            {isAuthenticated ? (
                                <>
                                    <Button sx={{ color: 'white' }} onClick={() => navigate(userRole === 'ROLE_ADMIN' ? '/admin/dashboard' : '/orders')}>
                                        {userRole === 'ROLE_ADMIN' ? 'Admin Dashboard' : 'My Orders'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        className="premium-btn"
                                        onClick={() => dispatch(logout())}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }}
                                        startIcon={<LoginOutlinedIcon />}
                                        onClick={() => navigate('/login')}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="contained"
                                        className="premium-btn"
                                        startIcon={<PersonAddOutlinedIcon />}
                                        onClick={() => navigate('/register')}
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Box>
                </Container>

                <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography
                        variant="h1"
                        className="animate-fade-in"
                        sx={{ fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 800, mb: 2, lineHeight: 1.1 }}
                    >
                        Master Your Inventory <br />
                        <span style={{ color: '#6366f1' }}>Scale Your Business</span>
                    </Typography>
                    <Typography
                        variant="h6"
                        className="animate-fade-in"
                        sx={{ opacity: 0.8, maxWidth: '600px', mx: 'auto', mb: 5, fontWeight: 300 }}
                    >
                        Our Smart Inventory Management System empowers your enterprise with real-time analytics, automated restocks, and seamless order fulfillment. Experience the future of commerce.
                    </Typography>
                    <Stack direction="row" spacing={3} justifyContent="center" className="animate-fade-in">
                        <Button
                            className="premium-btn"
                            size="large"
                            onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                            endIcon={<ArrowForwardIcon />}
                        >
                            Explore Catalog
                        </Button>
                        {!isAuthenticated && (
                            <Button
                                variant="outlined"
                                sx={{ color: 'white', borderColor: 'white', px: 4, py: 1.5, borderRadius: 3 }}
                                size="large"
                                onClick={() => navigate('/register')}
                            >
                                Register Store
                            </Button>
                        )}
                    </Stack>
                </Container>
            </Box>

            {/* --- Stats/Features Section --- */}
            <Box sx={{ py: 12, bgcolor: 'white' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                <Inventory2OutlinedIcon sx={{ fontSize: 40, color: '#6366f1', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>Real-time Tracking</Typography>
                                <Typography color="text.secondary">Monitor every product across multiple warehouses with millisecond precision.</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                <ShoppingBagOutlinedIcon sx={{ fontSize: 40, color: '#ec4899', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>Smart Fulfillment</Typography>
                                <Typography color="text.secondary">Automated order routing and fulfillment status updates for your customers.</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                <Typography variant="h2" fontWeight="800" color="#6366f1" lineHeight={1}>99%</Typography>
                                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>Accuracy Rate</Typography>
                                <Typography color="text.secondary">Virtually eliminate inventory shrinkage with our blockchain-ready ledger system.</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- Products Section --- */}
            <Box id="products-section" sx={{ py: 12 }}>
                <Container maxWidth="lg">
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>Featured Products</Typography>
                        <Typography color="text.secondary">Curated selection for your modern inventory needs.</Typography>
                        <Divider sx={{ mt: 3, width: '100px', mx: 'auto', borderBottomWidth: 3, borderRadius: 5, borderColor: '#6366f1' }} />
                    </Box>

                    {loading && (
                        <Box display="flex" justifyContent="center" py={10}>
                            <CircularProgress size={60} thickness={4} />
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ borderRadius: 4 }}>{error}</Alert>}

                    <Grid container spacing={4}>
                        {!loading && !error && products.map((product) => {
                            const quantity = getProductQuantity(product.id);
                            return (
                                <Grid item key={product.id} xs={12} sm={6} md={3}>
                                    <Card className="glass-panel card-hover" sx={{ height: '100%', overflow: 'hidden' }}>
                                        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', fontSize: 60 }}>
                                            📦
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="700" noWrap gutterBottom>{product.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden', mb: 2 }}>
                                                {product.description}
                                            </Typography>
                                            <Typography variant="h6" color="primary" fontWeight="800">
                                                ₹{product.price}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            {quantity > 0 ? (
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    sx={{
                                                        width: '100%',
                                                        bgcolor: '#f1f5f9',
                                                        borderRadius: 3,
                                                        p: 0.5,
                                                        border: '1px solid #e2e8f0'
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleDecrement(product.id)}
                                                        sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#eef2ff' } }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>

                                                    <Typography fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                                        {quantity}
                                                    </Typography>

                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleIncrement(product.id)}
                                                        sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#eef2ff' } }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    className="premium-btn"
                                                    sx={{ py: 1 }}
                                                    startIcon={<ShoppingCartOutlinedIcon />}
                                                    onClick={() => handleAddToCart(product)}
                                                >
                                                    Add to Cart
                                                </Button>
                                            )}
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* --- Footer --- */}
            <Box sx={{ py: 8, bgcolor: '#0f172a', color: 'white', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ opacity: 0.6 }}>© 2026 Smart Inventory Management System. All rights reserved.</Typography>
            </Box>
        </Box>
    );
};

export default Home;
