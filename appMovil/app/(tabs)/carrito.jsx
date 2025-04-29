import { StyleSheet, FlatList, Text, View } from "react-native";
import { useCartStore } from "../../hooks";
import ItemCard from "../../components/ItemCard";

export default function Carrito(){
    const { items } = useCartStore();
    console.log(useCartStore())
    console.log(items)
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

    }
})