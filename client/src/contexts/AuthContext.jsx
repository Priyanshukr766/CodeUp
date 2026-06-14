import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session and dbUser
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchDbUser(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchDbUser(session.user);
      } else {
        setDbUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchDbUser = async (sessionUser) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching db user:', error);
    }
    
    // If user doesn't exist in DB yet, create them
    if (!data && sessionUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
          id: sessionUser.id, 
          email: sessionUser.email, 
          name: sessionUser.user_metadata?.full_name 
        }])
        .select()
        .single();
        
      if (!createError) {
        setDbUser(newUser);
      } else {
        console.error('Error creating db user:', createError);
      }
    } else {
      setDbUser(data);
    }
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const syncCodeforcesHandle = async (handle) => {
    if (!user) return { error: 'Not logged in' };
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await axios.post('/api/auth/sync', 
        { handle },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      // Refresh DB user to get the new cf_handle
      await fetchDbUser(user);
      return { success: true, count: res.data.count };
    } catch (err) {
      return { error: err.response?.data?.error || err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      loading,
      loginWithGoogle,
      logout,
      syncCodeforcesHandle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
