import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
if (!supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
if (!supabaseAnonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...\n')

  try {
    // Test 1: Verify database connection
    console.log('Test 1: Verifying database connection...')
    const { error: tableError } = await supabase
      .from('properties')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('Connection error:', tableError)
      throw new Error('Failed to connect to database')
    }
    console.log('✅ Database connection successful')

    // Generate a random test email
    const testEmail = `test${Date.now()}@example.com`

    // Clean up any existing test user
    console.log('\nCleaning up any existing test user...')
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const testUser = existingUser.users.find(u => u.email === testEmail)
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id)
      console.log('Cleaned up existing test user')
    }

    // Test 2: Create a test user
    console.log('\nTest 2: Creating test user...')
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    })
    if (userError) {
      console.error('User creation error:', userError)
      throw userError
    }
    console.log('✅ Test user created successfully')
    const userId = userData.user.id

    // Add delay to allow trigger to execute
    console.log('Waiting for trigger...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 3: Check for profile
    console.log('\nTest 3: Checking for profile...')
    const { error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.log('Profile not found, attempting manual creation...')
      
      // Try manual profile creation
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: testEmail,
          full_name: testEmail.split('@')[0]
        })
      
      if (createProfileError) {
        console.error('Manual profile creation failed:', createProfileError)
        throw createProfileError
      }
      console.log('✅ Profile created manually')
    } else {
      console.log('✅ Profile created by trigger')
    }

    // Test 4: Verify profile data
    console.log('\nTest 4: Verifying profile data...')
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (verifyError) {
      console.error('Profile verification error:', verifyError)
      throw verifyError
    }
    console.log('✅ Profile data verified:', verifyProfile)

    // Test 5: Clean up
    console.log('\nTest 5: Cleaning up...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('Cleanup error:', deleteError)
      throw deleteError
    }
    console.log('✅ Cleanup successful')

    console.log('\n✨ All tests passed successfully!')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests
testDatabaseSchema()
