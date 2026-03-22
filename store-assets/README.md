# Store Assets – 1 Minute Brain Challenge

Scripts for generating app-store screenshots and the Google Play feature graphic.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | Uses ES module syntax (`import`) |
| Google Chrome | any | Must be installed at the default path |
| Expo dev server | running on **port 8082** | `cd app && npx expo start --web --port 8082` |

> **First-time setup** — install dependencies inside this folder:
> ```bash
> cd store-assets
> npm install
> ```

---

## Scripts

### 1. `capture-screenshots.mjs` — App Screenshots

Launches a headless Chrome, loads the live Expo web preview, navigates through the key app screens, and saves four PNG screenshots.

**Run:**
```bash
cd store-assets
node capture-screenshots.mjs
```

**Output** (`store-assets/screenshots/`):

| File | Screen | Dimensions |
|---|---|---|
| `01-home.png` | Home / lobby | 780 × 1688 px (390×844 @ 2×) |
| `02-gameplay-q1.png` | Gameplay — first puzzle | 780 × 1688 px |
| `03-gameplay-feedback.png` | Gameplay — second puzzle | 780 × 1688 px |
| `04-game-over.png` | Results / Game Over modal | 780 × 1688 px |

**Notes:**
- The script waits up to **~65 seconds** for the Easy mode timer to expire naturally before capturing the game-over screen. This is expected — do not interrupt it.
- If the app shows the onboarding screen on first load, the script skips it automatically.
- The Expo dev server **must be running** before executing this script. If Chrome cannot connect to `http://localhost:8082` the script will time out.

---

### 2. `render-feature-graphic.mjs` — Feature Graphic (1024 × 500)

Renders `feature-graphic.html` to a PNG at exactly 1024 × 500 px — the required size for the Google Play Store feature graphic slot.

**Run:**
```bash
cd store-assets
node render-feature-graphic.mjs
```

**Output** (`store-assets/screenshots/`):

| File | Dimensions | Notes |
|---|---|---|
| `feature-graphic.png` | 1024 × 500 px | Does **not** require the dev server |

**Customising the graphic:**
All content, colours, and layout are defined in `feature-graphic.html` (plain HTML + CSS — no build step). Edit that file and re-run the script to regenerate.

---

## Folder Structure

```
store-assets/
├── screenshots/                  ← generated output (git-ignored)
│   ├── 01-home.png
│   ├── 02-gameplay-q1.png
│   ├── 03-gameplay-feedback.png
│   ├── 04-game-over.png
│   └── feature-graphic.png
│
├── capture-screenshots.mjs       ← app screenshot script
├── render-feature-graphic.mjs    ← feature graphic render script
├── feature-graphic.html          ← feature graphic source (edit this)
├── package.json
└── README.md
```

---

## Quick-Start (clean run)

```bash
# 1. Start the Expo web server (from the app folder)
cd app
npx expo start --web --port 8082

# 2. In a second terminal, run the scripts
cd store-assets
npm install              # first time only
node capture-screenshots.mjs
node render-feature-graphic.mjs
```

Both scripts print a `✅` confirmation line for each file saved and exit cleanly when done.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find package 'puppeteer-core'` | Run `npm install` inside `store-assets/` |
| `Chrome not found` | Install Google Chrome or update the `CHROME_PATHS` array in the script with your Chrome executable path |
| `Timed out waiting for text` | Make sure the Expo dev server is running on port 8082 and the app has fully loaded in the browser before running the script |
| `Timed out waiting for text: "Game Over!"` | The Easy timer is 60 s — the script allows 70 s. If your machine is slow, increase the timeout value in `waitText(page, 'Game Over!', 70000)` |
