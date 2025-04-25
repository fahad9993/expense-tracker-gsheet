import { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AuthContext } from "@/context/AuthContext";
import { Colors } from "@/utils/colors";

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  const authCtx = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    authCtx.logout();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.side}></View>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={handleLogout}>
        <AntDesign name="logout" size={24} color={"#fff"} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  side: {
    width: 24,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
});
