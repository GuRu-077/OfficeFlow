'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Meeting, Room } from '@/lib/types';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, DoorOpen } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [m, r] = await Promise.all([db.getMeetings(), db.getRooms()]);
      setMeetings(m);
      setRooms(r);
      setLoading(false);
    };
    fetch();
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8 AM to 6 PM

  const getMeetingsForDayAndHour = (day: Date, hour: number) => {
    return meetings.filter(m => {
      if (m.status === 'cancelled') return false;
      const mDate = parseISO(m.date);
      if (!isSameDay(mDate, day)) return false;
      const mHour = parseInt(m.startTime.split(':')[0], 10);
      return mHour === hour;
    });
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800/50';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800/50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  if (loading) {
    return <div className="h-96 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-sm font-semibold text-gray-900 dark:text-white min-w-[120px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors"
          >
            Today
          </button>
        </div>
        
        <Link 
          href="/dashboard/meetings/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </Link>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="p-4 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          {weekDays.map((day, i) => {
            const isToDay = isSameDay(day, new Date());
            return (
              <div key={i} className={`p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-0 ${isToDay ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{format(day, 'EEE')}</div>
                <div className={`mt-1 text-lg font-bold ${isToDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700/50 min-h-[100px]">
              <div className="p-3 border-r border-gray-200 dark:border-gray-700 flex justify-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              
              {weekDays.map((day, dIdx) => {
                const dayMeetings = getMeetingsForDayAndHour(day, hour);
                return (
                  <div key={dIdx} className="p-1 border-r border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors relative group">
                    {dayMeetings.map(m => (
                      <div 
                        key={m.id} 
                        className={`p-2 mb-1 rounded-md border text-xs overflow-hidden ${getStatusColor(m.status)} cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        <div className="font-semibold truncate">{m.title}</div>
                        <div className="truncate opacity-80 mt-0.5">{m.startTime} - {m.endTime}</div>
                        <div className="truncate opacity-80 flex items-center gap-1 mt-0.5"><DoorOpen className="w-3 h-3" /> {rooms.find(r => r.id === m.roomId)?.name}</div>
                      </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Plus className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
