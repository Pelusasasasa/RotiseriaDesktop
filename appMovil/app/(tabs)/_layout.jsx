import { Ionicons } from '@expo/vector-icons'
import {Tabs} from 'expo-router'
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';
import { useSelector } from 'react-redux'
export default function Layout(){
    const {items} = useSelector(state => state.cart);
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
                    <View style={styles.container}>
                        <Ionicons name={focused ? 'cart' :'cart-outline'} color={color} size={24} />
                        <Text style={styles.cant}>{items.reduce((sum, item) => sum + item.cantidad, 0 )}</Text>
                    </View>
                )
                }}/>
        </Tabs>
    )
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 5
    },
    cant: {
        width: 20,
        height: 20,
        color: '#fff',
        borderRadius: 50,
        textAlign: 'center',
        backgroundColor: '#000'
    }
})