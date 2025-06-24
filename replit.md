# Islamic Social Platform - Architecture Overview

## Overview

This is a full-stack Islamic social media platform built with modern web technologies. The application serves as a community platform for Islamic content sharing, dua requests, events, and community building. The architecture follows a clean separation between client, server, and shared components with a focus on scalability and maintainability.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: React Router for client-side navigation
- **State Management**: React Context API for global state (Auth, Theme)
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Database**: Supabase PostgreSQL (fully migrated from dual storage)
- **ORM**: Supabase client with direct database operations
- **Authentication**: Supabase Auth integration
- **Storage**: Supabase-only storage implementation with RPC functions

### Data Layer
- **Primary Database**: Supabase PostgreSQL with direct client operations
- **Production Ready**: Full Supabase integration with RLS policies
- **Schema Management**: Supabase migrations with SQL scripts
- **Type Safety**: Shared TypeScript schemas between client and server
- **Real-time**: Supabase real-time subscriptions for live updates

## Key Components

### 1. Authentication System
- **Provider**: Supabase Auth (with fallback to mock authentication)
- **User Management**: Role-based access control (user, admin, moderator)
- **Session Handling**: Automatic token management and refresh
- **Demo Mode**: Mock authentication for development without Supabase

### 2. Theme System
- **Multi-theme Support**: Light, Dark, Islamic, and Ramadan themes
- **Dynamic Switching**: Runtime theme changes with localStorage persistence
- **CSS Variables**: Theme-aware color system using CSS custom properties
- **Responsive Design**: Mobile-first approach with Tailwind utilities

### 3. Content Management
- **Posts**: Text, image, and video content with categories and tags
- **Dua Requests**: Community prayer requests with urgency levels
- **Comments**: Nested commenting system with real-time updates
- **Interactions**: Likes, bookmarks, and sharing functionality

### 4. Community Features
- **Communities**: User-created groups with membership management
- **Events**: Event creation and attendance tracking
- **Notifications**: Real-time notification system
- **Messaging**: Direct messaging between users

### 5. Admin Panel
- **Content Moderation**: Post and comment management
- **User Management**: Ban/unban functionality
- **Analytics**: Basic statistics and reporting
- **System Settings**: Platform configuration options

## Data Flow

### 1. Authentication Flow
1. User attempts login/signup
2. Credentials validated against Supabase or mock system
3. JWT token stored in localStorage
4. User context updated across application
5. Protected routes enabled based on authentication state

### 2. Content Creation Flow
1. User creates content through forms
2. Data validated on client-side
3. API request sent to backend
4. Database operations performed via Drizzle ORM
5. Real-time updates propagated to other users
6. Local state updated for immediate UI feedback

### 3. Real-time Updates
1. Event emitter system for client-side updates
2. Local storage synchronization for demo mode
3. Planned WebSocket integration for production
4. Optimistic UI updates for better user experience

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@supabase/supabase-js**: Authentication and database client
- **@tanstack/react-query**: Server state management and caching

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite development server with instant updates
- **Database**: PostgreSQL 16 module in Replit
- **Port Configuration**: Application runs on port 5000

### Production Build
1. **Frontend**: Vite builds optimized static assets
2. **Backend**: ESBuild bundles server code for Node.js
3. **Database**: Drizzle migrations applied automatically
4. **Deployment**: Configured for autoscale deployment target

### Environment Configuration
- **NODE_ENV**: Environment-specific behavior
- **DATABASE_URL**: PostgreSQL connection string
- **Supabase Keys**: Authentication service configuration
- **Port Mapping**: External port 80 maps to internal port 5000

## Changelog
- June 23, 2025: Initial setup
- June 23, 2025: Successful migration from Bolt to Replit completed
- June 23, 2025: Dual storage system implemented (PostgreSQL + Supabase)
- June 23, 2025: System health monitoring added with real-time database status
- June 24, 2025: Transitioned from dual storage to Supabase-only architecture
- June 24, 2025: Removed PostgreSQL dependency, system now runs entirely on Supabase
- June 24, 2025: Updated SystemHealth component for Supabase-only monitoring
- June 24, 2025: Added messaging test system to verify Supabase functionality
- June 24, 2025: Fixed white theme button visibility issues and added Islamic mosque emoji icon
- June 24, 2025: Enhanced light theme CSS to prevent white-on-white button problems
- June 24, 2025: Implemented real-time cross-device message synchronization via API
- June 24, 2025: Completely removed all automatic refresh intervals and event emitters causing 10-second refresh cycles
- June 24, 2025: System now refreshes only on user login or explicit manual trigger events
- June 24, 2025: Message sending functionality fully working with API endpoint
- June 24, 2025: Created test interface for verifying cross-device functionality

## User Preferences

Preferred communication style: Simple, everyday language.
- No automatic page refresh every 10 seconds
- Refresh only when user logs in or manually triggers refresh
- Messages should be sent successfully without continuous refresh cycles