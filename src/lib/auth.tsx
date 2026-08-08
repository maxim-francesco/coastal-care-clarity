import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "./supabase.client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined" || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      const initialSession = res.data.session;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, activeSession: Session | null) => {
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error("Supabase client is not initialized.") };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error("Supabase client is not initialized.") };
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
