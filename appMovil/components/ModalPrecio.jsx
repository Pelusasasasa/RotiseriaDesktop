import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "./Button";
import { useProductStore } from "../hooks/useProductStore";
import { useState } from "react";

export default function ModalPrecio({activado, id, setModal, precio = 0}){
    const  {startHandlePrecio } = useProductStore();
    const [newPrecio, setNewPrecio] = useState(precio);

    const cambiarPrecio = () => {
        startHandlePrecio(id, !newPrecio ? precio : newPrecio );
        setModal(false);
    };

    return (
        <Modal  transparent={true} visible={activado}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.inputsContainer}>
                        <Text style={styles.text}>Nuevo Precio</Text>
                        <View style={styles.inputs}>
                            <TextInput keyboardType="numeric" value={newPrecio} style={styles.input} onChangeText={(text) => setNewPrecio(text)}/>
                        </View>
                    </View>
                    <Button label='Confirmar Cambio' press={cambiarPrecio} estilos={styles}/>
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
        height: 200,
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
        textAlign: 'center',
        color: '#e5e7eb',
        fontSize: 20,

    },
    input: {
        padding: 10,
        borderWidth: 1,
        color: '#FFF',
        borderColor: '#e5e7eb',
        width: '100%',
        borderRadius: 5
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