import { useDispatch, useSelector } from "react-redux";

export const useCartStore = () => {
    const dispatch = useDispatch();
    const {items, total} = useSelector(state => state.cart);

    return {
        //Propiedades
        items,
        total,

        //Metodos

    }

};