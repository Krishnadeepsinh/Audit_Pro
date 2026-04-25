<div align="center">
  <div style="padding: 20px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 16px; margin-bottom: 16px;">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  </div>
  
  <h1 style="font-family: inherit;">AuditDesk Pro</h1>
  <p><strong>A Premium Serverless Work Management System for Chartered Accountants</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-API-lightgrey?style=for-the-badge&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/Turso-libSQL-blue?style=for-the-badge&logo=sqlite" alt="Turso DB" />
    <img src="https://img.shields.io/badge/Vercel-Serverless-black?style=for-the-badge&logo=vercel" alt="Vercel" />
    <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status" />
  </p>
</div>

<br>

## 💎 Overview
**AuditDesk Pro** is an ultra-fast, premium-grade dashboard engineered explicitly for Chartered Accountants to monitor internal workflows. It effectively manages complex audit task assignments, article clerk schedules, and client directories without the overhead of heavy frameworks. Built exclusively with vanilla front-end performance, secure Express APIs, and Turso serverless SQL databases.

## ✨ Key Features
- **Centralized Dashboard Operations**: Live counts of pending tasks, working assignments, and completed tasks globally.
- **Glassmorphic Native UI**: Buttery-smooth, lightweight dark/light theme engine built cleanly with modern CSS.
- **Real-Time Client & Article Management**: Maintain exact records and track performance for every single assignment across clients.
- **Instant Search & Real-Time Filtering**: Zero-latency searching across firm clients, staff, and statuses instantaneously.
- **Single-User Security Wall**: Airtight JSON Web Token (JWT) + HttpOnly cookie authentication to absolutely lock down firm privacy from external threats.
- **Vercel Serverless Ready**: Conforms identically to modern distributed edge execution models.

## 📸 Interface Preview
*(Upload a screenshot to your repository and link it here to showcase the beautiful interface)*
<!-- <img src="your-screenshot-url.png" alt="Dashboard Preview" width="100%"> -->

## 🛠 Technology Stack
| Layer | Technology Used | Description |
| --- | --- | --- |
| **Frontend** | Vanilla JS / CSS3 / HTML5 | Lightning fast, dependency-free premium interface |
| **Backend** | Node.js & Express.js | Secure routing & token management API |
| **Database** | LibSQL via Turso | Ultra-low latency edge serverless Database |
| **Icons** | Lucide Icons | Premium open-source icon kit |
| **Security** | `jsonwebtoken` & `cookie-parser`| Bulletproof API protection |

## 🚀 Quick Setup Guide

Run AuditDesk Pro directly on your machine in 3 simple steps:

### 1. Clone & Install
```bash
git clone https://github.com/Krishnadeepsinh/Audit_Pro.git
cd Audit_Pro
npm install 
```

### 2. Configure Environment
The system is heavily gated. Create a `.env` file at the exact root of your project:
```env
# Database Core
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-turso-token-here"

# Security Enclaves
APP_PASSWORD="admin_firm_password"
JWT_SECRET="your_highly_secure_random_string"
```

### 3. Deploy Local Server
```bash
node server/index.js
```
The Turso cloud connection will automatically initialize missing system tables on boot. Open your browser to the heavily protected dashboard at `http://localhost:3000`.

## ☁️ Deploying to Vercel
AuditDesk Pro comes natively integrated with a standard `vercel.json` and a serverlessly adaptable Express core. 

1. Push your populated repository to GitHub.
2. Link the repository directly into your [Vercel Dashboard](https://vercel.com/new).
3. Transfer all 4 variables from your `.env` directly into the Vercel **Environment Variables** settings interface.
4. Hit Deploy! 

## 🛡️ Security Architecture
By architecture design, AuditDesk utilizes a **Single-Actor Sentinel Pattern**. External registration is physically impossible as database tables for users do not exist. Access into the system relies strictly on exact validation against the `.env` internal application password. The token issuance bounds all interaction behind HTTP-Only secure flags, rendering script-based theft virtually impossible.

---
**Created by**: [*Krishnadeepsinh*](https://github.com/Krishnadeepsinh)
