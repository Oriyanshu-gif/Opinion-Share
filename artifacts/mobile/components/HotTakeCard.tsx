import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useHotTakes, type HotTake } from '@/context/HotTakesContext';
import { timeAgo } from '@/utils/time';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B',
  Tech: '#3B82F6',
  Society: '#8B5CF6',
  Entertainment: '#EC4899',
  Sports: '#10B981',
  Music: '#F97316',
  Gaming: '#6366F1',
  Politics: '#EF4444',
};

interface Props {
  take: HotTake;
  showFull?: boolean;
}

export function HotTakeCard({ take, showFull = false }: Props) {
  const colors = useColors();
  const { vote } = useHotTakes();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const total = take.agreeCount + take.disagreeCount;
  const agreeRatio = total > 0 ? take.agreeCount / total : 0.5;
  const categoryColor = CATEGORY_COLORS[take.category] ?? colors.primary;

  const onPress = () => {
    if (!showFull) router.push(`/take/${take.id}`);
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handleVote = (v: 'agree' | 'disagree') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    vote(take.id, v);
  };

  const styles = makeStyles(colors);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22', borderColor: categoryColor + '55' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{take.category}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(take.createdAt)}</Text>
        </View>

        {/* Content */}
        <Text style={styles.content} numberOfLines={showFull ? undefined : 5}>
          {take.content}
        </Text>

        {/* Vote ratio bar */}
        {total > 0 && (
          <View style={styles.ratioBar}>
            <View style={[styles.ratioFill, { width: `${agreeRatio * 100}%` as any, backgroundColor: colors.agree }]} />
            <View style={[styles.ratioFill, { width: `${(1 - agreeRatio) * 100}%` as any, backgroundColor: colors.disagree }]} />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.voteButtons}>
            <Pressable
              style={[
                styles.voteBtn,
                { borderColor: take.userVote === 'agree' ? colors.agree : colors.border },
                take.userVote === 'agree' && { backgroundColor: colors.agree + '22' },
              ]}
              onPress={() => handleVote('agree')}
              hitSlop={8}
            >
              <Ionicons
                name={take.userVote === 'agree' ? 'thumbs-up' : 'thumbs-up-outline'}
                size={16}
                color={take.userVote === 'agree' ? colors.agree : colors.mutedForeground}
              />
              <Text style={[styles.voteCount, take.userVote === 'agree' && { color: colors.agree }]}>
                {take.agreeCount.toLocaleString()}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.voteBtn,
                { borderColor: take.userVote === 'disagree' ? colors.disagree : colors.border },
                take.userVote === 'disagree' && { backgroundColor: colors.disagree + '22' },
              ]}
              onPress={() => handleVote('disagree')}
              hitSlop={8}
            >
              <Ionicons
                name={take.userVote === 'disagree' ? 'thumbs-down' : 'thumbs-down-outline'}
                size={16}
                color={take.userVote === 'disagree' ? colors.disagree : colors.mutedForeground}
              />
              <Text style={[styles.voteCount, take.userVote === 'disagree' && { color: colors.disagree }]}>
                {take.disagreeCount.toLocaleString()}
              </Text>
            </Pressable>
          </View>

          <Pressable style={styles.commentBtn} onPress={onPress} hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.mutedForeground} />
            <Text style={styles.commentCount}>{take.commentCount}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    wrapper: { marginHorizontal: 16, marginVertical: 6 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
    },
    categoryText: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.5,
    },
    time: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    content: {
      fontSize: 16,
      color: colors.foreground,
      fontFamily: 'Inter_500Medium',
      lineHeight: 24,
      marginBottom: 14,
    },
    ratioBar: {
      flexDirection: 'row',
      height: 3,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 14,
      gap: 1,
    },
    ratioFill: {
      height: '100%',
      borderRadius: 2,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    voteButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    voteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
    },
    voteCount: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
    },
    commentBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      padding: 6,
    },
    commentCount: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
  });
}
