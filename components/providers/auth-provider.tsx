'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
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
  refreshProfile: () => Promise<void>
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Enhanced profile caching system
  const profileCache = new Map<string, UserProfile>()
  const profileCacheExpiry = new Map<string, number>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache duration
  const fetchInProgress = useRef<{[key: string]: boolean}>({})

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent concurrent fetches for the same user
    if (fetchInProgress.current[userId]) {
      return null
    }

    // Check cache and expiry
    const cacheExpiry = profileCacheExpiry.get(userId)
    if (cacheExpiry && Date.now() < cacheExpiry) {
      return profileCache.get(userId)
    }

    // Clear expired cache
    if (cacheExpiry && Date.now() >= cacheExpiry) {
      profileCache.delete(userId)
      profileCacheExpiry.delete(userId)
    }

    // Return cached profile if available
    if (profileCache.has(userId)) {
      return profileCache.get(userId)!
    }

    try {
      fetchInProgress.current[userId] = true
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        delete fetchInProgress.current[userId]
        console.error('Error fetching user profile:', error)
        return null
      }

      if (profile) {
        // Cache the profile with expiration
        profileCache.set(userId, profile)
        profileCacheExpiry.set(userId, Date.now() + CACHE_DURATION)
      }
      
      delete fetchInProgress.current[userId]
      return profile
    } catch (error) {
      delete fetchInProgress.current[userId]
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [supabase])

  const refreshProfile = async () => {
    if (!user) return
    const profile = await fetchUserProfile(user.id)
    if (profile) setUserProfile(profile)
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      if (session?.user) {
        setUser(session.user)
        const profile = await fetchUserProfile(session.user.id)
        if (profile) setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
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
        const profile = await fetchUserProfile(session.user.id)
        if (profile) setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (profile) setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [fetchUserProfile])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id)
      if (profile) setUserProfile(profile)
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
    // Clear cache on signout
    profileCache.clear()
    profileCacheExpiry.clear()
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
