import {
  StyleSheet,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from "react-native";

import { Colors } from "@/utils/colors";

type buttonProps = {
  handlePress: () => void;
  title: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function CustomButton({
  handlePress,
  buttonStyle,
  textStyle,
  title,
}: buttonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={handlePress}
    >
      <Text style={[{ color: "white", alignSelf: "center" }, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    color: "white",
    padding: 10,
    borderRadius: 20,
  },
});
