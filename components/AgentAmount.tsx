import { View, Image, Text, StyleSheet, Pressable } from "react-native";

import { formatBDNumber } from "@/utils/functions";

type Props = {
  source: number;
  amount: string;
  handlePress: () => void;
};

export default function AgentAmount({ source, amount, handlePress }: Props) {
  return (
    <View style={styles.imageWrapper}>
      <Pressable onPress={handlePress}>
        <Image source={source} style={styles.image} />
      </Pressable>
      <Text style={styles.text}>{formatBDNumber(Number(amount))}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  imageWrapper: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#E4EFE7",
  },
});
