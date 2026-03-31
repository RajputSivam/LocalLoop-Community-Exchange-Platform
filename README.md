# 🏘️ LocalLoop — Community Exchange Platform v2.0

A full-stack MERN platform for borrowing items, offering services, and building community trust — secured by deposits, AI dispute resolution, and a trust score system.

> **GitHub:** github.com/RajputSivam/LocalLoop-Community-Exchange-Platform

---

## ✨ What's New in v2.0

| Feature | Status |
|---------|--------|
| 💰 Wallet & Security Deposits | ✅ |
| 📋 Borrow Request Lifecycle | ✅ |
| 🔒 Deposit Lock / Release | ✅ |
| 📸 Return Proof with Photos | ✅ |
| ⚖️ Dispute Resolution System | ✅ |
| 🛡️ Trust Score System (0–100) | ✅ |
| 🏅 XP Points & Badges | ✅ |
| 🔔 Notifications | ✅ |
| 👥 Role-Based Access | ✅ |
| 💬 Real-time Messaging | ✅ |

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Stripe

**Frontend:** React 18, React Router v6, Axios, React Toastify, Stripe.js

---

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL=http://localhost:5000
npm start              # runs on http://localhost:3000
```

---

## ⚙️ Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/localloop
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
NODE_ENV=development
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 📋 Borrow Lifecycle

```
Request → Accept (deposit locked) → Activate → Active
→ Return Proof Uploaded → Owner Confirms → Deposit Released ✅
```

If issue: File Dispute → AI Assessment → Admin Resolves → Penalty applied

---

## 🛡️ Trust Levels

| Level | Score | Perks |
|-------|-------|-------|
| New | 0–34 | Basic access |
| Bronze | 35–54 | Standard borrowing |
| Silver | 55–74 | Reduced deposits |
| Gold | 75–89 | Priority access |
| Platinum | 90–100 | Maximum trust |

---

## 👤 Author

**Sivam Rajput** — [@RajputSivam](https://github.com/RajputSivam)

*Built with ❤️ for the community*
