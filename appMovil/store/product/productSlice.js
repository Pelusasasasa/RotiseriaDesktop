import { createSlice } from '@reduxjs/toolkit';

export const productSlice = createSlice({
    name: 'product',
    initialState: {
        productos: []
    },
    reducers: {
        emptySetProducts: (state) => {
            state.productos = [];
        },
        setProducts: (state, {payload} ) => {
            state.productos = payload;
        },
    }
});


// Action creators are generated for each case reducer function
export const { emptySetProducts, setProducts } = productSlice.actions;