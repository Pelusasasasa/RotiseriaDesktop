import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../store/product/productSlice";
import seccionApi from "../api/rotiseriaApi";
export const useProductStore = () => {
    const dispatch = useDispatch();
    const {productos} = useSelector(state => state.product);

    const startGetProductos = async() => {
        try {
            const { data } = await seccionApi('producto')
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