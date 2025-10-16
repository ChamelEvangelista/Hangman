import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  StyleSheet 
} from 'react-native';

export default function App() {
  const [word, setWord] = useState('');
  const [words, setWords] = useState([]);

  const addWord = () => {
    if (word.trim() !== '') {
      setWords([...words, word]);
      setWord('');
    }
  };

  const deleteWord = (index) => {
    const newWords = [...words];
    newWords.splice(index, 1);
    setWords(newWords);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b45" />
      <Text style={styles.header}>Admin: Manage Words</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter new word"
        placeholderTextColor="#aaa"
        value={word}
        onChangeText={setWord}
      />

      <TouchableOpacity style={styles.addButton} onPress={addWord}>
        <Text style={styles.addButtonText}>Add Word</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>Existing Words:</Text>
      <FlatList
        data={words}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <Text style={styles.wordText}>{item}</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteWord(index)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b45',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a6b',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});