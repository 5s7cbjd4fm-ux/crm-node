# Cap Finance Desk CRM

## Overview

A CRM application in French for mortgage brokers ("mandataires Cap Finance") to manage prospects, clients, services, and sales. The system tracks client relationships, service offerings, and financial transactions with comprehensive commission calculations. Built with a React frontend and Express backend, using PostgreSQL for data persistence.

## Recent Changes

- **2026-02-03**: Custom email/password authentication system
  - Users register with email, password, and optional name
  - Login with email/password (passwords hashed with bcrypt)
  - All API routes protected with isAuthenticated middleware
  - Landing page with login/register form for unauthenticated users
  - User profile and logout button in sidebar
- **2026-02-03**: Improved responsive design for mobile
  - Tables have horizontal scroll on small screens
  - Mobile menu toggle in header
  - All forms and controls mobile-friendly
- **2026-02-03**: Added commission features to Sales form:
  - Commission rate (default 3.5%) or fixed amount override
  - Split sale functionality with customizable ratio (30%-70%)
  - Partner name tracking for split sales
  - Real-time commission calculation preview
- **2026-02-03**: Dashboard now displays "Mes commissions" showing total commissions after split
- **2026-02-03**: All monetary values stored in cents (integer) for precision

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom theme variables and dark mode support
- **Charts**: Recharts for dashboard visualizations
- **Form Validation**: Zod schemas with react-hook-form resolvers

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **API Design**: RESTful endpoints with Zod validation
- **Build System**: Vite for frontend, esbuild for server bundling
- **Development**: tsx for TypeScript execution, Vite HMR for hot reloading

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command
- **Validation**: drizzle-zod for schema-to-Zod conversion

### Project Structure
```
client/          # React frontend
  src/
    components/  # Reusable UI components
    pages/       # Route pages
    hooks/       # Custom React hooks (data fetching)
    lib/         # Utilities
server/          # Express backend
  routes.ts      # API route handlers
  storage.ts     # Database operations
  db.ts          # Database connection
shared/          # Shared code
  schema.ts      # Drizzle database schemas
  routes.ts      # API route definitions with Zod schemas
```

### Key Design Patterns
- **Shared Types**: Database schemas and API contracts defined once in `shared/` folder
- **Type-safe API**: Zod schemas validate both request inputs and response outputs
- **Query Hooks**: Each entity has dedicated hooks (use-clients.ts, use-prospects.ts, etc.)
- **Component Composition**: AppLayout wraps all pages, PageShell provides consistent structure

## External Dependencies

### Database
- **PostgreSQL**: Primary data store
- **Connection**: Via `DATABASE_URL` environment variable
- **Session Store**: connect-pg-simple for Express sessions

### Third-Party Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Recharts**: Dashboard charts and visualizations
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation
- **class-variance-authority**: Component variant styling

### Development Tools
- **Vite**: Frontend build and dev server
- **Drizzle Kit**: Database schema management
- **TypeScript**: Full stack type safety