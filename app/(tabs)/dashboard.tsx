import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import AgentAmount from "@/components/AgentAmount";
import CustomButton from "@/components/CustomButton";
import PieChart from "@/components/PieChart";
import { AuthContext } from "@/context/AuthContext";
import DashboardSkeleton from "@/components/LoadingSkeleton/DashboardSkeleton";
import { arraysAreEqual } from "@/utils/functions";
import { useRefresh } from "@/hooks/useRefresh";

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
  const [isUpdating, setIsUpdating] = useState(false);

  const headers = ["Nagad", "bKash", "Rocket", "Cash"];
  const router = useRouter();
  const lastSavedAmount = useRef(amounts);

  type pieProps = {
    accountName: string;
    amount: number;
    currentAmount: number;
  };
  const [pieData, setPieData] = useState<pieProps[]>([]);

  const fetchData = useCallback(async () => {
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
            currentAmount: data.pieChart.currentValues[i],
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
  }, [authCtx]);

  const { refreshing, onRefresh } = useRefresh(fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePress = (index: number) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
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
      Toast.show({
        type: "info",
        text1: "Warning!",
        text2: "You cannot save values equal previous amount.",
      });
      return;
    }

    setAmounts(updatedAmounts);
    setAmountError(false);
    setIsUpdating(true);

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

      const message = await response.text();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: message,
        });
      }

      lastSavedAmount.current = updatedAmounts;
    } catch (error) {
      console.error("Error updating amounts: ", error);
      Alert.alert("Error", "Something went wrong while updating.");
    } finally {
      setIsUpdating(false);
      setModalVisible(false);
      setCurrentIndex(null);
      setNewAmount("");
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ paddingVertical: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

        {!!variance && (
          <View style={styles.variance}>
            <Text style={styles.variaceText}>Variance:</Text>
            <Text style={styles.variaceText}>{variance}</Text>
          </View>
        )}
        <PieChart pieData={pieData} />
      </ScrollView>
      <Modal
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setNewAmount("");
          setAmountError(false);
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
                  setAmountError(false);
                }}
                buttonStyle={{ backgroundColor: "red", flex: 1 }}
              />
              <CustomButton
                title="Update"
                handlePress={handleUpdate}
                buttonStyle={{ flex: 1 }}
                loading={isUpdating}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingHorizontal: 10,
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
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "gray",
  },
  variaceText: { fontWeight: "bold", color: "white", fontSize: 16 },
});
