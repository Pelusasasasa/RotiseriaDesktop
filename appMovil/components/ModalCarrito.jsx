import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useCartStore, useVentaStore } from "../hooks";
import Button from "./Button";
import { useForm } from "../hooks/UseForm";
import { useDispatch } from "react-redux";
import { savingVenta } from "../store/venta/ventaSlice";

const initialState = {
    nombre: '',
    domicilio: '',
    telefono: ''
};

export default function ModalCarrito({activado, setModal}){
    const dispatch = useDispatch();

    const { emptyCart, total, items } = useCartStore();
    const { isVentaSaving, startPostVenta} = useVentaStore()
    const {nombre, domicilio, telefono, onInputChange, formState, onResetForm} = useForm(initialState)

    const submitPedido = async() => {
        if(!nombre) return alert('Falta el nombre del cliente');

        //Todo Cargar un Pedido
        dispatch(savingVenta());

        const ok = await startPostVenta(formState, total, items);

        if(ok){
            onResetForm();
            setModal(false);
            emptyCart()
        }
    };

    return (
        <Modal transparent={true} visible={activado}>
            <View style={styles.modalContainer}>
                
                <View style={styles.modalContent}>
                    <View style={styles.closeButton}>
                        <Pressable onPress={() => setModal(false)} style={styles} >
                            <Ionicons name="close" color='#fff' size={29} />
                        </Pressable>
                    </View>
                    <View style={styles.inputsContainer}>
                        <Text style={styles.text}>Nombre del cliente</Text>
                        <View style={styles.inputs}>
                            <Ionicons name="person-outline" color='#fff' size={22} />
                            <TextInput 
                            placeholderTextColor={'#e5e7eb'}
                            placeholder="Ingresar el Nombre del Cliente" 
                            style={styles.input} 
                            onChangeText={(text) => onInputChange('nombre', text)} 
                            value={nombre}/>
                        </View>
                    </View>
                    <View style={styles.inputsContainer}>
                        <Text style={styles.text}>Domicilio</Text>
                        <View style={styles.inputs}>
                            <Ionicons name="home-outline" color='#fff' size={22} />
                            <TextInput 
                            placeholderTextColor={'#e5e7eb'}
                            placeholder="Ingresar el Nombre del Cliente" 
                            style={styles.input} 
                            onChangeText={(text) => onInputChange('domicilio', text)} 
                            value={domicilio}/>
                        </View>
                    </View>
                    <View style={styles.inputsContainer}>
                        <Text style={styles.text}>Telefono</Text>
                        <View style={styles.inputs}>
                            <Ionicons name="call-outline" color='#fff' size={22} />
                            <TextInput 
                                placeholderTextColor={'#e5e7eb'}
                                keyboardType="numeric"
                                placeholder="Ingresar el Telefono"
                                style={styles.input}
                                onChangeText={(text) => onInputChange('telefono', text)}
                                value={telefono}/>
                        </View>
                    </View>
                    <View style={styles.totalContainer}>
                        <Text style={[styles.total, {color: '#ffff'}]}>Total: </Text>
                        <Text style={styles.total}>${total.toFixed(2)}</Text>
                    </View>

                    <Button label='Confirmar' disabled={isVentaSaving} estilos={styles} press={submitPedido} />
                </View>
            </View>
        </Modal>
    )
};


const styles = StyleSheet.create({
    closeButton:{
        alignItems: 'flex-end',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: '90%',
        height: '90%',
        backgroundColor: '#25292e',
        borderRadius: 10,
        padding: 20,
        position: 'relative'
    },
    inputsContainer: {
        marginBottom: 15,
        gap: 15
    },
    inputs: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 5

    },
    text: {
        color: '#e5e7eb',
        fontSize: 20,

    },
    input: {
        padding: 10,
        borderWidth: 1,
        color: '#FFF',
        borderColor: '#e5e7eb',
        width: '90%',
        borderRadius: 5
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#222222',
        paddingHorizontal: 10,
        borderRadius: 25,
        paddingVertical: 10,
    },
    total: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e6c06a',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 'auto'
    },
    button: {
        borderRadius: 10,
        width: '90%',
        backgroundColor: '#e6c06a'
    },
    buttonLabel: {
        fontSize: 20,
        paddingVertical: 5,
        color: '#25292e',
        fontWeight: 'bold',
        textAlign: 'center'

    }
});