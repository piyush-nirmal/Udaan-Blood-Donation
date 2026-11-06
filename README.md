# UDAAN (उड़ान) — Voluntary Blood Donation Network India 🩸

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-5.x-092e20.svg?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)

> **Connecting emergency blood requesters with verified voluntary donors across India.**  
> 100% free, voluntary, non-commercial, and open-source.

---

## 🌟 Key Highlights & Features

- **🚨 Live Emergency Request Board**: Real-time listing of emergency blood requests with urgency levels (`CRITICAL`, `URGENT`, `NORMAL`), blood group filters, unit counts, and live fulfillment progress.
- **🩸 Voluntary Donor Portal**: Secure donor profiles with blood group, city/state, donation history, and automatic 90-day medical donation gap calculation.
- **📜 Verifiable Digital Certificates**: Generate and download authentic donation certificates with unique Donor Identification Numbers (DIN) and QR verification.
- **🏥 Blood Bank Directory**: Searchable directory of verified blood banks across India with contact details, address, operating hours, and live availability.
- **🏕️ Blood Donation Camps & Drives**: Schedule and browse upcoming community blood donation camps organized by partnered hospitals and NGOs.
- **🤝 Partner & NGO Network**: Directory of healthcare partners, medical colleges, and community blood collection initiatives.
- **🌐 Bilingual Localization**: Seamless one-click switching between **English** and **Hindi (हिंदी)** across all workflows.
- **⚡ Dual-Mode Engine**: Runs in standalone mode out-of-the-box with comprehensive client-side mock data, or hooks directly into the Django REST backend via simple environment flags.
- **🐳 Production Ready**: Fully containerized with multi-stage Docker builds for React and Django, orchestrated via Docker Compose with Nginx reverse proxy.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4 | Ultra-fast client, fully typed, responsive UI with Lucide icons |
| **Backend** | Python 3.12, Django 5.x, Django REST Framework | RESTful APIs, token-based authentication, model validations |
| **Database** | PostgreSQL 16 (or SQLite for quick test) | ACID-compliant relational storage with indexed donor & request tables |
| **Reverse Proxy** | Nginx Alpine | Serves static frontend bundles, handles `/api/` proxying & gzip/brotli |
| **Containerization** | Docker & Docker Compose | Production multi-stage containers for zero-downtime deployment |

---

## 📁 Repository Structure

```text
udaan-blood-donation-platform/
├── backend/                  # Django REST API backend
│   ├── accounts/             # User & Donor auth, models, and profiles
│   ├── core/                 # Requests, donations, camps, blood banks, partners
│   │   ├── management/       # Management commands (e.g., seed_demo)
│   │   └── ...
│   ├── udaan/                # Django project settings and WSGI configuration
│   ├── Dockerfile            # Python production container definition
│   ├── entrypoint.sh         # Migration, static collection, and Gunicorn startup
│   ├── manage.py
│   └── requirements.txt      # Python backend dependencies
├── nginx/
│   └── default.conf          # Nginx reverse proxy & frontend static serving
├── src/                      # React 19 frontend source code
│   ├── components/           # Feature views and UI components
│   │   ├── ui/               # Reusable primitives (Button, Modal, Card, Chip, Toast)
│   │   ├── LiveBoard.tsx     # Emergency request feed & urgent callouts
│   │   ├── DonorPortal.tsx   # Donor registry and profile
│   │   ├── CampsView.tsx     # Blood donation camps and drives
│   │   ├── BloodBanksDirectory.tsx # Blood bank locator
│   │   └── CertificateGenerator.tsx # Verifiable digital certificate generator
│   ├── lib/                  # API client, Mock API adapter, and i18n
│   ├── types/                # TypeScript interfaces and contracts
│   ├── App.tsx               # Primary application component
│   ├── index.css             # Tailwind v4 theme and custom styles
│   └── main.tsx              # React DOM entrypoint
├── .dockerignore             # Docker build context exclusions
├── .env.example              # Environment variable template
├── .gitignore                # Comprehensive Git exclusions
├── DEPLOY.md                 # Production VPS deployment guide
├── docker-compose.yml        # Multi-container orchestration
├── Dockerfile                # Frontend multi-stage Nginx build
├── index.html                # Application HTML entry point
├── package.json              # Frontend dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite 8 configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20+` (v22 or v24 recommended)
- **npm**: `v10+`
- **Python**: `3.11+` (if running backend locally without Docker)
- **Docker & Docker Compose**: (optional, for full containerized stack)

