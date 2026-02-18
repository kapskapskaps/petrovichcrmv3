
# Tutor CRM

A Customer Relationship Management (CRM) application designed for tutors to manage their students, lessons, and schedules effectively. This is a full-stack application with a React frontend, a Node.js/Express backend, and a PostgreSQL database.

## Features

- **Authentication**: Secure login and registration for tutors, powered by a JWT-based backend.
- **Weekly Calendar**: A clear, interactive weekly view of all scheduled lessons fetched from the database.
- **Lesson Management**:
  - **Create**: Easily add new one-time or recurring lessons.
  - **View/Edit**: Click on any lesson to view details, add notes, or make changes.
  - **Delete**: Remove a single lesson instance or an entire recurring series.
- **Persistent Data**: All data is stored in a PostgreSQL database, making it a true multi-user ready application.
- **Quick Actions**: 
  - Hover over empty slots to quickly add a new lesson.
  - Quick access to student/parent Telegram contacts.
- **Responsive Design**: Fully functional on desktop and mobile devices.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker & Docker Compose

## Project Structure

```
.
├── backend/            # Backend Node.js/Express application
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── components/         # Frontend React components
├── hooks/
├── pages/
├── services/           # Frontend API interaction logic
│   └── api.ts
├── App.tsx
├── index.html
├── Dockerfile          # Frontend Dockerfile (for Nginx)
├── docker-compose.yml  # Orchestrates all services
├── nginx.conf          # Nginx configuration
└── README.md           # This file
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Deployment with Docker

This is the recommended way to run the application as it orchestrates the frontend, backend, and database together.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Build and run the application:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the frontend Docker image (with Nginx).
    - Build the backend Docker image.
    - Pull the PostgreSQL image.
    - Start all three containers and connect them.

3.  **Access the application:**
    Open your web browser and navigate to `http://localhost:8080`.

The first time you run the backend, Prisma will automatically apply the necessary database migrations to set up the tables.

### Stopping the application
To stop all services, press `Ctrl+C` in the terminal where `docker-compose` is running, and then run:
```bash
docker-compose down
```
This will stop and remove the containers. To remove the database volume as well (deleting all data), run `docker-compose down -v`.
