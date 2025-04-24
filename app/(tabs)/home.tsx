import { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import BankNoteCard from "@/components/BankNoteCard";
import CustomButton from "@/components/CustomButton";
import { AuthContext } from "@/context/AuthContext";
import BankNoteSkeleton from "@/components/LoadingSkeleton/BankNoteSkeleton";
import { arraysAreEqual } from "@/utils/functions";
import { useRefetch } from "@/context/RefetchContext";

export default function Home() {
  const apiEndpoint = "https://expense-tracker-gsheet.onrender.com";
  const [bankNotes, setBankNotes] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const lastSavedQuantities = useRef(quantities);

  const authCtx = useContext(AuthContext);
  const { setNeedsRefetch } = useRefetch();

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

  // Fetch data from the backend server on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Sync button handler to manually trigger data fetch
  const handleSync = () => {
    fetchData();
  };

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
      setNeedsRefetch(true);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Cash in Hand</Text>
          <View style={styles.sync}>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.2 : 1 }]}
              onPress={handleSync}
            >
              <MaterialIcons name="sync" size={24} />
            </Pressable>
          </View>
        </View>
        {loading ? (
          <View style={styles.initialLoader}>
            {/* Show skeleton loader when data is loading */}
            <BankNoteSkeleton />
          </View>
        ) : (
          <>
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
                  marginTop: 20,
                }}
              />
              <CustomButton
                handlePress={handleUpdate}
                title="Update"
                buttonStyle={{ flexGrow: 1, marginTop: 20 }}
              />
            </View>
          </>
        )}
        <StatusBar backgroundColor={"green"} barStyle={"light-content"} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 5,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  heading: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
  },
  initialLoader: {
    justifyContent: "flex-start",
    alignItems: "stretch",
    marginTop: 10,
  },
  sync: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
