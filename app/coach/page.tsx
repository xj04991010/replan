"use client";

import { useAuth } from "@/components/auth-provider";

export default function CoachPage() {
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro";

  return (
    <div className="card space-y-4">
      <div>
        <h1 className="page-title">AI Coach</h1>
        <p className="page-subtitle">Replan Coach 每週幫你看出行為 x 情緒的模式。</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        {isPro ? "Pro 用戶將看到完整週報內容與生成按鈕。" : "Free 用戶預設看到模糊預覽 + Unlock 按鈕。"}
      </div>
    </div>
  );
}
