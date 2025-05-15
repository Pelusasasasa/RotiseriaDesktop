import { createSlice } from '@reduxjs/toolkit';

export const productSlice = createSlice({
    name: 'product',
    initialState: {
        productos: [],
        isSavingProduct: false
    },
    reducers: {
        emptySetProducts: (state) => {
            state.productos = [];
        },
        savingProduct: (state) => {
            state.isSavingProduct = true
        },
        setProducts: (state, {payload} ) => {
            state.productos = payload;
        },
        updateProducto: (state, {payload}) => {
            state.productos = state.productos.map(elem => {
                if(elem._id === payload._id){
                    return payload
                };

                return elem;
            });
            state.isSavingProduct = false
        },
    }
});


// Action creators are generated for each case reducer function
export const { emptySetProducts, savingProduct, setProducts, updateProducto } = productSlice.actions;