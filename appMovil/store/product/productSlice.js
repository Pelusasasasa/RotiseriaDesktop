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
        updateProducto: (state, {payload}) => {
            state.productos = state.productos.map(elem => {
                if(elem._id === payload._id){
                    return payload
                };

                return elem;
            });
        }
    }
});


// Action creators are generated for each case reducer function
export const { emptySetProducts, setProducts, updateProducto } = productSlice.actions;