import { Ionicons } from '@expo/vector-icons'
import {router, Tabs} from 'expo-router'
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
                title: 'Sabor Urbano',
                headerRight: () => (
                    <TouchableOpacity 
                    onPress={() => {
                        router.push('/configuracion')
                    }}
                    style = {{marginRight: 15}}
                    >
                        <Ionicons name='settings-outline' size={24} color='#000' />
                    </TouchableOpacity>
                ),
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
        width: 100,
        flexDirection: 'row',
        gap: 15
    },
    cant: {
        marginRight: 'auto',
        width: 20,
        height: 20,
        color: '#fff',
        borderRadius: 50,
        textAlign: 'center',
        backgroundColor: '#000'
    }
})