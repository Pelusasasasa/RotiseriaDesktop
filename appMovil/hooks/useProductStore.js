import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { savingProduct, setProducts, updateProducto } from "../store/product/productSlice";
import seccionApiFunction from "../api/rotiseriaApi";
import {  updatePrecioItem } from "../store/cart/cartSlice";
import { useState } from "react";

export const useProductStore = () => {
    const dispatch = useDispatch();
    const {productos, isSavingProduct} = useSelector(state => state.product);
    const [error, setError] = useState(false);

    const startSaving = async() => {
        dispatch(savingProduct());
    };

    const startGetProductos = async() => {
        try {
            const seccionApi = await seccionApiFunction()
            const { data } = await seccionApi.get('producto')
            dispatch(setProducts(data.productos));
        } catch (error) {
            if (err.message.includes("Failed to connect") || err.message.includes("Network request failed") || err.message.includes("ERR_NETWORK")) {
                setError('Error con el servidor, fijese si esta conectado a la red o el servidor esta funcionando')
            }else{
                setError(error)
            }
        }

        
    };

    const startHandlePrecio = async(id, precio) => {

        dispatch(savingProduct());

        const seccionApi = await seccionApiFunction();
        const { data } = await seccionApi.patch(`producto/precio/${id}`, {precio});

        if(data.ok){
            dispatch(updatePrecioItem(data.newProducto));
            dispatch(updateProducto(data.newProducto));
        }
    };

    return {
        //Atributos
        isSavingProduct,
        productos,

        //Metodos
        startGetProductos,
        startHandlePrecio,
        startSaving
    }
}