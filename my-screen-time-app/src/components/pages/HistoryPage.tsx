import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLogs } from '../../hooks/useLogs';
import { DailyLog } from '../../types/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper to get days in a month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
// Helper to get the first day of the month (0=Sun, 1=Mon, ...)
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const HistoryPage: React.FC = () => {
  const { authState } = useAuth();
  const { getDailyLogsForMonth } = useLogs();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-11
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authState.user) {
      setIsLoading(true);
      getDailyLogsForMonth(year, month + 1) // Firestore month is 1-12
        .then(setLogs)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [authState.user, year, month, getDailyLogsForMonth]);

  const monthDataForChart = useMemo(() => {
    return logs.map(log => ({
      name: log.date.split('-')[2], // Day of the month
      usage: log.durationMinutes,
      goal: log.goalMinutes,
    })).sort((a,b) => parseInt(a.name) - parseInt(b.name));
  }, [logs]);

  const calendarDays = useMemo(() => {
     const daysInMonth = getDaysInMonth(year, month);
     const firstDay = getFirstDayOfMonth(year, month);
     const daysArray = [];

     for (let i = 0; i < firstDay; i++) {
         daysArray.push(<div key={`empty-${i}`} className="border p-2 h-24"></div>);
     }

     for (let day = 1; day <= daysInMonth; day++) {
         const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
         const logForDay = logs.find(log => log.date === dateStr);
         let bgColor = "bg-white";
         if (logForDay) {
             bgColor = logForDay.achieved ? "bg-green-100" : "bg-red-100";
         }
         daysArray.push(
             <div key={day} className={`border p-2 h-24 ${bgColor}`}>
                 <div className="font-semibold">{day}</div>
                 {logForDay && (
                     <div className="text-xs">
                         <p>{logForDay.durationMinutes} / {logForDay.goalMinutes} min</p>
                         {logForDay.achieved ? <span className="text-green-600">🔥</span> : <span className="text-red-600">💥</span>}
                     </div>
                 )}
             </div>
         );
     }
     return daysArray;
  }, [year, month, logs]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (!authState.user) return <div className="p-4">Please sign in to view history.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Usage History</h1>

        <div className="mb-6 flex items-center justify-center space-x-4 p-4 bg-white rounded-xl shadow-lg">
          <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">‹ Prev</button>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="p-2 border rounded-md">
            {monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-2 border rounded-md">
            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Next ›</button>
        </div>
        
        <div className="mb-12 bg-white p-6 rounded-xl shadow-lg">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">{monthNames[month]} {year} - Calendar View</h2>
             <div className="grid grid-cols-7 gap-px border-l border-t">
                 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(dayName => (
                     <div key={dayName} className="text-center font-medium p-2 border-r border-b bg-gray-100">{dayName}</div>
                 ))}
                 {calendarDays}
             </div>
        </div>

        <div className="h-96 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">{monthNames[month]} {year} - Daily Usage Chart</h2>
          {isLoading ? <p>Loading chart data...</p> : logs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthDataForChart} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#8884d8" name="Actual Usage (min)" />
                <Bar dataKey="goal" fill="#82ca9d" name="Goal (min)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p>No data available for this month to display the chart.</p>}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
