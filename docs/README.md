Cluster Estate - Real Estate Application Documentation
Architecture Overview
Tech Stack
Frontend: Next.js 14 (App Router) with TypeScript
UI: Radix UI primitives + shadcn/ui components
Styling: Tailwind CSS
Backend: Supabase (PostgreSQL + Authentication)
State Management: React Hooks + Context
Internationalization: next-intl
Core Features
Internationalization (i18n)
Supports 4 languages: English (default), Spanish, French, German
Uses dynamic route segments with [locale]
Translations stored in JSON files under messages/
Client-side language switching capability
Authentication & Authorization
Supabase authentication integration
Role-based access control (user, agent, admin)
Protected routes with middleware
Custom auth provider for global state management
Login/Register flows with email/password
Property Management
Complete CRUD operations for properties
Property status management (available, pending, sold)
Image upload and management
Rich property details (price, location, features, etc.)
Row Level Security (RLS) for data protection
Database Schema
Properties table:
Core property details (title, description, price)
Location and specifications (bedrooms, bathrooms, square feet)
Status tracking and image management
User relationship for ownership
Profiles table:
Extended user information
Role management
Automatic profile creation on signup
Admin Dashboard
Property management interface
User management capabilities
Statistical overview
Status updates and property modifications
Responsive data tables with sorting/filtering
UI/UX Features
Responsive design
Dark/light theme support
Toast notifications for user feedback
Loading states and error handling
Modal dialogs for forms
Form validation and error messaging
Security Features
Row Level Security (RLS) policies
Protected API routes
Type-safe database operations
Secure authentication flow
Environment variable protection
Performance Optimizations
Dynamic imports for code splitting
Static page generation where possible
Optimized image handling
Client-side caching strategies
Efficient database queries
This real estate application provides a robust platform for property management with multi-language support, secure authentication, and comprehensive admin capabilities. The architecture follows modern web development practices with a focus on type safety, security, and user experience.