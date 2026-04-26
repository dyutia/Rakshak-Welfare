# Rakshak Welfare

Rakshak Welfare is a comprehensive welfare-assistance platform that helps users discover and access government schemes through intelligent eligibility matching and document verification.

## Key Features

### 🔐 Authentication & Security

- User registration with profile details and government ID verification
- Mobile OTP login (6-digit OTP, 5-minute expiry)
- JWT-based authentication with HTTP-only cookies
- Account recovery via Aadhaar upload + auditor approval

### 📋 Eligibility Matching

- **Smart Scheme Discovery**: Matches users to government schemes based on:
  - Age, gender, caste, income, state residency
  - Document verification status
- **Eligible Schemes**: Fully qualified schemes (all criteria met + documents verified)
- **Potential Schemes**: Near-miss schemes with percentage scoring and improvement suggestions
- **Real-time Updates**: Eligibility recalculates on profile changes
- **Percentage Scoring**: Visual progress bars showing how close users are to unlocking schemes

### 📄 Document Management

- **Self-Declared Documents**: Users can list documents they hold during registration
- **Auto-Document Addition**: Government ID documents auto-added based on registration type
- **OCR-Powered Verification**: Upload document images for AI audit and verification
- **Verification Status**: Documents move from `documentsHeld` to `verifiedDocuments` upon successful audit

### 🤖 AI Document Audit

- Upload government document images (JPG/PNG)
- OCR extraction and validation using Tesseract.js
- Fuzzy name matching and date validation
- Automatic document verification on successful audit
- **Device-Aware UI**: Mobile camera capture, desktop file upload
- **Modular Verification**: Weighted confidence scoring per document type

### 🎤 Voice Language Detection

- **First-Time Setup**: Automatic language detection popup on first login
- **Multi-Language Support**: Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi
- **Bhashini Integration**: TTS for instructional audio, LID for language detection
- **Smart Sequencing**: Auto-play instructions → Voice recording → Language confirmation
- **Haptic Feedback**: Vibration when recording starts
- **Rural Fail-Safe**: Follow-up prompts for no audio detection
- **Persistent Preference**: Language preference saved to user profile

### 🗄️ Database Management

- Auto-seeding of government schemes on server startup
- MongoDB with Mongoose ODM
- Connection fallback for restrictive networks

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: JWT (OTP-based)
- **OCR**: Tesseract.js
- **AI Matching**: Custom eligibility algorithms with percentage scoring
- **Voice Services**: Bhashini API (TTS + Language Identification)
- **Audio Processing**: Web Audio API, MediaRecorder

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB

### Installation

1. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd rakshak-welfare
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   node app.js
   ```

   Server runs on: `http://localhost:5000`

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   App runs on: `http://localhost:5173`

## Environment Configuration

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rakshak-welfare
MONGO_URI_DIRECT=mongodb://localhost:27017/rakshak-welfare

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here
CLIENT_URL=http://localhost:5173

# Auditor (for account recovery approvals)
AUDITOR_KEY=your-auditor-key-here

# Bhashini Voice Services
BHASHINI_API_KEY=your-bhashini-api-key-here
```

## API Reference

### Authentication Endpoints

| Method | Endpoint                        | Description                               |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`            | Register user with auto-document addition |
| POST   | `/api/auth/login`               | Generate OTP for phone number             |
| POST   | `/api/auth/verify-otp`          | Verify OTP and return JWT                 |
| POST   | `/api/auth/recover-phone`       | Recover account via Aadhaar upload        |
| POST   | `/api/auth/logout`              | Clear authentication                      |

### User Management

| Method | Endpoint        | Description                                |
| ------ | --------------- | ------------------------------------------ |
| PATCH  | `/api/users/me` | Update profile and recalculate eligibility |

### Scheme Eligibility

| Method | Endpoint                | Description                                     |
| ------ | ----------------------- | ----------------------------------------------- |
| GET    | `/api/schemes/eligible` | Get eligible and potential schemes with reasons |

### Document Audit

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/api/audit/audit-upload` | Upload and audit document image |
| POST   | `/api/audit/approve-phone-recovery` | Auditor approves phone recovery |
| POST   | `/api/audit/reject-phone-recovery` | Auditor rejects phone recovery |

### Voice Language Detection

| Method | Endpoint                        | Description                               |
| ------ | ------------------------------- | ----------------------------------------- |
| GET    | `/api/voice/instructional-audio` | Get Hindi instructional audio (TTS) |
| GET    | `/api/voice/followup-audio`     | Get follow-up audio for no speech detected |
| POST   | `/api/voice/detect-language`     | Upload audio for language identification |
| POST   | `/api/voice/update-preference`  | Update user's preferred language |
| GET    | `/api/voice/preference`         | Get user's language preference |

## User Flow

1. **Registration**: User provides details → Aadhaar saved to prevent duplicate accounts
2. **Login**: Enter phone number → receive OTP (6 digits, expires in 5 minutes)
3. **Verify OTP**: Enter OTP → receive JWT → authenticated session
4. **First-Time Setup**: Voice language detection popup → User speaks → Language preference saved
5. **Eligibility Check**: View matched schemes (eligible + potential with percentage scores)
6. **Document Verification**: Upload document images for OCR audit → Verified documents enable more schemes
7. **Profile Updates**: Modify details to improve eligibility matches
8. **Account Recovery (phone lost)**: Upload Aadhaar photo + new phone → auditor approves linking

## Database Schema

### User Model

- Personal info (name, phoneNumber, age, gender, caste, income, location)
- Authentication (OTP + expiry)
- Documents (held: self-declared, verified: audited)
- Government ID (aadhaarNumber)
- **Voice Preferences**: preferredLanguage, languageDetected

### Scheme Model

- Scheme details (name, department, state, description)
- Eligibility criteria (age range, income limit, gender, caste)
- Required documents array
- Application link

## Project Structure

```
rakshak-welfare/
├── backend/
│   ├── app.js              # Main server with auto-seeding
│   ├── config/db.js        # Database connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helpers (matcher, audit)
│   └── seed.js            # Manual seeding script
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React app
│   │   ├── api.js         # API client
│   │   └── assets/        # Static files
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:

- Check the API documentation above
- Review environment configuration
- Ensure MongoDB is properly configured
