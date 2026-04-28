# Bookworm AI — Product Requirements Document
**Hackathon Edition | Version 2.0 | Voice-First Update**

> *Where every book finds its voice.*
> Upload. Speak. Listen. Connect.

**Timeline:** 10 Weeks | **Target:** Hackathon Submission

---

## 1. Executive Summary

Bookworm AI is a voice-first web platform for book lovers, students, and lifelong learners. Users upload their own books as PDFs or browse a curated library, then have real-time spoken conversations with an AI that has full contextual knowledge of each book. Rather than typing queries, users speak naturally — the AI listens, retrieves relevant passages, and speaks back in a distinct voice persona chosen for that book. A live transcript runs alongside the conversation so nothing is missed.

Beyond individual reading, the platform includes a social layer that connects readers who share similar tastes, enabling community discussions, book recommendations, and shared reading experiences.

| Property | Value |
|---|---|
| Project Name | Bookworm AI |
| Version | MVP 2.0 — Voice-First Hackathon Build |
| Timeline | 10 Weeks |
| Primary Stack | Next.js, MongoDB, Vapi, Claude API / OpenAI GPT-4o |
| Voice Provider | Vapi (orchestration) + ElevenLabs (voice synthesis) |
| Interaction Mode | Voice-primary with live text transcript |
| Voice Per Book | Yes — user selects a voice persona at upload time |
| Deployment Target | Vercel (Free Tier) |
| Inspired By | JavaScript Mastery — Bookified Project |

---

## 2. Problem Statement & Vision

### 2.1 The Problem

Reading a book is a solitary and passive experience. Most readers finish with unanswered questions, half-remembered ideas, and no one to discuss it with. Existing AI reading tools require typing — which breaks the flow and feels transactional rather than like a genuine conversation.

- Readers cannot ask a book a question and hear the answer spoken back naturally.
- Typing to an AI about a book feels cold and disconnected from the reading experience.
- There is no platform that combines voice AI, personal book uploads, and a reading community.
- Book communities are fragmented across platforms with no shared AI-powered discussion layer.

### 2.2 The Vision

Bookworm AI turns every book into a speaking companion. Pick up your phone, tap the mic, and ask *Atomic Habits* "What habit should I build first?" — and hear an answer grounded in the actual pages of the book, spoken back to you in a warm, natural voice. Each book has its own voice persona, making the experience feel alive and personal. A live transcript means you never lose track of what was said.

### 2.3 Target Users

- **Avid readers** who want a richer, more interactive relationship with their books.
- **Students** using academic PDFs who want to ask questions hands-free while studying.
- **Book club members** who want a shared AI-powered discussion space.
- **Commuters and multitaskers** who prefer listening over reading or typing.

---

## 3. Voice Architecture

The voice system is the most technically distinctive part of Bookworm AI. It is built on three interlocking layers: Vapi for real-time voice orchestration, MongoDB text search for book segment retrieval, and an LLM (GPT-4o or Claude) for generating responses.

### 3.1 How a Voice Conversation Works — Step by Step

1. User opens a book page and taps the microphone button to start a session.
2. Vapi initialises a real-time voice call using the browser's microphone.
3. The user speaks a question. Vapi's transcriber (Deepgram) converts speech to text in real time.
4. Vapi passes the transcribed question to the configured LLM assistant along with the book title, author, and book ID as variable context.
5. The LLM, using a custom tool called `search_book`, sends a POST request to our Next.js backend at `/api/vapi/search-book` with the query and book ID.
6. Our backend runs a MongoDB text search across the book's segments and returns the top 3 most relevant passages.
7. The LLM uses those passages as context to generate a grounded, accurate response.
8. Vapi's voice synthesis (ElevenLabs) converts the response to speech using the book's chosen voice persona.
9. The spoken response plays through the browser. Simultaneously, both the user's words and the AI's words stream into the live transcript panel.
10. The user can respond verbally and the cycle continues naturally.

### 3.2 Vapi Configuration

Each book conversation uses a single shared Vapi assistant configured with:

