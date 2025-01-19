# Real Estate Platform Development Guidelines

## CRITICAL REQUIREMENTS

Ensure proper implementation of the database schema, row-level security (RLS), and calendar synchronization!

## Core Development Guidelines

### 1. Database Structure

#### Required Patterns
- All tables need proper RLS policies
- Use UUID for primary keys
- Include created_at/updated_at timestamps for new tables or features
- Implement proper foreign key relationships
- Follow existing schema patterns

### 2. Authentication & Authorization

#### Security Requirements
- Implement user role checks
- Use auth.uid() for user queries
- Include RLS policies for CRUD operations
- Follow existing auth patterns in properties/bookings

### 3. Calendar Synchronization (iCal)

#### CRITICAL CALENDAR REQUIREMENTS
- Include timezone info in booking dates
- Reflect property availability in iCal feeds
- Support calendar data import/export
- Handle recurring availability patterns
- Detect booking conflicts

#### iCal Implementation Rules
- Generate unique iCal feed URLs per property
- Include booking details in VEVENT descriptions
- Set proper status codes (CONFIRMED, TENTATIVE, CANCELLED)
- Handle timezone conversions
- Support external calendar imports (Airbnb, VRBO, etc.)

#### Required iCal Properties
```
DTSTART/DTEND: Include timezone
UID: Unique event identifier
SUMMARY: Clear event descriptions
STATUS: Proper booking status
LAST-MODIFIED: Accurate update tracking
SEQUENCE: Version control for updates
```

#### Calendar Sync Requirements
- Real-time availability updates
- Bidirectional sync support
- Conflict resolution handling
- Rate limiting for external syncs
- Error logging and recovery

### 4. Property Management

#### Core Requirements
- Handle sale and rental properties
- Implement status transitions
- Manage property images in storage bucket
- Support multi-currency pricing (default USD)
- Maintain calendar availability state
- Handle timezone-specific pricing
- Support booking blackout dates
- Implement minimum stay rules

### 5. Booking System

#### Booking Requirements
- Validate date ranges for availability
- Calculate prices based on rental frequency
- Handle timezone-aware booking dates
- Implement payment status tracking
- Validate against iCal availability
- Handle cross-timezone bookings
- Support recurring booking patterns
- Implement buffer times between bookings

### 6. UI/UX Excellence & Frontend Components

#### Core UI/UX Principles
- Design for emotion and engagement
- Maintain visual hierarchy and balance
- Ensure smooth animations and transitions
- Create delightful micro-interactions
- Implement skeleton loading states
- Design for accessibility (WCAG 2.1)
- Support dark/light mode seamlessly

#### Component Guidelines
- Use shadcn/ui components consistently
- Follow established Tailwind patterns
- Avoid arbitrary values ([h-500px])
- Maintain responsive design patterns

#### Calendar-Specific Components
- Interactive availability calendar
- Timezone-aware date pickers
- Visual booking conflict indicators
- Calendar sync status indicators

### Implementation Workflow

#### New Features
1. List required database changes
2. Document RLS policies needed
3. List required frontend components
4. Get approval before implementation

#### Calendar Features
1. List required calendar event types
2. Document timezone handling
3. Define sync frequency and methods
4. Get approval before implementation

### Code Review Requirements

#### General Review Checks
- RLS policies are complete
- Auth checks are implemented
- Frontend follows component patterns
- Proper error handling exists
- TypeScript types are defined

#### Calendar-Specific Review Checks
- Proper timezone handling
- Accurate availability calculations
- Correct iCal format implementation
- Proper sync error handling
- Buffer time implementation

### Technical Stack

#### Stack-Specific Rules
- **Database:** PostgreSQL with PostgREST
- **Auth:** Supabase Auth
- **Frontend:** Next.js with React Server Components
- **UI:** shadcn/ui + Tailwind CSS
- **API:** Supabase + tRPC
- **State:** React Query
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + React Testing Library

#### Calendar-Specific Stack Rules
- Use ical-generator for feed creation
- Implement caching for calendar feeds
- Handle DST transitions correctly
- Implement retry logic for syncs
- Use ISO8601 for date handling

### DO NOT
- Skip UX considerations
- Launch without UI testing
- Use inconsistent design patterns
- Skip RLS policies
- Use arbitrary Tailwind values
- Bypass auth checks
- Mix component patterns
- Leave TypeScript any types
- Store dates without timezone info
- Skip availability validation
- Ignore calendar sync errors
- Use local time for bookings

### ALWAYS
- Create delightful user experiences
- Test on multiple devices and browsers
- Optimize for performance
- Get user feedback
- Follow existing patterns
- Document database changes
- Test auth flows
- Validate form inputs
- Handle loading/error states
- Validate calendar feed format
- Test cross-timezone bookings
- Log sync operations
- Handle calendar edge cases
- Document timezone assumptions

### Testing Requirements

#### UI/UX Testing Requirements
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing
- Accessibility testing (WCAG 2.1)
- Performance and user flow testing
- Animation and transition testing
- Dark/light mode testing
- Load testing with slow connections
- Screen reader compatibility
- Keyboard navigation testing

#### Calendar Testing Requirements
- Test DST transition dates
- Verify cross-timezone bookings
- Validate iCal feed format
- Test sync conflict resolution
- Verify booking buffer times

### Database Schema Considerations

#### Calendar Integration Requirements
1. Integrate with existing calendar_sync table
2. Extend bookings schema for calendar support
3. Implement calendar-specific RLS policies
4. Add calendar-related property attributes

### Error Handling

#### Calendar-Specific Error Handling
- Handle sync failures gracefully
- Implement retry mechanisms
- Log all sync operations
- Notify admins of critical sync failures
- Maintain system consistency during failures

### Performance Considerations

#### Calendar Performance Requirements
- Cache iCal feeds appropriately
- Implement rate limiting for external syncs
- Optimize calendar queries
- Handle concurrent booking attempts
- Manage sync queue efficiently