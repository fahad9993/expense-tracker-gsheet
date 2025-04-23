import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, FlatList, Pressable } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import { formatBDNumber } from "@/utils/functions";

type pieProps = {
  accountName: string;
  amount: number;
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

  useEffect(() => {
    if (pieData && pieData.length > 0) {
      const transformed = pieData.map((item, index) => ({
        text: item.accountName,
        value: item.amount,
        color: colors[index],
        focused: false,
      }));
      setData(transformed);
    }
  }, [pieData]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const handlePress = (index: number) => {
    const updated = data.map((item, i) => ({
      ...item,
      focused: i === index,
    }));

    setData(updated);
    setSelectedIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, // 0.5 centers the item in the view
    });
  };

  return (
    <View style={{ flex: 1, marginTop: 40, alignItems: "center" }}>
      <PieChart
        donut
        radius={150}
        sectionAutoFocus
        data={data}
        centerLabelComponent={() => {
          return <Text style={{ fontSize: 20 }}>{formatBDNumber(total)}</Text>;
        }}
        onPress={(item: Data, index: number) => handlePress(index)}
      />

      {selectedIndex !== null && (
        <View style={{ marginVertical: 5 }}>
          <Text>
            {data[selectedIndex].text}:{" "}
            {formatBDNumber(data[selectedIndex].value)} taka
          </Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 500);
        }}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 10, maxHeight: 200, width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item, index }) => (
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
            <Pressable onPress={() => handlePress(index)}>
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

const styles = StyleSheet.create({});
