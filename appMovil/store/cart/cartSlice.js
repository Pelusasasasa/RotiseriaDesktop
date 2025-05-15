import { createSlice } from '@reduxjs/toolkit';


export const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        total: 0,
        isCartSaving: false
    },
    reducers: {
        savingCart: (state) => {
            state.isCartSaving = true
        },
        setEmptyCartValues: (state) => {
            state.items = [];
            state.total = 0;
        },
        agregarItem: (state, {payload}) => {
            const {_id, descripcion, precio, seccion} = payload;
            const itemExistente = state.items.find(elem => elem._id === _id);

            if(itemExistente){
                itemExistente.cantidad += 1;
            }else{
                state.items.push({_id, descripcion, precio, cantidad: 1, seccion});
            };

            //calcular el total
            state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
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
        },
        updatePrecioItem:(state, {payload}) => {
            state.items = state.items.map(elem => {
                if(elem._id === payload._id){
                    elem.precio = payload.precio;
                    return elem;
                };

                return elem
            });
            state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            state.isCartSaving = false
        }
    }
});


// Action creators are generated for each case reducer function
export const { agregarItem, quitarItem, restarCantItem, savingCart, setEmptyCartValues, sumarCantItem, updatePrecioItem } = cartSlice.actions;