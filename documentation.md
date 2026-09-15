# DualWave

## Complete Developer Documentation

**Project:** DualWave
**Platform:** Android / iOS
**Framework:** React Native CLI
**Language:** TypeScript
**Status:** Under Active Development
**Repository:** `https://github.com/nitindahiya-dev/DualWave`

---

# 1. What is DualWave?

DualWave is an **AI-powered real-time communication platform designed to remove language barriers between people around the world**.

The goal is not to build another traditional social-media or messaging application.

The core idea is:

> Two people should be able to communicate naturally even when they do not speak the same language.

### Example

Imagine:

* Person A is from India.
* Person A speaks Hindi.
* Person B is from China.
* Person B speaks Chinese.
* Neither person understands the other's language.

Person A speaks:

> "आप कहाँ से हैं?"

DualWave understands the Hindi speech, converts it into text, translates it into Chinese, converts the Chinese translation back into natural speech, and sends it to Person B.

Person B hears the message in Chinese.

Person B responds in Chinese.

DualWave performs the reverse process and Person A hears the response in Hindi.

The users should feel as if they are simply having a normal conversation.

---

# 2. Product Vision

DualWave is intended to become a **global communication layer** rather than simply a chat application.

The long-term vision includes:

* Text communication
* Voice communication
* Video communication
* Face-to-face communication
* Real-time translation
* AI-powered speech recognition
* Natural translated speech
* Voice preservation / voice cloning
* Language-aware conversations
* Global communication between people who do not share a common language

The current repository describes the planned communication architecture as:

```text
User speaks
     ↓
Audio Capture
     ↓
Speech-to-Text
     ↓
Translation
     ↓
Translated Text
     ↓
Text-to-Speech / Voice Cloning
     ↓
Translated Audio
     ↓
Recipient
```

The important engineering requirement is that live communication eventually needs a **streaming, low-latency pipeline**, rather than processing an entire conversation only after the user finishes speaking.

---

# 3. Current Project Status

DualWave is currently in the **foundation / application architecture phase**.

The project already contains the basic structure required for a production-style React Native application.

Current foundations include:

* React Native CLI project
* TypeScript
* Android native project
* iOS native project
* React Navigation
* Authentication navigation
* Profile setup navigation
* Splash screen
* Welcome screen
* Authentication screens
* Profile creation flow
* Language selection
* Country selection
* Profile photo flow
* Home screen
* Zustand state management
* Supabase integration
* AsyncStorage
* Reusable UI components
* Service layer
* Type definitions
* Validation utilities
* Project-wide constants

The repository currently contains approximately this high-level architecture.

---

# 4. Technology Stack

## Mobile

### React Native

DualWave uses **React Native CLI** rather than Expo.

This gives the project direct access to native Android and iOS functionality.

Current React Native version:

```text
React Native 0.87.1
```

Current React version:

```text
React 19.2.3
```

---

## Language

The project uses:

```text
TypeScript
```

TypeScript should be preferred throughout the application.

Avoid introducing new JavaScript files unless there is a specific reason.

---

# 5. Navigation

DualWave uses:

```text
@react-navigation/native
@react-navigation/native-stack
```

The navigation architecture is divided into multiple navigators.

```text
RootNavigator
│
├── AuthNavigator
│
├── ProfileSetupNavigator
│
└── AppNavigator
```

This separation is important.

A developer should **not put all screens into one giant navigator**.

Instead, navigation should reflect the application's state.

---

# 6. Application Flow

The expected high-level flow is:

```text
Application Start
       │
       ▼
Splash Screen
       │
       ▼
Authentication State
       │
       ├── Not authenticated
       │        │
       │        ▼
       │     Welcome
       │        │
       │        ├── Login
       │        └── Register
       │
       └── Authenticated
                │
                ▼
          Profile Completion
                │
                ▼
              Home
```

The exact routing decision should ultimately be controlled by authentication and profile state rather than manually pushing screens.

---

# 7. Splash Screen

Location:

```text
src/screens/Splash/SplashScreen.tsx
```

The splash screen is the initial visual entry point into the application.

Its responsibility should remain small.

It should:

1. Display the application branding.
2. Allow the application to initialize.
3. Determine the user's authentication/profile state.
4. Hand control to the appropriate navigator.

The splash screen should **not become a business-logic container**.

Authentication and profile decisions belong in services/state/navigation logic.

---

# 8. Welcome Screen

