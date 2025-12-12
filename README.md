# MFA Demo Application

A full-featured Multi-Factor Authentication (MFA) demo application built with Next.js, React, and TypeScript. This demo showcases a complete MFA setup flow with TOTP (Time-based One-Time Password) authentication, QR code generation, backup codes, and a complete login flow.

## Features

- 🔐 **Complete MFA Setup Flow** - Step-by-step wizard for setting up two-factor authentication
- 📱 **QR Code Generation** - Real, scannable QR codes compatible with Google Authenticator and other TOTP apps
- 🔑 **TOTP Verification** - Real-time OTP validation using `otplib`
- 💾 **Backup Codes** - Generate and manage recovery codes
- 🚀 **Full Authentication Flow** - Login with email/password and MFA verification
- 📊 **Dashboard** - Protected dashboard with MFA status management
- 💾 **File-based Storage** - Persistent storage using JSON files (easily replaceable with a database)
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **Icons**: Lucide React
- **MFA Library**: otplib
- **QR Codes**: qrcode.react
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd demo-m2f
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Demo Credentials

- **Email**: `user@example.com`
- **Password**: `demo123`

### Setting Up MFA

1. **Login** - Use the demo credentials above
2. **Navigate to Dashboard** - After login, you'll see the dashboard
3. **Setup MFA** - Click "Thiết lập MFA" (Setup MFA) button
4. **Follow the Wizard**:
   - Step 1: Introduction and instructions
   - Step 2: Scan QR code with Google Authenticator (or enter secret manually)
   - Step 3: Verify with 6-digit code from authenticator app
   - Step 4: Save backup codes
   - Step 5: Success confirmation

### Testing MFA Login

1. **Logout** from the dashboard
2. **Login again** with the same credentials
3. **Enter MFA Code** - You'll be prompted for the 6-digit code from your authenticator app
4. **Alternative**: Use a backup code if you don't have access to your authenticator

## Project Structure

```
demo-m2f/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── login/          # Login endpoint
│   │   │   └── mfa/
│   │   │       ├── generate/        # Generate MFA secret & backup codes
│   │   │       ├── verify/          # Verify OTP tokens
│   │   │       ├── enable/          # Enable MFA after verification
│   │   │       └── status/          # Check MFA status
│   │   ├── components/
│   │   │   ├── MFASetupFlow.tsx     # Main MFA setup component
│   │   │   └── LoginPage.tsx        # Login page component
│   │   ├── dashboard/               # Protected dashboard page
│   │   ├── page.tsx                 # Home/login page
│   │   └── layout.tsx               # Root layout
│   └── lib/
│       └── mfa-store.ts             # File-based storage utilities
├── data/
│   └── mfa-store.json              # MFA data storage (auto-generated)
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate user with email/password

### MFA Operations

- `POST /api/mfa/generate` - Generate new MFA secret and backup codes
- `POST /api/mfa/verify` - Verify OTP token or backup code
- `POST /api/mfa/enable` - Enable MFA for a user
- `GET /api/mfa/status?userId=<id>` - Get MFA status for a user

## Architecture

### MFASetupFlowObject

The component uses a structured object pattern for better organization:

- **`api`** - All API call functions
- **`utils`** - Utility functions (TOTP URI generation, clipboard, file download)
- **`handlers`** - Event handlers for user interactions
- **`ui`** - UI components (structure ready for future organization)

### Storage

The application uses file-based storage (`data/mfa-store.json`) for persistence. In a production environment, this should be replaced with a proper database.

### Security Notes

⚠️ **This is a demo application**. For production use:

- Replace file-based storage with a secure database
- Implement proper password hashing (bcrypt, argon2)
- Add rate limiting for API endpoints
- Use secure session management
- Implement CSRF protection
- Add proper error logging and monitoring
- Use environment variables for sensitive configuration

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Data Storage

MFA data is stored in `data/mfa-store.json`. This file is automatically created on first use and is excluded from git (see `.gitignore`).

To reset the demo:
```bash
rm -rf data/
```

## Features in Detail

### MFA Setup Flow

1. **Security Settings Screen** - Overview and activation button
2. **Introduction Screen** - Step-by-step instructions
3. **QR Code Screen** - Scannable QR code and manual entry option
4. **OTP Verification** - Real-time token validation
5. **Backup Codes** - Display and download recovery codes
6. **Success Screen** - Confirmation and next steps

### Login Flow

1. Email/password authentication
2. MFA status check
3. OTP verification (if MFA enabled)
4. Backup code option (if needed)
5. Dashboard access

## Contributing

This is a demo project. Feel free to fork and modify for your own use.

## License

This project is provided as-is for demonstration purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- MFA implementation using [otplib](https://github.com/yeojz/otplib)
- QR Code generation with [qrcode.react](https://github.com/rosskhanas/react-qr-code)
- Icons from [Lucide](https://lucide.dev)
