import { configureStore } from '@reduxjs/toolkit';
import { cartSlice } from './cart/cartSlice';
import { seccionSlice } from './cart/seccionSlice';

export const store = configureStore({
    reducer: {
        section: seccionSlice.reducer,
        cart: cartSlice.reducer
    }
});