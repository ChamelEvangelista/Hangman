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
      const messages = await this.getItem('messages');

      if (!users) await this.setItem('users', []);
      if (!words) await this.setItem('words', []);
      if (!scores) await this.setItem('scores', []);
      if (!messages) await this.setItem('messages', []);

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

  // Get user by ID
  getUserById: async (id) => {
    await db.init();
    return await db.findItem('users', user => user.id === id);
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

// Chat operations
export const ChatService = {
  // Send a message
  sendMessage: async (senderId, receiverId, messageText) => {
    await db.init();
    
    const message = await db.addItem('messages', {
      senderId,
      receiverId,
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    });

    return message;
  },

  // Get messages between two users
  getMessages: async (userId1, userId2, limit = 100) => {
    await db.init();
    const messages = await db.getItem('messages') || [];
    
    const conversationMessages = messages
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);

    return conversationMessages;
  },

  // Mark messages as read
  markMessagesAsRead: async (userId, otherUserId) => {
    await db.init();
    const messages = await db.getItem('messages') || [];
    
    let updated = false;
    const updatedMessages = messages.map(msg => {
      if (msg.senderId === otherUserId && msg.receiverId === userId && !msg.read) {
        updated = true;
        return { ...msg, read: true };
      }
      return msg;
    });

    if (updated) {
      await db.setItem('messages', updatedMessages);
    }
    return true;
  },

  // Get unread message count for a user
  getUnreadCount: async (userId) => {
    await db.init();
    const messages = await db.getItem('messages') || [];
    
    return messages.filter(msg => 
      msg.receiverId === userId && !msg.read
    ).length;
  },

  // Get unread count for specific conversation
  getUnreadCountForUser: async (userId, otherUserId) => {
    await db.init();
    const messages = await db.getItem('messages') || [];
    
    return messages.filter(msg => 
      msg.senderId === otherUserId && msg.receiverId === userId && !msg.read
    ).length;
  },

  // Get chat list with last messages
  getChatList: async (userId) => {
    await db.init();
    const messages = await db.getItem('messages') || [];
    const users = await db.getItem('users') || [];
    
    // Get all unique users that the current user has chatted with
    const chatPartners = new Set();
    messages.forEach(msg => {
      if (msg.senderId === userId) chatPartners.add(msg.receiverId);
      if (msg.receiverId === userId) chatPartners.add(msg.senderId);
    });

    const chatList = await Promise.all(
      Array.from(chatPartners).map(async (partnerId) => {
        const partner = users.find(u => u.id === partnerId);
        if (!partner) return null;

        // Get last message with this user
        const userMessages = messages
          .filter(msg => 
            (msg.senderId === userId && msg.receiverId === partnerId) ||
            (msg.senderId === partnerId && msg.receiverId === userId)
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const lastMessage = userMessages[0];
        const unreadCount = await ChatService.getUnreadCountForUser(userId, partnerId);

        return {
          userId: partnerId,
          userName: partner.username,
          lastMessage: lastMessage?.message || 'No messages yet',
          timestamp: lastMessage?.timestamp || new Date().toISOString(),
          unreadCount
        };
      })
    );

    return chatList
      .filter(chat => chat !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Get recent conversations with all users (for chat list)
  getRecentConversations: async (userId) => {
    await db.init();
    const users = await db.getItem('users') || [];
    const messages = await db.getItem('messages') || [];
    
    const otherUsers = users.filter(user => user.id !== userId);
    
    const conversations = await Promise.all(
      otherUsers.map(async (user) => {
        const userMessages = await ChatService.getMessages(userId, user.id, 1);
        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = await ChatService.getUnreadCountForUser(userId, user.id);

        return {
          userId: user.id,
          userName: user.username,
          lastMessage: lastMessage?.message || null,
          timestamp: lastMessage?.timestamp || user.last_login,
          unreadCount,
          hasChatHistory: userMessages.length > 0
        };
      })
    );

    // Sort: users with messages first, then by last activity
    return conversations.sort((a, b) => {
      if (a.hasChatHistory && !b.hasChatHistory) return -1;
      if (!a.hasChatHistory && b.hasChatHistory) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  },

  // Clear all messages (for testing/debugging)
  clearAllMessages: async () => {
    await db.init();
    await db.setItem('messages', []);
    return true;
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

  // Sample player user
  const samplePlayer = {
    email: 'player@example.com',
    username: 'player1',
    password: 'player123',
    role: 'player'
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

    // Check if sample player exists
    const existingPlayer = await UserService.getUserByEmail(samplePlayer.email);
    if (!existingPlayer) {
      console.log('Creating sample player...');
      await UserService.registerUser(
        samplePlayer.email,
        samplePlayer.username,
        samplePlayer.password,
        samplePlayer.role
      );
      console.log('Sample player created successfully');
    }

    // Initialize messages storage with some sample messages if empty
    const existingMessages = await db.getItem('messages');
    if (!existingMessages || existingMessages.length === 0) {
      console.log('Initializing messages storage...');
      await db.setItem('messages', []);
      
      // Add some sample messages between admin and sample player
      const admin = await UserService.getUserByEmail(adminUser.email);
      const player = await UserService.getUserByEmail(samplePlayer.email);
      
      if (admin && player) {
        await ChatService.sendMessage(admin.id, player.id, "Welcome to Hangman Game!");
        await ChatService.sendMessage(player.id, admin.id, "Thanks! Looking forward to playing.");
        await ChatService.sendMessage(admin.id, player.id, "Let me know if you need any help with the game.");
        console.log('Sample messages added');
      }
    }
  } catch (error) {
    console.log('Error initializing sample data:', error);
  }
};

export default db;