import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function ConfiguracionIp({navigation }) {
        const [ip, setIp] = useState('');


        useEffect(() => {
            const cargarIp = async () => {
                const ipGuardada = await AsyncStorage.getItem('server_ip');

                if(ipGuardada) {
                    const router = useRouter();
                    router.push('/');
                }
            };

            cargarIp();
        }, []);

    const guardarIP = async () => {
      if (!ip) {
        Alert.alert('Error', 'Por favor, ingrese una IP válida');
        return;
      }

      await AsyncStorage.setItem('server_ip', ip);
      const router = useRouter();
      router.push('/');

    };

        return (
            <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Ingrese la IP del servidor:</Text>
            <TextInput
                placeholder="Ej: 192.168.1.100"
                value={ip}
                onChangeText={setIp}
                keyboardType="numeric"
                style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginVertical: 20,
                }}
            />
            <Button title="Guardar y continuar" onPress={guardarIP}/>
            </View>
        );
}