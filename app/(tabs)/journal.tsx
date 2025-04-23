import { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Pressable,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import CustomButton from "@/components/CustomButton";
import { AuthContext } from "@/context/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import ItemsTable from "@/components/ItemsTable";

type Item = {
  note: string;
  amount: string;
};

export default function Journal() {
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // const apiEndpoint = "https://expense-tracker-gsheet.onrender.com";
  const apiEndpoint = "http://192.168.0.112:3000";

  const authCtx = useContext(AuthContext);
  const [isAccountClicked, setIsAccountClicked] = useState(false);

  const [date, setDate] = useState(new Date());
  const [dateText, setDateText] = useState(formatDate(date));
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  const [showPicker, setShowPicker] = useState(false);

  const [accountSuggestions, setAccountSuggestions] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [foodSuggestions, setFoodSuggestions] = useState<string[]>([]);
  const [filteredFoodSuggestions, setFilteredFoodSuggestions] = useState<
    string[]
  >([]);
  const [otherSuggestions, setOtherSuggestions] = useState<string[]>([]);
  const [filteredOtherSuggestions, setFilteredOtherSuggestions] = useState<
    string[]
  >([]);
  const [accountError, setAccountError] = useState(false);
  const lastFetchedRef = useRef<{ account: string; dateText: string } | null>(
    null
  );

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await authCtx.authFetch(
          `${apiEndpoint}/getSuggestions`
        );
        const data = await response.json();
        setAccountSuggestions(data.accounts);
        setFoodSuggestions(data.foodNames);
        setOtherSuggestions(data.otherItems);
      } catch (error) {
        console.error("Failed to fetch accounts: ", error);
      }
    };

    fetchAccount();
  }, []);

  const fetchExistingEntry = async () => {
    try {
      const response = await authCtx.authFetch(
        `${apiEndpoint}/getJournalEntry?date=${encodeURIComponent(
          dateText
        )}&account=${encodeURIComponent(account)}`
      );

      const data = await response.json();

      if (response.ok && data) {
        const notesArray =
          data.Notes?.split(",").map((note: string) => note.trim()) || [];

        let amountsArray: string[] = [];

        if (data.Amount?.startsWith("=")) {
          // Formula case
          amountsArray = data.Amount.replace(/^=/, "")
            .split("+")
            .map((amt: string) =>
              amt
                .replace(/[^0-9.]/g, "") // Remove non-numeric (e.g., $)
                .replace(/\.00$/, "") // Remove trailing .00
                .trim()
            );
        } else {
          // Single value case
          const cleanAmount = data.Amount?.replace(/[^0-9.]/g, "")
            .replace(/\.00$/, "")
            .trim();

          // Assign value to first item, rest 0
          amountsArray = notesArray.map((_: string, i: number) =>
            i === 0 ? cleanAmount || "0" : "0"
          );
        }

        const fetchedItems: Item[] = notesArray.map(
          (note: string, index: number) => ({
            note,
            amount: amountsArray[index] || "0",
          })
        );

        if (fetchedItems.length > 1) {
          fetchedItems.sort((a, b) => a.note.localeCompare(b.note));
        }

        setItems(fetchedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    const shouldFetch =
      account &&
      dateText &&
      (lastFetchedRef.current?.account !== account ||
        lastFetchedRef.current?.dateText !== dateText);

    if (shouldFetch) {
      fetchExistingEntry();
      lastFetchedRef.current = { account, dateText };
    }
  }, [dateText, account]);

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (event.type == "set" && selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);

      if (Platform.OS === "android") {
        toggleDatePicker();
        setDateText(formatDate(currentDate));
      }
    } else {
      toggleDatePicker();
    }
  };

  const onChangeText = (text: string) => {
    setAccount(text);

    if (text.trim().length === 0) {
      setFilteredSuggestions(accountSuggestions);
    } else {
      const filtered = accountSuggestions.filter((item) =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
    setIsAccountClicked(true);
  };

  const onChangeTextNote = (text: string) => {
    const trimmedText = text.trim();
    setNote(text);

    if (trimmedText === "") {
      setFilteredFoodSuggestions([]);
      setFilteredOtherSuggestions([]);
      return;
    }

    if (account === "Food Expense") {
      const filtered = foodSuggestions.filter((item) =>
        item.toLowerCase().includes(trimmedText.toLowerCase())
      );
      setFilteredFoodSuggestions(filtered);
    } else {
      const filtered = otherSuggestions.filter((item) =>
        item.toLowerCase().includes(trimmedText.toLowerCase())
      );
      setFilteredOtherSuggestions(filtered);
    }
  };

  const handleAddItems = () => {
    if (!!account && !!note && !!amount) {
      if (
        !items.find(
          (item) => item.note.toLowerCase() === note.toLowerCase().trim()
        )
      ) {
        setItems((prev) => {
          const updatedItems = [...prev, { note, amount }];
          // Sort alphabetically by 'note'
          updatedItems.sort((a, b) => a.note.localeCompare(b.note));
          return updatedItems;
        });
        setNote("");
        setAmount("");
        setFilteredFoodSuggestions([]);
        setFilteredOtherSuggestions([]);
      } else {
        Alert.alert("Duplicate!", "This item already exists.");
        setNote("");
        setAmount("");
        setFilteredFoodSuggestions([]);
        setFilteredOtherSuggestions([]);
      }
    } else {
      Alert.alert("Warning!", "Check your inputs!");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const handleAdd = async () => {
    if (!accountSuggestions.includes(account)) {
      setAccountError(true);
      return;
    }

    const combinedNotes = items.map((item) => item.note).join(", ");
    const combinedAmounts =
      (items.length > 1 ? "=" : "") +
      items.map((item) => item.amount).join("+");

    try {
      await authCtx.authFetch(`${apiEndpoint}/appendJournalEntry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateText,
          account: account,
          amount: items.length !== 0 ? combinedAmounts.trim() : amount.trim(),
          note: items.length !== 0 ? combinedNotes.trim() : note.trim(),
        }),
      });

      Alert.alert("Success!", "Journal entry added successfully.", [
        { text: "Ok" },
      ]);
      setItems([]);
    } catch (error) {
      console.error("Error adding journal entry:", error);
      Alert.alert("Error", "Failed to add journal entry. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      const today = new Date();
      setDate(today);
      setDateText(formatDate(today));
      setAccount("");
      setAmount("");
      setNote("");
      setAccountError(false);
      setFilteredSuggestions([]);
      setFilteredFoodSuggestions([]);
      setFilteredOtherSuggestions([]);
      setItems([]);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.label}>Date</Text>

          {showPicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={date}
              onChange={onChange}
            />
          )}

          <Pressable onPress={toggleDatePicker}>
            <TextInput
              style={styles.input}
              value={dateText}
              onChangeText={setDateText}
              placeholder="e.g. M/D/YYYY"
              editable={false}
            />
          </Pressable>
        </View>

        <View>
          <Text style={styles.label}>Account</Text>
          {accountError && (
            <Text style={{ color: "red", marginBottom: 4 }}>
              Please select a valid account from the suggestions.
            </Text>
          )}
          <TextInput
            style={[
              styles.input,
              accountError && { borderColor: "red", borderWidth: 2 },
            ]}
            value={account}
            onChangeText={onChangeText}
            placeholder="e.g. Food Expense"
            onFocus={() => {
              setIsAccountClicked(true);
              setFilteredSuggestions(accountSuggestions);
            }}
            onBlur={() => {
              setIsAccountClicked(false);
              setAccountError(false);
            }}
          />
          {isAccountClicked && (
            <View style={styles.suggestionList}>
              {filteredSuggestions.length > 0 ? (
                <FlatList
                  keyboardShouldPersistTaps="always"
                  data={filteredSuggestions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.suggestionItem}
                      onPress={() => {
                        setAccount(item);
                        setFilteredSuggestions([]);
                        setIsAccountClicked(false);
                        setAccountError(false);
                      }}
                    >
                      <Text>{item}</Text>
                    </Pressable>
                  )}
                />
              ) : (
                <View style={styles.suggestionItem}>
                  <Text style={{ color: "gray", fontStyle: "italic" }}>
                    No match found
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={onChangeTextNote}
            placeholder="e.g. Watermelon"
          />
        </View>
        {note.length > 0 &&
          (account === "Food Expense"
            ? filteredFoodSuggestions.length > 0
            : filteredOtherSuggestions.length > 0) && (
            <View style={{ marginBottom: 15 }}>
              <FlatList
                horizontal
                keyboardShouldPersistTaps="always"
                data={
                  account === "Food Expense"
                    ? filteredFoodSuggestions
                    : filteredOtherSuggestions
                }
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setNote(item)}
                    style={styles.foodItem}
                  >
                    <Text style={{ color: "white" }}>{item}</Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={{ width: 5 }} />}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        <View>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 100"
            keyboardType="numeric"
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addItemButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleAddItems}
        >
          <AntDesign name="pluscircleo" size={40} color="green" />
        </Pressable>

        {items.length > 0 && (
          <ItemsTable items={items} onRemoveItem={handleRemoveItem} />
        )}

        <CustomButton
          handlePress={handleAdd}
          title="Add"
          buttonStyle={{ flexGrow: 0 }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  addItemButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    margin: 10,
    padding: 10,
  },
  foodItem: {
    flex: 1,
    padding: 5,
    backgroundColor: "green",
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
    color: "black",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  suggestionList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 200,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
