import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./TabBarButton";

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const icon = options.tabBarIcon?.({
          focused: isFocused,
          color: isFocused ? "green" : "#999",
          size: 20,
        });

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabBarButton
            key={route.key}
            label={
              typeof label === "function"
                ? String(
                    label({
                      focused: isFocused,
                      color: isFocused ? "green" : "#999",
                      position: "below-icon",
                      children: route.name,
                    })
                  )
                : String(label ?? "")
            }
            isFocused={isFocused}
            icon={icon}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 10,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 4,
  },
});