- **Model:** GPT-4o-mini (fast, low-latency) or Claude Haiku.
- **First message:** Dynamically injected — e.g. *"Hey! I'm ready to talk about [Book Title] by [Author]. What would you like to know?"*
- **System prompt:** Instructs the AI to act as the book itself — knowledgeable, engaging, and grounded only in the book's content. Prompt is provided in the constants file.
- **Tool:** `search_book` — a custom Vapi tool that calls `/api/vapi/search-book` with the `query` and `bookId` parameters. The tool URL points to the deployed Vercel app.
- **Voice:** Overridden programmatically per book using the ElevenLabs voice ID stored on the book document in MongoDB.
- **Turn-taking:** Configured with a short silence timeout (~0.5s) for natural back-and-forth pacing.

### 3.3 Voice Personas

When uploading a book, the user selects a voice persona from a curated list. Each persona maps to an ElevenLabs voice ID.

| Persona Name | Gender | Character | Best For |
|---|---|---|---|
| Daniel | Male | Warm, thoughtful, articulate | Non-fiction, self-help, biography |
| Rachel | Female | Clear, calm, professional | Academic texts, science, business |
| Chris | Male | Energetic, conversational, upbeat | Fiction, adventure, personal development |
| Aria | Female | Expressive, engaging, storytelling | Literature, fiction, memoirs |
| Marcus | Male | Deep, measured, authoritative | History, philosophy, technical books |

Voice IDs are stored in `constants.ts` and injected into the Vapi start call at runtime. The user's chosen persona is saved on the Book document in MongoDB under the `persona` field.

### 3.4 Live Transcript

The transcript panel runs alongside the voice interface and displays the full conversation in real time. It is powered by Vapi's message event system:

- `transcript.partial` events stream words as they are spoken (both user and AI).
- `transcript.final` events mark a complete utterance and add it permanently to the conversation log.
- Messages are styled differently for **user** (right-aligned) and **AI** (left-aligned) to mimic a chat interface.
- The transcript auto-scrolls to the latest message.
- When the session ends, the full transcript is available for the user to review.

### 3.5 Session State Machine

| State | Meaning | UI Indicator |
|---|---|---|
| `idle` | No active session. Mic button is off. | Grey microphone icon |
| `connecting` | Vapi is initialising the call. | Spinner, "Connecting..." label |
| `listening` | Waiting for user to speak. | Pulsing green dot, "Listening" label |
| `thinking` | LLM is processing the response. | Animated dots, "Thinking" label |
| `speaking` | AI is speaking the response. | Animated waveform, "Speaking" label |
| `ended` | Session closed by user or timeout. | Grey mic, transcript preserved |

---

## 4. Technology Stack

| Layer | Technology | Purpose / Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Full-stack React framework. Server components + client hooks for voice UI. |
| Language | TypeScript | End-to-end type safety across the whole codebase. |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with accessible pre-built components. |
| Voice Orchestration | Vapi (`@vapi-ai/web`) | Manages real-time voice calls, turn-taking, STT, and tool dispatch. Free tier available. |
| Voice Synthesis | ElevenLabs (via Vapi) | High-quality natural voices. Multiple personas per Vapi voice configuration. |
| Speech-to-Text | Deepgram (via Vapi) | Real-time transcription of user speech, included in Vapi's pipeline. |
| AI / LLM | GPT-4o-mini or Claude Haiku | Low-latency conversational responses. Injected with retrieved book segments as context. |
| Backend | Next.js API Routes | Serverless functions for file uploads, AI search endpoint, and Vapi tool handler. |
| Database | MongoDB Atlas (Free Tier) | Stores books, segments (text-indexed), users, comments, and voice sessions. |
| PDF Processing | `pdfjs-dist` | Client-side PDF text extraction and cover image generation from page 1. |
| File Storage | Cloudinary (Free Tier) | Stores uploaded PDFs and cover images. 25GB free storage. |
| Authentication | Clerk (Free Tier) | Auth + user management. Free for up to 50,000 monthly active users. |
| Text Search | MongoDB Text Indexes | Native full-text search on book segments. No separate vector DB required. |
| ORM | Mongoose | Schema validation and query building for MongoDB. |
| Deployment | Vercel (Free Tier) | Required for Vapi tool calls — the search-book endpoint must be publicly reachable. |
| Forms | React Hook Form + Zod | Performant, validated forms for book upload and user profile. |
| Notifications | Sonner (Toast) | Lightweight toast notifications from shadcn. |

### 4.1 Why Vapi for Voice

