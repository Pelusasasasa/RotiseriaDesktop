import { Ionicons } from '@expo/vector-icons'
import {Tabs} from 'expo-router'
export default function Layout(){
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d'
            }}>
            <Tabs.Screen name='index' options={{
                title: 'Inicio',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'home-sharp' :'home-outline'} color={color} size={24} />
                )
            }}/>
            <Tabs.Screen name='carrito' options={{
                title: 'Carrito',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'cart' :'cart-outline'} color={color} size={24} />
                )
                }}/>
        </Tabs>
    )
}