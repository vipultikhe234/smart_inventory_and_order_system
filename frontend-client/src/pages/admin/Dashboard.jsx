import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Button, TextField, List, ListItem, ListItemText,
    Alert, CircularProgress, Select, MenuItem, InputLabel, FormControl,
    Stack, Divider, IconButton, Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/authSlice';
import { getAllCategories, createCategory } from '../../services/categoryService';
import { createProduct, getAllProducts, deleteProduct } from '../../services/productService';
import { getAllUsers, deleteUser, registerAdmin, getUserStats } from '../../services/userService';
import { getAllInventory, updateStock, updateInventoryStatus, getInventoryStats } from '../../services/inventoryService';
import { getAllOrders, updateOrderStatus, getOrderStats, getSalesTrends } from '../../services/orderService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// ── Shared styles ──────────────────────────────────────────────────────────
const BG = '#0d0d14';
const SURFACE = '#13131f';
const SURFACE2 = '#0f0f1a';
const BORDER = 'rgba(255,255,255,0.07)';
const TEXT = '#e2e8f0';
const MUTED = '#475569';
const DIM = '#1e293b';
const PURPLE = '#7c3aed';
const PURPLE_LIGHT = '#a78bfa';

const STATUS_MAP = {
    PAID: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
    CONFIRMED: { color: '#a78bfa', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)' },
    SHIPPED: { color: '#38bdf8', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
    DELIVERED: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
    PENDING: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    CANCELLED: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
};

const FieldLabel = ({ children }) => (
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: MUTED, mb: 0.8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {children}
    </Typography>
);

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || { color: '#64748b', bg: 'rgba(255,255,255,0.04)', border: BORDER };
    return (
        <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.4, border: `1px solid ${s.border}`, bgcolor: s.bg, borderRadius: '4px' }}>
            <Typography sx={{ color: s.color, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                {status}
            </Typography>
        </Box>
    );
};

