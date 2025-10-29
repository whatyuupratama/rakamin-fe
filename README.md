# as-rakamin

## Project Overview
as-rakamin is a recruitment workflow playground that mirrors the Rakamin hiring experience from both the recruiter and candidate perspectives. The app delivers a polished admin console for HR teams to draft, publish, and monitor job postings, while simultaneously offering a responsive candidate portal with rich job cards, detailed views, and a multi-step resume submission flow. Webcam-guided photo capture, salary formatting, and localized copy help demonstrate how thoughtful UX details can remove friction for applicants and talent partners alike. Authentication supports traditional credentials and passwordless magic links, with session tokens stored securely in cookies and demo data persisted in the browser so the experience functions without a backing database.

## Key Features
- Full job lifecycle management: create, revisit, and update postings with real-time filtering and status badges for draft, active, and inactive roles.
- Candidate-centric job board that keeps selections in sync, surfaces salary/location metadata, and gracefully handles empty states.
- Resume wizard featuring guided webcam capture, countdown-assisted photos, and configurable application sections to showcase richer digital onboarding.
- LocalStorage-powered persistence for credentials, sessions, application drafts, and job data, enabling demos without external services.
- Email magic-link pipeline that falls back to Nodemailer JSON preview when SMTP is missing, making it safe for local HR trainings.
- Responsive UI composed with Tailwind CSS utilities, shadcn-inspired primitives, Radix components, and iconography for an accessible feel.

## Why HR Teams Will Like It
- Accelerates hiring ops mockups by letting stakeholders experience the full admin-to-candidate journey in one place.
- Demonstrates how consistent local storage, session management, and JWT cookies can simulate production-ready access control for workshops.
- Highlights the impact of well-structured job data (salary ranges, metadata, and statuses) on transparency and reporting conversations.
- Provides a safe sandbox for testing onboarding flows—no real applicants or infrastructure needed.
- Offers recognizable UI patterns so recruiters can focus on process feedback instead of learning a new tool.

## Tech Stack Used
- Next.js 16 (App Router) with React 19 and TypeScript for end-to-end routing and type safety.
- Tailwind CSS 4, shadcn UI patterns, and Radix primitives to compose accessible layouts and reusable widgets.
- LocalStorage-backed utilities managing auth credentials, job postings, resume drafts, and session lifecycles.
- Nodemailer configured with Mailtrap sandbox credentials for magic-link delivery, plus date-fns, lucide-react, and react-icons for formatting polish.

## How to Run Locally
1. Install dependencies with `npm install` (Node.js 18+ recommended).
2. Create a `.env.local` file if you need real email delivery and set:
   ```bash
   AUTH_SECRET=replace-with-a-long-random-string
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-mailtrap-username
   SMTP_PASS=your-mailtrap-password
   ```
   Without these values the app falls back to development-safe defaults.
3. Start the development server with `npm run dev` and open `http://localhost:3000`.
4. Use the `/auth/register` page to create a demo account, then explore the admin (`/admin`) and user (`/user`) dashboards.
