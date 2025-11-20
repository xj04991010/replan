"use client";

export default function HistoryPage() {
  return (
    <div className="card space-y-3">
      <h1 className="page-title">歷史 & 趨勢</h1>
      <p className="page-subtitle">後續將接上 7 / 30 天雙軸圖表（任務完成率 + 心情）。</p>
      <div className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-slate-300">
        Chart placeholder — 等待 daily_logs 接上後串接 Recharts。
      </div>
    </div>
  );
}
