import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const seccionApiFunction = async () => {
        const ip = await AsyncStorage.getItem('server_ip')
        
        const api = axios.create({
                baseURL: ip
        });

        console.log(await api.get('producto'))
        return api;

}

export default seccionApiFunction;