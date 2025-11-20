"use client";

import Image from "next/image";
import { useAuth } from "@/components/auth-provider";

export default function SettingsPage() {
  const { profile, signOutUser } = useAuth();

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        {profile?.photoURL ? (
          <Image src={profile.photoURL} alt={profile.displayName} width={56} height={56} className="rounded-full" />
        ) : (
          <div className="size-14 rounded-full bg-white/10" />
        )}
        <div>
          <div className="font-semibold">{profile?.displayName || "User"}</div>
          <div className="text-sm text-slate-400">{profile?.email}</div>
          <div className="text-xs text-emerald-300">Plan: {profile?.plan || "free"}</div>
        </div>
      </div>

      <button className="btn-primary" onClick={signOutUser}>
        Sign Out
      </button>

      <div className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-slate-300">
        Task Management Coming Soon — MVP 暫不支援任務編輯。
      </div>
    </div>
  );
}
