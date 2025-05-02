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
        postVenta: (state) => {
            state.isVentaSaving = false;
        },
    }
});


// Action creators are generated for each case reducer function
export const { postVenta, savingVenta } = ventaSlice.actions;