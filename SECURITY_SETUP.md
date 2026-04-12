# MyRight — Security Setup Guide

## What was fixed
1. ✅ Password removed from source code → Firebase Google Sign-In
2. ✅ sessionStorage bypass removed → Firebase onAuthStateChanged (server-verified)
3. ✅ Firestore chats locked → only room owner can read their own chat
4. ✅ Admin page renamed to obscure URL → `pages/mr-panel-9x7k.html`
5. ✅ Cloudflare Worker secured → `/admin-chats` endpoint needs secret token

---

## Step 1 — Enable Google Sign-In in Firebase Console (5 min)

1. Go to https://console.firebase.google.com → your project (my-right-c8924)
2. Click **Authentication** → **Sign-in method**
3. Click **Google** → Enable → set your email as support email → Save
4. Under **Authentication → Settings → Authorised domains**
   - Make sure your Cloudflare Pages domain is listed (e.g. myright.pages.dev)
   - Also add your custom domain if you have one

---

## Step 2 — Deploy updated Firestore rules (2 min)

Option A (Firebase CLI):
```
firebase deploy --only firestore:rules
```

Option B (Console):
1. Go to Firestore → Rules tab
2. Paste the contents of `firestore.rules`
3. Click Publish

---

## Step 3 — Set Cloudflare Worker secrets (3 min)

1. Go to https://dash.cloudflare.com → Workers & Pages → your worker
2. Click Settings → Variables → Add the following **Secrets** (not plain vars):

   | Secret name          | Value                                      |
   |----------------------|--------------------------------------------|
   | ANTHROPIC_API_KEY    | your key from console.anthropic.com        |
   | FIREBASE_PROJECT_ID  | my-right-c8924                             |
   | ADMIN_SECRET_TOKEN   | generate at https://randomkeygen.com       |

3. Deploy the updated `cloudflare-worker.js`

---

## Step 4 — Bookmark the real admin URL

Your admin panel is now at:
```
https://yourdomain.pages.dev/pages/mr-panel-9x7k.html
```

- Do NOT share this URL publicly
- You can rename `mr-panel-9x7k.html` to any secret name you want
- Going to `/pages/admin.html` or `/pages/admin-complete.html` just redirects there

---

## Step 5 — Test sign-in

1. Open `pages/mr-panel-9x7k.html`
2. Click "Sign in with Google"
3. Choose your Google account (anandhushaji1212@gmail.com)
4. You should land on the admin dashboard
5. Try with a different Google account → should get "Access denied"

---

## Summary of security level after these steps

| Attack                          | Before      | After              |
|---------------------------------|-------------|---------------------|
| View Source → see password      | 🔴 Instant  | ✅ No password exists |
| DevTools sessionStorage bypass  | 🔴 30 sec   | ✅ Firebase verified |
| Read all chats via Firestore API| 🔴 Anyone   | ✅ Owner-only rules  |
| Guess admin URL                 | 🔴 /admin   | ✅ Secret URL        |
| Brute force login               | 🔴 Possible | ✅ Google handles it |
