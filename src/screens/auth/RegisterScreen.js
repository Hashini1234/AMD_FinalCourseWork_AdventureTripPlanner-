import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { validateAuthForm } from '../../utils/validators';
import { colors, spacing } from '../../theme/theme';

export default function RegisterScreen({ navigation }) {
  const { register, loading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleRegister = async () => {
    const errors = validateAuthForm({ email, password, name, mode: 'register' });
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    clearError();
    await register(name.trim(), email.trim(), password);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.darkGreen, colors.green]} style={styles.header}>
        <MaterialCommunityIcons name="tent" size={44} color={colors.amber} />
        <Text style={styles.headerTitle}>Create Your Account</Text>
        <Text style={styles.headerSubtitle}>Start planning your next adventure</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Full Name"
          mode="outlined"
          value={name}
          onChangeText={setName}
          left={<TextInput.Icon icon="account-outline" />}
          error={!!fieldErrors.name}
        />
        <HelperText type="error" visible={!!fieldErrors.name}>{fieldErrors.name}</HelperText>

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
          secureTextEntry
          left={<TextInput.Icon icon="lock-outline" />}
          error={!!fieldErrors.password}
        />
        <HelperText type="error" visible={!!fieldErrors.password}>{fieldErrors.password}</HelperText>

        <HelperText type="error" visible={!!error}>{error}</HelperText>

        <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.primaryButton} contentStyle={{ paddingVertical: 6 }}>
          Create Account
        </Button>

        <View style={styles.footerRow}>
          <Text variant="bodyMedium">Already have an account?</Text>
          <Button mode="text" onPress={() => navigation.navigate('Login')} compact>Log In</Button>
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
  primaryButton: { marginTop: spacing.sm, borderRadius: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
});
