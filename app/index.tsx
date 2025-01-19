import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    login(); // Update login state
    router.replace("/home"); // Navigate to the tab navigator
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expense Tracker!</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});

export default Index;
