# CollegeCrush 💖

**Tagline:** _Beyond the Swipe. Real Connections._

**Live Demo:** [Launch CollegeCrush](https://main.d381bs2z51g534.amplifyapp.com/)

CollegeCrush is a Gen-Z-focused dating and real-world meetup platform designed exclusively for verified college students in India. Moving beyond simple swiping, it integrates unique features like AI-powered suggestions, location-based blind date proposals, group trips, and campus event discovery to foster genuine connections and real-world interactions.

This document provides a complete and detailed overview of the project, its features, architecture, and components.

---

## 🚀 Core Features & Page Breakdown

The application is a feature-rich platform with a modern, responsive UI. Here's a granular breakdown of every screen and its functionality.

### 1. Authentication & Onboarding
- **`LandingScreen.tsx`**: A beautiful, animated marketing page that serves as the entry point for logged-out users, detailing the app's features and vision.
- **`AuthGate.tsx`**: A simple router that directs new users to the landing page and returning users straight to the login screen.
- **`AuthScreen.tsx`**: Handles the secure, student-only verification process. It uses Supabase Auth to send a one-time password (OTP) to a user's official college email, ensuring an exclusive and safe community. It supports a predefined list of allowed college domains.
- **`OnboardingScreen.tsx`**: A guided, multi-step process for new users to build a rich profile. It captures essential information like name, DOB, gender, course, and bio, and allows users to upload their first profile picture, select interest tags, and answer three personality-revealing prompts.

---

### 2. Main Navigation & Core Loop
The app uses a responsive navigation system managed by `BottomNav.tsx` (mobile) and a sidebar (desktop). The main application state and routing logic are handled in `App.tsx`.

- **`SwipeScreen.tsx`**: The central hub of the app.
  - **Animated Card Stack:** Presents user profiles one by one with smooth animations powered by Framer Motion.
  - **Swipe Mechanics:** Users can swipe left (reject) or right (like). Swipes are recorded in the database via a secure RPC call.
  - **Real-time Matching:** When a mutual like occurs, a stunning `MatchPopup.tsx` component appears, allowing the user to immediately start a conversation.
  - **Swipe Limits:** Free users have a daily swipe limit, tracked using local storage.
  - **Integrated Ads:** For free users, ad cards (`AdCard.tsx`) are seamlessly interleaved into the swipe deck.

- **`LikesScreen.tsx`**: A premium feature screen.
  - **Premium View:** Displays a grid of all users who have liked the current user, allowing for instant matches.
  - **Free View:** Teases the feature by showing a grid of blurred profile cards, prompting users to upgrade.
  - **Real-time Updates:** The screen updates in real-time when a new "like" is received.

- **`ChatScreen.tsx`**: The messaging center.
  - **`ChatListScreen.tsx`**: Displays a list of all active conversations, showing the other user's profile picture, name, and the last message sent.
  - **`ChatDetailScreen.tsx`**: The main chat interface.
    - **Real-time Messages:** Powered by Supabase subscriptions for instant message delivery.
    - **Read Receipts:** Shows single-check for sent and double-check for read messages.
    - **Typing Indicator:** A "typing..." message appears in real-time.
    - **Infinite Scroll:** Older messages are loaded automatically as the user scrolls up.
    - **AI Icebreakers (`IcebreakerGenerator.tsx`):** A Gemini-powered button suggests creative opening lines based on the other user's profile.
    - **AI Rizz Meter:** After a few messages, a button appears allowing users to get their conversation rated by Gemini for charm and effectiveness.

- **`DatesScreen.tsx`**: For real-world meetups.
  - **Location-Based Proposals:** Premium users can propose a blind date. The `BookBlindDateModal.tsx` uses the Gemini API to suggest nearby, date-appropriate cafés.
  - **Discover & Accept:** Users can browse open date proposals from others in their vicinity and accept them.
  - **My Dates:** A list of all confirmed upcoming and past dates.
  - **VibeCheck System:** After a date, users are prompted with `VibeCheckModal.tsx` to provide feedback. A mutual "good" vibe converts the date into a match, unlocking chat.

- **`TripsScreen.tsx`**: For social getaways.
  - Displays a list of curated group trips (e.g., "Stranger Trips").
  - Users can view details, see the price and available slots, and book a spot.
  - Booking is handled by a secure database function that atomically decrements the slot count.

- **`EventsScreen.tsx`**: Discover campus happenings.
  - Shows a list of events from various colleges.
  - Users can RSVP as "Going" or "Interested," and the state is saved optimistically for a snappy UI.

- **`ProfileScreen.tsx`**: User's personal dashboard.
  - **Profile Summary:** Displays the user's main photo, name, college, and membership status.
  - **Membership Management:** Shows different subscription plans (Free, Trial, Premium) and handles the upgrade flow using a simulated Cashfree payment service.
  - **Profile Boost:** A premium feature allowing users to temporarily increase their visibility.
  - **Navigation:** Links to Settings and Edit Profile screens.

- **`EditProfileScreen.tsx`**: Allows for comprehensive profile customization.
  - **Photo Management:** Users can add new photos and reorder existing ones via drag-and-drop.
  - **Details Editing:** All profile fields, tags, and prompts can be updated.
  - **Live Previews:** Changes are reflected in the UI before saving.

- **`SettingsScreen.tsx`**: A centralized place for app and account configuration.
  - **Preferences:** Toggles for notification and privacy settings (e.g., "Show me on Swipe"). Changes are debounced and saved automatically.
  - **Theme Switcher:** Cycle between Light, Dark, and System themes.
  - **Account Actions:** Includes options for feedback, legal policies, and a secure account deletion flow.

---

## 🛠️ Tech Stack & Architecture

This project is built as a modern, serverless web application, prioritizing a rich user experience, real-time capabilities, and scalability.

### Frontend
- **React (v18):** The core library for building the component-based user interface.
- **TypeScript:** Ensures type safety, leading to more robust and maintainable code.
- **Tailwind CSS:** A utility-first CSS framework for rapid and consistent styling. The app features a custom dark mode and color palette.
- **Framer Motion:** A powerful animation library used for all UI animations, from page transitions to card swipes and modal pop-ups.
- **Lucide React:** A comprehensive and clean icon set used throughout the application.

### Backend (Backend-as-a-Service)
- **Supabase:** The all-in-one backend platform that powers the application.
  - **PostgreSQL Database:** The single source of truth for all application data, including profiles, swipes, messages, and more.
  - **Authentication:** Manages secure user sign-up, sign-in (via OTP "magic links"), and session handling, integrated with RLS policies.
  - **Storage:** Securely hosts user-uploaded profile pictures. Fine-grained access control is managed via Storage Policies to ensure users can only manage their own files.
  - **Realtime:** The backbone of the live features. It broadcasts database changes to subscribed clients, enabling real-time chat, notifications, and dynamic UI updates without needing to refresh.
  - **Database Functions (RPCs):** Complex and sensitive business logic is encapsulated in PL/pgSQL functions within the database. This is a key architectural choice for security and performance. Actions like handling a swipe, creating a match, or booking a trip are executed atomically on the server, preventing race conditions and ensuring data integrity.

### Artificial Intelligence
- **Google Gemini API (`@google/genai`):** Integrated for intelligent feature enhancements.
  - **Model:** `gemini-2.5-flash` is used for its speed and effectiveness in JSON-formatted outputs.
  - **Use Cases:**
    1.  **Cafe Suggestions:** Finds nearby, date-appropriate cafes based on user's geolocation for the Blind Date feature.
    2.  **Icebreaker Generation:** Creates personalized conversation starters based on a user's profile details.
    3.  **Conversation Rating ("Rizz Meter"):** Analyzes a chat history to provide a score and constructive feedback.

### Payments
- **Cashfree SDK:** The client-side SDK is integrated to handle the payment flow. The current implementation uses a **simulated backend call** for test purposes, but is structured to easily connect to a real backend endpoint.

---

## 🚀 Project Setup & Installation

To get a local instance of CollegeCrush running, you need a Supabase project and a Gemini API key.

### 1. Supabase Project Setup

1.  **Create a Project:** Go to [supabase.com](https://supabase.com), create an account, and start a new project. Save your **Project URL** and **`anon` key**.
2.  **Run Database Script:**
    - In your Supabase project dashboard, navigate to the **SQL Editor**.
    - Open the `database_setup.html` file from this repository.
    - Copy the **entire** SQL script and paste it into a new query in the SQL Editor.
    - Click **"Run"**. This script is idempotent (safe to run multiple times) and will create all tables, functions, triggers, and Row Level Security (RLS) policies.
3.  **Configure Storage:**
    - Open the `storage_setup.html` file.
    - In the SQL Editor, run the script under **"1. Storage Bucket"** to create the `profile-pics` bucket.
    - Then, run the script under **"2. Storage Policies"** to apply the necessary security rules.
4.  **Set Up Email Template:**
    - Go to **Authentication -> Email Templates** in your Supabase dashboard.
    - Open `supabase_email_template.html`, copy its content, and paste it into the **"Magic Link"** template. This ensures users receive a nicely formatted OTP email.

### 2. Environment Configuration

The application requires API keys to function.

- **Supabase Keys:**
  - Open `services/supabase.ts`.
  - Replace the placeholder `supabaseUrl` and `supabaseAnonKey` with the keys from your project's **API Settings**.
- **Gemini API Key:**
  - The application expects the Gemini API key to be available as an environment variable named `process.env.API_KEY`. The `services/gemini.ts` file is set up to read this. For local development without a build process, you may need to temporarily hardcode it or use a tool to manage environment variables.

### 3. Running the Application

This project is built as a static web app that leverages ES modules loaded via CDN (`esm.sh`). **There is no build step required.**

-   Simply open the `index.html` file in a modern web browser that supports ES modules (e.g., Chrome, Firefox, Safari, Edge).

---

## 📁 File Structure Overview

```
/
├── components/          # React components
│   ├── chat/            # Components specific to the chat interface
│   ├── common/          # Reusable components (EmptyState, TopBar)
│   ├── modals/          # Modal dialogs (ProfileDetailModal, BookBlindDateModal)
│   ├── screens/         # Top-level screen components for each main feature
│   └── skeletons/       # Loading state placeholders for a better UX
├── services/            # API interaction layer
│   ├── api.ts           # All Supabase interactions (CRUD, RPC calls)
│   ├── gemini.ts        # All Google Gemini API interactions
│   └── supabase.ts      # Supabase client initialization
├── hooks/               # Custom React hooks (useUser, useTheme, useNotification)
├── utils/               # Helper functions (date formatting, URL optimization)
├── App.tsx              # Main component: state management, routing, context providers
├── index.html           # The entry point of the web app, includes CDN imports and styles
├── index.tsx            # Renders the root React component
├── types.ts             # All TypeScript type definitions for the application
├── database_setup.html  # SQL script to set up the Supabase database schema and RLS
├── storage_setup.html   # SQL script to set up Supabase Storage buckets and policies
├── README.md            # This file
```

---

## 👥 The Team

-   **Anurag:** Team Leader & Frontend Developer
-   **Abhay:** Backend (Database & Auth)
-   **Shaurya:** Backend (API & Logic)
-   **Gauransh:** Frontend (UI & Responsiveness)

---

## 🚀 Deployment

This project is ready for deployment on various platforms. See `DEPLOYMENT.md` for detailed instructions.

### Quick Deploy

**Vercel (Recommended):**
1. Fork this repository
2. Go to [vercel.com](https://vercel.com) and import your fork
3. Set environment variable: `GEMINI_API_KEY=your_api_key`
4. Deploy!

**Local Development:**
```bash
npm install
npm run dev
```

**Production Build:**
```bash
npm run build
npm run preview
```

### Environment Variables
Copy `.env.template` to `.env` and fill in your values:
- `GEMINI_API_KEY`: Your Google Gemini API key
```