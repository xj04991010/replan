"use client";

import { useEffect } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signInWithGoogle, user, loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      const hasTasks = Object.keys(profile.customTasks || {}).length > 0;
      router.replace(hasTasks ? "/dashboard" : "/onboarding");
    }
  }, [loading, profile, router, user]);

  return (
    <div className="card">
      <div className="text-center space-y-3">
        <div className="text-3xl font-bold">Replan</div>
        <p className="text-slate-300 text-sm">30 seconds a day to see your rhythm.</p>
      </div>
      <button className="btn-primary mt-8" onClick={signInWithGoogle} disabled={loading}>
        <LogIn size={20} />
        Continue with Google
      </button>
      <p className="text-xs text-slate-400 text-center mt-3">MVP: Google Sign-in only.</p>
    </div>
  );
}
