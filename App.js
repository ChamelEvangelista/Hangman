import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function App() {
  const [word, setWord] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [words, setWords] = useState({
    Easy: ["Java"],
    Medium: ["JavaScript", "Hangman"],
    Hard: []
  });

  const addWord = () => {
    if (word.trim() === "") return;
    setWords(prev => ({
      ...prev,
      [difficulty]: [...prev[difficulty], word]
    }));
    setWord("");
  };

  const deleteWord = (level, index) => {
    setWords(prev => ({
      ...prev,
      [level]: prev[level].filter((_, i) => i !== index)
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin: Manage Words</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new word"
          placeholderTextColor="#ccc"
          value={word}
          onChangeText={setWord}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={difficulty}
            style={styles.picker}
            onValueChange={(itemValue) => setDifficulty(itemValue)}
          >
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addWord}>
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {["Easy", "Medium", "Hard"].map(level => (
          <View key={level} style={styles.section}>
            <Text style={styles.sectionTitle}>{level} Words</Text>
            {words[level].map((item, index) => (
              <View key={index} style={styles.wordRow}>
                <Text style={styles.wordText}>{item}</Text>
                <TouchableOpacity onPress={() => deleteWord(level, index)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001F3F",
    padding: 20,
    paddingTop: 60
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  input: {
    flex: 1,
    backgroundColor: "#002B5B",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginRight: 8
  },
  pickerContainer: {
    borderRadius: 8,
    backgroundColor: "#002B5B",
    marginRight: 8
  },
  picker: {
    height: 40,
    width: 120,
    color: "#fff"
  },
  addBtn: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8
  },
  addText: {
    color: "#fff",
    fontWeight: "bold"
  },
  list: {
    flex: 1
  },
  section: {
    backgroundColor: "#002B5B",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00FF99",
    marginBottom: 8
  },
  wordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  wordText: {
    color: "#fff",
    fontSize: 16
  },
  deleteBtn: {
    color: "#FF6666",
    fontSize: 18
  },
  logoutBtn: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold"
  }
});
    
