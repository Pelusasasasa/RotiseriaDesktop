import { useDispatch, useSelector } from "react-redux";
import seccionApi from "../api/rotiseriaApi";
import { postVenta } from "../store/venta/ventaSlice";

export const useVentaStore = () => {

    const dispatch = useDispatch();
    const {isVentaSaving} = useSelector(state => state.venta);

    const startPostVenta = async(formState, total, items) => {
        try {
            const venta = {};
            venta.cliente = formState.nombre;
            venta.direccion = formState.domicilio;
            venta.telefono = formState.telefono;
            venta.precio = total;
            venta.listaProductos = items;
            venta.tipoComp = 'Comprobante'

            const { data} = await seccionApi.post('/venta', venta);

            dispatch(postVenta());
            return data.ok;
        } catch (error) {
            console.log(error);
            console.log(error.requres.data.msg);
        }
    };

    return {
        //Propiedades
        isVentaSaving,

        //Metodos
        startPostVenta

    }

};