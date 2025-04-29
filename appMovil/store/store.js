import { configureStore } from '@reduxjs/toolkit';
import { cartSlice } from './cart/cartSlice';
import { seccionSlice } from './cart/seccionSlice';
import { productSlice } from './product/productSlice';

export const store = configureStore({
    reducer: {
        product: productSlice.reducer,
        section: seccionSlice.reducer,
        cart: cartSlice.reducer
    }
});