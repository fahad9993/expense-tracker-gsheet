import { useEffect, useState } from "react";
import { View, StyleSheet, Text, FlatList, Pressable } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import { formatBDNumber } from "@/utils/functions";
import CustomButton from "./CustomButton";

type pieProps = {
  accountName: string;
  amount: number;
  currentAmount: number;
};

type Props = {
  pieData: pieProps[];
};

type Data = {
  text: string;
  value: number;
  color: string;
  focused: boolean;
};

export default function PieChartComponent({ pieData }: Props) {
  const colors = [
    "#845ec2",
    "#009efa",
    "#00d2fc",
    "#8E1616",
    "#4ffbdf",
    "#0118D8",
    "#27391C",
    "#626F47",
    "#FF0B55",
    "#36BA98",
    "#E9C46A",
    "#F4A261",
    "#E76F51",
  ];

  const [data, setData] = useState<Data[]>([]);
  const [showMonthly, setShowMonthly] = useState(false);

  useEffect(() => {
    if (pieData && pieData.length > 0) {
      const transformed = pieData
        .map((item, index) => ({
          text: item.accountName,
          value: showMonthly ? item.currentAmount : item.amount,
          color: colors[index % colors.length],
          focused: false,
        }))
        .filter((item) => item.value > 0);
      setData(transformed);
    }
  }, [pieData, showMonthly]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handlePress = (accountName: string) => {
    const updated = data.map((item) => ({
      ...item,
      focused: item.text === accountName,
    }));

    setData(updated);
    setSelectedAccount(accountName);
  };

  return (
    <View style={{ flex: 1, marginVertical: 20, alignItems: "center" }}>
      <CustomButton
        title={showMonthly ? "Show Yearly" : "Show Monthly"}
        handlePress={() => setShowMonthly(!showMonthly)}
        buttonStyle={styles.button}
      />
      <PieChart
        donut
        radius={150}
        sectionAutoFocus
        data={data}
        centerLabelComponent={() => {
          return <Text style={{ fontSize: 20 }}>{formatBDNumber(total)}</Text>;
        }}
        onPress={(item: Data) => handlePress(item.text)}
      />

      {data.find((item) => item.text === selectedAccount)?.value && (
        <View style={{ marginVertical: 5 }}>
          <Text>
            {selectedAccount}:{" "}
            {formatBDNumber(
              data.find((item) => item.text === selectedAccount)?.value ?? 0
            )}{" "}
            taka
          </Text>
        </View>
      )}
      <FlatList
        scrollEnabled={false}
        data={data}
        keyExtractor={(_item, index) => index.toString()}
        style={{ marginTop: 10, maxHeight: "auto", width: "100%" }}
        renderItem={({ item }) => (
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 5,
              },
              item.focused ? { backgroundColor: "gray" } : "",
            ]}
          >
            <Pressable onPress={() => handlePress(item.text)}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexShrink: 1,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: item.color,
                    marginRight: 8,
                    borderRadius: 4,
                  }}
                />
                <Text
                  style={[
                    { fontSize: 14, color: "#333" },
                    item.focused ? { color: "white" } : "",
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </Pressable>

            <Text
              style={[
                { fontSize: 14, color: "#333" },
                item.focused ? { color: "white" } : "",
              ]}
            >
              {(((item.value + Number.EPSILON) / total) * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    width: "50%",
  },
});
