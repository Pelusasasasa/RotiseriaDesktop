import { useSelector } from "react-redux";
export const useProductStore = () => {
    const {productos} = useSelector(state => state.product);

    const startGetProductos = async() => {
    };

    return {
        //Atributos
        productos,

        //Metodos
        startGetProductos
    }
}