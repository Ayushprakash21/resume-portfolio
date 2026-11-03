# Ayush Prakash — Immersive 3D Spatial Portfolio + Private Admin CMS

[![Build & Typecheck](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/React_19-TypeScript_5.7-blue.svg)]()
[![3D Engine](https://img.shields.io/badge/Three.js-WebGL_60fps-cyan.svg)]()
[![Backend](https://img.shields.io/badge/Firebase_Auth-Cloud_Firestore-orange.svg)]()

> An operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development.

---

## Overview

This repository hosts the personal portfolio and digital universe of **Ayush Prakash**, pairing an interactive 3D WebGL spatial experience with a full-featured, protected content management dashboard at `/admin`.

### Key Highlights

- **Interactive 3D Spatial Universe:** Custom Three.js WebGL spatial scene with 7 interconnected structures (Professional Identity, Career Journey, Enterprise Tech, Orion-9, ApplyVise AI, Certifications, and Communications Relay).
- **Spatial Interactions:** Real-time raycaster hovering, camera tilt parallax, smooth lerp camera flight to focused structures, and conventional navigation fallback.
- **Flagship Project Showcases:**
  - **Orion-9 (Supply Chain OS):** Interactive supply chain pipeline (`Supplier → Procurement → Inventory → Warehouse → Shipment → Customer`).
  - **ApplyVise AI (Career Intelligence Platform):** Interactive career intelligence pipeline (`Resume → Analysis → Job Requirements → Skills Gap → Application Preparation`).
- **Private Admin Dashboard (`/admin`):** Clean, professional CMS powered by Firebase Authentication with 10 management modules (Profile, Experience CRUD, Projects CRUD, Certifications CRUD, Skills, Media Library, Active Resume Manager, Messages Inbox, and Settings).
- **Unified Reactive CMS Architecture:** Any record published in the admin dashboard immediately updates the public website without a page reload.
- **Enterprise Security Rules:** Production Firestore rules and Storage limits preventing unauthorized access.

---

## Technical Stack

- **Frontend & Core:** React 19, TypeScript 5.7, Vite 6
- **3D Spatial Graphics:** Three.js (WebGL, ACESFilmic Tone Mapping, Soft Shadows, Dynamic Camera Lerp)
- **Design System:** Strictly tokenized CSS variables adhering to the Intelligence Universe palette (`#07090D` primary, `#45D6FF` cyan, `#42D6A4` Orion emerald, `#A78BFA` ApplyVise violet, `#E5B94E` cert gold)
- **Backend & Auth:** Firebase Authentication (Email/Password), Cloud Firestore, Firebase Storage
- **Testing:** Node.js native test runner (`node:test`, `node:assert`) with 16 automated acceptance suites

---

## Getting Started

### 1. Installation

```bash
git clone https://github.com/Ayushprakash21/resume-portfolio.git
cd resume-portfolio
npm install
```

### 2. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public 3D experience, or navigate to [http://localhost:3000/#/admin](http://localhost:3000/#/admin) for the private CMS console.

### 3. Build & Verification

```bash
npm run build
npm test
```

---

## Security & Rules

- [`firestore.rules`](./firestore.rules): Public read access for published content; write access strictly locked to authorized administrators.
- [`storage.rules`](./storage.rules): File size and MIME type validation with admin upload authorization.

---

## License

Copyright © 2026 Ayush Prakash. All rights reserved.
