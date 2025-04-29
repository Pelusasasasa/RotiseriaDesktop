import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Button({label, press, estilos}){
    return(
        <View style={styles.buttonContainer}>
            <Pressable style={estilos ? estilos.button : styles.button} onPress={press}>
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    )
};

const styles = StyleSheet.create({

    buttonContainer: {
        width: 45,
        height: 45,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        padding: 3,
        
    },
    button: {
        borderRadius: 5,
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonLabel: {
        color: 'gray',
        fontSize: 30
    }


});