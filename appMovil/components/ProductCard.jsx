import {  StyleSheet, Text, View } from "react-native";
import { Image } from 'expo-image';
import Button from "./Button";


export default function ProductoCard({descripcion, image, precio, seccion='Empanadas'}){
    return(
        <View style={styles.container}>
            <Image source={image} style={styles.image}/>
            <View style={styles.info}>
                <Text style={styles.info_title}>{descripcion}</Text>
                <Text style={styles.info_seccion}>{seccion}</Text>
                <Text style={styles.info_precio}>{precio.toFixed(2)}</Text>
            </View>
            <Button style={styles.button} label={"+"}/>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 10,
        gap: 5,
        margin: 10,
        width: '100%',
        backgroundColor: '#fff'
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 18,
    },
    info: {

    },
    info_title:{
        fontSize: 18
    },
    info_seccion: {
        color: 'gray',
        fontWeight: 'normal'
    },
    info_precio:{
        fontWeight: 'bold',
        fontSize: 16
    },
    button: {
        height: '100%',
        alignSelf: 'flex-end',
    }
});