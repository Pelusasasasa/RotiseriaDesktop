import { useDispatch, useSelector } from "react-redux";
import { setEmptyCartValues } from "../store/cart/cartSlice";

export const useCartStore = () => {

    const dispatch = useDispatch();
    const {items, total} = useSelector(state => state.cart);

    const emptyCart = () => {
        dispatch(setEmptyCartValues());
    }
    
    return {
        //Propiedades
        items,
        total,

        //Metodos
        emptyCart

    }

};