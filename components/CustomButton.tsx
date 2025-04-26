import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

import { Colors } from "@/utils/colors";

type ButtonProps = {
  handlePress: () => void;
  title: string;
  loading?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function CustomButton({
  handlePress,
  buttonStyle,
  textStyle,
  title,
  loading,
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: loading ? "#3F4F44" : Colors.primary,
          opacity: pressed || loading ? 0.7 : 1,
        },
        buttonStyle,
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      <View style={styles.contentContainer}>
        {loading && (
          <ActivityIndicator
            size="small"
            color="white"
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
