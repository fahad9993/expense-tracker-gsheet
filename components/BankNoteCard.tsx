import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type NoteProps = {
  note: number;
  quantity: number;
  onUpdateQuantity: (newQuantity: number) => void; // Define the type for newQuantity
};

export default function BankNoteCard({
  note,
  quantity,
  onUpdateQuantity,
}: NoteProps) {
  const increment = () => onUpdateQuantity(quantity + 1);
  const decrement = () => onUpdateQuantity(quantity > 0 ? quantity - 1 : 0);

  return (
    <View style={styles.card}>
      <Text style={styles.noteText}>{note}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={increment} style={styles.button}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.valueText}>{quantity}</Text>
        <TouchableOpacity onPress={decrement} style={styles.button}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    backgroundColor: "orange",
    padding: 5,
    borderRadius: 5,
  },
  noteText: {
    fontSize: 18,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 18,
  },
  valueText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
});