Location:

```text
src/screens/Welcome/WelcomeScreen.tsx
```

The Welcome screen is the unauthenticated user's entry point.

It should introduce DualWave and provide access to:

* Login
* Registration

The Welcome screen should remain presentation-focused.

---

# 9. Authentication System

Authentication-related screens are located under:

```text
src/screens/Auth/
```

Current screens:

```text
ForgotPasswordScreen.tsx
LoginScreen.tsx
OTPScreen.tsx
RegisterScreen.tsx
ResetPasswordScreen.tsx
```

The authentication architecture is separated into:

```text
UI
 ↓
authStore
 ↓
authService
 ↓
Supabase
```

This separation is intentional.

A screen should not contain raw authentication/database implementation.

---

# 10. Authentication Service

Location:

```text
src/services/auth/authService.ts
```

This layer is responsible for authentication-related operations.

Typical responsibilities include:

* Sign in
* Registration
* OTP verification
* Password reset
* Session handling
* Logout
* Authentication state interaction

The UI should call service functions rather than directly implementing authentication logic.

Example conceptual architecture:

```text
LoginScreen
     ↓
authStore
     ↓
authService
     ↓
Supabase
```

---

# 11. Authentication State

Location:

```text
src/store/authStore.ts
```

Zustand is used for application state management.

The authentication store should contain application-level authentication state such as:

```text
user
session
isAuthenticated
loading
authentication errors
```

The store should act as the application's source of truth for authentication state.

---

# 12. Supabase

The project currently includes:

```text
@supabase/supabase-js
```

and:

```text
src/services/supabase/supabaseClient.ts
```

Supabase is intended to provide backend capabilities such as:

* Authentication
* Database
* User/profile data
* Potential future realtime functionality

The Supabase client should be initialized in one centralized location.

Do not create separate Supabase clients inside individual screens.

---

# 13. Profile System

Profile-related screens are located at:

```text
src/screens/Profile/
```

Current screens:

```text
CountryScreen.tsx
CreateProfileScreen.tsx
LanguageScreen.tsx
ProfileCompleteScreen.tsx
ProfilePhotoScreen.tsx
```

The profile setup flow is conceptually:

```text
Create Profile
      ↓
Select Country
      ↓
Select Language
      ↓
Select Profile Photo
      ↓
Profile Complete
      ↓
Application
```

The purpose of this profile information is not only social identity.

Language and country information will become important to DualWave's communication system.

---

# 14. Why Language Is Part of the Profile

DualWave needs to understand:

```text
Who is the user?
What language does the user speak?
What language does the other person speak?
```

For example:

```text
User A
nativeLanguage = Hindi

User B
nativeLanguage = Chinese
```

This information can later be used by the communication system to automatically determine translation direction.

---

# 15. Profile Store

Location:

```text
src/store/profileStore.ts
```

The profile store manages client-side profile state.

Conceptually:

```text
ProfileScreen
      ↓
profileStore
      ↓
profileService
      ↓
Supabase
```

The store should not contain large amounts of API/database implementation.

It should primarily manage application state.

---

# 16. Profile Services

Located at:

```text
src/services/profile/
```

Files:

```text
profileService.ts
profileStorageService.ts
```

### profileService

Responsible for remote profile operations.

Examples:

* Create profile
* Update profile
* Fetch profile
* Save profile information

### profileStorageService

Responsible for locally stored profile information.

This separation allows the application to distinguish between:

```text
Remote data
```

and:

```text
Local cached data
```

---

# 17. Communication Services

Located at:

```text
src/services/communication/
```

Current files:

```text
contactService.ts
languageService.ts
userService.ts
```

These services are especially important because they form the foundation for DualWave's future communication engine.

### contactService

Responsible for contact/relationship-related operations.

Potential responsibilities:

* Find users
* Add contacts
* Remove contacts
* Manage communication relationships

### languageService

Responsible for language-related functionality.

Potential responsibilities:

* Supported language list
* Language metadata
* Translation direction
* Language validation

### userService

Responsible for user-related remote operations.

---

# 18. API Layer

Location:

```text
src/services/api/apiClient.ts
```

The API client exists to centralize network communication.

The goal is to avoid code like this being scattered across screens:

```text
fetch(...)
axios(...)
supabase...
```

Instead:

```text
Screen
  ↓
Service
  ↓
API Client
  ↓
Backend
```

This makes the application easier to test and maintain.

---

