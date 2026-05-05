'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Meeting, Room } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, DoorOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [m, r] = await Promise.all([db.getMeetings(), db.getRooms()]);
      setMeetings(m);
      setRooms(r);
      setLoading(false);
    };
    fetchData();
  }, []);

  const pendingApprovals = meetings.filter(m => m.status === 'pending');
  const pastApprovals = meetings.filter(m => m.status === 'approved' || m.status === 'rejected');

  const handleApproval = async (id: string, newStatus: Meeting['status']) => {
    try {
      await db.updateMeeting(id, { status: newStatus });
      setMeetings(meetings.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage pending meeting requests.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests ({pendingApprovals.length})</h2>
        {pendingApprovals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">There are no pending meeting requests to approve.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingApprovals.map(meeting => {
              const room = rooms.find(r => r.id === meeting.roomId);
              return (
                <div key={meeting.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                        Needs Approval
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Requested {format(parseISO(meeting.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{meeting.title}</h3>
                    {meeting.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{meeting.description}</p>}
                    
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {format(parseISO(meeting.date), 'MMMM d, yyyy')}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {meeting.startTime} - {meeting.endTime}</span>
                      <span className="flex items-center gap-1.5"><DoorOpen className="w-4 h-4" /> {room?.name || 'Unknown Room'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproval(meeting.id, 'rejected')}
                      className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleApproval(meeting.id, 'approved')}
                      className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pastApprovals.length > 0 && (
        <div className="space-y-4 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Decisions</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {pastApprovals.slice(0, 5).map(meeting => (
                <div key={meeting.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{meeting.title}</h4>
                    <span className="text-xs text-gray-500">{format(parseISO(meeting.date), 'MMM d, yyyy')}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${meeting.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
