import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProducts, updateProducto } from "../store/product/productSlice";
import seccionApiFunction from "../api/rotiseriaApi";
import {  updatePrecioItem } from "../store/cart/cartSlice";

export const useProductStore = () => {
    const dispatch = useDispatch();
    const {productos} = useSelector(state => state.product);

    const startGetProductos = async() => {
        try {
            const seccionApi = await seccionApiFunction()
            const { data } = await seccionApi.get('producto')
            dispatch(setProducts(data.productos));
        } catch (error) {
            console.log(error.request)
        }

        
    };

    const startHandlePrecio = async(id, precio) => {
        const seccionApi = await seccionApiFunction();
        const { data } = await seccionApi.patch(`producto/precio/${id}`, {precio});
        if(data.ok){
            dispatch(updateProducto(data.newProducto));
            dispatch(updatePrecioItem(data.newProducto));
        }
    };

    return {
        //Atributos
        productos,

        //Metodos
        startGetProductos,
        startHandlePrecio
    }
}