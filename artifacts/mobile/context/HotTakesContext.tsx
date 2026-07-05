import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Vote = 'agree' | 'disagree' | null;

export interface HotTake {
  id: string;
  content: string;
  category: string;
  agreeCount: number;
  disagreeCount: number;
  commentCount: number;
  createdAt: number;
  userVote: Vote;
}

export interface Comment {
  id: string;
  takeId: string;
  content: string;
  createdAt: number;
}

interface HotTakesContextType {
  takes: HotTake[];
  comments: Comment[];
  loading: boolean;
  addTake: (content: string, category: string) => void;
  vote: (takeId: string, voteType: 'agree' | 'disagree') => void;
  addComment: (takeId: string, content: string) => void;
  getTakeComments: (takeId: string) => Comment[];
  getTakeById: (id: string) => HotTake | undefined;
}

const TAKES_KEY = '@hot_takes:takes_v2';
const COMMENTS_KEY = '@hot_takes:comments_v2';

const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const now = Date.now();
const SEED_TAKES: HotTake[] = [
  { id: 'seed1', content: 'Pineapple on pizza is objectively delicious and people who disagree just have boring palates', category: 'Food', agreeCount: 452, disagreeCount: 381, commentCount: 24, createdAt: now - 1000 * 60 * 90, userVote: null },
  { id: 'seed2', content: 'Social media has caused more damage to society than any war in the last 50 years', category: 'Society', agreeCount: 892, disagreeCount: 214, commentCount: 67, createdAt: now - 1000 * 60 * 60 * 5, userVote: null },
  { id: 'seed3', content: 'JavaScript became the most used language in the world despite being objectively terrible, which says everything about how software gets adopted', category: 'Tech', agreeCount: 670, disagreeCount: 330, commentCount: 45, createdAt: now - 1000 * 60 * 60 * 8, userVote: null },
  { id: 'seed4', content: 'Remote work is making people lonelier and less productive than they are willing to admit publicly', category: 'Society', agreeCount: 340, disagreeCount: 680, commentCount: 89, createdAt: now - 1000 * 60 * 60 * 12, userVote: null },
  { id: 'seed5', content: 'Movies peaked in the 90s. Nothing made after 2005 will be considered a classic in 50 years', category: 'Entertainment', agreeCount: 520, disagreeCount: 480, commentCount: 112, createdAt: now - 1000 * 60 * 60 * 24, userVote: null },
  { id: 'seed6', content: 'AI will replace most software engineers within 10 years and the industry is not ready for it', category: 'Tech', agreeCount: 490, disagreeCount: 510, commentCount: 78, createdAt: now - 1000 * 60 * 60 * 36, userVote: null },
  { id: 'seed7', content: 'Coffee is massively overrated. People only drink it for the identity it gives them, not the taste', category: 'Food', agreeCount: 180, disagreeCount: 820, commentCount: 33, createdAt: now - 1000 * 60 * 60 * 48, userVote: null },
  { id: 'seed8', content: 'Watching sports is a bizarre thing to dedicate your weekends to and most people only do it out of social pressure', category: 'Sports', agreeCount: 95, disagreeCount: 905, commentCount: 156, createdAt: now - 1000 * 60 * 60 * 60, userVote: null },
  { id: 'seed9', content: 'Modern pop music is disposable content that will not be remembered or respected in 20 years', category: 'Music', agreeCount: 640, disagreeCount: 360, commentCount: 41, createdAt: now - 1000 * 60 * 60 * 72, userVote: null },
  { id: 'seed10', content: 'Open offices were invented by managers who wanted to surveil employees, not foster collaboration', category: 'Society', agreeCount: 850, disagreeCount: 150, commentCount: 19, createdAt: now - 1000 * 60 * 60 * 96, userVote: null },
  { id: 'seed11', content: 'TikTok is genuinely making an entire generation incapable of sustained attention and nobody wants to say it out loud', category: 'Tech', agreeCount: 720, disagreeCount: 280, commentCount: 88, createdAt: now - 1000 * 60 * 60 * 120, userVote: null },
  { id: 'seed12', content: 'Video games are the most culturally significant art form of the 21st century and still get no respect for it', category: 'Gaming', agreeCount: 480, disagreeCount: 520, commentCount: 62, createdAt: now - 1000 * 60 * 60 * 144, userVote: null },
];

const HotTakesContext = createContext<HotTakesContextType | null>(null);

export function HotTakesProvider({ children }: { children: React.ReactNode }) {
  const [takes, setTakes] = useState<HotTake[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [takesData, commentsData] = await Promise.all([
          AsyncStorage.getItem(TAKES_KEY),
          AsyncStorage.getItem(COMMENTS_KEY),
        ]);
        setTakes(takesData ? JSON.parse(takesData) : SEED_TAKES);
        if (!takesData) await AsyncStorage.setItem(TAKES_KEY, JSON.stringify(SEED_TAKES));
        setComments(commentsData ? JSON.parse(commentsData) : []);
      } catch {
        setTakes(SEED_TAKES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveTakes = (t: HotTake[]) => AsyncStorage.setItem(TAKES_KEY, JSON.stringify(t));
  const saveComments = (c: Comment[]) => AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(c));

  const addTake = useCallback((content: string, category: string) => {
    const newTake: HotTake = {
      id: genId(),
      content,
      category,
      agreeCount: 0,
      disagreeCount: 0,
      commentCount: 0,
      createdAt: Date.now(),
      userVote: null,
    };
    setTakes(prev => {
      const updated = [newTake, ...prev];
      saveTakes(updated);
      return updated;
    });
  }, []);

  const vote = useCallback((takeId: string, voteType: 'agree' | 'disagree') => {
    setTakes(prev => {
      const updated = prev.map(take => {
        if (take.id !== takeId) return take;
        let { agreeCount, disagreeCount, userVote } = take;
        if (userVote === 'agree') agreeCount = Math.max(0, agreeCount - 1);
        else if (userVote === 'disagree') disagreeCount = Math.max(0, disagreeCount - 1);
        let newVote: Vote = userVote === voteType ? null : voteType;
        if (newVote === 'agree') agreeCount++;
        else if (newVote === 'disagree') disagreeCount++;
        return { ...take, agreeCount, disagreeCount, userVote: newVote };
      });
      saveTakes(updated);
      return updated;
    });
  }, []);

  const addComment = useCallback((takeId: string, content: string) => {
    const newComment: Comment = { id: genId(), takeId, content, createdAt: Date.now() };
    setComments(prev => {
      const updated = [...prev, newComment];
      saveComments(updated);
      return updated;
    });
    setTakes(prev => {
      const updated = prev.map(t =>
        t.id === takeId ? { ...t, commentCount: t.commentCount + 1 } : t
      );
      saveTakes(updated);
      return updated;
    });
  }, []);

  const getTakeComments = useCallback(
    (takeId: string) => comments.filter(c => c.takeId === takeId),
    [comments]
  );

  const getTakeById = useCallback(
    (id: string) => takes.find(t => t.id === id),
    [takes]
  );

  return (
    <HotTakesContext.Provider value={{ takes, comments, loading, addTake, vote, addComment, getTakeComments, getTakeById }}>
      {children}
    </HotTakesContext.Provider>
  );
}

export function useHotTakes() {
  const ctx = useContext(HotTakesContext);
  if (!ctx) throw new Error('useHotTakes must be used within HotTakesProvider');
  return ctx;
}
