# PollStream

Real-time live polling app. Create multi-question polls, share a code, see live results.

**Stack:** React + Vite · Flask · Socket.IO · Recharts · QR Code

---

## Run locally

**1. Backend**
```bash
pip install -r requirements.txt
python app.py
```
Runs on http://localhost:5001

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

---

## Deploy to Render (free)

1. Push this repo to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo
4. Settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Start command:** `gunicorn --worker-class eventlet -w 1 app:app`
   - **Environment variable:** `SECRET_KEY` = any random string
5. Deploy — get a live public URL!

---

## Features
- Multi-question polls
- Per-question countdown timer
- Live vote updates via WebSockets
- Host dashboard with live bar chart
- QR code for easy joining
- Voter name entry
- Open/close poll toggle
- Final results page with winner highlight
