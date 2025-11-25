import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
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
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";

export default function AdminScreen({ navigation }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Easy");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingWord, setEditingWord] = useState("");
  const [editingDifficulty, setEditingDifficulty] = useState("Easy");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editPickerVisible, setEditPickerVisible] = useState(false);

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
    const newEntry = { word: newWord.trim().toUpperCase(), difficulty: newDifficulty };
    const updated = [...words, newEntry];
    saveWords(updated);
    setNewWord("");
    setNewDifficulty("Easy");
    Keyboard.dismiss();
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
      word: editingWord.trim().toUpperCase(),
      difficulty: editingDifficulty,
    };
    saveWords(updated);
    setEditingIndex(null);
    setEditingWord("");
    Keyboard.dismiss();
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingWord("");
    Keyboard.dismiss();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("currentUser");
    navigation.replace("Login");
  };

  // Group words by difficulty
  const groupedWords = {
    Easy: words.filter((w) => w.difficulty === "Easy"),
    Medium: words.filter((w) => w.difficulty === "Medium"),
    Hard: words.filter((w) => w.difficulty === "Hard"),
  };

  const DifficultyBadge = ({ difficulty }) => {
    const getDifficultyColor = () => {
      switch (difficulty) {
        case "Easy": return "#4CAF50";
        case "Medium": return "#FF9800";
        case "Hard": return "#F44336";
        default: return "#757575";
      }
    };

    return (
      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
        <Text style={styles.difficultyText}>{difficulty}</Text>
      </View>
    );
  };

  const WordItem = ({ item, realIndex }) => (
    <View style={styles.wordItem}>
      <View style={styles.wordContent}>
        <Text style={styles.wordText}>{item.word}</Text>
        <DifficultyBadge difficulty={item.difficulty} />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => startEditing(realIndex)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteWord(realIndex)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EditingWordItem = () => (
    <View style={styles.editingContainer}>
      <TextInput
        style={styles.editInput}
        value={editingWord}
        onChangeText={setEditingWord}
        placeholder="Edit word..."
        placeholderTextColor="#999999"
      />
      
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => setEditPickerVisible(true)}
      >
        <Text style={styles.pickerButtonText}>{editingDifficulty}</Text>
      </TouchableOpacity>

      <View style={styles.editActions}>
        <TouchableOpacity style={styles.saveButton} onPress={confirmEdit}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={editPickerVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Difficulty</Text>
            <Picker
              selectedValue={editingDifficulty}
              onValueChange={(value) => setEditingDifficulty(value)}
            >
              <Picker.Item label="Easy" value="Easy" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="Hard" value="Hard" />
            </Picker>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setEditPickerVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#F1EADA" barStyle="dark-content" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage Words</Text>

          {/* Add new word section */}
          <View style={styles.addSection}>
            <Text style={styles.sectionLabel}>Add New Word</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter new word"
              placeholderTextColor="#999999"
              value={newWord}
              onChangeText={setNewWord}
              onSubmitEditing={addWord}
              returnKeyType="done"
            />

            <View style={styles.pickerRow}>
              <Text style={styles.pickerLabel}>Select Difficulty</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setPickerVisible(true)}
              >
                <Text style={styles.pickerButtonText}>{newDifficulty}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addWord}>
              <Text style={styles.addButtonText}>ADD WORD</Text>
            </TouchableOpacity>
          </View>

          {/* Words list by difficulty */}
          {["Easy", "Medium", "Hard"].map((difficulty) => (
            <View key={difficulty} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{difficulty} Words</Text>
                <Text style={styles.wordCount}>({groupedWords[difficulty].length})</Text>
              </View>
              
              {groupedWords[difficulty].length === 0 ? (
                <Text style={styles.emptyText}>No {difficulty.toLowerCase()} words yet</Text>
              ) : (
                <FlatList
                  data={groupedWords[difficulty]}
                  keyExtractor={(item, index) => `${item.word}-${index}`}
                  renderItem={({ item }) => {
                    const realIndex = words.findIndex(
                      (w) => w.word === item.word && w.difficulty === item.difficulty
                    );
                    
                    if (editingIndex === realIndex) {
                      return <EditingWordItem />;
                    }
                    
                    return <WordItem item={item} realIndex={realIndex} />;
                  }}
                  scrollEnabled={false}
                />
              )}
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>LOGOUT</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Difficulty Picker Modal */}
        <Modal
          visible={pickerVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Difficulty</Text>
              <Picker
                selectedValue={newDifficulty}
                onValueChange={(value) => setNewDifficulty(value)}
              >
                <Picker.Item label="Easy" value="Easy" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Hard" value="Hard" />
              </Picker>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setPickerVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EADA", // Milk color as main background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3D1F12", // Espresso color for main text
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#98755B", // Light brown for secondary text
    textAlign: "center",
    marginBottom: 25,
  },
  addSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#584738", // Mahogany for section labels
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#98755B", // Light brown border
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#3D1F12", // Espresso text color
    fontSize: 16,
    marginBottom: 15,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pickerLabel: {
    color: "#584738", // Mahogany for labels
    fontSize: 14,
    fontWeight: "500",
  },
  pickerButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#98755B", // Light brown border
    minWidth: 100,
  },
  pickerButtonText: {
    color: "#3D1F12", // Espresso text color
    textAlign: "center",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#584738", // Mahogany for primary buttons
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#584738", // Mahogany for section titles
    marginRight: 8,
  },
  wordCount: {
    fontSize: 14,
    color: "#98755B", // Light brown for secondary text
  },
  emptyText: {
    color: "#98755B", // Light brown for empty state
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
  wordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F4F0", // Light background for items
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8E2D9",
  },
  wordContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  wordText: {
    fontSize: 16,
    color: "#3D1F12", // Espresso for word text
    fontWeight: "500",
    marginRight: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#98755B", // Light brown for edit button
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#A52A2A", // Darker red that complements the palette
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  editingContainer: {
    backgroundColor: "#F8F4F0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#98755B", // Light brown border for editing state
  },
  editInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#98755B", // Light brown border
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#3D1F12", // Espresso text
    fontSize: 16,
    marginBottom: 10,
  },
  editActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#584738", // Mahogany for save
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#98755B", // Light brown for cancel
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(61, 31, 18, 0.5)", // Espresso with opacity
  },
  pickerContainer: {
    backgroundColor: "#F1EADA", // Milk background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#3D1F12", // Espresso text
  },
  doneButton: {
    backgroundColor: "#584738", // Mahogany for done button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#A52A2A", // Complementary red
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});