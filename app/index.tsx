import { useContext, useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const authCtx = useContext(AuthContext);
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return; // ⏳ Wait for layout to be ready
    if (authCtx.isAuthenticated) {
      router.replace("/home"); // Fallback (shouldn't hit this)
    }
  }, [authCtx.isAuthenticated, rootNavigationState]);

  // if (authCtx.isAuthenticated) return <LoadingScreen />;

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const response = await fetch(
        "https://expense-tracker-gsheet.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        const refreshToken = data.refreshToken;

        if (token && refreshToken) {
          authCtx.authenticate(token, refreshToken);
          router.replace("/home");
        } else {
          Alert.alert("Login Failed", "Invalid response from server");
        }
      } else {
        Alert.alert("Login Failed", "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "An error occurred during login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Image
        style={styles.image}
        source={require("../assets/adaptive-icon.png")}
      />
      <Text style={styles.title}>Welcome to Expense Tracker!</Text>

      {/* Username Input */}
      <View style={styles.fieldContainer}>
        <Feather style={styles.icons} name="user" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      {/* Password Input */}
      <View style={styles.fieldContainer}>
        <Feather style={styles.icons} name="lock" size={20} color="black" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // Toggle visibility
        />

        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <FontAwesome
            name={showPassword ? "eye-slash" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      {/* <Button title="Login" onPress={handleLogin} /> */}
      <TouchableOpacity
        style={[styles.button, isLoggingIn && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        <Text style={styles.buttonText}>
          {isLoggingIn ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  disabledButton: {
    backgroundColor: "#A9A9A9", // Gray color when disabled
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -17 }], // Center vertically
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  icons: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -19 }], // Center vertically
  },
  input: {
    width: "100%",
    padding: 10,
    paddingLeft: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginBottom: 15,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});

export default Index;
