# 🌀 PuzzlePulse: Tactical Stealth Infiltration

**PuzzlePulse** is a high-stakes, 2D stealth game designed to demonstrate distributed service architecture, cloud persistence, and virtual identity. Navigate high-security sectors, decode tactical puzzles, and evade elite guard AI to maximize your neural sync score.

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=PuzzlePulse+Tactical+Hub)

## 🛠️ Tactical Stack

- **Frontend**: React (Vite) + Vanilla CSS (Glassmorphism/Neon Aesthetics)
- **Backend**: Express (Node.js) + Mongoose
- **Database**: MongoDB Atlas (Cloud Cluster)
- **Persistence**: Real-time cloud sync with local high-availability fallback.

## 🚀 Deployment Protocol

### 1. HQ Initialization (Backend)
```bash
cd backend
npm install
# Create .env with MONGODB_URI
npm run start
```

### 2. Operative Hub (Frontend)
```bash
cd frontend
npm install
npm run dev
```

### 3. Tactical Cloud Deployment (Vercel)
The project is pre-configured for Vercel. 
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Configure Environment Variables in Vercel Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
4. Deploy.

## 🧠 System Architecture

- **Low Coupling**: Independent microservices for game logic and operative management.
- **Event-Driven AI**: Guard patrolling and detection logic managed via tactical canvas loops.
- **Cloud-First Persistence**: Operative profiles and mission progress synchronized globally via MongoDB.

## 🎮 Operative Roles

- **Ghost**: Senior stealth specialist.
- **Shadow**: Infiltration expert.
- **Pulse**: Neural sync specialist.

---
*Clearance Level: Alpha. Confidentiality Required.*
