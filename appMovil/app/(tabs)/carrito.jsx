import { StyleSheet, FlatList, Text, View } from "react-native";
import { useCartStore } from "../../hooks";
import { useState } from "react";

import ItemCard from "../../components/ItemCard";
import Button from "../../components/Button";
import ModalCarrito from "../../components/ModalCarrito";

export default function Carrito(){
    const { items, total } = useCartStore();
    const [modal, setModal] = useState('false');
    
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pedido Actual</Text>
                <Text style={styles.cantItems}>{items.reduce((sum, item) => sum + item.cantidad, 0)} items</Text>
            </View>
            {
                items.length > 0 ? (
                    
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item._id}
                        renderItem= {({item}) => (
                            <View>
                                <ItemCard {...item}/>
                            </View>
                        )}
                    />
                ) : (
                    <Text>No hay productos en el carrito</Text>
                )
            }

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.subTotal}>Subtotal:</Text>
                <Text style={styles.subTotal}>${total}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.total}>Total: </Text>
                <Text style={styles.total}>${total}</Text>
            </View>
            <Button label={"Confirmar Pedido"} estilos={styles}/>
            {
               modal && <ModalCarrito/>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 20,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cantItems: {
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        padding: 5,
        fontSize: 18,
    },
    subTotal: {
        fontSize: 20,
        fontWeight: 'normal',
        borderWidth: 1,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#e5e7eb',
        paddingVertical: 6,
        paddingHorizontal: 5
    },  
    total: {
        fontSize: 22,
        fontWeight: 'bold',
        borderWidth: 1,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderColor: '#e5e7eb',
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
        backgroundColor: '#000',
    },
    buttonLabel: {
        paddingVertical: 5,
        fontSize: 20,
        textAlign: 'center',
        color: '#fff',
    }
})