import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Button, TextField, List,
    ListItem, ListItemText, Alert, CircularProgress, Select, MenuItem,
    InputLabel, FormControl, Avatar, Stack, Chip, Divider, IconButton, Paper,
    ToggleButtonGroup, ToggleButton
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
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Icons for a premium feel
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { username } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('dashboard');

    // Category State
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [catLoading, setCatLoading] = useState(false);
    const [catError, setCatError] = useState(null);
    const [catSuccess, setCatSuccess] = useState(null);

    // Product State
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [prodLoading, setProdLoading] = useState(false);
    const [prodError, setProdError] = useState(null);
    const [prodSuccess, setProdSuccess] = useState(null);

    // User Management State
    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('ALL');
    const [userLoading, setUserLoading] = useState(false);
    const [adminRegData, setAdminRegData] = useState({ username: '', email: '', password: '' });
    const [userSuccess, setUserSuccess] = useState(null);
    const [userError, setUserError] = useState(null);

    // Inventory State
    const [inventory, setInventory] = useState([]);
    const [invLoading, setInvLoading] = useState(false);
    const [invError, setInvError] = useState(null);
    const [invSuccess, setInvSuccess] = useState(null);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedInv, setSelectedInv] = useState(null);
    const [newQuantity, setNewQuantity] = useState('');
    const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');

    // Order State
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState('ALL');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(null);

    // Dashboard Stats State
    const [dashboardStats, setDashboardStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        activeUsers: 0,
        lowStock: 0,
        salesTrends: [],
        loading: false
    });

    const fetchDashboardStats = async () => {
        setDashboardStats(prev => ({ ...prev, loading: true }));
        try {
            const [orderStats, userStats, inventoryStats, trends] = await Promise.all([
                getOrderStats(),
                getUserStats(),
                getInventoryStats(),
                getSalesTrends()
            ]);

            setDashboardStats({
                totalSales: orderStats.totalRevenue || 0,
                totalOrders: orderStats.totalOrders || 0,
                activeUsers: userStats.totalUsers || 0,
                lowStock: inventoryStats.lowStockCount || 0,
                salesTrends: trends || [],
                loading: false
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setDashboardStats(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStats();
        }
        if (activeTab === 'categories' || activeTab === 'add_category') {
            fetchCategories();
        }
        if (activeTab === 'products' || activeTab === 'add_product') {
            fetchProducts();
            fetchCategories();
        }
        if (activeTab === 'users') {
            fetchUsers();
        }
        if (activeTab === 'inventory') {
            fetchInventory();
            fetchProducts();
            fetchCategories();
        }
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, orderFilter]);

    const fetchCategories = async () => {
        setCatLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            setCatError('Failed to load categories');
        } finally {
            setCatLoading(false);
        }
    };

    const fetchProducts = async () => {
        setProdLoading(true);
        try {
            const data = await getAllProducts(0, 100);
            setProducts(data.content || []);
        } catch (err) {
            setProdError('Failed to load products');
        } finally {
            setProdLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUserLoading(true);
        setUserError(null);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('User fetch Error:', err);
            setUserError(`Failed to load users: ${err.response?.data || err.message}`);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchInventory = async () => {
        setInvLoading(true);
        setInvError(null);
        try {
            const data = await getAllInventory();
            setInventory(data);
        } catch (err) {
            setInvError('Failed to load inventory data');
        } finally {
            setInvLoading(false);
        }
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        if (!selectedInv) return;
        setInvLoading(true);
        try {
            await updateStock({ productId: selectedInv.productId, quantity: parseInt(newQuantity) });
            setInvSuccess('Stock updated successfully!');
            fetchInventory();
            setShowStockModal(false);
            setTimeout(() => setInvSuccess(null), 3000);
        } catch (err) {
            setInvError('Failed to update stock');
        } finally {
            setInvLoading(false);
        }
    };

    const handleStatusToggle = async (productId, currentStatus) => {
        let nextStatus = 'ACTIVE';
        if (currentStatus === 'ACTIVE') nextStatus = 'TEMPORARY_DEACTIVATED';
        else if (currentStatus === 'TEMPORARY_DEACTIVATED') nextStatus = 'PERMANENT_DEACTIVATED';

        try {
            await updateInventoryStatus(productId, nextStatus);
            fetchInventory();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setCatLoading(true);
        setCatSuccess(null);
        setCatError(null);
        try {
            await createCategory({ name: categoryName, description: categoryDescription });
            setCatSuccess('Category created successfully!');
            setCategoryName('');
            setCategoryDescription('');
            setTimeout(() => {
                setCatSuccess(null);
                setActiveTab('categories');
            }, 1000);
        } catch (err) {
            setCatError('Failed to create category.');
        } finally {
            setCatLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setProdLoading(true);
        setProdSuccess(null);
        setProdError(null);
        try {
            if (!productCategory) {
                setProdError('Please select a valid category from the list.');
                return;
            }
            console.log('Initiating registration for product:', { productName, productPrice, productCategory });
            await createProduct({
                name: productName,
                description: productDesc,
                price: parseFloat(productPrice),
                categoryId: parseInt(productCategory)
            });
            setProdSuccess('Product registered in database! Opening Warehouse for stock entry...');
            setProductName(''); setProductDesc(''); setProductPrice(''); setProductCategory('');
            setTimeout(() => {
                setProdSuccess(null);
                setActiveTab('inventory');
                fetchProducts(); // Refresh lists
                fetchInventory();
            }, 1000);
        } catch (err) {
            console.error('Submission Error:', err);
            const errMsg = err.response?.data?.message || err.response?.data || err.message;
            setProdError(`Critical error during registration: ${errMsg}`);
        } finally {
            setProdLoading(false);
        }
    };

    const handleAdminRegister = async (e) => {
        e.preventDefault();
        setUserLoading(true);
        setUserSuccess(null);
        setUserError(null);
        try {
            await registerAdmin(adminRegData);
            setUserSuccess('Admin registered successfully!');
            setAdminRegData({ username: '', email: '', password: '' });
            fetchUsers();
            setTimeout(() => setUserSuccess(null), 3000);
        } catch (err) {
            setUserError('Registration failed. Username/Email may be taken.');
        } finally {
            setUserLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (err) {
                alert("Failed to delete user.");
            }
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (e) { alert("Error deleting product"); }
        }
    };

    const fetchOrders = async () => {
        setOrderLoading(true);
        setOrderError(null);
        try {
            const data = await getAllOrders(orderFilter);
            setOrders(data);
        } catch (err) {
            console.error('Fetch orders error:', err);
            const errMsg = err.response?.data?.message || err.response?.data || err.message;
            setOrderError(`Failed to load orders: ${errMsg}`);
        } finally {
            setOrderLoading(false);
        }
    };

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrderSuccess('Order status updated!');
            fetchOrders();
            setTimeout(() => setOrderSuccess(null), 3000);
        } catch (err) {
            setOrderError('Failed to update order status');
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

    const filteredUsers = users.filter(u => {
        if (userFilter === 'ALL') return true;
        return u.role === userFilter;
    });

    const SidebarItem = ({ id, icon, label }) => (
        <Box
            className={`sidebar-item ${activeTab === id || (id === 'products' && activeTab === 'add_product') || (id === 'categories' && activeTab === 'add_category') || (id === 'users' && activeTab === 'add_admin') ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
        >
            {icon}
            <Typography sx={{ ml: 2, fontWeight: 500 }}>{label}</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            {/* Sidebar */}
            <Paper elevation={0} sx={{
                width: 280,
                bgcolor: 'white',
                height: '100vh',
                position: 'fixed',
                p: 3,
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb:hover': { background: '#cbd5e1' }
            }}>
                <Typography variant="h5" color="primary" fontWeight="800" mb={4} sx={{ letterSpacing: 1 }}>
                    SMART<span style={{ color: '#0f172a' }}>ADMIN</span>
                </Typography>

                <SidebarItem id="dashboard" icon={<DashboardOutlinedIcon />} label="Dashboard Overview" />

                <Typography variant="overline" display="block" sx={{ mt: 3, mb: 1, color: '#94a3b8', px: 2 }}>Inventory</Typography>
                <SidebarItem id="inventory" icon={<InventoryIcon />} label="Warehouse Hub" />

                <Typography variant="overline" display="block" sx={{ mt: 3, mb: 1, color: '#94a3b8', px: 2 }}>Classification</Typography>
                <SidebarItem id="categories" icon={<CategoryOutlinedIcon />} label="Manage Categories" />

                <Typography variant="overline" display="block" sx={{ mt: 3, mb: 1, color: '#94a3b8', px: 2 }}>Operations</Typography>
                <SidebarItem id="orders" icon={<ShoppingBagOutlinedIcon />} label="Customer Orders" />
                <SidebarItem id="users" icon={<PeopleOutlinedIcon />} label="User Management" />
                <SidebarItem id="profile" icon={<PersonOutlineIcon />} label="Admin Profile" />

                <Box sx={{ mt: 'auto', pt: 4 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<LogoutOutlinedIcon />}
                        sx={{ borderRadius: 3 }}
                        onClick={() => { dispatch(logout()); navigate('/login'); }}
                    >
                        Logout Session
                    </Button>
                </Box>
            </Paper>

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1, ml: '280px', p: 5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="800" className="animate-fade-in" sx={{ color: '#0f172a' }}>
                            {activeTab === 'dashboard' ? 'Overview' :
                                activeTab === 'categories' || activeTab === 'add_category' ? 'Category Hub' :
                                    activeTab === 'inventory' || activeTab === 'add_product' ? 'Warehouse Hub' :
                                        activeTab === 'orders' ? 'Customer Order Records' :
                                            activeTab === 'users' || activeTab === 'add_admin' ? 'User Management' : 'Admin Panel'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">Welcome back, {username}! Real-time stats ready.</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#6366f1', width: 48, height: 48 }}>AD</Avatar>
                </Box>

                {/* Dashboard Overview */}
                {activeTab === 'dashboard' && (
                    <Box>
                        {dashboardStats.loading && !dashboardStats.totalOrders ? (
                            <Box display="flex" justifyContent="center" p={5}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={4} className="animate-fade-in">
                                {[
                                    {
                                        label: 'Total Sales',
                                        val: dashboardStats.totalSales >= 1000
                                            ? `₹${(dashboardStats.totalSales / 1000).toFixed(1)}k`
                                            : `₹${dashboardStats.totalSales}`,
                                        color: '#6366f1',
                                        subtitle: 'Confirmed Revenue'
                                    },
                                    { label: 'Total Orders', val: dashboardStats.totalOrders.toLocaleString(), color: '#10b981', subtitle: 'Successful Orders' },
                                    { label: 'Active Users', val: dashboardStats.activeUsers.toLocaleString(), color: '#f59e0b', subtitle: 'Platform Members' },
                                    { label: 'Low Stock', val: `${dashboardStats.lowStock} Items`, color: '#ef4444', subtitle: 'Threshold < 10 Units' }
                                ].map((stat, i) => (
                                    <Grid item xs={12} sm={6} md={3} key={i}>
                                        <Card className="glass-panel" sx={{ borderRadius: 4 }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Typography variant="body2" color="text.secondary" fontWeight="600">{stat.label}</Typography>
                                                <Typography variant="h4" fontWeight="800" sx={{ mt: 1, color: stat.color }}>{stat.val}</Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, mt: 0.5, display: 'block' }}>
                                                    {stat.subtitle}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {/* Recent Activity / Chart Section */}
                        <Box mt={6} className="animate-fade-in">
                            <Card className="glass-panel" sx={{ borderRadius: 6, p: 4 }}>
                                <Box display="flex" justifyContent="space-between" mb={4}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">Revenue Intelligence</Typography>
                                        <Typography variant="body2" color="text.secondary">Sales performance across the last 7 days</Typography>
                                    </Box>
                                    <Chip label="Real-time Beta" color="secondary" size="small" variant="outlined" />
                                </Box>
                                <Box height={400}>
                                    <Line
                                        data={{
                                            labels: dashboardStats.salesTrends.map(t => t.date),
                                            datasets: [{
                                                label: 'Sales Revenue (₹)',
                                                data: dashboardStats.salesTrends.map(t => t.total),
                                                borderColor: '#6366f1',
                                                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                                fill: true,
                                                tension: 0.4,
                                                pointRadius: 6,
                                                pointBackgroundColor: '#fff',
                                                pointBorderWidth: 3,
                                                pointBorderColor: '#6366f1'
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#1e293b',
                                                    padding: 12,
                                                    titleFont: { size: 14, weight: 'bold' },
                                                    bodyFont: { size: 13 },
                                                    cornerRadius: 8,
                                                    displayColors: false
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: 'rgba(224, 224, 224, 0.4)', drawBorder: false },
                                                    ticks: { color: '#64748b' }
                                                },
                                                x: {
                                                    grid: { display: false },
                                                    ticks: { color: '#64748b' }
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Box>
                    </Box>
                )}

                {/* --- USER MANAGEMENT SECTION --- */}
                {activeTab === 'users' && (
                    <Box className="animate-fade-in">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="bold">Active System Users</Typography>
                            <Button
                                variant="contained"
                                className="premium-btn"
                                startIcon={<AdminPanelSettingsIcon />}
                                onClick={() => setActiveTab('add_admin')}
                            >
                                Register New Admin
                            </Button>
                        </Box>

                        {userError && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{userError}</Alert>}

                        <Paper className="glass-panel" sx={{ p: 2, mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FilterListIcon sx={{ color: '#64748b' }} />
                                <Typography variant="body2" fontWeight="600">Filter by Role:</Typography>
                                <ToggleButtonGroup
                                    value={userFilter}
                                    exclusive
                                    onChange={(e, next) => next && setUserFilter(next)}
                                    size="small"
                                    color="primary"
                                >
                                    <ToggleButton value="ALL">All Users</ToggleButton>
                                    <ToggleButton value="ROLE_ADMIN">Admins Only</ToggleButton>
                                    <ToggleButton value="ROLE_CUSTOMER">Customers Only</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Paper>

                        <Paper className="glass-panel" sx={{ overflow: 'hidden' }}>
                            <Box sx={{ p: 0 }}>
                                {userLoading && users.length === 0 ? <Box p={4} textAlign="center"><CircularProgress /></Box> :
                                    filteredUsers.length === 0 ? <Box p={4} textAlign="center"><Typography color="text.secondary">No users found.</Typography></Box> : (
                                        filteredUsers.map(u => (
                                            <Box key={u.id} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                                                <Avatar sx={{ bgcolor: u.role === 'ROLE_ADMIN' ? '#eff6ff' : '#f0fdf4', color: u.role === 'ROLE_ADMIN' ? '#3b82f6' : '#22c55e', mr: 2 }}>
                                                    {u.role === 'ROLE_ADMIN' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{u.username}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                                                </Box>
                                                <Chip
                                                    label={u.role.replace('ROLE_', '')}
                                                    color={u.role === 'ROLE_ADMIN' ? 'primary' : 'success'}
                                                    variant="outlined"
                                                    sx={{ mr: 2 }}
                                                />
                                                <IconButton onClick={() => handleDeleteUser(u.id)} color="error"><DeleteOutlineIcon /></IconButton>
                                            </Box>
                                        ))
                                    )}
                            </Box>
                        </Paper>
                    </Box>
                )}

                {activeTab === 'add_admin' && (
                    <Box className="animate-fade-in">
                        <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveTab('users')} sx={{ mb: 3 }}>Back to Users</Button>
                        <Card className="glass-panel" sx={{ maxWidth: 600, mx: 'auto' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>Privileged Admin Registration</Typography>
                                {userError && <Alert severity="error" sx={{ mb: 3 }}>{userError}</Alert>}
                                {userSuccess && <Alert severity="success" sx={{ mb: 3 }}>{userSuccess}</Alert>}
                                <form onSubmit={handleAdminRegister}>
                                    <TextField fullWidth label="Username" sx={{ mb: 3 }} required value={adminRegData.username} onChange={(e) => setAdminRegData({ ...adminRegData, username: e.target.value })} />
                                    <TextField fullWidth label="Email Address" type="email" sx={{ mb: 3 }} required value={adminRegData.email} onChange={(e) => setAdminRegData({ ...adminRegData, email: e.target.value })} />
                                    <TextField fullWidth label="Password" type="password" sx={{ mb: 3 }} required value={adminRegData.password} onChange={(e) => setAdminRegData({ ...adminRegData, password: e.target.value })} />
                                    <Button type="submit" variant="contained" className="premium-btn" fullWidth sx={{ py: 1.5 }}>Authorize Admin Member</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </Box>
                )}



                {activeTab === 'add_product' && (
                    <Box className="animate-fade-in">
                        <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveTab('inventory')} sx={{ mb: 3 }}>Back to Warehouse</Button>
                        <Card className="glass-panel" sx={{ maxWidth: 800, mx: 'auto' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>Create New Product</Typography>
                                {prodError && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{prodError}</Alert>}
                                {prodSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{prodSuccess}</Alert>}
                                <form onSubmit={handleProductSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Product Name" variant="outlined" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Price (₹)" type="number" variant="outlined" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Category</InputLabel>
                                                <Select value={productCategory} label="Category" onChange={(e) => setProductCategory(e.target.value)}>
                                                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Description" multiline rows={4} variant="outlined" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                className="premium-btn"
                                                fullWidth
                                                sx={{ py: 1.5 }}
                                                disabled={prodLoading}
                                            >
                                                {prodLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Save to Warehouse'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* --- INVENTORY MANAGEMENT SECTION --- */}
                {activeTab === 'inventory' && (
                    <Box className="animate-fade-in">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="bold">Warehouse Stock & Controls</Typography>
                            <Button variant="contained" className="premium-btn" startIcon={<AddCircleOutlineIcon />} onClick={() => setActiveTab('add_product')}>Add New Product</Button>
                        </Box>

                        {invError && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{invError}</Alert>}
                        {invSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{invSuccess}</Alert>}

                        <Paper className="glass-panel" sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FilterListIcon sx={{ color: '#64748b' }} />
                                <Typography variant="body2" fontWeight="600">Filter by Category:</Typography>
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <Select
                                        value={invCategoryFilter}
                                        onChange={(e) => setInvCategoryFilter(e.target.value)}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        <MenuItem value="ALL">All Categories</MenuItem>
                                        {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>

                        <Paper className="glass-panel" sx={{ overflow: 'hidden' }}>
                            <Box sx={{ p: 0 }}>
                                {invLoading && products.length === 0 ? <Box p={4} textAlign="center"><CircularProgress /></Box> : (
                                    products.filter(p => invCategoryFilter === 'ALL' || p.category?.id === invCategoryFilter).length === 0 ?
                                        <Box p={4} textAlign="center"><Typography color="text.secondary">No products found for this category.</Typography></Box> :
                                        products.filter(p => invCategoryFilter === 'ALL' || p.category?.id === invCategoryFilter).map(product => {
                                            const item = inventory.find(inv => inv.productId === product.id) || {
                                                productId: product.id,
                                                quantity: 0,
                                                status: 'ACTIVE',
                                                isDefault: true
                                            };
                                            return (
                                                <Box key={product.id} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                                                    <Avatar sx={{ bgcolor: '#f0f9ff', color: '#0ea5e9', mr: 2 }}>📦</Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle1" fontWeight="bold">{product.name}</Typography>
                                                            <Chip label={`₹${product.price}`} size="small" variant="outlined" color="primary" />
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{product.description}</Typography>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {product.category?.name && <Chip size="small" label={product.category.name} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, height: 20, fontSize: '0.65rem' }} />}
                                                            {item.status === 'ACTIVE' && <Chip size="small" icon={<CheckCircleOutlinedIcon />} label="Active" color="success" variant="outlined" />}
                                                            {item.status === 'TEMPORARY_DEACTIVATED' && <Chip size="small" icon={<PauseCircleOutlinedIcon />} label="Temp Deactivated" color="warning" variant="outlined" />}
                                                            {item.status === 'PERMANENT_DEACTIVATED' && <Chip size="small" icon={<CancelOutlinedIcon />} label="Perm Deactivated" color="error" variant="outlined" />}
                                                            {item.isDefault && <Chip size="small" label="New Item" color="info" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                                        </Box>
                                                    </Box>

                                                    <Stack direction="row" spacing={3} alignItems="center">
                                                        <Box textAlign="right">
                                                            <Typography variant="caption" color="text.secondary" fontWeight="600">IN STOCK</Typography>
                                                            <Typography variant="h6" fontWeight="800" color={item.quantity < 10 ? 'error' : 'primary'}>
                                                                {item.quantity} units
                                                            </Typography>
                                                        </Box>

                                                        <Divider orientation="vertical" flexItem />

                                                        <Box display="flex" gap={1}>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<EditOutlinedIcon />}
                                                                onClick={() => { setSelectedInv(item); setNewQuantity(item.quantity); setShowStockModal(true); }}
                                                                sx={{ borderRadius: 2 }}
                                                            >
                                                                Adj. Stock
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color={item.status === 'ACTIVE' ? 'warning' : item.status === 'TEMPORARY_DEACTIVATED' ? 'error' : 'success'}
                                                                onClick={() => handleStatusToggle(item.productId, item.status)}
                                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                                            >
                                                                {item.status === 'ACTIVE' ? 'Deactivate' : item.status === 'TEMPORARY_DEACTIVATED' ? 'Perm Deactivate' : 'Reactivate'}
                                                            </Button>
                                                            <IconButton onClick={() => handleDeleteProduct(product.id)} color="error" size="small"><DeleteOutlineIcon /></IconButton>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            );
                                        })
                                )}
                            </Box>
                        </Paper>

                        {/* Stock Adjustment Modal (Simple Overlay) */}
                        {showStockModal && (
                            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Card sx={{ width: 400, borderRadius: 4, p: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>Adjust Inventory Level</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={3}>Enter the absolute physical count for this product.</Typography>
                                    <TextField
                                        fullWidth
                                        label="New Quantity"
                                        type="number"
                                        value={newQuantity}
                                        onChange={(e) => setNewQuantity(e.target.value)}
                                        sx={{ mb: 3 }}
                                    />
                                    <Box display="flex" gap={2}>
                                        <Button fullWidth variant="outlined" onClick={() => setShowStockModal(false)}>Cancel</Button>
                                        <Button fullWidth variant="contained" className="premium-btn" onClick={handleStockUpdate}>Confirm Update</Button>
                                    </Box>
                                </Card>
                            </Box>
                        )}
                    </Box>
                )}

                {/* --- CATEGORIES SECTION --- */}
                {activeTab === 'categories' && (
                    <Box className="animate-fade-in">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="bold">Category Vault</Typography>
                            <Button variant="contained" className="premium-btn" startIcon={<AddCircleOutlineIcon />} onClick={() => setActiveTab('add_category')}>Add New Category</Button>
                        </Box>
                        <Paper className="glass-panel">
                            {catLoading && categories.length === 0 ? <Box p={4} textAlign="center"><CircularProgress /></Box> : (
                                <List sx={{ p: 0 }}>
                                    {categories.map(c => (
                                        <ListItem key={c.id} divider sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: '0.2s' }}>
                                            <Avatar sx={{ bgcolor: '#fdf2f8', color: '#db2777', mr: 2 }}>📂</Avatar>
                                            <ListItemText primary={c.name} secondary={c.description} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Box>
                )}

                {activeTab === 'add_category' && (
                    <Box className="animate-fade-in">
                        <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveTab('categories')} sx={{ mb: 3 }}>Back to Categories</Button>
                        <Card className="glass-panel" sx={{ maxWidth: 600, mx: 'auto' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>Register Category</Typography>
                                {catError && <Alert severity="error" sx={{ mb: 3 }}>{catError}</Alert>}
                                {catSuccess && <Alert severity="success" sx={{ mb: 3 }}>{catSuccess}</Alert>}
                                <form onSubmit={handleCategorySubmit}>
                                    <TextField fullWidth label="Category Name" sx={{ mb: 3 }} variant="outlined" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                                    <TextField fullWidth label="Description" multiline rows={3} sx={{ mb: 3 }} variant="outlined" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} />
                                    <Button type="submit" variant="contained" className="premium-btn" fullWidth>Create Category</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* --- CUSTOMER ORDERS SECTION --- */}
                {activeTab === 'orders' && (
                    <Box className="animate-fade-in">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="bold">Customer Order Management</Typography>
                        </Box>

                        {orderError && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{orderError}</Alert>}
                        {orderSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{orderSuccess}</Alert>}

                        <Paper className="glass-panel" sx={{ p: 2, mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FilterListIcon sx={{ color: '#64748b' }} />
                                <Typography variant="body2" fontWeight="600">Filter by Status:</Typography>
                                <ToggleButtonGroup
                                    value={orderFilter}
                                    exclusive
                                    onChange={(e, next) => next && setOrderFilter(next)}
                                    size="small"
                                    color="primary"
                                >
                                    <ToggleButton value="ALL">All</ToggleButton>
                                    <ToggleButton value="PENDING">Pending</ToggleButton>
                                    <ToggleButton value="PAID">Paid</ToggleButton>
                                    <ToggleButton value="CONFIRMED">Confirmed</ToggleButton>
                                    <ToggleButton value="SHIPPED">Shipped</ToggleButton>
                                    <ToggleButton value="DELIVERED">Delivered</ToggleButton>
                                    <ToggleButton value="CANCELLED">Cancelled</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Paper>

                        <Paper className="glass-panel" sx={{ overflow: 'hidden' }}>
                            <Box sx={{ p: 0 }}>
                                {orderLoading ? <Box p={4} textAlign="center"><CircularProgress /></Box> :
                                    orders.length === 0 ? <Box p={4} textAlign="center"><Typography color="text.secondary">No orders found.</Typography></Box> : (
                                        orders.map(order => (
                                            <Box key={order.id} sx={{ p: 3, display: 'flex', flexDirection: 'column', borderBottom: '1px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e' }}>🛒</Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">Order #{order.id}</Typography>
                                                            <Typography variant="body2" color="text.secondary">Customer ID: {order.userId}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box textAlign="right">
                                                        <Chip
                                                            label={order.status}
                                                            color={getStatusColor(order.status)}
                                                            size="small"
                                                            sx={{ fontWeight: 'bold', mb: 1 }}
                                                        />
                                                        <Typography variant="h6" fontWeight="bold" color="primary">₹{order.totalAmount}</Typography>
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                                    <Box>
                                                        <Typography variant="caption" display="block" color="text.secondary">Items:</Typography>
                                                        <Stack direction="row" spacing={1}>
                                                            {order.items?.map((item, idx) => (
                                                                <Chip key={idx} variant="outlined" size="small" label={`PID:${item.productId} x${item.quantity}`} />
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        <FormControl size="small" sx={{ minWidth: 150 }}>
                                                            <Select
                                                                value={order.status}
                                                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                                                sx={{ height: 32, fontSize: '0.875rem' }}
                                                            >
                                                                <MenuItem value="PENDING">Pending</MenuItem>
                                                                <MenuItem value="PAID">Paid</MenuItem>
                                                                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                                                <MenuItem value="SHIPPED">Shipped</MenuItem>
                                                                <MenuItem value="DELIVERED">Delivered</MenuItem>
                                                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                            </Box>
                        </Paper>
                    </Box>
                )}

                {/* --- ADMIN PROFILE SECTION --- */}
                {activeTab === 'profile' && (
                    <Box textAlign="center" py={10} className="animate-fade-in">
                        <PersonOutlineIcon sx={{ fontSize: 100, opacity: 0.1, mb: 2 }} />
                        <Typography variant="h5" sx={{ opacity: 0.4 }}>This module is currently being optimized.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Dashboard;
