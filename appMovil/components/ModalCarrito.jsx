import { useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from '@react-native-picker/picker';

import { Ionicons } from "@expo/vector-icons";

import { useCartStore, useVentaStore } from "../hooks";
import { useForm } from "../hooks/UseForm";
import { savingVenta } from "../store/venta/ventaSlice";

import CargandoPantalla from "./CargandoPantalla";
import Button from "./Button";


const initialState = {
    nombre: '',
    domicilio: '',
    telefono: '',
    num_doc: '',
    condicionIva: 'Consumidor Final',
    F: false
};

export default function ModalCarrito({activado, setModal}){
    const dispatch = useDispatch();

    const [checked, setChecked] = useState(false);
    const { emptyCart, total, items } = useCartStore();
    const { isVentaSaving, startPostVenta} = useVentaStore()
    const {nombre, domicilio, telefono, num_doc, condicionIva, F, onInputChange, formState, onResetForm} = useForm(initialState)

    const submitPedido = async() => {
        if(!nombre) return alert('Falta el nombre del cliente');

        //Todo Cargar un Pedido
        dispatch(savingVenta());
        const ok = await startPostVenta(formState, total, items);

        if(ok){
            onResetForm();
            setModal(false);
            emptyCart();
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

                    <View style={styles.checkboxContainer}>
                        <Pressable onPress={() => {setChecked(!checked), onInputChange('F', !F)}} >
                            <View style={styles.checkbox}>
                                
                                {checked && <Text>
                                        <Ionicons name="checkmark-outline" size={25}/>
                                    </Text>}
                            </View>
                            
                        </Pressable>
                        <Text style={{ color: '#fff', fontSize: 30}}>Facturar</Text>
                    </View>


                    {
                        checked && (
                            <>
                                <TextInput
                                    keyboardType="numeric"
                                    placeholderTextColor={'#e5e7eb'}
                                    placeholder="Cuit o DNI"
                                    style={[
                                        styles.input,
                                        { width: '100%', marginTop: 10 }
                                    ]}
                                    onChangeText={(text) => onInputChange('num_doc', text)}
                                    value={num_doc}
                                />

                                <View style={styles.pickerContainer}>
                                    <Picker
                                     selectedValue={condicionIva}
                                     style={styles.picker}
                                     onValueChange={(itemValue => onInputChange('condicionIva', itemValue))}>
                                        <Picker.Item value='Consumidor Final' label='Consumidor Final' />
                                        <Picker.Item value='Monotributo' label='Monotributo' />
                                        <Picker.Item value='Inscripto' label='Responsable Inscripto' />
                                        <Picker.Item value='Exento' label='Exento' />
                                    </Picker>
                                </View>
                            </>
                        )
                    }

                    <Button label='Confirmar' disabled={isVentaSaving} estilos={styles} press={submitPedido} />
                </View>
            </View>

            {isVentaSaving && <CargandoPantalla/>}
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

    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 20,
        justifyContent: 'center'
    },  
    checkbox: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pickerContainer: {
        marginTop: 10,
        backgroundColor: '#25292e',
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#FFF',
    }
});