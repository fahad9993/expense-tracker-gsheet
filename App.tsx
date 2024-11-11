import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  SafeAreaView,
} from "react-native";
import BankNoteCard from "@/components/BankNoteCard";

export default function Index() {
  const apiEndpoint = "https://expense-tracker-8dh8.onrender.com";
  const [bankNotes, setBankNotes] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);

  // Fetch data from the backend server on mount
  useEffect(() => {
    const loadInitialQuantities = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/fetchQuantities`);
        const { bankNotes: fetchedBankNotes, quantities: fetchedQuantities } =
          await response.json();

        setBankNotes(fetchedBankNotes || []); // Set the bankNotes from the response
        setQuantities(
          fetchedQuantities && fetchedQuantities.length
            ? fetchedQuantities
            : fetchedBankNotes.map(() => 0)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadInitialQuantities();
  }, []);

  const handleResetAll = () => {
    setQuantities(bankNotes.map(() => 0));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    setQuantities((prevQuantities) => {
      const updatedQuantities = [...prevQuantities];
      updatedQuantities[index] = newQuantity;
      return updatedQuantities;
    });
  };

  const handleUpdate = async () => {
    try {
      await fetch(`${apiEndpoint}/updateQuantities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantities }),
      });
      // Show alert if update is successful
      Alert.alert("Success!", "Quantities updated successfully.", [
        { text: "Ok" },
      ]);
    } catch (error) {
      console.error("Error updating quantities:", error);
      // Show error alert if update fails
      Alert.alert("Error", "Failed to update quantities. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cash in Hand</Text>
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
        onPress={handleResetAll}
      >
        <Text style={{ color: "white", alignSelf: "center" }}>Reset all</Text>
      </Pressable>
      <FlatList
        data={bankNotes}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item, index }) => (
          <BankNoteCard
            note={item}
            quantity={quantities[index]}
            onUpdateQuantity={(newQuantity) =>
              handleUpdateQuantity(index, newQuantity)
            }
          />
        )}
      />
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
        onPress={handleUpdate}
      >
        <Text style={{ color: "white", alignSelf: "center" }}>Update</Text>
      </Pressable>
    </View>
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
  container: {
    flex: 1,
    margin: 20,
  },
  heading: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
  },
});
