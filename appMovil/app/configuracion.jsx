import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../components/Button";


export default function Configuracion(){

    const [ip, setIp] = useState('');

    useEffect(() => {
        const cargarIp = async () => {
                const ipGuardada = await AsyncStorage.getItem('server_ip');

                if(ipGuardada) {
                    setIp(ipGuardada);
                };
            };

            cargarIp();
    }, [])


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
                    <TextInput value={ip} style={styles.campoInput} placeholder="ip://localhost:4000"/>
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
})