"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import type { DailyLog } from "@/types";

const moodEmojis = ["😡", "😡", "😡", "😐", "😐", "😐", "🙂", "🙂", "😍", "😍"];

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const todayLabel = format(new Date(), "EEE, MMM d");
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const docId = user ? `${user.uid}_${todayKey}` : "";
  const tasks = useMemo(
    () =>
      profile?.customTasks
        ? Object.entries(profile.customTasks)
            .map(([taskId, task]) => ({ ...task, id: taskId }))
            .sort((a, b) => a.order - b.order)
        : [],
    [profile?.customTasks]
  );

  const [taskCompletion, setTaskCompletion] = useState<Record<string, boolean>>({});
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);
  const [note, setNote] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchLog = async () => {
      try {
        const defaultCompletion: Record<string, boolean> = tasks.reduce((acc, task) => {
          acc[task.id] = false;
          return acc;
        }, {} as Record<string, boolean>);

        if (!docId) return;
        const ref = doc(db, "daily_logs", docId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as DailyLog;
          setTaskCompletion({ ...defaultCompletion, ...(data.taskCompletion || {}) });
          setMoodScore(data.moodScore);
          setNote(data.note || "");
        } else {
          setTaskCompletion(defaultCompletion);
          setMoodScore(undefined);
          setNote("");
        }
      } catch (err) {
        console.error("Failed to load daily log", err);
        setError("無法載入今日資料，請稍後再試。");
      } finally {
        setInitializing(false);
      }
    };

    fetchLog();
  }, [docId, profile, tasks, user]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const persistLog = async () => {
    if (!user || !docId || !hasInteracted) return;
    setError(null);
    try {
      const payload: Partial<DailyLog> = {
        id: docId,
        uid: user.uid,
        date: todayKey,
        taskCompletion,
        updatedAt: serverTimestamp(),
      };

      if (typeof moodScore === "number") {
        payload.moodScore = moodScore;
      }

      const trimmedNote = note.trim();
      if (trimmedNote.length > 0) {
        payload.note = trimmedNote;
      }

      await setDoc(
        doc(db, "daily_logs", docId),
        payload,
        { merge: true }
      );
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1500);
    } catch (err) {
      console.error("Failed to save daily log", err);
      setError("儲存失敗，請稍後再試。");
    }
  };

  const queueSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      persistLog();
    }, 500);
  };

  const handleTaskToggle = (taskId: string) => {
    setHasInteracted(true);
    setTaskCompletion((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      return next;
    });
    queueSave();
  };

  const handleMoodChange = (value: number) => {
    setHasInteracted(true);
    setMoodScore(value);
    queueSave();
  };

  const handleNoteChange = (value: string) => {
    setHasInteracted(true);
    setNote(value.slice(0, 140));
    queueSave();
  };

  const moodLabel = moodScore ? moodEmojis[Math.min(10, Math.max(1, moodScore)) - 1] : "–";

  const disabled = loading || initializing || !profile;

  return (
    <div className="space-y-4">
      <div className="card space-y-2 relative">
        {showSaved && <span className="absolute right-4 top-4 text-xs text-emerald-300">Saved</span>}
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
          {tasks.length === 0 && (
            <p className="text-slate-400 text-sm">尚未設定任務，請先完成 Onboarding。</p>
          )}
          {tasks.map((task) => (
            <label key={task.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-white/30 bg-transparent"
                checked={Boolean(taskCompletion[task.id])}
                onChange={() => handleTaskToggle(task.id)}
                disabled={disabled}
              />
              <span>{task.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">心情</h2>
          <span className="text-xl" aria-label="mood">
            {moodLabel}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={moodScore ?? 5}
          onChange={(e) => handleMoodChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-purple-400"
        />
      </div>

      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">備註</h2>
          <span className="text-xs text-slate-400">最多 140 字</span>
        </div>
        <textarea
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="寫下一句今天的觀察或想法"
          maxLength={140}
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
}
