
# Tutor CRM

A Customer Relationship Management (CRM) application designed for tutors to manage their students, lessons, and schedules effectively.

## Features

- **Authentication**: Secure login and registration for tutors.
- **Weekly Calendar**: A clear, interactive weekly view of all scheduled lessons.
- **Lesson Management**:
  - **Create**: Easily add new one-time or recurring lessons.
  - **View/Edit**: Click on any lesson to view details, add notes, or make changes.
  - **Delete**: Remove a single lesson instance or an entire recurring series.
- **Lesson Tracking**: Automatically increment lesson numbers after completion.
- **Quick Actions**: 
  - Hover over empty slots to quickly add a new lesson.
  - Quick access to student/parent Telegram contacts.
- **Responsive Design**: Fully functional on desktop and mobile devices.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useContext)
- **Backend (Simulated)**: The current version uses a mock API that persists data to the browser's `localStorage`. This simulates how the frontend would interact with a real backend.
- **Database (Placeholder)**: The `docker-compose.yml` includes a service definition for a PostgreSQL database, which would be used in a full-stack implementation.

## Project Structure

```
.
├── components/         # Reusable React components
│   ├── Calendar.tsx
│   ├── LessonCard.tsx
│   └── LessonModal.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.tsx
├── pages/              # Page components
│   ├── CalendarPage.tsx
│   └── LoginPage.tsx
├── services/           # API interaction logic
│   └── api.ts          # (Currently a mock API using localStorage)
├── utils/              # Utility functions
│   └── dateUtils.ts
├── App.tsx             # Main application component
├── index.html          # Main HTML entry point
├── index.tsx           # React application entry point
├── types.ts            # TypeScript type definitions
├── Dockerfile          # For building the frontend production image
├── docker-compose.yml  # For orchestrating all services
└── README.md           # This file
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Deployment with Docker

This is the recommended way to run the application as it mirrors a production environment.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Build and run the application:**
    ```bash
    docker-compose up --build
    ```
    This command will build the frontend Docker image and start the container.

3.  **Access the application:**
    Open your web browser and navigate to `http://localhost:8080`.

### Local Development (Without Docker)

To run the frontend locally for development, you will need Node.js and a package manager (npm/yarn).

*Note: This project was generated without a `package.json` or build tool like Vite/CRA. To run it, you would need to set up a standard React development environment.*

1.  **Set up a React project:**
    You can use a tool like [Vite](https://vitejs.dev/) to quickly set up a React + TypeScript project.
    ```bash
    npm create vite@latest my-tutor-crm -- --template react-ts
    ```

2.  **Copy the source files:**
    Copy all the `.tsx`, `.ts` files from this project into the `src` directory of your new Vite project. Replace the existing template files.

3.  **Copy `index.html`:**
    Copy the `index.html` from this project into the root of your Vite project, replacing the existing one.

4.  **Install dependencies (if any):**
    This project doesn't have external dependencies besides React, but a real project would.
    ```bash
    cd my-tutor-crm
    npm install
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at the URL provided by Vite (usually `http://localhost:5173`).

## Full-Stack Implementation Notes

This project provides a fully functional frontend with a simulated backend. To make this a production-ready, multi-user application, the following steps are required:

1.  **Build the Backend:**
    - Create a backend application (e.g., using Node.js/Express, Python/Django, etc.).
    - Implement API endpoints for user authentication (register, login) and CRUD operations for lessons.
    - Connect the backend to the PostgreSQL database defined in `docker-compose.yml`.
    - Implement password hashing and JWT (JSON Web Tokens) for security.

2.  **Update the Frontend:**
    - In `services/api.ts`, replace the `localStorage` logic with actual `fetch` or `axios` calls to your new backend API endpoints.

3.  **Configure Docker Compose:**
    - Uncomment and configure the `backend` and `db` services in the `docker-compose.yml` file.
    - Ensure environment variables (like `DATABASE_URL`) are correctly set up.
