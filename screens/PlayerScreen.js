import { useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";



export default function PlayerScreen({ navigation, route }) {
  const { username } = route.params;

  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


const Button = ({ title, color, onPress }) =>(
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, { backgroundColor: color }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

return (
<Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.title}>Welcome, {username}!</Text>

      <View style={styles.statsBox}>
        <Text style={styles.stat}>Games Played: {playerStats.gamesPlayed}</Text>
        <Text style={styles.stat}>Wins: {playerStats.wins}</Text>
        <Text style={styles.stat}>Losses: {playerStats.losses}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start New Game"
          color="#1f6feb"
          onPress={() => navigation.navigate("Game")}
        />
        <Button
          title="View Game History"
          color="#10b981"
          onPress={() => navigation.navigate("HistoryScreen")}
        />
        <Button
          title="Logout"
          color="#ef4444"
          onPress={() => navigation.replace("Login")}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // dark navy
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#facc15", // yellow
  },
  statsBox: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#334056ff", // slate gray
    elevation: 5,
    width: "85%",
    alignItems: "center",
  },
  stat: {
    fontSize: 18,
    color: "#e2e8f0", // light gray
    marginBottom: 6,
  },
  buttonContainer: {
    width: "85%",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});