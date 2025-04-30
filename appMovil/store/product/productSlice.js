import { createSlice } from '@reduxjs/toolkit';

export const productSlice = createSlice({
    name: 'product',
    initialState: {
        productos: []
    },
    reducers: {
        setProducts: (state, {payload} ) => {
            state.productos = payload;
        },
    }
});


// Action creators are generated for each case reducer function
export const { setProducts } = productSlice.actions;