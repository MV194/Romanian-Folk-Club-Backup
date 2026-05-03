# KW Romanian Folk Club Website Deployment Guide

This guide will walk you through deploying your KW Romanian Folk Club website online using **Vercel** for hosting and **Supabase** for backend services (authentication, database, storage, and edge functions).

## Deployment Steps

### Step 1: Supabase Project Setup

If you haven't already, set up your Supabase project:

1.  Go to the [Supabase website](https://supabase.com/) and create a free account.
2.  Click "New Project" and follow the prompts. Choose a strong password for your database and select a region close to your users.
3.  Once created, navigate to "Project Settings" -> "API" and copy your:
    *   **Project URL** (e.g., `https://xxxx.supabase.co`)
    *   **`anon` / `public` key**

4.  **Run your SQL Schema:**
    *   Go to "SQL Editor" in your Supabase project.
    *   Open the `supabase/schema.sql` file from your project (located at `/home/ubuntu/folk-club-new/supabase/schema.sql`).
    *   Paste the contents of `schema.sql` into the SQL Editor and run it. This will create all necessary tables, triggers, and Row Level Security (RLS) policies.

5.  **Configure Authentication Settings:**
    *   In Supabase, go to "Authentication" -> "Settings".
    *   Under "Site URL", add your local development URL (`http://localhost:5173`) and your future Vercel deployment URL (e.g., `https://your-project-name.vercel.app`).

### Step 2: Prepare Your Project Locally

1.  **Navigate to your project:**

    Open your terminal and navigate to the project directory:

    ```bash
    cd /home/ubuntu/folk-club-new
    ```

2.  **Create `.env.local` file:**

    Copy the example environment file:

    ```bash
    cp .env.example .env.local
    ```

3.  **Edit `.env.local`:**

    Open `.env.local` and add your Supabase credentials:

    ```
    VITE_SUPABASE_URL=https://yourproject.supabase.co
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

    Replace `https://yourproject.supabase.co` and `your_anon_key` with the values you copied from your Supabase project.

4.  **Install Dependencies:**

    ```bash
    npm install
    ```

5.  **Run Locally (Optional, for testing):**

    ```bash
    npm run dev
    ```

    This should open your app at `http://localhost:5173`.

### Step 3: Deploy Supabase Edge Functions

Your project includes Supabase Edge Functions for `send-contact` and `download-file`. You can deploy these directly from the Supabase Dashboard:

1.  **For `send-contact` function:**
    *   Go to Supabase -> "Edge Functions" -> "New Function".
    *   Name it `send-contact`.
    *   Copy the content of `/home/ubuntu/folk-club-new/supabase/functions/send-contact/index.ts` and paste it into the function editor.
    *   **Add Environment Variables for `send-contact`:**
        *   `RESEND_API_KEY`: Your API key from [Resend](https://resend.com/) (for sending emails).
        *   `TO_EMAIL`: The email address where contact form submissions should be sent (e.g., `info@yourdomain.com`).
    *   Click "Deploy".

2.  **For `download-file` function:**
    *   Go to Supabase -> "Edge Functions" -> "New Function".
    *   Name it `download-file`.
    *   Copy the content of `/home/ubuntu/folk-club-new/supabase/functions/download-file/index.ts` and paste it into the function editor.
    *   Click "Deploy".

### Step 4: Deploy to Vercel

Vercel provides easy hosting for React applications and integrates seamlessly with GitHub.

1.  **Push Your Project to GitHub:**

    If your project is not already on GitHub, create a new repository and push your entire project to it. Vercel integrates directly with GitHub.

2.  **Connect Vercel to Your GitHub Repository:**

    *   Go to [Vercel](https://vercel.com/) and sign in (you can use your GitHub account).
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repository for the KW Romanian Folk Club website.
    *   Vercel will automatically detect that it's a Vite/React project.

3.  **Configure Environment Variables:**

    Your Supabase credentials are sensitive and should not be hardcoded. Vercel allows you to set these as environment variables.

    *   In your Vercel project settings, go to "Environment Variables".
    *   Add the following key-value pairs:

    | Name                    | Value                                    |
    | :---------------------- | :--------------------------------------- |
    | `VITE_SUPABASE_URL`     | `https://yourproject.supabase.co`        |
    | `VITE_SUPABASE_ANON_KEY`| `your_anon_key`                          |

    Replace with your actual Supabase Project URL and `anon` key.

4.  **Deploy:**

    Click the "Deploy" button. Vercel will build your project and provide you with a live URL (e.g., `your-project-name.vercel.app`).

### Step 5: Make Yourself Admin (Post-Deployment)

After deploying and signing up for an account on your live website:

1.  Go to Supabase -> "SQL Editor".
2.  Run the following SQL command, replacing `your@email.com` with the email you used to sign up:

    ```sql
    update profiles set role = 'admin' where email = 'your@email.com';
    ```

    This will grant your user account admin privileges.

## Post-Deployment Checks

*   **Test all features:** Ensure login, logout, event RSVPs, dashboard functionalities, contact form, and any other interactive elements work as expected.
*   **Check browser console for errors:** Open your browser's developer console and look for any errors or warnings.
*   **Review Supabase logs:** Monitor your Supabase project's logs for any backend issues or function errors.

This guide provides a robust path to getting your application online. Let me know if you encounter any specific issues during these steps!
