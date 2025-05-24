import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string; // same as auth uid
  name?: string;
  iconURL?: string;
  goalMinutesPerDay: number;
  streakDays?: number;
  totalUsageMinutes?: number;
  autoShareTimeline?: boolean; // Added for settings
}

export interface DailyLog {
  id?: string; // documentId will be userId_YYYYMMDD
  userId: string;
  date: string; // YYYY-MM-DD format
  startTime?: Timestamp; // Firestore Timestamp
  endTime?: Timestamp;   // Firestore Timestamp
  durationMinutes: number;
  goalMinutes: number; // Copied from UserProfile at the time of logging
  achieved: boolean;
  sharedToTimeline?: boolean; // To track if this log was shared
}

// Optional: If we decide to have a separate redirect log before processing into DailyLog
// export interface RedirectLog {
//   id?: string;
//   userId: string;
//   targetUrl: string;
//   startTime: Timestamp;
//   endTime?: Timestamp;
// }

export interface TimelinePost {
  id?: string; // Firestore document ID
  userId: string;
  userName?: string; // Denormalized from UserProfile
  iconURL?: string;  // Denormalized from UserProfile
  date: string; // YYYY-MM-DD format, from DailyLog
  result: 'achieved' | 'failed';
  durationMinutes: number;
  goalMinutes: number;
  comment?: string;
  createdAt: Timestamp; // For ordering timeline posts
  likesCount?: number; // Denormalized counter
}

export interface Reaction {
  id?: string; // Firestore document ID
  fromUserId: string;
  type: 'like' | 'fire'; // Simplified for now
  createdAt: Timestamp;
}
