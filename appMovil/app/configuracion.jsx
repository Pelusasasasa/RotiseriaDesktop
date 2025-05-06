import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { emptySetProducts } from "../store/product/productSlice";


export default function Configuracion(){

    const dispatch = useDispatch();

    const [ip, setIp] = useState('');
    const [urlImg, setUrlImg] = useState('');
    

    useEffect(() => {
        dispatch(emptySetProducts())
        const cargarIp = async () => {
                const ipGuardada = await AsyncStorage.getItem('server_ip');
                const urlImgGuardada = await AsyncStorage.getItem('server_url_img');

                if(urlImgGuardada){
                    setUrlImg(urlImgGuardada);
                };

                if(ipGuardada) {
                    setIp(ipGuardada);
                };
            };

            cargarIp();
    }, []);


    const handleDatosServidor = async() => {
        
    if (!ip) {
        Alert.alert('Error', 'Por favor, ingrese una IP válida');
        return;
    };

    if(urlImg){
        await AsyncStorage.setItem('server_url_img', urlImg);
    }

    await AsyncStorage.setItem('server_ip', ip);
    
    const router = useRouter();
     router.push('/');
    };


    return(
        <View style={styles.container}>
            
            {/* //Informacion Negocio */}

            <View style={styles.subContainer}>
                    <Text style={styles.title}>
                        <Ionicons name="people-outline" size={24}  />
                        Informacion del negocio
                    </Text>
                <Text style={styles.subTitle}>configura la informacio basica del negocio</Text>

                <View >
                    <View style={styles.campos}>
                        <Text style={styles.campoLabel}>Nombre del negocio</Text>
                        <TextInput style={styles.campoInput} placeholder="Nombre del necocio" />
                    </View>
                    <View style={styles.campos}>
                        <Text style={styles.campoLabel}>Direccion Del negocio</Text>
                        <TextInput style={styles.campoInput} placeholder="Direccion del negocio" />
                    </View>
                    <View style={styles.campos}>
                        <Text style={styles.campoLabel}>Telefono del negocio</Text>
                        <TextInput style={styles.campoInput} placeholder="Telefono Del negocio" />
                    </View>
                </View>
            </View>

            {/* Configuracion de la ip */}
            <View style={styles.subContainer}>
                <Text style={styles.title}>
                    <Ionicons name="analytics-outline" size={24}  />
                    Informacion del servidor
                </Text>

                <View style={styles.campos}>
                    <Text style={styles.campoLabel}>Ip del servidor</Text>
                    <TextInput value={ip} style={styles.campoInput} onChangeText={setIp} placeholder="ip://localhost:4000"/>
                </View>

                <View style={styles.campos}>
                    <Text style={styles.campoLabel}>URL del servidor de imagenes</Text>
                    <TextInput value={urlImg} style={styles.campoInput} onChangeText={setUrlImg} placeholder="http://eemplo.com.ar"/>
                </View>

                <View>
                    <Button press={handleDatosServidor} label='Guardar' estilos={styles}/>
                </View>
            </View>
            
        </View>
    )
}


const styles =StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        padding: 20,
    },
    subContainer: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 10,
        marginTop: 20
    },
    title: {
        fontSize: 24,
        color: '#e6c06a',
        marginVertical: 10,
    },
    subTitle: {
        color: '#e5e7eb'
    },
    campos: {
        gap: 10,
        marginVertical: 10,
    },
    campoLabel:{
        color: '#e5e7eb',
        fontSize: 16,
    },
    campoInput: {
        backgroundColor: '#444',
        borderWidth: 1,
        color: '#fff',
        fontSize: 16,
        borderColor: '#fff',
        padding: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 15,
        alignItems: 'flex-end',
    },
    button: {
        backgroundColor: '#e6c06a',
        padding: 10,
        borderRadius: 8,
    },
})