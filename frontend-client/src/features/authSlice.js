import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    userRole: localStorage.getItem('role') || 'GUEST',
    username: localStorage.getItem('username') || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.userRole = action.payload.role;
            state.username = action.payload.username;

            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('role', action.payload.role);
            localStorage.setItem('username', action.payload.username);
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.userRole = 'GUEST';
            state.username = null;

            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
        },
    },
});

export default authSlice.reducer;
export const { loginSuccess, logout } = authSlice.actions;
