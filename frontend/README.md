# HackAuth — Drop-in Auth UI for Hackathons

A beautiful, accessible, fully-featured authentication UI built with **Next.js 14** + **TypeScript**.
Swap your backend in minutes. Supports dark & light mode out of the box.

---

## ✨ Features

- **3 views**: Sign In · Create Account · Forgot Password
- **Dark / Light mode** toggle (warm, eye-friendly palette)
- **Password strength meter** (segmented, color-coded)
- **Show / hide password** toggle
- **OAuth buttons** for GitHub & Google (ready to wire up)
- **Form validation** with inline toast notifications
- **Animated left panel** with floating geometric shapes
- **Responsive** — collapses to single column on mobile
- **Accessible** — keyboard navigable, focus indicators

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → auto-redirects to `/auth`.

---

## 🔌 Wiring Up Your Backend

Search for `// 🔌 TODO` in `app/auth/page.tsx` — there are 3 spots:

### 1. Sign In
```tsx
// In SignInView → handleSubmit
await signIn(email, password); // NextAuth / Supabase / Firebase / etc.
```

### 2. Sign Up
```tsx
// In SignUpView → handleSubmit
await signUp(name, email, password);
```

### 3. Forgot Password
```tsx
// In ForgotView → handleSubmit
await sendPasswordReset(email);
```

### OAuth
```tsx
// In handleOAuth (main AuthPage component)
// e.g. NextAuth:  signIn('github')
// e.g. Supabase:  supabase.auth.signInWithOAuth({ provider: 'github' })
```

---

## 🎨 Customization

### Branding
Edit the `LeftPanel` component — change the brand name, tagline, hero copy, feature pills, and stats.

### Colors
All colors are CSS custom properties in `app/globals.css`.
Two theme blocks: `[data-theme="dark"]` and `[data-theme="light"]`.
Key vars: `--accent`, `--accent2`, `--bg`, `--surface`, `--text`.

### Fonts
`layout.tsx` loads **Bricolage Grotesque** (display) + **DM Mono** (monospace) from Google Fonts.
Swap the `<link>` and update the `--font-display` / `--font-mono` vars in globals.css.

---

## 📁 Structure

```
hackauth/
├── app/
│   ├── layout.tsx          # Root layout + font imports
│   ├── globals.css         # All styles + CSS variables (dark/light)
│   ├── page.tsx            # Redirects to /auth
│   └── auth/
│       └── page.tsx        # Full auth UI (all components in one file)
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## 🏗 Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | Framework (App Router) |
| TypeScript | Type safety |
| Custom CSS | All styling (no Tailwind dependency) |
| Google Fonts | Bricolage Grotesque + DM Mono |

No UI library dependencies — just React + Next.js.

---

## 🔧 Common Integrations

**NextAuth.js**
```bash
npm install next-auth
```

**Supabase**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Firebase Auth**
```bash
npm install firebase
```

---

Built with ♥ for hackathons. MIT License — use freely.
