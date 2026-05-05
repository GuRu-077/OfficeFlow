'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Room, Meeting, Resource } from '@/lib/types';
import { 
  Users, DoorOpen, MonitorSpeaker, CalendarCheck, 
  AlertTriangle, Clock, ChevronRight, CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isToday, isAfter, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [r, res, m] = await Promise.all([
        db.getRooms(),
        db.getResources(),
        db.getMeetings()
      ]);
      setRooms(r);
      setResources(res);
      setMeetings(m);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const upcomingMeetings = meetings
    .filter(m => m.status === 'confirmed' || m.status === 'approved')
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
    .slice(0, 5);

  const pendingApprovals = meetings.filter(m => m.status === 'pending');

  const chartData = [
    { name: 'Mon', bookings: 4 },
    { name: 'Tue', bookings: 7 },
    { name: 'Wed', bookings: 5 },
    { name: 'Thu', bookings: 8 },
    { name: 'Fri', bookings: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening in your office today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button 
            onClick={() => router.push('/dashboard/calendar')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View Schedule
          </button>
          <button 
            onClick={() => router.push('/dashboard/meetings/new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            Book a Room
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Rooms" 
          value={rooms.length.toString()} 
          subtitle={`${rooms.filter(r => r.availability === 'available').length} available now`}
          icon={<DoorOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} 
          trend="+2"
        />
        <KPICard 
          title="Total Resources" 
          value={resources.length.toString()} 
          subtitle={`${resources.reduce((acc, curr) => acc + curr.availableCount, 0)} available now`}
          icon={<MonitorSpeaker className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />} 
        />
        <KPICard 
          title="Meetings Today" 
          value={meetings.filter(m => m.date === format(new Date(), 'yyyy-MM-dd')).length.toString()} 
          subtitle="2 require your attention"
          icon={<CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />} 
        />
        <KPICard 
          title="Pending Approvals" 
          value={pendingApprovals.length.toString()} 
          subtitle={pendingApprovals.length > 0 ? 'Requires action' : 'All caught up'}
          icon={<Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />} 
          alert={pendingApprovals.length > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Room Utilization This Week</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="bookings" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Meetings List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
              <button 
                onClick={() => router.push('/dashboard/calendar')}
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map(meeting => {
                  const room = rooms.find(r => r.id === meeting.roomId);
                  return (
                    <div key={meeting.id} className="px-6 py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        <span className="text-xs font-bold uppercase">{format(parseISO(meeting.date), 'MMM')}</span>
                        <span className="text-lg font-bold leading-none">{format(parseISO(meeting.date), 'dd')}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{meeting.title}</h3>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-2">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.startTime} - {meeting.endTime}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {room?.name || 'Unknown Room'}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No upcoming meetings</p>
                  <p className="text-sm text-gray-400 mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Alerts & Notifications */}
        <div className="space-y-6">
          {/* Conflict Alerts */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-base font-semibold text-red-900 dark:text-red-300">Action Required</h2>
            </div>
            <p className="text-sm text-red-800 dark:text-red-400 mb-4">
              There is a scheduling conflict in <strong>Boardroom A</strong> for the Q3 Planning Meeting.
            </p>
            <button 
              onClick={() => router.push('/dashboard/calendar')}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Resolve Conflict
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/dashboard/meetings/new')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 text-left border border-transparent dark:border-gray-600"
              >
                <CalendarCheck className="w-5 h-5 text-indigo-500" />
                Schedule New Meeting
              </button>
              <button 
                onClick={() => router.push('/dashboard/resources')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 text-left border border-transparent dark:border-gray-600"
              >
                <MonitorSpeaker className="w-5 h-5 text-emerald-500" />
                Request Resources
              </button>
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button 
                  onClick={() => router.push('/dashboard/approvals')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 text-left border border-transparent dark:border-gray-600"
                >
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                  Review Approvals
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, icon, trend, alert }: { title: string, value: string, subtitle: string, icon: React.ReactNode, trend?: string, alert?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${alert ? 'border-orange-300 dark:border-orange-500/50' : 'border-gray-100 dark:border-gray-700'} relative overflow-hidden`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${alert ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">{subtitle}</span>
        {trend && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}
