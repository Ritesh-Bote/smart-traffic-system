# 🚦 Smart Traffic Violation Management System

A full-stack MERN application for managing traffic violations digitally.

---

## 📁 Project Structure

```
smart-traffic-system/
├── backend/                    ← Node.js + Express API
│   ├── config/
│   │   └── seed.js             ← Database seeder (sample data)
│   ├── controllers/
│   │   ├── authController.js   ← Login, register logic
│   │   ├── violationController.js ← CRUD for violations
│   │   ├── citizenController.js   ← Public vehicle lookup
│   │   └── statsController.js     ← Dashboard statistics
│   ├── middleware/
│   │   └── authMiddleware.js   ← JWT verification
│   ├── models/
│   │   ├── User.js             ← Admin/Police schema
│   │   └── Violation.js        ← Violation record schema
│   ├── routes/
│   │   ├── authRoutes.js       ← /api/auth/*
│   │   ├── violationRoutes.js  ← /api/violations/*
│   │   ├── citizenRoutes.js    ← /api/citizen/*
│   │   └── statsRoutes.js      ← /api/stats/*
│   ├── .env.example
│   ├── package.json
│   └── server.js               ← Main entry point
│
└── frontend/                   ← React application
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Auth/
        │   │   ├── Login.js          ← Login page
        │   │   └── ProtectedRoute.js ← Route guard
        │   ├── Dashboard/
        │   │   └── Dashboard.js      ← Stats overview
        │   ├── Violations/
        │   │   ├── ViolationList.js  ← View/search all
        │   │   ├── ViolationForm.js  ← Reusable form
        │   │   ├── AddViolation.js   ← Add new
        │   │   └── EditViolation.js  ← Edit existing
        │   ├── Citizen/
        │   │   └── CitizenPortal.js  ← Public lookup
        │   └── Layout/
        │       └── Layout.js         ← Sidebar + topbar
        ├── context/
        │   └── AuthContext.js        ← Auth state management
        ├── utils/
        │   └── api.js               ← Axios configuration
        ├── styles/
        │   └── global.css           ← All CSS styles
        ├── App.js                   ← Routes setup
        └── index.js                 ← Entry point
```

---

## ⚙️ Prerequisites

Before you start, make sure you have these installed:

1. **Node.js** (v16 or higher) → https://nodejs.org
2. **MongoDB** (local) → https://www.mongodb.com/try/download/community
   - OR use **MongoDB Atlas** (cloud, free) → https://cloud.mongodb.com
3. **npm** (comes with Node.js)
4. **Git** (optional)

Check versions:
```bash
node --version    # Should show v16+
npm --version     # Should show 8+
```

---

## 🚀 Setup Instructions (Step by Step)

### Step 1: Clone / Download the project

```bash
# If you have the folder already, navigate to it:
cd smart-traffic-system
```

---

### Step 2: Setup the Backend

```bash
# Go into the backend folder
cd backend

# Install all dependencies
npm install

# Create the environment variables file
cp .env.example .env
```

Now open the `.env` file and configure it:

```env
# If using LOCAL MongoDB:
MONGODB_URI=mongodb://localhost:27017/smart_traffic_db

# If using MongoDB Atlas (cloud), replace with your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart_traffic_db

# Change this to a random secret string for production
JWT_SECRET=my_super_secret_key_change_this_123

PORT=5000
NODE_ENV=development
```

**If using MongoDB Atlas:**
1. Go to https://cloud.mongodb.com and create a free account
2. Create a new cluster (free tier M0 is fine)
3. Click "Connect" → "Connect your application"
4. Copy the connection string and paste it as MONGODB_URI
5. Replace `<password>` with your actual password

---

### Step 3: Seed the Database (Add Sample Data)

```bash
# Make sure you're in the backend folder
npm run seed
```

This will create:
- ✅ Admin account: **admin@traffic.gov** / **admin123**
- ✅ Police officer: **officer@traffic.gov** / **officer123**
- ✅ 10 sample violation records

---

### Step 4: Start the Backend Server

```bash
# Development mode (auto-restarts on code changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

Test the API is working:
```
Open browser → http://localhost:5000
You should see: { "message": "Smart Traffic Violation Management System API", "status": "Running" }
```

---

### Step 5: Setup the Frontend

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend folder
cd ../frontend

# Install React dependencies
npm install
```

---

### Step 6: Start the Frontend

```bash
npm start
```

