# Helper4U — Maid & Nanny Service Management Platform

> A centralized web-based platform that connects households with **verified** domestic helpers — maids, babysitters, and nannies — with flexible hourly, monthly & yearly service plans.

![Status](https://img.shields.io/badge/status-MVP%20Complete-brightgreen)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20MongoDB%20%7C%20Tailwind-blue)
![Tests](https://img.shields.io/badge/backend%20tests-46%2F46%20passing-success)

---

## 🎯 Overview

Households often rely on unverified informal networks to hire domestic help — leading to safety risks, unreliable service, and inconsistent pricing. **Helper4U digitizes the entire hiring process** with verified profiles, flexible plans, transparent pricing, and full booking management.

## 🚀 Live Demo

**Demo Login (Admin):**
- Email: `admin@helper4u.com`
- Password: `admin123`

Or sign up as a **Household** or **Helper** from the landing page.

---

## ✨ Features

### 🏠 Household (User)
- Registration & secure login
- Create/edit household profile (address, family size, preferences)
- Browse verified helpers with photos & bios
- **Filter by:** service type, city, service plan (hourly/monthly/yearly), experience level, availability, verified-only, name search
- View detailed helper profiles: skills, languages, ratings, reviews, pricing
- Book with **3 flexible plans**: hourly / monthly / yearly
- Cancel bookings
- Track service history & booking status
- Leave star ratings & written reviews
- Raise complaints/disputes with attached booking context

### 👩‍🍳 Helper (Maid / Nanny / Babysitter)
- Self-registration with service type, pricing, bio
- Upload verification documents (ID Proof, Address Proof, Police Verification, References, Certificates)
- Manage availability (Full-time / Part-time / Live-in / Weekdays / Evenings & Weekends)
- Set hourly, monthly & yearly service pricing
- Accept / reject / complete service requests
- Mark daily attendance (present / absent) per booking
- View job history and earnings summary
- View verification badge status

### 🛡️ Admin
- Verify & approve helper profiles (toggle)
- Review & approve/reject uploaded documents
- Manage all users (view / remove non-admin users)
- Manage service categories (CRUD)
- Monitor bookings, cancellations, and attendance records
- Handle complaints with reply & resolve workflow
- **Analytics Dashboard** with charts & KPIs:
  - Completion Rate
  - Average Customer Satisfaction (★)
  - Monthly Active Users
  - Total Revenue
  - Revenue Trend (6-month line chart)
  - Bookings per Month (bar chart)
  - Booking Status Breakdown (pie chart)
  - Plan & Service Distribution
  - Top-Rated Helpers leaderboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | JavaScript / React 18 |
| **UI** | Tailwind CSS + shadcn/ui + Radix UI |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Backend** | Next.js API Routes (REST) |
| **Database** | MongoDB |
| **Notifications** | Sonner (toast) |
| **State** | React hooks + localStorage |

---

## 📁 Project Structure

```
/app
├── app/
│   ├── api/
│   │   └── [[...path]]/
│   │       └── route.js     # All REST API endpoints (single catch-all)
│   ├── globals.css          # Tailwind + theme tokens
│   ├── layout.js            # Root layout (Toaster, fonts)
│   └── page.js              # Main application (all UI)
├── components/
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   └── utils.js
├── .env                     # MONGO_URL, DB_NAME, NEXT_PUBLIC_BASE_URL
├── package.json
├── tailwind.config.js
├── PRD.md                   # Product Requirements Document
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Yarn (do **not** use npm — it will break the lockfile)
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Clone the repository
```bash
git clone https://github.com/bhupathiabhichethan/MaidService.git
cd MaidService
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=helper4u
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
```

### 4. Run the development server
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. First-time seed
On the first API call to `/api/helpers`, the database is automatically seeded with:
- 8 sample verified helpers across 7 cities
- 3 default service categories (Maid / Nanny / Babysitter)
- 1 admin user (admin@helper4u.com / admin123)

---

## 🌐 REST API Endpoints

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register household or helper |
| POST | `/auth/login` | Login (any role) |

### Helpers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/helpers` | List with filters (service, city, plan, minExp, availability, verifiedOnly, q) |
| GET | `/helpers/{id}` | Get helper + reviews |
| PATCH | `/helpers/{id}` | Update helper profile |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings` | Create booking |
| GET | `/bookings?user_id=...` | List by user |
| GET | `/bookings?helper_id=...` | List by helper |
| GET | `/bookings?all=true` | All (admin) |
| PATCH | `/bookings/{id}` | Update status |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/reviews` | Submit review (auto-updates helper rating) |

### Documents (Helper Verification)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/documents` | Upload verification document |
| GET | `/documents?helper_id=...` | List documents |
| PATCH | `/documents/{id}` | Approve/reject |
| DELETE | `/documents/{id}` | Delete |

### Complaints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/complaints` | Raise complaint |
| GET | `/complaints?user_id=...` / `?all=true` | List |
| PATCH | `/complaints/{id}` | Admin reply & resolve |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| POST | `/attendance` | Mark attendance |
| GET | `/attendance?helper_id=...` / `?all=true` | List |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List categories |
| POST | `/categories` | Add category |
| PATCH | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | Platform-level counts |
| GET | `/admin/analytics` | Charts & KPI data |
| GET | `/admin/users` | All users |
| GET | `/admin/helpers` | All helpers |
| DELETE | `/admin/users/{id}` | Remove user |

### User Profile
| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/users/{id}` | Update household profile |

---

## 🧪 Testing

Backend has been tested with **46 comprehensive test cases — 100% pass rate**, covering:
- All auth flows (household, helper, admin, duplicate email, wrong password)
- All 7 helper filters independently
- Booking lifecycle (create → accept → complete / cancel / reject)
- Review submission & automatic rating recomputation
- Document upload / approve / reject / delete
- Complaint raise / resolve with admin reply
- Attendance marking
- Category CRUD
- Admin analytics data shape validation

---

## 📱 Responsive Design

Fully responsive across:
- **Mobile** (320px+): stacked filters, single-column helper cards, mobile-optimized nav
- **Tablet** (768px+): 2-column helper grid
- **Desktop** (1024px+): 3-column helper grid, side-by-side filters, full analytics charts

---

## 🚢 Deployment

Deployment-ready. Recommended platforms:

### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel --prod
```
Add environment variables in Vercel dashboard:
- `MONGO_URL` (use MongoDB Atlas)
- `DB_NAME`
- `NEXT_PUBLIC_BASE_URL`

### Other options
- Netlify (with Next.js runtime)
- AWS Amplify / EC2
- Railway / Render

---

## 📈 KPIs Tracked

- Number of registered households
- Number of verified helpers
- Booking & subscription completion rate
- Helper reliability score (attendance + completion)
- Customer satisfaction rating (avg reviews)
- Monthly active users

---

## 🗺️ Future Enhancements (Out-of-Scope for Phase 1)

- Online payments (Stripe / Razorpay)
- Native mobile application
- Attendance & leave payroll automation
- Multi-language support
- Emergency SOS feature
- GPS-based real-time tracking
- In-app chat between household and helper

---

## 📄 License

This project is developed as an academic/portfolio project under Unified Mentor guidance.

---

## 👤 Author

**Bhupathi Abhi Chethan**

Project built as part of the Unified Mentor internship — **Helper4U** initiative.
