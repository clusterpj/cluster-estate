# System Architecture Diagram

```mermaid
graph TD
    subgraph Frontend
        A[Next.js App] --> B[Pages]
        A --> C[Components]
        A --> D[Hooks]
        A --> E[State Management]
        
        B --> F[Property Search]
        B --> G[Booking Management]
        B --> H[Admin Dashboard]
        
        C --> I[UI Components]
        C --> J[Forms]
        C --> K[Animations]
        
        D --> L[usePropertySearch]
        D --> M[useCalendarSync]
        D --> N[useBookingStatus]
        
        E --> O[Zustand Stores]
    end
    
    subgraph Backend
        P[Supabase] --> Q[Database]
        P --> R[Auth]
        P --> S[Storage]
        P --> T[Realtime]
        
        U[API Routes] --> V[Property API]
        U --> W[Booking API]
        U --> X[Calendar API]
    end
    
    subgraph External Services
        Y[PayPal] --> Z[Payment Processing]
        AA[iCal Feeds] --> AB[Calendar Sync]
        AC[Email Service] --> AD[Notifications]
    end
    
    A -->|API Calls| U
    U -->|Data Access| P
    P -->|External Integrations| Y
    P -->|External Integrations| AA
    P -->|External Integrations| AC
    
    style A fill:#4f46e5,color:#fff
    style P fill:#10b981,color:#fff
    style Y fill:#f59e0b,color:#000
    style AA fill:#f59e0b,color:#000
    style AC fill:#f59e0b,color:#000
```

## Diagram Components

### Frontend
- **Next.js App**: Core application framework
- **Pages**: Route-based page components
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for business logic
- **State Management**: Global state management with Zustand

### Backend
- **Supabase**: Backend-as-a-service platform
- **Database**: PostgreSQL database
- **Auth**: Authentication services
- **Storage**: File storage
- **Realtime**: Real-time updates
- **API Routes**: Custom API endpoints

### External Services
- **PayPal**: Payment processing
- **iCal Feeds**: Calendar synchronization
- **Email Service**: Notification system