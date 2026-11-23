# 🤖 OpenAlgo - Antigravity Agentic Paper Trading Edition

> **A self-hosted, autonomous algorithmic paper-trading platform for Indian Equities (NSE/BSE) running inside Google Antigravity, requiring zero paid external AI API subscriptions.**

This repository is a customized fork of [`marketcalls/openalgo`](https://github.com/marketcalls/openalgo) maintained at [`rohan-091/openalgo`](https://github.com/rohan-091/openalgo). It extends OpenAlgo with an autonomous multi-agent swing trading engine, free market data fallback, and a decoupled local simulation sandbox.

---

## 📌 Executive Summary for Incoming Agents

If you are an AI agent picking up this codebase in a new session, here is everything you need to know:

1. **Target Asset & Horizon:** Indian Equities (Cash/CNC on NSE), Swing Trading (holding period: 2 to 30 days).
2. **Execution Engine:** OpenAlgo **Analyzer Mode** (Paper Trading Sandbox with ₹2,00,00,000.00 / ₹2.00 Crore virtual capital).
3. **Cost Architecture:** **Zero paid API costs.**
   - Model inference uses the active **Antigravity session token quota**.
   - Market data uses **Yahoo Finance (`yfinance`)** free quote fallbacks.
   - Broker APIs (Zerodha/Kite) are **disabled**; all order matching and fills run inside local SQLite (`database/sandbox.db`).
4. **Upstream Restrictions:** **NEVER create Pull Requests or push commits to `marketcalls/openalgo`.** The push URL for `upstream` is set to `DISABLE`. All commits belong strictly to `rohan-091/openalgo`.
5. **Privacy Safeguards:** Never commit `.env`, `*.db`, `TRADES.md`, or `trading_agent/active_trades_state.json`.

---

## 🏗️ Architecture & What Was Built

```
algotrading/
├── trading_agent/               # Antigravity Agentic Swing Trading Package
│   ├── __init__.py
│   ├── config.py               # Risk parameters, stock universe, OpenAlgo API endpoint
│   ├── data_feed.py            # Indicator pipeline (EMA 20/50/200, RSI 14, ATR 14, Volume MA)
│   ├── strategy.py             # SwingStrategyEngine (EMA Pullback, Donchian Breakout)
│   ├── risk.py                 # Position sizing (0.5% allocation cap, 1:1.5+ R:R ratio)
│   ├── executor.py             # REST API Client for local OpenAlgo Analyzer
│   ├── scanner.py              # Market scanner scoring setups (0 - 100)
│   ├── copilot.py              # Mode B: Human-in-the-loop interactive trading
│   ├── auto_trader.py          # Mode A: Autonomous daemon monitoring SL/Target & entries
│   └── active_trades_state.json # Local runtime state (Git-ignored)
├── services/
│   ├── quotes_service.py       # Patched with _fetch_yfinance_quote fallback
│   ├── yfinance_service.py     # Yahoo Finance historical bar & live quote adapter
│   ├── funds_service.py        # Patched for standalone paper trading without live broker
│   ├── orderbook_service.py    # Patched for standalone paper trading
│   ├── positionbook_service.py # Patched for standalone paper trading
│   ├── tradebook_service.py    # Patched for standalone paper trading
│   └── agent/
│       ├── litellm_tool_cleaner.py # Clean internal schema keys and repair JSON tool calls
│       └── litellm_loader.py       # Patched with tool-cleaning wrapper
├── blueprints/
│   └── auth.py                 # Patched _try_resume_broker_session for Analyzer bypass
├── test/
│   ├── test_trading_agent.py   # Full unit test suite for strategy, risk, and executor
│   └── test_agent_litellm_tool_cleaner.py # Schema & JSON recovery tests
├── AGENTS.md / GEMINI.md       # Hardcoded behavioral constraints for AI agents
├── run.bat / start.ps1         # One-click Windows launchers
└── TRADES.md                   # Real-time local trade journal (Git-ignored)
```

---

## ⚙️ Key Enhancements Over Vanilla OpenAlgo

### 1. `trading_agent/` Multi-Agent Architecture
- **Dual Operating Modes (Pillar 1):**
  - **Mode A (Autonomous Executor):** `auto_trader.py` runs continuous background loops, scans candidate setups, monitors existing trades, and executes stop-loss or target exits without human intervention.
  - **Mode B (Copilot Interactive):** `copilot.py` scans the market, presents high-probability setups with risk-reward metrics to the user, and waits for explicit approval before placing paper orders.
- **Strict Risk Management (Pillar 4):**
  - Capped capital allocation per trade: maximum `0.5%` of portfolio capital (e.g. ₹50,000 on test runs).
  - Maximum concurrent open swing positions: `5`.
  - Minimum Risk-to-Reward ratio: `1:1.5` (default target: `1:2.0`).
  - Strict Stop-Loss calculated dynamically using 14-day ATR and recent swing structure.

### 2. Standalone Zero-Broker Paper Trading
Vanilla OpenAlgo previously required an active broker access token (e.g. Zerodha Kite Connect login) even in Analyzer mode to read funds, orderbooks, and positions.
- **Decoupled Backend Services:** `funds_service.py`, `orderbook_service.py`, `positionbook_service.py`, and `tradebook_service.py` now check `get_analyze_mode()` first. If Analyzer mode is active and the local API key is verified, requests route directly to `services/sandbox_service.py` without requiring a broker session.
- **Zero Zerodha Dependency:** `.env` keys (`BROKER_API_KEY`, `BROKER_API_SECRET`, `REDIRECT_URL`) are empty. No paid Zerodha subscription is needed.

### 3. Free Live Market Data Fallback
- Added `_fetch_yfinance_quote` in `services/quotes_service.py`.
- If no live broker quote feed is connected, equities on NSE (`.NS`) and BSE (`.BO`) automatically fall back to Yahoo Finance for live LTP, Day High/Low, Open, and Volume.

### 4. UI Session Resume Patch
- In `blueprints/auth.py`, `_try_resume_broker_session` was patched to bypass broker token validation errors when `get_analyze_mode() == True`. This prevents *"That broker session has ended"* lockout modals when navigating the web dashboard.

---

## 🚀 Setup & Installation Guide

### Prerequisites
- **OS:** Windows / Linux / macOS
- **Python:** `3.12` or newer
- **Virtual Environment Tool:** `uv` (recommended) or standard `venv`

### Step 1: Clone the Fork
```bash
git clone https://github.com/rohan-091/openalgo.git algotrading
cd algotrading
```

### Step 2: Set Up Python Virtual Environment
Using `uv`:
```bash
uv venv .venv --python 3.12
.venv\Scripts\activate   # Windows
# source .venv/bin/activate # Linux/macOS
uv sync
```
Or using standard `pip`:
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Configure Environment (`.env`)
Create or edit `.env` in the repository root:
```env
# Host & Ports
FLASK_HOST_IP='127.0.0.1'
FLASK_PORT='5000'
WEBSOCKET_HOST='127.0.0.1'
WEBSOCKET_PORT='8765'
HOST_SERVER='http://127.0.0.1:5000'

# Broker Configuration (Keep EMPTY for standalone paper trading)
BROKER_API_KEY = ''
BROKER_API_SECRET = ''
REDIRECT_URL = ''

# Valid Brokers List
VALID_BROKERS = 'zerodha,dhan,fyers,angel,upstox'

# Security & Sessions
API_KEY_PEPPER = '9bbbb1378ba423e0c5b7ca51f2c03d43e678b07d6e57d29c421bbec7f392baad'
PASSWORD_PEPPER = '289382f7c030704407bdfa57db9e8bf2920253457a41aa1d596645318991cbff'
```

### Step 4: Initialize Sandbox Database
Run a one-line Python script to initialize database migrations and ensure virtual starting capital:
```bash
python -c "from database.sandbox_db import init_db, set_config; init_db(); set_config('starting_capital', '20000000.00')"
```

---

## 🏃 Running the Application

### 1. Start the OpenAlgo Server
Using the launcher script:
```cmd
run.bat
```
Or directly via Python:
```bash
python app.py
```
- **Web UI:** [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Analyzer Dashboard:** [http://127.0.0.1:5000/analyzer](http://127.0.0.1:5000/analyzer)
- **Orderbook:** [http://127.0.0.1:5000/orderbook](http://127.0.0.1:5000/orderbook)
- **Positions:** [http://127.0.0.1:5000/positions](http://127.0.0.1:5000/positions)

---

### 2. Run the Trading Agent

#### A. Interactive Copilot Mode (Scan & Approve)
Scans the Nifty large-cap universe, displays technical setups, and prompts for confirmation before paper execution:
```bash
python -m trading_agent.copilot
```

#### B. Market Scanner Only
Runs technical indicators and outputs top candidate scores without placing orders:
```bash
python -m trading_agent.scanner
```

#### C. Autonomous Background Trader
Continuously checks active positions against Stop-Loss and Target prices, and scans for fresh opportunities:
```bash
python -m trading_agent.auto_trader
```

---

## 🧪 Running Unit Tests

The test suite covers trading agent logic, risk manager bounds, and schema parsing:

```bash
pytest test/test_trading_agent.py test/test_agent_litellm_tool_cleaner.py
```
Expected output: **`10 passed`**.

---

## 🛡️ Critical Agent Operational Rules

Any agent modifying or extending this repository must adhere to the rules codified in [AGENTS.md](file:///c:/Users/CM_Rail/PycharmProjects/algotrading/AGENTS.md):

1. **Strict Upstream Prohibition:**
   - Push URL for `upstream` is permanently set to `DISABLE`.
   - Never push branches or open Pull Requests against `marketcalls/openalgo`.
   - All commits and branches must be pushed exclusively to `origin` (`rohan-091/openalgo`).
2. **Analyzer Mode Only:**
   - Ensure `get_analyze_mode() == True` at all times.
   - Do not switch to live execution without explicit user direction.
3. **Credentials & Privacy:**
   - `.env`, `*.db`, `trading_agent/active_trades_state.json`, and `TRADES.md` are ignored in `.gitignore`.
   - Never hardcode API keys, passwords, or account tokens in tracked code files.
