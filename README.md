# 🚀 Varadkrishna Kamtikar — Personal Portfolio Website

> A fully animated, single-page personal portfolio built with pure HTML, CSS, and Vanilla JavaScript. No frameworks. No dependencies. Just open and run.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📋 Table of Contents

- [About](#-about)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Sections](#-sections)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment Guide](#-deployment-guide)
- [Project Structure](#-project-structure)
- [Customization](#-customization)
- [Performance](#-performance)
- [Contact](#-contact)

---

## 👤 About

This is the personal portfolio website of **Varadkrishna Kamtikar**, an MSc Data Science graduate from Technological University Dublin with 2.5+ years of industry experience at Accenture. The portfolio showcases skills in Machine Learning, Data Analytics, Deep Learning, and enterprise software development.

Built as a **single self-contained HTML file** — no build tools, no package managers, no frameworks required.

---

## 🌐 Live Demo

> 🔗 **[View Live Portfolio →](https://varadkamtikar.github.io/portfolio)**

*(Update this link after deployment)*

---

## ✨ Features

### Animations & Effects
| Feature | Description |
|---|---|
| 🌀 Loading Screen | Full-screen loader with initials "VK", animated gradient progress bar, fades out after 2 seconds |
| 🖱️ Custom Cursor | Glowing cyan dot + larger trailing ring that smoothly follows mouse movement |
| 🎆 Particle Network | Live canvas animation — floating dots in indigo, pink, cyan, amber with connecting lines |
| ✨ Hero Name Shimmer | Display name animates with shifting gradient (white → cyan → indigo → pink) |
| 🃏 3D Floating Card | Hero card continuously rotates in 3D space using `rotate3d()` keyframes |
| 🌀 Spinning Dashed Ring | Dashed ring orbits around the hero card with a glowing cyan dot indicator |
| 📜 Scroll Reveal | All sections fade-up, slide-left, or slide-right into view via IntersectionObserver |
| 📊 Skill Bars | Animate to target width only when scrolled into view, with shimmer sweep after fill |
| 🏷️ Marquee | Infinite horizontal scroll of companies and technologies |
| 🃏 Project Card Sweep | Gradient line sweeps across top border of project cards on hover |
| 💫 Ripple Rings | Three expanding ripple rings pulse around the contact avatar |
| 🧭 Navbar Slide | Navbar slides down from top on page load |

### Design
- **Dark theme** with deep space background (`#080812`)
- **Color palette:** Deep Indigo · Hot Pink · Cyan · Amber
- **Typography:** Syne (headings) + DM Sans (body) via Google Fonts
- **Noise texture overlay** for depth and visual richness
- **Custom styled scrollbar** with gradient thumb
- **Frosted glass navbar** with backdrop blur
- **Fully responsive** — mobile-first, single column on small screens

---

## 📑 Sections

### 1. Hero
Two-column layout with left content and right 3D floating card.
- Availability badge with pulsing green dot
- Large display name with shimmer gradient animation
- Job title and description
- Two CTA buttons (Get In Touch, View Projects)
- 3D rotating card with name, role, and key stats (2.5+ yrs exp, 4+ projects, 8.04 GPA)
- Spinning dashed ring and glowing orb background

### 2. Skills
- Animated skill bars (fill on scroll): Python 92%, SQL 88%, ML 88%, Power BI/Tableau 85%, Data Analysis 90%, and more
- Shimmer sweep animation after each bar fills
- Tech chip cloud of 30+ technologies — each floats upward on hover

### 3. Experience
Vertical timeline with animated gradient left border.
- **Application Development Analyst** at Accenture (Mar 2023 – Jul 2024)
- **Application Development Associate** at Accenture (Jan 2022 – Mar 2023)
- Each card slides right and glows on hover
- Highlight badge chips (Promoted / First Role)

### 4. Projects
3-column responsive grid.
- AI-Based EEG Signal Classification (MSc Dissertation)
- Stock Market Prediction using LSTM (B.Tech Final Year Project)
- Netflix Data Analysis Dashboard (Power BI)
- ML Model Development Pipeline
- Generative AI Exploration (LangChain, RAG, HuggingFace)
- Enterprise Mainframe Optimization (Accenture)

### 5. Education
- MSc Data Science — Technological University Dublin (2024–2026)
- B.Tech CSE — MGM's College of Engineering, Nanded (2017–2021)
- Dissertation descriptions included for both degrees
- Certifications: Azure AZ-900, Google Data Analytics (In Progress)

### 6. Contact
- Email, Phone, Location, and Availability info cards (slide right on hover)
- Pulsing avatar initials with 3 expanding ripple rings
- Links to connect via email directly

---

## 🛠️ Tech Stack

```
HTML5          — Structure and semantic markup
CSS3           — Animations, keyframes, variables, grid, flexbox
Vanilla JS     — Cursor, particles, IntersectionObserver, scroll effects
Canvas API     — Particle network background animation
Google Fonts   — Syne (headings) + DM Sans (body)
CSS Variables  — Theming and color management
```

**Zero external JavaScript libraries.** No jQuery, no GSAP, no Three.js, no frameworks.

---

## 🚀 Getting Started

### Option 1 — Open Locally (Instant)
```bash
# Just download and open in any browser
open varad_portfolio.html
```
Or double-click the file in Finder / File Explorer.

### Option 2 — Local Development Server
```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve .

# Then open http://localhost:8000
```

No build step. No npm install. No configuration needed.

---

## 🌍 Deployment Guide

### 🥇 GitHub Pages (Recommended — Free)

1. Create a new GitHub repository named `portfolio`
2. Rename `varad_portfolio.html` → `index.html`
3. Push to the `main` branch:
```bash
git init
git add index.html README.md
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```
4. Go to **Settings → Pages → Source** → select `main` branch → Save
5. Live at: `https://YOUR_USERNAME.github.io/portfolio`

> ✅ Free forever · ✅ HTTPS included · ✅ Custom domain supported

---

### ⚡ Netlify (Drag & Drop — 60 seconds)

1. Go to [netlify.com](https://netlify.com) → Create free account
2. Drag and drop `varad_portfolio.html` onto the dashboard
3. Rename the file to `index.html` before uploading (optional but cleaner)
4. Your site is live at `yourname.netlify.app`
5. Optionally set a custom subdomain: `varad-kamtikar.netlify.app`

> ✅ Instant deploy · ✅ Free HTTPS · ✅ Continuous deploy from Git

---

### 🔺 Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Import your portfolio GitHub repo
3. Click Deploy (zero config needed)
4. Live at: `yourname.vercel.app`

---

### ☁️ Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub repo or upload directly
3. Build settings: leave all blank (static HTML, no build needed)
4. Live with Cloudflare's global CDN for ultra-fast loading

---

### 🌐 Custom Domain (Optional)

After deploying to any platform above:

1. Buy a domain from [Namecheap](https://namecheap.com) (~$10–12/year) or [Google Domains](https://domains.google)
2. Example: `varadkamtikar.com`
3. Add a CNAME record pointing your domain to your hosting URL
4. Enable HTTPS (free on all platforms above)

| Platform | Custom Domain Setup |
|---|---|
| GitHub Pages | Settings → Pages → Custom domain |
| Netlify | Site settings → Domain management → Add domain |
| Vercel | Project settings → Domains → Add |
| Cloudflare Pages | Custom domains tab → Add domain |

---

## 📁 Project Structure

```
portfolio/
│
├── index.html          # The entire portfolio (rename from varad_portfolio.html)
└── README.md           # This file
```

Since everything is in a single HTML file, the structure is self-contained:

```
index.html
├── <head>
│   ├── Google Fonts (Syne + DM Sans)
│   └── <style> — All CSS (variables, animations, layout, responsive)
│
├── <body>
│   ├── #cursor-dot / #cursor-ring     — Custom cursor elements
│   ├── #loader                         — Loading screen
│   ├── #particle-canvas               — Background particle network
│   ├── <nav>                          — Fixed frosted-glass navbar
│   ├── #hero                          — Hero section with 3D card
│   ├── .marquee-section               — Infinite scrolling marquee
│   ├── #skills                        — Skill bars + tech chip cloud
│   ├── #experience                    — Timeline with job cards
│   ├── #projects                      — 3-column project grid
│   ├── #education                     — Degree cards + certifications
│   ├── #contact                       — Contact info + ripple avatar
│   └── <footer>
│
└── <script>
    ├── Loader fade-out logic
    ├── Custom cursor (dot + trailing ring)
    ├── Particle canvas (draw loop)
    ├── IntersectionObserver (scroll reveal)
    ├── Skill bar animation on scroll
    └── Mobile nav toggle
```

---

## 🎨 Customization

All design tokens are defined as CSS variables at the top of the `<style>` block:

```css
:root {
  --indigo: #4f35c7;
  --indigo-light: #6c55e0;
  --pink: #f0107a;
  --cyan: #00d4f5;
  --amber: #ffb300;
  --bg: #080812;
  --font-head: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

### To update personal info:
- **Name, title, description** — Search for `Varadkrishna Kamtikar` in the HTML body
- **Email** — Search for `varad.kamtikar@gmail.com`
- **Phone** — Search for `+353 89 201 6969`
- **Skills proficiency** — Update `data-width="92"` attributes on `.skill-bar-fill` elements
- **Projects** — Edit the `.proj-card` divs in the `#projects` section
- **Stats on hero card** — Edit the `.stat-num` values in `.hero-card`

### To change the color palette:
Update the CSS variables in `:root` — all colors cascade automatically throughout the entire file.

### To change fonts:
1. Update the Google Fonts `<link>` in `<head>`
2. Update `--font-head` and `--font-body` in `:root`

---

## ⚡ Performance

Since there are no external JS libraries or CSS frameworks, load performance is excellent:

| Metric | Value |
|---|---|
| External dependencies | Google Fonts only |
| JavaScript frameworks | None |
| CSS frameworks | None |
| Total file size | ~45KB (single HTML file) |
| Browser support | All modern browsers (Chrome, Firefox, Safari, Edge) |
| Mobile support | Fully responsive (single column on ≤600px) |

The particle canvas uses `requestAnimationFrame` for smooth 60fps animation without blocking the main thread. The IntersectionObserver API avoids scroll event listener overhead.

---

## 📬 Contact

**Varadkrishna Kamtikar**

- 📧 Email: [varad.kamtikar@gmail.com](mailto:varad.kamtikar@gmail.com)
- 📍 Location: Dublin, Ireland
- 💼 LinkedIn: [linkedin.com/in/varadkamtikar](https://linkedin.com/in/varadkamtikar)
- 🐙 GitHub: [github.com/varadkamtikar](https://github.com/varadkamtikar)
- 📞 Phone: +353 89 201 6969

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

Feel free to use this as inspiration for your own portfolio — just update the content with your own information.

---

<div align="center">

Made with ❤️ by **Varadkrishna Kamtikar** · Dublin, Ireland · 2025

⭐ If you found this useful, give it a star!

</div>
