# How to Set Up Futura MVP Locally

Follow this guide to get the Futura MVP project running smoothly on your local machine with all features (Authentication, Database, Payments, and Admin Dashboard) fully functional.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm**, **yarn**, or **pnpm**
- **Git**
- A **Supabase** account (Free tier is fine)
- A **Xendit** account (Test mode is fine)

---

## 1. Clone & Install Dependencies

First, clone the repository and install all required packages:

```bash
git clone <your-repo-url>
cd futura-mvp
npm install
```

## 2. Set Up Environment Variables

Create a file named `.env.local` in the root of the project by copying the example file:

```bash
cp .env.example .env.local
```

Your `.env.local` file should look like this:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_CALLBACK_TOKEN=your_xendit_callback_token

# Optional: Upstash Redis for rate limiting (leave blank if unused)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 3. Set Up Supabase (Auth & Database)

You need to configure Supabase for Authentication and Database Storage.

### A. Authentication
1. Go to your Supabase Project Dashboard -> **Authentication** -> **Providers**.
2. Enable **Email/Password** authentication.
3. If you want to test locally without email confirmation blocking you, go to **Auth Providers** -> **Email** and toggle OFF "Confirm email".

### B. Get API Keys
1. Go to **Project Settings** -> **API**.
2. Copy the `Project URL` into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the `anon` `public` key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Copy the `service_role` `secret` key into `SUPABASE_SERVICE_ROLE_KEY`.

### C. Create Database Tables
You need to set up the necessary tables via the Supabase SQL Editor. Run the following SQL queries to create the tables used by the application:

```sql
-- 1. Table for Admin Users
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Seminar Registrations
CREATE TABLE seminar_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nama_lengkap TEXT NOT NULL,
  email TEXT NOT NULL,
  no_telepon TEXT NOT NULL,
  asal_institusi TEXT NOT NULL,
  status_akademika TEXT NOT NULL,
  identity_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table for Mechatura Registrations
CREATE TABLE mechatura_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  payment_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table for Lomba KTI Registrations
CREATE TABLE lomba_kti_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  judul_karya TEXT NOT NULL,
  subtema TEXT NOT NULL,
  nama_ketua TEXT NOT NULL,
  email_ketua TEXT NOT NULL,
  telp_ketua TEXT NOT NULL,
  institusi TEXT NOT NULL,
  payment_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Set up Row Level Security (RLS) policies
-- Note: Adjust policies based on your security needs. For local testing, you can disable RLS or allow public access.
```

---

## 4. Set Up Xendit (Payments)

To test the payment gateway for paid events like *Mechatura* and *Lomba KTI*:

1. Log in to your [Xendit Dashboard](https://dashboard.xendit.co/) and switch to **Test Mode**.
2. Go to **Settings** -> **API Keys**.
3. Generate a **Secret Key** with `WRITE` permissions for Invoices and copy it into `XENDIT_SECRET_KEY`.
4. Go to **Settings** -> **Callbacks** and set your Invoice Webhook URL. Since you are testing locally, you can use a tool like [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 3000
   ```
   Set the Webhook URL in Xendit to `https://<your-ngrok-url>.ngrok.app/api/webhooks/xendit`.
5. Under the Callback settings, generate/copy the **Callback Verification Token** and paste it into `XENDIT_CALLBACK_TOKEN`.

---

## 5. Setting up an Admin Account

To access the `/admin` dashboard, your user account needs to be flagged as an admin in the database.

1. Start your local server (`npm run dev`) and register a new user account via the `/register` page.
2. Go to the Supabase Dashboard -> **Authentication** -> **Users** and copy the `User UID` of the account you just created.
3. Go to the **Table Editor**, open the `admin_users` table, and insert a new row with your copied `user_id`.
4. Refresh your local application. The "Admin Futura" navigation link will now appear, granting you access to the dashboard.

---

## 6. Run the Application

Now that everything is configured, start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing Features:
- **Authentication**: Test registering and logging in. Protected routes (like LKTI registration or profile) will automatically bounce unauthenticated users to the login screen with a stylish popup.
- **Seminar Registration**: Test registering for the free seminar. It will instantly generate a ticket.
- **Paid Registrations (LKTI / Mechatura)**: Test registering for a paid event. It should generate an invoice link via Xendit. You can simulate a successful payment in the Xendit Test Dashboard to see the webhooks update the database status to `PAID`.
- **Admin Dashboard**: Log in with your admin account to view all incoming registrations across the different tracks.
