import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { useState } from "react";

import Button from "./Button";
import { agregarItem } from "../store/cart/cartSlice";
import { useCartaEmpanadaStore } from "../hooks/useCartaEmpanadaStore";

export default function ModalEmpanadas({activado, setModal, _id, descripcion, precio = 0, seccion}){
    const dispatch = useDispatch();
    const {docena, mediaDocena} = useCartaEmpanadaStore();
    const [cant, setCant] = useState(1);

    const docenaPrecio = () => {
        const cantidad = 12;
        dispatch(agregarItem({_id, descripcion, precio, seccion, cantidad, docena, mediaDocena}))
        setModal(false);
    };
    const mediadocenaPrecio = (e) => {
        const cantidad = 6;
        dispatch(agregarItem({_id, descripcion, precio, seccion, cantidad, docena, mediaDocena}))
        setModal(false);
    };
    const unidad = (e) => {
        const cantidad = cant;
        dispatch(agregarItem({_id, descripcion, precio, seccion, cantidad, docena, mediaDocena}))
        setModal(false);
    };

    return (
        <Modal  transparent={true} visible={activado}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.text}>Cantindad de {descripcion}</Text>
                    <Button label='X12' press={docenaPrecio} estilos={styles}/>
                    <Button label='X6' press={mediadocenaPrecio} estilos={styles}/>

                    <View style={styles.containerUnidad}>
                        <Button label={"-"} estilos={styles} press={() => setCant(cant - 1)}/>
                        <View style={[styles.buttonContainer, styles.botonGrande]}>
                            <Pressable onPress={unidad} style={styles.button}>
                                <Text style={styles.buttonLabel} >{`X${cant}`}</Text>
                            </Pressable>
                        </View>
                        <Button label={"+"} estilos={styles} press={() => setCant(cant + 1)}/>
                    </View>
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
        height: 250,
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
    containerUnidad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100%',
        backgroundColor: '#25292e',
        borderRadius: 15,
        marginVertical: 10
    },
    botonGrande: {
        flex: 2,
    },
    button: {
        borderRadius: 10,
        width: '90%',
        marginHorizontal: 20,
        backgroundColor: '#e6c06a',
    },
    buttonLabel: {
        fontSize: 20,
        paddingVertical: 5,
        color: '#25292e',
        fontWeight: 'bold',
        textAlign: 'center'

    }
});