Vapi was chosen because it handles the hardest parts of real-time voice AI: WebRTC audio streaming, acoustic echo cancellation, turn detection, and tool call dispatching. Without Vapi, building a real-time voice pipeline from scratch would consume the majority of the 10-week timeline. Vapi's free tier is sufficient for hackathon-scale usage.

---

## 5. Data Models

### 5.1 Book

- `_id`, `clerkId` (owner), `title`, `author`, `slug` (unique, lowercase)
- `persona` (ElevenLabs voice ID string — chosen at upload)
- `fileUrl`, `fileBlobKey`, `coverUrl`, `coverBlobKey`, `fileSize`
- `totalSegments` (count), `createdAt`, `updatedAt`

### 5.2 BookSegment

- `_id`, `clerkId`, `bookId` (ref to Book), `content` (**text-indexed**)
- `segmentIndex`, `pageNumber`, `wordCount`
- Compound index: `(bookId + segmentIndex)` for ordered retrieval.
- Text index on `content` field for full-text search queries.

### 5.3 VoiceSession

- `_id`, `clerkId`, `bookId`, `startedAt`, `endedAt`, `durationSeconds`
- `billingPeriodStart` (first day of current month — for usage tracking)
- Index on `(clerkId + billingPeriodStart)` for monthly usage queries.

### 5.4 User Extension (MongoDB + Clerk)

- `clerkId`, `displayName`, `bio`, `favoriteGenres`
- `booksRead` (array of bookIds), `followers`, `following` (arrays of clerkIds)

### 5.5 Comment

- `_id`, `bookId`, `clerkId`, `content`, `likes` (array of clerkIds)
- `parentId` (for threaded replies), `createdAt`

---

## 6. API Route Structure

| Route | Method | Purpose |
|---|---|---|
| `/api/upload` | POST | Authenticated file upload handler for PDFs and cover images to Cloudinary. |
| `/api/vapi/search-book` | POST | **CRITICAL** — Vapi tool call handler. Receives `bookId` + `query`, runs MongoDB text search, returns top 3 segments as a single string. |
| `/api/books` | GET | Returns paginated list of all books in the library, sorted newest first. |
| `/api/books/[slug]` | GET | Returns single book document with metadata. |
| `/api/books/[id]/comments` | GET/POST | Fetches or creates comments on a specific book. |
| `/api/social/follow` | POST | Follows or unfollows a user by clerkId. |

> [!IMPORTANT]
> The `/api/vapi/search-book` route is the most critical endpoint in the entire system. Vapi calls it during every voice session whenever the AI needs book content. It must be **deployed and publicly accessible** for voice conversations to work. This is why Vercel deployment is required even during development — or alternatively, a tool like `ngrok` can expose the local server during testing.

---

## 7. Feature Specifications

### 7.1 Phase 1 — Core Voice MVP (Weeks 1–5)

#### F1 — PDF Book Upload
- User uploads a PDF via drag-and-drop or file picker (max 50MB).
- User optionally uploads a cover image; if not provided, page 1 of the PDF is used.
- User enters title, author name, and selects a voice persona from the list of 5 options.
- System parses PDF with `pdfjs-dist`, splits into ~500-word segments, saves to MongoDB.
- Text index created on segment content for search.
- Real-time upload progress shown with status overlay ("Processing your book...").
- Validation: PDF only, max 50MB. Images max 10MB (JPEG, PNG, WebP).

#### F2 — Voice Book Conversation (Core Feature ⭐)
- User opens a book page and sees the book cover, title, author, and voice persona.
- A microphone button starts the Vapi voice session.
- AI speaks a personalised opening message referencing the book title.
- User speaks naturally; AI listens, retrieves relevant segments, and responds in the book's voice.
- Live transcript panel displays all spoken words in real time (user right, AI left).
- Session status indicator shows: `connecting`, `listening`, `thinking`, `speaking`.
- Animated visual feedback: pulsing dot when listening, waveform when AI is speaking.
- Microphone button doubles as stop button to end the session.
- Session duration timer counts up during the conversation.
- Session is saved to MongoDB (VoiceSession document) for usage tracking.

#### F3 — Book Library Homepage
- Responsive grid of all uploaded books with cover, title, and author.
- Search bar filters by title or author (debounced, reflected in URL params).
- Books sorted newest first. Empty state shown if no books exist yet.

