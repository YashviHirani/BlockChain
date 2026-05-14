# ⬡ ArbiLearn — Web3 Foundations

> A single-page application that teaches Arbitrum, Layer 2 scaling, live crypto prices, and blockchain mining — built for the **Arbitrum Builder Pods** program.

---

## 🌐 Live Demo

> Deploy via GitHub Pages: `Settings → Pages → Deploy from main branch`  
> Then open: `https://yashvihirani.github.io/BlockChain/`

---

## 📸 Pages Overview

| Page | What It Does |
|------|-------------|
| **🏠 Home** | Intro to Ethereum's scaling problem, Arbitrum architecture diagram, L1 vs L2 comparison table |
| **📚 Concepts** | Searchable + filterable Web3 comparison cards (Web2 vs Web3, ETH vs BTC, Keys, Blockchain vs DB) |
| **📈 Live Prices** | Real-time crypto dashboard via CoinGecko API with auto-refresh and coin lookup |
| **⛏ Simulator** | Interactive proof-of-work block mining simulator with SHA-256 hashing and chain immutability demo |

---

## 📁 Project Structure

```
BlockChain/
├── index.html        # Entire SPA — all 4 pages in one file
├── style.css         # All styles — dark theme, responsive layout
├── app.js            # All JavaScript — routing, mining logic, API calls
└── README.md
```

> This is a **Single Page Application (SPA)** — all four pages live inside `index.html` and are shown/hidden via JavaScript routing. No frameworks, no build step.

---

## 🛠 Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom dark theme, CSS variables, responsive grid
- **Vanilla JavaScript** — zero dependencies, no frameworks
- **Web Crypto API** — real browser-native SHA-256 hashing
- **CoinGecko Public API** — free, no API key required

---

## ✨ Features

### Home
- Animated starfield canvas background
- Hero section with live blockchain visual (linked blocks)
- Problem/solution layout explaining why Ethereum needed L2
- Layer diagram: dApp → Arbitrum L2 → Ethereum L1
- Real-world comparison table: Uniswap on L1 vs L2

### Concepts
- Search bar to filter concepts by keyword
- Tab filters: All / Identity / Tech / Finance
- Expandable "Key Insight" toggle on each card
- Share button on every card
- Cards covered:
  - Web2 vs Web3
  - Ethereum vs Bitcoin
  - Public Key vs Private Key
  - Blockchain vs Traditional Database

### Live Prices
- Fetches live data from CoinGecko API (no API key needed)
- Displays: price, 24h change %, green ▲ / red ▼ indicators
- Auto-refresh every 60 seconds (toggleable)
- Manual refresh button
- Coin lookup — search any CoinGecko coin ID
- Market summary bar (leader, top gainer, top loser)

### Block Simulator
- Real **SHA-256** hashing via Web Crypto API
- Mine Block 1 and Block 2 with live nonce incrementing
- Progress bar and hash attempt counter
- Chain-breaking demo: edit Block 1 → Block 2 turns invalid
- Live hash visualizer — type anything, see the hash change instantly
- Explainer toggle explaining proof-of-work in plain English

---

## 🚀 How to Run

### Option 1 — Just open in browser
```
Double-click index.html
```
> ⚠️ Live Prices may not load due to browser CORS restrictions on `file://`. Use Option 2 if prices don't appear.

### Option 2 — VS Code Live Server (recommended)
1. Open the folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**
4. Visit `http://127.0.0.1:5500`

### Option 3 — Python local server
```bash
python -m http.server 8000
# then open http://localhost:8000
```

---

## 📡 API Used

**CoinGecko Simple Price Endpoint** — no API key required:
```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,...&vs_currencies=usd&include_24hr_change=true
```

---

## 🔗 How to Push to GitHub

```bash
git init
git add .
git commit -m "ArbiLearn — Arbitrum Builder Pods submission"
git branch -M main
git remote add origin https://github.com/YashviHirani/BlockChain.git
git push -u origin main
```

---

## 📋 Assignment Checklist

- [x] Page 1: Responsive landing page with hero, features, footer
- [x] Arbitrum theme — L2 explanation, architecture diagram, real-world benefit
- [x] Page 2: Visual comparison cards for all 4 required concepts
- [x] Page 3: Live prices from CoinGecko with 24h change + refresh button
- [x] Page 4: Block simulator with nonce, SHA-256, and chain immutability
- [x] Shared navigation present on all pages
- [x] Active page highlighted in nav
- [x] Consistent styling across all pages
- [x] Mobile responsive

---

## 👤 Author

**Yashvi Hirani** · Arbitrum Builder Pods · Batch ARB-2025  
GitHub: [@YashviHirani](https://github.com/YashviHirani)

---

> *Not financial advice. Built for educational purposes as part of the Arbitrum Builder Pods program.*
