import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../store/product/productSlice";
import seccionApiFunction from "../api/rotiseriaApi";

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

    return {
        //Atributos
        productos,

        //Metodos
        startGetProductos
    }
}