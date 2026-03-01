import api from './api';

export const getAllInventory = async () => {
    const response = await api.get('/api/v1/inventory');
    return response.data;
};

export const getInventoryByProductId = async (productId) => {
    const response = await api.get(`/api/v1/inventory/${productId}`);
    return response.data;
};

export const updateStock = async (inventoryData) => {
    // inventoryData: { productId, quantity, status }
    const response = await api.post('/api/v1/inventory/update', inventoryData);
    return response.data;
};

export const updateInventoryStatus = async (productId, status) => {
    // status: 'ACTIVE', 'TEMPORARY_DEACTIVATED', 'PERMANENT_DEACTIVATED'
    const response = await api.put(`/api/v1/inventory/${productId}/status?status=${status}`);
    return response.data;
};

export const getInventoryStats = async () => {
    const response = await api.get('/api/v1/inventory/stats');
    return response.data;
};
