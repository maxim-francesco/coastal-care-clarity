import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/admin" });
    }
  }, [session, loading, navigate]);

  const handleSignInFlow = async (emailVal: string, passwordVal: string) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const { error } = await signIn(emailVal, passwordVal);
      if (error) {
        setErrorMsg("Incorrect email or password.");
      } else {
        navigate({ to: "/admin" });
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignInFlow(email, password);
  };

  const handleQuickLogin = async () => {
    // DEV/DEMO Quick Login — REMOVE or gate behind import.meta.env.DEV before client handoff (security risk: one-click admin access).
    const quickEmail = "admin@coastalcare.local";
    const quickPassword = "CoastalAdmin2026!";
    setEmail(quickEmail);
    setPassword(quickPassword);
    await handleSignInFlow(quickEmail, quickPassword);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  const inputBase =
    "block w-full min-h-[52px] rounded-[12px] bg-surface border-0 px-4 text-[17px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-[20px] border border-border p-8 md:p-10 shadow-sm rise-in">
        <div className="text-center mb-8">
          <h1 className="h-display text-[28px] md:text-[34px] mb-2">Admin Sign In</h1>
          <p className="text-[15px] text-muted-foreground">
            Sign in to your Coastal Care admin account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-4 text-[15px] text-destructive bg-destructive/10 border border-destructive/20 rounded-[12px] font-medium">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[13px] font-medium text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@coastalcare.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputBase}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-[13px] font-medium text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputBase}
            />
          </div>
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-pill btn-primary cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={submitting}
              className="w-full btn-pill btn-secondary cursor-pointer disabled:opacity-50"
            >
              Quick Login (admin)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
