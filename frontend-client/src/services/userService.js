import api from './api';

export const getAllUsers = async () => {
    // Calling the more specific admin-only endpoint
    const response = await api.get('/api/v1/users/admin/list');
    return response.data;
};

export const deleteUser = async (id) => {
    await api.delete(`/api/v1/users/admin/delete/${id}`);
};

export const registerAdmin = async (userData) => {
    // We can use the same register endpoint but ensure role is set to ADMIN
    const response = await api.post('/api/v1/users/auth/register', {
        ...userData,
        role: 'ADMIN'
    });
    return response.data;
};

export const getUserStats = async () => {
    const response = await api.get('/api/v1/users/admin/stats');
    return response.data;
};
