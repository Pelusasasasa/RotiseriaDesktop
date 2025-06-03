import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import * as Updates from "expo-updates";

import CategoriaCard from "../../components/CategoriaCard";
import ProductoCard from "../../components/ProductCard";

import { useSelector } from "react-redux";
import { useProductStore } from "../../hooks";
import { useSeccionStore } from "../../hooks/useSeccionStore";
import CargandoPantalla from "../../components/CargandoPantalla";
import { useCartaEmpanadaStore } from "../../hooks/useCartaEmpanadaStore";

const checkForUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      Alert.alert(
        "Actualización disponible",
        "Hay una nueva versión, ¿querés actualizarla ahora?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí",
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch (err) {
                Alert.alert("Error", "No se pudo actualizar");
              }
            },
          },
        ]
      );
    }
  } catch (error) {
    console.log("Error buscando actualización:", error);
  }
};

export default function Home(){

    const {activeSeccion } = useSelector(state => state.section);
    const {productos, startGetProductos} = useProductStore();
    const {secciones, startGetSecciones} = useSeccionStore();
    const { startGetPreciosCarta } = useCartaEmpanadaStore();

    const [text, setText] = useState('');
    const [filterProducts, setFilterProducts] = useState(productos);

    useEffect(() => {
        checkForUpdates()
        startGetProductos();
        startGetSecciones();
        startGetPreciosCarta();
    }, []);

    //Cada vez que cambien los productos los agregamos deuvleta
    useEffect(() => {
        setFilterProducts(productos);
    }, [productos])

    //Filtramos los productos cada vez que cambien el input 
    useEffect(() => {
        if(text.length > 0){
            setFilterProducts(productos.filter(elem => elem.descripcion.toLowerCase().includes(text.toLowerCase())));
        }else{
            setFilterProducts(productos);
        }
    }, [text])

    //Si tocamos uno de los filtros modificamos los productos
    useEffect(() => {
        if(activeSeccion?.nombre !== 'TODOS'){
            setFilterProducts(productos.filter(elem => elem.seccion?.nombre === activeSeccion?.nombre));
        }else{
            setFilterProducts(productos);
        };
    }, [activeSeccion]);


    return(
        <View style={styles.container}>
            <Text style={styles.title}>Rotiseria - Nuevo Pedido</Text>
            <TextInput style={styles.input}  placeholder="Buscar Producto" value={text} onChangeText={setText}/>
            <FlatList 
                horizontal
                style={styles.list}
                data={secciones}
                keyExtractor={(item) => item.codigo}
                renderItem={({item}) => (    
                    <View style={styles.categories}>
                        <CategoriaCard _id={item._id} nombre={item.nombre}/>
                    </View>
                )}
            />

            {filterProducts.length === 0 
            ? <CargandoPantalla label="Cargando Productos" />
            : <FlatList
                style={styles.productoContainer}
                data={filterProducts}
                keyExtractor={(item) => item._id}
                renderItem={({item}) => (
                    <ProductoCard {...item} key={item._id} />
                )}
            />}
            
            
        </View>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems:'center',
        backgroundColor: '#25292e',
    },
    list: {
        flexGrow: 0,
        height: 60,
        marginTop: 10
    },
    categories: {
        marginVertical: 5,
        marginLeft: 5,
        alignSelf: 'flex-start',
        flexDirection: 'row'
    },
    title: {
        fontSize: 24,
        color: '#e6c06a',
        marginBottom: 20,
    },
    input: {
        color: '#fff',
        backgroundColor: '#666',
        height: 40,
        width: '90%',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        padding: 10
    },
    productoContainer: {
        width: "100%",
        paddingHorizontal: 15,
    }
})