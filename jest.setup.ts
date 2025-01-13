import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Jest
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock
