import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Button({label, disabled, press, estilos, button}){
    return(
        <View style={estilos?.buttonContainer ? estilos.buttonContainer : styles.buttonContainer}>
            <Pressable disabled={disabled} style={estilos?.button ? ({pressed}) => [
                estilos.button,
                {backgroundColor: pressed ? '#4CAF50' : '#2196F3'},
                {button}
                ] : ({pressed}) => [
                    styles.button,
                    {backgroundColor: pressed ? '#4CAF50' : '#2196F3'},
                    button,
                ]} onPress={press}>
                <Text style={estilos?.buttonLabel ? estilos.buttonLabel : styles.buttonLabel}>{label}</Text>
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