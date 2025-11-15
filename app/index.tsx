import { useContext, useState } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";

import { AuthContext } from "@/context/AuthContext";
import { Colors } from "@/utils/colors";
import { BASE_URL } from "@/api/apiConfig";

const Index = () => {
  const apiEndpoint = `${BASE_URL}/auth`;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const authCtx = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter both username and password.");
      return;
    }

    if (!emailRegex.test(username)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (isLoggingIn) return;
    setIsLoggingIn(true);
    Keyboard.dismiss();
    try {
      const response = await axios.post(`${apiEndpoint}/login`, {
        username,
        password,
      });

      const data = response.data;
      const token = data.token;
      const refreshToken = data.refreshToken;

      if (token && refreshToken) {
        authCtx.authenticate(token, refreshToken);
        router.replace("/dashboard");
      }
    } catch (error: any) {
      Alert.alert(
        "Error!",
        error.response?.data?.message ||
          error.message ||
          "An error occurred during login."
      );
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
          onChangeText={setUsername}
          autoComplete="username"
          textContentType="username"
          importantForAutofill="yes"
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
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
          importantForAutofill="yes"
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

      <TouchableOpacity
        style={[styles.button, isLoggingIn && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.buttonText}>Logging in...</Text>
          </View>
        ) : (
          <Text style={[styles.buttonText, { color: "#fff" }]}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.login,
  },
  disabledButton: {
    backgroundColor: "lightgray",
    borderWidth: 1,
    borderColor: "black",
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
  spinnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});

export default Index;
