# Sarthi

Monorepo for Sarthi application.

```
Sarthi/
├── backend/    # Node.js + Express + MySQL API
└── frontend/   # React + Vite + Tailwind
```

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env.local   # fill in values
npm run dev                   # uses .env.local
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:8080`.

## Deployment

- **Backend** deploys to Hostinger via Git pull → restart in hPanel Node.js app.
- **Frontend** builds via GitHub Actions and deploys `dist/` to `public_html/`.

See `.github/workflows/deploy.yml`.
