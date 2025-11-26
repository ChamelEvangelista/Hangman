// contexts/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService } from '../services/DatabaseService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = null) => {
    try {
      const userData = await UserService.loginUser(email, password);
      
      // If role is specified and doesn't match the user's actual role, throw error
      if (role && userData.role !== role) {
        throw new Error(`Invalid role. This account is a ${userData.role}, not ${role}`);
      }
      
      setUser(userData);
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, username, password, role = 'player') => {
    try {
      const result = await UserService.registerUser(email, username, password, role);
      const userData = await UserService.loginUser(email, password);
      setUser(userData);
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  const updateUserStats = async (won = false, scoreToAdd = 0) => {
    if (!user) return;

    try {
      await UserService.updateUserStats(user.id, won, scoreToAdd);
      // Refresh user data
      const updatedUser = await UserService.getUserByEmail(user.email);
      setUser(updatedUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserStats,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};