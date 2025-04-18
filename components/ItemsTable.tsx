import { FlatList, StyleSheet, View, Text, Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

type Item = {
  note: string;
  amount: number | string;
};

type Items = {
  items: Item[];
  onRemoveItem: (index: number) => void; // Add function to handle item removal
};

export default function ItemsTable({ items, onRemoveItem }: Items) {
  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
  return (
    <View style={{ flex: 1, marginTop: 15 }}>
      <FlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.tableRow}>
            <View style={styles.noteCell}>
              <Text>{item.note}</Text>
            </View>
            <View style={styles.amountCell}>
              <Text style={{ textAlign: "left" }}>{item.amount}</Text>
            </View>
            <View style={styles.iconCell}>
              <Pressable onPress={() => onRemoveItem(index)}>
                <AntDesign name="closecircleo" size={20} color="green" />
              </Pressable>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={[styles.tableRow, styles.headerRow]}>
            <View style={styles.noteCell}>
              <Text style={styles.headerText}>Note</Text>
            </View>
            <View style={styles.amountCell}>
              <Text style={[styles.headerText, { textAlign: "left" }]}>
                Amount
              </Text>
            </View>
            <View style={styles.iconCell}>
              {/* Empty view to maintain alignment */}
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.tableRow, styles.headerRow]}>
            <View style={styles.noteCell}>
              <Text style={styles.headerText}>Total</Text>
            </View>
            <View style={styles.amountCell}>
              <Text style={{ textAlign: "left", fontWeight: "bold" }}>
                {totalAmount}
              </Text>
            </View>
            <View style={styles.iconCell}>
              {/* Empty view to align with the icon column */}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  noteCell: {
    flex: 2,
    paddingLeft: 10,
  },
  amountCell: {
    flex: 1,
    paddingRight: 10,
  },
  iconCell: {
    width: 30, // Adjust this to fit your icon comfortably
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#eee",
  },
  headerText: {
    fontWeight: "bold",
  },
});
