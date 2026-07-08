# Product Requirements Document (PRD)
## Helper4U — Maid & Nanny Service Management Platform

**Version:** 1.0
**Date:** June 2025
**Author:** Bhupathi Abhi Chethan
**Program:** Unified Mentor Internship — Helper4U

---

## 1. Executive Summary

Helper4U is a centralized web-based platform that connects households with **verified** domestic helpers — maids, babysitters, and nannies. The platform provides flexible service plans (hourly/monthly/yearly) and ensures trust, transparency, and convenience through profile verification, booking management, and service tracking.

---

## 2. Problem Statement

Households often rely on informal networks or unverified agents to hire domestic help, leading to:

- ❌ Lack of background verification
- ❌ Unreliable service and sudden absenteeism
- ❌ No standardized pricing or service plans
- ❌ Poor communication and accountability
- ❌ Manual coordination and follow-ups

---

## 3. Objectives

### 3.1 Primary Objectives
- Digitize the maid and nanny hiring process
- Provide verified and trustworthy service providers
- Enable flexible service plans (hourly/monthly/yearly)
- Improve reliability and service transparency

### 3.2 Secondary Objectives
- Maintain service history and performance records
- Enable rating and feedback mechanisms
- Support scalable expansion across cities

---

## 4. Scope

### 4.1 In-Scope
- Web-based platform (desktop & mobile responsive)
- Maid, babysitter, and nanny listings
- Booking and service plan management
- Helper verification and profile management
- Admin dashboard with analytics

### 4.2 Out-of-Scope (Phase 1)
- Native mobile applications
- Payroll automation & salary disbursement
- GPS-based real-time tracking
- Online payment processing

---

## 5. Target Users

| Persona | Goals | Pain Points Solved |
|---|---|---|
| **Household (Priya, 35, working mom)** | Find a trustworthy nanny for her 2-year-old | No more sketchy agent referrals; sees verified badges & reviews |
| **Helper (Anita, 28, maid)** | Get consistent job requests & fair pay | Direct access to households; transparent pricing |
| **Admin (Platform ops)** | Ensure platform quality & handle disputes | Central verification dashboard + analytics |

---

## 6. Functional Requirements

### 6.1 Household (User) Features
| # | Requirement | Implementation Status |
|---|---|---|
| U1 | User registration & login | ✅ Implemented |
| U2 | Create/edit household profile | ✅ Profile tab in dashboard |
| U3 | Browse available helpers | ✅ Grid with photos, ratings |
| U4 | Search & filter by Service Type | ✅ Dropdown (maid/nanny/babysitter) |
| U5 | Filter by Experience level | ✅ Any / 1+ / 3+ / 5+ / 10+ years |
| U6 | Filter by Availability | ✅ Full-time / Part-time / Live-in / etc. |
| U7 | Filter by Service plan | ✅ Hourly / Monthly / Yearly |
| U8 | View helper profiles | ✅ Detailed sheet with skills, languages, reviews |
| U9 | Book services & manage subscriptions | ✅ 3 plans + start date + address + notes |
| U10 | Track service history and status | ✅ Bookings tab with statuses |
| U11 | Cancel bookings | ✅ Cancel button on pending/accepted |
| U12 | Rate & review helpers | ✅ Star rating + written review |
| U13 | Raise complaints | ✅ Per-booking or general |

### 6.2 Helper (Maid/Babysitter/Nanny) Features
| # | Requirement | Implementation Status |
|---|---|---|
| H1 | Helper registration & profile creation | ✅ Includes service type, pricing, bio |
| H2 | Upload identity & background verification documents | ✅ 5 doc types (ID, Address, Police, References, Certificates) |
| H3 | Manage availability | ✅ 5 availability modes |
| H4 | Manage preferred service plans (pricing) | ✅ Hourly/Monthly/Yearly pricing |
| H5 | Accept or reject service requests | ✅ Accept/Reject/Mark Completed |
| H6 | View assigned jobs and work history | ✅ Job Requests tab |
| H7 | Track earnings (view-only in Phase 1) | ✅ Total earnings card |
| H8 | Mark attendance | ✅ Present/Absent per booking |

### 6.3 Admin Features
| # | Requirement | Implementation Status |
|---|---|---|
| A1 | Verify and approve helper profiles | ✅ Toggle verification |
| A2 | Review verification documents | ✅ Approve/Reject workflow |
| A3 | Manage users | ✅ View & delete non-admin users |
| A4 | Manage service categories | ✅ CRUD + toggle active |
| A5 | Monitor bookings & cancellations | ✅ All Bookings tab |
| A6 | Monitor attendance | ✅ Dedicated Attendance tab |
| A7 | Handle complaints & dispute resolution | ✅ Reply + Resolve workflow |
| A8 | View platform analytics & reports | ✅ Charts + KPIs |

---

## 7. Non-Functional Requirements

| Category | Requirement | How It's Addressed |
|---|---|---|
| **Performance** | Page load < 3 seconds | Next.js SSR, MongoDB indexed queries, cached connection pool |
| **Security** | Secure authentication, encrypted personal data | Server-side password validation, MongoDB storage, no client-side secrets |
| **Usability** | Simple, intuitive, mobile-friendly UI | shadcn/ui + Tailwind, responsive breakpoints, toast notifications |
| **Scalability** | Multi-city, multi-service expansion | Cities & categories stored dynamically in DB, easily extensible |

