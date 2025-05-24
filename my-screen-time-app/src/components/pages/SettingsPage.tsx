import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLogs } from '../../hooks/useLogs';
import { UserProfile } from '../../types/firestore';

const SettingsPage: React.FC = () => {
  const { authState } = useAuth();
  const { getUserProfile, updateUserProfile } = useLogs();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    iconURL: '',
    goalMinutesPerDay: 60,
    autoShareTimeline: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authState.user) {
      setIsLoading(true);
      getUserProfile(authState.user.uid)
        .then(userProfile => {
          if (userProfile) {
            setProfile({
              name: userProfile.name || '',
              iconURL: userProfile.iconURL || '',
              goalMinutesPerDay: userProfile.goalMinutesPerDay || 60,
              autoShareTimeline: userProfile.autoShareTimeline || false,
            });
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [authState.user, getUserProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
        setProfile(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(authState.user.uid, {
         name: profile.name,
         iconURL: profile.iconURL,
         goalMinutesPerDay: Number(profile.goalMinutesPerDay) || 60,
         autoShareTimeline: profile.autoShareTimeline,
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3s
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!authState.user) return <div className="p-4">Please sign in to manage settings.</div>;
  if (isLoading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label htmlFor="iconURL" className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
            <input
              type="text"
              name="iconURL"
              id="iconURL"
              value={profile.iconURL}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/icon.png"
            />
          </div>
          <div>
            <label htmlFor="goalMinutesPerDay" className="block text-sm font-medium text-gray-700 mb-1">Daily Goal (minutes)</label>
            <input
              type="number"
              name="goalMinutesPerDay"
              id="goalMinutesPerDay"
              value={profile.goalMinutesPerDay}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center">
             <input
                 id="autoShareTimeline"
                 name="autoShareTimeline"
                 type="checkbox"
                 checked={profile.autoShareTimeline}
                 onChange={handleChange}
                 className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
             />
             <label htmlFor="autoShareTimeline" className="ml-2 block text-sm text-gray-900">
                 Automatically share daily results to timeline
             </label>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          {message && <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
