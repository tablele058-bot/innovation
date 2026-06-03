"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type AttendanceRecord = {
  id: number;
  clerkId: string;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
};

const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  absent: "bg-red-500/20 text-red-400 border-red-500/30",
  late: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  leave: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const STATUS_BG: Record<string, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-yellow-500",
  leave: "bg-blue-500",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AttendancePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, present: 0, absent: 0, late: 0, leave: 0 });
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedStatus, setSelectedStatus] = useState("present");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch(`/api/attendance?clerkId=${userId}&year=${currentYear}&month=${currentMonth + 1}`),
        fetch(`/api/attendance/stats?clerkId=${userId}`),
      ]);
      const recordsData = await recordsRes.json();
      const statsData = await statsRes.json();
      setRecords(recordsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth, currentYear]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleMark = async () => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, status: selectedStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to mark attendance:", err);
    }
  };

  const today = getToday();
  const recordMap = new Map(records.map((r) => [r.date, r.status]));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  if (!isLoaded || !userId) return null;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Attendance</h1>
            <p className="text-sm text-gray-500">Track your daily attendance</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
            <p className="text-xs text-gray-500 mb-1">Present</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.present}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
            <p className="text-xs text-gray-500 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
            <p className="text-xs text-gray-500 mb-1">Late</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.late}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
            <p className="text-xs text-gray-500 mb-1">Leave</p>
            <p className="text-2xl font-bold text-blue-400">{stats.leave}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mark Attendance */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-[#111] border border-[#222]">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Mark Attendance
            </h2>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "present", label: "Present" },
                  { key: "absent", label: "Absent" },
                  { key: "late", label: "Late" },
                  { key: "leave", label: "Leave" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedStatus === key
                        ? STATUS_COLORS[key]
                        : "bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleMark}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-700 transition-all"
            >
              Save
            </button>

            {/* Today's status */}
            {recordMap.has(today) && (
              <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                <p className="text-xs text-gray-500 mb-1">Today</p>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                    STATUS_COLORS[recordMap.get(today)!]
                  }`}
                >
                  {recordMap.get(today)}
                </span>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3 p-6 rounded-xl bg-[#111] border border-[#222]">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-sm font-semibold text-gray-300">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const status = recordMap.get(dateStr);
                const isToday = dateStr === today;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                      isToday
                        ? "ring-1 ring-orange-500"
                        : ""
                    } ${
                      dateStr === selectedDate
                        ? "bg-orange-500/10"
                        : "hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <span className={`text-xs ${isToday ? "text-orange-400 font-semibold" : "text-gray-400"}`}>
                      {day}
                    </span>
                    {status && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${STATUS_BG[status] || "bg-gray-500"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#222]">
              {[
                { key: "present", label: "Present", color: "bg-emerald-500" },
                { key: "absent", label: "Absent", color: "bg-red-500" },
                { key: "late", label: "Late", color: "bg-yellow-500" },
                { key: "leave", label: "Leave", color: "bg-blue-500" },
              ].map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Records Table */}
        <div className="mt-6 p-6 rounded-xl bg-[#111] border border-[#222]">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            Recent Records
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">No attendance records yet</p>
              <p className="text-gray-600 text-xs mt-1">Start by marking your attendance above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222]">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Day</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const d = new Date(record.date + "T00:00:00");
                    const dayName = DAYS[d.getDay()];
                    return (
                      <tr key={record.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                        <td className="py-3 px-2 text-gray-300">{record.date}</td>
                        <td className="py-3 px-2 text-gray-500">{dayName}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                              STATUS_COLORS[record.status] || "text-gray-500"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
