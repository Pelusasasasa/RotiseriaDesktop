import { StyleSheet, FlatList, Text, View } from "react-native";
import { useCartStore } from "../../hooks";
import { useState } from "react";

import ItemCard from "../../components/ItemCard";
import Button from "../../components/Button";
import ModalCarrito from "../../components/ModalCarrito";
import { Ionicons } from "@expo/vector-icons";

export default function Carrito(){
    const { items, total } = useCartStore();
    const [modal, setModal] = useState(false);
    
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pedido Actual</Text>
                <Text style={styles.cantItems}>{items.reduce((sum, item) => sum + item.cantidad, 0)} items</Text>
            </View>
            {
                items.length > 0 ? (
                    
                    <FlatList
                        style={{width: '100%'}}
                        data={items}
                        keyExtractor={(item) => item._id}
                        renderItem= {({item}) => (
                            <View>
                                <ItemCard {...item}/>
                            </View>
                        )}
                    />
                ) : (
                    <View style={styles.emptyCart}>
                        <Ionicons name="cart-outline" color='#fff' size={50}/>
                        <Text style={{
                            alignItems: 'center',
                            textAlign: 'center',
                            fontSize: 25,
                            fontWeight: 'bold',
                            color: '#bbbbbb',
                            marginTop: 30
                        }}>No hay productos en el carrito</Text>
                        <Text style={{
                            alignItems: 'center',
                            textAlign: 'center',
                            fontSize: 20,
                            color: '#777777',
                            marginTop: 30
                        }}>Agrega productos para comenzar</Text>
                    </View>
                )
            }

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto'}}>
                <Text style={styles.subTotal}>Subtotal:</Text>
                <Text style={styles.subTotal}>${total.toFixed(2)}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#e5e7eb'}}>
                <Text style={styles.total}>Total: </Text>
                <Text style={styles.total}>${total.toFixed(2)}</Text>
            </View>
            <Button disabled={items.length === 0 ? true : false} label={"Confirmar Pedido"} press={() => setModal(true)} estilos={styles}/>
            <ModalCarrito activado={modal} setModal={setModal}/>
    
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 24,
        color: '#e6c06a',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cantItems: {
        borderRadius: 18,
        fontWeight: 'bold',
        color: '#e6c06a',
        backgroundColor: '#444',
        textAlign: 'center',
        padding: 5,
        fontSize: 18,
    },
    emptyCart:{ 
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },  
    subTotal: {
        fontSize: 20,
        color: '#cccccc',
        fontWeight: 'light',
        paddingVertical: 6,
        paddingHorizontal: 5
    },  
    total: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
        paddingVertical: 6,
        paddingHorizontal: 5
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    button: {
        borderRadius: 5,
        width: '90%',
        marginTop: 10,
        backgroundColor: '#e6c06a',
    },
    buttonLabel: {
        paddingVertical: 5,
        fontSize: 25,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#fff',
    }
})