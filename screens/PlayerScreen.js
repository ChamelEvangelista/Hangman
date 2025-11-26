// screens/PlayerScreen.js
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../contexts/UserContext";

export default function PlayerScreen({ navigation, route }) {
  const { user } = useUser();
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    score: 0,
    winRatio: 0,
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

    // Load user stats
    if (user) {
      setPlayerStats({
        gamesPlayed: user.games_played || 0,
        wins: user.games_won || 0,
        losses: (user.games_played || 0) - (user.games_won || 0),
        score: user.score || 0,
        winRatio: user.games_played > 0 ? ((user.games_won || 0) / user.games_played * 100).toFixed(1) : 0,
      });
    }
  }, [user]);

  const Button = ({ title, color, onPress }) => (
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
      <Text style={styles.title}>Welcome, {user?.username}!</Text>

      <View style={styles.statsBox}>
        <Text style={styles.stat}>Total Score: <Text style={styles.statValue}>{playerStats.score}</Text></Text>
        <Text style={styles.stat}>Games Played: <Text style={styles.statValue}>{playerStats.gamesPlayed}</Text></Text>
        <Text style={styles.stat}>Wins: <Text style={styles.statValue}>{playerStats.wins}</Text></Text>
        <Text style={styles.stat}>Losses: <Text style={styles.statValue}>{playerStats.losses}</Text></Text>
        <Text style={styles.stat}>Win Ratio: <Text style={styles.statValue}>{playerStats.winRatio}%</Text></Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start New Game"
          color="#584738" // Mahogany
          onPress={() => navigation.navigate("Game")}
        />
        <Button
          title="View Leaderboard"
          color="#98755B" // Light brown
          onPress={() => navigation.navigate("Leaderboard")}
        />
        <Button
          title="Logout"
          color="#A52A2A" // Complementary red
          onPress={() => navigation.replace("Login")}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EADA", // Milk background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3D1F12", // Espresso
    textAlign: "center",
  },
  statsBox: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF", // White background
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E2D9", // Light border
  },
  stat: {
    fontSize: 18,
    color: "#584738", // Mahogany for regular text
    marginBottom: 8,
    width: '100%',
    textAlign: 'center',
    fontWeight: '500',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#3D1F12', // Espresso for values
  },
  buttonContainer: {
    width: "85%",
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});