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
        // Register mode - always register as player
        result = await register(email, username, password, 'player');
      } else {
        // Login mode - use selected role for authentication
        result = await login(email, password, role);
      }

      if (result.success) {
        if (isRegister) {
          // After successful registration, show success message and switch to login
          setEmail('');
          setPassword('');
          setError('Registration successful! Please log in.');
          setIsRegister(false);
        } else {
          // After successful login, navigate to appropriate screen based on user's actual role
          if (result.user.role === 'admin') {
            navigation.replace('Admin');
          } else {
            navigation.replace('Game');
          }
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

  const navigateToAbout = () => {
    navigation.navigate('About');
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
            placeholderTextColor="#999999"
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
          placeholderTextColor="#999999"
          style={styles.input}
        />

        {/* Password with visibility toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999999"
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

        {/* Role selection only visible during LOGIN (not during registration) */}
        {!isRegister && (
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Login as:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'player' && styles.roleBtnActive]}
                onPress={() => setRole('player')}
              >
                <Text style={role === 'player' ? styles.roleTextActive : styles.roleText}>Player</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
                onPress={() => setRole('admin')}
              >
                <Text style={role === 'admin' ? styles.roleTextActive : styles.roleText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegister ? "Sign Up" : "Log In"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setIsRegister(!isRegister);
          setError(''); // Clear error when switching modes
          setRole('player'); // Reset to player role when switching
        }}>
          <Text style={styles.signupText}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <Text style={{ fontWeight: '700', color: '#584738' }}>
              {isRegister ? "Log In" : "Sign Up"}
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aboutButton} onPress={navigateToAbout}>
          <Text style={styles.aboutButtonText}>About</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Developed by CTE</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1EADA', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  logoWrap: { 
    marginBottom: 24, 
    alignItems: 'center' 
  },
  logo: { 
    fontSize: 36, 
    fontWeight: '700', 
    color: '#3D1F12', 
    letterSpacing: 2, 
    textShadowColor: 'rgba(0, 0, 0, 0.1)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3 
  },
  subtitle: { 
    color: '#98755B', 
    marginTop: 6,
    fontSize: 14,
  },
  form: { 
    width: '100%', 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 12, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: { 
    backgroundColor: '#FFFFFF', 
    padding: 12, 
    borderRadius: 8, 
    color: '#3D1F12', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#98755B',
    fontSize: 16,
  },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#98755B', 
    marginBottom: 12, 
    paddingRight: 10 
  },
  toggleText: { 
    color: '#584738', 
    fontSize: 18, 
    paddingHorizontal: 6 
  },
  roleRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleLabel: {
    color: '#584738',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  roleButtons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  roleBtn: { 
    paddingHorizontal: 16,
    paddingVertical: 8, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginLeft: 8,
    borderWidth: 1, 
    borderColor: '#98755B',
    minWidth: 80,
  },
  roleBtnActive: { 
    backgroundColor: '#584738', 
    borderColor: '#3D1F12' 
  },
  roleTextActive: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 12,
  },
  roleText: { 
    color: '#584738',
    fontSize: 12,
  },
  button: { 
    marginTop: 6, 
    backgroundColor: '#584738', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  error: { 
    color: '#A52A2A', 
    marginBottom: 12, 
    textAlign: 'center', 
    fontWeight: '500',
    backgroundColor: '#F8F4F0',
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
  },
  signupText: { 
    marginTop: 16, 
    color: '#98755B', 
    textAlign: 'center',
    fontSize: 14,
  },
  aboutButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#98755B',
    backgroundColor: 'transparent',
  },
  aboutButtonText: {
    color: '#584738',
    fontWeight: '600',
    fontSize: 14,
  },
  hint: { 
    marginTop: 12, 
    color: '#98755B', 
    fontSize: 12, 
    textAlign: 'center' 
  },
});