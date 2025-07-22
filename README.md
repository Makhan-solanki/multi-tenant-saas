# 🧾 Multi-Tenant Support Ticket System

A scalable, secure, and modular support ticket management system built with a micro-frontend architecture, multi-tenant isolation, role-based access, and webhook-driven automation.

---

## 🚀 Project Overview

This project was developed as part of an internship challenge. It supports:
- Multiple tenants with complete **data isolation**
- **Role-based access** (Admin, Agent, User)
- **Microfrontend-based** module loading
- **Audit logging**, **user management**, **commenting**, and **ticket assignment**
- **Webhook notifications** via [n8n](https://n8n.io)

 - **Videolink:** https://shorturl.at/qIXpC
---

## 🧱 Architecture

```
[React Shell App] <----> [Support Ticket MFE]
         |                         |
         |                         |
   [Auth Service]           [API Service]
         |                         |
         └───── MongoDB + n8n (for workflows)
```

---

## 📦 Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Frontend     | React + Tailwind + Vite       |
| Backend      | Node.js + Express             |
| DB           | MongoDB                       |
| Auth         | JWT + Custom Middleware       |
| MFE          | `vite-plugin-federation`      |
| Workflow     | n8n + Webhooks                |
| Docker       | Docker + Docker Compose       |
| Testing      | Vitest (unit), Playwright (e2e) |

---

## 🔐 Roles & Permissions

| Role   | Capabilities                                                |
|--------|-------------------------------------------------------------|
| User   | View/create/update **own** tickets, add comments            |
| Agent  | View tickets, add comments, change ticket status            |
| Admin  | Manage all tickets, assign tickets, manage users/audit logs |

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-org/support-ticket-system
cd support-ticket-system
```
### . Demo Videolink
```bash
https://shorturl.at/qIXpC
```
### 2. Set Environment Variables

Create `.env` files in:
- `auth-service`
- `api-service`
- `react-shell`
- `support-tickets-app`

Example:
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/support-system
JWT_SECRET=supersecret
```

### 3. Start Using Docker Compose

```bash
docker-compose up --build
```

This will start:

| App                 | Port  |
|---------------------|--------|
| React Shell         | 4173   |
| Auth Service        | 3001   |
| API Service         | 3002   |
| Support Ticket App  | 4174   |
| MongoDB             | 27017  |
| n8n (workflow tool) | 5678   |

---

## 🔐 Demo Login Credentials

| Role   | Email                      | Password    |
|--------|----------------------------|-------------|
| Admin  | admin@tenant123.com        | password123 |
| Agent  | agent@logisticsco.com      | password123 |
| User   | user@retailgmbh.com        | password123 |



---

## 🧪 Testing

### Unit Tests

```bash
cd auth-service
npm run test
```

### E2E Tests (Playwright)

```bash
npx playwright test
```

---

## 📡 Webhooks via n8n

Webhook Events:
- `ticket.created`
- `ticket.updated`
- `comment.added`

### How to configure:
1. Go to **Audit Logs → Webhook Settings**
2. Add webhook URL (e.g., `http://localhost:5678/webhook/...`)
3. Choose events → Save

---

## 📊 Features Implemented

- ✅ Multi-Tenant JWT Auth
- ✅ Role-based Access Control (RBAC)
- ✅ MFE + Lazy Loading
- ✅ CRUD for Tickets
- ✅ Ticket Assignment (Admin)
- ✅ Commenting System
- ✅ Audit Logs (Admin)
- ✅ Webhook Integration (n8n)
- ✅ Dockerized for full stack

---

## 📌 Future Enhancements

- Email/SMS notifications
- File attachments in tickets
- Pagination for ticket lists
- Search by tags and metadata
- SLA-based alerts and timers

---

## 👨‍💻 Developer

- **Submitted by**: Makhan Solanki
- **Date**: July 18, 2025
- **Challenge**: Internship Submission
- **Video-link**: https://shorturl.at/qIXpC