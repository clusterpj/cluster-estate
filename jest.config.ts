import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/cypress/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/cypress/',
    '/tests/',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/cypress/**',
    '!**/tests/**',
    '!**/*.d.ts',
  ],
}

export default config
