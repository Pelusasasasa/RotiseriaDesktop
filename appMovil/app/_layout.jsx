import {Stack} from 'expo-router'
import { Provider } from 'react-redux'
import { store } from '../store/store'
import { StatusBar } from 'expo-status-bar';
export default function Layout(){
    return (
        <Provider store={store}>
            <Stack>
                <Stack.Screen name='(tabs)' options={{headerShown: false}}/>
                <Stack.Screen name='configuracion' options={{ headerShown: false }} />
                <Stack.Screen name='+not-found'/>
            </Stack>
            <StatusBar style='light' />
        </Provider>
    )
}