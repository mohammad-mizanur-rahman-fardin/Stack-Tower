# Stack-Tower
🏗️ How high can you go? A one-tap tower stacking game for web and mobile, built with TypeScript, Canvas &amp; Vite.
<div align="center">

**A simple, addictive one-tap stacking game for the web.**

Drop the sliding block, line it up, and build the tallest tower you can.
Miss the edge and your block gets smaller. Miss completely and it's game over.

[▶️ Play Now](https://your-live-demo-link.com) · [🐛 Report a Bug](https://github.com/your-username/stack-tower/issues) · [💡 Request a Feature](https://github.com/your-username/stack-tower/issues)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Mobile Friendly](https://img.shields.io/badge/Mobile-Friendly-22C55E?style=for-the-badge&logo=googlechrome&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)

<br>

<img src="docs/screenshots/menu.png" alt="Stack Tower main menu" width="800">

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [How to Play](#-how-to-play)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Testing on Your Phone](#-testing-on-your-phone)
- [Installing as an App (PWA)](#-installing-as-an-app-pwa)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Tweaking the Difficulty](#-tweaking-the-difficulty)
- [Deployment](#-deployment)
- [Browser Support](#-browser-support)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎮 About

**Stack Tower** is a lightweight browser game built with **TypeScript**, **HTML5 Canvas**, and **Vite**, with no game engine and no heavy frameworks.

The idea is simple: a block slides back and forth, and you drop it on top of your tower. Anything that hangs over the edge gets sliced off, so every mistake makes the game harder. Nail a **perfect drop** and you keep your full width. String **three perfects in a row** and your block grows back.

It runs smoothly on phones, tablets, and desktops, can be installed to your home screen as a PWA, and plays offline.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/menu.png" alt="Main menu" width="100%"><br>
      <b>Main Menu</b><br>
      <sub>Best score, Play, How to Play, and sound toggle</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/gameplay.png" alt="Gameplay" width="100%"><br>
      <b>Gameplay</b><br>
      <sub>Live score, combo text, and 3D rainbow blocks</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/how-to-play.png" alt="How to Play screen" width="100%"><br>
      <b>How to Play</b><br>
      <sub>Quick rules for new players</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/paused.png" alt="Pause menu" width="100%"><br>
      <b>Pause Menu</b><br>
      <sub>Resume, Restart, Sound, Main Menu</sub>
    </td>
  </tr>
</table>

---

## ✨ Features

### 🧱 Gameplay
- **One-tap controls:** tap, click, or press a key to drop
- **Slicing physics:** overhanging parts are cut off and tumble away
- **Perfect drops:** land within a few pixels to snap into place, keep your width, and earn bonus points
- **Combo streaks:** 3 perfect drops in a row grow your block back
- **Rising difficulty:** the block speeds up as your tower grows, with a fair maximum
- **Best score:** saved locally and shown on the main menu

### 🎨 Look and Feel
- Dark, modern UI with purple gradient buttons and a rainbow gradient title
- 3D-shaded blocks that shift color as the tower grows (red → orange → yellow → …)
- Background gradient that changes with tower height
- Particle bursts, glow rings, screen shake, and score "pop" animations
- Animated **"Perfect ×N!"** combo text
- Tower collapse animation on game over

### 🔊 Sound and Haptics
- Sound effects generated live with the **Web Audio API** (no audio files)
- Perfect-drop chime that rises in pitch with your combo
- Vibration feedback on supported phones
- Sound on/off toggle, remembered between visits

### 📱 Built for Every Screen
- Mobile-first, fully responsive layout
- Sharp graphics on Retina / high-DPI screens
- Centered play area on wide desktop screens
- Respects notches and safe areas on modern phones
- No accidental zoom, scrolling, or pull-to-refresh while playing
- Large, thumb-friendly buttons (48 px minimum)
- Auto-pauses when you switch tabs or apps
- Same game speed on 60 Hz and 120 Hz displays

### 📲 Extras
- Installable as a **PWA** and playable **offline**
- Open Graph tags for nice previews when you share the link

---

## 🕹️ How to Play

1. 👆 **Tap** anywhere to drop the sliding block.
2. 🎯 **Align it** with the block below. Overhanging parts are cut off!
3. ✨ **Perfect drops** keep your block full size and give bonus points.
4. 🔥 **3 perfects in a row** grow your block back. Keep the streak alive!
5. 🏆 **Stack as high** as you can and beat your best score!

### Controls

| Action | 📱 Mobile | 💻 Desktop |
|--------|-----------|-----------|
| Drop block | Tap anywhere | Click, `Space`, or `Enter` |
| Pause | ⏸ button (top corner) | ⏸ button |
| Resume / Restart | Pause menu | Pause menu |

### Scoring

| Event | Reward |
|-------|--------|
| Block placed | **+1** point |
| Perfect drop | **+2** bonus points |
| 3 perfects in a row | Block grows back slightly |
| Beat your record | **NEW BEST!** badge |

> 💡 **Tip:** Watch the rhythm of the sliding block instead of the edge. Timing beats aiming.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [TypeScript](https://www.typescriptlang.org/) | Game logic with type safety |
| [Vite](https://vitejs.dev/) | Dev server and production build |
| HTML5 Canvas 2D | Gameplay rendering |
| HTML / CSS overlays | Menus and UI screens |
| Web Audio API | Generated sound effects |
| Vibration API | Haptic feedback on phones |
| Service Worker + Web Manifest | PWA install and offline play |
| localStorage | Best score and settings |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18 or newer**
- npm (comes with Node.js)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/stack-tower.git

# 2. Go into the project folder
cd stack-tower

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build locally |

---

## 📱 Testing on Your Phone

1. Make sure your phone and computer are on the **same Wi-Fi network**.
2. Start the dev server with network access:
   ```bash
   npm run dev -- --host
   ```
3. Open the **Network** URL shown in the terminal (for example `http://192.168.0.105:5173`) in your phone's browser.

> ⚠️ The service worker (offline mode and install prompt) only works on `localhost` or over **HTTPS**, so test PWA features on the deployed version.

---

## 📲 Installing as an App (PWA)

Once the game is deployed over HTTPS, you can install it like a native app:

| Device | How to install |
|--------|----------------|
| **Android (Chrome)** | Open the game → ⋮ menu → **Add to Home screen** / **Install app** |
| **iPhone / iPad (Safari)** | Open the game → Share button → **Add to Home Screen** |
| **Desktop (Chrome / Edge)** | Click the install icon in the address bar |

After the first visit, the game works **offline**.

---

## 📁 Project Structure

```
stack-tower/
├── index.html            # Page layout, meta tags, UI overlay containers
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── docs/
│   └── screenshots/      # Images used in this README
│       ├── menu.png
│       ├── gameplay.png
│       ├── how-to-play.png
│       └── paused.png
├── public/               # Copied as-is into the build
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker (offline caching)
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.ts           # Entry point, canvas setup, resize handling
│   ├── game.ts           # Game loop and state machine
│   ├── block.ts          # Block sliding, slicing, perfect-drop detection
│   ├── renderer.ts       # All canvas drawing
│   ├── camera.ts         # Smooth upward scrolling
│   ├── input.ts          # Pointer + keyboard input
│   ├── audio.ts          # Web Audio sound effects
│   ├── particles.ts      # Particle effects
│   ├── storage.ts        # Safe localStorage helpers
│   ├── ui.ts             # Menu and overlay screens
│   └── config.ts         # All tunable game values
└── styles/
    └── main.css          # Mobile-first styles
```

---

## 🧠 How It Works

**Game states**

```
 ┌────────┐  Play   ┌─────────┐  Pause  ┌────────┐
 │  MENU  │ ──────▶ │ PLAYING │ ──────▶ │ PAUSED │
 └────────┘         └─────────┘ ◀────── └────────┘
     ▲                   │       Resume      │
     │                   │ Miss              │ Main Menu
     │                   ▼                   │
     │             ┌───────────┐             │
     └──────────── │ GAME OVER │ ◀───────────┘
       Main Menu   └───────────┘
                     │ Play Again → PLAYING
```

**Each drop**

1. Measure how much the new block overlaps the block below.
2. **No overlap** → game over.
3. **Within the perfect tolerance** → snap into place, keep the width, add the combo bonus.
4. **Otherwise** → keep the overlapping part and turn the rest into a falling piece.
5. Raise the speed slightly, move the camera up, and spawn the next block from the opposite side.

**Smooth on every device**

- A `requestAnimationFrame` loop uses **delta time**, so movement speed doesn't depend on the screen's refresh rate.
- The canvas is scaled by `devicePixelRatio` so it stays sharp on high-DPI screens.
- Block sizes and speeds scale with the play area width, so the game feels the same on a phone and a monitor.

---

## ⚙️ Tweaking the Difficulty

All gameplay numbers live in **`src/config.ts`**, so you can tune the game without digging through the code.

| Setting | What it changes |
|---------|-----------------|
| Starting block width | How forgiving the start of the game is |
| Starting slide speed | How fast the first blocks move |
| Speed increase per block | How quickly the game gets harder |
| Maximum speed | The hardest the game can get |
| Perfect-drop tolerance | How close counts as "perfect" (default ~5 px) |
| Combo regrow amount | How much the block grows after 3 perfects |
| Colors / hue shift | The tower's color gradient |

> 🧪 Change one value at a time and play a few rounds. Small changes make a big difference.

---

## 🌍 Deployment

Run `npm run build`. The ready-to-host game is in the `dist/` folder.

### Netlify
1. Push the project to GitHub.
2. On [Netlify](https://www.netlify.com/), choose **Add new site → Import an existing project**.
3. Build command: `npm run build` · Publish directory: `dist`

### Vercel
1. Push the project to GitHub.
2. Import the repo on [Vercel](https://vercel.com/). It detects Vite automatically.

### GitHub Pages
1. In `vite.config.ts`, set the base path to your repo name:
   ```ts
   import { defineConfig } from 'vite';

   export default defineConfig({
     base: '/stack-tower/',
   });
   ```
2. Build and publish the `dist/` folder with the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package:
   ```bash
   npm install --save-dev gh-pages
   npm run build
   npx gh-pages -d dist
   ```
3. In your repo, go to **Settings → Pages** and select the `gh-pages` branch.

> ⚠️ When using a sub-path like `/stack-tower/`, make sure the paths in `manifest.json` and `sw.js` match it.

---

## 🌐 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome / Edge (desktop + Android) | ✅ |
| Firefox (desktop + Android) | ✅ |
| Safari (macOS + iOS) | ✅ |
| Samsung Internet | ✅ |

> Vibration is not supported on iOS Safari. The game works fine without it.

---

## 🗺️ Roadmap

- [ ] 🌐 Online leaderboard (Laravel + MySQL API)
- [ ] 🎨 Unlockable color themes
- [ ] 🏅 Achievements (first perfect, 10-combo, 100 blocks)
- [ ] 📅 Daily challenge mode
- [ ] 📤 Share-your-score button
- [ ] 🌍 Multiple languages

---

## 🤝 Contributing

Contributions, issues, and ideas are welcome!

1. Fork the project
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please keep gameplay values in `config.ts` and test on both mobile and desktop before opening a PR.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Inspired by classic one-tap stacking games
- Built with help from [Google Antigravity](https://antigravity.google/)
- Emoji graphics from your system's emoji font

---

<div align="center">

Made with ❤️ and TypeScript

⭐ **If you enjoyed the game, give the repo a star!** ⭐

</div>
