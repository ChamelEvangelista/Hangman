import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminScreen from "./screens/AdminScreen";
import GameScreen from "./screens/GameScreen";
import HangmanScreen from "./screens/HangmanScreen";
import LoginScreen from "./screens/LoginScreen";
import PlayerScreen from "./screens/PlayerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Admin" 
          component={AdminScreen} 
          options={{ title: 'Hangman — Admin' }} 

        />
        <Stack.Screen 
          name="PlayerScreen"
          component={PlayerScreen} 
          options={{ title: 'Hangman — Player Dashboard' }} 
        />

        <Stack.Screen name="Game" component={GameScreen} />

        <Stack.Screen name="Hangman" component={HangmanScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
