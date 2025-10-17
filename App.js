import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { styles } from "./GameScreenStyles"; // 👈 import your shared stylesheet

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Hangman Game App 🎮</Text>
      <Text style={styles.subtitle}>React Native is ready!</Text>
      <StatusBar style="auto" />
    </View>
  );
}