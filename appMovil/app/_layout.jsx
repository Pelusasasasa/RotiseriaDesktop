import {Stack} from 'expo-router'
import { Provider } from 'react-redux'
import { store } from '../store/store'
import ConfiguracionIp from './ConfiguracionIp';
export default function Layout(){
    return (
        <Provider store={store}>
            <Stack>
                <Stack.Screen name="ConfiguracionIp" options={{ headerShown: false }} />
                <Stack.Screen name='(tabs)' options={{headerShown: false}}/>
                <Stack.Screen name='configuracion' />
                <Stack.Screen name='+not-found'/>
            </Stack>
        </Provider>
    )
}