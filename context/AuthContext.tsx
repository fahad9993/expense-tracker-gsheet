import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage import

// Define the type for the AuthContext
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// Define the type for the children prop
interface AuthProviderProps {
  children: ReactNode; // Use ReactNode type for children
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in when the app starts
  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const savedLoginState = await AsyncStorage.getItem("isLoggedIn");
        if (savedLoginState === "true") {
          setIsLoggedIn(true); // Set logged in state if found in AsyncStorage
        }
      } catch (error) {
        console.log("Error checking login state", error);
      }
    };

    checkLoginState();
  }, []);

  const login = async () => {
    try {
      await AsyncStorage.setItem("isLoggedIn", "true"); // Save login state
      setIsLoggedIn(true);
    } catch (error) {
      console.log("Error saving login state", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("isLoggedIn"); // Remove login state
      setIsLoggedIn(false);
    } catch (error) {
      console.log("Error removing login state", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
