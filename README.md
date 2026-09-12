## DualWave — AI-powered real-time communication

An AI-powered real-time communication app that lets people communicate across languages using text, voice, video calls, and face-to-face modes — preserving the speaker's natural voice via AI voice cloning.

Core features

- Real-time multilingual voice and text communication
- Low-latency streaming pipeline for live calls
- AI voice cloning for natural translated speech
- Support for text chat, voice, video, and face-to-face modes

Core stack

- Mobile: React Native CLI + TypeScript
- Styling: NativeWind / Tailwind
- State: Zustand
- Navigation: React Navigation
- Backend: Node.js + Express
- Real-time: Socket.io / WebSockets
- Video: WebRTC
- Database: PostgreSQL + Prisma
- Background jobs: Redis + BullMQ
- Storage: AWS S3 / Cloudflare R2
- Translation: DeepL / LLMs
- STT: Whisper
- TTS / Voice cloning: ElevenLabs
- Business model: Freemium / Pro / Enterprise

Important architecture — AI communication pipeline

User speaks → Audio capture → Whisper (STT) → Text → Translation (LLM / DeepL) → Translated text → ElevenLabs TTS (cloned voice) → Translated audio → Recipient

Notes

- For live calls the pipeline must be streaming/low-latency (not per-utterance batch processing).
- Voice cloning must respect user consent, privacy, and legal constraints.

Quick start (project local dev)

Requirements: Node 14+, React Native environment.

Install and run:

```bash
npm install
npm start
npm run android   # or: npm run ios (macOS)
```

Run tests:

```bash
npm test
```

Project layout (high level)

- `src/` — app source (components, screens, navigation, services)
- `android/`, `ios/` — native projects
- `__tests__/` — Jest tests

Contributing

- Open a focused pull request with a clear description of changes.

License: MIT
