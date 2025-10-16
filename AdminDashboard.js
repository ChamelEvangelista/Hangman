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