# 19. Storage

Location:

```text
src/services/storage/storageService.ts
```

The project uses:

```text
@react-native-async-storage/async-storage
```

Local storage may be used for things such as:

* Cached user state
* Preferences
* Onboarding state
* Temporary application settings
* Non-sensitive local data

Sensitive information should not automatically be stored in plain AsyncStorage.

---

# 20. UI Component Architecture

Reusable components are located at:

```text
src/components/
```

Current common components include:

```text
Avatar.tsx
Button.tsx
ErrorMessage.tsx
Input.tsx
Loading.tsx
```

These components should be reused throughout the application.

For example:

Instead of:

```tsx
<TouchableOpacity>
   ...
</TouchableOpacity>
```

being independently styled in every screen, use:

```tsx
<Button />
```

when the behavior represents the project's standard button.

This keeps UI consistent.

---

# 21. Profile Components

Location:

```text
src/components/profile/
```

Current components:

```text
LanguageSelector.tsx
ProfileAvatar.tsx
```

These components encapsulate profile-specific UI.

They should remain reusable and should not contain unnecessary business logic.

---

# 22. Design System

Location:

```text
src/constants/
```

Current files:

```text
colors.ts
config.ts
spacing.ts
typography.ts
```

These files provide centralized application design/configuration values.

Instead of scattering values everywhere:

```tsx
padding: 17
fontSize: 23
```

prefer using centralized constants where appropriate.

Example:

```text
spacing.md
typography.heading
colors.primary
```

This makes future redesigns much easier.

---

# 23. Type Definitions

Location:

```text
src/types/
```

Current files:

```text
auth.ts
communication.ts
navigation.ts
profile.ts
```

These files define the application's TypeScript contracts.

This is extremely important as DualWave grows.

For example, communication-related types should eventually define concepts such as:

```text
Message
Conversation
Participant
Language
Translation
VoiceMessage
Call
```

Types should be shared instead of duplicated across screens.

---

# 24. Utilities

Location:

```text
src/utils/
```

Current files:

```text
helpers.ts
validation.ts
```

Utilities should contain small reusable functions.

Examples:

```text
validateEmail()
validatePassword()
formatName()
formatDate()
```

Avoid turning `helpers.ts` into a giant file containing unrelated functionality.

As the project grows, related utilities should be separated.

---

# 25. Assets

Location:

```text
src/assets/
```

Contains:

```text
fonts/
icons/
images/
```

Static visual resources should live here.

Avoid storing application assets randomly inside individual screen directories.

---

# 26. Complete Source Structure

The current architecture can be understood as:

```text
DualWave/
│
├── android/
│
├── ios/
│
├── src/
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   └── profile/
│   │       ├── LanguageSelector.tsx
│   │       └── ProfileAvatar.tsx
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── ProfileSetupNavigator.tsx
│   │   └── RootNavigator.tsx
│   │
│   ├── screens/
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Profile/
│   │   ├── Splash/
│   │   └── Welcome/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── communication/
│   │   ├── profile/
│   │   ├── storage/
│   │   └── supabase/
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   └── profileStore.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── communication.ts
│   │   ├── navigation.ts
│   │   └── profile.ts
│   │
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── validation.ts
│   │
│   └── tests/
│
├── __tests__/
│
├── App.tsx
├── index.js
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── app.json
└── README.md
```

The repository's existing structure document provides the current detailed layout.

---

# 27. Application Architecture

DualWave should follow this general architecture:

```text
                    ┌──────────────────────┐
                    │       Screens        │
                    │    React Components  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Stores         │
                    │       Zustand        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Services        │
                    │ Business Logic / API │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
             Supabase       API Server     Storage
```

This separation is one of the most important architectural rules of the project.

---

# 28. Responsibility of Each Layer

## Screens

Responsible for:

* Rendering UI
* Receiving user input
* Displaying loading states
* Displaying errors
* Calling store/service actions

Screens should **not** contain complicated backend logic.

---

## Components

Responsible for:

* Reusable UI
* UI behavior
* Consistent visual design

Components should generally be reusable and predictable.

---

## Stores

Responsible for:

* Client-side application state
* Authentication state
* Profile state
* Future communication state

---

## Services

Responsible for:

* Business logic
* API communication
* Supabase communication
* Storage
* External integrations

---

## Types

Responsible for:

* Data contracts
* Function contracts
* Navigation contracts
* API models

---