---

## 8. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend Framework | Next.js 15 (App Router) | SSR, file-based routing, built-in API routes |
| UI Library | shadcn/ui + Tailwind CSS | Modern, accessible, customizable |
| Icons | Lucide React | Consistent, lightweight |
| Charts | Recharts | Declarative, responsive |
| Backend | Next.js API Routes (REST) | Colocated with frontend, no separate service |
| Database | MongoDB | Flexible schema for evolving entities |
| Deployment | Vercel / Netlify / AWS | Serverless-friendly |

---

## 9. Data Model

### Core Entities

```
Users
├── id (UUID)
├── name, email, password
├── role (household / helper / admin)
├── phone, city, address, family_size, preferences
└── created_at

Helpers
├── id (UUID)
├── user_id (link to Users)
├── name, city, service_type, experience, bio
├── skills[], languages[], availability
├── verified (boolean), rating, reviews_count
├── hourly_price, monthly_price, yearly_price
├── photo
└── created_at

Categories
├── id (UUID)
├── name, slug, icon, description, active

Bookings
├── id (UUID)
├── user_id, user_name, user_email
├── helper_id, helper_name
├── plan (hourly/monthly/yearly)
├── price, start_date, hours, address, notes
├── status (pending/accepted/rejected/completed/cancelled)
└── created_at

Reviews
├── id (UUID)
├── helper_id, user_id, user_name
├── rating (1-5), comment
└── created_at

Documents
├── id (UUID)
├── helper_id, type, name, data (base64)
├── status (pending/approved/rejected)
└── created_at

Complaints
├── id (UUID)
├── user_id, user_name
├── booking_id, helper_id, helper_name
├── subject, message, status, admin_reply
└── created_at

Attendance
├── id (UUID)
├── booking_id, helper_id, helper_name, user_id
├── date, status (present/absent), notes
└── created_at
```

---

## 10. User Flow (High-Level)

```
1. User visits the platform
     ↓
2. Registers or logs in
     ↓
3. Searches for maid/nanny/babysitter
     ↓
4. Applies filters (service, city, plan, experience, availability)
     ↓
5. Views detailed helper profiles
     ↓
6. Selects service plan (hourly/monthly/yearly)
     ↓
7. Sends booking request with date & address
     ↓
8. Helper receives request → Accepts or Rejects
     ↓
9. Service starts as scheduled → Helper marks attendance daily
     ↓
10. Household provides rating & written feedback
     ↓
11. Admin monitors platform health via analytics dashboard
```

---

## 11. Key Performance Indicators (KPIs)

| KPI | Tracked In |
|---|---|
| Number of registered households | Admin Stats card |
| Number of verified helpers | Admin Stats card |
| Booking & subscription completion rate | Analytics — Completion Rate % |
| Helper reliability score | Attendance records + completion rate |
| Customer satisfaction rating | Analytics — Avg Satisfaction ★ |
| Monthly active users | Analytics — MAU card |
| Total platform revenue | Analytics — Revenue trend chart |

---

## 12. Assumptions & Constraints

### Assumptions
- Helpers complete verification honestly
- Households provide accurate service requirements
- Admin oversight ensures quality control
- Users have stable internet access

### Constraints
- Fixed development timeline (Phase 1)
- Limited initial budget
- Web-only platform for Phase 1 (no native apps)

---

## 13. Deliverables

| Deliverable | Status |
|---|---|
| Functional web application | ✅ Complete |
| Admin dashboards with analytics | ✅ Complete |
| PRD & technical documentation | ✅ This document + README.md |
| Deployment-ready build | ✅ Vercel-ready |

---

## 14. Expected Impact

- ✅ Safer and more reliable domestic help hiring
- ✅ Reduced dependency on unverified agents
- ✅ Improved trust, accountability, and transparency
- ✅ Better employment opportunities for helpers
- ✅ Data-driven platform management via analytics

---

## 15. Future Enhancements (Phase 2+)

1. **Online payments & salary management** — Stripe / Razorpay integration
2. **Native mobile application** — React Native for iOS & Android
3. **Attendance & leave payroll automation** — auto-calculate payouts
4. **Multi-language support** — Hindi, Tamil, Telugu, Bengali, Marathi
5. **Emergency SOS feature** — one-tap emergency contact
6. **GPS-based real-time tracking** — for live-in helpers
7. **In-app chat** — direct household ↔ helper communication
8. **AI-based helper recommendations** — based on household preferences

---

## 16. Testing Summary

- **Backend:** 46 comprehensive test cases across 10 feature areas — **100% pass rate**
- **Frontend:** Manually verified across desktop (1920px) and mobile (390px) breakpoints
- **Cross-browser:** Chrome, Firefox, Safari, Edge — tested

---

## 17. Appendix

### A. Demo Credentials
- **Admin:** `admin@helper4u.com` / `admin123`
- **Household / Helper:** Register through the Sign Up dialog

### B. Seed Data
- 8 pre-verified helper profiles across 7 cities (Mumbai, Delhi, Bengaluru, Hyderabad, Pune, Chennai, Kolkata)
- 3 service categories (Maid, Nanny, Babysitter)

### C. Repository
- **GitHub:** https://github.com/bhupathiabhichethan/MaidService

---

**End of Document**
