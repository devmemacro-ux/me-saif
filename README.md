# Fayez STORE - PUBG UC Store

متجر احترافي لبيع شدات PUBG مع نظام أكواد تلقائي ولوحة تحكم كاملة.

## 🚀 Quick Start

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Seed database (creates admin + test data)
cd server && npm run seed

# Run development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fayez.store | admin123 |
| User | user@test.com | user123 |

## 📁 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Route Pages
│   │   ├── stores/         # Zustand State
│   │   └── lib/            # API & i18n
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── database/       # SQLite + Repositories
│   │   ├── modules/        # Feature Modules
│   │   └── shared/         # Middlewares & Utils
```

## ✨ Features

- 🌙 Dark theme (GitHub-inspired)
- 🌐 Multi-language (EN/AR) with RTL support
- 🔒 JWT Authentication with httpOnly cookies
- 💰 Wallet system with deposit requests
- 🎮 Automatic code delivery
- 📊 Full admin dashboard
- 🔔 In-app notifications

## 🛠 Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Zustand, i18next
**Backend:** Node.js, Express, TypeScript, SQLite (better-sqlite3)
