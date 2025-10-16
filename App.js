// App.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import styles from './styles'; // ✅ Import styles from separate file

export default function App() {
  const [role, setRole] = useState('player');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#001b44" barStyle="light-content" />

      <View style={styles.card}>
        <Text style={styles.title}>HANGMAN</Text>
        <Text style={styles.subtitle}>Guess the word — accumulate points</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
          />
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'player' && styles.activePlayer,
            ]}
            onPress={() => setRole('player')}
          >
            <Text style={styles.roleText}>Player</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'admin' && styles.activeAdmin,
            ]}
            onPress={() => setRole('admin')}
          >
            <Text style={styles.roleText}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don’t have an account? <Text style={styles.signUp}>Sign Up</Text>
        </Text>

        <Text style={styles.smallNote}>App still in production...</Text>
      </View>
    </SafeAreaView>
  );
}