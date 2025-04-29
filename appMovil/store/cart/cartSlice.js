import { createSlice } from '@reduxjs/toolkit';

let productos = [
    {
        _id: "1",
        descripcion: 'Pizza 4 Quesos',
        precio: 12000,
        image: 'PlaceholderImage',
        seccion: "Pizzas"
    },
    {   
        _id: "2",
        descripcion: 'Pizza Napolitana',
        precio: 11000,
        image: 'PlaceholderImage',
        seccion: "Pizzas"
    },
    {   
        _id: "3",
        descripcion: 'Papas Fritas',
        precio: 5600,
        image: 'PlaceholderImage',
        seccion: "Guarniciones"
    },
    {   
        _id: "4",
        descripcion: 'Papas Fritas con Chedar',
        precio: 6500,
        seccion: "Guarniciones",
        image: 'PlaceholderImage'
    },
    {   
        _id: "5",
        descripcion: 'Papas Fritas a Caballo',
        precio: 7000,
        image: 'PlaceholderImage',
        seccion: "Guarniciones"
    },
    {   
        _id: "6",
        descripcion: 'Carlito',
        precio: 4500,
        image: 'PlaceholderImage',
        seccion: "Sandwiches"
    },
    {   
        _id: "7",
        descripcion: 'Flan Casero',
        precio: 4000,
        image: 'PlaceholderImage',
        seccion: "Postres"
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
        },
        restarCantItem: (state, {payload}) => {

            const indice = state.items.findIndex(elem => elem._id === payload);

            if(indice === -1 ) return state.items;

            if(state.items[indice].cantidad <= 1){
                state.items.splice(indice, 1);
            }else{
                state.items[indice].cantidad -= 1;
            };

            state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        },
        sumarCantItem: (state, {payload}) => {
            state.items = state.items.map(elem => {
                if(elem._id === payload){
                    elem.cantidad += 1;
                };
                return elem;
            });

            state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        },
        quitarItem: (state, {payload}) => {
            const itemExistente = state.items.find(elem => elem._id === payload);

            if(itemExistente){
                state.items = state.items.filter(elem => elem._id !== payload);
            };

            state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        }
    }
});


// Action creators are generated for each case reducer function
export const { agregarItem, quitarItem, restarCantItem, sumarCantItem } = cartSlice.actions;