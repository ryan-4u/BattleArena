# ⚔️ BattleArena

A full-stack esports tournament management platform where **organisers** can host tournaments and **players** can apply to compete.

Built with **Node.js · Express · MongoDB · EJS · Bootstrap 5**

🌐 **Live Demo:** _coming soon_  
📁 **GitHub:** [ryan-4u/BattleArena](https://github.com/ryan-4u/BattleArena)

---

## 🎮 Features

### For Organisers
- Create tournaments with full details — game, mode, prize pool, rules, dates
- Manage applicants — accept or reject players
- Room ID & password auto-revealed to accepted players
- Edit or delete tournaments

### For Players
- Browse and search tournaments by game, status, title
- Apply to join tournaments with one click
- View room details after getting accepted
- Personal profile with tournament history

### Platform
- Role-based auth (organiser / player) via Passport.js
- Flash messages for all actions
- Cyber Grid dark UI theme
- Fully RESTful routes
- Postman collection included

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | Passport.js + passport-local-mongoose |
| Templating | EJS |
| Styling | Bootstrap 5 + Custom Cyber CSS |
| Email | Nodemailer (Gmail SMTP) |
| Dev | Nodemon |

---

## 📁 Project Structure
```
BattleArena/
├── models/
│   ├── user.js            # User schema (organiser | player)
│   └── tournament.js      # Tournament schema with applicants
├── routes/
│   ├── auth.js            # Register, Login, Logout
│   ├── tournament.js      # Tournament CRUD
│   ├── application.js     # Apply, Accept, Reject
│   └── profile.js         # Player profiles
├── views/
│   ├── partials/          # Navbar, Flash messages
│   ├── auth/              # Register, Login
│   ├── tournaments/       # Index, Show, New, Edit
│   ├── profile/           # Show, Edit
│   └── errors/            # 404
├── public/css/style.css   # Cyber Grid theme
├── middleware.js          # Auth guards
├── app.js                 # Entry point
├── init.js                # Seed data
└── .env                   # Environment variables
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally

### Installation
```bash
# Clone the repo
git clone https://github.com/ryan-4u/BattleArena.git
cd BattleArena

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your values
```

### Environment Variables

Create a `.env` file in root:
```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/battlearena
SESSION_SECRET=your_secret_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Seed the Database
```bash
node init.js
```

This creates:
| Role | Username | Password |
|------|----------|----------|
| Organiser | arena_admin | admin123 |
| Player | pro_sniper | player123 |
| Player | shadow_ace | player123 |
| Player | void_striker | player123 |

### Run the App
```bash
npm run dev       # Development (nodemon)
npm start         # Production
```

Visit `http://localhost:3000`

---

## 🔀 API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/register` | Register form |
| POST | `/register` | Create account |
| GET | `/login` | Login form |
| POST | `/login` | Authenticate |
| GET | `/logout` | Logout |

### Tournaments
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/tournaments` | Public | List all (with search/filter) |
| GET | `/tournaments/new` | Organiser | Create form |
| POST | `/tournaments` | Organiser | Create tournament |
| GET | `/tournaments/:id` | Public | Tournament detail |
| GET | `/tournaments/:id/edit` | Organiser (owner) | Edit form |
| PUT | `/tournaments/:id` | Organiser (owner) | Update |
| DELETE | `/tournaments/:id` | Organiser (owner) | Delete |

### Applications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/tournaments/:id/apply` | Player | Apply to join |
| PATCH | `/tournaments/:id/applicants/:uid/accept` | Organiser | Accept + email player |
| PATCH | `/tournaments/:id/applicants/:uid/reject` | Organiser | Reject |

### Profile
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/profile` | Auth | Own profile |
| GET | `/profile/edit` | Auth | Edit form |
| PUT | `/profile/edit` | Auth | Update profile |
| GET | `/profile/:id` | Auth | View any profile |

---

## 📮 Postman

Import `BattleArena.postman_collection.json` into Postman.

> Enable cookie jar in Postman settings. Hit **Login** first — session cookie is stored automatically for all subsequent requests.

---

## 🚀 Deployment (Render)

1. Push to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect your repo
4. Set environment variables in Render dashboard
5. Build command: `npm install`
6. Start command: `node app.js`
7. Use **MongoDB Atlas** for cloud database

---

## 📌 Upcoming Features

- [ ] Cloudinary banner image uploads
- [ ] Tournament bracket display
- [ ] Email notifications on accept/reject
- [ ] Search by date range
- [ ] Admin dashboard

---

## 👨‍💻 Author

**Aaryan Aggrawa**  
[GitHub](https://github.com/ryan-4u) · [Portfolio](https://aaryan-aggrawa-v1.netlify.app)