"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";

const placeholders = [
  "閱讀",
  "運動",
  "早睡",
  "散步",
  "深度工作",
  "寫日記",
  "多喝水",
  "伸展",
  "不喝含糖飲料",
  "睡前整理明天",
];

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const [inputs, setInputs] = useState(() => placeholders.map(() => ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const filledTasks = useMemo(
    () => inputs.map((value, index) => ({ value, index })).filter((task) => task.value.trim().length > 0),
    [inputs]
  );

  const readyToStart = filledTasks.length >= 3;

  useEffect(() => {
    if (!loading && profile && Object.keys(profile.customTasks || {}).length > 0) {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  const handleChange = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;

      const nextFilledCount = next.filter((item) => item.trim().length > 0).length;
      if (error && nextFilledCount >= 3) {
        setError(null);
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!readyToStart) {
      setError("至少填入 3 個習慣才能開始。");
      return;
    }

    setSubmitting(true);
    const customTasks = filledTasks.reduce<Record<string, { label: string; active: boolean; order: number }>>(
      (acc, task, idx) => {
        const taskId = `t${idx + 1}`;
        acc[taskId] = {
          label: task.value.trim(),
          active: true,
          order: idx,
        };
        return acc;
      },
      {}
    );

    try {
      await setDoc(doc(db, "users", user.uid), { customTasks }, { merge: true });
      router.push("/dashboard");
    } catch (err) {
      console.error("failed to save onboarding tasks", err);
      setError("儲存時出了點狀況，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="card">
        <p className="text-sm text-slate-400">載入中...</p>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="page-title">建立你的每日節奏</h1>
        <p className="page-subtitle">這 10 個是你之後每天要勾的項目，至少選 3 個最在意的開始。</p>
      </div>
      <div className="space-y-3">
        {placeholders.map((placeholder, index) => (
          <input
            key={placeholder}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={placeholder}
            value={inputs[index]}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        ))}
      </div>
      <div>
        <button
          className="btn-primary"
          disabled={!readyToStart || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Saving..." : "Start"}
        </button>
        <p className="text-xs text-slate-400 mt-2">MVP 階段暫時不能修改任務，請先選你最在意的 3–10 個行為。</p>
        {error ? <p className="text-xs text-red-400 mt-1">{error}</p> : null}
      </div>
    </div>
  );
}
