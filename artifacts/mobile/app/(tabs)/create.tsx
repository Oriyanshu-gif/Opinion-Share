import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useHotTakes } from '@/context/HotTakesContext';

const CATEGORIES = ['Tech', 'Society', 'Food', 'Entertainment', 'Sports', 'Music', 'Gaming', 'Politics'];
const MAX_CHARS = 280;

export default function CreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTake } = useHotTakes();
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;
  const remaining = MAX_CHARS - content.length;
  const canSubmit = content.trim().length >= 10 && selectedCategory !== '' && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTake(content.trim(), selectedCategory);
    setContent('');
    setSelectedCategory('');
    setTimeout(() => {
      setSubmitting(false);
      router.navigate('/');
    }, 400);
  };

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPadding }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Ionicons name="add-circle" size={26} color={colors.primary} />
        <Text style={styles.headerTitle}>Drop a Take</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Anonymous badge */}
        <View style={styles.anonBadge}>
          <Ionicons name="person-outline" size={14} color={colors.mutedForeground} />
          <Text style={styles.anonText}>Posted anonymously</Text>
        </View>

        {/* Text input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="What's your hot take?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={MAX_CHARS}
            textAlignVertical="top"
            autoFocus={false}
          />
          <View style={styles.charRow}>
            <Text style={[
              styles.charCount,
              remaining < 50 && { color: remaining < 20 ? colors.disagree : '#F59E0B' },
            ]}>
              {remaining}
            </Text>
          </View>
        </View>

        {/* Category selector */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === cat ? colors.primary : colors.secondary,
                  borderColor: selectedCategory === cat ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === cat ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <Ionicons name="flame-outline" size={14} color={colors.primary} />
          <Text style={styles.tipsText}>
            The best hot takes are bold, specific, and a little controversial. Vague takes don't get votes.
          </Text>
        </View>

        {/* Submit button */}
        <Pressable
          style={[
            styles.submitBtn,
            { opacity: canSubmit ? 1 : 0.4 },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Ionicons name="flame" size={18} color={colors.primaryForeground} />
          <Text style={styles.submitText}>
            {submitting ? 'Posting...' : 'Post Hot Take'}
          </Text>
        </Pressable>

        {!canSubmit && content.length > 0 && (
          <Text style={styles.hint}>
            {content.trim().length < 10
              ? 'Write at least 10 characters'
              : !selectedCategory
              ? 'Select a category to continue'
              : ''}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    content: { paddingHorizontal: 16, paddingTop: 8 },
    anonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
    },
    anonText: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    inputWrapper: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 24,
      minHeight: 140,
    },
    input: {
      flex: 1,
      fontSize: 17,
      fontFamily: 'Inter_500Medium',
      color: colors.foreground,
      minHeight: 100,
      lineHeight: 26,
    },
    charRow: { alignItems: 'flex-end', marginTop: 8 },
    charCount: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    sectionLabel: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1,
    },
    categoryChipText: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
    },
    tipsBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 12,
      backgroundColor: colors.primary + '11',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + '33',
      marginBottom: 24,
    },
    tipsText: {
      flex: 1,
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      lineHeight: 19,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      marginBottom: 12,
    },
    submitText: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
      color: colors.primaryForeground,
    },
    hint: {
      textAlign: 'center',
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
  });
}
