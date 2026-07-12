# Adventure Trip Planner

A cross-platform mobile application built with **React Native (Expo)** that helps outdoor
travelers plan, organize, and manage adventure trips — hiking, camping, cycling, road trips,
mountain and beach adventures — in one place.

Built for **ITS 2127 – Advanced Mobile Developer**, Graduate Diploma in Software Engineering (IJSE).

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Setup Instructions](#setup-instructions)
6. [Mock Backend](#mock-backend)
7. [OpenWeather API Setup](#openweather-api-setup)
8. [Running the App](#running-the-app)
9. [Mock Data Model](#mock-data-model)
10. [Building the Android APK](#building-the-android-apk)
11. [Project Requirements](#project-requirements)
12. [Known Limitations / Future Work](#known-limitations--future-work)

---

## Features

- **Authentication** — Email/password registration, login, logout, password reset, and
  persistent sessions, backed by a local mock authentication service.
- **Trip CRUD** — Create, view, edit, and delete adventure trips (title, destination, country,
  activity type, dates, description, cover photo, GPS coordinates).
- **Equipment Checklist** — Per-trip packing list with pack/unpack checkboxes and assignment.
- **Expense Splitter** — Add shared trip expenses by category and automatically split the total
  cost evenly across trip members, with per-payer balances.
- **Live Weather** — Destination weather forecast (temperature, condition, humidity, wind) via
  the real OpenWeather REST API.
- **Map & Location** — Save destination GPS coordinates using the device's location service and
  view them on an interactive map alongside your current location.
- **Photo Gallery** — Capture trip photos with the camera or upload from the photo library,
  persisted to the app's local document storage.
- **Push Notifications** — Local reminders the day before a trip starts and for unpacked
  checklist items.
- **Search & Filter** — Search trips by title/destination and filter by activity type.
- **Modern UI** — Adventure/nature themed design (dark green, orange, earth tones), light/dark
  mode, loading skeletons, and empty states.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo SDK 54 |
| Language | **JavaScript** (screens, components, navigation) + **TypeScript** (contexts, services, mock backend, shared types) |
| Navigation | React Navigation (Native Stack + Bottom Tabs) |
| State Management | React Context API + `useReducer` (`AuthContext.tsx`, `TripContext.tsx`) |
| Backend | Local **mock server** layer (`src/mock`, `src/services`) persisted via AsyncStorage |
| File persistence | `expo-file-system` (photos copied into the app's document directory) |
| REST API | OpenWeather API (real network call) |
| Native APIs | Expo Location, Expo Camera / Image Picker, Expo Notifications |
| Maps | react-native-maps |
| UI Kit | React Native Paper |
| Build | EAS Build (Android APK) |

This project uses the coursework's **"mock server for API calls"** option: authentication and
CRUD are fully wired through an async service layer with realistic loading/error states, but
data is persisted locally on-device (AsyncStorage + the document directory) instead of a real
backend — no server to host, no account/API keys to configure beyond OpenWeather.

### JavaScript + TypeScript

The brief lists **JavaScript / TypeScript** as the frontend language options, so this project
deliberately uses both: the data/logic layer — `src/types`, `src/mock`, `src/services`, and the
two React Contexts (`AuthContext.tsx`, `TripContext.tsx`) — is written in strict TypeScript
(shared interfaces for `Trip`, `EquipmentItem`, `Expense`, `Photo`, `UserProfile`, etc., a
type-safe generic mock-database accessor, and discriminated-union reducer actions). Screens,
components, and navigators stay in plain JavaScript/JSX. Metro bundles `.js`/`.ts`/`.tsx` side
by side with no extra configuration. Run `npm run typecheck` to type-check the TypeScript files
(`tsc --noEmit`) — it should report zero errors.

## Project Structure

```
src/
├── components/     # Reusable UI components (TripCard, WeatherWidget, EmptyState, ...)  [.js]
├── screens/                                                                             [.js]
│   ├── auth/       # Splash, Login, Register, ForgotPassword
│   ├── home/       # Home dashboard
│   ├── trips/      # Trip list/detail/form, equipment, expenses, map, location picker
│   ├── gallery/     # Photo gallery
│   └── profile/    # Profile, edit profile, notification settings
├── navigation/     # AuthNavigator, MainTabNavigator, MainStackNavigator, RootNavigator  [.js]
├── context/        # AuthContext, TripContext (Context API + useReducer)                [.tsx]
├── services/       # Auth/Trip/Equipment/Expense/Photo/Profile services + weather        [.ts]
├── mock/           # Mock backend: AsyncStorage-backed "database", seed data, delay      [.ts]
├── types/          # Shared TypeScript interfaces (Trip, EquipmentItem, Expense, ...)    [.ts]
├── utils/          # Validators, date helpers                                            [.ts]
└── theme/          # Colors, spacing, activity type definitions                          [.ts]
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your Android/iOS device (for local testing) — this
  project targets **Expo SDK 54**; make sure your installed Expo Go version matches (see the
  troubleshooting note below if it doesn't)
- A free [OpenWeather](https://openweathermap.org/api) API key

## Setup Instructions

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd AMD-Final-CourseWork-TravelPlaningApp

# 2. Install dependencies
npm install

# 3. Copy the environment template and add your OpenWeather API key
cp .env.example .env

# 4. Start the Expo development server
npm start
```

Scan the QR code with the **Expo Go** app (Android) or the Camera app (iOS) to run the app on
your physical device. Press `a` in the terminal to launch an Android emulator, or `i` for iOS
simulator (macOS only).

> **Expo Go version mismatch?** Expo Go (from the Play Store / App Store) only supports the
> *current* Expo SDK release. If `expo start` reports `Project is incompatible with this
> version of Expo Go`, either (a) update the Expo Go app from the Play Store/App Store, or
> (b) check your installed Expo Go's SDK version and align this project to it by running
> `npx expo install expo@<their-sdk-version>` followed by `npx expo install --fix` (delete
> `node_modules` + `package-lock.json` and run `npm install` again if that reports peer
> dependency conflicts). This project currently targets **Expo SDK 54**.

## Mock Backend

There is no server to start and no external account to create. `src/mock/mockDatabase.js`
persists a small JSON "database" (`users`, `trips`, `equipment`, `expenses`, `photos`) to
AsyncStorage, and every function in `src/services/*.js` reads/writes it behind the same
async, Promise-based interface a real REST/Firestore call would have (including a simulated
network delay so loading states are visible).

A demo account is seeded automatically on first launch, with one sample trip already populated:

- **Email:** `demo@adventure.com`
- **Password:** `password123`

Tap **"Use Demo Account"** on the Login screen to sign in instantly, or register your own
account normally. From **Profile → Reset Mock Data** you can wipe all local data and restore
the original seed at any time (useful before a demo/viva).

> Swapping this for a real backend later (Firebase, or a custom Node/Express API) only requires
> rewriting `src/services/*.js` — `AuthContext`, `TripContext`, and every screen call the same
> function signatures regardless of what's underneath.

## OpenWeather API Setup

1. Create a free account at [openweathermap.org](https://openweathermap.org/api).
2. Copy your API key from **My API Keys**.
3. Add it to `.env`:
   ```
   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here
   ```
   > New keys can take up to a couple of hours to activate.

## Running the App

```bash
npm start        # Start Metro bundler, scan the QR code with Expo Go
npm run android  # Start and open on a connected Android device/emulator
npm run ios      # Start and open on iOS simulator (macOS only)
npm run web      # Run in a browser (limited native feature support)
```

## Mock Data Model

```
users     { uid, name, email, passwordHash, authProvider, createdAt }
trips     { tripId, ownerId, title, destination, country, activityType, description,
            startDate, endDate, latitude, longitude, coverImage, createdAt, updatedAt }
equipment { itemId, tripId, name, isPacked, assignedTo }
expenses  { expenseId, tripId, category, description, amount, paidBy, date, createdAt }
photos    { photoId, tripId, imageUrl, uploadedBy, caption, uploadedAt }
```

`Trip` is the central CRUD entity; `equipment`, `expenses`, and `photos` are flat collections
keyed by `tripId` (the mock equivalent of Firestore sub-collections). Deleting a trip cascades
and removes its related equipment, expenses, and photos.

## Building the Android APK

```bash
npm install -g eas-cli
eas login
eas build:configure          # links this project to your Expo account, fills "extra.eas.projectId"
eas build --platform android --profile preview   # produces an installable .apk
```

Once the build finishes, download the `.apk` from the link EAS prints (or from
[expo.dev](https://expo.dev)) and either sideload it onto a device or share the link in your
submission.

## Project Requirements

Mapped directly against the ITS 2127 assignment brief's **Project Requirements** section:

| Requirement (per assignment brief) | How this project satisfies it |
|---|---|
| **Frontend**: Mobile app (React Native Expo or any cross-platform technology) | React Native + **Expo SDK 54**, using **both JavaScript and TypeScript** (see [JavaScript + TypeScript](#javascript--typescript)) |
| **Backend**: Optional (Firebase Firestore, mock server, or any backend) | The **mock server** option — `src/mock` + `src/services`, persisted via AsyncStorage and the device file system |
| **State Management**: Must implement state management (Ex: React Context, Redux, or equivalent) | **React Context API + `useReducer`** (`AuthContext`, `TripContext`), with explicit loading/error state per request |
| **Authentication**: Required (Firebase Auth / JWT / Mock auth) | **Mock email/password authentication** with persistent sessions (`src/services/authService.js`) |
| **Core Functionality**: Full CRUD for at least one central data model | Full Create/Read/Update/Delete on **`Trip`** (the central entity), plus related Equipment, Expense, and Photo records |
| **Navigation**: Must include at least one navigation type (Stack, Tab) | Both — **Native Stack Navigator + Bottom Tab Navigator** |
| **Mobile App UI**: Must be intuitive, responsive, and user-friendly | Adventure-themed design system, light/dark mode, loading skeletons, empty states, form validation |
| **Builds**: At least one build — Android (APK) or iOS build | **Android APK via EAS Build** (see below) |

Beyond the minimum requirements, this project also integrates a genuine **RESTful API** (OpenWeather,
`src/services/weatherService.js`) and several **native device APIs** (Expo Location, Camera/Image
Picker, Notifications) toward the Creativity & Innovation criterion.

## Known Limitations / Future Work

Scoped out of this coursework submission (see the original proposal for the full long-term
vision): AI-powered itinerary suggestions, collaborative multi-user trip planning, real-time
group chat, Emergency SOS, offline map downloads, and a custom Node.js backend. Because the
mock backend is local to each device, data does not sync across devices or survive an app
uninstall — swapping in Firebase or a custom API (see `src/services/*.js`) is the natural next
step if persistent, multi-device data is required.

---

**Course:** ITS 2127 – Advanced Mobile Developer, Graduate Diploma in Software Engineering
**Institute:** IJSE
#   A M D _ F i n a l C o u r s e W o r k _ A d v e n t u r e T r i p P l a n n e r -  
 