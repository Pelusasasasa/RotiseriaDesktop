import { StyleSheet, Text, View } from "react-native";

export default function Carrito(){
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Carrito</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center'
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    }
})