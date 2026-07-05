import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useHotTakes } from '@/context/HotTakesContext';
import { HotTakeCard } from '@/components/HotTakeCard';

const CATEGORIES = ['Tech', 'Society', 'Food', 'Entertainment', 'Sports', 'Music', 'Gaming', 'Politics'];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { takes } = useHotTakes();
  const [query, setQuery] = useState('');

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 + 84 : 84 + insets.bottom;

  const filtered = query.trim().length > 0
    ? takes.filter(t =>
        t.content.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Ionicons name="search" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hot takes..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {query.trim().length === 0 ? (
        <View style={styles.browseContainer}>
          <Text style={styles.browseTitle}>Browse Categories</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                style={styles.categoryCard}
                onPress={() => setQuery(cat)}
              >
                <Text style={styles.categoryCardText}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptyText}>Try a different keyword or category</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <HotTakeCard take={item} />}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Text>
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
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    searchRow: { paddingHorizontal: 16, paddingBottom: 12 },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
    },
    browseContainer: { paddingHorizontal: 16, paddingTop: 8 },
    browseTitle: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryCard: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryCardText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 40,
      paddingBottom: 80,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    resultCount: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
  });
}
