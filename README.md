# task-api
An API for a task application.

## Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [npm](https://www.npmjs.com/)

## Quick Start

### Option 1: Local Development (Recommended for Development)

This runs the database in Docker but your app runs locally for fast development.

#### 1. Clone and Install

```bash
# Clone the repository
git clone git@github.com:emersondemetrio/task-api.git
cd task-api

# Install dependencies
npm install
```

#### 2. Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://DB_UsER_NAME:DB_PASSWORD@localhost:5432/mydb?schema=public"
LOG_LEVEL="info"
```

#### 3. Start PostgreSQL

```bash
# Start only the database
docker-compose up -d postgres

# Verify it's running
docker-compose ps
```

#### 4. Setup Database

```bash
# Run migrations
npx prisma migrate dev

# Seed test users and data
npm run seed:users
```

You'll see test API keys printed. Save these for testing!

#### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## Running on Docker


#### 1. Build and Start

```bash
# Build Docker images
npm run docker:build

# Start all services
npm run docker:up

# Watch logs
npm run docker:logs:app # see package.json for other logs
```

#### 2. Seed Database

```bash
# Run seed script inside the container
npm run seed:users
```

The API will be available at `http://localhost:4000`

## Demos

### Create a task (via cURL)
![Creating a task](/demos/1.png)

```bash
curl --location 'http://localhost:4000/tasks' \
--header 'x-user-id: 1' \
--header 'Content-Type: application/json' \
--data '{
	"title": "My 2nd task",
    "description": "A simple task that lives on TODO"
}'
```

### Results

```json
{
    "id": 2,
    "title": "My 2nd task",
    "description": "A simple task that lives on TODO",
    "status": "TODO",
    "createdAt": "2026-01-12T18:08:05.516Z",
    "updatedAt": "2026-01-12T18:08:05.516Z",
    "creatorId": 1,
    "_links": [
        {
            "href": "http://localhost:4000/tasks/2",
            "rel": "self",
            "method": "GET"
        },
        {
            "href": "http://localhost:4000/tasks/2",
            "rel": "update",
            "method": "PUT"
        },
        {
            "href": "http://localhost:4000/tasks/2",
            "rel": "patch",
            "method": "PATCH"
        },
        {
            "href": "http://localhost:4000/tasks/2",
            "rel": "delete",
            "method": "DELETE"
        }
    ]
}
```