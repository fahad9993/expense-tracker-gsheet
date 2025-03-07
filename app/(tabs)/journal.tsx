import { StyleSheet, Text, View } from "react-native";

export default function Journal() {
  return (
    <View style={styles.container}>
      <Text>Journal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    margin: 20,
  },
});
