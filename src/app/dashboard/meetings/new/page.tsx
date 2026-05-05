'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Room, Resource, User } from '@/lib/types';
import { Calendar as CalendarIcon, Clock, Users, DoorOpen, MonitorSpeaker, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewMeetingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  const [conflict, setConflict] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [r, res, u] = await Promise.all([
        db.getRooms(),
        db.getResources(),
        db.getUsers()
      ]);
      setRooms(r.filter(room => room.status === 'active'));
      setResources(res.filter(resource => resource.status === 'active'));
      setAllUsers(u.filter(usr => usr.id !== user?.id));
    };
    fetchData();
  }, [user]);

  const checkConflicts = async () => {
    if (!date || !startTime || !endTime || !roomId) return null;
    
    // Simulate real-time conflict check
    const meetings = await db.getMeetings();
    const overlapping = meetings.find(m => {
      if (m.roomId !== roomId) return false;
      if (m.date !== date) return false;
      if (m.status === 'cancelled' || m.status === 'rejected') return false;
      
      const newStart = new Date(`${date}T${startTime}`);
      const newEnd = new Date(`${date}T${endTime}`);
      const mStart = new Date(`${m.date}T${m.startTime}`);
      const mEnd = new Date(`${m.date}T${m.endTime}`);
      
      return (newStart < mEnd && newEnd > mStart);
    });
    
    if (overlapping) {
      return `Conflict: Room is already booked for "${overlapping.title}" from ${overlapping.startTime} to ${overlapping.endTime}.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setConflict(null);
    
    const conflictMsg = await checkConflicts();
    if (conflictMsg) {
      setConflict(conflictMsg);
      setSubmitting(false);
      return;
    }
    
    try {
      await db.createMeeting({
        title,
        description,
        organizerId: user.id,
        participantIds: selectedParticipants,
        roomId,
        resourceIds: selectedResources,
        date,
        startTime,
        endTime,
        status: user.role === 'Admin' || user.role === 'Manager' ? 'confirmed' : 'pending'
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/calendar');
      }, 2000);
    } catch (error) {
      setConflict("An error occurred while creating the meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meeting Scheduled!</h2>
        <p className="text-gray-500 dark:text-gray-400">Redirecting to calendar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Meeting</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Book a room and invite participants.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        
        {conflict && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Scheduling Conflict</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{conflict}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Planning Sync"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    required
                    type="date" 
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setConflict(null); }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start</label>
                  <input 
                    required
                    type="time" 
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setConflict(null); }}
                    className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End</label>
                  <input 
                    required
                    type="time" 
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setConflict(null); }}
                    className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DoorOpen className="h-4 w-4 text-gray-400" />
                </div>
                <select 
                  required
                  value={roomId}
                  onChange={(e) => { setRoomId(e.target.value); setConflict(null); }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white appearance-none"
                >
                  <option value="" disabled>Select a room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name} (Capacity: {room.capacity})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Agenda)</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this meeting about?"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants</label>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
                {allUsers.map(u => (
                  <label key={u.id} className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-0 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={selectedParticipants.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedParticipants([...selectedParticipants, u.id]);
                        else setSelectedParticipants(selectedParticipants.filter(id => id !== u.id));
                      }}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requested Resources</label>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
                {resources.map(res => (
                  <label key={res.id} className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-0 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      disabled={res.availableCount === 0}
                      checked={selectedResources.includes(res.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedResources([...selectedResources, res.id]);
                        else setSelectedResources(selectedResources.filter(id => id !== res.id));
                      }}
                    />
                    <div className="ml-3 flex-1 flex justify-between items-center">
                      <div>
                        <p className={`text-sm font-medium ${res.availableCount === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{res.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{res.type}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${res.availableCount > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {res.availableCount > 0 ? `${res.availableCount} available` : 'Out of stock'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Checking Availability...' : 'Schedule Meeting'}
          </button>
        </div>
      </form>
    </div>
  );
}
