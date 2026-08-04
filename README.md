<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</div>

<h1 align="center">Futura 2026 Platform</h1>

<p align="center">
  <strong>The official web platform for Futura 2026, Padjadjaran University's Technology Event.</strong>
</p>

<p align="center">
  A web application built to handle registrations, scheduling, and information for seminars, robotics competitions, and research showcases.
</p>

<hr />

## Key Features

- **UI/UX:** Custom Aurora Ribbon background and parallax scrolling components.
- **Tech Stack:** Built with Next.js 16, React 19, and Tailwind CSS 4.
- **Type Safety:** TypeScript integration and form validation with Zod.
- **Backend:** Integrated with Supabase for authentication and database management.
- **Animations:** Micro-animations built with Framer Motion.
- **Component Design:** Built using Radix UI primitives and shadcn/ui.

## Tech Stack

### Core
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4

### Data & Backend
- **Database & Auth:** Supabase (SSR integrated)
- **Data Fetching:** Tanstack React Query
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod

### UI & Aesthetics
- **Component Library:** shadcn/ui + Radix UI
- **Animations:** Framer Motion (`motion`), `tw-animate-css`
- **Tables & Charts:** Tanstack React Table, Recharts
- **Icons & Typography:** Lucide React, next/font (Geist)

### Tooling & Infrastructure
- **Email:** Resend
- **Analytics:** Vercel Analytics
- **Date Handling:** `date-fns`
- **Smooth Scrolling:** Lenis

## Getting Started

To run the project locally, follow these steps:

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd futura-unpad
```

### 2. Install dependencies
```bash
npm install
# or yarn install / pnpm install
```

### 3. Setup Environment Variables
Duplicate the `.env.example` file and rename it to `.env`:
```bash
cp .env.example .env
```
Ensure you fill in all the required Supabase and Resend API keys.

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will hot-reload as you make changes.

## Design Philosophy

The web platform features:
- A `#00205B` base theme.
- CSS-driven Aurora ribbons for visual depth.
- Scroll-revealed sections from Hero to FAQ.

## Project Structure

```text
futura-unpad/
├── app/               # Next.js App Router (Pages, Layouts, API routes)
├── components/        # Reusable UI elements
│   ├── landing/       # Sections specific to the home page (Hero, Timeline, etc.)
│   └── ui/            # Base components (Buttons, Inputs, ScrollReveal, etc.)
├── lib/               # Utility functions and shared logic
├── hooks/             # Custom React hooks
├── store/             # Zustand global state configurations
├── public/            # Static assets (images, fonts, etc.)
└── ...
```

<hr />
<p align="center">
  Built with Buckle Parry for <b>Futura 2026</b>.
</p>
