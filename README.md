# TrackFlow – Real-Time Logistics and Delivery Tracking System

TrackFlow is a production-quality full stack web application for real-time logistics and delivery tracking.

## Features
- **Customers:** Register, create delivery orders, track deliveries in real-time.
- **Delivery Agents:** View assigned deliveries, update status, and share live location continuously.
- **Admins:** Manage users, monitor deliveries, assign agents, and view analytics.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Leaflet.js
- **Backend:** Node.js, Express.js, Socket.io, JWT
- **Database:** MongoDB Atlas (Mongoose)
- **DevOps:** Docker, Nginx, Jenkins, GitHub Actions

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose

### Local Development
1. Clone the repository.
2. In the `backend` directory, create a `.env` file based on `.env.example` (or use the existing `.env`).
3. To run locally without Docker:
   - Terminal 1: `cd backend && npm install && npm run dev`
   - Terminal 2: `cd frontend && npm install && npm run dev`

### Docker Deployment
Run the following command from the root directory:
```bash
docker-compose up --build
```
The application will be accessible at `http://localhost`.

## CI/CD
- **GitHub Actions:** Automatically builds and tests the code on pushes and pull requests to `main`.
- **Jenkins:** A `Jenkinsfile` is provided for a complete CI/CD pipeline including Docker image building and deployment to Docker Hub.
