import api from './api';

export const loginUser = async (credentials) => {
    const response = await api.post('/api/v1/users/auth/login', credentials);
    return response.data; // Expected format: { token: '...', role: 'ROLE_ADMIN', username: 'admin' }
};

export const registerUser = async (userData) => {
    const response = await api.post('/api/v1/users/auth/register', userData);
    return response.data;
};
