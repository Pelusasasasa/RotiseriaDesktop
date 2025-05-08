import { createSlice } from '@reduxjs/toolkit';

export const ventaSlice = createSlice({
    name: 'venta',
    initialState: {
        isVentaSaving: false,
        venta: {}
    },
    reducers: {
        savingVenta: (state) => {
            state.isVentaSaving = true;
        },
        savingVentaFalse: (state) => {
            state.isVentaSaving = false;
        },
        postVenta: (state) => {
            state.isVentaSaving = false;
        },
    }
});


// Action creators are generated for each case reducer function
export const { postVenta, savingVenta, savingVentaFalse } = ventaSlice.actions;