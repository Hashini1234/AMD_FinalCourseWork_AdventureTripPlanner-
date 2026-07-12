import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { radius, spacing } from '../theme/theme';

function Shimmer({ style }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, { backgroundColor: theme.colors.surfaceVariant, opacity }, style]}
    />
  );
}

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <Shimmer style={styles.image} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Shimmer style={styles.lineWide} />
            <Shimmer style={styles.lineNarrow} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm },
  block: { borderRadius: radius.sm },
  image: { width: 72, height: 72, borderRadius: radius.md },
  lineWide: { height: 16, width: '80%', marginBottom: spacing.sm, marginTop: spacing.xs },
  lineNarrow: { height: 12, width: '50%' },
});
