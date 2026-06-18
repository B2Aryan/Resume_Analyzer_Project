import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { PRESET_AVATARS } from '@/lib/avatars';

type Profile = {
  id: string;
  username?: string;
  avatar_id?: number;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: string;
  profile_confirmed?: boolean;
  created_at?: string;
  updated_at?: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Debug logs
  console.log("AuthProvider state - session:", session, ", user:", user, ", isLoading:", isLoading);

  const refreshProfile = async () => {
    console.log('[AuthContext] ===============================================');
    console.log('[AuthContext] refreshProfile() START');
    console.log('[AuthContext] ===============================================');
    
    if (!user) {
      console.log('[AuthContext] No user, setting profile to null');
      setProfile(null);
      console.log('[AuthContext] refreshProfile() END');
      return;
    }
    console.log('[AuthContext] 1. Current authenticated user id:', user.id);

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('[AuthContext] No supabase client, setting fallback profile');
      setProfile({
        id: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        profile_confirmed: false,
      });
      console.log('[AuthContext] refreshProfile() END');
      return;
    }

    try {
      console.log('AUTH USER ID:', user.id);
      console.log('[AuthContext] 2. Fetching ALL profiles with id = user.id from Supabase...');
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);
      console.log('PROFILE FETCHED:', allProfiles);

      console.log('[AuthContext] ===============================================');
      console.log('[AuthContext] 4. ALL ROWS CURRENTLY IN profiles TABLE FOR THIS USER:');
      console.log('[AuthContext]', allProfiles);
      console.log('[AuthContext] ===============================================');

      console.log('[AuthContext] 3. Id being used in refreshProfile():', user.id);

      if (error) {
        console.log('[AuthContext] Fetch profiles error details:');
        console.log('[AuthContext] - error.code:', error.code);
        console.log('[AuthContext] - error.message:', error.message);
        console.log('[AuthContext] - error.details:', error.details);
        console.log('[AuthContext] - error.hint:', error.hint);
        throw error;
      }

      if (allProfiles && allProfiles.length > 0) {
        console.log('[AuthContext] Found', allProfiles.length, 'profile(s) for user id', user.id);
        // Use the first profile, or the most recently updated one
        const profileToUse = allProfiles.sort((a, b) => 
          new Date(b.updated_at || b.created_at || 0).getTime() - 
          new Date(a.updated_at || a.created_at || 0).getTime()
        )[0];
        console.log('[AuthContext] Using profile:', profileToUse);
        setProfile(profileToUse);
      } else {
        console.log('[AuthContext] No profile found, creating new profile...');
          const insertPayload = { 
            id: user.id, 
            username: user.user_metadata?.full_name || user.email?.split('@')[0] 
          };
          console.log('[AuthContext] Insert payload:', insertPayload);
          
          // Create a new profile if none exists (use upsert to avoid duplicates)
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert(insertPayload)
            .select('*')
            .single();
          
        console.log('[AuthContext] ===============================================');
        console.log('[AuthContext] FULL create profile RESPONSE:');
        console.log('[AuthContext] Response data:', newProfile);
        console.log('[AuthContext] Response error:', insertError);
        console.log('[AuthContext] ===============================================');

        if (insertError) {
          console.log('[AuthContext] Create profile error details:');
          console.log('[AuthContext] - error.code:', insertError.code);
          console.log('[AuthContext] - error.message:', insertError.message);
          console.log('[AuthContext] - error.details:', insertError.details);
          console.log('[AuthContext] - error.hint:', insertError.hint);
        }

        if (!insertError && newProfile) {
          console.log('[AuthContext] New profile created, setting profile');
          setProfile(newProfile);
        } else {
          // If insert fails, set a fallback profile so the app still works
          console.error('[AuthContext] Failed to create profile, setting fallback profile');
          setProfile({
            id: user.id,
            username: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
            profile_confirmed: false,
          });
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching or creating profile (catch block):', err);
      console.error('[AuthContext] Setting fallback profile');
      setProfile({
        id: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        profile_confirmed: false,
      });
    }

    console.log('[AuthContext] refreshProfile() END');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    console.log('[AuthContext] ===============================================');
    console.log('[AuthContext] updateProfile() START');
    console.log('[AuthContext] ===============================================');
    
    console.log('[AuthContext] updateProfile() called with updates:', updates);
    if (!user) {
      console.log('[AuthContext] No user, aborting updateProfile');
      console.log('[AuthContext] updateProfile() END');
      return;
    }
    console.log('[AuthContext] 1. Current authenticated user id:', user.id);
    console.log('[AuthContext] 3. Id being used in updateProfile():', user.id);

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('[AuthContext] No supabase client, aborting updateProfile');
      console.log('[AuthContext] updateProfile() END');
      return;
    }

    // Step 1: Check ALL profile rows for the user
    console.log('[AuthContext] Checking ALL profiles for user id:', user.id);
    const { data: allProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id);

    console.log('[AuthContext] ===============================================');
    console.log('[AuthContext] 4. ALL ROWS CURRENTLY IN profiles TABLE FOR THIS USER:');
    console.log('[AuthContext]', allProfiles);
    console.log('[AuthContext] ===============================================');

    // Step 2: Attempt upsert with detailed logging
    const upsertPayload = {
      id: user.id,
      ...updates,
      profile_confirmed: true,
      updated_at: new Date().toISOString(),
    };
    console.log('[AuthContext] ===============================================');
    console.log('[AuthContext] Upsert PAYLOAD being sent to Supabase:');
    console.log('[AuthContext]', upsertPayload);
    console.log('[AuthContext] ===============================================');

    const { data, error } = await supabase
      .from('profiles')
      .upsert(upsertPayload)
      .select('*')
      .single();

    console.log('[AuthContext] ===============================================');
    console.log('[AuthContext] FULL upsert RESPONSE:');
    console.log('[AuthContext] Response data:', data);
    console.log('[AuthContext] Response error:', error);
    console.log('[AuthContext] ===============================================');

    if (error) {
      console.error('[AuthContext] ===============================================');
      console.error('[AuthContext] Upsert ERROR DETAILS:');
      console.error('[AuthContext] - error.code:', error.code);
      console.error('[AuthContext] - error.message:', error.message);
      console.error('[AuthContext] - error.details:', error.details);
      console.error('[AuthContext] - error.hint:', error.hint);
      console.error('[AuthContext] - Full error object:', error);
      console.error('[AuthContext] ===============================================');
      throw error;
    }

    if (data) {
      console.log('[AuthContext] Profile updated successfully, setting profile state');
      setProfile(data);
    }

    console.log('[AuthContext] updateProfile() END');
  };

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
          console.log("AuthProvider INITIAL SESSION from getSession():", session);
          console.log("AuthProvider setting session/user/isLoading now");
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AUTH EVENT:", event);
      console.log("SESSION:", session);
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

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

  const signInWithPassword = async (email: string, password: string) => {
    console.log('[AuthContext] signInWithPassword called');
    console.log('[AuthContext] Email:', email);
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('[AuthContext] Aborting because supabase is null');
      return;
    }
    try {
      console.log('[AuthContext] Calling supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[AuthContext] signInWithPassword error:', error);
        throw error;
      }
      console.log('[AuthContext] signInWithPassword success! Data:', data);
      console.log('[AuthContext] User:', data.user);
      console.log('[AuthContext] Session:', data.session);
    } catch (error) {
      console.error("[AuthContext] signInWithPassword catch error:", error);
      throw error;
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    console.log('[AuthContext] signUpWithPassword called');
    console.log('[AuthContext] Email:', email);
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('[AuthContext] Aborting because supabase is null');
      return;
    }
    try {
      console.log('[AuthContext] Calling supabase.auth.signUp');
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('[AuthContext] signUpWithPassword error:', error);
        throw error;
      }
      console.log('[AuthContext] signUpWithPassword success! Data:', data);
      console.log('[AuthContext] User:', data.user);
      console.log('[AuthContext] Session:', data.session);
    } catch (error) {
      console.error("[AuthContext] signUpWithPassword catch error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('[AuthContext] resetPassword called');
    console.log('[AuthContext] Email:', email);
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('[AuthContext] Aborting because supabase is null');
      return;
    }
    try {
      console.log('[AuthContext] Calling supabase.auth.resetPasswordForEmail');
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        console.error('[AuthContext] resetPassword error:', error);
        throw error;
      }
      console.log('[AuthContext] resetPassword success! Data:', data);
    } catch (error) {
      console.error("[AuthContext] resetPassword catch error:", error);
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
        profile,
        refreshProfile,
        updateProfile,
        signInWithGoogle,
        signInWithGithub,
        signInWithFacebook,
        signInWithEmailOtp,
        verifyEmailOtp,
        signInWithPassword,
        signUpWithPassword,
        resetPassword,
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
