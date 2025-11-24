// services/DatabaseService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback database using AsyncStorage
class AsyncStorageDB {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Initialize data structures
      const users = await this.getItem('users');
      const words = await this.getItem('words');
      const scores = await this.getItem('scores');

      if (!users) await this.setItem('users', []);
      if (!words) await this.setItem('words', []);
      if (!scores) await this.setItem('scores', []);

      this.initialized = true;
      console.log('AsyncStorage DB initialized');
    } catch (error) {
      console.error('Error initializing AsyncStorage DB:', error);
    }
  }

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  async addItem(key, item) {
    const items = await this.getItem(key) || [];
    const newItem = { ...item, id: Date.now().toString() };
    items.push(newItem);
    await this.setItem(key, items);
    return newItem;
  }

  async updateItem(key, id, updates) {
    const items = await this.getItem(key) || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await this.setItem(key, items);
      return items[index];
    }
    return null;
  }

  async deleteItem(key, id) {
    const items = await this.getItem(key) || [];
    const filteredItems = items.filter(item => item.id !== id);
    await this.setItem(key, filteredItems);
    return true;
  }

  async findItem(key, predicate) {
    const items = await this.getItem(key) || [];
    return items.find(predicate);
  }

  async filterItems(key, predicate) {
    const items = await this.getItem(key) || [];
    return items.filter(predicate);
  }
}

const db = new AsyncStorageDB();

// Initialize database
export const initDatabase = async () => {
  await db.init();
  await initializeSampleData();
  return true;
};

// User operations
export const UserService = {
  // Register a new user
  registerUser: async (email, username, password, role = 'player') => {
    await db.init();
    
    // Check if email already exists
    const existingUser = await db.findItem('users', user => 
      user.email === email.toLowerCase() || user.username === username
    );

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new Error('Email already exists');
      } else {
        throw new Error('Username already exists');
      }
    }

    const newUser = await db.addItem('users', {
      email: email.toLowerCase(),
      username,
      password,
      role,
      score: 0,
      games_played: 0,
      games_won: 0,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    });

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      message: 'User registered successfully'
    };
  },

  // Login user
  loginUser: async (email, password) => {
    await db.init();
    
    const user = await db.findItem('users', user => 
      user.email === email.toLowerCase() && user.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await db.updateItem('users', user.id, {
      last_login: new Date().toISOString()
    });

    return user;
  },

  // Get user by email
  getUserByEmail: async (email) => {
    await db.init();
    return await db.findItem('users', user => user.email === email.toLowerCase());
  },

  // Update user stats after game
  updateUserStats: async (userId, won = false, scoreToAdd = 0) => {
    await db.init();
    
    const user = await db.findItem('users', user => user.id === userId);
    if (!user) return null;

    const updates = {
      games_played: (user.games_played || 0) + 1,
      score: (user.score || 0) + scoreToAdd
    };

    if (won) {
      updates.games_won = (user.games_won || 0) + 1;
    }

    return await db.updateItem('users', userId, updates);
  },

  // Get all users (for admin)
  getAllUsers: async () => {
    await db.init();
    return await db.getItem('users') || [];
  },

  // Get leaderboard
  getLeaderboard: async (limit = 50) => {
    await db.init();
    const users = await db.getItem('users') || [];
    
    return users
      .filter(user => user.games_played > 0)
      .map(user => ({
        ...user,
        win_ratio: user.games_played > 0 ? (user.games_won / user.games_played) : 0
      }))
      .sort((a, b) => b.score - a.score || b.win_ratio - a.win_ratio)
      .slice(0, limit);
  }
};

