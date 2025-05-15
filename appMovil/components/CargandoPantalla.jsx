import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function CargandoPantalla({label = 'Procesando Pedido'}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={90} color="red" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e', // podés cambiar a '#000' para modo oscuro
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 15,
    fontStyle: 'italic',
    fontSize: 20,
    color: '#fff',
  },
});
