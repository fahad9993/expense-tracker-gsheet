import { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import BankNoteCard from "@/components/BankNoteCard";
import CustomButton from "@/components/CustomButton";
import { AuthContext } from "@/context/AuthContext";
import BankNoteSkeleton from "@/components/LoadingSkeleton/BankNoteSkeleton";
import { arraysAreEqual } from "@/utils/functions";
import { useRefresh } from "@/hooks/useRefresh";

export default function Home() {
  const apiEndpoint = "https://expense-tracker-gsheet.onrender.com";
  const [bankNotes, setBankNotes] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const lastSavedQuantities = useRef(quantities);

  const authCtx = useContext(AuthContext);

  // Function to fetch the data from the server
  const fetchData = async () => {
    // setLoading(true);
    try {
      const response = await authCtx.authFetch(
        `${apiEndpoint}/fetchQuantities`
      );

      const { bankNotes: fetchedBankNotes, quantities: fetchedQuantities } =
        await response.json();

      setBankNotes(fetchedBankNotes || []);
      setQuantities(
        fetchedQuantities && fetchedQuantities.length
          ? fetchedQuantities
          : fetchedBankNotes.map(() => 0)
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch data.");
      if (error.message?.includes("Session expired")) {
        authCtx.logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const { refreshing, onRefresh } = useRefresh(fetchData);

  // Fetch data from the backend server on mount
  useEffect(() => {
    fetchData();
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
    if (arraysAreEqual(lastSavedQuantities.current, quantities)) {
      Alert.alert("Warning!", "Quantities not changed.");
      return;
    }
    try {
      await authCtx.authFetch(`${apiEndpoint}/updateQuantities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantities }),
      });

      Alert.alert("Success!", "Quantities updated successfully.", [
        { text: "Ok" },
      ]);
    } catch (error) {
      console.error("Error updating quantities:", error);
      Alert.alert("Error", "Failed to update quantities. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      lastSavedQuantities.current = [...quantities];
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <View style={styles.initialLoader}>
          {/* Show skeleton loader when data is loading */}
          <BankNoteSkeleton />
        </View>
      ) : (
        <>
          <FlatList
            data={bankNotes}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
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
          <Text style={styles.total}>
            Total amount:{" "}
            <FontAwesome6
              name="bangladeshi-taka-sign"
              size={styles.total.fontSize}
              color="black"
            />{" "}
            {bankNotes
              .reduce(
                (sum, note, index) => (sum += note * quantities[index]),
                0
              )
              .toLocaleString()}
          </Text>
          <View style={styles.buttonContainer}>
            <CustomButton
              handlePress={handleResetAll}
              title="Reset all"
              buttonStyle={{
                backgroundColor: "red",
                flexGrow: 1,
              }}
            />
            <CustomButton
              handlePress={handleUpdate}
              title="Update"
              buttonStyle={{ flexGrow: 1 }}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 5,
    marginTop: 20,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  initialLoader: {
    justifyContent: "flex-start",
    alignItems: "stretch",
    marginTop: 10,
  },
  total: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
});
