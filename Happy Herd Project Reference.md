# Happy Herd - Project Reference Document (PRD)

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Application Structure](#application-structure)
5. [State Management](#state-management)
6. [Data Layer](#data-layer)
7. [UI Components](#ui-components)
8. [Screens & Navigation](#screens--navigation)
9. [Backend Services](#backend-services)
10. [Design System](#design-system)
11. [Dependencies](#dependencies)

---

## Project Overview

**Happy Herd** is a comprehensive cross-platform livestock management mobile application built with React Native and Expo. The application enables ranchers and farmers to manage their herds, track animal health records, monitor breeding/descendants, and maintain detailed livestock profiles.

### Core Capabilities
- Multi-user support with account registration
- Comprehensive animal profile management
- Health event tracking and history
- Descendant/pedigree tracking
- Photo uploads for animal profiles
- Offline-first data storage with AsyncStorage
- Backend-ready with tRPC integration

### Technical Stack
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API with @nkzw/create-context-hook
- **Data Persistence**: AsyncStorage
- **Backend**: Hono + tRPC
- **Query Management**: React Query (@tanstack/react-query)
- **Styling**: React Native StyleSheet
- **Image Handling**: expo-image-picker
- **Icons**: lucide-react-native

---

## Architecture

### Application Architecture Pattern

The application follows a **Clean Architecture** approach with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│            Presentation Layer               │
│  (Screens, Components, Navigation)          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Business Logic Layer              │
│  (Context Providers, Custom Hooks)          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│             Data Layer                      │
│  (Repository Pattern, Storage Services)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Persistence Layer                   │
│  (AsyncStorage, Future: Backend API)        │
└─────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Offline-First**: All data operations work locally first
2. **Repository Pattern**: Data access abstracted through repositories
3. **Context-Based State**: Global state managed via React Context
4. **Type Safety**: Comprehensive TypeScript types throughout
5. **Modular Structure**: Feature-based file organization

---

## Data Models

All data models are defined in `types/models.ts`

### User Model
```typescript
interface User {
  id: string;                 // Unique identifier
  fullName: string;           // User's full name
  email: string;              // Email address
  createdAt: string;          // ISO timestamp
}
```

### Animal Model
```typescript
interface Animal {
  id: string;                 // Unique identifier
  userId: string;             // Owner reference
  tagId: string;              // Animal tag/ID (required)
  name?: string;              // Optional display name
  type: 'cow' | 'calf' | 'bull' | 'heifer' | 'steer';
  gender: 'M' | 'F';
  dateOfBirth: string;        // ISO date
  breed?: string;             // Breed information
  color?: string;             // Color description
  weight?: number;            // Weight in kg
  status: 'active' | 'sold' | 'deceased' | 'for_sale';
  imageUri?: string;          // Photo URI
  motherId?: string;          // Parent reference
  fatherId?: string;          // Parent reference
  observations?: string;      // Notes/observations
  createdAt: string;          // ISO timestamp
  updatedAt: string;          // ISO timestamp
}
```

### HealthEvent Model
```typescript
interface HealthEvent {
  id: string;                 // Unique identifier
  animalId: string;           // Animal reference
  eventType: 'vaccination' | 'treatment' | 'checkup' | 'injury' | 'other';
  eventName: string;          // Event title
  date: string;               // ISO date
  time?: string;              // Time (HH:MM)
  description?: string;       // Event details
  veterinarian?: string;      // Vet name
  cost?: number;              // Cost in dollars
  createdAt: string;          // ISO timestamp
}
```

### Descendant Model
```typescript
interface Descendant {
  id: string;                 // Unique identifier
  parentId: string;           // Parent animal ID
  childId: string;            // Child animal ID
  relationship: 'mother' | 'father';
  createdAt: string;          // ISO timestamp
}
```

### AnimalFilter Type
```typescript
type AnimalFilter = 'all' | 'cow' | 'calf' | 'for_sale';
```

---

## Application Structure

### Directory Layout
```
happy-herd/
├── app/                           # Expo Router screens
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Welcome screen
│   ├── register.tsx              # User registration
│   ├── health-events.tsx         # All health events view
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx           # Tabs layout
│   │   ├── index.tsx             # Dashboard
│   │   ├── herd.tsx              # Herd list
│   │   └── profile.tsx           # User profile
│   └── animal/                   # Animal-related screens
│       ├── [id].tsx              # Animal profile (with tabs)
│       ├── add.tsx               # Add animal
│       └── [id]/
│           ├── descendants.tsx   # Descendants list
│           ├── add-descendant.tsx
│           └── health/
│               ├── index.tsx     # Health records list
│               ├── add.tsx       # Add health event
│               └── [eventId].tsx # Health event detail
├── components/                    # Reusable UI components
│   ├── Button.tsx                # Button component
│   └── Input.tsx                 # Input component
├── contexts/                      # React Context providers
│   └── HerdContext.tsx           # Global herd state
├── repositories/                  # Data access layer
│   └── HerdRepository.ts         # CRUD operations
├── services/                      # Service layer
│   └── storage.ts                # AsyncStorage wrapper
├── types/                         # TypeScript types
│   └── models.ts                 # Data models
├── constants/                     # App constants
│   └── colors.ts                 # Design tokens
├── backend/                       # Backend services
│   ├── hono.ts                   # Hono server
│   └── trpc/                     # tRPC setup
│       ├── create-context.ts
│       ├── app-router.ts
│       └── routes/
└── lib/                          # Library configuration
    └── trpc.ts                   # tRPC client setup
```

---

## State Management

### Global State Architecture

The application uses **React Context** for global state management, wrapped with `@nkzw/create-context-hook` for better type safety and developer experience.

### HerdContext (`contexts/HerdContext.tsx`)

**Primary State Container** managing:
- User authentication state
- Animal collection
- Filter & search state
- Loading states

#### Context State
```typescript
{
  user: User | null;
  animals: Animal[];
  isLoading: boolean;
  filter: AnimalFilter;
  searchQuery: string;
}
```

#### Context Actions
```typescript
{
  // User operations
  register(fullName, email, password): Promise<User>;
  logout(): Promise<void>;
  
  // Animal operations
  addAnimal(animal): Promise<Animal>;
  updateAnimal(id, updates): Promise<Animal>;
  deleteAnimal(id): Promise<void>;
  getAnimalById(id): Animal | undefined;
  refreshAnimals(): Promise<void>;
  
  // Health event operations
  addHealthEvent(event): Promise<HealthEvent>;
  getHealthEvents(animalId): Promise<HealthEvent[]>;
  getAllHealthEvents(): Promise<HealthEvent[]>;
  
  // Descendant operations
  getDescendants(parentId): Promise<Animal[]>;
  addDescendant(parentId, childId, relationship): Promise<Descendant>;
  
  // UI state
  setFilter(filter): void;
  setSearchQuery(query): void;
}
```

### Custom Hook: useFilteredAnimals

Computed state hook that filters animals based on:
- Active filter (all/cow/calf/for_sale)
- Search query (tagId or name)
- Descendant relationships (for calf filter)

**Implementation Details:**
- Subscribes to animals, filter, and searchQuery from context
- Performs client-side filtering
- Returns filtered array of Animal objects

---

## Data Layer

### Repository Pattern

#### HerdRepository (`repositories/HerdRepository.ts`)

**Responsibility**: Centralized data access layer providing CRUD operations for all entities.

**Key Methods:**

**User Management:**
- `registerUser(fullName, email, password)`: Creates user account
- `getCurrentUser()`: Retrieves logged-in user
- `logout()`: Clears user session

**Animal Management:**
- `getAllAnimals()`: Fetches all animals
- `getAnimalById(id)`: Fetches single animal
- `addAnimal(animal)`: Creates new animal
- `updateAnimal(id, updates)`: Updates animal
- `deleteAnimal(id)`: Removes animal

**Health Events:**
- `getAllHealthEvents()`: Fetches all health events
- `getHealthEvents(animalId)`: Fetches events for animal
- `addHealthEvent(event)`: Creates health event
- `updateHealthEvent(id, updates)`: Updates event
- `deleteHealthEvent(id)`: Removes event

**Descendants:**
- `getDescendants(parentId)`: Fetches child animals
- `addDescendant(parentId, childId, relationship)`: Links parent-child

**Design Notes:**
- All operations are async
- Returns fully typed TypeScript objects
- Handles ID generation (timestamp-based)
- Manages timestamps (createdAt, updatedAt)

### Storage Service

#### StorageService (`services/storage.ts`)

**Responsibility**: Low-level AsyncStorage wrapper with typed methods.

**Storage Keys:**
```typescript
{
  USER: '@happyherd:user',
  ANIMALS: '@happyherd:animals',
  HEALTH_EVENTS: '@happyherd:health_events',
  DESCENDANTS: '@happyherd:descendants'
}
```

**Methods:**
- `getUser()`: Retrieve user from storage
- `setUser(user)`: Persist user
- `clearUser()`: Remove user
- `getAnimals()`: Retrieve animals array
- `setAnimals(animals)`: Persist animals array
- `getHealthEvents()`: Retrieve health events
- `setHealthEvents(events)`: Persist health events
- `getDescendants()`: Retrieve descendants
- `setDescendants(descendants)`: Persist descendants
- `clearAllData()`: Wipe all app data

**Error Handling:**
- All methods wrapped in try-catch
- Errors logged to console
- Returns safe defaults (null, empty arrays)

---

## UI Components

### Button Component (`components/Button.tsx`)

Reusable button with multiple variants and states.

**Props:**
```typescript
{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

**Features:**
- Three visual variants (primary, secondary, outline)
- Three size options
- Loading state with spinner
- Disabled state
- Custom styling support
- Press feedback (activeOpacity)

### Input Component (`components/Input.tsx`)

Text input with label and error display.

**Props:**
```typescript
{
  label?: string;
  error?: string;
  style?: ViewStyle;
  ...TextInputProps  // Inherits all React Native TextInput props
}
```

**Features:**
- Optional label
- Error message display
- Error state styling
- Placeholder support
- Consistent design system integration

---

## Screens & Navigation

### Navigation Structure

The app uses **Expo Router** (file-based routing) with a tab-based navigation pattern.

```
/ (Welcome)
├── /register (Registration)
└── /(tabs) (Main App)
    ├── / (Dashboard)
    ├── /herd (Herd List)
    └── /profile (User Profile)

/animal/add (Add Animal - Modal)
/animal/[id] (Animal Profile - Modal)
├── Tabs: Details, Pedigree, Descendants, Health
└── /animal/[id]/add-descendant
└── /animal/[id]/descendants
└── /animal/[id]/health/
    ├── / (Health Records List)
    ├── /add (Add Health Event)
    └── /[eventId] (Event Detail)

/health-events (All Health Events)
```

### Screen Details

#### 1. Welcome Screen (`app/index.tsx`)
**Route:** `/`

**Purpose:** Landing page with app introduction

**Features:**
- App branding (Happy Herd logo)
- Hero image
- Feature list
- "Get Started" CTA button

**Behavior:**
- Auto-redirects to dashboard if user logged in
- Uses effect hook to check authentication status

#### 2. Registration Screen (`app/register.tsx`)
**Route:** `/register`

**Purpose:** User account creation

**Form Fields:**
- Full Name (required)
- Email (required, validated)
- Password (required, min 6 chars)
- Confirm Password (required, must match)
- Terms & Privacy checkbox (required)

**Validation:**
- Email format validation
- Password length check
- Password match confirmation
- Terms acceptance check

**Actions:**
- Submit → Creates account → Navigates to dashboard

#### 3. Dashboard Screen (`app/(tabs)/index.tsx`)
**Route:** `/(tabs)` (default tab)

**Purpose:** Overview and quick actions

**Sections:**
- **Greeting**: "Welcome back, [User Name]"
- **Stats Cards**:
  - Total Animals
  - Cows count
  - Calves count
  - For Sale count
- **Quick Actions**:
  - Add Animal button
  - View Herd button
  - Health Events button

**Data Flow:**
- Consumes animals from HerdContext
- Computes stats with useMemo
- Real-time updates on animal changes

#### 4. Herd List Screen (`app/(tabs)/herd.tsx`)
**Route:** `/herd`

**Purpose:** Browse and filter animal collection

**Features:**
- Search bar (toggle visibility)
- Filter chips: All, Cows, Calves, For Sale
- Animal cards with:
  - Photo or placeholder
  - Tag ID
  - Optional name
  - Type, age, gender
  - Status badge
- Floating Add button (+)

**Filtering Logic:**
- **All**: Show all animals
- **Cows**: Show type='cow' OR type='bull'
- **Calves**: Show type='calf' OR animals in descendants table
- **For Sale**: Show status='for_sale'

**Search:**
- Matches against tagId or name
- Case-insensitive
- Real-time filtering

#### 5. Profile Screen (`app/(tabs)/profile.tsx`)
**Route:** `/profile`

**Purpose:** User account management

**Sections:**
- Avatar & user info
- Stats summary (total animals, active, for sale)
- Account menu items
- About section
- Logout button

**Actions:**
- Logout with confirmation dialog

#### 6. Add Animal Screen (`app/animal/add.tsx`)
**Route:** `/animal/add`

**Purpose:** Create new animal record

**Form Fields:**
- Photo upload (camera or gallery)
- Tag ID (required)
- Name (optional)
- Type (cow/calf/bull/heifer/steer)
- Gender (M/F)
- Date of Birth
- Breed
- Color
- Weight (kg)
- Status (active/for_sale/sold/deceased)

**Image Handling:**
- Platform check (web vs native)
- Camera permission request
- Gallery permission request
- Preview uploaded image

**Actions:**
- Save → Creates animal → Returns to previous screen

#### 7. Animal Profile Screen (`app/animal/[id].tsx`)
**Route:** `/animal/[id]`

**Purpose:** View and edit animal details

**Tabs:**
1. **Details**: All animal information (editable)
2. **Pedigree**: Mother and father links
3. **Descendants**: List of offspring with add button
4. **Health**: Recent health events (shows 3, link to view all)

**Photo Management:**
- Tap header image to change
- Camera overlay indicator
- Same permission flow as Add Animal

**Edit Mode:**
- All fields editable except type, gender, DOB
- Save button at bottom
- Updates persist to storage

**Special Features:**
- Navigate to parent animals from pedigree
- Navigate to child animals from descendants
- Navigate to health event details
- Add new descendant
- Add new health event

#### 8. Descendants List Screen (`app/animal/[id]/descendants.tsx`)
**Route:** `/animal/[id]/descendants`

**Purpose:** Full list of offspring

**Features:**
- Parent info in header
- Descendant cards with:
  - Tag ID
  - Name (if present)
  - Date of birth
  - Gender
  - Type
- Tap to navigate to descendant profile
- Floating Add button

#### 9. Add Descendant Screen (`app/animal/[id]/add-descendant.tsx`)
**Route:** `/animal/[id]/add-descendant`

**Purpose:** Link parent to child animal

**Form:**
- Parent display (read-only)
- Relationship selector (Mother/Father)
- Child animal selector:
  - Search functionality
  - List of all animals (except parent)
  - Selection indicator

**Actions:**
- Save → Creates descendant link → Returns to previous screen

#### 10. Health Records List Screen (`app/animal/[id]/health/index.tsx`)
**Route:** `/animal/[id]/health`

**Purpose:** Complete health history for animal

**Features:**
- Animal info in header
- Health event cards with:
  - Icon (based on event type)
  - Color coding
  - Event name
  - Event type
  - Date and time
  - Description preview
- Tap to view event details
- Floating Add button

**Event Types & Icons:**
- Vaccination: Syringe (green)
- Treatment: Pill (amber)
- Checkup: Stethoscope (blue)
- Injury: Alert Circle (red)
- Other: File Text (gray)

#### 11. Add Health Event Screen (`app/animal/[id]/health/add.tsx`)
**Route:** `/animal/[id]/health/add`

**Purpose:** Record new health event

**Form Fields:**
- Event Type (5 chips)
- Event Name (required)
- Date (required)
- Time (optional)
- Veterinarian (optional)
- Cost ($) (optional)
- Notes (textarea, optional)

**Actions:**
- Save → Creates event → Returns to health records list

#### 12. Health Event Detail Screen (`app/animal/[id]/health/[eventId].tsx`)
**Route:** `/animal/[id]/health/[eventId]`

**Purpose:** View and edit health event

**Modes:**
- **View Mode**: Display all event details in cards
- **Edit Mode**: Form fields for all properties

**Features:**
- Delete button (with confirmation)
- Edit/Save toggle
- Cancel edit option
- All fields editable
- Created timestamp display

**Actions:**
- Edit → Enables editing
- Save → Updates event → Returns to view mode
- Delete → Removes event → Returns to health records list

#### 13. All Health Events Screen (`app/health-events.tsx`)
**Route:** `/health-events`

**Purpose:** System-wide health event history

**Features:**
- All events across all animals
- Animal identification per event
- Same card design as animal health view
- Sorted by date (newest first)
- Tap to navigate to event detail

**Display:**
- Event count in header
- Animal tag & name shown on each card
- Full event details
- Navigation to animal-specific event page

---

## Backend Services

### Server Architecture

#### Hono Server (`backend/hono.ts`)

**Framework:** Hono (lightweight Node.js framework)

**Endpoints:**
- `GET /` - Health check
- `POST /api/trpc/*` - tRPC endpoint

**Middleware:**
- CORS enabled for all origins
- tRPC server middleware

#### tRPC Setup

**Context Creation (`backend/trpc/create-context.ts`):**
```typescript
interface Context {
  req: Request;  // HTTP request object
}
```

**Procedures:**
- `publicProcedure`: Open endpoint (no auth)
- (Future: `protectedProcedure` for authenticated routes)

**Router Structure (`backend/trpc/app-router.ts`):**
```typescript
appRouter = {
  example: {
    hi: publicProcedure  // Sample endpoint
  }
}
```

**Client Configuration (`lib/trpc.ts`):**
- Base URL from environment variable
- SuperJSON transformer for complex types
- HTTP link transport
- React Query integration

### Future Backend Integration

The app is **backend-ready** with:
- tRPC client/server infrastructure
- React Query for data fetching
- Environment-based API URL configuration
- Type-safe client-server communication

**Migration Path:**
1. Move storage operations to backend API
2. Replace repository localStorage calls with tRPC mutations
3. Add authentication/authorization
4. Implement data sync
5. Add multi-user support

---

## Design System

### Colors (`constants/colors.ts`)

**Primary Palette:**
- Primary: `#2D5016` (Dark Green)
- Primary Light: `#3D6B22`
- Primary Dark: `#1A3309`

**Secondary Palette:**
- Secondary: `#6B8E23` (Olive Green)
- Secondary Light: `#8BAA42`

**Accent:**
- Accent: `#F4A460` (Sandy Brown)
- Accent Light: `#FFB87A`

**Neutrals:**
- Background: `#FAF9F6` (Off-white)
- Card Background: `#FFFFFF`
- Text: `#2C2C2C`
- Text Light: `#666666`
- Text Muted: `#999999`
- Border: `#E5E5E5`
- Border Light: `#F0F0F0`

**Semantic:**
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Orange)
- Error: `#F44336` (Red)
- Info: `#2196F3` (Blue)

### Spacing
```typescript
{
  xs: 4px,
  sm: 8px,
  md: 16px,
  lg: 24px,
  xl: 32px,
  xxl: 48px
}
```

### Border Radius
```typescript
{
  sm: 4px,
  md: 8px,
  lg: 12px,
  xl: 16px,
  round: 999px
}
```

### Typography
```typescript
FontSize: {
  xs: 12px,
  sm: 14px,
  md: 16px,
  lg: 18px,
  xl: 20px,
  xxl: 24px,
  xxxl: 32px
}

FontWeight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
}
```

### Design Principles
- **Mobile-first**: Optimized for phone screens
- **Natural theme**: Earth tones reflecting agricultural context
- **Consistent spacing**: 8px grid system
- **Clear hierarchy**: Typography scale and weights
- **Accessible colors**: Good contrast ratios
- **Card-based layout**: Information grouped in cards

---

## Dependencies

### Core Dependencies

**Framework & Runtime:**
- `expo@^53.0.4` - Expo SDK
- `react@19.0.0` - React library
- `react-native@0.79.1` - React Native framework

**Navigation:**
- `expo-router@~5.0.3` - File-based routing
- `@react-navigation/native@^7.1.6` - Navigation primitives

**State & Data:**
- `@tanstack/react-query@^5.90.5` - Server state management
- `@nkzw/create-context-hook@^1.1.0` - Context creation utility
- `@react-native-async-storage/async-storage@2.1.2` - Persistence

**Backend:**
- `hono@^4.10.1` - Server framework
- `@trpc/client@^11.6.0` - tRPC client
- `@trpc/server@^11.6.0` - tRPC server
- `@trpc/react-query@^11.6.0` - React Query integration
- `@hono/trpc-server@^0.4.0` - Hono tRPC adapter
- `superjson@^2.2.2` - Serialization

**UI & Styling:**
- `expo-image@~2.1.6` - Optimized images
- `expo-image-picker@~16.1.4` - Camera/gallery access
- `lucide-react-native@^0.546.0` - Icon library
- `react-native-svg@15.11.2` - SVG support

**Utilities:**
- `zod@^4.1.12` - Schema validation
- `expo-haptics@~14.1.4` - Haptic feedback
- `expo-constants@~17.1.4` - App constants
- `react-native-safe-area-context@5.3.0` - Safe area handling
- `react-native-gesture-handler@~2.24.0` - Gesture system

### Development Dependencies

- `typescript@~5.8.3` - TypeScript compiler
- `@types/react@~19.0.10` - React types
- `eslint@9.31.0` - Linting
- `eslint-config-expo@9.2.0` - Expo ESLint config

---

## Key Relationships & Data Flow

### Entity Relationships

```
User (1) ──────< (many) Animal
                    │
                    ├──────< (many) HealthEvent
                    │
                    ├──────< (many) Descendant (as parent)
                    │
                    └──────> (one) Animal (mother)
                    └──────> (one) Animal (father)
```

### State Flow Diagram

```
┌──────────────┐
│   Screens    │
└──────┬───────┘
       │ useHerd()
       ▼
┌──────────────────┐
│  HerdContext     │  ◄─── Provides global state
│  (Provider)      │
└──────┬───────────┘
       │ calls
       ▼
┌──────────────────┐
│ HerdRepository   │  ◄─── CRUD operations
└──────┬───────────┘
       │ uses
       ▼
┌──────────────────┐
│ StorageService   │  ◄─── AsyncStorage wrapper
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  AsyncStorage    │  ◄─── Persistent storage
└──────────────────┘
```

### Component Tree

```
RootLayout
├── QueryClientProvider
│   └── HerdProvider (Global State)
│       └── GestureHandlerRootView
│           └── Stack Navigator
│               ├── index (Welcome)
│               ├── register
│               ├── (tabs)
│               │   ├── index (Dashboard)
│               │   ├── herd
│               │   └── profile
│               ├── animal/add
│               ├── animal/[id]
│               │   └── (nested routes)
│               └── health-events
```

---

## Future Enhancements

### Planned Features

1. **Backend Synchronization**
   - Move from AsyncStorage to API persistence
   - Real-time sync across devices
   - Offline queue with sync

2. **Multi-User Support**
   - User authentication (login/logout)
   - User-specific herds
   - Sharing/collaboration features

3. **Advanced Analytics**
   - Herd statistics and charts
   - Health trend analysis
   - Financial tracking

4. **Notifications**
   - Health event reminders
   - Vaccination schedules
   - Breeding alerts

5. **Export/Import**
   - PDF reports
   - CSV exports
   - Data backup/restore

6. **Search & Filters**
   - Advanced search options
   - Multiple filter combinations
   - Saved searches

7. **Breeding Management**
   - Breeding cycles
   - Gestation tracking
   - Genetic tracking

---

## Development Guidelines

### Code Organization Rules

1. **Screen files**: One screen per file in `app/` directory
2. **Components**: Reusable UI in `components/`
3. **Business logic**: Context providers in `contexts/`
4. **Data access**: Repository pattern in `repositories/`
5. **Types**: Centralized in `types/models.ts`
6. **Constants**: Design tokens in `constants/`

### TypeScript Standards

- Strict mode enabled
- Explicit type annotations on useState
- Interface definitions for all models
- No `any` types
- Type guards for runtime checks

### State Management Rules

1. **Global state**: Only in HerdContext
2. **Local state**: Use useState for UI-only state
3. **Computed state**: Use useMemo for derived data
4. **Side effects**: Use useEffect with proper dependencies

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for storage keys
- **Types/Interfaces**: PascalCase

---

## Testing Strategy (Future)

### Unit Tests
- Repository methods
- Context provider logic
- Utility functions

### Integration Tests
- Screen navigation flows
- CRUD operations
- State updates

### E2E Tests
- User registration flow
- Animal creation and editing
- Health event management

---

## Error Handling

### Current Approach

1. **Try-Catch Blocks**: All async operations wrapped
2. **Console Logging**: Errors logged for debugging
3. **User Feedback**: Alert dialogs for user-facing errors
4. **Graceful Degradation**: Safe defaults returned on errors

### Error Boundaries (Future)

- Add React Error Boundaries
- Fallback UI for crashes
- Error reporting service integration

---

## Performance Considerations

### Current Optimizations

1. **useMemo**: Stats calculations, filtered lists
2. **useCallback**: Context action functions
3. **List Rendering**: FlatList for animal/event lists
4. **Image Optimization**: expo-image for caching

### Future Improvements

- Virtual scrolling for large lists
- Image compression
- Code splitting
- Bundle size optimization

---

## Security Notes

### Current Implementation

- No encryption for AsyncStorage (acceptable for MVP)
- No authentication system (single user)
- Camera/gallery permissions handled

### Future Security

- Encrypted storage for sensitive data
- JWT authentication
- API request signing
- Input sanitization
- SQL injection prevention (when using DB)

---

## Deployment Information

### App Configuration (`app.json`)

- **Bundle ID (iOS)**: `app.rork.happy-herd-management-app`
- **Package (Android)**: `app.rork.happy_herd_management_app`
- **Version**: 1.0.0
- **Orientation**: Portrait only
- **New Architecture**: Enabled

### Required Permissions

**iOS:**
- NSPhotoLibraryUsageDescription
- NSCameraUsageDescription
- NSMicrophoneUsageDescription

**Android:**
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

---

## Contact & Maintenance

This PRD serves as a comprehensive reference for:
- New developers joining the project
- AI assistants working on features
- Documentation and knowledge transfer
- Architecture decisions and rationale

Last Updated: 2025-01-12
Version: 1.0.0

