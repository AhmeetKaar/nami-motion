import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

LogBox.ignoreLogs(["Sending `onAnimatedValueUpdate` with no listeners registered."]);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerLargeTitle: true }}>
        <Stack.Screen name="index" options={{ title: "nami-motion" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
