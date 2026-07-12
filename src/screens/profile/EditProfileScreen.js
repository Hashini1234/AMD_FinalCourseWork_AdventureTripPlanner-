import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import ScreenContainer from '../../components/ScreenContainer';
import { isNonEmpty } from '../../utils/validators';
import { colors, spacing } from '../../theme/theme';

export default function EditProfileScreen({ navigation }) {
  const theme = useTheme();
  const { user, profile, updateProfile, loading, error, clearError } = useAuth();

  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [photoUri, setPhotoUri] = useState(profile?.photoUrl || null);
  const [nameError, setNameError] = useState('');

  const initials = (name || 'E').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const pickFrom = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to continue.');
      return;
    }
    const options = { mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleChangePhoto = () => {
    Alert.alert('Change Profile Photo', undefined, [
      { text: 'Take Photo', onPress: () => pickFrom(true) },
      { text: 'Choose from Library', onPress: () => pickFrom(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!isNonEmpty(name)) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');
    clearError();

    const photoChanged = photoUri && photoUri !== profile?.photoUrl;
    const result = await updateProfile({
      name: name.trim(),
      photoUri: photoChanged ? photoUri : undefined,
    });
    if (result.success) navigation.goBack();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handleChangePhoto} style={styles.avatarWrapper}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
          ) : (
            <Avatar.Text size={100} label={initials} style={{ backgroundColor: colors.amber }} labelStyle={{ color: colors.darkGreen, fontWeight: '700' }} />
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="camera" size={18} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text variant="bodySmall" style={styles.avatarHint}>Tap to change photo</Text>

        <TextInput
          label="Full Name"
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!nameError}
        />
        <HelperText type="error" visible={!!nameError}>{nameError}</HelperText>

        <TextInput label="Email" mode="outlined" value={user?.email || ''} editable={false} style={styles.input} />
        <HelperText type="info" visible>Email cannot be changed for mock accounts.</HelperText>

        <HelperText type="error" visible={!!error}>{error}</HelperText>

        <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading} style={styles.saveButton} contentStyle={{ paddingVertical: 6 }}>
          Save Changes
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.lg, alignItems: 'stretch' },
  avatarWrapper: { alignSelf: 'center', marginTop: spacing.md },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  editBadge: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  avatarHint: { alignSelf: 'center', marginTop: spacing.xs, marginBottom: spacing.md, opacity: 0.7 },
  input: { marginTop: spacing.md },
  saveButton: { marginTop: spacing.lg, borderRadius: 12 },
});