#### F4 — User Authentication
- Sign up / sign in via email or Google OAuth (Clerk).
- Protected routes redirect unauthenticated users.
- User avatar and name shown in navbar when signed in.

### 7.2 Phase 2 — Discovery & Profiles (Weeks 6–7)

#### F5 — Curated Book Database
- Pre-populated library of 20–30 popular books (sourced from Open Library API).
- Users can browse and start a voice conversation with any curated book immediately.
- Category filters: Fiction, Non-Fiction, Self-Help, Science, Biography.

#### F6 — User Profiles
- Public profile page showing uploaded books, reading history, and bio.
- Favourite genres selector. Follower / following counts.

### 7.3 Phase 3 — Social Layer (Weeks 8–10)

#### F7 — Book Comments & Discussions
- Text comment threads on every book page. Threaded replies (one level). Likes.

#### F8 — Follow & Activity Feed
- Follow other readers. Activity feed shows recent books read and comments by followed users.

#### F9 — AI Book Recommendations
- After a voice session, AI suggests 3 related books from the library.
- Displayed on the book detail page post-conversation.

---

## 8. Execution Plan — 10-Week Timeline

> [!NOTE]
> Phase 1 (weeks 1–5) is **non-negotiable** for hackathon submission. Phases 2 and 3 are stretch goals. The voice conversation feature is the centrepiece of the demo and must be working and polished before any social features are attempted.

| Week | Focus | Deliverables |
|---|---|---|
| Week 1 | Project Setup | Initialise Next.js + TypeScript + Tailwind + shadcn/ui. Configure Clerk auth. Set up MongoDB Atlas. Create Cloudinary account. Set up Vapi account and create the assistant. Push initial repo to GitHub. |
| Week 2 | Core UI | Build Navbar, Homepage book grid, Add New Book page with upload form including voice persona selector. Define all TypeScript interfaces and Mongoose schemas: Book, BookSegment, VoiceSession. |
| Week 3 | PDF Pipeline | Implement `pdfjs-dist` PDF parsing and 500-word segment splitting. Build server actions: `createBook`, `saveBookSegments`, `checkBookExists`, `getAllBooks`. Wire up Cloudinary upload route at `/api/upload`. |
| Week 4 | Vapi Voice Integration | Configure Vapi assistant with system prompt, GPT-4o-mini model, and `search_book` tool. Build `/api/vapi/search-book` endpoint. Implement `useVapi` hook with full session state machine. Build voice UI with mic button, status indicators, and transcript panel. |
| Week 5 | Polish & Testing | End-to-end test: upload a book, start a voice session, confirm AI answers correctly from book content. Fix edge cases. Add debounced search on homepage. Deploy to Vercel. First working demo complete. |
| Week 6 | Curated Library | Integrate Open Library API for book metadata. Build curated library page with category filters. Pre-process and store segments for 20 popular books. |
| Week 7 | User Profiles | Build user profile pages. Add reading history tracking. Implement favourite genres selector. |
| Week 8 | Comments | Build comment system with threaded replies and likes. Server actions for comment CRUD. |
| Week 9 | Social Features | Implement follow / unfollow. Activity feed. AI book recommendations after voice sessions. |
| Week 10 | Hackathon Prep | Full QA pass. Mobile responsiveness fixes. Performance optimisation. Prepare demo video, README, and architecture diagram. Final Vercel deployment. |

---

## 9. Recommended Folder Structure

```
bookworm-ai/
  app/
    (root)/
      page.tsx               ← Homepage / Book Library
      books/
        new/page.tsx         ← Upload form with persona selector
        [slug]/page.tsx      ← Book detail + voice conversation page
      library/page.tsx       ← Curated book browser
      profile/[id]/page.tsx
    api/
      upload/route.ts        ← Cloudinary file upload handler
      vapi/
        search-book/route.ts ← Vapi tool call handler (CRITICAL)
    layout.tsx
    globals.css
  components/
    BookCard.tsx
    UploadForm.tsx           ← Includes persona voice selector
    VapiControls.tsx         ← Mic button + status indicators
    Transcript.tsx           ← Live streaming transcript panel
    Navbar.tsx
    CommentSection.tsx
    UserProfile.tsx
  database/
    mongoose.ts              ← Cached DB connection
    models/
      book.model.ts
      book-segment.model.ts
      voice-session.model.ts
      comment.model.ts
  lib/
    actions/
      book.actions.ts
      session.actions.ts     ← startVoiceSession, endVoiceSession
      comment.actions.ts
    constants.ts             ← Vapi config, voice persona IDs
    utils.ts                 ← parsePDF, splitIntoSegments, generateSlug
  hooks/
    useVapi.ts               ← Full voice session state machine
    useSubscription.ts
  types.d.ts
  .env.local
  next.config.ts
```

