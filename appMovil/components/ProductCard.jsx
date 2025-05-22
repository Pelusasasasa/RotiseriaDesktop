import {  StyleSheet, Pressable, Text, View } from "react-native";
import { Image } from 'expo-image';
import Button from "./Button";
import { useDispatch } from "react-redux";
import { agregarItem } from "../store/cart/cartSlice";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import seccionApiFunction from "../api/rotiseriaApi";


export default function ProductoCard({_id, descripcion, image, precio, seccion='Empanadas'}){
    const dispatch = useDispatch();
    const [urlImg, setUrlImg] = useState('');

    useEffect(() => {
        const cargar = async() => {
             const ip = await AsyncStorage.getItem('server_ip')
             setUrlImg(ip);
        };

        cargar();
    }, []);

    const press = () => {
        dispatch(agregarItem({_id, descripcion, precio, seccion}));    
    };

    return(
        <Pressable style={
            ({pressed}) => [
                styles.container,
                {opacity: pressed ? 0.3 : 1}
            ]
        } onPress={press}>
            <Image source={`${urlImg}/rotiseria/img/${_id}.png`} style={styles.image}/>
            {/* <Image source={`${urlImg}${_id}.webp`} style={styles.image}/> */}
            <View style={styles.info}>
                <Text style={styles.info_title}>{descripcion}</Text>
                <Text style={styles.info_seccion}>{seccion?.nombre}</Text>
                <Text style={styles.info_precio}>${precio.toFixed(2)}</Text>
            </View>
            <Button label={"+"} press={press}  estilos={styles}/>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 18,
        borderColor: '#555555',
        gap: 5,
        margin: 10,
        width: '100%',
        backgroundColor: '#25292e'
    },
    image: {
        backgroundColor: '#fff',
        width: 70,
        height: '100%',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
    },
    info: {
        width: '65%'
    },
    info_title:{
        fontSize: 14,
        flexWrap: 'wrap',
        paddingLeft: 5,
        paddingTop: 5,
        color: '#fff'
    },
    info_seccion: {
        color: 'gray',
        fontWeight: 'normal'
    },
    info_precio:{
        color: '#e6c06a',
        backgroundColor: '#555',
        textAlign: 'center',
        marginBottom: 5,
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 16,
        width: 90,
    },
    button: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: '#e6c06a',
        borderRadius: 8,
    }
});