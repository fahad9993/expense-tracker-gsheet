import {
  StyleSheet,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

type buttonProps = {
  handlePress: () => void;
  children?: React.ReactNode;
  title?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function CustomButton({
  handlePress,
  buttonStyle,
  textStyle,
  title,
  children,
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
      {children ? (
        children
      ) : (
        <Text style={[{ color: "white", alignSelf: "center" }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "green",
    color: "white",
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
  },
});