---

## 10. Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bookworm

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Vapi
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id

# App URL (CRITICAL: Vapi tool calls must reach this endpoint)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

> [!WARNING]
> `NEXT_PUBLIC_APP_URL` must point to a publicly accessible domain. **Vapi cannot call localhost.** During development, use `ngrok` to expose your local server, or always deploy to Vercel before testing voice features.

---

## 11. Cost Breakdown — Staying Free

| Service | Free Tier | Expected Usage | Cost Risk |
|---|---|---|---|
| Vapi | ~10 minutes/month free, then $0.05/min | Demo: ~30–60 mins total. Budget ~$2–3. | Low |
| ElevenLabs (via Vapi) | Included in Vapi pricing | Covered by Vapi plan | None |
| MongoDB Atlas | 512MB storage | ~100 books with segments fits easily | Very Low |
| Cloudinary | 25GB storage + bandwidth/month | PDF and cover images for demo | None |
| Clerk | 50,000 MAU free | Hackathon scale — dozens of users | None |
| Vercel | 100GB bandwidth/month | Demo traffic only | None |
| Open Library API | Unlimited (public) | Book metadata and covers | None |

> [!NOTE]
> At $0.05 per minute, a 10-minute demo session costs $0.50. Budget around **$5–10** for the full hackathon period. This is the only service in the stack that is not fully free, but it is the most impactful feature for judges.

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Vapi cannot reach `/api/vapi/search-book` in development | Voice sessions start but AI has no book context | Always deploy to Vercel before voice testing. Or use ngrok tunnel locally. |
| Large PDF exceeds Next.js server action body limit | Upload fails silently | Set `serverActions.bodySizeLimit` to `100MB` in `next.config.ts` |
| MongoDB Atlas IP whitelist blocks Vercel serverless IPs | DB connection errors in production | Whitelist `0.0.0.0/0` in Atlas Network Access settings |
| PDF contains only scanned images (no text) | Segments are empty, AI cannot answer | Detect empty parse result, show clear error toast to user |
| Vapi turn detection cuts off user mid-sentence | Poor conversation experience | Tune endpointing sensitivity in Vapi dashboard. Set silence timeout to 0.6s+ |
| AI responds with information not in the book | Inaccurate, confabulated answers | Strengthen system prompt: *"Only answer from the provided book segments. If unsure, say so."* |
| Scope creep | Phase 1 not complete by hackathon | Hard-lock Phase 1 as non-negotiable. Social features are strictly stretch goals. |

---

## 13. Success Criteria

### 13.1 Must Have — Non-Negotiable for Submission ✅

- User can sign up and sign in via Clerk.
- User can upload a PDF book with title, author, and a chosen voice persona.
- System parses PDF, creates and stores text-indexed segments in MongoDB.
- User can open a book and start a real-time voice conversation using Vapi.
- AI responds with answers grounded in the actual book content via segment retrieval.
- A live transcript displays the full conversation in real time.
- Session status (`connecting`, `listening`, `thinking`, `speaking`) is clearly reflected in the UI.
- Application is deployed and publicly accessible on Vercel.

### 13.2 Should Have — Strong Hackathon Demo 🎯

- Curated library of pre-loaded popular books available for immediate voice chat.
- Per-book voice persona is audibly distinct and matches the persona selected at upload.
- User profile pages with reading history.

### 13.3 Nice to Have — Wow Factor ✨

- Comment threads and social interactions on book pages.
- Follow system and activity feed.
- AI-generated book recommendations after each voice session.

---

*Let your books speak for themselves.*

**Bookworm AI — PRD v2.0 (Voice-First) | Good luck at the hackathon!**
