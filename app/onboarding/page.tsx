"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";

const placeholders = [
  "Reading",
  "Workout",
  "Sleep before 12",
  "Walk",
  "Deep work",
  "Journal",
  "Hydrate",
  "Stretch",
  "No sugar",
  "Plan tomorrow",
];

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const [inputs, setInputs] = useState(() => placeholders.map(() => ""));
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const filledTasks = useMemo(
    () => inputs.map((value, index) => ({ value, index })).filter((task) => task.value.trim().length > 0),
    [inputs]
  );

  useEffect(() => {
    if (!loading && profile && Object.keys(profile.customTasks || {}).length > 0) {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  const handleChange = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (filledTasks.length < 3) return;

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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="page-title">建立你的每日節奏</h1>
        <p className="page-subtitle">選出 3–10 個你每天想檢查的行為，之後每天 30 秒快速勾選。</p>
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
          disabled={filledTasks.length < 3 || submitting}
          onClick={handleSubmit}
        >
          Start
        </button>
        <p className="text-xs text-slate-400 mt-2">MVP 暫不支援任務編輯，請先挑出最重要的 3–10 個行為。</p>
      </div>
    </div>
  );
}
