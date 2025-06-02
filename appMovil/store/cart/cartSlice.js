import { createSlice } from '@reduxjs/toolkit';
import { calcularPrecioEmpanadas } from '../../helpers/calcularPrecioEmpanadas';


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
            const {_id, descripcion, precio, seccion, cantidad = 1, docena, mediaDocena} = payload;
            const itemExistente = state.items.find(elem => elem.producto._id === _id);

            if(itemExistente){
                itemExistente.cantidad += cantidad;
            }else{
                state.items.push({
                    producto: {_id, descripcion, precio, seccion},
                    cantidad
                    });
            };

            let total = 0;
            let empanadaCantidad = 0;

            for(const item of state.items){
                if(item.producto.seccion.nombre === 'EMPANADAS'){
                    empanadaCantidad += item.cantidad;
                }else{
                    total += item.producto.precio * item.cantidad
                }
            };
            
            if (empanadaCantidad > 0) {
                const precioU = state.items.find(elem => elem.producto.seccion.nombre === 'EMPANADAS').producto.precio
                
                total += calcularPrecioEmpanadas(empanadaCantidad, docena, mediaDocena, precioU);
                
            }

            //calcular el total
            state.total = total;
        },
        restarCantItem: (state, {payload}) => {

            const indice = state.items.findIndex(elem => elem.producto._id === payload._id);

            if(indice === -1 ) return state.items;

            if(state.items[indice].cantidad <= 1){
                state.items.splice(indice, 1);
            }else{
                state.items[indice].cantidad -= 1;
            };

            let total = 0;
            let empanadaCantidad = 0;

            for(const item of state.items){
                if(item.producto.seccion.nombre === 'EMPANADAS'){
                    empanadaCantidad += item.cantidad;
                }else{
                    total += item.producto.precio * item.cantidad
                }
            };

            if (empanadaCantidad > 0) {
                const precioU = state.items.find(elem => elem.producto.seccion.nombre === 'EMPANADAS').producto.precio
                total += calcularPrecioEmpanadas(empanadaCantidad, payload.docena, payload.mediaDocena, precioU);
            };

            state.total = total;

        },
        sumarCantItem: (state, {payload}) => {
            state.items = state.items.map(elem => {
                if(elem.producto._id === payload._id){
                    elem.cantidad += 1;
                };
                return elem;
            });

            let total = 0;
            let empanadaCantidad = 0;

            for(const item of state.items){
                if(item.producto.seccion.nombre === 'EMPANADAS'){
                    empanadaCantidad += item.cantidad;
                }else{
                    total += item.producto.precio * item.cantidad
                }
            };

            if (empanadaCantidad > 0) {
                const precioU = state.items.find(elem => elem.producto.seccion.nombre === 'EMPANADAS').producto.precio
                total += calcularPrecioEmpanadas(empanadaCantidad, payload.docena, payload.mediaDocena, precioU);
            };

            state.total = total;

            // state.total = state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        },
        quitarItem: (state, {payload}) => {
            const itemExistente = state.items.find(elem => elem.producto._id === payload);

            if(itemExistente){
                state.items = state.items.filter(elem => elem.producto._id !== payload);
            };

            state.total = state.items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
        },
        updatePrecioItem:(state, {payload}) => {
            state.items = state.items.map(elem => {
                if(elem.producto._id === payload._id){
                    elem.producto.precio = payload.precio;
                    return elem;
                };

                return elem
            });
            state.total = state.items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
            state.isCartSaving = false
        }
    }
});


// Action creators are generated for each case reducer function
export const { agregarItem, quitarItem, restarCantItem, savingCart, setEmptyCartValues, sumarCantItem, updatePrecioItem } = cartSlice.actions;