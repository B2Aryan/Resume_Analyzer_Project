import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log("Supabase client is null");
      setIsLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    console.log('OAuth starting');
    console.log('Supabase URL (env):', import.meta.env.VITE_SUPABASE_URL);
    const supabase = getSupabaseClient();
    console.log("supabase =", supabase);
    console.log("supabase restUrl =", (supabase as any)?.rest?.url);
    console.log("supabase authUrl =", (supabase as any)?.auth?.url);
    if (!supabase) {
      console.log("Aborting because supabase is null");
      return;
    }
    console.log("About to start OAuth");
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log('redirectTo URL:', redirectTo);
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });
      console.log('OAuth result:', result);
      console.log('result.data.url:', result.data.url);
    } catch (error) {
      console.error("OAuth Error:", error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    console.log('OAuth starting');
    console.log('Supabase URL (env):', import.meta.env.VITE_SUPABASE_URL);
    const supabase = getSupabaseClient();
    console.log("supabase =", supabase);
    console.log("supabase restUrl =", (supabase as any)?.rest?.url);
    console.log("supabase authUrl =", (supabase as any)?.auth?.url);
    if (!supabase) {
      console.log("Aborting because supabase is null");
      return;
    }
    console.log("About to start OAuth");
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log('redirectTo URL:', redirectTo);
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectTo
        }
      });
      console.log('OAuth result:', result);
      console.log('result.data.url:', result.data.url);
    } catch (error) {
      console.error("OAuth Error:", error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    console.log('OAuth starting');
    console.log('Supabase URL (env):', import.meta.env.VITE_SUPABASE_URL);
    const supabase = getSupabaseClient();
    console.log("supabase =", supabase);
    console.log("supabase restUrl =", (supabase as any)?.rest?.url);
    console.log("supabase authUrl =", (supabase as any)?.auth?.url);
    if (!supabase) {
      console.log("Aborting because supabase is null");
      return;
    }
    console.log("About to start OAuth");
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log('redirectTo URL:', redirectTo);
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectTo
        }
      });
      console.log('OAuth result:', result);
      console.log('result.data.url:', result.data.url);
    } catch (error) {
      console.error("OAuth Error:", error);
      throw error;
    }
  };

  const signInWithEmailOtp = async (email: string) => {
    console.log('Signing in with email OTP');
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log("Aborting because supabase is null");
      return;
    }
    console.log('Sending OTP to email:', email);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        console.error('Error sending OTP:', error);
        throw error;
      }
      console.log('OTP sent successfully');
    } catch (error) {
      console.error("OTP Error:", error);
      throw error;
    }
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    console.log('Verifying OTP');
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log("Aborting because supabase is null");
      return;
    }
    console.log('Verifying OTP for email:', email);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      if (error) {
        console.error('Error verifying OTP:', error);
        throw error;
      }
      console.log('OTP verified successfully');
    } catch (error) {
      console.error("OTP Verification Error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signInWithGoogle,
        signInWithGithub,
        signInWithFacebook,
        signInWithEmailOtp,
        verifyEmailOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
