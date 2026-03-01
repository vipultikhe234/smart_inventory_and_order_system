import api from './api';

export const getAllProducts = async (page = 0, size = 10) => {
    const response = await api.get('/api/v1/products', {
        params: { page, size }
    });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/v1/products/${id}`);
    return response.data;
};

// Admin Routes
export const createProduct = async (productData) => {
    const response = await api.post('/api/v1/products', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/api/v1/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    await api.delete(`/api/v1/products/${id}`);
};