# 29. Future Communication Architecture

The most important future system in DualWave is the multilingual communication engine.

The conceptual architecture is:

```text
                 USER A
                   │
                   │ speaks Hindi
                   ▼
            Audio Capture
                   │
                   ▼
              Speech-to-Text
                (Whisper)
                   │
                   ▼
               Hindi Text
                   │
                   ▼
              Translation
             LLM / DeepL
                   │
                   ▼
              Chinese Text
                   │
                   ▼
          Text-to-Speech
        / Voice Cloning
              ElevenLabs
                   │
                   ▼
             Chinese Audio
                   │
                   ▼
                USER B
```

The reverse direction works the same way:

```text
User B
Chinese speech
     ↓
Speech-to-Text
     ↓
Chinese text
     ↓
Translation
     ↓
Hindi text
     ↓
Text-to-Speech
     ↓
Hindi audio
     ↓
User A
```

The repository's current README identifies Whisper, DeepL/LLMs, and ElevenLabs as planned components of this pipeline.

---

# 30. Why Streaming Matters

A traditional translation system might work like:

```text
Speak
  ↓
Wait
  ↓
Process
  ↓
Translate
  ↓
Generate audio
  ↓
Play
```

That would feel slow during a conversation.

DualWave eventually needs:

```text
Audio stream
     ↓
STT stream
     ↓
Translation stream
     ↓
TTS stream
     ↓
Audio stream
```

The objective is to minimize:

```text
User speaks
       ↓
       ↓
       ↓
Recipient hears translation
```

latency.

The communication system should therefore be designed around **real-time streaming**, not just request/response APIs.

---

# 31. Planned Backend Architecture

The planned backend stack includes:

```text
Node.js
Express
Socket.io / WebSockets
PostgreSQL
Prisma
Redis
BullMQ
AWS S3 / Cloudflare R2
```

These are currently part of the project's planned architecture rather than something that should be assumed to be fully implemented in the current mobile repository.

---

# 32. Real-Time Communication

For real-time communication, the planned architecture is:

```text
React Native Client
        │
        ▼
WebSocket / Socket.io
        │
        ▼
Node.js Backend
        │
        ├── Authentication
        ├── Presence
        ├── Messaging
        ├── Translation coordination
        └── Call coordination
```

For video communication:

```text
User A
   │
   ▼
WebRTC
   │
   ▼
User B
```

The backend should primarily coordinate the connection rather than unnecessarily route all video data through the application server.

---

# 33. Data Model — Future Direction

The backend will eventually need entities similar to:

```text
User
Profile
Language
Contact
Conversation
ConversationParticipant
Message
Translation
VoiceMessage
Call
CallParticipant
MediaAsset
```

A simplified relationship could be:

```text
User
 │
 └── Profile
       │
       ├── Country
       └── Language
       
User
 │
 └── Contacts
       │
       └── Conversation
              │
              ├── Participants
              └── Messages
                     │
                     └── Translation
```

This is an architectural direction, not a claim that all of these database entities already exist.

---

# 34. Authentication Flow

A developer should understand authentication as:

```text
Application launches
        ↓
Check existing session
        ↓
Session exists?
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
Check       Welcome
profile       │
   │          ▼
   │       Login/Register
   │
   ▼
Profile complete?
   │
 ┌─┴─┐
No   Yes
│     │
▼     ▼
Profile Home
Setup
```

This is much better than navigating blindly based on which screen the user last visited.

---

# 35. Profile Completion Logic

A newly authenticated user may not have completed their profile.

Therefore:

```text
Authenticated
     ↓
Profile exists?
     │
 ┌───┴────┐
 No       Yes
 │         │
 ▼         ▼
Profile   Home
Setup
```

This distinction is important because authentication and profile completion are **two separate concepts**.

---

# 36. State Management Rules

Use Zustand for global client state.

Do not put every piece of state into Zustand.

Use local React state for temporary UI state.

Example:

```text
Password input
→ local state
```

while:

```text
Authenticated user
→ Zustand
```

and:

```text
Current profile
→ Zustand
```

The general rule is:

> Keep state as close as possible to where it is used, unless multiple parts of the application need it.

---

# 37. Error Handling

Every network-dependent screen should consider:

```text
Loading
Success
Error
Empty
```

Example:

```text
Loading
   ↓
API request
   │
 ┌─┴─────────┐
 ▼           ▼
Success     Error
 │           │
 ▼           ▼
Display     ErrorMessage
data
```

