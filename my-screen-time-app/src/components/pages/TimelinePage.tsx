import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLogs } from '../../hooks/useLogs';
import { TimelinePost } from '../../types/firestore';
import { Timestamp } from 'firebase/firestore'; // Ensure Timestamp is imported if used for `post.createdAt` directly

const TimelinePage: React.FC = () => {
  const { authState } = useAuth();
  const { getTimelinePosts, addReactionToPost, createTimelinePost, getDailyLog } = useLogs();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getTimelinePosts(50) // Fetch more posts
      .then(setPosts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [getTimelinePosts]);

  const handleReaction = async (postId: string, type: 'like' | 'fire') => {
    if (!authState.user || !postId) return;
    try {
      await addReactionToPost(postId, type);
      // Optimistically update UI or re-fetch posts
      setPosts(prevPosts => prevPosts.map(p => 
        p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + (type === 'like' ? 1 : 0) } : p
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleShareTodayLog = async () => {
    if (!authState.user) return;
    setIsSubmitting(true);
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyLog = await getDailyLog(todayStr);

        if (!dailyLog || dailyLog.durationMinutes === 0) {
            alert("No activity recorded for today to share.");
            setIsSubmitting(false);
            return;
        }
        if (dailyLog.sharedToTimeline) {
            alert("Today's log has already been shared.");
            setIsSubmitting(false);
            return;
        }

        await createTimelinePost({
            date: dailyLog.date,
            result: dailyLog.achieved ? 'achieved' : 'failed',
            durationMinutes: dailyLog.durationMinutes,
            goalMinutes: dailyLog.goalMinutes,
            comment: comment,
        });
        setComment('');
        // Refresh timeline posts
        getTimelinePosts(50).then(setPosts);
        alert("Shared to timeline!");
    } catch (error) {
        console.error("Error sharing to timeline:", error);
        alert("Failed to share. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };
  

  if (!authState.user) return <div className="p-4">Please sign in to view the timeline.</div>;
  if (isLoading) return <div className="p-4">Loading timeline...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Timeline</h1>

        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Share Today's Log</h2>
            <textarea
                className="w-full p-2 border rounded-md mb-3 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add a comment to your post (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button
                onClick={handleShareTodayLog}
                disabled={isSubmitting}
                className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
                {isSubmitting ? 'Sharing...' : 'Share My Day'}
            </button>
        </div>

        {posts.length === 0 && <p className="text-center text-gray-500">No timeline posts yet. Be the first to share!</p>}

        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-5 rounded-xl shadow-lg">
              <div className="flex items-start space-x-4">
                <img 
                  src={post.iconURL || `https://avatar.vercel.sh/${post.userId}.svg?text=${post.userName ? post.userName.substring(0,2) : '??'}`} 
                  alt={post.userName || 'User'} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{post.userName || 'Anonymous User'}</span>
                    <span className="text-xs text-gray-500">
                      {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${post.result === 'achieved' ? 'text-green-600' : 'text-red-600'}`}>
                    {post.result === 'achieved' ? '🔥 Achieved goal!' : '💥 Exceeded goal!'} {/* Note: Prompt says "Exceeded goal!" for 'failed', this might need adjustment based on desired meaning */}
                    {' '}Used <span className="font-bold">{post.durationMinutes}</span> min (Goal: {post.goalMinutes} min)
                  </p>
                  {post.comment && <p className="mt-2 text-gray-700 bg-gray-100 p-3 rounded-md">{post.comment}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end space-x-4">
                <button 
                  onClick={() => handleReaction(post.id!, 'like')}
                  className="flex items-center text-sm text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                  Like ({post.likesCount || 0})
                </button>
                {/* Fire reaction can be added similarly if desired */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
