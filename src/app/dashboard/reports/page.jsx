"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  isSameDay,
  subDays,
  isAfter,
} from "date-fns";
import { Download, Filter, TrendingUp, Users, Clock } from "lucide-react";
import { saveCsvLocally } from "@/app/actions/exportCsv";

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#3B82F6",
];

export default function ReportsPage() {
  const [allMeetings, setAllMeetings] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("7days");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  useEffect(() => {
    Promise.all([db.getMeetings(), db.getRooms()]).then(([m, r]) => {
      setAllMeetings(m);
      setRooms(r);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setMeetings(allMeetings);
    } else {
      const days = filter === "7days" ? 7 : 30;
      const cutoff = subDays(new Date(), days);
      setMeetings(
        allMeetings.filter(
          (m) =>
            isAfter(parseISO(m.date), cutoff) ||
            isSameDay(parseISO(m.date), cutoff),
        ),
      );
    }
  }, [allMeetings, filter]);

  const exportCSV = async () => {
    if (meetings.length === 0) {
      setExportStatus("No meetings to export!");
      setTimeout(() => setExportStatus(null), 3000);
      return;
    }
    setExportStatus("Exporting...");
    const headers = [
      "Meeting ID",
      "Title",
      "Date",
      "Start Time",
      "End Time",
      "Room ID",
      "Status",
      "Requested By",
    ];
    const rows = meetings.map((m) => [
      m.id,
      `"${m.title.replace(/"/g, '""')}"`,
      m.date,
      m.startTime,
      m.endTime,
      m.roomId,
      m.status,
      m.requestedBy,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const filename = `officeflow_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`;
    // Save locally via Server Action
    const result = await saveCsvLocally(csvContent, filename);
    if (result.success) {
      setExportStatus(`Saved to project /exports folder!`);
      setTimeout(() => setExportStatus(null), 3000);
    } else {
      setExportStatus(`Error: ${result.error}`);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
    );

  // Calculate metrics
  const totalMeetings = meetings.length;
  const totalHours = meetings.reduce((acc, m) => {
    const start = parseInt(m.startTime.split(":")[0]);
    const end = parseInt(m.endTime.split(":")[0]);
    return acc + (end - start);
  }, 0);

  // Assuming each room is available for 8 hours a day
  const totalAvailableHours = rooms.length * 8;
  const avgUtilization = totalAvailableHours > 0 
    ? Math.min(100, Math.round((totalHours / totalAvailableHours) * 100))
    : 0;

  // Status Distribution
  const statusData = [
    {
      name: "Confirmed",
      value: meetings.filter((m) => m.status === "confirmed").length,
    },
    {
      name: "Pending",
      value: meetings.filter((m) => m.status === "pending").length,
    },
    {
      name: "Cancelled",
      value: meetings.filter((m) => m.status === "cancelled").length,
    },
  ];

  // Room Utilization
  const roomData = rooms
    .map((room) => {
      const count = meetings.filter((m) => m.roomId === room.id).length;
      return { name: room.name, bookings: count };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5); // Top 5

  // Weekly Trend
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i),
  );
  const trendData = weekDays.map((day) => {
    const count = meetings.filter((m) =>
      isSameDay(parseISO(m.date), day),
    ).length;
    return { name: format(day, "EEE"), meetings: count };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Insights into office utilization and booking trends.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
              {filter === "7days"
                ? "Last 7 Days"
                : filter === "30days"
                  ? "Last 30 Days"
                  : "All Time"}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilter("7days");
                      setShowFilterDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filter === "7days" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => {
                      setFilter("30days");
                      setShowFilterDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filter === "30days" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      setFilter("all");
                      setShowFilterDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filter === "all" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                  >
                    All Time
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
      {exportStatus && (
        <div className="flex justify-end -mt-2">
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
            {exportStatus}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Bookings
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalMeetings}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Hours Booked
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalHours}h
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Avg. Utilization
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgUtilization}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Meetings This Week
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B" }}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: "#E2E8F0", strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Utilization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Rooms Utilized
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />

                <Bar
                  dataKey="bookings"
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 w-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Booking Status Overview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Distribution of meeting requests by their current approval and
              confirmation status.
            </p>

            <div className="space-y-4">
              {statusData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
