// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Hangman Game and The Developers</Text>
        
        <Text style={styles.sectionTitle}>Game Description</Text>
        <Text style={styles.text}>
          Hangman is a classic word guessing game where players try to guess a hidden word 
          by suggesting letters within a certain number of attempts. Expect screen crashing and errors along the game  due to the game is still under development.
        </Text>

        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.text}>
          • Multiple difficulty levels{"\n"}
          • Leaderboard system{"\n"}
          • Real-time chat{"\n"}
          • Admin panel for word management
        </Text>

        <Text style={styles.sectionTitle}>How to Play</Text>
        <Text style={styles.text}>
          1. Select your difficulty level{"\n"}
          2. Guess letters one by one{"\n"}
          3. Each incorrect guess brings you closer to losing{"\n"}
          4. Guess the word before running out of attempts to win!
        </Text>

        <Text style={styles.sectionTitle}>Developed By: Chamel Evangelista</Text>
        <Text style={styles.text}>Contributions and group members:{"\n"}
            Aclo, Pedro{"\n"}
            Alquizar, Henry{"\n"}
            Daigan, Darell{"\n"}
            Jotojot, Jonathan{"\n"}
            Lofranco, Cendey{"\n"}
            Orapa, Mariane{"\n"}
            Sanchez, Mary Ann{"\n"}
            Sugala, Liza Mae
        </Text>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EADA',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D1F12',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#584738',
    marginTop: 15,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#3D1F12',
    lineHeight: 22,
  },
  version: {
    fontSize: 14,
    color: '#98755B',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
});