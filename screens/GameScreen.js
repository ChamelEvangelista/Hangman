import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

export default function GameScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectDifficulty = (level) => {
    navigation.navigate("Hangman", { difficulty: level });
  };

  // Custom button
  const DifficultyButton = ({ title, colors, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        style={({ hovered, pressed }) => [
          styles.button,
          {
            backgroundColor: pressed
              ? colors.pressed
              : hovered
              ? colors.hovered
              : colors.default,
            transform: [{ scale: pressed ? 0.95 : 1 }], // simple jump shrink
          },
        ]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Select Difficulty</Text>

      <DifficultyButton
        title="Easy"
        colors={{ default: "#4CAF50", hovered: "#135a16ff", pressed: "#388E3C" }}
        onPress={() => handleSelectDifficulty("Easy")}
      />
      <DifficultyButton
        title="Medium"
        colors={{ default: "#FFC107", hovered: "#786118ff", pressed: "#FFA000" }}
        onPress={() => handleSelectDifficulty("Medium")}
      />
      <DifficultyButton
        title="Hard"
        colors={{ default: "#F44336", hovered: "#630f0fff", pressed: "#D32F2F" }}
        onPress={() => handleSelectDifficulty("Hard")}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#facc15",
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: 220,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});