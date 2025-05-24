import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  collectionGroup,
  getDocs,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase'; // Assuming db is exported from firebase.ts
import { useAuth } from './useAuth'; // Or from '../contexts/AuthContext'
import { UserProfile, DailyLog, TimelinePost, Reaction } from '../types/firestore';

export const useLogs = () => {
  const { authState } = useAuth();
  const currentUser = authState.user;

  const getUserId = (): string | null => {
    if (!currentUser) {
      console.warn('User not authenticated.');
      return null;
    }
    return currentUser.uid;
  };

  // UserProfile functions
  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  };

  const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      const defaultProfile: UserProfile = {
        id: userId,
        goalMinutesPerDay: 60, // Default goal
        streakDays: 0,
        totalUsageMinutes: 0,
        autoShareTimeline: false,
        ...profileData,
      };
      await setDoc(userDocRef, defaultProfile);
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  // DailyLog functions
  const addOrUpdateDailyLog = async (
    logData: Omit<DailyLog, 'id' | 'userId' | 'durationMinutes' | 'achieved'> & { date: string; startTime: Timestamp; endTime: Timestamp; goalMinutes: number }
  ): Promise<void> => {
    const userId = getUserId();
    if (!userId) return;

    const { date, startTime, endTime, goalMinutes, ...restData } = logData;
    const docId = `${userId}_${date.replace(/-/g, '')}`; // YYYYMMDD format
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', docId);

    try {
      // Calculate duration
      const durationMillis = endTime.toMillis() - startTime.toMillis();
      const durationMinutes = Math.max(0, Math.ceil(durationMillis / (1000 * 60))); // Round up, ensure non-negative

      const achieved = durationMinutes >= goalMinutes;

      const finalLogData: DailyLog = {
        userId,
        date,
        startTime,
        endTime,
        durationMinutes,
        goalMinutes,
        achieved,
        ...restData, // includes sharedToTimeline if provided
      };

      await setDoc(dailyLogRef, finalLogData, { merge: true });
      
      // Update totalUsageMinutes in UserProfile
      if (durationMinutes > 0) {
        const userProfileRef = doc(db, 'users', userId);
        await updateDoc(userProfileRef, {
          totalUsageMinutes: increment(durationMinutes)
        });
      }

    } catch (error) {
      console.error("Error adding or updating daily log:", error);
    }
  };

  const getDailyLog = async (date: string): Promise<DailyLog | null> => {
    const userId = getUserId();
    if (!userId) return null;

    const docId = `${userId}_${date.replace(/-/g, '')}`;
    try {
      const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', docId);
      const docSnap = await getDoc(dailyLogRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DailyLog;
      }
      return null;
    } catch (error) {
      console.error("Error getting daily log:", error);
      return null;
    }
  };

  const getDailyLogsForMonth = async (year: number, month: number): Promise<DailyLog[]> => {
    const userId = getUserId();
    if (!userId) return [];

    // Firestore month is 1-12, Date month is 0-11. Ensure consistency.
    // Date format is YYYY-MM-DD. We need to query for dates starting with YYYY-MM.
    const monthString = month.toString().padStart(2, '0');
    const startDate = `${year}-${monthString}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthString = nextMonth.toString().padStart(2, '0');
    const endDate = `${nextYear}-${nextMonthString}-01`;

    try {
      const logsCollectionRef = collection(db, 'users', userId, 'dailyLogs');
      const q = query(logsCollectionRef, 
                      where('date', '>=', startDate), 
                      where('date', '<', endDate),
                      orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyLog));
    } catch (error) {
      console.error("Error getting daily logs for month:", error);
      return [];
    }
  };

  // TimelinePost functions
  const createTimelinePost = async (
    postData: Omit<TimelinePost, 'id' | 'userId' | 'createdAt' | 'userName' | 'iconURL' | 'likesCount'>
  ): Promise<string> => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");

    const userProfile = await getUserProfile(userId);

    try {
      const timelineCollectionRef = collection(db, 'timeline');
      const newPost: Omit<TimelinePost, 'id'> = {
        ...postData,
        userId,
        userName: userProfile?.name || 'Anonymous User',
        iconURL: userProfile?.iconURL || '',
        createdAt: serverTimestamp() as Timestamp, // Use serverTimestamp for consistency
        likesCount: 0,
      };
      const docRef = await addDoc(timelineCollectionRef, newPost);
      return docRef.id;
    } catch (error) {
      console.error("Error creating timeline post:", error);
      throw error;
    }
  };

  const getTimelinePosts = async (limitCount: number = 20): Promise<TimelinePost[]> => {
    try {
      const timelineCollectionRef = collection(db, 'timeline');
      const q = query(timelineCollectionRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelinePost));
    } catch (error) {
      console.error("Error getting timeline posts:", error);
      return [];
    }
  };

  // Reaction functions
  const addReactionToPost = async (postId: string, reactionType: Reaction['type']): Promise<void> => {
    const userId = getUserId();
    if (!userId) return;

    const reactionId = `${userId}_${postId}`; // Ensure a user can only react once per post with this ID structure
    const reactionRef = doc(db, 'timeline', postId, 'reactions', reactionId);
    const postRef = doc(db, 'timeline', postId);

    try {
      const batch = writeBatch(db);
      batch.set(reactionRef, {
        fromUserId: userId,
        type: reactionType,
        createdAt: serverTimestamp() as Timestamp,
      });
      
      // Denormalize likesCount
      if (reactionType === 'like') { // Assuming 'like' is the primary reaction for likesCount
        batch.update(postRef, { likesCount: increment(1) });
      }
      // Potentially handle other reaction types for different counters if needed

      await batch.commit();
    } catch (error) {
      console.error("Error adding reaction to post:", error);
      // Consider if user already reacted (though setDoc with specific ID should handle it)
    }
  };
  
  const getReactionsForPost = async (postId: string): Promise<Reaction[]> => {
    if (!postId) return [];
    try {
      const reactionsCollectionRef = collection(db, 'timeline', postId, 'reactions');
      const q = query(reactionsCollectionRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reaction));
    } catch (error) {
      console.error("Error getting reactions for post:", error);
      return [];
    }
  };

  return {
    getUserProfile,
    createUserProfile,
    updateUserProfile,
    addOrUpdateDailyLog,
    getDailyLog,
    getDailyLogsForMonth,
    createTimelinePost,
    getTimelinePosts,
    addReactionToPost,
    getReactionsForPost,
  };
};
