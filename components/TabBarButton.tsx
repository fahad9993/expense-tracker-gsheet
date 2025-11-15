import { ReactNode, useEffect } from "react";
import { Text, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

import { Colors } from "@/utils/colors";

type TabBarButtonProps = {
  onPress: () => void;
  isFocused: boolean;
  label: string;
  icon?: ReactNode;
};

export default function TabBarButton({
  onPress,
  isFocused,
  label,
  icon,
}: TabBarButtonProps) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      rotate.value = withSequence(
        withTiming(10, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(-10, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
    }
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotate.value}deg`,
      },
    ],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <View style={styles.iconContainer}>
        {isFocused && <View style={styles.focusRing} />}
        <Animated.View style={[animatedIconStyle]}>{icon}</Animated.View>
      </View>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  focusRing: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: "rgba(0, 128, 0, 0.1)",
  },
  label: {
    fontSize: 12,
    color: "#777",
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