// Word operations
export const WordService = {
  // Add a new word
  addWord: async (word, difficulty, category = null) => {
    await db.init();
    
    const existingWord = await db.findItem('words', w => 
      w.word === word.toUpperCase() && w.difficulty === difficulty
    );

    if (existingWord) {
      throw new Error('Word already exists for this difficulty');
    }

    return await db.addItem('words', {
      word: word.toUpperCase(),
      difficulty,
      category,
      created_at: new Date().toISOString()
    });
  },

  // Get all words by difficulty
  getWordsByDifficulty: async (difficulty) => {
    await db.init();
    const words = await db.filterItems('words', word => word.difficulty === difficulty);
    return words.map(word => word.word);
  },

  // Get all words
  getAllWords: async () => {
    await db.init();
    return await db.getItem('words') || [];
  },

  // Delete a word
  deleteWord: async (id) => {
    await db.init();
    return await db.deleteItem('words', id);
  },

  // Check if word exists
  wordExists: async (word, difficulty) => {
    await db.init();
    const existing = await db.findItem('words', w => 
      w.word === word.toUpperCase() && w.difficulty === difficulty
    );
    return !!existing;
  }
};

// Score operations
export const ScoreService = {
  // Add a new score
  addScore: async (playerName, difficulty, score, wordsGuessed = 0, totalGuesses = 0) => {
    await db.init();
    
    return await db.addItem('scores', {
      player_name: playerName,
      difficulty,
      score,
      words_guessed: wordsGuessed,
      total_guesses: totalGuesses,
      created_at: new Date().toISOString()
    });
  },

  // Get leaderboard scores
  getLeaderboard: async (difficulty = null, limit = 10) => {
    await db.init();
    let scores = await db.getItem('scores') || [];
    
    if (difficulty) {
      scores = scores.filter(score => score.difficulty === difficulty);
    }

    return scores
      .sort((a, b) => b.score - a.score || b.words_guessed - a.words_guessed)
      .slice(0, limit);
  }
};

// Initialize with sample data
export const initializeSampleData = async () => {
  await db.init();

  const sampleWords = [
    // Easy words
    { word: 'CAT', difficulty: 'Easy' },
    { word: 'DOG', difficulty: 'Easy' },
    { word: 'SUN', difficulty: 'Easy' },
    { word: 'CAR', difficulty: 'Easy' },
    { word: 'BOOK', difficulty: 'Easy' },
    { word: 'TREE', difficulty: 'Easy' },
    { word: 'FISH', difficulty: 'Easy' },
    { word: 'BALL', difficulty: 'Easy' },
    { word: 'HOME', difficulty: 'Easy' },
    { word: 'STAR', difficulty: 'Easy' },
    
    // Medium words
    { word: 'REACT', difficulty: 'Medium' },
    { word: 'MOBILE', difficulty: 'Medium' },
    { word: 'SCREEN', difficulty: 'Medium' },
    { word: 'BUTTON', difficulty: 'Medium' },
    { word: 'KEYBOARD', difficulty: 'Medium' },
    { word: 'WINDOW', difficulty: 'Medium' },
    { word: 'DEVICE', difficulty: 'Medium' },
    { word: 'MODULE', difficulty: 'Medium' },
    
    // Hard words
    { word: 'JAVASCRIPT', difficulty: 'Hard' },
    { word: 'APPLICATION', difficulty: 'Hard' },
    { word: 'COMPONENT', difficulty: 'Hard' },
    { word: 'DEVELOPMENT', difficulty: 'Hard' },
    { word: 'PROGRAMMING', difficulty: 'Hard' },
    { word: 'FRAMEWORK', difficulty: 'Hard' },
    { word: 'NAVIGATION', difficulty: 'Hard' }
  ];

  // Sample admin user
  const adminUser = {
    email: 'chamel@gmail.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  };

  try {
    // Check if we already have words
    const existingWords = await WordService.getAllWords();
    
    if (existingWords.length === 0) {
      console.log('Adding sample words...');
      for (const wordData of sampleWords) {
        await WordService.addWord(wordData.word, wordData.difficulty);
      }
      console.log('Sample words added successfully');
    }

    // Check if admin user exists
    const existingAdmin = await UserService.getUserByEmail(adminUser.email);
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await UserService.registerUser(
        adminUser.email,
        adminUser.username,
        adminUser.password,
        adminUser.role
      );
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.log('Error initializing sample data:', error);
  }
};

export default db;