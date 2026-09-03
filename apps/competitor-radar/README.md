# Autonomous Competitor & Pricing Intelligence Radar ("Solari Radar")

An automated market intelligence radar that tracks competitor landing pages and pricing tables, extracts structure via Solari Cloud Browsers, and executes isolated price-tier diffing jobs inside Solari Sandbox microVMs.

---

## The Real-World Problem

SaaS founders, e-commerce brands, and market researchers spend hours manually tracking competitor pricing adjustments, plan packaging changes, and landing page redesigns. 

Traditional scrapers frequently fail due to anti-bot mechanisms, lack session traceability, and require heavy local infrastructure to parse untrusted web DOMs safely.

---
## ScreenShot
<img width="1485" height="718" alt="Screenshot 2026-09-02 at 7 46 49 PM" src="https://github.com/user-attachments/assets/8103b750-a13b-489d-81bb-4aeafeddc597" />

<img width="1261" height="745" alt="Screenshot 2026-09-02 at 7 50 43 PM" src="https://github.com/user-attachments/assets/23c9ae73-359e-4618-8272-ae1075551718" />

## Video

https://github.com/user-attachments/assets/d7c17d91-e46e-4aeb-8242-eaca58f492f9
---
## How Solari Powers This Build

This project orchestrates two core Solari primitives end-to-end:

1. **Solari Cloud Browsers (`@solarisdk/browser`):**
   - Launches an automated remote headless browser to crawl target competitor URLs without local headless browser dependencies.
   - Enables **session recording** (`recording: true`) to generate instant video playback URLs of the scan session for auditability.
   - Built to support stealth mode and residential proxy egress for anti-bot bypass.

2. **Solari Sandboxes (`@solarisdk/sandbox`):**
   - Boots an ephemeral microVM (`template: 'base'`) in seconds.
   - Safely mounts and executes Python regex and semantic diffing routines in an isolated environment away from the host server.
   - Automatically reclaims microVM resources via `sandbox.kill()` upon job completion.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
