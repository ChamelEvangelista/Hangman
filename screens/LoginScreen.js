// screens/LoginScreen.js
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useUser();

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
    
    if (isRegister) {
      if (!username.trim()) {
        setError('Please enter a username.');
        triggerShake();
        return false;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters.');
        triggerShake();
        return false;
      }
    }

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

  const handleAuth = async () => {
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      let result;

      if (isRegister) {
        // Register mode
        result = await register(email, username, password, role);
      } else {
        // Login mode
        result = await login(email, password);
      }

      if (result.success) {
        // Navigate based on role
        if (result.user.role === 'admin') {
          navigation.replace('Admin');
        } else {
          navigation.replace('Game');
        }
      } else {
        setError(result.error);
        triggerShake();
      }
    } catch (e) {
      setError('Something went wrong. Try again.');
      triggerShake();
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

        {/* Username only visible when Register */}
        {isRegister && (
          <TextInput
            placeholder="Username"
            placeholderTextColor="#9aa4b2"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
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

        {/* Password with visibility toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9aa4b2"
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggleText}>
              {showPassword ? "🙈" : "👁️"}
            </Text>
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

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegister ? "Sign Up" : "Log In"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.signupText}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <Text style={{ fontWeight: '700', color: '#F59E0B' }}>
              {isRegister ? "Log In" : "Sign Up"}
            </Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Powered by SQLite Database</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1E47', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoWrap: { marginBottom: 24, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '700', color: '#14B8A6', letterSpacing: 2, textShadowColor: '#000000', textShadowOffset: { width: 2, height:2 }, textShadowRadius: 6 },
  subtitle: { color: '#9aa4b2', marginTop: 6},
  form: { width: '100%', backgroundColor: '#1E3A8A', padding: 18, borderRadius: 12, shadowColor: '#000' },
  input: { backgroundColor: '#2C2C34', padding: 12, borderRadius: 8, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#14B8A6' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C34', borderRadius: 8, borderWidth: 1, borderColor: '#14B8A6', marginBottom: 12, paddingRight: 10 },
  toggleText: { color: '#fff', fontSize: 18, paddingHorizontal: 6 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  roleBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 6, borderWidth: 1, borderColor: '#1f2937' },
  roleBtnActive: { backgroundColor: '#10B981', borderColor: '#065f46' },
  roleTextActive: { color: '#fff', fontWeight: '600', letterSpacing: 1  },
  roleBtnActiveAdmin: { backgroundColor: '#3B82F6', borderColor: '#1D4ED8' },
  roleTextActiveAdmin: { color: '#fff', fontWeight: '600', letterSpacing: 1 },
  roleText: { color: '#cbd5e1' },
  button: { marginTop: 6, backgroundColor: '#F59E0B', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#fd5151ff', marginBottom: 6, textAlign: 'center', fontWeight: 600 },
  signupText: { marginTop: 14, color: '#D1D5DB', textAlign: 'center' },
  hint: { marginTop: 10, color: '#D1D5DB', fontSize: 12, textAlign: 'center' },
});