# Cluster Estate Coding Conventions

## Core Principles
- Write simple, readable code
- Avoid premature optimization
- Keep components focused and reusable

## TypeScript
- Use TypeScript types for component props and API responses
- Use proper types from @/types/supabase for database operations
- Keep types simple and straightforward

## Components
- Follow Next.js 14 App Router patterns
- Keep components small and focused
- Use Tailwind CSS for styling
- Place reusable UI components in /components/ui
- Place feature components in /components/features

## State Management
- Use React Context for global state
- Use Zustand when needed for complex state
- Keep state management simple and close to where it's used

## Database
- Use typed Supabase queries
- Follow the schema defined in supabase-setup.md
- Implement proper error handling for database operations

## API
- Keep API routes simple and focused
- Use proper error handling
- Implement proper type safety

## Styling
- Use Tailwind CSS
- Follow mobile-first approach
- Use the project's existing color scheme and design patterns

## Testing
- Write tests for critical functionality
- Keep tests simple and meaningful