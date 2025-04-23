import { useContext, useEffect, useRef, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, Modal, Text, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";

import AgentAmount from "@/components/AgentAmount";
import CustomButton from "@/components/CustomButton";
import PieChart from "@/components/PieChart";
import { AuthContext } from "@/context/AuthContext";
import DashboardSkeleton from "@/components/LoadingSkeleton/DashboardSkeleton";

export default function Dashboard() {
  const apiEndpoint = "https://expense-tracker-gsheet.onrender.com";
  const [amounts, setAmounts] = useState<number[]>([0, 0, 0, 0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [curentIndex, setCurrentIndex] = useState<number | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [variance, setVariance] = useState(0);
  const authCtx = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  const headers = ["Nagad", "bKash", "Rocket", "Cash"];
  const router = useRouter();
  const lastSavedAmount = useRef(amounts);

  type pieProps = {
    accountName: string;
    amount: number;
  };
  const [pieData, setPieData] = useState<pieProps[]>([]);

  const arraysAreEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((val, i) => val === b[i]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authCtx.authFetch(
          `${apiEndpoint}/getDashboardInfo`
        );
        if (response.ok) {
          const data = await response.json();
          const sanitizedAmounts = data.amounts.map((amount: number) =>
            amount !== null ? amount : 0
          );
          setAmounts(sanitizedAmounts);
          lastSavedAmount.current = sanitizedAmounts;
          setVariance(data.variance);
          const pieFormatted = data.pieChart.labels.map(
            (label: string, i: number) => ({
              accountName: label,
              amount: data.pieChart.values[i],
            })
          );

          setPieData(pieFormatted);
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePress = (index: number) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const updatedAmounts = [...amounts];
    const trimmed = newAmount.trim();

    // Validate: must be a number and not just whitespace
    const updatedAmount = parseFloat(trimmed);
    if (!trimmed || isNaN(updatedAmount)) {
      setAmountError(true);
      return;
    }

    // Update the correct index
    if (curentIndex !== null) {
      updatedAmounts[curentIndex] = updatedAmount;
    }

    if (arraysAreEqual(lastSavedAmount.current, updatedAmounts)) {
      Alert.alert("Warning!", "You cannot save values equal previous amount.", [
        { text: "Ok" },
      ]);
      return;
    }

    setAmounts(updatedAmounts);
    setAmountError(false);

    try {
      const response = await authCtx.authFetch(
        `${apiEndpoint}/updateDashboardInfo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amounts: updatedAmounts }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data?.message || "Unknown error");
        Alert.alert("Error", data?.message || "Failed to update");
        return;
      }

      Alert.alert("Success!", "Agent amount updated successfully.", [
        { text: "Ok" },
      ]);

      lastSavedAmount.current = updatedAmounts;
    } catch (error) {
      console.error("Error updating amounts: ", error);
      Alert.alert("Error", "Something went wrong while updating.");
    } finally {
      setModalVisible(false);
      setCurrentIndex(null);
      setNewAmount("");
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.agentContainer}>
          <AgentAmount
            source={require("../../assets/images/nagad.png")}
            amount={amounts[0].toString()}
            handlePress={() => handlePress(0)}
          />
          <AgentAmount
            source={require("../../assets/images/bkash.png")}
            amount={amounts[1].toString()}
            handlePress={() => handlePress(1)}
          />
          <AgentAmount
            source={require("../../assets/images/rocket.png")}
            amount={amounts[2].toString()}
            handlePress={() => handlePress(2)}
          />
          <AgentAmount
            source={require("../../assets/adaptive-icon.png")}
            amount={amounts[3].toString()}
            handlePress={() => router.push("/home")}
          />
        </View>

        <Modal
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            setNewAmount("");
          }}
          transparent={true}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {curentIndex !== null ? headers[curentIndex] : "Header"}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                New amount:
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: amountError ? "red" : "gray" },
                ]}
                value={newAmount}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setNewAmount(text);
                  if (amountError && text.trim() !== "") {
                    setAmountError(false);
                  }
                }}
                placeholder="Enter updated amount.."
                onFocus={() => {}}
              />
              {amountError && (
                <Text style={{ color: "red", fontSize: 12 }}>
                  This field cannot be empty.
                </Text>
              )}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <CustomButton
                  title="Cancel"
                  handlePress={() => {
                    setModalVisible(false);
                    setNewAmount("");
                  }}
                  buttonStyle={{ backgroundColor: "red", flexGrow: 1 }}
                />
                <CustomButton
                  title="Save"
                  handlePress={handleSave}
                  buttonStyle={{ flexGrow: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
        {!!variance && (
          <View style={styles.variance}>
            <Text style={styles.variaceText}>Variance:</Text>
            <Text style={styles.variaceText}>{variance}</Text>
          </View>
        )}
        <PieChart pieData={pieData} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  agentContainer: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  container: {
    flex: 1,
    margin: 10,
    padding: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(104, 104, 104, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  variance: {
    width: "100%",
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "gray",
  },
  variaceText: { fontWeight: "bold", color: "white", fontSize: 16 },
});
