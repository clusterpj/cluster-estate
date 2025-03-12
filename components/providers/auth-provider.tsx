'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { defaultLocale } from '@/config/i18n'

type UserProfile = {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  updated_at: string
}

type AuthContextType = {
  supabase: ReturnType<typeof createClientComponentClient>;
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{ error: any, data: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for ID:', userId)
      
      // First, try to get the profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching profile from database:', error.message)
        
        // If we couldn't get the profile, check if we need to create one
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log('No profile found. Attempting to create a new profile.')
          
          // Create a new profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: 'user', // Default role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating new profile:', createError.message)
            return null
          }
          
          console.log('Created new profile:', newProfile)
          return newProfile as UserProfile
        }
        
        return null
      }
      
      console.log('Profile fetched successfully:', profile)
      return profile as UserProfile
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error)
      return null
    }
  }

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      console.log('Refreshing session...')
      
      // Track retry attempts for exponential backoff
      let retryCount = 0;
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second initial delay
      
      const executeRefresh = async (): Promise<any> => {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          // If we get a rate limit error, implement exponential backoff
          if (error && (
              error.message.includes('rate limit') || 
              error.message.includes('429') ||
              (error as any).code === 'over_request_rate_limit'
            )) {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
              console.log(`Rate limit hit. Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
              
              return new Promise(resolve => {
                setTimeout(async () => {
                  resolve(await executeRefresh());
                }, delay);
              });
            } else {
              console.error('Rate limit exceeded after maximum retry attempts');
              throw {
                code: 'rate_limit_exceeded',
                message: 'Too many authentication requests. Please try again later or sign out and sign back in.'
              };
            }
          }
          
          return { data, error };
        } catch (err) {
          return { data: { session: null }, error: err };
        }
      };
      
      const { data: { session: newSession }, error } = await executeRefresh();
      
      if (error) {
        // Handle rate limit errors with a more user-friendly message
        if (error.code === 'rate_limit_exceeded' || error.code === 'over_request_rate_limit') {
          console.error('Authentication rate limit exceeded:', error.message);
          // We could show a toast notification here if we had a toast system
          // For now, just log the error
        } else {
          console.error('Error refreshing session:', error.message);
        }
        return;
      }
      
      if (newSession) {
        console.log('New session obtained:', newSession.user.id);
        setSession(newSession);
        setUser(newSession.user);
        
        // Also refresh the profile
        const profile = await fetchUserProfile(newSession.user.id);
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        console.log('No active session found during refresh');
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
    }
  }

  // Function to refresh just the profile
  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!user) {
      console.log('Cannot refresh profile: No user logged in')
      return null
    }
    
    try {
      const profile = await fetchUserProfile(user.id)
      if (profile) {
        setUserProfile(profile)
        return profile
      }
      return null
    } catch (error) {
      console.error('Error refreshing profile:', error)
      return null
    }
  }

  // Initialize: Check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          // Handle rate limit errors specifically
          if (error.message.includes('rate limit') || 
              error.message.includes('429') || 
              (error as any).code === 'over_request_rate_limit') {
            console.warn('Rate limit hit during auth initialization. Will retry on next page load.')
          } else {
            console.error('Error getting session:', error.message)
          }
          setIsLoading(false)
          return
        }
        
        if (currentSession) {
          console.log('Session found during initialization:', currentSession.user.id)
          setSession(currentSession)
          setUser(currentSession.user)
          
          // Fetch the user's profile
          const profile = await fetchUserProfile(currentSession.user.id)
          if (profile) {
            setUserProfile(profile)
          }
        } else {
          console.log('No session found during initialization')
        }
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id)
        
        try {
          if (event === 'SIGNED_IN' && newSession) {
            setSession(newSession)
            setUser(newSession.user)
            
            // Fetch user profile when signed in
            const profile = await fetchUserProfile(newSession.user.id)
            if (profile) {
              setUserProfile(profile)
            }
            
            // Refresh the page to ensure all server components get the updated session
            router.refresh()
          } else if (event === 'SIGNED_OUT') {
            setSession(null)
            setUser(null)
            setUserProfile(null)
            
            // Refresh the page to ensure all server components get the updated session
            router.refresh()
          } else if (event === 'TOKEN_REFRESHED' && newSession) {
            console.log('Token refreshed, updating session')
            setSession(newSession)
          } else if (event === 'USER_UPDATED' && newSession) {
            console.log('User updated, updating session')
            setSession(newSession)
            setUser(newSession.user)
          }
        } catch (error) {
          // Handle errors in the auth state change handler
          if (error instanceof Error && 
              (error.message.includes('rate limit') || 
               error.message.includes('429'))) {
            console.warn('Rate limit hit during auth state change handling:', error.message)
          } else {
            console.error('Error handling auth state change:', error)
          }
        }
      }
    )
    
    // Clean up the subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      return { error }
    } catch (error) {
      console.error('Error during sign in:', error)
      return { error }
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      
      return { data, error }
    } catch (error) {
      console.error('Error during sign up:', error)
      return { data: null, error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      console.log('Signing out...')
      
      // Clear state first to ensure UI updates even if the signOut call fails
      setSession(null)
      setUser(null)
      setUserProfile(null)
      
      try {
        // Attempt to sign out from Supabase
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        
        if (error) {
          // Handle rate limit errors specifically
          if (error.message.includes('rate limit') || 
              error.message.includes('429') || 
              (error as any).code === 'over_request_rate_limit') {
            console.warn('Rate limit hit during sign out. Session cleared locally but server-side session may persist.')
            // Continue with redirect despite the error
          } else {
            console.error('Error during sign out:', error)
            // Continue with redirect despite the error
          }
        }
      } catch (error) {
        console.error('Exception during sign out:', error)
        // Continue with redirect despite the error
      }
      
      // Redirect to logout page instead of home
      const locale = window.location.pathname.split('/')[1] || defaultLocale
      router.push(`/${locale}/auth/logout`)
    } catch (error) {
      console.error('Unexpected error during sign out flow:', error)
      
      // As a fallback, try to redirect anyway
      try {
        const locale = window.location.pathname.split('/')[1] || defaultLocale
        router.push(`/${locale}/auth/logout`)
      } catch (e) {
        console.error('Failed to redirect after sign out error:', e)
      }
    }
  }

  const value = {
    supabase,
    user,
    userProfile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}