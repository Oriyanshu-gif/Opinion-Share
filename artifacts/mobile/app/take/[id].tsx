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
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useHotTakes, type Comment } from '@/context/HotTakesContext';
import { HotTakeCard } from '@/components/HotTakeCard';
import { timeAgo } from '@/utils/time';

export default function TakeDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTakeById, getTakeComments, addComment } = useHotTakes();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const take = getTakeById(id);
  const comments = getTakeComments(id);
  const sorted = [...comments].sort((a, b) => b.createdAt - a.createdAt);

  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;
  const styles = makeStyles(colors);

  const handleAddComment = () => {
    if (commentText.trim().length < 2 || submitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubmitting(true);
    addComment(id, commentText.trim());
    setCommentText('');
    setSubmitting(false);
  };

  if (!take) {
    return (
      <View style={[styles.container, styles.center]}>
        <Stack.Screen options={{ title: 'Hot Take', headerBackTitle: 'Back' }} />
        <Ionicons name="flame-outline" size={48} color={colors.mutedForeground} />
        <Text style={styles.notFound}>Take not found</Text>
      </View>
    );
  }

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.anonAvatar}>
          <Ionicons name="person" size={12} color={colors.mutedForeground} />
        </View>
        <Text style={styles.commentMeta}>Anonymous · {timeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.background } as any,
          headerTintColor: colors.foreground,
          headerBackTitle: 'Back',
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 80 }}
        ListHeaderComponent={
          <View>
            <View style={styles.takeWrapper}>
              <HotTakeCard take={take} showFull />
            </View>
            <View style={styles.commentsHeader}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
              <Text style={styles.commentsTitle}>
                {sorted.length} Comment{sorted.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {sorted.length === 0 && (
              <View style={styles.emptyComments}>
                <Text style={styles.emptyText}>Be the first to comment on this take</Text>
              </View>
            )}
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* Comment input */}
      <View style={[styles.inputBar, { paddingBottom: bottomPadding + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Add your comment..."
            placeholderTextColor={colors.mutedForeground}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={300}
          />
          <Pressable
            style={[styles.sendBtn, { opacity: commentText.trim().length >= 2 ? 1 : 0.4 }]}
            onPress={handleAddComment}
            disabled={commentText.trim().length < 2 || submitting}
          >
            <Ionicons name="send" size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
    notFound: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
    },
    takeWrapper: { paddingTop: 8 },
    commentsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 8,
    },
    commentsTitle: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    emptyComments: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    commentCard: {
      marginHorizontal: 16,
      marginVertical: 4,
      padding: 14,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    anonAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    commentMeta: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    commentContent: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      lineHeight: 20,
    },
    inputBar: {
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.secondary,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingLeft: 16,
      paddingRight: 6,
      paddingVertical: 8,
      gap: 8,
    },
    textInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      maxHeight: 100,
    },
    sendBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
