import { useState, useCallback } from "react";
import { Alert } from "react-native";

export const useRefresh = (fetchFunction: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFunction();
    } catch (error) {
      console.error("Refresh failed:", error);
      Alert.alert("Error", "Failed to refresh data.");
    } finally {
      setRefreshing(false);
    }
  }, [fetchFunction]);

  return { refreshing, onRefresh };
};
