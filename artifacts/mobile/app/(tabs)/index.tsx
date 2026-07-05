import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useHotTakes } from '@/context/HotTakesContext';
import { HotTakeCard } from '@/components/HotTakeCard';
import { CategoryPill } from '@/components/CategoryPill';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['All', 'Tech', 'Society', 'Food', 'Entertainment', 'Sports', 'Music', 'Gaming', 'Politics'];

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { takes, loading } = useHotTakes();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = selectedCategory === 'All'
    ? takes
    : takes.filter(t => t.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 + 84 : 84 + insets.bottom;

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flame" size={26} color={colors.primary} />
          <Text style={styles.headerTitle}>Hot Takes</Text>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map(cat => (
          <CategoryPill
            key={cat}
            label={cat}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="flame-outline" size={48} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No hot takes yet</Text>
          <Text style={styles.emptyText}>Be the first to drop a hot take in this category</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <HotTakeCard take={item} />}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
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
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    categoryContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 4,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
