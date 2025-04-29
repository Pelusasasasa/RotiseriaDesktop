import { createSlice } from '@reduxjs/toolkit';

export const seccionSlice = createSlice({
    name: 'template',
    initialState: {
        activeSeccion: {
            title: 'Todos'
        },
        secciones: []
    },
    reducers: {
        setActiveSeccion: (state, {payload}) =>{
            state.activeSeccion = categorias.find(elem => elem._id === payload);
        }
    }
});


// Action creators are generated for each case reducer function
export const { setActiveSeccion } = seccionSlice.actions;

let categorias = [
    {
        title: 'Todos',
        _id: "1",
    },
    {
        _id: "2",
        title: 'Carnes'
    },
    {
        _id: "3",
        title: 'Empanadas'
    },
    {
        _id: "4",
        title: 'Bebidas'
    },
    {
        _id: "5",
        title: 'Guarniciones'
    },
    {
        _id: "6",
        title: 'Postres'
    },
];