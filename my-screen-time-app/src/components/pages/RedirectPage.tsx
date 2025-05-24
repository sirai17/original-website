import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLogs } from '../../hooks/useLogs';
import { Timestamp } from 'firebase/firestore';

const RedirectPage: React.FC = () => {
  const { authState } = useAuth();
  const { addOrUpdateDailyLog, getUserProfile, createUserProfile } = useLogs();
  const location = useLocation();
  const navigate = useNavigate();
  const processing = useRef(false); // Prevents double execution

  useEffect(() => {
    if (processing.current) return;

    const handleRedirect = async () => {
      processing.current = true;
      const params = new URLSearchParams(location.search);
      const targetUrl = params.get('target');

      if (!targetUrl) {
        console.error('Target URL is missing.');
        navigate('/home'); // Or some error page
        return;
      }

      if (authState.loading) {
        // Wait for auth state to resolve
        processing.current = false;
        return;
      }

      if (!authState.user) {
        console.log('User not authenticated, redirecting to target without logging.');
        window.location.href = targetUrl;
        return;
      }

      try {
        let userProfile = await getUserProfile(authState.user.uid);
        if (!userProfile) {
          // Create a default profile if none exists
          await createUserProfile(authState.user.uid, { goalMinutesPerDay: 60 }); // Default goal
          userProfile = await getUserProfile(authState.user.uid); // Re-fetch
          if (!userProfile) {
             console.error("Failed to create or fetch user profile after creation.");
             window.location.href = targetUrl; // Proceed without logging if profile fails
             return;
          }
        }

        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // Record start time
        // For a new session, this is the start.
        // If a session for today already exists, this might be an additional redirect.
        // The useLogs hook's addOrUpdateDailyLog should handle merging if necessary,
        // but for now, we're primarily focused on the initial redirect logging.
        // A more sophisticated approach might involve storing a 'currentSessionStartTime' in local storage
        // or checking the last log's endTime.

        await addOrUpdateDailyLog({
          date: dateStr,
          startTime: Timestamp.now(),
          // durationMinutes and achieved will be calculated/updated when session ends
          // For now, set defaults or handle in useLogs
          durationMinutes: 0, // Initial duration
          goalMinutes: userProfile.goalMinutesPerDay,
          achieved: false, // Initial state
        });

        console.log(`Logging start for ${targetUrl} at ${new Date().toISOString()}`);

      } catch (error) {
        console.error('Error during logging process:', error);
      } finally {
        // Redirect to the target URL regardless of logging success/failure
        window.location.href = targetUrl;
      }
    };

    handleRedirect();

  }, [location.search, authState, addOrUpdateDailyLog, getUserProfile, createUserProfile, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Redirecting...</p>
      {/* You can add a spinner or a more elaborate loading message here */}
    </div>
  );
};

export default RedirectPage;
