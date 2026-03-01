import api from './api';

export const getCartItems = async () => {
    const response = await api.get('/api/v1/cart');
    return response.data;
};

export const addToCartAPI = async (cartRequest) => {
    // cartRequest: { productId, quantity }
    const response = await api.post('/api/v1/cart/add', cartRequest);
    return response.data;
};

export const incrementCartItemAPI = async (productId) => {
    const response = await api.put(`/api/v1/cart/increment/${productId}`);
    return response.data;
};

export const decrementCartItemAPI = async (productId) => {
    const response = await api.put(`/api/v1/cart/decrement/${productId}`);
    return response.data;
};

export const removeFromCartAPI = async (productId) => {
    const response = await api.delete(`/api/v1/cart/remove/${productId}`);
    return response.data;
};

export const clearCartAPI = async () => {
    await api.delete('/api/v1/cart/empty');
};
