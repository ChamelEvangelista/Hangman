<<<<<<< HEAD
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker"; // ✅ for dropdown
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminScreen({ navigation }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Easy");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingWord, setEditingWord] = useState("");
  const [editingDifficulty, setEditingDifficulty] = useState("Easy");

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const stored = await AsyncStorage.getItem("words");
      if (stored) setWords(JSON.parse(stored));
    } catch (error) {
      console.log("Error loading words:", error);
    }
  };

  const saveWords = async (updated) => {
    try {
      await AsyncStorage.setItem("words", JSON.stringify(updated));
      setWords(updated);
    } catch (error) {
      console.log("Error saving words:", error);
    }
  };

  const addWord = () => {
    if (newWord.trim() === "") return;
    const newEntry = { word: newWord.trim(), difficulty: newDifficulty };
    const updated = [...words, newEntry];
    saveWords(updated);
    setNewWord("");
    setNewDifficulty("Easy");
  };

  const deleteWord = (index) => {
    const updated = words.filter((_, i) => i !== index);
    saveWords(updated);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingWord(words[index].word);
    setEditingDifficulty(words[index].difficulty);
  };

  const confirmEdit = () => {
    if (editingWord.trim() === "") return;
    const updated = [...words];
    updated[editingIndex] = {
      word: editingWord.trim(),
      difficulty: editingDifficulty,
    };
    saveWords(updated);
    setEditingIndex(null);
    setEditingWord("");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("currentUser");
    navigation.replace("Login");
  };

  // ✅ Group words by difficulty
  const groupedWords = {
    Easy: words.filter((w) => w.difficulty === "Easy"),
    Medium: words.filter((w) => w.difficulty === "Medium"),
    Hard: words.filter((w) => w.difficulty === "Hard"),
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0B1E47" barStyle="light-content" />

      <Text style={styles.title}>Admin: Manage Words</Text>

      {/* Add new word */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter new word"
          placeholderTextColor="#AAAAAA"
          value={newWord}
          onChangeText={setNewWord}
        />

        {/* Label + Picker grouped */}
        <View style={styles.pickerBlock}>
          <Text style={styles.pickerLabel}>Select Difficulty</Text>
          <Picker
            selectedValue={newDifficulty}
            onValueChange={(value) => setNewDifficulty(value)}
            style={styles.picker}
            dropdownIconColor="#FFFFFF"
          >
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
        </View>

        <Button title="Add" onPress={addWord} />
      </View>

      {/* Display words per difficulty */}
      {["Easy", "Medium", "Hard"].map((difficulty) => (
        <View key={difficulty} style={styles.section}>
          <Text style={styles.sectionTitle}>{difficulty} Words</Text>
          <FlatList
            data={groupedWords[difficulty]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
              const realIndex = words.findIndex(
                (w) => w.word === item.word && w.difficulty === item.difficulty
              );
              return (
                <View style={styles.wordRow}>
                  {editingIndex === realIndex ? (
                    <>
                      <TextInput
                        style={styles.input}
                        value={editingWord}
                        onChangeText={setEditingWord}
                      />
                      <Picker
                        selectedValue={editingDifficulty}
                        onValueChange={(value) => setEditingDifficulty(value)}
                        style={styles.smallPicker}
                        dropdownIconColor="#FFFFFF"
                      >
                        <Picker.Item label="Easy" value="Easy" />
                        <Picker.Item label="Medium" value="Medium" />
                        <Picker.Item label="Hard" value="Hard" />
                      </Picker>
                      <Button title="Save" onPress={confirmEdit} />
                      <Button
                        title="Cancel"
                        color="gray"
                        onPress={() => setEditingIndex(null)}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.word}>{item.word}</Text>
                      <TouchableOpacity onPress={() => startEditing(realIndex)}>
                        <Text style={styles.edit}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteWord(realIndex)}>
                        <Text style={styles.delete}>🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }}
          />
        </View>
      ))}

      {/* Logout Button */}
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1E47",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#374d85ff",
    borderWidth: 1,
    borderColor: "#00C897",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#FFFFFF",
    marginRight: 8,
  },
  pickerBlock: {
    alignItems: "center",
    marginRight: 8,
  },
  pickerLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: -5, // pulls closer to picker
  },
  picker: {
    width: 120,
    color: "#FFFFFF",
    backgroundColor: "#374d85ff",
    borderRadius: 8,
  },
  smallPicker: {
    width: 100,
    color: "#FFFFFF",
    backgroundColor: "#374d85ff",
    borderRadius: 8,
    marginHorizontal: 8,
  },
  section: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#13285f",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00C897",
    marginBottom: 10,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  word: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  edit: { color: "#FFA500", marginHorizontal: 10, fontSize: 18 },
  delete: { color: "#FF4C4C", fontSize: 18 },
});
=======
import React from "react";
import { View } from "react-native";
import PlayerButton from "./PlayerButton";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <PlayerButton />
    </View>
  );
}
>>>>>>> 01f23ff (feat(player button): added PlayerDashboard)