Avoid silently swallowing errors.

Bad:

```ts
try {
   await login();
} catch {}
```

Better:

```ts
try {
   await login();
} catch (error) {
   setError(...)
}
```

---

# 38. Validation

Input validation should live in:

```text
src/utils/validation.ts
```

Validation should happen before unnecessary network requests.

Examples:

```text
Email validation
Password validation
Required fields
Country selection
Language selection
Profile information
```

Backend validation must still exist.

Client validation improves UX but is not a security boundary.

---

# 39. Environment Variables

Secrets must never be hard-coded.

Examples of values that should not be committed:

```text
Supabase secret keys
API secrets
AI provider API keys
Database passwords
AWS credentials
ElevenLabs API keys
Whisper provider keys
```

Use environment configuration.

The project already includes:

```text
react-native-config
```

for environment configuration.

---

# 40. Important Security Rule

Never expose server-only API keys inside the React Native application.

For example, the mobile application should **not directly contain a private backend secret**.

Instead:

```text
React Native
      ↓
DualWave Backend
      ↓
AI Provider
```

rather than:

```text
React Native
      ↓
Private AI API Key
      ↓
AI Provider
```

Anything shipped inside a mobile application should be treated as potentially discoverable.

---

# 41. Voice Cloning Security

Voice cloning is one of the most sensitive parts of DualWave.

The system must eventually include:

* Explicit voice-consent flows
* User-controlled voice enrollment
* Protection against unauthorized cloning
* Clear privacy policies
* Abuse prevention
* Voice deletion
* Appropriate legal/compliance controls

The existing project documentation explicitly identifies consent, privacy, and legal constraints around voice cloning.

---

# 42. Testing

The project uses:

```text
Jest
```

and React Native testing infrastructure.

Current commands include:

```bash
npm test
```

Tests should eventually cover:

### Unit tests

* Validation
* Helpers
* Services
* Store logic

### Component tests

* Buttons
* Inputs
* Language selector
* Profile components

### Screen tests

* Login
* Registration
* Profile setup

### Integration tests

* Authentication flow
* Profile creation
* Communication flow

---

# 43. Development Environment

The project is a native React Native CLI application.

The current repository specifies:

```text
Node >= 22.11.0
React Native 0.87.1
React 19.2.3
```

The package scripts include:

```bash
npm run android
npm run ios
npm start
npm test
npm run lint
```

The current `package.json` defines these commands and dependencies.

---

# 44. Android Development

Android development requires:

* Node.js
* Java/JDK
* Android Studio
* Android SDK
* Android emulator or physical device
* ADB
* React Native CLI environment

Check connected devices:

```bash
adb devices
```

Expected example:

```text
List of devices attached
emulator-5554    device
```

Run the application:

```bash
npm run android
```

---

# 45. iOS Development

iOS development requires macOS and Xcode.

Run:

```bash
npm run ios
```

The repository contains the native iOS project under:

```text
ios/
```

iOS development is not required for Android-only development.

---

# 46. Starting Metro

Metro is the React Native JavaScript bundler.

Start it using:

```bash
npm start
```

Then run the native application separately.

Typical development workflow:

```bash
npm start
```

and in another terminal:

```bash
npm run android
```

---

# 47. Installing Dependencies

After cloning:

```bash
git clone https://github.com/nitindahiya-dev/DualWave.git
cd DualWave
npm install
```

Then:

```bash
npm start
```

and:

```bash
npm run android
```

---

# 48. Developer Workflow

A new developer should generally work in this order.

## Step 1 — Understand the product

Read:

```text
README.md
```

Then read this document.

Understand the reason DualWave exists before modifying code.

---

## Step 2 — Understand the navigation

Read:

```text
src/navigation/
```

Start with:

```text
RootNavigator.tsx
```

Then:

```text
AuthNavigator.tsx
ProfileSetupNavigator.tsx
AppNavigator.tsx
```

---

## Step 3 — Understand authentication

Read:

```text
src/store/authStore.ts
src/services/auth/authService.ts
src/screens/Auth/
```

Understand:

```text
Login
Register
OTP
Password Reset
Session
```

---

## Step 4 — Understand profiles

Read:

```text
src/store/profileStore.ts
src/services/profile/
src/screens/Profile/
```

Understand how profile data moves between:

```text
UI
→ Store
→ Service
→ Backend
```

---

