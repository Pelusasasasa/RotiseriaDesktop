import { useDispatch, useSelector } from "react-redux";
import  { seccionApiFunction } from "../api/rotiseriaApi";
import { getSecciones } from "../store/cart/seccionSlice";

export const useSeccionStore = () => {
    const dispatch = useDispatch();
    const { secciones } = useSelector(state => state.section);

const startGetSecciones = async() => {

        try {
            const seccionApi = await seccionApiFunction()
            const { data } = await seccionApi.get('/seccion');
            
            dispatch(getSecciones(data.secciones));

        } catch (error) {
            
            console.log(error);
        }
    };

    return {
        //Propiedades
        secciones,

        //Metodos
        startGetSecciones
    }

};