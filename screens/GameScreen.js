// screens/GameScreen.js
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, Alert } from "react-native";
import { WordService } from "../services/DatabaseService";
import { useUser } from "../contexts/UserContext";

export default function GameScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const { user, logout } = useUser();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectDifficulty = async (level) => {
    setLoading(true);
    try {
      const words = await WordService.getWordsByDifficulty(level);
      
      if (words.length === 0) {
        Alert.alert(
          "No Words Available",
          `There are no words for ${level} difficulty. Please add words in the admin panel.`,
          [{ text: "OK" }]
        );
        return;
      }

      navigation.navigate("Hangman", { 
        difficulty: level,
        words: words 
      });
    } catch (error) {
      console.error('Error fetching words:', error);
      Alert.alert("Error", "Failed to load words. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // Custom button
  const DifficultyButton = ({ title, colors, onPress, disabled = false }) => {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ hovered, pressed }) => [
          styles.button,
          {
            backgroundColor: disabled 
              ? '#666' 
              : pressed
              ? colors.pressed
              : hovered
              ? colors.hovered
              : colors.default,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text style={styles.buttonText}>
          {loading && disabled ? "Loading..." : title}
        </Text>
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Select Difficulty</Text>
      <Text style={styles.welcome}>Welcome, {user?.username}!</Text>

      <DifficultyButton
        title="Easy"
        disabled={loading}
        colors={{ default: "#4CAF50", hovered: "#135a16ff", pressed: "#388E3C" }}
        onPress={() => handleSelectDifficulty("Easy")}
      />
      <DifficultyButton
        title="Medium"
        disabled={loading}
        colors={{ default: "#FFC107", hovered: "#786118ff", pressed: "#FFA000" }}
        onPress={() => handleSelectDifficulty("Medium")}
      />
      <DifficultyButton
        title="Hard"
        disabled={loading}
        colors={{ default: "#F44336", hovered: "#630f0fff", pressed: "#D32F2F" }}
        onPress={() => handleSelectDifficulty("Hard")}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.leaderboardButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.leaderboardText}>View Leaderboard</Text>
        </TouchableOpacity>
        
        {user?.role === 'admin' && (
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.adminText}>Admin Panel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#facc15",
  },
  welcome: {
    fontSize: 16,
    marginBottom: 30,
    color: "#94a3b8",
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
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  leaderboardButton: {
    padding: 12,
    marginVertical: 5,
  },
  leaderboardText: {
    color: '#60a5fa',
    fontSize: 16,
  },
  adminButton: {
    padding: 12,
    marginVertical: 5,
  },
  adminText: {
    color: '#f59e0b',
    fontSize: 16,
  },
  logoutButton: {
    padding: 12,
    marginVertical: 5,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
  },
});