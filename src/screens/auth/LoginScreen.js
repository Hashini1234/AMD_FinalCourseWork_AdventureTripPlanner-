import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { validateAuthForm } from '../../utils/validators';
import { colors, spacing } from '../../theme/theme';

const DEMO_EMAIL = 'demo@adventure.com';
const DEMO_PASSWORD = 'password123';

export default function LoginScreen({ navigation }) {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async () => {
    const errors = validateAuthForm({ email, password, mode: 'login' });
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    clearError();
    await login(email.trim(), password);
  };

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    clearError();
    await login(DEMO_EMAIL, DEMO_PASSWORD);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.darkGreen, colors.green]} style={styles.header}>
        <MaterialCommunityIcons name="image-filter-hdr" size={48} color={colors.amber} />
        <Text style={styles.headerTitle}>Welcome Back, Explorer</Text>
        <Text style={styles.headerSubtitle}>Sign in to continue your adventure</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          error={!!fieldErrors.email}
        />
        <HelperText type="error" visible={!!fieldErrors.email}>{fieldErrors.email}</HelperText>

        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-outline" />}
          right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPassword((v) => !v)} />}
          error={!!fieldErrors.password}
        />
        <HelperText type="error" visible={!!fieldErrors.password}>{fieldErrors.password}</HelperText>

        <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink} compact>
          Forgot password?
        </Button>

        <HelperText type="error" visible={!!error}>{error}</HelperText>

        <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={styles.primaryButton} contentStyle={{ paddingVertical: 6 }}>
          Log In
        </Button>

        <Button
          mode="outlined"
          icon="account-star-outline"
          onPress={handleDemoLogin}
          disabled={loading}
          style={styles.googleButton}
        >
          Use Demo Account
        </Button>

        <View style={styles.footerRow}>
          <Text variant="bodyMedium">Don't have an account?</Text>
          <Button mode="text" onPress={() => navigation.navigate('Register')} compact>Register</Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 72, paddingBottom: 32, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: spacing.sm },
  headerSubtitle: { color: colors.sand, marginTop: 4 },
  form: { padding: spacing.lg },
  forgotLink: { alignSelf: 'flex-end' },
  primaryButton: { marginTop: spacing.sm, borderRadius: 12 },
  googleButton: { marginTop: spacing.sm, borderRadius: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
});
