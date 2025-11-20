"use client";

import { format } from "date-fns";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { profile } = useAuth();
  const todayLabel = format(new Date(), "EEE, MMM d");
  const tasks = profile?.customTasks ? Object.values(profile.customTasks).sort((a, b) => a.order - b.order) : [];

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <div className="flex justify-between items-center text-sm text-slate-300">
          <span>{todayLabel}</span>
          <span>{profile?.displayName || "Friend"}</span>
        </div>
        <h1 className="page-title">今日面板</h1>
        <p className="text-slate-400 text-sm">快速勾選行為、滑動心情、留下 140 字以內的備註。</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">你的任務</h2>
        <div className="space-y-2">
          {tasks.length === 0 && <p className="text-slate-400 text-sm">尚未設定任務，請先完成 Onboarding。</p>}
          {tasks.map((task) => (
            <div key={task.label} className="flex items-center gap-3">
              <input type="checkbox" className="size-4 rounded border-white/30 bg-transparent" />
              <span>{task.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold">心情 & 備註</h2>
        <div className="flex flex-col gap-3">
          <input type="range" min={1} max={10} defaultValue={7} className="w-full" />
          <textarea
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Anything notable today?"
            maxLength={140}
          />
          <p className="text-xs text-slate-400">真實寫入邏輯將在後續任務中完成。</p>
        </div>
      </div>
    </div>
  );
}
