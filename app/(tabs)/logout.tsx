import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext"; // Assuming you have an AuthContext

export default function Logout() {
  const { logout } = useAuth(); // Access the logout function from AuthContext
  const router = useRouter(); // Access router for navigation

  // Handle logout and navigation when the button is pressed
  const handleLogout = () => {
    logout(); // Log the user out
    router.replace("/"); // Navigate to the welcome screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you sure you want to log out?</Text>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center the content vertically
    alignItems: "center", // Center the content horizontally
    backgroundColor: "#fff", // Optional: Set a background color
  },
  title: {
    fontSize: 18,
    marginBottom: 20, // Add space above the button
    color: "#000", // Optional: Set text color
  },
});
