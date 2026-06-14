<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Codeforces_logo.svg" alt="Codeforces Logo" width="300" />
  <h1>⚡ CodeUp ⚡</h1>
  <p><strong>A sleek, LeetCode-style workspace and AI coaching platform for Codeforces.</strong></p>
</div>

<br />

CodeUp bridges the gap between Codeforces' incredible problem repository and the modern, unified developer experience of platforms like LeetCode. It allows you to fetch any problem, write code, run against sample tests, and get AI-powered insights—all without switching tabs.

## ✨ Features

- 🚀 **Instant Problem Fetching:** Paste a Codeforces URL or a simple ID (e.g., `1984A`) to instantly load the full problem statement, limits, and sample tests.
- 🛡️ **Cloudflare-Bypass Scraper:** A robust Playwright-based Python scraper guarantees reliable fetching even when Codeforces is heavily protected.
- 🏃‍♂️ **1-Click Execution:** Run your C++, C, Java, or Python code against all sample test cases concurrently.
- 🤖 **AI Coach (Gemini 2.5 Flash):** Get personalized 4-week study roadmaps and skill gap analyses based on your current rating, strengths, and weaknesses.
- ⚡ **Blazing Fast Caching:** Scraped problems are cached in **Redis** (48h TTL) for instant reloads, and AI recommendations are cached in **Supabase** to save API costs.

---

## 🛠️ Technology Stack

- **Frontend:** React (Vite), Monaco Editor, MathJax, DOMPurify
- **Backend:** Node.js (Express)
- **Scraping:** Python (Playwright)
- **Code Execution:** OnlineCompiler API
- **Database & Auth:** Supabase (PostgreSQL)
- **Caching:** Upstash Redis
- **AI Integration:** Google Gemini SDK

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A [Supabase](https://supabase.com/) project
- An [Upstash Redis](https://upstash.com/) database
- API Keys for Google Gemini and OnlineCompiler.io

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/codeup.git
cd codeup
```

### 2. Install Dependencies
**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../server
npm install
```

**Python Scraper:**
```bash
cd ..
pip install playwright
playwright install chromium
```

### 3. Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=3001
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
OC_KEY=your-onlinecompiler-key
REDIS_URL=rediss://default:password@your-upstash-url.upstash.io:6379
```

### 4. Run the App
Start both the frontend and backend servers concurrently:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to start solving!

---

## 🏗️ Architecture Highlights

- **Anti-Bot Scraping:** Instead of relying on the flaky Codeforces API, CodeUp spins up a persistent, heavily-disguised headless Chromium instance to navigate through Cloudflare challenges and extract the raw DOM.
- **Smart Caching Layer:** SHA-256 hashes are used to detect when a user's Codeforces stats have changed. The AI Coach only triggers an expensive Gemini API call when a state change is detected, otherwise serving instantly from Supabase.
- **Unified Verdict Cards:** Test cases are evaluated concurrently and displayed in sleek, horizontal columns with raw GCC output preservation.

---

## Disclaimer

This is a personal/educational project and is not affiliated with, 
endorsed by, or sponsored by Codeforces. Problem data is fetched for 
personal practice and learning purposes only. Problem statements are 
cached temporarily to reduce load on Codeforces' 
servers and are not permanently stored. All problem content remains the 
property of Codeforces and its problem setters.

---

<div align="center">
  <i>Built with ❤️ for Competitive Programmers.</i>
</div>
