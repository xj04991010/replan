"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import type { DailyLog } from "@/types";

type RangeOption = 7 | 30;

interface ChartPoint {
  date: string;
  completion: number;
  mood?: number | null;
}

export default function HistoryPage() {
  const { user, profile, loading } = useAuth();
  const [range, setRange] = useState<RangeOption>(7);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskCount = useMemo(
    () => (profile?.customTasks ? Object.keys(profile.customTasks).length : 0),
    [profile?.customTasks]
  );

  useEffect(() => {
    if (!user) return;

    const loadLogs = async () => {
      setFetching(true);
      setError(null);
      try {
        const today = new Date();
        const endDate = format(today, "yyyy-MM-dd");
        const startDate = format(subDays(today, range - 1), "yyyy-MM-dd");

        const q = query(
          collection(db, "daily_logs"),
          where("uid", "==", user.uid),
          where("date", ">=", startDate),
          where("date", "<=", endDate),
          orderBy("date", "asc")
        );

        const snap = await getDocs(q);
        const docs = snap.docs.map((docSnap) => docSnap.data() as DailyLog);

        const formatted = docs.map((log) => {
          const totalTasks = taskCount || Object.keys(log.taskCompletion || {}).length;
          const completed = Object.values(log.taskCompletion || {}).filter(Boolean).length;
          const completionPct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

          return {
            date: log.date,
            completion: completionPct,
            mood: typeof log.moodScore === "number" ? log.moodScore : null,
          };
        });

        setData(formatted);
      } catch (err) {
        console.error("Failed to load history", err);
        setError("無法取得歷史資料，請稍後再試。");
      } finally {
        setFetching(false);
      }
    };

    loadLogs();
  }, [range, taskCount, user]);

  const isEmpty = data.length < 1;

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h1 className="page-title">歷史 & 趨勢</h1>
        <p className="page-subtitle">任務完成率 + 心情折線，一眼看出你的節奏。</p>

        <div className="flex gap-2">
          {[7, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days as RangeOption)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                range === days ? "bg-white text-black" : "bg-white/5 text-white"
              }`}
              disabled={loading}
            >
              {days === 7 ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        {fetching && <p className="text-sm text-slate-400">載入中...</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}

        {isEmpty && !fetching && !error ? (
          <p className="text-sm text-slate-300">
            從今天開始勾勾你的任務，這裡就會長出你的生活節奏。
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  label={{ value: "Completion %", angle: -90, position: "insideLeft", fill: "#cbd5e1" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  label={{ value: "Mood", angle: 90, position: "insideRight", fill: "#cbd5e1" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="completion"
                  barSize={28}
                  radius={[6, 6, 0, 0]}
                  fill="#a855f7"
                  name="Task Completion %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mood"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                  name="Mood Score"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
