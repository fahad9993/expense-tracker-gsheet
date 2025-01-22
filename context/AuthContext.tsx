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
  isLoading: boolean;
  login: (token: string) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is logged in when the app starts
  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setIsLoggedIn(true); // User is logged in if token exists
        }
      } catch (error) {
        console.log("Error checking login state", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginState();
  }, []);

  if (isLoading) {
    return null; // Or show a loading screen
  }

  const login = async (token: string) => {
    await AsyncStorage.setItem("authToken", token); // Store token
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken"); // Remove token
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
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
