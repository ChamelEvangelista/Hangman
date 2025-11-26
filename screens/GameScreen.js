// screens/GameScreen.js
import { useEffect, useRef, useState } from "react";
import { 
  Animated, 
  Pressable, 
  StyleSheet, 
  Text, 
  Alert, 
  View, 
  TouchableOpacity 
} from "react-native";
import { WordService } from "../services/DatabaseService";
import { useUser } from "../contexts/UserContext";

export default function GameScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const { user, logout } = useUser();

  useEffect(() => {
    // Set header right button for chat
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('ChatList')}
          style={styles.chatHeaderButton}
        >
          <Text style={styles.chatHeaderText}>💬</Text>
        </TouchableOpacity>
      ),
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [navigation]);

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

  // Custom button with espresso color palette
  const DifficultyButton = ({ title, level, onPress, disabled = false }) => {
    const getButtonColors = () => {
      switch (level) {
        case "Easy":
          return { 
            default: "#ba8a5c", // BREW
            pressed: "#cdac81", // MOCHA - lighter shade
            text: "#340100" // ROAST - dark text for contrast
          };
        case "Medium":
          return { 
            default: "#78400f", // ESPRESSO
            pressed: "#8a5a2a", // Darker espresso
            text: "#FFFFF4" // CANVAS - light text
          };
        case "Hard":
          return { 
            default: "#340100", // ROAST
            pressed: "#4a1a00", // Darker roast
            text: "#FFFFF4" // CANVAS - light text
          };
        default:
          return { 
            default: "#cdac81", // MOCHA
            pressed: "#ba8a5c", // BREW
            text: "#340100" // ROAST
          };
      }
    };

    const colors = getButtonColors();

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: disabled 
              ? '#cdac81' // MOCHA for disabled
              : pressed
              ? colors.pressed
              : colors.default,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: disabled ? 0.6 : 1,
            borderWidth: 2,
            borderColor: colors.pressed,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {loading && disabled ? "Loading..." : title}
        </Text>
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Select Difficulty</Text>
        <Text style={styles.welcome}>Welcome, {user?.username}!</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <DifficultyButton
          title="Easy"
          level="Easy"
          disabled={loading}
          onPress={() => handleSelectDifficulty("Easy")}
        />
        <DifficultyButton
          title="Medium"
          level="Medium"
          disabled={loading}
          onPress={() => handleSelectDifficulty("Medium")}
        />
        <DifficultyButton
          title="Hard"
          level="Hard"
          disabled={loading}
          onPress={() => handleSelectDifficulty("Hard")}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.footerButtonText}>🏆 View Leaderboard</Text>
        </TouchableOpacity>
        
        {user?.role === 'admin' && (
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.footerButtonText}>⚙️ Admin Panel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('ChatList')}
        >
          <Text style={styles.footerButtonText}>💬 Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#d5c1acff", // ROAST - Dark background
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#340100", // ROAST
    textAlign: 'center',
  },
  welcome: {
    fontSize: 16,
    marginBottom: 10,
    color: "#78400f", // MOCHA - Warm neutral
    textAlign: 'center',
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 12,
    width: 240,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  footerButton: {
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#78400f', // ESPRESSO
    width: 220,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
    elevation: 3,
  },
  footerButtonText: {
    color: '#e0d2b7', // LATTE
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ba8a5c', // BREW
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#ba8a5c', // BREW
    fontSize: 16,
    fontWeight: '500',
  },
  chatHeaderButton: {
    marginRight: 15,
    backgroundColor: '#ba8a5c', // BREW
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderText: {
    color: '#340100', // ROAST
    fontSize: 18,
    fontWeight: 'bold',
  },
});