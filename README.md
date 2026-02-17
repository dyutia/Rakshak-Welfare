# Rakshak-Welfare

**Rakshak-Welfare** is an intelligent welfare-access platform being built to automate government scheme discovery and reduce application rejections for Indian citizens.

It is designed to combine:
- profile-based scheme matching
- AI-powered document auditing
- multilingual voice support
- proactive WhatsApp notifications

## Vision

The goal is to move from passive eligibility checking to active welfare delivery, where eligible citizens are guided, validated, and notified end-to-end.

## Current Status (What Works Today)

The current codebase has a working Node.js backend with:
- user registration and login with JWT (`/api/auth/*`)
- protected AI document audit upload (`/api/audit/audit-upload`)
- MongoDB integration via Mongoose

Also present in code (but not fully wired in runtime yet):
- scheme eligibility routes (`schemeRoutes.js`)
- translation utility (`bhashiniService.js`)
- scheme seed script (`seed.js`)

## Planned Features (In Progress)

These are planned and will be completed:
- full scheme APIs under `/api/schemes`
- multilingual voice flows (Bhashini ASR/TTS)
- proactive WhatsApp notification engine (Twilio)
- admin-triggered new-scheme matching and alert broadcasting
- React frontend for citizen and admin workflows

## One-Command Start

### Backend (Current)

```bash
cd backend
npm install
node app.js
```

Note: `npm start` script is not added yet in current `package.json`.

### Frontend (Planned)

```bash
cd frontend
npm install
npm run dev
```

Target URL: `http://localhost:5173`

## Project Structure

```text
rakshak-welfare/
|-- backend/
|   |-- controllers/      # Auth + scheme logic
|   |-- models/           # User and Scheme schemas
|   |-- routes/           # Auth, Audit, Scheme routes
|   |-- utils/            # Matcher, OCR audit, translation services
|   |-- middleware/       # JWT protection
|   |-- config/           # DB connection
|   |-- seed.js           # Scheme seed data
|   `-- app.js            # Express server entry
|-- frontend/             # React app (to be completed)
|-- .gitignore
`-- README.md
```

## How It Works (Target Flow)

- Smart Profile: User registers with socio-economic profile data.
- Eligibility Matcher: Backend matches profile against scheme criteria.
- AI Document Audit: OCR + fuzzy matching checks uploaded documents before submission.
- Voice Agent: Users query schemes in regional languages.
- Proactive Alerts: Users receive WhatsApp notifications for newly relevant schemes.

## API Endpoints

### Available Now

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user and return JWT |
| POST | `/api/auth/login` | Login and return JWT |
| POST | `/api/audit/audit-upload` | Protected document audit upload |

### Planned / To Be Exposed

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/schemes/eligible` | Fetch matched schemes based on JWT profile |
| GET | `/api/schemes/voice-info/:name?lang=hi` | Language-specific speech-ready scheme info |
| POST | `/api/schemes/voice-query` | Audio query processing via Bhashini ASR |
| POST | `/api/schemes/notify-new-scheme` | Trigger proactive alerts to matched users |

## External Services Setup (For Planned Modules)

### 1) Bhashini (Voice and Translation)

Add in backend `.env`:

```env
BHASHINI_API_KEY=your_key
```

### 2) Twilio WhatsApp

Add in backend `.env`:

```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## Environment Variables (Backend)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
BHASHINI_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## Roadmap

1. Add backend scripts (`start`, `dev`, `seed`) and `.env.example`.
2. Mount and stabilize `/api/schemes` routes.
3. Complete Twilio alert pipeline.
4. Complete voice query pipeline with Bhashini.
5. Build and integrate React frontend.
6. Add tests and deployment pipeline.
