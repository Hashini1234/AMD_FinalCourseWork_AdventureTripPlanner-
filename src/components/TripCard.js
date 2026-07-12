import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDateRange, daysUntil } from '../utils/dateUtils';
import { activityTypes, radius, spacing } from '../theme/theme';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800';

export default function TripCard({ trip, onPress }) {
  const theme = useTheme();
  const activity = activityTypes.find((a) => a.value === trip.activityType);
  const days = daysUntil(trip.startDate);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: trip.coverImage || FALLBACK_IMAGE }} style={styles.image} />
      <View style={styles.body}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>{trip.title}</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }} numberOfLines={1}>
            {trip.destination}{trip.country ? `, ${trip.country}` : ''}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
        <View style={styles.footerRow}>
          <Chip compact icon={activity?.icon || 'map-marker'} style={styles.chip}>{trip.activityType}</Chip>
          {days >= 0 ? (
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              {days === 0 ? 'Today' : `In ${days}d`}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: 96, height: '100%', minHeight: 110 },
  body: { flex: 1, padding: spacing.sm, justifyContent: 'center' },
  title: { fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  chip: { alignSelf: 'flex-start', height: 28 },
});