## Step 5 — Understand reusable UI

Read:

```text
src/components/
src/constants/
```

Before creating a new component, check whether an existing reusable component already solves the problem.

---

## Step 6 — Understand types

Read:

```text
src/types/
```

Understand the application's data contracts.

---

# 49. How to Add a New Screen

When adding a screen:

### 1. Create the screen

Example:

```text
src/screens/Communication/ChatScreen.tsx
```

### 2. Define its types

If needed:

```text
src/types/communication.ts
```

### 3. Add navigation

Modify the appropriate navigator.

### 4. Keep business logic outside the screen

Create a service if backend/business logic is required.

### 5. Use reusable components

Prefer:

```text
Button
Input
Loading
ErrorMessage
Avatar
```

instead of creating duplicated UI.

---

# 50. How to Add a New API Feature

Do not put API requests directly into the screen.

Use:

```text
Screen
   ↓
Store
   ↓
Service
   ↓
API Client
   ↓
Backend
```

For example:

```text
ChatScreen
   ↓
communicationStore
   ↓
messageService
   ↓
apiClient
   ↓
Backend
```

---

# 51. How to Add a New External AI Provider

Do not tightly couple the UI to an AI provider.

Bad architecture:

```text
ChatScreen
   ↓
ElevenLabs API
```

Better:

```text
ChatScreen
   ↓
Communication Service
   ↓
Voice Provider Interface
   ↓
ElevenLabs
```

This makes it possible to replace a provider later.

For example:

```text
VoiceProvider
├── ElevenLabsProvider
├── ProviderB
└── ProviderC
```

The same principle should apply to:

```text
Translation
Speech-to-Text
Text-to-Speech
```

---

# 52. Provider Abstraction

Long-term, DualWave should avoid becoming dependent on one vendor.

For example:

```text
TranslationService
        │
        ├── DeepL
        ├── LLM
        └── Future Provider
```

and:

```text
SpeechService
        │
        ├── Whisper
        └── Future Provider
```

This gives the backend flexibility regarding:

* Cost
* Latency
* Availability
* Language support
* Quality
* Vendor changes

---

# 53. Communication Data Flow

A future text message could work like:

```text
User A
  │
  │ "Hello"
  ▼
Mobile App
  │
  ▼
Backend
  │
  ├── Save original message
  │
  ├── Determine recipient language
  │
  ├── Translate
  │
  └── Send translated message
  │
  ▼
User B
```

Important:

The system should ideally preserve the **original message** as well as the translated representation.

This allows:

* Re-translation
* Language switching
* Debugging
* Conversation history
* Translation improvements

---

# 54. Voice Communication Data Flow

Future voice communication:

```text
Microphone
    ↓
Audio Stream
    ↓
Realtime Transport
    ↓
Speech Recognition
    ↓
Language Detection
    ↓
Translation
    ↓
Speech Generation
    ↓
Audio Stream
    ↓
Recipient
```

Latency should be treated as a first-class architectural concern.

---

# 55. Video Communication

For video:

```text
Camera
   │
   ├── Video → WebRTC
   │
   └── Audio → Translation Pipeline
```

This allows:

```text
Face-to-face video
+
Real-time translated speech
```

The goal is not necessarily to translate the video itself.

The communication layer translates the audio while the video remains a normal real-time video stream.

---

# 56. Redis and Background Jobs

The planned architecture includes:

```text
Redis
BullMQ
```

These can eventually handle asynchronous work such as:

* Notifications
* Media processing
* Translation jobs
* Audio processing
* Cleanup jobs
* Analytics
* Retry queues

Real-time communication should not depend on slow background jobs when immediate response is required.

---

# 57. File Storage

The planned architecture includes:

```text
AWS S3
```

or:

```text
Cloudflare R2
```

These can store:

* Profile images
* Voice samples
* Audio files
* Video assets
* Other media

Do not store large media directly inside PostgreSQL.

The database should generally store metadata and references.

---

# 58. Database Principle

PostgreSQL should contain structured application data.

For example:

```text
users
profiles
languages
contacts
conversations
messages
translations
calls
media
```

Large binary data should normally be stored in object storage.

---

# 59. Performance Principles

DualWave will eventually become a real-time application, so performance matters from the beginning.

Important principles:

### Avoid unnecessary renders

Use appropriate Zustand selectors.

### Avoid huge global state

Only put truly global state into Zustand.

### Avoid unnecessary API requests

