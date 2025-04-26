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
import Toast from "react-native-toast-message";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import BankNoteCard from "@/components/BankNoteCard";
import CustomButton from "@/components/CustomButton";
import { AuthContext } from "@/context/AuthContext";
import BankNoteSkeleton from "@/components/LoadingSkeleton/BankNoteSkeleton";
import { arraysAreEqual } from "@/utils/functions";
import { useRefresh } from "@/hooks/useRefresh";
import { BASE_URL } from "@/api/apiConfig";

export default function Home() {
  const apiEndpoint = `${BASE_URL}/home`;
  const [bankNotes, setBankNotes] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const lastSavedQuantities = useRef(quantities);

  const authCtx = useContext(AuthContext);

  // Function to fetch the data from the server
  const fetchData = async () => {
    const response = await authCtx.authFetch(`${apiEndpoint}/fetch`);

    const { bankNotes: fetchedBankNotes, quantities: fetchedQuantities } =
      await response.json();

    const safeBankNotes = fetchedBankNotes ?? [];
    const safeQuantities =
      fetchedQuantities && fetchedQuantities.length
        ? fetchedQuantities
        : fetchedBankNotes.map(() => 0);
    return { safeBankNotes, safeQuantities };
  };

  const refreshData = async () => {
    const { safeBankNotes, safeQuantities } = await fetchData();
    setBankNotes(safeBankNotes);
    setQuantities(safeQuantities);
    lastSavedQuantities.current = safeQuantities;
  };

  const { refreshing, onRefresh } = useRefresh(refreshData);

  // Fetch data from the backend server on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { safeBankNotes, safeQuantities } = await fetchData();

        setBankNotes(safeBankNotes);
        setQuantities(safeQuantities);
        lastSavedQuantities.current = safeQuantities;
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch data.");
        if (error.message?.includes("Session expired")) {
          authCtx.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    load();
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

  const updateQuantities = async (newQuantities: number[]) => {
    const response = await authCtx.authFetch(`${apiEndpoint}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantities: newQuantities }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to update quantities.");
    }

    const successMessage = await response.text();
    return successMessage;
  };

  const handleUpdate = async () => {
    if (arraysAreEqual(lastSavedQuantities.current, quantities)) {
      Toast.show({
        type: "info",
        text1: "Warning!",
        text2: "Quantities not changed.",
      });
      return;
    }
    setIsUpdating(true);
    try {
      const message = await updateQuantities(quantities);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: message,
      });

      lastSavedQuantities.current = [...quantities]; // only update if server success
    } catch (error: any) {
      console.error("Error updating quantities:", error);
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: error.message || "Failed to update quantities.",
      });
    } finally {
      setIsUpdating(false);
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
                flex: 1,
              }}
            />
            <CustomButton
              handlePress={handleUpdate}
              title="Update"
              buttonStyle={{ flex: 1 }}
              loading={isUpdating}
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
