import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../services/cartService';
import { toast } from 'react-toastify';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
    try {
        const response = await cartService.getCartItems();
        return response;
    } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
    }
});

export const addToCart = createAsyncThunk('cart/add', async (product, { rejectWithValue }) => {
    try {
        const cartRequest = {
            productId: product.id || product.productId,
            quantity: 1
        };
        const response = await cartService.addToCartAPI(cartRequest);
        toast.success("Added to cart!");
        return response;
    } catch (err) {
        toast.error(err.response?.data?.error || "Error adding item");
        return rejectWithValue(err.response?.data || err.message);
    }
});

export const removeFromCart = createAsyncThunk('cart/decrement', async (productId, { rejectWithValue }) => {
    try {
        const response = await cartService.decrementCartItemAPI(productId);
        return response;
    } catch (err) {
        toast.error(err.response?.data?.error || "Error decrementing item");
        return rejectWithValue(err.response?.data || err.message);
    }
});

export const deleteFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
    try {
        const response = await cartService.removeFromCartAPI(productId);
        toast.success("Item removed from cart");
        return response;
    } catch (err) {
        toast.error(err.response?.data?.error || "Error removing item");
        return rejectWithValue(err.response?.data || err.message);
    }
});

export const incrementInCart = createAsyncThunk('cart/increment', async (productId, { rejectWithValue }) => {
    try {
        const response = await cartService.incrementCartItemAPI(productId);
        return response;
    } catch (err) {
        toast.error(err.response?.data?.error || "Error incrementing item");
        return rejectWithValue(err.response?.data || err.message);
    }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
    try {
        await cartService.clearCartAPI();
        return null;
    } catch (err) {
        toast.error("Error clearing cart");
        return rejectWithValue(err.message);
    }
});

const initialState = {
    cartData: {
        items: [],
        subtotal: 0,
        tax: 0,
        totalAmount: 0,
        totalItems: 0
    },
    status: 'idle',
    error: null
};

// Map backend state to slice
const handleFulfilled = (state, action) => {
    if (action.payload) {
        state.cartData = action.payload;
    }
    state.status = 'succeeded';
    state.error = null;
};

const handleRejected = (state, action) => {
    state.status = 'failed';
    state.error = action.payload?.error || action.error.message;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(clearCart.fulfilled, (state) => {
                state.cartData = initialState.cartData;
                state.status = 'succeeded';
            });

        // Handle all other fulfilled actions dynamically
        // They all return the same CartResponse from the backend
        builder.addMatcher(
            (action) => [
                fetchCart.fulfilled.type,
                addToCart.fulfilled.type,
                removeFromCart.fulfilled.type,
                deleteFromCart.fulfilled.type,
                incrementInCart.fulfilled.type
            ].includes(action.type),
            handleFulfilled
        );

        builder.addMatcher(
            (action) => [
                fetchCart.rejected.type,
                addToCart.rejected.type,
                removeFromCart.rejected.type,
                deleteFromCart.rejected.type,
                incrementInCart.rejected.type,
                clearCart.rejected.type
            ].includes(action.type),
            handleRejected
        );

        builder.addMatcher(
            (action) => action.type.endsWith('/pending'),
            (state) => { state.status = 'loading'; }
        );
    }
});

export default cartSlice.reducer;
