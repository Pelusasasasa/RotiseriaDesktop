import { createSlice } from '@reduxjs/toolkit';

let productos = [
    {
        _id: "2",
        descripcion: 'Pizza',
        precio: 12000,
        image: 'PlaceholderImage'
    },
    {   
        _id: "1",
        descripcion: 'Papas Fritas',
        precio: 5600,
        image: 'PlaceholderImage'
    }
];

export const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        total: 0
    },
    reducers: {
        agregarItem: (state, {payload}) => {
            const {_id, descripcion, precio, seccion} = productos.find(elem => elem._id === payload);
            const itemExistente = state.items.find(elem => elem._id === _id);

            if(itemExistente){
                itemExistente.cantidad += 1;
            }else{
                state.items.push({_id, descripcion, precio, cantidad: 1, seccion});
            };

            //calcular el total
            state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            console.log(state.items);
        }
    }
});


// Action creators are generated for each case reducer function
export const { agregarItem } = cartSlice.actions;