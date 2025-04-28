import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import CategoriaCard from "../../components/CategoriaCard";

let categorias = [
    {
        title: 'Todos'
    },
    {
        title: 'Carnes'
    }
]

export default function Home(){

    const [text, setText] = useState('');
    const [catSelect, setCatSelect] = useState('Todos');

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Rotiseria - Nuevo Pedido</Text>
            <TextInput style={styles.input} placeholder="Buscar Producto" value={text} onChangeText={setText}/>
            <View style={styles.categories}>
                {
                    categorias.map(elem => (
                        <CategoriaCard title={elem.title} key={elem.title} catSelect={catSelect} setCatSelect={setCatSelect}/>
                    ))
                }
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems:'center'
    },
    categories: {
        marginTop: 5,
        marginLeft: 5,
        alignSelf: 'flex-start',
        flexDirection: 'row'
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        height: 40,
        width: '90%',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        padding: 10
    }
})