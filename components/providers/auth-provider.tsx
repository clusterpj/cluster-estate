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
      const { data: { session: newSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error refreshing session:', error.message)
        return
      }
      
      if (newSession) {
        console.log('New session obtained:', newSession.user.id)
        setSession(newSession)
        setUser(newSession.user)
        
        // Also refresh the profile
        const profile = await fetchUserProfile(newSession.user.id)
        if (profile) {
          setUserProfile(profile)
        }
      } else {
        console.log('No active session found during refresh')
        setSession(null)
        setUser(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Unexpected error refreshing session:', error)
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
          console.error('Error getting session:', error.message)
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
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear state
      setSession(null)
      setUser(null)
      setUserProfile(null)
      
      // Redirect to logout page instead of home
      const locale = window.location.pathname.split('/')[1] || 'en'
      router.push(`/${locale}/auth/logout`)
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  const value = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}