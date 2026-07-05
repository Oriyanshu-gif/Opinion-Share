import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useHotTakes, type HotTake } from '@/context/HotTakesContext';
import { HotTakeCard } from '@/components/HotTakeCard';

function controversyScore(take: HotTake) {
  const total = take.agreeCount + take.disagreeCount;
  if (total === 0) return 0;
  const ratio = take.agreeCount / total;
  // Highest at 0.5 (50/50 split), scaled by total votes
  return total * (1 - Math.abs(ratio - 0.5) * 2);
}

export default function TrendingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { takes, loading } = useHotTakes();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 + 84 : 84 + insets.bottom;

  const mostVoted = [...takes]
    .sort((a, b) => (b.agreeCount + b.disagreeCount) - (a.agreeCount + a.disagreeCount))
    .slice(0, 5);

  const mostControversial = [...takes]
    .filter(t => t.agreeCount + t.disagreeCount > 0)
    .sort((a, b) => controversyScore(b) - controversyScore(a))
    .slice(0, 5);

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={26} color={colors.primary} />
        <Text style={styles.headerTitle}>Trending</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          {/* Most Popular */}
          <View style={styles.sectionHeader}>
            <Ionicons name="flame" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Most Popular</Text>
          </View>
          {mostVoted.map((take, i) => (
            <View key={take.id}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{i + 1}</Text>
              </View>
              <HotTakeCard take={take} />
            </View>
          ))}

          {/* Most Controversial */}
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <Ionicons name="stats-chart" size={18} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: '#8B5CF6' }]}>Most Controversial</Text>
          </View>
          {mostControversial.map((take, i) => (
            <View key={take.id}>
              <View style={[styles.rankBadge, { borderColor: '#8B5CF655' }]}>
                <Text style={[styles.rankText, { color: '#8B5CF6' }]}>#{i + 1}</Text>
              </View>
              <HotTakeCard take={take} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    rankBadge: {
      marginLeft: 22,
      marginBottom: -4,
      alignSelf: 'flex-start',
    },
    rankText: {
      fontSize: 11,
      fontFamily: 'Inter_700Bold',
      color: colors.primary,
      letterSpacing: 1,
    },
  });
}
