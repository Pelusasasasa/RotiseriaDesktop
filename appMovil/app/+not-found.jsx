import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
    return(
        <>
            <Stack.Screen options={{title: 'Oops! Not Found'}}/>
            <View style={styles.container}>
                <Link href='/' style={styles.button}>
                    Go Back to home Screen!
                </Link>
            </View>
        </>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center'
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#fff'
    }
})