import { createSlice } from '@reduxjs/toolkit';

export const cartaEmpanada = createSlice({
    name: 'product',
    initialState: {
        docena: 0,
        mediaDocena: 0
    },
    reducers: {
        setPrecios: (state, {payload}) => {
            state.docena = payload.docena;
            state.mediaDocena = payload.mediaDocena;
        },
        
    }
});


// Action creators are generated for each case reducer function
export const { setPrecios } = cartaEmpanada.actions;