# AGENT.md - Podcast Reader Project

## Build/Test Commands
- Build frontend: `expo build` or `npx expo build`
- Start development: `expo start` for React Native frontend  
- Backend dev: `npm run dev` (Express.js server)
- Test: `npm test` or `npx jest` for unit tests
- Lint: `npx eslint src/` for code quality
- TypeScript check: `npx tsc --noEmit`

## Task Management
- Use Task Master CLI: `task-master list`, `task-master next`, `task-master show <id>`
- Mark completed: `task-master set-status --id=<id> --status=done`
- Expand complex tasks: `task-master expand --id=<id> --research`

## Architecture
- Frontend: React Native with Expo (TypeScript)
- Backend: Node.js + Express + PostgreSQL
- AI: OpenAI GPT-4 for podcast summarization
- Data: Podscan.fm API for podcast transcripts
- Vector DB: Pinecone/Weaviate for topic clustering
- Auth: Auth0 or Firebase Auth

## Code Style
- TypeScript required for type safety
- ESLint + Prettier for formatting
- Folder structure: `/src/components`, `/src/screens`, `/src/services`, `/src/hooks`
- Error handling: Try/catch with proper user feedback
- Imports: Use absolute paths for src/ imports
