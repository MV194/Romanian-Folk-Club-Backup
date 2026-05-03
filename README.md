# 🪕 KW Romanian Folk Club — Website

A full-stack community website for the KW Romanian Folk Club in Kitchener-Waterloo, Ontario.  
Built with **React + Vite**, **Supabase** (auth + database), and deployed on **Vercel**.

---

## ✨ Features

### Public Website
- **Hero** — full-screen landing with animated stats
- **About** — mission, history, values
- **Events** — upcoming events with registration + capacity bar
- **Gallery** — photo grid with hover captions
- **Testimonials** — approved community stories
- **Contact** — contact form + info
- **Footer** — nav links

### Member Dashboard (`/` scrolls to `#member-dashboard`)
- 📅 **My Schedule** — view and cancel registered events
- 🎨 **My Avatar** — pick colour + initials with live preview
- 📚 **Club Resources** — downloadable PDFs, videos, documents
- ✍️ **Share Story** — submit a testimonial for admin review

### Admin Dashboard (`/` scrolls to `#admin-dashboard`)
- 🗓 **Events** — create / edit / delete
- 🖼 **Gallery** — add / edit / remove gallery items
- 👥 **Users** — view all members, toggle roles, delete accounts
- 💬 **Testimonials** — approve / reject / delete
- 📚 **Resources** — manage downloadable materials
- ✏️ **Page Content** — edit hero, about, and contact text live

---

## 🛠 Tech Stack

| Layer    | Tool |
|----------|------|
| Frontend | React 18, Vite 5 |
| Styling  | CSS Variables + inline styles (no Tailwind required) |
| Auth     | Supabase Auth (email + password) |
| Database | Supabase (Postgres) |
| Hosting  | Vercel |
| Fonts    | Playfair Display · Crimson Pro · DM Sans (Google Fonts) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/kw-romanian-folk-club.git
cd kw-romanian-folk-club
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `kw-romanian-folk-club` · Region: `US East`
3. Go to **SQL Editor** → paste and run `supabase/schema.sql`
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` / public key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Locally

```bash
npm run dev
# → http://localhost:5173
```

### 5. Make Yourself Admin

Sign up through the website, then run in Supabase SQL Editor:
```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

---

## ☁️ Deploy to Vercel

1. Push to GitHub
2. [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy** — done! ✅

Update your Supabase **Authentication → URL Configuration**:
- Site URL: `https://your-project.vercel.app`
- Redirect URLs: `https://your-project.vercel.app/**`

---

## 📁 Project Structure

```
kw-folk-club/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── LoginModal.jsx
│   │   ├── Toast.jsx
│   │   ├── PublicSections.jsx   ← Hero, About, Gallery, Testimonials, Contact, Footer
│   │   ├── EventsSection.jsx
│   │   ├── MemberDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── hooks/
│   │   └── useAuth.jsx          ← AuthContext wrapping the whole app
│   ├── lib/
│   │   └── supabase.js          ← Supabase client
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── schema.sql               ← Full DB schema + seed data + RLS policies
├── .env.example
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 🔐 Authentication Flow

1. User signs up → Supabase creates `auth.users` row + triggers `handle_new_user()` → inserts `profiles` row
2. On login → `useAuth` fetches the profile → `profile.role` determines which dashboard shows
3. RLS policies ensure members can only modify their own data; admins can modify everything

---

## 🌐 Custom Domain (Optional)

In Vercel → **Settings → Domains**, add `kwromanianfolk.ca` (or whatever domain you buy).  
Then update Supabase Auth redirect URLs to match.

---

## 📧 Contact

KW Romanian Folk Club · Kitchener-Waterloo, Ontario  
info@kwromanianfolk.com · (519) 555-0123

*La mulți ani!* 🪕
