import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import CategoriaCard from "../../components/CategoriaCard";
import ProductoCard from "../../components/ProductCard";

let categorias = [
    {
        _id: "1",
        title: 'Todos'
    },
    {
        _id: "2",
        title: 'Carnes'
    },
    {
        _id: "3",
        title: 'Empanadas'
    },
    {
        _id: "4",
        title: 'Bebidas'
    },
    {
        _id: "5",
        title: 'Guarniciones'
    },
    {
        _id: "6",
        title: 'Postres'
    },
];

import PlaceholderImage from '@/assets/images/adaptive-icon.png';
import { useSelector } from "react-redux";

let productos = [
    {
        _id: "2",
        descripcion: 'Empanadas',
        precio: 12000,
        seccion: 'Empanadas',
        image: PlaceholderImage
    },
    {   
        _id: "1",
        descripcion: 'Papas Fritas',
        precio: 5600,
        seccion: 'Guarniciones',
        image: PlaceholderImage
    }
];

export default function Home(){

    const {activeSeccion } = useSelector(state => state.section);

    const [text, setText] = useState('');
    const [filterProducts, setFilterProducts] = useState(productos);

    useEffect(() => {
        if(text.length > 0){
            setFilterProducts(productos.filter(elem => elem.descripcion.toLowerCase().includes(text.toLowerCase())));
        }else{
            setFilterProducts(productos);
        }
    }, [text])

    useEffect(() => {
            if(activeSeccion.title !== 'Todos'){
                setFilterProducts(productos.filter(elem => elem.seccion === activeSeccion.title));
            }else{
                setFilterProducts(productos);
            }
            
    }, [activeSeccion]);

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Rotiseria - Nuevo Pedido</Text>
            <TextInput style={styles.input}  placeholder="Buscar Producto" value={text} onChangeText={setText}/>
            <FlatList 
                horizontal
                style={styles.list}
                data={categorias}
                keyExtractor={(item) => item.title}
                renderItem={({item}) => (    
                    <View style={styles.categories}>
                        <CategoriaCard _id={item._id} title={item.title} key={item.title}/>
                    </View>
                )}
            />

            <View style={styles.productoContainer}>
                {
                    filterProducts.map(elem => (
                        <ProductoCard {...elem} key={elem._id}/>
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
    list: {
        flexGrow: 0
    },
    categories: {
        marginVertical: 5,
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
    },
    productoContainer: {
        width: "100%"
    }
})