Cache data where appropriate.

### Optimize images

Do not upload enormous images unnecessarily.

### Keep real-time messages lightweight

Do not send unnecessarily large payloads through WebSockets.

### Measure latency

Especially for:

```text
Speech recognition
Translation
TTS
WebRTC
```

---

# 60. Code Quality Rules

Follow these principles:

### Prefer clear code over clever code.

### Keep files focused.

### Keep components small.

### Keep business logic out of UI components.

### Use TypeScript types.

### Reuse existing components.

### Avoid duplication.

### Do not hard-code secrets.

### Do not commit `.env` secrets.

### Handle loading and errors.

### Write tests for important business logic.

---

# 61. Git Workflow

Before starting work:

```bash
git pull
```

Create a focused branch:

```bash
git checkout -b feature/chat-system
```

Make small commits.

Example:

```text
feat: add chat navigation
feat: add conversation service
feat: add message model
fix: resolve authentication redirect
```

Avoid giant commits containing unrelated changes.

---

# 62. Pull Request Rules

A pull request should explain:

```text
What changed?
Why was it changed?
How was it tested?
Are there any known limitations?
```

Example:

```text
## What changed

Added the initial conversation screen.

## Why

Users need a UI for starting multilingual conversations.

## Testing

- Android emulator
- Login flow
- Navigation flow
- TypeScript compilation

## Notes

Translation backend is not connected yet.
```

---

# 63. Things a Developer Should NOT Do

Do not:

* Put API calls directly everywhere.
* Put secrets inside the mobile application.
* Create duplicate components.
* Modify navigation without understanding auth/profile state.
* Store everything in Zustand.
* Put business logic into JSX.
* Create random utility files.
* Introduce a new dependency without a reason.
* Break the existing authentication flow.
* Assume planned architecture is already implemented.
* Build communication features without considering latency.
* Implement voice cloning without consent/security considerations.

---

# 64. Current Dependency Stack

The current `package.json` includes important dependencies such as:

```text
React Native 0.87.1
React 19.2.3

React Navigation
Zustand
Supabase
AsyncStorage
react-native-config
react-native-image-picker
react-native-safe-area-context
react-native-screens
countries-list
```

Development tooling includes:

```text
TypeScript
Jest
ESLint
Prettier
Metro
React Native CLI
```

The exact dependency versions should always be taken from the repository's `package.json` rather than copied from external documentation.

---

# 65. Important Distinction: Current vs Planned

A new developer must understand this distinction.

## Already present / foundation

```text
React Native
TypeScript
Navigation
Authentication structure
Profile flow
Supabase integration
Zustand
Reusable components
Storage layer
Service architecture
Android/iOS projects
```

## Planned / future

```text
Node.js backend
Express API
WebSockets
WebRTC
PostgreSQL/Prisma backend
Redis/BullMQ
Translation engine
Whisper/STT
ElevenLabs/TTS
Voice cloning
Real-time multilingual calls
```

The repository README describes these as the intended architecture; they should not be assumed to be completely implemented merely because they appear in the architecture documentation.

---

# 66. Development Roadmap

The recommended development progression is:

```text
PHASE 1
Project foundation
       ↓
PHASE 2
Authentication
       ↓
PHASE 3
Profiles
       ↓
PHASE 4
Contacts / Users
       ↓
PHASE 5
Text messaging
       ↓
PHASE 6
Translation
       ↓
PHASE 7
Voice messaging
       ↓
PHASE 8
Real-time voice calls
       ↓
PHASE 9
Video calls
       ↓
PHASE 10
Voice cloning
       ↓
PHASE 11
Optimization
       ↓
PHASE 12
Production deployment
```

This sequence reduces architectural risk because each stage builds on the previous one.

---

# 67. First Major Communication Milestone

The first major communication milestone should be:

> Two authenticated users can send text messages to each other in real time.

Before introducing complicated AI voice infrastructure, the basic communication system should work reliably.

The flow should be:

```text
User A
  ↓
Select User B
  ↓
Create/Open Conversation
  ↓
Send Message
  ↓
Backend
  ↓
Realtime Event
  ↓
User B
```

Once that works:

```text
Message
  ↓
Translation
  ↓
Translated Message
```

can be introduced.

Then:

```text
Text
  ↓
Speech
```

and eventually:

```text
Speech
  ↓
Translation
  ↓
Translated Speech
```

---

# 68. The Core Product Loop

