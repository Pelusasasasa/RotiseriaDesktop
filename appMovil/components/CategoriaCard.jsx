import { Pressable, StyleSheet, Text } from "react-native";

export default function CategoriaCard({ title, catSelect, setCatSelect }){
    return (
        <Pressable onPress={() => setCatSelect(title)}>
            <Text style={[
                styles.title,
                catSelect == title && {backgroundColor: '#000', color: '#fff'}
            ]}>
                {title}
            </Text>
        </Pressable>
    )
};


const styles = StyleSheet.create({
    title: {
        borderWidth: 1,
        borderColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        borderRadius: 5
    }
})