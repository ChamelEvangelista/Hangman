import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";

export default function GameScreen() {
  const [word, setWord] = useState("_ _ _ _ _");
  const [mistakes, setMistakes] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>🎮 Hangman Game</Text>
      <Text style={styles.word}>{word}</Text>
      <Text style={styles.mistakes}>Mistakes: {mistakes}</Text>

      <View style={styles.buttons}>
        <Pressable
          style={styles.button}
          onPress={() => setMistakes((m) => m + 1)}
        >
          <Text style={styles.buttonText}>Guess Wrong</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.success]}
          onPress={() => setWord("W I N !")}
        >
          <Text style={styles.buttonText}>Guess Right</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a23",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  word: {
    color: "#fff",
    fontSize: 28,
    letterSpacing: 5,
    marginBottom: 15,
  },
  mistakes: {
    color: "#FF4040",
    fontSize: 16,
    marginBottom: 30,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
  },
  success: {
    backgroundColor: "#00C851",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});