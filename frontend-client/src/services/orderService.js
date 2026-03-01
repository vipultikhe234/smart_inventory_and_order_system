import api from './api';

export const placeOrder = async (orderData) => {
    // orderData: { items: [{ productId, quantity }] }
    const response = await api.post('/api/v1/orders', orderData);
    return response.data;
};

export const getUserOrders = async () => {
    const response = await api.get('/api/v1/orders/user');
    return response.data;
};

export const verifyPayment = async (sessionId) => {
    const response = await api.post('/api/v1/orders/verify', null, {
        params: { sessionId }
    });
    return response.data;
};

export const getAllOrders = async (status = null) => {
    const response = await api.get('/api/v1/orders', {
        params: status && status !== 'ALL' ? { status } : {}
    });
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(`/api/v1/orders/${orderId}/status`, null, {
        params: { status }
    });
    return response.data;
};

export const getOrderStats = async () => {
    const response = await api.get('/api/v1/orders/stats');
    return response.data;
};
