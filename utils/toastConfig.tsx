import { View, Text } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";

type ToastType = "success" | "error" | "info";

const toastTypeConfig: Record<
  ToastType,
  { color: string; icon: keyof typeof Feather.glyphMap }
> = {
  success: { color: "green", icon: "check-circle" },
  error: { color: "red", icon: "x-circle" },
  info: { color: "#FEBA17", icon: "info" },
};

const renderToast =
  (toastType: ToastType) =>
  ({ text1, text2 }: BaseToastProps) => {
    const { color, icon } = toastTypeConfig[toastType];

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderLeftColor: color,
          borderLeftWidth: 6,
          padding: 12,
          borderRadius: 8,
          width: "90%",
          alignSelf: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
          marginTop: 10,
        }}
      >
        <Feather
          name={icon}
          size={24}
          color={color}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          {text1 && (
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111" }}>
              {text1}
            </Text>
          )}
          {text2 && (
            <Text style={{ fontSize: 14, color: "#555", marginTop: 2 }}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    );
  };

const toastConfig = {
  success: renderToast("success"),
  error: renderToast("error"),
  info: renderToast("info"),
};

export default toastConfig;
