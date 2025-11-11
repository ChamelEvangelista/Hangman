import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import styles from './LoginStyles'; // 👈 import external stylesheet

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player'); // 'player' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email.');
      triggerShake();
      return false;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      triggerShake();
      return false;
    }
    setError('');
    return true;
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 700));

      if (isRegister) {
        // Register mode
        await AsyncStorage.setItem('user', JSON.stringify({ email, username, password, role: 'player' }));
        navigation.replace('PlayerScreen', { email, username });
      } else {
        // Login mode
        if (role === 'admin') {
          if (email.toLowerCase() === 'chamel@gmail.com' && password === 'admin123') {
            await AsyncStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
            navigation.replace('Admin');
          } else {
            setError('Invalid admin credentials.');
            triggerShake();
          }
        } else {
          // Fetch stored user
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const { email: storedEmail, password: storedPassword, username: storedUsername } = JSON.parse(storedUser);

            if (email === storedEmail && password === storedPassword) {
              navigation.replace('PlayerScreen', { email, username: storedUsername });
            } else {
              setError('Invalid player credentials.');
              triggerShake();
            }
          } else {
            setError('No registered account found. Please sign up first.');
            triggerShake();
          }
        }
      }
    } catch (e) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }, { translateX: shakeX }] }]}>
        <Text style={styles.logo}>HANGMAN</Text>
        <Text style={styles.subtitle}>Guess the word — accumulate points</Text>
      </Animated.View>

      <Animated.View style={[styles.form, { transform: [{ translateX: shakeX }] }]}>
        {isRegister && (
          <TextInput
            placeholder="Username"
            placeholderTextColor="#9aa4b2"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9aa4b2"
          style={styles.input}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9aa4b2"
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggleText}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'player' && styles.roleBtnActive]}
            onPress={() => setRole('player')}
          >
            <Text style={role === 'player' ? styles.roleTextActive : styles.roleText}>Player</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === 'admin' && styles.roleBtnActiveAdmin]}
            onPress={() => setRole('admin')}
          >
            <Text style={role === 'admin' ? styles.roleTextActiveAdmin : styles.roleText}>Admin</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.buttonText}>{isRegister ? "Sign Up" : "Log In"}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.signupText}>
            {isRegister ? "Already have an account? " : "Don’t have an account? "}
            <Text style={{ fontWeight: '700', color: '#F59E0B' }}>
              {isRegister ? "Log In" : "Sign Up"}
            </Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>App still in production...</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}