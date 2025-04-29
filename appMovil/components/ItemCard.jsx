import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { quitarItem } from "../store/cart/cartSlice";

export default function ItemCard({_id, image, descripcion, precio, cantidad}){
    const dispatch = useDispatch();
    const handelDeleteItem = () => {
        dispatch(quitarItem(_id));
    };

    return(
        <View style={styles.container}>
            <Image source={image} style={styles.image}/>
            <View>
                <Text style={styles.descripcion}>{descripcion}</Text>
                <Text>${precio} c/u</Text>
            </View>
            <View style={styles.acciones}>
                <Button label={"-"} estilos={styles} press={() => {}}/>
                <Text style={styles.cant}>{cantidad}</Text>
                <Button label={"+"} estilos={styles} press={() => {}}/>
            </View>
            <Pressable style={styles.buttonDelete} onPress={handelDeleteItem}>
                <Ionicons name="trash" size={25} color={'red'} style={styles.delete}/>
            </Pressable>
        </View>
    )
};

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        gap: 15
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 18,
    },
    descripcion: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    acciones: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginLeft: 'auto',
    },
    button: {
        backgroundColor: '#fff',
        color: '#000',
        borderColor: 'gray',
        borderRadius: 5,
        borderWidth: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonDelete: {
        justifyContent: 'center',
        marginRight: 5,
    },
    delete:{
        alignSelf: 'center',
    }
});