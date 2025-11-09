# Concert Booking Application

A full-stack concert booking system where users can book concert seats and admins can manage concerts. Built with NestJS, Next.js, PostgreSQL, and Redis.

## What This Project Does

This is a concert booking application with two main roles:

- **Users** can browse concerts, reserve seats, cancel reservations, and view their booking history
- **Admins** can create concerts, delete concerts, and view all bookings

The app uses JWT authentication to keep user data safe, and it supports role-based access control so users and admins see different features.

## Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js (React framework)
- **Database**: PostgreSQL
- **Cache**: Redis
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose

## Why Monorepo?

We're using a monorepo structure, which means both the frontend and backend live in the same repository under the `apps/` folder.

### Benefits:

1. **Easy to Share Code**: If we need to share types or utilities between frontend and backend, we can do it easily without copying code around.

2. **Single Version Control**: Everything is in one place. When we make changes that affect both frontend and backend, we can commit them together and see the full picture.

3. **Consistent Dependencies**: We can manage all dependencies in one place, so we don't have version conflicts between frontend and backend.

4. **Better for Small Teams**: Since this is a single project, having everything together makes it easier to understand and maintain.

## Why Clean Architecture?

Clean Architecture helps us organize code in a way that makes it easier to understand, test, and change later.

### How We Organized the Code:

Our backend follows Clean Architecture with three main layers:

1. **Core Layer** (Business Logic)
   - Contains entities (User, Concert, Booking)
   - Contains use cases (CreateConcert, ReserveSeat, CancelBooking)
   - This is the heart of our application - the business rules live here
   - It doesn't depend on databases, frameworks, or external services

2. **Infrastructure Layer** (Technical Details)
   - Database repositories (how we save data to PostgreSQL)
   - Cache adapter (how we use Redis)
   - External services
   - This layer implements the interfaces defined in the core layer

3. **Interface Layer** (API Endpoints)
   - Controllers (HTTP endpoints)
   - DTOs (data validation)
   - Guards (authentication and authorization)
   - This is what users interact with

### Benefits:

1. **Independent Business Logic**: Our business rules (like "a user can't book the same concert twice") don't depend on databases or frameworks. If we want to change from PostgreSQL to MongoDB, we only change the infrastructure layer.

2. **Easy to Test**: We can test business logic without connecting to a database. We just create fake repositories and test the use cases.

3. **Clear Responsibilities**: Each layer has a specific job. Entities define what data looks like, use cases define what we can do with that data, and repositories define how we store it.

4. **Flexible**: We can swap out technologies without breaking everything. Want to use a different cache? Just change the cache adapter. The rest of the code doesn't care.

5. **Scalable**: As the project grows, it's easier to add new features because everything has its place. New developers can understand the structure quickly.

## Why PostgreSQL?

PostgreSQL is our main database where we store all the important data like users, concerts, and bookings.

### Benefits:

1. **Reliable**: PostgreSQL is a mature database that's been around for a long time. It's stable and trustworthy for storing important data.

2. **ACID Compliance**: It ensures data consistency. When a user books a seat, we can make sure the booking is saved correctly and the seat count is updated at the same time. If something goes wrong, it rolls back everything.

3. **Relationships**: Our data has relationships (users have bookings, bookings belong to concerts). PostgreSQL handles these relationships well with foreign keys and joins.

4. **Transactions**: When we reserve a seat, we need to update both the booking table and the concert's reserved seat count. PostgreSQL transactions make sure both happen together or not at all.

5. **JSON Support**: While we're not using it much now, PostgreSQL can store JSON data if we need it later.

6. **Free and Open Source**: No licensing costs, and there's a huge community for support.

## Why Redis?

Redis is an in-memory cache that we use to store frequently accessed data temporarily, so we don't have to query the database every time.

### How We Use It:

- When someone requests the list of concerts, we cache it for 5 minutes
- If another user requests concerts within 5 minutes, we return the cached data instead of querying the database
- When a concert is created, updated, or deleted, we clear the cache so users see fresh data

### Benefits:

1. **Faster Response Times**: Reading from memory (Redis) is much faster than reading from disk (PostgreSQL). This makes our API respond quicker.

2. **Less Database Load**: Popular data like concert lists are cached, so we don't hit the database as often. This helps the database perform better.

3. **Better User Experience**: Users see faster page loads because data comes from cache instead of waiting for database queries.

4. **Scalable**: As more users use the app, caching helps us handle more traffic without slowing down.

5. **Simple to Use**: Redis is straightforward - we just save data with a key and get it back later. Perfect for caching.

6. **Flexible**: We can set expiration times (like 5 minutes for concerts), so cached data doesn't get too old.

## Project Structure

```
consert-monorepo/
├── apps/
│   ├── api/                 # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── core/        # Business logic (entities, use cases)
│   │   │   ├── application/ # Application services
│   │   │   ├── infrastructure/ # Database, cache, external services
│   │   │   └── interface/   # HTTP controllers, DTOs, guards
│   │   └── prisma/          # Database schema and migrations
│   │
│   └── web/                 # Frontend (Next.js)
│       └── src/
│           ├── app/         # Pages and routes
│           ├── components/  # React components
│           └── lib/         # API client, stores
│
└── docker-compose.yml       # Docker setup for all services
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- npm 9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd consert-monorepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` (if exists)
   - Update the environment variables as needed

4. **Start the application with Docker**
   ```bash
   docker compose up -d
   ```

   This will start:
   - PostgreSQL database
   - Redis cache
   - Redis Commander (web UI for Redis)
   - API server (NestJS) - automatically runs migrations and seeding
   - Web server (Next.js)

   **Note**: When using Docker, database migrations and seeding run automatically when the API container starts. You don't need to run them manually.

5. **Access the application**
   - Frontend: http://localhost:3000 
   - API: http://localhost:3001/api
   - Redis Commander: http://localhost:8081
   **Note** you can set port in .env file

### Default Credentials

- **Admin**: username: `admin`, password: `admin`
- **User**: username: `user`, password: `user`