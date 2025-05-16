import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { quitarItem, restarCantItem, sumarCantItem } from "../store/cart/cartSlice";
import Button from "./Button";
import ModalPrecio from "./ModalPrecio";

export default function ItemCard({_id, image, descripcion, precio, cantidad}){
    const dispatch = useDispatch();
    const [urlImg, setUrlImg] = useState('');
    const [modal, setModal] = useState(false);
    const timeOutRef = useRef(null);

    //Cargamos la ip inicial
    useEffect(() => {
        const cargar = async() => {
            const ip = await AsyncStorage.getItem('server_ip')
            setUrlImg(ip);
        };

        cargar();
    }, []);

    const handelDeleteItem = () => {
        dispatch(quitarItem(_id));
    };

    //Es para saber si se mantiene presionado el card
    const manejarPresionado = () => {
        timeOutRef.current = setTimeout(() => {
            handleModalPrecio()
        }, 750);
    };

    //Si se presiona por cierto tiempo se abre el mdoal para cambiar el precio
    const handleModalPrecio = () => {
        setModal(true);
    };

    //Cundo soltamos el card se reinicial el contador
    const cancelarPresionado = () => {
        clearTimeout(timeOutRef.current)
    };

    return(
        <>
            <Pressable 
                style={styles.container}
                onPressIn={manejarPresionado}
                onPressOut={cancelarPresionado} 
                >
                <Image source={`${urlImg}/rotiseria/img/${_id}.png`} style={styles.image}/>
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
            </Pressable>
            
            <ModalPrecio activado={modal} id={_id} precio={precio} setModal={setModal} />
        </>
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
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
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
        borderRadius: 15,
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
        borderRadius: 15
    },
    buttonDelete: {
        justifyContent: 'center',
        marginRight: 5,
    },
    delete:{
        alignSelf: 'center',
    }
});