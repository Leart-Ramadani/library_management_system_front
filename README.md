# Library Management System

A full-stack Library Management System built with **Laminas MVC, Doctrine ORM, PostgreSQL, and React**. The application provides book inventory management, user management, borrowing and returning workflows, and automatic overdue penalty management.

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Features](#features)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Database Design](#database-design)
- [Authentication and Authorization](#authentication-and-authorization)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Default Accounts](#default-accounts)
- [API Endpoints](#api-endpoints)
- [Overdue Loan Management](#overdue-loan-management)

## Overview

The Library Management System is designed to digitize and simplify library operations. It provides different levels of access for administrators, operators, and students.

The backend exposes a RESTful API developed with Laminas MVC and Doctrine ORM, while the frontend provides an interactive user interface built with React.

The system manages books, categories, users, loans, inventory, system settings, and penalties through a centralized application.

## Technologies

### Backend

- PHP 8.1–8.3
- Laminas MVC
- Doctrine ORM
- Doctrine DBAL
- Doctrine Migrations
- PostgreSQL
- Firebase PHP-JWT
- Laminas InputFilter
- Composer

### Frontend

- React 19
- JavaScript (ES6+)
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## Features

### User Management

- Create, update, list, and delete users.
- Assign roles to users.
- Secure password hashing.
- Role-based access control.

### Book Management

- Create, update, list, and delete books.
- Assign books to categories.
- Manage ISBN numbers and available stock.
- Track book availability.
- Search books by title, author, or ISBN.
- Case-insensitive search functionality.

### Book Categories

- Create, update, list, and delete book categories.
- Assign books to their respective categories.
- Maintain a normalized database structure.

### Borrowing Management

- Borrow books for registered students.
- Return borrowed books.
- Automatically calculate due dates.
- Check borrowing eligibility before creating a loan.
- Enforce borrowing limits.
- Automatically update book inventory when borrowing or returning books.

### Penalty Management

- Identify overdue loans.
- Calculate penalties based on overdue days.
- Track outstanding penalties.
- Record penalty payments.
- Prevent students with outstanding penalties from borrowing additional books.

### System Settings

- Configure borrowing limits.
- Configure borrowing periods.
- Configure borrowing and penalty fees.
- Manage application settings dynamically without hardcoding business rules.

## User Roles and Permissions

The application supports three roles:

| Role        | Permissions                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Super Admin | Full administrative access, user management, system settings, books, categories, loans, and penalties. |
| Operator    | Manage books and categories, assist with borrowing and returning books, and manage library operations. |
| Student     | Search books, borrow books, view personal loans, and view and pay personal penalties.                  |

Access to protected API routes is controlled through JWT authentication and role-based authorization.

## Database Design

The application uses PostgreSQL with Doctrine ORM for database management and entity relationships.

The main database tables include:

| Table           | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| users           | Stores user information, password hashes, and roles.                   |
| books           | Stores book information, ISBN, stock, status, and category references. |
| book_categories | Stores book categories separately.                                     |
| loans           | Stores borrowing transactions, due dates, return dates, and statuses.  |
| penalties       | Stores overdue penalties and payment information.                      |
| system_settings | Stores configurable application settings.                              |
| system_logs     | Stores system activity and audit information.                          |

### Database Normalization

A separate `book_categories` table was introduced to normalize the database structure.

Instead of storing the category name directly inside every book record, the `books` table contains a `category_id` foreign key referencing `book_categories.id`.

This approach:

- Eliminates repeated category names across book records.
- Reduces data redundancy.
- Makes category management easier.
- Maintains referential integrity through foreign key constraints.
- Makes it easier to associate multiple books with the same category.

The relationship between books and categories is **one-to-many**: one category can contain multiple books, while each book belongs to one category.

## Authentication and Authorization

The application uses **JSON Web Tokens (JWT)** for stateless authentication.

Authentication is implemented using the `firebase/php-jwt` library.

### Authentication workflow

1. The user submits their email and password through the login endpoint.
2. The backend validates the credentials against the stored password hash.
3. If the credentials are valid, the backend generates a JWT.
4. The token contains the user's ID (`sub`), role, issued-at timestamp, and expiration timestamp.
5. The frontend stores the access token and includes it in subsequent API requests.
6. The backend validates the token before allowing access to protected endpoints.

### JWT configuration

- Signing algorithm: HS256
- Token expiration: 3600 seconds (1 hour)
- Token type: Bearer

Authenticated requests must include:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The backend uses a Laminas event listener to validate JWT tokens and enforce role-based access restrictions.

## Project Structure

### Backend

```text
library_management_system/
│
├── config/
│   └── autoload/
│       ├── doctrine.global.php
│       └── local.php
│
├── data/
│   └── Migrations/
│
├── module/
│   └── Application/
│       ├── config/
│       │   └── module.config.php
│       │
│       └── src/
│           ├── Command/
│           ├── Controller/
│           ├── Entity/
│           ├── InputFilter/
│           ├── Listener/
│           ├── Service/
│           └── Traits/
│
├── public/
├── vendor/
├── .env
├── composer.json
└── README.md
```

### Frontend

```text
library_management_system_front/
│
├── public/
├── src/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── pages/
│
├── package.json
└── vite.config.js
```

## Installation and Setup

Follow these instructions to set up the application locally.

### Prerequisites

Make sure you have installed:

- PHP 8.1–8.3
- Composer
- PostgreSQL
- Node.js and npm
- Git

The PHP PostgreSQL PDO extension (`pdo_pgsql`) must also be enabled.

### 1. Clone the repositories

Clone the backend:

```bash
git clone https://github.com/Leart-Ramadani/library_management_system
cd library_management_system
```

Clone the frontend in a separate terminal or directory:

```bash
git clone https://github.com/Leart-Ramadani/library_management_system_front
cd library_management_system_front
```

Replace the repository URLs with the actual repository URLs.

### 2. Backend installation

Navigate to the backend directory and install PHP dependencies:

```bash
composer install
```

### 3. Database configuration

Create a PostgreSQL database:

```sql
CREATE DATABASE library_management_system;
```

Configure the Doctrine database connection using your local Laminas configuration.

Make sure the connection points to the database you just created and uses the PostgreSQL driver.

### 4. Configure environment variables

Create a `.env` file in the backend project root.

Add your JWT secret and the postgreSQL database:

```env
JWT_SECRET=your_generated_secret
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
```

Generate a secure secret using PHP:

```bash
php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

Copy the generated value into your `.env` file.

**Important:** Never commit your `.env` file or expose your JWT secret in a public repository.

### 5. Run database migrations

Once PostgreSQL and Doctrine are configured, execute:

```bash
composer migrate
```

This will create the database tables and insert the initial development data.

The migrations create the required tables, relationships, default users, book categories, sample books, and system settings.

### 6. Frontend installation

Navigate to the frontend project directory:

```bash
npm install
```

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8080/api
```

This configures the frontend to communicate with the local Laminas API.

## Running the Application

You need to run the backend and frontend separately.

### Start the backend

From the backend project directory:

```bash
composer serve
```

The backend will be available at:

```text
http://localhost:8080
```

### Start the frontend

From the frontend project directory:

```bash
npm run dev
```

Vite will start the frontend development server, usually at:

```text
http://localhost:5173
```

Open the frontend URL in your browser to access the application.

## Default Accounts

The initial migrations create three development accounts:

| Role        | Email                | Password |
| ----------- | -------------------- | -------- |
| Super Admin | admin@example.com    | 12345678 |
| Operator    | operator@example.com | 12345678 |
| Student     | student@example.com  | 12345678 |

These accounts are intended for local development and testing. Change their passwords before using the application in a production environment.

## API Endpoints

All API endpoints use the `/api` prefix.

### Authentication

| Method | Endpoint          | Description                              |
| ------ | ----------------- | ---------------------------------------- |
| POST   | `/api/auth/login` | Authenticate user and generate JWT.      |
| GET    | `/api/auth/me`    | Retrieve authenticated user information. |

### Users

| Method    | Endpoint          | Description               |
| --------- | ----------------- | ------------------------- |
| GET       | `/api/users`      | Retrieve users.           |
| GET       | `/api/users/{id}` | Retrieve a specific user. |
| POST      | `/api/users`      | Create a user.            |
| PUT/PATCH | `/api/users/{id}` | Update a user.            |
| DELETE    | `/api/users/{id}` | Delete a user.            |

### Books

| Method    | Endpoint          | Description               |
| --------- | ----------------- | ------------------------- |
| GET       | `/api/books`      | Retrieve all books.       |
| GET       | `/api/books/{id}` | Retrieve a specific book. |
| POST      | `/api/books`      | Create a book.            |
| PUT/PATCH | `/api/books/{id}` | Update a book.            |
| DELETE    | `/api/books/{id}` | Delete a book.            |

### Book Categories

| Method    | Endpoint                    | Description                   |
| --------- | --------------------------- | ----------------------------- |
| GET       | `/api/book-categories`      | Retrieve categories.          |
| GET       | `/api/book-categories/{id}` | Retrieve a specific category. |
| POST      | `/api/book-categories`      | Create a category.            |
| PUT/PATCH | `/api/book-categories/{id}` | Update a category.            |
| DELETE    | `/api/book-categories/{id}` | Delete a category.            |

### Loans

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| GET    | `/api/loans`                     | Retrieve loans.              |
| GET    | `/api/students`                  | Retrieve students.           |
| GET    | `/api/search-book?search={term}` | Search available books.      |
| POST   | `/api/can-borrow`                | Check borrowing eligibility. |
| POST   | `/api/loan-book`                 | Borrow a book.               |
| POST   | `/api/return-loan/{id}`          | Return a borrowed book.      |

### Penalties

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| GET    | `/api/penalties`        | Retrieve penalties.     |
| POST   | `/api/pay-penalty/{id}` | Record penalty payment. |

### System Settings

| Method    | Endpoint                    | Description                  |
| --------- | --------------------------- | ---------------------------- |
| GET       | `/api/system-settings`      | Retrieve system settings.    |
| GET       | `/api/system-settings/{id}` | Retrieve a specific setting. |
| POST      | `/api/system-settings`      | Create a setting.            |
| PUT/PATCH | `/api/system-settings/{id}` | Update a setting.            |
| DELETE    | `/api/system-settings/{id}` | Delete a setting.            |

Protected endpoints require a valid JWT Bearer token.

## Overdue Loan Management

The application includes two custom Laminas CLI commands for managing overdue loans:

**Identify overdue loans:**

The registered command name is:

```bash
vendor/bin/doctrine-migrations migrations:migrate first
```

**Check and update existing overdue loans:**

```bash
vendor/bin/doctrine-migrations loans:check-overdue
```

These commands handle overdue loan identification and penalty calculations.

For continuous operation, the commands can be scheduled using a system scheduler such as Windows Task Scheduler or Linux cron.

---

## Development Notes

- Database schema changes are managed through Doctrine Migrations.
- ORM entities use PHP attributes for mapping.
- Business logic is separated into service classes.
- Input validation is handled through Laminas InputFilter.
- Authentication uses JWT instead of server-side sessions.
- The frontend communicates with the backend through RESTful API requests.
- Book categories are stored separately to improve database normalization and maintain referential integrity.
