# xPet xPress — deployment guide

## What's in this folder
A ready-to-deploy web project. `src/App.jsx` is your game, unchanged.
`src/main.jsx` swaps Claude's sandbox storage for real browser storage
(localStorage), so it works on any normal website.

## Step 1 — Test it locally (optional but recommended)
You'll need Node.js installed (nodejs.org — the LTS version).

```
npm install
npm run dev
```

This opens the game in your browser at a local address. Play through it —
create a profile, earn coins, adopt a pet — then refresh the page. If your
progress is still there after refreshing, storage is working.

## Step 2 — Put the code on GitHub
1. Create a free account at github.com if you don't have one.
2. Create a new repository (e.g. "xpet-app").
3. Upload this whole folder to it (GitHub's website lets you drag-and-drop
   files, or use `git` from the command line if you're comfortable with it).

## Step 3 — Deploy for free (no domain needed yet)
Two easy options, both free for a project this size:

**Vercel** (vercel.com)
1. Sign up with your GitHub account.
2. Click "New Project," pick your `xpet-app` repository.
3. Leave the default settings (Vercel auto-detects Vite) and click Deploy.
4. In a minute or two you'll get a live link like `xpet-app.vercel.app`.

**Netlify** (netlify.com) works almost identically if you'd rather use that.

That's it — the game is now live on the internet, no domain purchase
required.

## Step 4 — Buy a custom domain (optional)
If you want something like `xpetapp.com` instead of the free subdomain:

1. Buy the domain from a registrar — Namecheap, Cloudflare, or Google
   Domains (now via Squarespace) are all reputable. Expect **$10–15/year**
   for a `.com`.
2. In your Vercel or Netlify project settings, choose "Add Domain" and
   enter the domain you bought.
3. They'll give you 1–2 DNS records to add at your registrar (usually just
   copy-pasting values into a form). This links your domain to your site.
4. DNS changes can take anywhere from a few minutes to a few hours to work.

## Step 5 — Lock down your Firestore security rules (do this soon)
"Test mode" (which you picked when creating the database) leaves your data
open to anyone on the internet who finds your project — not just your
family. Before real use, go to Firebase Console → Firestore Database →
Rules, and replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyCode} {
      allow read, write: if familyCode is string && familyCode.size() >= 4;
    }
  }
}
```

This is still fairly open (anyone who *guesses* a valid-looking family code
could access that family's data), but a random 6-character code is hard to
guess, and this at minimum stops broad automated scanning. Click "Publish"
after pasting this in.

## Important limitations to know about (updated)
- **Cross-device sync is now live**, using a family code you create once and
  enter on each device. Anyone with that code can read and write that
  family's data — treat it like a shared password, not something to post
  publicly.
- **No individual login/password per child** — the family code covers
  everyone sharing it. This is deliberately simple; a "real accounts" system
  would be a separate, bigger project.
- This is a website, not an App Store app — see the earlier note on that if
  you're planning to go that route later.
