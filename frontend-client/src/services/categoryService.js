import api from './api';

export const getAllCategories = async () => {
    const response = await api.get('/api/v1/categories');
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post('/api/v1/categories', categoryData);
    return response.data;
};
