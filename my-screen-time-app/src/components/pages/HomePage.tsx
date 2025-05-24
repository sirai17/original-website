import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLogs } from '../../hooks/useLogs';
import { DailyLog, UserProfile } from '../../types/firestore'; // Ensure this path is correct
import { Timestamp } from 'firebase/firestore';

const HomePage: React.FC = () => {
  const { authState, signOutUser, signInAnonymously } = useAuth();
  const { addOrUpdateDailyLog, getDailyLog, getUserProfile, updateUserProfile } = useLogs();
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualEntryStartTime, setManualEntryStartTime] = useState<Timestamp | null>(null);

  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (authState.user) {
      setIsLoading(true);
      Promise.all([getDailyLog(todayDateStr), getUserProfile(authState.user.uid)])
        .then(([log, profile]) => {
          setTodayLog(log);
          setUserProfile(profile);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setTodayLog(null);
      setUserProfile(null);
    }
  }, [authState.user, todayDateStr, getDailyLog, getUserProfile]);

  const handleManualStart = async () => {
    if (!authState.user || !userProfile) return;
    const now = Timestamp.now();
    setManualEntryStartTime(now);
    try {
      await addOrUpdateDailyLog({
        date: todayDateStr,
        startTime: now,
        // durationMinutes: todayLog?.durationMinutes || 0, // Keep existing duration if any // Duration will be set by end time
        goalMinutes: userProfile.goalMinutesPerDay,
        // achieved: todayLog?.achieved || false, // Achieved will be calculated by log update
      });
      // Refresh log
      getDailyLog(todayDateStr).then(setTodayLog);
      console.log('Manual session started.');
    } catch (error) {
      console.error("Error starting manual session:", error);
    }
  };

  const handleManualFinish = async () => {
    if (!authState.user || !userProfile || !manualEntryStartTime) {
        // If manualEntryStartTime is null, but todayLog has a startTime and no endTime,
        // it means a redirect session might be active.
        if (todayLog?.startTime && !todayLog.endTime) {
            // Use todayLog.startTime as the effective start for this finish action
        } else {
            console.warn("No active session to finish or user/profile missing.");
            return;
        }
    }

    const endTime = Timestamp.now();
    // Use manualEntryStartTime if available (manual session), otherwise use log's startTime (redirect session)
    const startTimeForCalc = manualEntryStartTime || todayLog?.startTime;

    if (!startTimeForCalc) {
        console.error("Cannot determine session start time to finish.");
        return;
    }

    try {
      await addOrUpdateDailyLog({
        date: todayDateStr,
        startTime: startTimeForCalc, 
        endTime: endTime,    
        goalMinutes: userProfile.goalMinutesPerDay,
      });
      setManualEntryStartTime(null);
      const updatedLog = await getDailyLog(todayDateStr);
      setTodayLog(updatedLog);
      console.log('Manual session finished.');
    } catch (error) {
      console.error("Error finishing manual session:", error);
    }
  };
  
  const usagePercentage = userProfile && todayLog ? (todayLog.durationMinutes / userProfile.goalMinutesPerDay) * 100 : 0;
  const isAchieved = todayLog?.achieved ?? false;
  const isOverLimit = todayLog && userProfile ? todayLog.durationMinutes > userProfile.goalMinutesPerDay : false;

  if (isLoading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (!authState.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="mb-4 text-lg">Please sign in to track your screen time.</p>
        <button
          onClick={() => signInAnonymously().catch(e => console.error("Anonymous sign-in error:", e))}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Sign In Anonymously
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={signOutUser}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>

        {userProfile && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Hello, {userProfile.name || 'User'}!</h2>
            <p className="text-gray-600">Your daily goal: <span className="font-bold">{userProfile.goalMinutesPerDay}</span> minutes</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Today's Usage</h3>
            <div className="relative pt-1">
              <div className="overflow-hidden h-4 mb-2 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${isOverLimit ? 'bg-red-500' : (isAchieved ? 'bg-green-500' : 'bg-blue-500')}`}
                />
              </div>
              <p className="text-sm text-gray-600 text-right">
                <span className="font-bold">{todayLog?.durationMinutes || 0}</span> / {userProfile?.goalMinutesPerDay || 'N/A'} minutes
              </p>
            </div>
            <div className="mt-4 text-2xl font-bold text-center">
              {isOverLimit ? (
                <span className="text-red-500">💥 Over Limit!</span>
              ) : isAchieved && todayLog && todayLog.durationMinutes > 0 ? (
                <span className="text-green-500">🔥 Goal Achieved!</span>
              ) : todayLog && todayLog.durationMinutes === 0 && !manualEntryStartTime && !todayLog.startTime ? (
                 <span className="text-gray-500">Let's start!</span>
              ) : (
                <span className="text-yellow-500">⏳ In Progress</span>
              )}
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Manual Logging</h3>
            {!(manualEntryStartTime || (todayLog?.startTime && !todayLog?.endTime)) ? (
              <button
                onClick={handleManualStart}
                className="w-full px-4 py-3 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              >
                Start Manual Session
              </button>
            ) : (
              <button
                onClick={handleManualFinish}
                className="w-full px-4 py-3 font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Finish Session
              </button>
            )}
            {(manualEntryStartTime || (todayLog?.startTime && !todayLog?.endTime)) && (
             <p className="text-xs text-center text-gray-500 mt-2">
                Session started at: {(manualEntryStartTime || todayLog?.startTime)?.toDate().toLocaleTimeString()}
             </p>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
             <p className="text-gray-600">Navigate to other sections:</p>
             <div className="flex justify-center space-x-4 mt-2">
                 <a href="#/history" className="text-blue-500 hover:underline">History</a>
                 <a href="#/timeline" className="text-blue-500 hover:underline">Timeline</a>
                 <a href="#/settings" className="text-blue-500 hover:underline">Settings</a>
             </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
