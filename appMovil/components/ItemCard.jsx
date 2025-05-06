import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { quitarItem, restarCantItem, sumarCantItem } from "../store/cart/cartSlice";

export default function ItemCard({_id, image, descripcion, precio, cantidad}){
    const dispatch = useDispatch();

    const handelDeleteItem = () => {
        dispatch(quitarItem(_id));
    };

    return(
        <View style={styles.container}>
            <Image source={image} style={styles.image}/>
            <View style={styles.info}>
                <Text style={styles.descripcion}>{descripcion}</Text>
                <Text style={styles.precio}>${precio.toFixed(2)}</Text>
            </View>
            <View style={styles.acciones}>
                <Button label={"-"} estilos={styles} press={() => dispatch(restarCantItem(_id))}/>
                <Text style={styles.cant}>{cantidad}</Text>
                <Button press={() => dispatch(sumarCantItem(_id))} label={"+"} estilos={styles}/>
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
        backgroundColor: '#444',
        width: '100%',
        marginTop: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 18,
        backgroundColor: '#fff',
    },
    info: {
        flex: 1,
        justifyContent: 'center'
    },
    descripcion: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    precio:{
        fontSize: 20,
        color: '#e6c06a',
        fontWeight: 'bold',
    },  
    acciones: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginLeft: 'auto',
        backgroundColor: '#25292e',
        borderRadius: 25,
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 30,
    },
    cant: {
        color: '#fff',
    },  
    button: {
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