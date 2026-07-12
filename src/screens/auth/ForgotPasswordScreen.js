import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validators';
import { colors, spacing } from '../../theme/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    clearError();
    const result = await resetPassword(email.trim());
    if (result.success) setSent(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.darkGreen, colors.green]} style={styles.header}>
        <MaterialCommunityIcons name="lock-reset" size={44} color={colors.amber} />
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSubtitle}>We'll email you a reset link</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {sent ? (
          <Text style={styles.successText}>
            A password reset email has been sent to {email}. Check your inbox and follow the link.
          </Text>
        ) : (
          <>
            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email-outline" />}
              error={!!emailError}
            />
            <HelperText type="error" visible={!!emailError}>{emailError}</HelperText>
            <HelperText type="error" visible={!!error}>{error}</HelperText>

            <Button mode="contained" onPress={handleReset} loading={loading} disabled={loading} style={styles.primaryButton} contentStyle={{ paddingVertical: 6 }}>
              Send Reset Link
            </Button>
          </>
        )}

        <Button mode="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.md }}>
          Back to Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 72, paddingBottom: 32, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: spacing.sm },
  headerSubtitle: { color: colors.sand, marginTop: 4 },
  form: { padding: spacing.lg },
  primaryButton: { marginTop: spacing.sm, borderRadius: 12 },
  successText: { textAlign: 'center', marginBottom: spacing.md },
});
