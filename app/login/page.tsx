"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const { signInWithGoogle, user, loading, profile } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const hasTasks = useMemo(
    () => (profile ? Object.keys(profile.customTasks || {}).length > 0 : false),
    [profile]
  );

  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(hasTasks ? "/dashboard" : "/onboarding");
    }
  }, [hasTasks, loading, profile, router, user]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed", error);
      setAuthError("Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="relative space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">Replan</div>
              <p className="text-sm text-slate-300">30 seconds a day. Track your rhythm.</p>
            </div>
          </div>

          <div className="space-y-3 text-slate-200">
            <h1 className="text-xl font-semibold">Behavior x Mood, in one glance.</h1>
            <p className="text-sm text-slate-400">
              Sign in with Google to start your 10-task daily check-in. You&rsquo;ll land on onboarding if you
              haven&rsquo;t set tasks yet.
            </p>
          </div>

          <button
            className="btn-primary mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleGoogleSignIn}
            disabled={loading || signingIn}
          >
            {signingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn size={20} />}
            {signingIn ? "Signing you in..." : "Continue with Google"}
          </button>

          {authError && <p className="text-xs text-red-300">{authError}</p>}
          <p className="text-xs text-slate-500">MVP: Google sign-in only.</p>
        </div>
      </div>
    </div>
  );
}
