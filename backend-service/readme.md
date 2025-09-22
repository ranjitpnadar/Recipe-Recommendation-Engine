# Recipe Book API

This is a Node.js Express API for managing recipes, user authentication, and integrating with an external Large Language Model (LLM) service for recipe recommendations and intelligent recipe creation. It uses Prisma as an ORM for PostgreSQL.

## Table of Contentss

- [Recipe Book API](#recipe-book-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)s
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Local Development (without Docker)](#local-development-without-docker)
    - [Dockerized Development (Recommended)](#dockerized-development-recommended)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Users](#users)
    - [Recipes](#recipes)
  - [Database Schema](#database-schema)
  - [LLM Integration](#llm-integration)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)

## Features

*   **User Authentication**: Register and log in users with JWT-based authentication.
*   **User Management**: View, update, and delete user profiles.
*   **Recipe Management**:
    *   Create, retrieve, update, and delete recipes.
    *   Recipes can be public or private.
    *   Filter and search recipes.
*   **LLM Integration**:
    *   **Intelligent Recipe Creation**: When a new recipe is created, its details are sent to an external LLM service for processing (e.g., to extract ingredients, categorize, etc.).
    *   **Recipe Recommendation**: Users can search for recipes using natural language queries (e.g., "recipes with chicken and broccoli, low carb") which are processed by an LLM to provide relevant recommendations.
    *   **Recommendation Tracking**: Track user clicks on LLM-generated recommendations.
*   **PostgreSQL Database**: Robust data storage using Prisma ORM.

## Technologies Used

*   **Node.js**: JavaScript runtime.
*   **Express.js**: Web application framework.
*   **Prisma**: Next-generation ORM for Node.js and TypeScript.
*   **PostgreSQL**: Relational database.
*   **bcryptjs**: For password hashing.
*   **jsonwebtoken**: For JWT-based authentication.
*   **axios**: For making HTTP requests to the external LLM service.
*   **dotenv**: For managing environment variables.
*   **Docker & Docker Compose**: For containerization and orchestrating services.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (v18 or higher)
*   **npm** (comes with Node.js)
*   **PostgreSQL** (if running locally without Docker)
*   **Docker & Docker Compose** (for dockerized development)
*   **An external LLM service**: This API expects an external service to be running at the `RECIPE_HOST` URL defined in your `.env` file. Ensure this service is accessible.

### Local Development (without Docker)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd recipe-book-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up PostgreSQL:**
    *   Ensure you have a PostgreSQL server running.
    *   Create a new database (e.g., `recipe_book`).
    *   Create a user with appropriate permissions for this database.

4.  **Create a `.env` file:**
    Create a file named `.env` in the root directory and populate it with your environment variables.
    ```dotenv
    # .env
    PORT=3000

    DB_HOST=localhost # Or your PostgreSQL host
    DB_USER=postgres # Your PostgreSQL username
    DB_PASSWORD=password # Your PostgreSQL password
    DB_NAME=recipe_book # Your PostgreSQL database name
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?schema=public"

    RECIPE_HOST="http://127.0.0.1:8000/" # URL of your external LLM service
    JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
    ```
    **Important**: Replace placeholder values with your actual database credentials and a strong `JWT_SECRET`.

5.  **Run Prisma Migrations:**
    This will apply your database schema.
    ```bash
    npx prisma migrate dev --name init
    ```

6.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

7.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The API will be running on `http://localhost:3000`.

### Dockerized Development (Recommended)

This method uses Docker Compose to set up both your PostgreSQL database and the Node.js application in isolated containers, simplifying setup and ensuring consistency.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd recipe-book-api
    ```

2.  **Create a `.env` file:**
    Create a file named `.env` in the root directory and populate it with your environment variables.
    ```dotenv
    # .env
    PORT=3000

    DB_HOST=db # This refers to the 'db' service within the Docker network
    DB_USER=postgres
    DB_PASSWORD=password
    DB_NAME=recipe_book
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}?schema=public"

    RECIPE_HOST="http://127.0.0.1:8000/" # URL of your external LLM service (adjust if LLM is also containerized)
    JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
    ```
    **Important**: Replace placeholder values with your actual database credentials and a strong `JWT_SECRET`. The `DB_HOST` should be `db` as defined in `docker-compose.yml`.

3.  **Build and run the services:**
    ```bash
    docker-compose up --build -d
    ```
    *   `--build`: Rebuilds the Docker images (useful when you change code or `Dockerfile`).
    *   `-d`: Runs the containers in detached mode (in the background).
    *   This command will:
        *   Start a PostgreSQL container (`db`).
        *   Build your Node.js application image (`app`).
        *   Start the `app` container.
        *   Automatically run `npx prisma migrate deploy` to apply migrations.
        *   Start your Node.js application.

4.  **Verify services are running:**
    ```bash
    docker-compose ps
    ```

5.  **Access the application:**
    Your API should now be running at `http://localhost:3000` (or whatever `PORT` you set in `.env`).

6.  **View logs (optional):**
    To see the logs for your application:
    ```bash
    docker-compose logs -f app
    ```
    To see logs for the database:
    ```bash
    docker-compose logs -f db
    ```

7.  **Stopping the services:**
    To stop and remove the containers, networks, and volumes:
    ```bash
    docker-compose down -v
    ```
    *   `-v`: Removes named volumes (like `postgres_data`), which means your database data will be lost. Omit `-v` if you want to preserve the database data for future `docker-compose up` commands.

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

*   `POST /api/auth/register`
    *   **Body**: `{ "username": "...", "email": "...", "password_hash": "...", "first_name": "...", "last_name": "..." }`
    *   **Response**: `{ "status": "success", "message": "User registered successfully.", "user": { ... } }`
*   `POST /api/auth/login`
    *   **Body**: `{ "email": "...", "password": "..." }`
    *   **Response**: `{ "status": "success", "message": "Logged in successfully.", "token": "...", "user": { ... } }`

### Users

*   `GET /api/users/profile` (Protected)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "status": "success", "message": "Profile detail retrieved successfully.", "user": { ... } }`
*   `PUT /api/users/profile` (Protected)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Body**: `{ "username": "...", "email": "...", "first_name": "...", "last_name": "...", "profile_picture_url": "...", "is_active": true }` (fields are optional)
    *   **Response**: `{ "status": "success", "message": "Profile updated successfully.", "user": { ... } }`
*   `DELETE /api/users/profile` (Protected)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "status": "success", "message": "User deleted successfully." }`

### Recipes

*   `POST /api/recipes` (Protected)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Body**: `{ "title": "...", "description": "...", "instructions": "...", "prep_time_minutes": 30, "cook_time_minutes": 60, "servings": 4, "image_url": "...", "cuisine_type": "Italian", "difficulty_level": "Medium", "is_public": true }`
    *   **Response**: `{ "status": "success", "message": "Resource created successfully.", "data": { ... } }`
*   `GET /api/recipes` (Public - can filter)
    *   **Query Params**: `limit`, `offset`, `userId`, `isPublic` (boolean), `search` (by title)
    *   **Response**: `{ "status": "success", "message": "User recipes detail retrieved successfully", "data": [ { ... }, ... ] }`
*   `GET /api/recipes/:id` (Public)
    *   **Response**: `{ "status": "success", "message": "User recipe detail retrieved successfully", "data": { ... } }`
*   `PUT /api/recipes/:id` (Protected - user must own the recipe)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Body**: `{ "title": "...", "description": "...", "instructions": "...", ... }` (fields are optional)
    *   **Response**: `{ "status": "success", "message": "Recipe updated successfully.", "data": { ... } }`
*   `DELETE /api/recipes/:id` (Protected - user must own the recipe)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "status": "success", "message": "Recipe deleted successfully." }`
*   `POST /api/recipes/search-llm` (Protected)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Body**: `{ "query": "Show me some quick pasta recipes with tomatoes and basil." }`
    *   **Response**: `{ "status": "success", "message": "Recipe recommendation based on user-entered ingredients", "data": { ... } }` (Structure depends on LLM service response)
*   `POST /api/recipes/recommendations/:recommendationId/click` (Protected)
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "status": "success", "message": "Recommendation click tracked successfully." }`

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:

*   **`User`**: Stores user authentication and profile information.
*   **`UserRole`**: Defines user roles (e.g., Admin, User).
*   **`UserUserRole`**: Junction table for many-to-many relationship between Users and Roles.
*   **`Recipe`**: Stores recipe details, linked to a `User`.
*   **`SearchHistory`**: Logs user search queries and LLM parsing results.
*   **`SearchRecommendation`**: Stores specific recipe recommendations generated by the LLM for a search query, including click tracking.

## LLM Integration

This API integrates with an external LLM service via HTTP requests.

*   **`RECIPE_HOST`**: This environment variable specifies the base URL of your LLM service.
*   **`RecipeService.createRecipeWithLLM`**: Sends new recipe details to the LLM service's `/add_recipe_info` endpoint.
*   **`RecipeService.searchRecipesWithLLM`**: Sends user search queries to the LLM service's `/recommend_recipe` endpoint.

**Note**: You need to have an LLM service running and accessible at the configured `RECIPE_HOST` for these features to work.

## Project Structure

```
.
├── config/
│   └── prismaClient.js       # Prisma client initialization
├── controllers/
│   ├── authController.js     # Handles authentication logic
│   ├── recipeController.js   # Handles recipe-related logic
│   └── userController.js     # Handles user-related logic
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── prisma/
│   ├── migrations/           # Database migration files
│   └── schema.prisma         # Prisma database schema definition
├── routes/
│   ├── authRoutes.js         # Authentication API routes
│   ├── recipeRoutes.js       # Recipe API routes
│   └── userRoutes.js         # User API routes
├── services/
│   ├── authService.js        # Business logic for authentication
│   ├── recipeService.js      # Business logic for recipes and LLM interaction
│   └── userService.js        # Business logic for user management
├── utils/
│   └── errorHandler.js       # Centralized error handling utility
├── .env.example              # Example environment variables
├── .dockerignore             # Files/folders to ignore when building Docker image
├── app.js                    # Main Express application file
├── Dockerfile                # Docker build instructions
├── docker-compose.yml        # Docker Compose configuration for services
├── package.json              # Project dependencies and scripts
└── README.md                 # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the ISC License.