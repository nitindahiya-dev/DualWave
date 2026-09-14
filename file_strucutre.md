Here’s the project structure for DualWave, based on the current repository contents and excluding unnecessary/generated items like node_modules:

DualWave/
├── android/
│   ├── app/
│   ├── gradle/
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   └── settings.gradle
│
├── ios/
│   ├── .xcode.env
│   ├── MyApp/
│   ├── MyApp.xcodeproj/
│   ├── Podfile
│   └── MyAppTests/ (if present in future generated setup)
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Loading.tsx
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
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── OTPScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ResetPasswordScreen.tsx
│   │   ├── Home/
│   │   │   └── HomeScreen.tsx
│   │   ├── Profile/
│   │   │   ├── CountryScreen.tsx
│   │   │   ├── CreateProfileScreen.tsx
│   │   │   ├── LanguageScreen.tsx
│   │   │   ├── ProfileCompleteScreen.tsx
│   │   │   └── ProfilePhotoScreen.tsx
│   │   ├── Splash/
│   │   │   └── SplashScreen.tsx
│   │   └── Welcome/
│   │       └── WelcomeScreen.tsx
│   │
│   ├── services/
│   │   ├── api/
│   │   │   └── apiClient.ts
│   │   ├── auth/
│   │   │   └── authService.ts
│   │   ├── profile/
│   │   │   ├── profileService.ts
│   │   │   └── profileStorageService.ts
│   │   ├── storage/
│   │   │   └── storageService.ts
│   │   └── supabase/
│   │       └── supabaseClient.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   └── profileStore.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── navigation.ts
│   │   └── profile.ts
│   │
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── validation.ts
│   │
│   └── assets/ (if added later)
│
├── __tests__/
│   └── App.test.tsx
│
├── App.tsx
├── app.json
├── babel.config.js
├── index.js
├── jest.config.js
├── metro.config.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── .gitignore
├── .eslintrc.js
├── .prettierrc.js
├── .watchmanconfig
└── .bundle
