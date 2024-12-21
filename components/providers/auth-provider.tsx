'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Toaster } from '@/components/ui/toaster'

type UserProfile = Database['public']['Tables']['profiles']['Row']
type UserRole = UserProfile['role']

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  supabase: ReturnType<typeof createClientComponentClient<Database>>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshSession: () => Promise<void>
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile data
  // Cache user profiles to reduce database calls
  const profileCache = new Map<string, UserProfile>()

  const fetchUserProfile = async (userId: string) => {
    // Check cache first
    if (profileCache.has(userId)) {
      return profileCache.get(userId)!
    }
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      if (profile) {
        profileCache.set(userId, profile)
      }
      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error refreshing session:', error)
      await signOut()
      return null
    }
  }

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role
  }

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout

    const setupSessionRefresh = (expiresAt: number) => {
      // Clear any existing timer
      if (refreshTimer) clearTimeout(refreshTimer)
      
      // Calculate time until refresh (5 minutes before expiry)
      const refreshTime = expiresAt * 1000 - Date.now() - 5 * 60 * 1000
      
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
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
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
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id)
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
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: 'user',
          },
        ])
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
    <AuthContext.Provider value={{ user, userProfile, loading, supabase, signIn, signUp, signOut, resetPassword }}>
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
