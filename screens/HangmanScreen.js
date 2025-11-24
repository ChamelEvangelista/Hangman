// screens/HangmanScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { ScoreService } from '../services/DatabaseService';
import { useUser } from '../contexts/UserContext';

const HangmanScreen = ({ route, navigation }) => {
  const { difficulty, words } = route.params || {};
  const { user, updateUserStats } = useUser();
  
  // Game state
  const [selectedWord, setSelectedWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [inputLetter, setInputLetter] = useState('');
  const [loading, setLoading] = useState(true);

  // Maximum allowed wrong guesses based on difficulty
  const getMaxWrongGuesses = () => {
    switch (difficulty) {
      case 'Easy': return 8;
      case 'Medium': return 6;
      case 'Hard': return 4;
      default: return 6;
    }
  };

  const maxWrongGuesses = getMaxWrongGuesses();

  // Initialize game
  const initializeGame = () => {
    if (!words || words.length === 0) {
      Alert.alert('Error', 'No words available for this difficulty level');
      navigation.goBack();
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(randomWord.toUpperCase());
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
    setInputLetter('');
    setLoading(false);
  };

  // Initialize game on component mount or when words change
  useEffect(() => {
    initializeGame();
  }, [words]);

  // Handle letter guess
  const handleGuess = async (letter) => {
    if (gameStatus !== 'playing' || !letter || !selectedWord) return;

    const upperLetter = letter.toUpperCase();
    
    // Check if letter was already guessed
    if (guessedLetters.includes(upperLetter)) {
      Alert.alert('Already Guessed', `You already guessed the letter ${upperLetter}`);
      return;
    }

    // Add to guessed letters
    setGuessedLetters(prev => [...prev, upperLetter]);

    // Check if guess is wrong
    if (!selectedWord.includes(upperLetter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      // Check if game is lost
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        // Update user stats for loss
        if (user) {
          await updateUserStats(false, 0);
        }
      }
    } else {
      // Check if game is won
      const wordArray = selectedWord.split('');
      const isWon = wordArray.every(char => 
        guessedLetters.includes(char) || char === upperLetter || char === ' '
      );
      
      if (isWon) {
        setGameStatus('won');
        // Calculate score
        const score = calculateScore(selectedWord, wrongGuesses, guessedLetters.length + 1);
        
        // Update user stats for win
        if (user) {
          await updateUserStats(true, score);
        }
        
        // Save to scores table
        try {
          await ScoreService.addScore(
            user?.username || 'Guest',
            difficulty,
            score,
            1, // words guessed
            guessedLetters.length + 1 // total guesses
          );
        } catch (error) {
          console.error('Error saving score:', error);
        }
      }
    }

    setInputLetter('');
  };

  // Calculate score
  const calculateScore = (word, wrongGuesses, totalGuesses) => {
    const baseScore = word.length * 100;
    const wrongGuessPenalty = wrongGuesses * 50;
    const efficiencyBonus = Math.max(0, 500 - (totalGuesses * 20));
    
    return Math.max(100, baseScore - wrongGuessPenalty + efficiencyBonus);
  };

  // Handle input submit
  const handleSubmit = () => {
    if (inputLetter.length === 1 && /[a-zA-Z]/.test(inputLetter)) {
      handleGuess(inputLetter);
    } else {
      Alert.alert('Invalid Input', 'Please enter a single letter (A-Z)');
    }
  };

  // Render the word with blanks and guessed letters
  const renderWord = () => {
    if (!selectedWord) return null;

    return selectedWord.split('').map((letter, index) => (
      <View key={index} style={styles.letterContainer}>
        <Text style={styles.letter}>
          {letter === ' ' ? ' ' : (guessedLetters.includes(letter) ? letter : '_')}
        </Text>
        {letter !== ' ' && <View style={styles.underline} />}
      </View>
    ));
  };

  // Render hangman figure - Visual representation
  const renderHangman = () => {
    const hangmanStages = [
      // Stage 0: Empty gallows
      `
        
        
        
        
        
      =====
      `,
      // Stage 1: Base
      `
        
        
        
        
      |
      =====
      `,
      // Stage 2: Pole
      `
      |
      |
      |
      |
      |
      =====
      `,
      // Stage 3: Beam
      `
      _______
      |
      |
      |
      |
      |
      =====
      `,
      // Stage 4: Rope
      `
      _______
      |/     
      |      
      |      
      |      
      |
      =====
      `,
      // Stage 5: Head
      `
      _______
      |/     |
      |     (_)
      |      
      |      
      |
      =====
      `,
      // Stage 6: Body
      `
      _______
      |/     |
      |     (_)
      |      |
      |      |
      |
      =====
      `,
      // Stage 7: Left Arm
      `
      _______
      |/     |
      |     (_)
      |     \\|
      |      |
      |
      =====
      `,
      // Stage 8: Right Arm
      `
      _______
      |/     |
      |     (_)
      |     \\|/
      |      |
      |
      =====
      `,
      // Stage 9: Left Leg
      `
      _______
      |/     |
      |     (_)
      |     \\|/
      |      |
      |     /
      =====
      `,
      // Stage 10: Right Leg (Complete)
      `
      _______
      |/     |
      |     (_)
      |     \\|/
      |      |
      |     / \\
      =====
      `
    ];

    // Adjust stage based on wrong guesses and difficulty
    const stage = Math.min(wrongGuesses, hangmanStages.length - 1);

    return (
      <View style={styles.hangmanContainer}>
        <Text style={styles.hangmanTitle}>HANGMAN</Text>
        <View style={styles.hangmanDrawingContainer}>
          <Text style={styles.hangmanDrawing}>
            {hangmanStages[stage]}
          </Text>
        </View>
        <View style={styles.hangmanProgress}>
          <Text style={styles.progressText}>
            Wrong guesses: {wrongGuesses} / {maxWrongGuesses}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(wrongGuesses / maxWrongGuesses) * 100}%`,
                  backgroundColor: wrongGuesses >= maxWrongGuesses - 2 ? '#EF4444' : '#F59E0B'
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  // Render keyboard
  const renderKeyboard = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    return (
      <View style={styles.keyboard}>
        {alphabet.split('').map(letter => (
          <TouchableOpacity
            key={letter}
            style={[
              styles.key,
              guessedLetters.includes(letter) && 
              (selectedWord.includes(letter) ? styles.correctKey : styles.wrongKey)
            ]}
            onPress={() => handleGuess(letter)}
            disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
          >
            <Text style={[
              styles.keyText,
              (guessedLetters.includes(letter) && selectedWord.includes(letter)) && styles.correctKeyText,
              (guessedLetters.includes(letter) && !selectedWord.includes(letter)) && styles.wrongKeyText
            ]}>
              {letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Game status message
  const renderGameStatus = () => {
    if (gameStatus === 'won') {
      const score = calculateScore(selectedWord, wrongGuesses, guessedLetters.length);
      
      return (
        <View style={[styles.statusContainer, styles.winContainer]}>
          <Text style={styles.winText}>🎉 Congratulations! You won! 🎉</Text>
          <Text style={styles.scoreText}>Score: {score} points</Text>
          <Text style={styles.wordText}>The word was: <Text style={styles.revealedWord}>{selectedWord}</Text></Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.continueButtonText}>View Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (gameStatus === 'lost') {
      return (
        <View style={[styles.statusContainer, styles.loseContainer]}>
          <Text style={styles.loseText}>💀 Game Over! 💀</Text>
          <Text style={styles.wordText}>The word was: <Text style={styles.revealedWord}>{selectedWord}</Text></Text>
          <Text style={styles.hintText}>Better luck next time!</Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Game...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>HANGMAN</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{difficulty}</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Hangman figure - THIS IS WHERE THE HANGMAN APPEARS */}
        {renderHangman()}

        {/* Word display */}
        <View style={styles.wordContainer}>
          {renderWord()}
        </View>

        {/* Game status */}
        {renderGameStatus()}

        {/* Manual input */}
        {gameStatus === 'playing' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter a letter:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputLetter}
                onChangeText={setInputLetter}
                maxLength={1}
                placeholder="A"
                placeholderTextColor="#999"
                editable={gameStatus === 'playing'}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                disabled={gameStatus !== 'playing' || inputLetter.length === 0}
              >
                <Text style={styles.submitButtonText}>Guess</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Virtual keyboard */}
        {gameStatus === 'playing' && renderKeyboard()}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={initializeGame}
          >
            <Text style={styles.restartButtonText}>New Word</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Game')}
          >
            <Text style={styles.menuButtonText}>Change Difficulty</Text>
          </TouchableOpacity>
        </View>

        {/* Guessed letters */}
        <View style={styles.guessedContainer}>
          <Text style={styles.guessedTitle}>Guessed Letters:</Text>
          <Text style={styles.guessedLetters}>
            {guessedLetters.length > 0 ? guessedLetters.join(', ') : 'None yet'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#cbd5e1',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#60a5fa',
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    width: 60, // Balance the header
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#facc15',
    textAlign: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  hangmanContainer: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hangmanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 16,
    letterSpacing: 2,
  },
  hangmanDrawingContainer: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 16,
  },
  hangmanDrawing: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 18,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  hangmanProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  wordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  letterContainer: {
    alignItems: 'center',
    margin: 6,
  },
  letter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 6,
    minWidth: 30,
    textAlign: 'center',
  },
  underline: {
    width: 36,
    height: 3,
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  winContainer: {
    backgroundColor: '#065f46',
    borderColor: '#047857',
  },
  loseContainer: {
    backgroundColor: '#7f1d1d',
    borderColor: '#991b1b',
  },
  winText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34d399',
    textAlign: 'center',
    marginBottom: 12,
  },
  loseText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fca5a5',
    textAlign: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 18,
    color: '#d1fae5',
    fontWeight: '600',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 8,
  },
  revealedWord: {
    fontWeight: 'bold',
    color: '#fef3c7',
    fontSize: 18,
  },
  hintText: {
    fontSize: 14,
    color: '#fecaca',
    fontStyle: 'italic',
  },
  statusButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  continueButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    fontSize: 20,
    width: 80,
    textAlign: 'center',
    marginRight: 12,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  key: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
    margin: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  keyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  correctKey: {
    backgroundColor: '#10b981',
  },
  wrongKey: {
    backgroundColor: '#ef4444',
  },
  correctKeyText: {
    color: 'white',
  },
  wrongKeyText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  restartButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guessedContainer: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  guessedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  guessedLetters: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HangmanScreen;