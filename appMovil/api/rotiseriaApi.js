import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const seccionApiFunction = async () => {
        const ip = await AsyncStorage.getItem('server_ip')
        
        const api = axios.create({
                baseURL: `${ip}/rotiseria/`
        });

        return api;

}

export default seccionApiFunction;