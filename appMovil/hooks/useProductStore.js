import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../store/product/productSlice";
export const useProductStore = () => {
    const dispatch = useDispatch();
    const {productos} = useSelector(state => state.product);

    const startGetProductos = async() => {
        try {
            const { data } = await axios.get(`http://localhost:3000/rotiseria/producto`);
            dispatch(setProducts(data.productos));
        } catch (error) {
            console.log(error)
        }

        
    };

    return {
        //Atributos
        productos,

        //Metodos
        startGetProductos
    }
}