import { useDispatch } from "react-redux";
import seccionApiFunction from "../api/rotiseriaApi";
import { useSelector } from 'react-redux';
import { setPrecios } from "../store/cartaEmpanada/cartaEmpanadaSlice";

export const useCartaEmpanadaStore = () => {
    const dispatch = useDispatch();
    const { docena, mediaDocena } = useSelector(state => state.cartaEmpanada);

    const startGetPreciosCarta = async() => {
        const seccionApi = await seccionApiFunction()
        const { data } = await seccionApi.get('carta');
        dispatch(setPrecios(data.carta));
    };

    return {
        //atributos
        docena,
        mediaDocena,

        //metodos
        startGetPreciosCarta
    }

};