// ── Sidebar ────────────────────────────────────────────────────────────────
const NAV = [
    { id: 'dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Overview', group: null },
    { id: 'inventory', icon: <InventoryIcon sx={{ fontSize: 18 }} />, label: 'Warehouse', group: 'Catalog' },
    { id: 'categories', icon: <CategoryOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Categories', group: 'Catalog' },
    { id: 'orders', icon: <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Orders', group: 'Operations' },
    { id: 'users', icon: <PeopleOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Users', group: 'Operations' },
];

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { username } = useSelector(s => s.auth);
    const [activeTab, setActiveTab] = useState('dashboard');

    // — State —
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [catLoading, setCatLoading] = useState(false);
    const [catError, setCatError] = useState(null);
    const [catSuccess, setCatSuccess] = useState(null);

    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [prodLoading, setProdLoading] = useState(false);
    const [prodError, setProdError] = useState(null);
    const [prodSuccess, setProdSuccess] = useState(null);

    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('ALL');
    const [userLoading, setUserLoading] = useState(false);
    const [adminRegData, setAdminRegData] = useState({ username: '', email: '', password: '' });
    const [userSuccess, setUserSuccess] = useState(null);
    const [userError, setUserError] = useState(null);

    const [inventory, setInventory] = useState([]);
    const [invLoading, setInvLoading] = useState(false);
    const [invError, setInvError] = useState(null);
    const [invSuccess, setInvSuccess] = useState(null);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedInv, setSelectedInv] = useState(null);
    const [newQuantity, setNewQuantity] = useState('');
    const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');

    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState('ALL');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(null);

    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, activeUsers: 0, lowStock: 0, trends: [], loading: false });

    useEffect(() => {
        if (activeTab === 'dashboard') fetchStats();
        if (activeTab === 'inventory' || activeTab === 'add_product') fetchInventory();
        if (activeTab === 'categories' || activeTab === 'add_category') fetchCategories();
        if (activeTab === 'inventory' || activeTab === 'add_product') { fetchProducts(); fetchCategories(); }
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab, orderFilter]);

    const fetchStats = async () => {
        setStats(p => ({ ...p, loading: true }));
        try {
            const [oStat, uStat, iStat, trends] = await Promise.all([getOrderStats(), getUserStats(), getInventoryStats(), getSalesTrends()]);
            setStats({ totalSales: oStat.totalRevenue || 0, totalOrders: oStat.totalOrders || 0, activeUsers: uStat.totalUsers || 0, lowStock: iStat.lowStockCount || 0, trends: trends || [], loading: false });
        } catch { setStats(p => ({ ...p, loading: false })); }
    };

    const fetchCategories = async () => { setCatLoading(true); try { setCategories(await getAllCategories()); } catch { setCatError('Failed to load categories'); } finally { setCatLoading(false); } };
    const fetchProducts = async () => { setProdLoading(true); try { const d = await getAllProducts(0, 100); setProducts(d.content || []); } catch { setProdError('Failed to load products'); } finally { setProdLoading(false); } };
    const fetchUsers = async () => { setUserLoading(true); setUserError(null); try { setUsers(await getAllUsers()); } catch (err) { setUserError(`Failed to load users: ${err.message}`); } finally { setUserLoading(false); } };
    const fetchInventory = async () => { setInvLoading(true); setInvError(null); try { setInventory(await getAllInventory()); } catch { setInvError('Failed to load inventory'); } finally { setInvLoading(false); } };
    const fetchOrders = async () => { setOrderLoading(true); setOrderError(null); try { setOrders(await getAllOrders(orderFilter)); } catch (err) { setOrderError(err.response?.data?.message || 'Failed to load orders'); } finally { setOrderLoading(false); } };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        if (!selectedInv) return;
        setInvLoading(true);
        try { await updateStock({ productId: selectedInv.productId, quantity: parseInt(newQuantity) }); setInvSuccess('Stock updated!'); fetchInventory(); setShowStockModal(false); setTimeout(() => setInvSuccess(null), 3000); }
        catch { setInvError('Failed to update stock'); } finally { setInvLoading(false); }
    };

    const handleStatusToggle = async (productId, currentStatus) => {
        const next = currentStatus === 'ACTIVE' ? 'TEMPORARY_DEACTIVATED' : currentStatus === 'TEMPORARY_DEACTIVATED' ? 'PERMANENT_DEACTIVATED' : 'ACTIVE';
        try { await updateInventoryStatus(productId, next); fetchInventory(); } catch { alert('Failed to update status'); }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault(); setCatLoading(true); setCatSuccess(null); setCatError(null);
        try { await createCategory({ name: categoryName, description: categoryDescription }); setCatSuccess('Category created!'); setCategoryName(''); setCategoryDescription(''); setTimeout(() => { setCatSuccess(null); setActiveTab('categories'); }, 1000); }
        catch { setCatError('Failed to create category.'); } finally { setCatLoading(false); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault(); setProdLoading(true); setProdSuccess(null); setProdError(null);
        try {
            if (!productCategory) { setProdError('Please select a category.'); return; }
            await createProduct({ name: productName, description: productDesc, price: parseFloat(productPrice), categoryId: parseInt(productCategory) });
            setProdSuccess('Product created! Redirecting to warehouse...'); setProductName(''); setProductDesc(''); setProductPrice(''); setProductCategory('');
            setTimeout(() => { setProdSuccess(null); setActiveTab('inventory'); fetchProducts(); fetchInventory(); }, 1000);
        } catch (err) { setProdError(err.response?.data?.message || 'Failed to create product.'); } finally { setProdLoading(false); }
    };

    const handleAdminRegister = async (e) => {
        e.preventDefault(); setUserLoading(true); setUserSuccess(null); setUserError(null);
        try { await registerAdmin(adminRegData); setUserSuccess('Admin registered!'); setAdminRegData({ username: '', email: '', password: '' }); fetchUsers(); setTimeout(() => setUserSuccess(null), 3000); }
        catch { setUserError('Registration failed. Username or email may already be taken.'); } finally { setUserLoading(false); }
    };

    const handleDeleteUser = async (id) => { if (window.confirm('Delete this user?')) { try { await deleteUser(id); fetchUsers(); } catch { alert('Failed to delete user.'); } } };
    const handleDeleteProduct = async (id) => { if (window.confirm('Delete this product?')) { try { await deleteProduct(id); fetchProducts(); } catch { alert('Error deleting product.'); } } };
    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        try { await updateOrderStatus(orderId, newStatus); setOrderSuccess('Order updated!'); fetchOrders(); setTimeout(() => setOrderSuccess(null), 3000); }
        catch { setOrderError('Failed to update order status'); }
    };

    const filteredUsers = users.filter(u => userFilter === 'ALL' || u.role === userFilter);
    const titleMap = { dashboard: 'Overview', categories: 'Categories', add_category: 'New Category', inventory: 'Warehouse', add_product: 'New Product', orders: 'Orders', users: 'Users', add_admin: 'New Admin' };

    // Group nav for rendering
    const groups = ['', 'Catalog', 'Operations'];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BG }}>
            <Box className="top-accent-bar" />

            {/* ── SIDEBAR ─────────────────────────────────────── */}
            <Box sx={{
                width: 240, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
                bgcolor: SURFACE2, borderRight: `1px solid ${BORDER}`,
                display: 'flex', flexDirection: 'column', overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#1a1a2e' }
            }}>
                {/* Brand */}
                <Box sx={{ px: 3, py: 3.5, borderBottom: `1px solid ${BORDER}` }}>
                    <Typography fontWeight="800" sx={{ color: TEXT, letterSpacing: '-0.02em', fontSize: '1rem' }}>
                        SMART<span style={{ color: PURPLE_LIGHT }}>ADMIN</span>
                    </Typography>
                    <Typography sx={{ color: DIM, fontSize: '0.72rem', mt: 0.4 }}>Control panel</Typography>
                </Box>

                {/* Nav */}
                <Box sx={{ px: 2, pt: 3, flexGrow: 1 }}>
                    {groups.map(group => {
                        const items = NAV.filter(n => (n.group || '') === group);
                        if (items.length === 0) return null;
                        return (
                            <Box key={group} mb={3}>
                                {group && (
                                    <Typography sx={{ color: '#1e293b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', px: 2, mb: 1 }}>
                                        {group}
                                    </Typography>
                                )}
                                {items.map(item => {
                                    const isActive = activeTab === item.id
                                        || (item.id === 'inventory' && ['add_product'].includes(activeTab))
                                        || (item.id === 'categories' && activeTab === 'add_category')
                                        || (item.id === 'users' && activeTab === 'add_admin');
                                    return (
                                        <Box key={item.id} onClick={() => setActiveTab(item.id)} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            px: 2, py: 1.2, mb: 0.5, borderRadius: '6px', cursor: 'pointer',
                                            bgcolor: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                                            color: isActive ? PURPLE_LIGHT : MUTED,
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.875rem',
                                            borderLeft: isActive ? `2px solid ${PURPLE}` : '2px solid transparent',
                                            transition: 'all 0.15s',
                                            '&:hover': { bgcolor: isActive ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)', color: isActive ? PURPLE_LIGHT : '#94a3b8' }
                                        }}>
                                            {item.icon}
                                            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', letterSpacing: '-0.01em' }}>{item.label}</Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}
                </Box>

                {/* Logout */}
                <Box sx={{ px: 2, pb: 3, pt: 2, borderTop: `1px solid ${BORDER}` }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.2, borderRadius: '6px',
                        cursor: 'pointer', color: '#475569', transition: 'all 0.15s',
                        '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' }
                    }} onClick={() => { dispatch(logout()); navigate('/login'); }}>
                        <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Sign out</Typography>
                    </Box>
                </Box>
            </Box>

            {/* ── MAIN CONTENT ────────────────────────────────── */}
            <Box sx={{ ml: '240px', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Topbar */}
                <Box sx={{ bgcolor: SURFACE2, borderBottom: `1px solid ${BORDER}`, px: 5, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
                    <Box>
                        <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
                            {titleMap[activeTab] || 'Dashboard'}
                        </Typography>
                        <Typography sx={{ color: DIM, fontSize: '0.78rem', mt: 0.2 }}>
                            Welcome back, <span style={{ color: MUTED }}>{username}</span>
                        </Typography>
                    </Box>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '6px',
                        bgcolor: 'rgba(124,58,237,0.15)', border: `1px solid rgba(124,58,237,0.3)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: PURPLE_LIGHT, fontWeight: 800, fontSize: '0.875rem'
                    }}>
                        {username?.charAt(0)?.toUpperCase() || 'A'}
                    </Box>
                </Box>

                {/* Page body */}
                <Box sx={{ p: 5, flexGrow: 1 }} className="page-container">

                    {/* ── OVERVIEW ──────────────────────────────────── */}
                    {activeTab === 'dashboard' && (
                        <Box>
                            {stats.loading ? (
                                <Box display="flex" justifyContent="center" py={10}><CircularProgress size={32} sx={{ color: PURPLE }} /></Box>
                            ) : (
                                <>
                                    {/* Stat cards */}
                                    <Grid container spacing={2} mb={5}>
                                        {[
                                            { label: 'Total Revenue', value: stats.totalSales >= 1000 ? `₹${(stats.totalSales / 1000).toFixed(1)}k` : `₹${stats.totalSales}`, sub: 'Confirmed payments', icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, color: '#a78bfa', accent: 'rgba(124,58,237,0.12)' },
                                            { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), sub: 'All time', icon: <ReceiptOutlinedIcon sx={{ fontSize: 20 }} />, color: '#34d399', accent: 'rgba(16,185,129,0.1)' },
                                            { label: 'Platform Users', value: stats.activeUsers.toLocaleString(), sub: 'Registered accounts', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />, color: '#38bdf8', accent: 'rgba(6,182,212,0.1)' },
                                            { label: 'Low Stock Alert', value: `${stats.lowStock}`, sub: 'Items below threshold', icon: <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />, color: '#fbbf24', accent: 'rgba(245,158,11,0.1)' },
                                        ].map((s, i) => (
                                            <Grid item xs={12} sm={6} md={3} key={i}>
                                                <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 3, transition: 'border-color 0.2s', '&:hover': { borderColor: 'rgba(255,255,255,0.12)' } }}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                        <Typography sx={{ color: MUTED, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</Typography>
                                                        <Box sx={{ p: 0.8, bgcolor: s.accent, borderRadius: '6px', color: s.color }}>{s.icon}</Box>
                                                    </Box>
                                                    <Typography fontWeight="800" sx={{ color: s.color, fontSize: '1.75rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                                        {s.value}
                                                    </Typography>
                                                    <Typography sx={{ color: DIM, fontSize: '0.75rem', mt: 1 }}>{s.sub}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Chart */}
                                    <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 4 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                            <Box>
                                                <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.01em', mb: 0.3 }}>Revenue Trend</Typography>
                                                <Typography sx={{ color: MUTED, fontSize: '0.8rem' }}>Sales performance over last 7 days</Typography>
                                            </Box>
                                            <Box sx={{ px: 1.5, py: 0.5, border: `1px solid rgba(124,58,237,0.3)`, bgcolor: 'rgba(124,58,237,0.08)', borderRadius: '4px' }}>
                                                <Typography sx={{ color: PURPLE_LIGHT, fontSize: '0.72rem', fontWeight: 600 }}>LIVE DATA</Typography>
                                            </Box>
                                        </Box>
                                        <Box height={320}>
                                            <Line
                                                data={{
                                                    labels: stats.trends.map(t => t.date),
                                                    datasets: [{
                                                        label: 'Revenue (₹)',
                                                        data: stats.trends.map(t => t.total),
                                                        borderColor: PURPLE,
                                                        backgroundColor: 'rgba(124,58,237,0.08)',
                                                        fill: true, tension: 0.4,
                                                        pointRadius: 5, pointBackgroundColor: SURFACE,
                                                        pointBorderColor: PURPLE, pointBorderWidth: 2,
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true, maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: { backgroundColor: '#1a1a2e', padding: 12, bodyFont: { size: 13 }, cornerRadius: 6, displayColors: false, borderColor: BORDER, borderWidth: 1 }
                                                    },
                                                    scales: {
                                                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#334155', font: { size: 11 } }, border: { color: 'transparent' } },
                                                        x: { grid: { display: false }, ticks: { color: '#334155', font: { size: 11 } }, border: { color: 'transparent' } }
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}

                    {/* ── ORDERS ────────────────────────────────────── */}
                    {activeTab === 'orders' && (
                        <Box>
                            {orderError && <Alert severity="error" sx={{ mb: 3 }}>{orderError}</Alert>}
                            {orderSuccess && <Alert severity="success" sx={{ mb: 3 }}>{orderSuccess}</Alert>}

                            {/* Filter */}
                            <Box sx={{ border: `1px solid ${BORDER}`, bgcolor: SURFACE2, borderRadius: '6px', overflow: 'hidden', display: 'inline-flex', mb: 4 }}>
                                {['ALL', 'PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(f => (
                                    <Box key={f} onClick={() => setOrderFilter(f)} sx={{
                                        px: 2.5, py: 1.2, cursor: 'pointer', fontSize: '0.78rem', fontWeight: orderFilter === f ? 700 : 500,
                                        color: orderFilter === f ? TEXT : MUTED, bgcolor: orderFilter === f ? SURFACE : 'transparent',
                                        borderRight: `1px solid ${BORDER}`, transition: 'all 0.15s',
                                        '&:last-child': { borderRight: 'none' }, '&:hover': { color: '#94a3b8' }
                                    }}>
                                        {f.charAt(0) + f.slice(1).toLowerCase()}
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Table header */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 140px 150px', gap: 2, px: 3, py: 1.8, borderBottom: `1px solid ${BORDER}`, bgcolor: SURFACE2 }}>
                                    {['ID', 'Customer', 'Items', 'Total', 'Status', 'Action'].map(h => (
                                        <Typography key={h} sx={{ fontSize: '0.7rem', fontWeight: 700, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</Typography>
                                    ))}
                                </Box>
                                {orderLoading ? <Box p={5} textAlign="center"><CircularProgress size={28} sx={{ color: PURPLE }} /></Box> :
                                    orders.length === 0 ? <Box p={6} textAlign="center"><Typography sx={{ color: MUTED }}>No orders found.</Typography></Box> :
                                        orders.map(order => (
                                            <Box key={order.id} sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 140px 150px', gap: 2, px: 3, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.04)`, alignItems: 'center', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(255,255,255,0.015)' } }}>
                                                <Typography sx={{ color: MUTED, fontSize: '0.82rem', fontWeight: 600 }}>#{order.id}</Typography>
                                                <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>User #{order.userId}</Typography>
                                                <Typography sx={{ color: MUTED, fontSize: '0.78rem' }}>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</Typography>
                                                <Typography sx={{ color: PURPLE_LIGHT, fontWeight: 700, fontSize: '0.9rem' }}>₹{order.totalAmount}</Typography>
                                                <StatusBadge status={order.status} />
                                                <FormControl size="small">
                                                    <Select value={order.status} onChange={e => handleOrderStatusUpdate(order.id, e.target.value)}
                                                        sx={{ fontSize: '0.78rem', height: 30, bgcolor: 'rgba(255,255,255,0.03)', '& fieldset': { borderColor: BORDER } }}>
                                                        {['PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        ))
                                }
                            </Box>
                        </Box>
                    )}

                    {/* ── WAREHOUSE / INVENTORY ─────────────────────── */}
                    {activeTab === 'inventory' && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                <Box>
                                    <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.01em' }}>Warehouse Stock</Typography>
                                    <Typography sx={{ color: MUTED, fontSize: '0.8rem', mt: 0.3 }}>{products.length} products tracked</Typography>
                                </Box>
                                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setActiveTab('add_product')}>Add Product</Button>
                            </Box>

                            {invError && <Alert severity="error" sx={{ mb: 3 }}>{invError}</Alert>}
                            {invSuccess && <Alert severity="success" sx={{ mb: 3 }}>{invSuccess}</Alert>}

                            {/* Category filter */}
                            <Box display="flex" alignItems="center" gap={2} mb={4}>
                                <Typography sx={{ color: MUTED, fontSize: '0.78rem', fontWeight: 600 }}>Category:</Typography>
                                <FormControl size="small">
                                    <Select value={invCategoryFilter} onChange={e => setInvCategoryFilter(e.target.value)}
                                        sx={{ minWidth: 180, bgcolor: SURFACE, fontSize: '0.82rem', '& fieldset': { borderColor: BORDER } }}>
                                        <MenuItem value="ALL">All Categories</MenuItem>
                                        {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 220px', gap: 2, px: 3, py: 1.8, borderBottom: `1px solid ${BORDER}`, bgcolor: SURFACE2 }}>
                                    {['Product', 'Category', 'Stock', 'Actions'].map(h => (
                                        <Typography key={h} sx={{ fontSize: '0.7rem', fontWeight: 700, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</Typography>
                                    ))}
                                </Box>

                                {invLoading && products.length === 0 ? <Box p={5} textAlign="center"><CircularProgress size={28} sx={{ color: PURPLE }} /></Box> :
                                    products.filter(p => invCategoryFilter === 'ALL' || p.category?.id === invCategoryFilter).map(product => {
                                        const item = inventory.find(i => i.productId === product.id) || { productId: product.id, quantity: 0, status: 'ACTIVE', isDefault: true };
                                        const statusColor = { ACTIVE: '#34d399', TEMPORARY_DEACTIVATED: '#fbbf24', PERMANENT_DEACTIVATED: '#f87171' }[item.status] || '#64748b';
                                        return (
                                            <Box key={product.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 220px', gap: 2, px: 3, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.04)`, alignItems: 'center', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(255,255,255,0.015)' } }}>
                                                <Box>
                                                    <Typography fontWeight="600" sx={{ color: TEXT, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>{product.name}</Typography>
                                                    <Typography sx={{ color: DIM, fontSize: '0.75rem' }}>₹{product.price}</Typography>
                                                </Box>
                                                <Typography sx={{ color: MUTED, fontSize: '0.78rem' }}>{product.category?.name || '—'}</Typography>
                                                <Box>
                                                    <Typography fontWeight="800" sx={{ color: item.quantity < 10 ? '#f87171' : PURPLE_LIGHT, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                                                        {item.quantity}
                                                    </Typography>
                                                    <Typography sx={{ color: statusColor, fontSize: '0.7rem', fontWeight: 600 }}>
                                                        {item.status === 'ACTIVE' ? 'ACTIVE' : item.status === 'TEMPORARY_DEACTIVATED' ? 'TEMP OFF' : 'PERM OFF'}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={1}>
                                                    <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                                                        onClick={() => { setSelectedInv(item); setNewQuantity(item.quantity); setShowStockModal(true); }}
                                                        sx={{ fontSize: '0.75rem', py: 0.6, borderColor: BORDER, color: MUTED, '&:hover': { borderColor: 'rgba(255,255,255,0.2)', color: TEXT } }}>
                                                        Stock
                                                    </Button>
                                                    <Button size="small" variant="outlined"
                                                        onClick={() => handleStatusToggle(item.productId, item.status)}
                                                        sx={{ fontSize: '0.75rem', py: 0.6, borderColor: item.status === 'ACTIVE' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)', color: item.status === 'ACTIVE' ? '#fbbf24' : '#34d399', '&:hover': { bgcolor: item.status === 'ACTIVE' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)' } }}>
                                                        {item.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                                    </Button>
                                                    <Tooltip title="Delete product">
                                                        <IconButton size="small" onClick={() => handleDeleteProduct(product.id)} sx={{ color: DIM, '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Box>
                                        );
                                    })
                                }
                            </Box>
                        </Box>
                    )}

                    {/* ── ADD PRODUCT ───────────────────────────────── */}
                    {activeTab === 'add_product' && (
                        <Box maxWidth={680}>
                            <Button startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />} onClick={() => setActiveTab('inventory')} sx={{ color: MUTED, mb: 4, '&:hover': { color: TEXT } }}>
                                Back to Warehouse
                            </Button>
                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 4 }}>
                                <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.01em', mb: 0.5 }}>New Product</Typography>
                                <Typography sx={{ color: MUTED, fontSize: '0.82rem', mb: 4 }}>Fill in product details to add to inventory.</Typography>
                                {prodError && <Alert severity="error" sx={{ mb: 3 }}>{prodError}</Alert>}
                                {prodSuccess && <Alert severity="success" sx={{ mb: 3 }}>{prodSuccess}</Alert>}
                                <form onSubmit={handleProductSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <FieldLabel>Product Name</FieldLabel>
                                            <TextField fullWidth size="small" placeholder="e.g. Wireless Keyboard" required value={productName} onChange={e => setProductName(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FieldLabel>Price (₹)</FieldLabel>
                                            <TextField fullWidth size="small" type="number" placeholder="0.00" required value={productPrice} onChange={e => setProductPrice(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FieldLabel>Category</FieldLabel>
                                            <FormControl fullWidth size="small" required>
                                                <Select value={productCategory} onChange={e => setProductCategory(e.target.value)} displayEmpty
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: BORDER } }}>
                                                    <MenuItem value="" disabled><span style={{ color: '#334155' }}>Select category</span></MenuItem>
                                                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FieldLabel>Description</FieldLabel>
                                            <TextField fullWidth size="small" multiline rows={3} placeholder="Describe the product..." value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button type="submit" fullWidth variant="contained" color="primary" disabled={prodLoading} size="large" endIcon={<KeyboardArrowRightIcon />} sx={{ py: 1.4, fontWeight: 700 }}>
                                                {prodLoading ? <CircularProgress size={18} color="inherit" /> : 'Create Product'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Box>
                        </Box>
                    )}

                    {/* ── CATEGORIES ────────────────────────────────── */}
                    {activeTab === 'categories' && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                <Box>
                                    <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.01em' }}>Categories</Typography>
                                    <Typography sx={{ color: MUTED, fontSize: '0.8rem', mt: 0.3 }}>{categories.length} categories defined</Typography>
                                </Box>
                                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setActiveTab('add_category')}>Add Category</Button>
                            </Box>
                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
                                {catLoading ? <Box p={5} textAlign="center"><CircularProgress size={28} sx={{ color: PURPLE }} /></Box> :
                                    categories.length === 0 ? <Box p={6} textAlign="center"><Typography sx={{ color: MUTED }}>No categories yet.</Typography></Box> :
                                        categories.map((c, i) => (
                                            <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 3, py: 2.5, borderBottom: i < categories.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(255,255,255,0.015)' } }}>
                                                <Box sx={{ width: 36, height: 36, bgcolor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                                    📂
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography fontWeight="600" sx={{ color: TEXT, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>{c.name}</Typography>
                                                    <Typography sx={{ color: DIM, fontSize: '0.78rem' }}>{c.description || 'No description'}</Typography>
                                                </Box>
                                                <Box sx={{ px: 1.5, py: 0.4, bgcolor: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '4px' }}>
                                                    <Typography sx={{ color: PURPLE_LIGHT, fontSize: '0.68rem', fontWeight: 600 }}>ID #{c.id}</Typography>
                                                </Box>
                                            </Box>
                                        ))
                                }
                            </Box>
                        </Box>
                    )}

                    {/* ── ADD CATEGORY ──────────────────────────────── */}
                    {activeTab === 'add_category' && (
                        <Box maxWidth={560}>
                            <Button startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />} onClick={() => setActiveTab('categories')} sx={{ color: MUTED, mb: 4, '&:hover': { color: TEXT } }}>
                                Back to Categories
                            </Button>
                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 4 }}>
                                <Typography fontWeight="700" sx={{ color: TEXT, mb: 0.5 }}>New Category</Typography>
                                <Typography sx={{ color: MUTED, fontSize: '0.82rem', mb: 4 }}>Group products under a named category.</Typography>
                                {catError && <Alert severity="error" sx={{ mb: 3 }}>{catError}</Alert>}
                                {catSuccess && <Alert severity="success" sx={{ mb: 3 }}>{catSuccess}</Alert>}
                                <form onSubmit={handleCategorySubmit}>
                                    <Box mb={2.5}>
                                        <FieldLabel>Category Name</FieldLabel>
                                        <TextField fullWidth size="small" placeholder="e.g. Electronics" required value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                                    </Box>
                                    <Box mb={4}>
                                        <FieldLabel>Description</FieldLabel>
                                        <TextField fullWidth size="small" multiline rows={3} placeholder="Describe this category..." value={categoryDescription} onChange={e => setCategoryDescription(e.target.value)} />
                                    </Box>
                                    <Button type="submit" fullWidth variant="contained" color="primary" disabled={catLoading} size="large" sx={{ py: 1.4, fontWeight: 700 }}>
                                        {catLoading ? <CircularProgress size={18} color="inherit" /> : 'Create Category'}
                                    </Button>
                                </form>
                            </Box>
                        </Box>
                    )}

                    {/* ── USERS ─────────────────────────────────────── */}
                    {activeTab === 'users' && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                <Box>
                                    <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.01em' }}>User Management</Typography>
                                    <Typography sx={{ color: MUTED, fontSize: '0.8rem', mt: 0.3 }}>{users.length} registered accounts</Typography>
                                </Box>
                                <Button variant="contained" color="primary" startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />} onClick={() => setActiveTab('add_admin')}>
                                    Add Admin
                                </Button>
                            </Box>
                            {userError && <Alert severity="error" sx={{ mb: 3 }}>{userError}</Alert>}

                            {/* Role filter */}
                            <Box sx={{ border: `1px solid ${BORDER}`, bgcolor: SURFACE2, borderRadius: '6px', overflow: 'hidden', display: 'inline-flex', mb: 4 }}>
                                {[{ v: 'ALL', l: 'All' }, { v: 'ROLE_ADMIN', l: 'Admins' }, { v: 'ROLE_CUSTOMER', l: 'Customers' }].map(f => (
                                    <Box key={f.v} onClick={() => setUserFilter(f.v)} sx={{
                                        px: 2.5, py: 1.2, cursor: 'pointer', fontSize: '0.78rem', fontWeight: userFilter === f.v ? 700 : 500,
                                        color: userFilter === f.v ? TEXT : MUTED, bgcolor: userFilter === f.v ? SURFACE : 'transparent',
                                        borderRight: `1px solid ${BORDER}`, transition: 'all 0.15s',
                                        '&:last-child': { borderRight: 'none' }, '&:hover': { color: '#94a3b8' }
                                    }}>
                                        {f.l}
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 220px 120px 60px', gap: 2, px: 3, py: 1.8, borderBottom: `1px solid ${BORDER}`, bgcolor: SURFACE2 }}>
                                    {['User', 'Email', 'Role', ''].map(h => (
                                        <Typography key={h} sx={{ fontSize: '0.7rem', fontWeight: 700, color: DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</Typography>
                                    ))}
                                </Box>
                                {userLoading ? <Box p={5} textAlign="center"><CircularProgress size={28} sx={{ color: PURPLE }} /></Box> :
                                    filteredUsers.length === 0 ? <Box p={6} textAlign="center"><Typography sx={{ color: MUTED }}>No users found.</Typography></Box> :
                                        filteredUsers.map((u, i) => (
                                            <Box key={u.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 220px 120px 60px', gap: 2, px: 3, py: 2, borderBottom: i < filteredUsers.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', alignItems: 'center', transition: 'background 0.15s', '&:hover': { bgcolor: 'rgba(255,255,255,0.015)' } }}>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box sx={{ width: 30, height: 30, borderRadius: '6px', bgcolor: u.role === 'ROLE_ADMIN' ? 'rgba(124,58,237,0.12)' : 'rgba(16,185,129,0.08)', border: `1px solid ${u.role === 'ROLE_ADMIN' ? 'rgba(124,58,237,0.25)' : 'rgba(16,185,129,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.role === 'ROLE_ADMIN' ? PURPLE_LIGHT : '#34d399', flexShrink: 0 }}>
                                                        <PersonOutlineIcon sx={{ fontSize: 16 }} />
                                                    </Box>
                                                    <Typography fontWeight="600" sx={{ color: TEXT, fontSize: '0.875rem' }}>{u.username}</Typography>
                                                </Box>
                                                <Typography sx={{ color: MUTED, fontSize: '0.82rem' }}>{u.email}</Typography>
                                                <Box sx={{ px: 1.5, py: 0.4, bgcolor: u.role === 'ROLE_ADMIN' ? 'rgba(124,58,237,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid ${u.role === 'ROLE_ADMIN' ? 'rgba(124,58,237,0.25)' : 'rgba(16,185,129,0.2)'}`, borderRadius: '4px', display: 'inline-flex' }}>
                                                    <Typography sx={{ color: u.role === 'ROLE_ADMIN' ? PURPLE_LIGHT : '#34d399', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                                                        {u.role.replace('ROLE_', '')}
                                                    </Typography>
                                                </Box>
                                                <Tooltip title="Delete user">
                                                    <IconButton size="small" onClick={() => handleDeleteUser(u.id)} sx={{ color: DIM, '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                                                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ))
                                }
                            </Box>
                        </Box>
                    )}

                    {/* ── ADD ADMIN ─────────────────────────────────── */}
                    {activeTab === 'add_admin' && (
                        <Box maxWidth={520}>
                            <Button startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />} onClick={() => setActiveTab('users')} sx={{ color: MUTED, mb: 4, '&:hover': { color: TEXT } }}>
                                Back to Users
                            </Button>
                            <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 4 }}>
                                <Typography fontWeight="700" sx={{ color: TEXT, mb: 0.5 }}>Register Admin</Typography>
                                <Typography sx={{ color: MUTED, fontSize: '0.82rem', mb: 4 }}>Grant admin-level privileges to a new account.</Typography>
                                {userError && <Alert severity="error" sx={{ mb: 3 }}>{userError}</Alert>}
                                {userSuccess && <Alert severity="success" sx={{ mb: 3 }}>{userSuccess}</Alert>}
                                <form onSubmit={handleAdminRegister}>
                                    {['username', 'email', 'password'].map(key => (
                                        <Box key={key} mb={2.5}>
                                            <FieldLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FieldLabel>
                                            <TextField fullWidth size="small" required type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                                                placeholder={key === 'email' ? 'admin@example.com' : key === 'password' ? '••••••••' : 'admin_name'}
                                                value={adminRegData[key]}
                                                onChange={e => setAdminRegData({ ...adminRegData, [key]: e.target.value })} />
                                        </Box>
                                    ))}
                                    <Box mt={4}>
                                        <Button type="submit" fullWidth variant="contained" color="primary" disabled={userLoading} size="large" sx={{ py: 1.4, fontWeight: 700 }}>
                                            {userLoading ? <CircularProgress size={18} color="inherit" /> : 'Create Admin Account'}
                                        </Button>
                                    </Box>
                                </form>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── STOCK MODAL ───────────────────────────────────── */}
            {showStockModal && (
                <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                    <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 4, width: '100%', maxWidth: 420 }}>
                        <Typography fontWeight="700" sx={{ color: TEXT, letterSpacing: '-0.01em', mb: 0.5 }}>Adjust Stock</Typography>
                        <Typography sx={{ color: MUTED, fontSize: '0.82rem', mb: 4 }}>Enter the new absolute quantity for this product.</Typography>
                        <FieldLabel>New Quantity</FieldLabel>
                        <TextField fullWidth size="small" type="number" autoFocus
                            value={newQuantity} onChange={e => setNewQuantity(e.target.value)}
                            sx={{ mb: 4 }} />
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth variant="outlined" onClick={() => setShowStockModal(false)}
                                sx={{ py: 1.2, borderColor: BORDER, color: MUTED, '&:hover': { borderColor: 'rgba(255,255,255,0.18)', color: TEXT } }}>
                                Cancel
                            </Button>
                            <Button fullWidth variant="contained" color="primary" onClick={handleStockUpdate} disabled={invLoading} sx={{ py: 1.2, fontWeight: 700 }}>
                                {invLoading ? <CircularProgress size={16} color="inherit" /> : 'Confirm'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Dashboard;
