# 🏏 AI Cricket Scorer

A modern, mobile-first cricket scoring web app for local matches, school competitions, club games, and tournaments. Features live scoring, PDF exports, and AI-powered match analysis.

![AI Cricket Scorer](https://img.shields.io/badge/Cricket-Scorer-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)

## ✨ Features

- **Match Setup** — Teams, players, match type (T10/T20/ODI/Custom), toss, venue, date
- **Live Scoring** — One-tap scoring: 0/1/2/3/4/6, Wickets, Wides, No Balls, Byes, Leg Byes
- **Auto Calculations** — Run rate, required run rate, partnership, fall of wickets, extras
- **Batting & Bowling Scorecard** — Full stats: runs, balls, 4s, 6s, strike rate, economy
- **Ball-by-Ball Commentary** — Auto-generated commentary with edit/delete
- **Match Summary** — Winner, top scorer, best bowler, powerplay scores
- **AI Analysis** — Smart local analysis + optional OpenAI/Gemini/Claude API
- **PDF Export** — Professional scorecard with batting, bowling, FOW, commentary, AI analysis
- **Dark/Light Mode** — System-aware with manual toggle
- **LocalStorage** — Matches saved locally, no backend needed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/ai-cricket-scorer.git
cd ai-cricket-scorer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/ai-cricket-scorer/](http://localhost:5173/ai-cricket-scorer/) in your browser.

## 🏗️ Build & Deploy

### Build for production

```bash
npm run build
```

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add your GitHub repo URL to `vite.config.js` base:
```js
base: '/ai-cricket-scorer/',  // Change to your repo name
```

3. Add to `package.json`:
```json
"homepage": "https://YOUR-USERNAME.github.io/ai-cricket-scorer"
```

4. Deploy:
```bash
npm run deploy
```

Your app will be live at: `https://YOUR-USERNAME.github.io/ai-cricket-scorer`

## 📁 Project Structure

```
src/
├── components/
│   ├── AIAnalysis.jsx       — AI-powered match insights
│   ├── Commentary.jsx       — Ball-by-ball commentary
│   ├── InningsBreak.jsx     — Break between innings
│   ├── LiveScorer.jsx       — Main scoring interface
│   ├── MatchComplete.jsx    — Match result screen
│   ├── MatchList.jsx        — Home screen / match list
│   ├── MatchSetup.jsx       — Match configuration wizard
│   ├── MatchSummary.jsx     — Match summary cards
│   └── Scorecard.jsx        — Batting/bowling scorecards
├── data/
│   └── sampleMatch.js       — Demo match data
├── pages/
│   └── MatchView.jsx        — Main tabbed match page
├── utils/
│   ├── aiAnalysis.js        — Local AI + API integration
│   ├── cricketLogic.js      — Core scoring engine
│   └── pdfExport.js         — PDF scorecard generator
├── App.jsx
├── main.jsx
└── index.css
```

## 🤖 AI Analysis

The app comes with a built-in rule-based AI engine that works completely offline. For enhanced analysis, you can connect:

- **OpenAI** (GPT-4o-mini recommended)
- **Google Gemini**
- **Anthropic Claude**

Go to the **AI tab** → click the settings icon → select your provider and paste your API key.

> ⚠️ API keys are stored only in memory for the session. Never commit your API keys.

## 📱 Mobile First

The app is fully responsive and optimised for:
- iOS Safari
- Android Chrome
- Desktop browsers

## 🔧 Firebase Integration (Future)

The project is structured for easy Firebase integration:
1. Create a Firebase project
2. Install `firebase` package
3. Replace `saveMatchToStorage` / `getMatchesFromStorage` in `cricketLogic.js` with Firestore calls

## 📄 License

MIT License — free to use for personal and commercial projects.

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss what you'd like to change.

---

Built with ❤️ for cricket lovers everywhere 🏏
