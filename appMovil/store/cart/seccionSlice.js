import { createSlice } from '@reduxjs/toolkit';

export const seccionSlice = createSlice({
    name: 'template',
    initialState: {
        activeSeccion: {
            nombre: 'TODOS'
        },
        secciones: []
    },  
    reducers: {
        setActiveSeccion: (state, {payload}) =>{
            state.activeSeccion = state.secciones.find(elem => elem._id === payload._id);
        },
        getSecciones: (state, { payload }) => {
            state.secciones = payload;
        }
    }
});


// Action creators are generated for each case reducer function
export const { getSecciones, setActiveSeccion } = seccionSlice.actions;
