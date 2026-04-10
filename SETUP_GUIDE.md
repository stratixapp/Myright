# MyRight v9 — Setup Guide

## What's In This Build
- **index.html** — Landing page (auto-redirects logged-in users to dashboard)
- **pages/** — dashboard, generate, vault, subscription, profile, legal-chat, admin-chat, admin, login, forgot, legal-advisor, risk-analyzer, privacy, terms, disclaimer, history
- **js/local-auth.js** — Full auth + document storage (localStorage-based)
- **js/docs-catalog.js** — 111 document definitions
- **js/forms-fields.js** — Form fields for all documents
- **js/templates.js** — Full legal text for all 111 documents
- **css/main.css** — Complete design system
- **manifest.json + sw.js** — PWA / offline support
- **firestore.rules** — Chat-only Firestore rules
- **.well-known/assetlinks.json** — TWA Digital Asset Links

---

## 1. Firebase Setup ✅ Already Configured

Project: `my-right-c8924` — keys embedded in all pages.

**Steps in Firebase Console (console.firebase.google.com):**
1. Authentication → Sign-in method → Enable **Email/Password**
2. Firestore Database → Create database → **asia-south1** region → Start in test mode
3. Firestore → Rules → Paste contents of `firestore.rules` → Publish
4. Hosting → (after deploy in Step 3 below)

---

## 2. Razorpay ✅ Test Key Configured

Test key `rzp_test_Say71A0DMB0k0h` is in:
- `pages/generate.html` line ~505
- `pages/subscription.html` line ~549

**Before going live:** Replace both with your Razorpay **live** key.

Plans configured:
| Plan | Amount | File |
|---|---|---|
| Pro Monthly | ₹199 | subscription.html |
| Pro Yearly | ₹1499 | subscription.html |
| Per-document | ₹49–₹349 | docs-catalog.js |

---

## 3. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: . (root, where index.html is)
# Single page app: No
# Overwrite index.html: No
firebase deploy --project my-right-c8924
```

App live at: **https://my-right-c8924.web.app**

---

## 4. TWA / Play Store Build

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://my-right-c8924.web.app/manifest.json
bubblewrap build
```

- Package name: `app.myright.twa`
- SHA-256 already set in `.well-known/assetlinks.json`

Upload `app-release-signed.apk` to Play Console.

---

## 5. Plans & Pricing

| Plan | Price | Documents |
|---|---|---|
| Free | ₹0 | 2 free docs/month from free catalog |
| Pro Monthly | ₹199/mo | All 111 docs, unlimited |
| Pro Yearly | ₹1499/yr | All 111 docs, unlimited |
| Per-document | ₹49–₹349 | One-time purchase |

---

## 6. Admin Access

Admin panel: `pages/admin.html`
Admin Chat: `pages/admin-chat.html`

Admin email is hardcoded as `anandhushaji1212@gmail.com` in:
- `pages/admin.html`
- `pages/admin-chat.html`

To change: search for that email in both files and replace.

---

## 7. Before Going Live Checklist

- [ ] Deploy to Firebase Hosting (Step 3)
- [ ] Enable Firebase Auth + Firestore (Step 1)
- [ ] Replace Razorpay test key with live key (Step 2)
- [ ] Upload screenshots to Play Store (min 2, 1080×1920)
- [ ] Update emails in privacy.html / terms.html (support@myright.app etc.)
- [ ] Set Firestore rules to production (restrict writes after testing)

---

## 8. App Architecture

- **Auth**: localStorage (no Firebase Auth — by design for offline-first)
- **Documents**: localStorage via `MRDocs` (in js/local-auth.js)
- **Chat**: Firebase Firestore (real-time, requires internet)
- **Payments**: Razorpay checkout.js (requires internet)
- **PDF/DOCX**: Client-side generation (html2pdf + custom ZIP builder)
- **AI features**: Legal Advisor + Risk Analyzer = Coming Soon pages