The React app will open automatically at: **http://localhost:3000**

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@traffic.gov | admin123 |
| Police Officer | officer@traffic.gov | officer123 |

> **Difference:** Admin can delete violations. Police officers can add, view, and edit.

---

## 🌐 Application URLs

| URL | Page | Access |
|-----|------|--------|
| http://localhost:3000 | Citizen Portal | Public |
| http://localhost:3000/login | Police Login | Public |
| http://localhost:3000/dashboard | Dashboard | Protected |
| http://localhost:3000/violations | All Violations | Protected |
| http://localhost:3000/violations/add | Add Violation | Protected |

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/profile | Get my profile | Yes |

### Violations (CRUD)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/violations | Get all (with filters) | Yes |
| POST | /api/violations | Create new violation | Yes |
| GET | /api/violations/:id | Get single violation | Yes |
| PUT | /api/violations/:id | Update violation | Yes |
| DELETE | /api/violations/:id | Delete violation | Admin only |
| GET | /api/violations/search/:vehicleNumber | Search by vehicle | Yes |

### Citizen (Public)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/citizen/check/:vehicleNumber | Check violations | No |

### Statistics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/stats/dashboard | Get dashboard stats | Yes |

---

## 🧪 Test Vehicle Numbers (from seed data)

- **MH12AB1234** - Has 2 violations (Paid + Paid)
- **DL5SAB1234** - Over Speeding (Pending)
- **KA03MN4567** - No Helmet (Pending)
- **TN09CD7890** - Drunk Driving (Disputed)

---

## 🔐 How JWT Authentication Works

```
1. Police officer enters email + password on Login page
2. Frontend sends POST request to /api/auth/login
3. Backend verifies credentials, creates a JWT token (7 day expiry)
4. Frontend stores token in localStorage
5. Every subsequent API request includes: "Authorization: Bearer <token>"
6. Backend middleware (authMiddleware.js) verifies token before processing request
7. If token is invalid/expired → 401 error → redirect to login
```

---

## 🗄️ MongoDB Schema Overview

### User Schema
```
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: 'admin' | 'police' (default: 'police'),
  badgeNumber: String,
  isActive: Boolean (default: true)
}
```

### Violation Schema
```
{
  vehicleNumber: String (uppercase, required),
  violationType: String (enum, required),
  date: Date (required),
  time: String HH:MM (required),
  location: String (required),
  fineAmount: Number (required),
  status: 'Pending' | 'Paid' | 'Disputed' | 'Cancelled',
  driverName: String,
  licenseNumber: String,
  notes: String,
  recordedBy: ObjectId (ref: User),
  officerName: String
}
```

---

## 🛠️ Common Issues & Solutions

**❌ "MongoDB connection failed"**
- Make sure MongoDB is running: `sudo service mongod start` (Linux) or check MongoDB Compass
- Or use MongoDB Atlas cloud connection string

**❌ "npm install" fails**
- Try: `npm install --legacy-peer-deps`
- Or update Node.js to v18+

**❌ Frontend shows "Network Error"**
- Make sure backend is running on port 5000
- Check the proxy setting in frontend/package.json: `"proxy": "http://localhost:5000"`

**❌ Login not working after seeding**
- Run `npm run seed` again in the backend folder
- Make sure .env JWT_SECRET is set

---

## 📦 Technologies Used

| Technology | Purpose |
|-----------|---------|
| React.js 18 | Frontend UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests to backend |
| React Toastify | Toast notifications |
| React Icons | Icon library |
| Node.js | JavaScript runtime |
| Express.js | Web framework for API |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| express-validator | Input validation |

---

## 🚀 Deployment (Production)

### Backend (Railway / Render / Heroku)
1. Push code to GitHub
2. Connect your repo to Railway/Render
3. Add environment variables (MONGODB_URI, JWT_SECRET, PORT)
4. Deploy!

### Frontend (Vercel / Netlify)
1. Set REACT_APP_API_URL to your deployed backend URL
2. Push to GitHub and connect to Vercel
3. Deploy!

---

## 📝 Notes for Beginners

**What is a REST API?**
A way for frontend and backend to communicate. The frontend "requests" data, the backend "responds" with data.

**What is JWT?**
JSON Web Token - a secure way to verify that a user is logged in without storing sessions on the server.

**What is Middleware?**
Code that runs between receiving a request and sending a response. Our `authMiddleware.js` checks if the user is logged in before allowing access to protected routes.

**What is a MongoDB Schema?**
It defines the "shape" or structure of documents stored in MongoDB - like a template for your data.
