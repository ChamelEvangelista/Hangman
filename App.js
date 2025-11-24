// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDatabase } from './services/DatabaseService';
import { UserProvider } from './contexts/UserContext';

// Import your screens
import LoginScreen from './screens/LoginScreen';
import GameScreen from './screens/GameScreen';
import HangmanScreen from './screens/HangmanScreen';
import AdminScreen from './screens/AdminScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PlayerScreen from './screens/PlayerScreen';

const Stack = createStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setInitError(error.message);
        setDbInitialized(true); // Continue anyway
      }
    };

    initializeDB();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: 'white', marginTop: 10 }}>Initializing Database...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: 'white',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen} 
            options={{ title: 'Select Difficulty' }} 
          />
          <Stack.Screen 
            name="Hangman" 
            component={HangmanScreen} 
            options={{ title: 'Hangman Game' }} 
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ title: 'Admin Panel' }} 
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen} 
            options={{ title: 'Leaderboard' }} 
          />
          <Stack.Screen 
            name="PlayerScreen" 
            component={PlayerScreen} 
            options={{ title: 'Player Dashboard' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}