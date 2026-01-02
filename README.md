# CarPool - Ride Sharing Platform

A full-stack ride sharing web application built for university students to share rides safely, economically, and conveniently.

## Features

### Authentication & Security
- User registration with role selection (Driver/Passenger)
- Secure login with JWT authentication
- Password recovery via Security Questions (no email required)
- Protected routes based on user roles

### Real-Time Communication
- **Live Chat:** Socket.io powered messaging between drivers and passengers
- **Instant Notifications:** Real-time alerts for booking requests, status updates, and new messages
- **Online Status:** See when users are online

### Ride Management
- Create, edit, and delete ride listings (Drivers)
- Search and filter rides by route, date, and available seats
- Sort rides by date (closest first)
- Interactive map integration for route visualization

### Booking System
- Passengers can request bookings on available rides
- Drivers can approve or reject booking requests
- Real-time booking status updates
- View all bookings in dedicated dashboards

### User Experience
- Responsive design optimized for mobile and desktop
- Modern, clean UI with Tailwind CSS
- Profile management with custom avatars
- Rating system for drivers and passengers

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Cloud) |
| **Real-Time** | Socket.io |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **Maps** | React-Leaflet, OpenStreetMap |

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/carpool.git
cd carpool
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 3. Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/carpool
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

### 4. Run the Application

**Start the Backend Server:**
```bash
cd server
npm run dev
```

**Start the Frontend (in a new terminal):**
```bash
cd client
npm run dev
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |

## Project Structure

```
carpool/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Socket)
│   │   ├── pages/          # Page components
│   │   └── services/       # API service functions
│   └── ...
├── server/                 # Node.js Backend
│   ├── controllers/        # Route handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── socket/             # Socket.io configuration
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/get-security-question` | Get security question by email |
| POST | `/api/auth/reset-password-security` | Reset password with security answer |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rides` | Get all rides |
| POST | `/api/rides` | Create new ride |
| GET | `/api/rides/:id` | Get ride by ID |
| PUT | `/api/rides/:id` | Update ride |
| DELETE | `/api/rides/:id` | Delete ride |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking request |
| GET | `/api/bookings/my` | Get user's bookings |
| PUT | `/api/bookings/:id/status` | Update booking status |

## Team Members

- Zeynel Zeren
- Melisa Demirbas
- Esra Ece Gunguney

## License

This project was developed as a final project for Web Programming (SE 3355) course.