Everything in DualWave eventually revolves around this loop:

```text
PERSON A
   │
   │ speaks
   ▼
UNDERSTAND
   │
   ▼
TRANSLATE
   │
   ▼
GENERATE
   │
   ▼
PERSON B
   │
   │ responds
   ▼
UNDERSTAND
   │
   ▼
TRANSLATE
   │
   ▼
GENERATE
   │
   ▼
PERSON A
```

This is the heart of DualWave.

The UI, backend, database, AI services, real-time infrastructure, and media systems should ultimately support this experience.

---

# 69. Mental Model for New Developers

When working on DualWave, think about the project in five layers:

```text
                    DUALWAVE
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
     CLIENT          BACKEND             AI
       │               │                │
       │               │                │
 React Native       Node.js         Translation
 Navigation         API             STT
 Zustand            WebSocket       TTS
 UI                 Database        Voice AI
       │               │                │
       └───────────────┼────────────────┘
                       │
                       ▼
                REAL-TIME USER
                COMMUNICATION
```

Whenever implementing something, ask:

1. Is this UI?
2. Is this application state?
3. Is this business logic?
4. Is this backend communication?
5. Is this AI/communication infrastructure?

Then put the code in the appropriate layer.

---

# 70. New Developer Quick Start

A developer joining DualWave should do this:

```bash
git clone https://github.com/nitindahiya-dev/DualWave.git

cd DualWave

npm install
```

Start Metro:

```bash
npm start
```

Run Android:

```bash
npm run android
```

Run tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Then read these files in this order:

```text
1. README.md

2. App.tsx

3. src/navigation/RootNavigator.tsx

4. src/navigation/AuthNavigator.tsx

5. src/navigation/ProfileSetupNavigator.tsx

6. src/navigation/AppNavigator.tsx

7. src/store/authStore.ts

8. src/services/auth/authService.ts

9. src/store/profileStore.ts

10. src/services/profile/

11. src/screens/

12. src/components/

13. src/types/

14. src/services/
```

This gives a developer a logical understanding of the project rather than randomly opening files.

---

# 71. Final Architecture Summary

The current and future architecture can be summarized as:

```text
                         DUALWAVE
                            │
                            ▼
                  ┌─────────────────┐
                  │  React Native   │
                  │    Mobile App   │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         Navigation     Zustand      Services
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                     Backend API
                           │
              ┌────────────┼─────────────┐
              │            │             │
              ▼            ▼             ▼
          PostgreSQL    WebSockets      Storage
              │            │
              │            ▼
              │        Real-Time
              │     Communication
              │
              ▼
        User / Profile /
        Conversation Data
                           │
                           ▼
                    AI Communication
                         Layer
                           │
              ┌────────────┼─────────────┐
              │            │             │
              ▼            ▼             ▼
             STT      Translation       TTS
           Whisper    DeepL / LLM    ElevenLabs
              │            │             │
              └────────────┼─────────────┘
                           │
                           ▼
                  Translated Speech
                           │
                           ▼
                     OTHER USER
```

---

# 72. The Most Important Principle

DualWave should always be developed around one fundamental principle:

> **The technology should disappear behind the communication experience.**

A user should not need to think:

```text
"Which translation service is being used?"
"Which language API is running?"
"How is the audio being processed?"
```

They should simply experience:

```text
I speak my language.
The other person understands me.
They speak their language.
I understand them.
```

That is the actual product.

Everything else is engineering required to make that experience possible.

---

# 73. Documentation Maintenance

This document should evolve with the project.

Whenever a major architectural decision changes, update the documentation.

Examples:

* New backend architecture
* Database changes
* Authentication changes
* Navigation changes
* AI provider changes
* Communication protocol changes
* New environment variables
* Deployment architecture
* Security model

Do not allow documentation and implementation to drift apart.

The repository should always make it possible for a new developer to answer:

```text
What is DualWave?
How does it work?
Where is the code?
Why is it structured this way?
How do I run it?
How do I add a feature?
What is implemented?
What is planned?
```

If this document can answer those questions, a new developer should be able to join the project without needing the original developer to explain the entire codebase manually.

---

# 74. Repository Reference

Official repository:

`https://github.com/nitindahiya-dev/DualWave`

The current repository contains the React Native project, Android/iOS native projects, source architecture, tests, configuration files, and project documentation.

**Last documented project state:** September 2026.

**Status:** Active development / foundation phase.
