'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Toaster } from '@/components/ui/toaster'

type AuthContextType = {
  user: User | null
  userProfile: {
    id: string;
    full_name: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null
  loading: boolean
  supabase: ReturnType<typeof createClientComponentClient<Database>>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshSession: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        setUserProfile(profile)
      }

      fetchProfile()
    } else {
      setUserProfile(null)
    }
  }, [user, supabase])

  const refreshProfile = async () => {
    if (!user) return
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error refreshing user profile:', error)
      return
    }

    setUserProfile(profile)
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      if (session?.user) {
        setUser(session.user)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error refreshing user profile:', error)
          return
        }

        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const hasRole = (role: string): boolean => {
    return userProfile?.role === role
  }

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout

    const setupSessionRefresh = (expiresAt: number) => {
      // Clear any existing timer
      if (refreshTimer) clearTimeout(refreshTimer)
      
      // Calculate time until refresh (15 minutes before expiry)
      const refreshTime = expiresAt * 1000 - Date.now() - 15 * 60 * 1000
      
      if (refreshTime > 0) {
        refreshTimer = setTimeout(refreshSession, refreshTime)
      }
    }

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setUser(null)
        setUserProfile(null)
        return
      }

      if (session.expires_at) {
        if (Date.now() > session.expires_at * 1000) {
          await signOut()
          return
        }
        setupSessionRefresh(session.expires_at)
      }
      
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    if (data.user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', data.user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(profile)
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user',
        },
      },
    })
    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          full_name: '',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: null
        })

      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUserProfile(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      supabase, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      refreshSession,
      refreshProfile,
      hasRole
    }}>
      {children}
      <Toaster />
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