---

### Option 1: Standalone Frontend (Fastest - Zero Backend Setup)

The frontend includes a built-in mock API adapter with pre-populated demo data, enabling instant frontend development without needing Python or PostgreSQL.

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Full-Stack with Docker Compose (Recommended)

Boot PostgreSQL, Django REST API, Frontend, and Nginx reverse proxy together with a single command:

```bash
# 1. Copy sample environment file
cp .env.example .env

# 2. Build and launch all containers in detached mode
docker compose up -d --build

# 3. Seed demo data (blood requests, camps, blood banks, donors)
docker compose exec backend python manage.py seed_demo
```

Access points:
- **Web Application**: [http://localhost](http://localhost)
- **REST API Endpoint**: [http://localhost/api/](http://localhost/api/)
- **Django Admin**: [http://localhost/admin/](http://localhost/admin/)

To stop services:
```bash
docker compose down
```

---

### Option 3: Manual Local Development (Backend + Frontend)

#### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Seed realistic demo data
python manage.py seed_demo

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```

#### Frontend Setup

In another terminal:

```bash
# Ensure VITE_USE_MOCK=false if connecting to local Django
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_DB` | PostgreSQL database name | `udaan_db` |
| `POSTGRES_USER` | PostgreSQL user | `udaan_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `replace_with_strong_password` |
| `DJANGO_SECRET_KEY` | Secret key for Django sessions & hashing | Random secure string |
| `DJANGO_DEBUG` | Django debug mode (`True` or `False`) | `False` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed host headers | `localhost,127.0.0.1` |
| `DONATION_GAP_DAYS` | Minimum required rest period between donations | `90` |
| `VITE_USE_MOCK` | Toggle frontend mock API (`true` / `false`) | `false` |
| `VITE_API_URL` | Base API URL prefix | `/api` |

---

## 📡 API Overview

The Django REST API exposes the following primary endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register/` | `POST` | Register a new user / donor account |
| `/api/auth/login/` | `POST` | Authenticate and obtain auth token |
| `/api/auth/me/` | `GET` | Retrieve current authenticated profile |
| `/api/requests/` | `GET`, `POST` | List emergency blood requests or create a request |
| `/api/requests/<id>/respond/` | `POST` | Pledge donation response for a request |
| `/api/requests/<id>/cancel/` | `POST` | Cancel active donation pledge |
| `/api/camps/` | `GET`, `POST` | List or register donation camps |
| `/api/camps/<id>/register/` | `POST` | Register attendance for a blood camp |
| `/api/bloodbanks/` | `GET` | List verified blood banks with inventory data |
| `/api/partners/` | `GET` | List verified healthcare and NGO partners |
| `/api/feedback/` | `POST` | Submit platform feedback or inquiry |

---

## 🛠️ NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Launch Vite development server on port `3000` |
| `npm run build` | Compile optimized production assets to `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run typecheck` | Run TypeScript compiler type checking without emitting files |
| `npm run lint` | Run TypeScript code validation |

---

## 🚀 Production Deployment

For deploying to production servers or VPS (Ubuntu, Debian, AWS EC2, DigitalOcean, Hetzner), refer to the step-by-step guide in [DEPLOY.md](DEPLOY.md). It covers:
- System prerequisites and Docker setup
- SSL certificate provisioning with Certbot
- Nginx reverse proxy configuration
- Automated deployment via GitHub Actions workflow template (`deploy/deploy-workflow.yml`)

---

## 🤝 Contributing

Contributions are warmly welcomed to make voluntary blood donation accessible to every citizen:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file or headers for details.
