# MyRight — Play Store Deployment Guide

## ✅ What's Already Done (Configured in this build)
- Firebase project: `my-right-c8924` — keys set in ALL pages
- Razorpay test key: `rzp_test_Say71A0DMB0k0h` — set in generate.html + subscription.html
- SHA-256 fingerprint: set in `.well-known/assetlinks.json`
- TWA package name: `app.myright.twa`
- PWA manifest, service worker, all icons ready
- Auth (sign in / create account) — fully working
- Document generation — fully working (100+ templates)
- Subscription + Razorpay payment flow — working (test mode)
- Legal Chat — working (Firebase Firestore)
- PDF download — working

---

## STEP 1 — Host on Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: . (root)
# Single page app: No
# Overwrite index.html: No

firebase deploy --project my-right-c8924
```

Your app will be live at: https://my-right-c8924.web.app

---

## STEP 2 — Enable Firebase Services (Console)

Go to https://console.firebase.google.com → Project: my-right-c8924

1. **Authentication** → Sign-in method → Enable: Email/Password
2. **Firestore** → Create database → Start in test mode → Region: asia-south1
3. **Firestore Rules** → Paste contents of `firestore.rules`
4. **Hosting** → Already set up after Step 1

---

## STEP 3 — Razorpay (Switch to Live for Production)

1. Go to https://dashboard.razorpay.com
2. Settings → API Keys → Generate Live Key
3. In generate.html line ~505: replace `rzp_test_Say71A0DMB0k0h` with your live key
4. In subscription.html line ~549: same replacement

---

## STEP 4 — Build TWA with Bubblewrap

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://my-right-c8924.web.app/manifest.json
bubblewrap build
```

When prompted:
- Package name: `app.myright.twa`
- App name: MyRight
- SHA-256 fingerprint: `94:C0:2C:CA:BF:9A:E8:35:31:59:2E:8A:E3:B5:A2:DB:37:07:ED:57:4E:F0:1E:45:21:6B:55:6E:E5:15:7F:70`

This generates `app-release-signed.apk`

---

## STEP 5 — Upload to Play Store

1. Go to https://play.google.com/console
2. Create app → App name: MyRight — Legal Documents
3. Upload AAB/APK → Production → Release
4. Fill: Description, Screenshots (min 2), Feature graphic (1024×500)
5. Content rating → Complete questionnaire
6. Pricing: Free
7. Submit for review (3–7 days)

---

## ⚠️ Before Going Live Checklist

- [ ] Replace Razorpay TEST key with LIVE key
- [ ] Set Firestore rules to production (not test mode)
- [ ] Add your Privacy Policy URL to Play Store listing
- [ ] Add screenshots (min 2, 1080×1920 recommended)
- [ ] Test all payment flows on real device

