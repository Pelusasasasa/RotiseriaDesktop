import { Pressable, StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setActiveSeccion } from "../store/cart/seccionSlice";

export default function CategoriaCard({ _id, nombre, catSelect, setCatSelect }){
    const dispatch = useDispatch();
    const {activeSeccion} = useSelector(state => state.section);
    const handleSecction = () => {
        dispatch(setActiveSeccion({_id, nombre})); 
    };

    return (
        <Pressable onPress={handleSecction} style={styles.card}>
            <Text style={[
                styles.nombre,
                nombre === activeSeccion?.nombre && {backgroundColor: '#000', color: '#fff'}
            ]}>
                {nombre}
            </Text>
        </Pressable>
    )
};


const styles = StyleSheet.create({
    nombre: {
        borderWidth: 1,
        borderColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        borderRadius: 5
    }
})