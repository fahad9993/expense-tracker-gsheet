import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAxios } from "@/hooks/useAxios";
import { BASE_URL } from "@/api/apiConfig";
import CustomButton from "@/components/CustomButton";
import { Colors } from "@/utils/colors";

interface FilterRow {
  date: string;
  amount: number;
  notes: string;
}

export default function Filter() {
  const api = useAxios();

  const [month, setMonth] = useState<string | "">("");
  const [account, setAccount] = useState<string | "">("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [rows, setRows] = useState<FilterRow[]>([]);
  const [loading, setLoading] = useState(false); // <-- Loading state

  // Fetch account names on mount
  useEffect(() => {
    api
      .get(`${BASE_URL}/filter`)
      .then((res) => setAccounts(res.data.accounts))
      .catch((err) => console.error("Failed to fetch accounts:", err));
  }, []);

  const applyFilters = async () => {
    if (!account) {
      alert("Please select an account");
      return;
    }

    setLoading(true); // start loading
    try {
      const response = await api.get(`${BASE_URL}/filter`, {
        params: { month, account },
      });

      const formattedRows = response.data.rows;
      setRows(formattedRows);
    } catch (err) {
      console.error("Failed to fetch filtered rows:", err);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const months = [
    { label: "All Months", value: "" },
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Month</Text>
      <Picker selectedValue={month} onValueChange={setMonth}>
        {months.map((m) => (
          <Picker.Item key={m.value} label={m.label} value={m.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Account</Text>
      <Picker selectedValue={account} onValueChange={setAccount}>
        <Picker.Item label="Select Account" value="" />
        {accounts.map((acc, idx) => (
          <Picker.Item key={idx} label={acc} value={acc} />
        ))}
      </Picker>

      <CustomButton title="Apply Filters" handlePress={applyFilters} />

      {loading && (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 20 }}
        />
      )}

      {!loading && rows.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Date</Text>
            <Text style={[styles.cell, styles.headerCell]}>Amount</Text>
            <Text style={[styles.cell, styles.headerCell]}>Notes</Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(_, index) => index.toString()}
            ListFooterComponent={() => {
              const total = rows.reduce((sum, item) => sum + item.amount, 0);
              return (
                <View>
                  <View style={[styles.row, { backgroundColor: "#e0e0e0" }]}>
                    <Text style={[styles.cell, { fontWeight: "bold" }]}>
                      Total
                    </Text>
                    <Text style={[styles.cell, { fontWeight: "bold" }]}>
                      {total}
                    </Text>
                    <Text style={styles.cell}></Text>
                  </View>
                  <View style={{ height: 300 }}>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginTop: 10,
                      }}
                    >
                      End of results.
                    </Text>
                  </View>
                </View>
              );
            }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.date}</Text>
                <Text style={styles.cell}>{item.amount}</Text>
                <Text style={styles.cell}>{item.notes}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  label: { marginTop: 10, fontSize: 16, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerRow: {
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 2,
  },
  cell: { flex: 1, textAlign: "center" },
  headerCell: { fontWeight: "bold" },
});
