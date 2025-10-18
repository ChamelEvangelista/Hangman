import { Button, StyleSheet, Text, View } from "react-native";

export default function HangmanScreen({ route, navigation }) {
  const { difficulty } = route.params; // receive difficulty from GameScreen

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hangman Game</Text>
      <Text style={styles.subtitle}>Difficulty: {difficulty}</Text>

      {/* This is where you’ll implement the game logic later */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, marginBottom: 15, fontWeight: "bold" },
  subtitle: { fontSize: 20, marginBottom: 30 },
});
