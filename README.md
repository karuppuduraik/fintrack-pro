# 💰 FinTrack Pro

> A modern full-stack Personal Finance & Budget Management System built with Spring Boot, React, MySQL, JWT Authentication, and Railway Database.

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.1-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Authentication-red?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge)
![Render](https://img.shields.io/badge/Backend-Render-blue?style=for-the-badge)
![Railway](https://img.shields.io/badge/Database-Railway-purple?style=for-the-badge)

---

## 📌 Project Overview

FinTrack Pro is a secure full-stack personal finance management application that helps users manage:

- 💵 Income
- 💸 Expenses
- 📊 Budgets
- 🎯 Savings Goals
- 📈 Financial Reports
- 🔐 Secure JWT Authentication

Each user has their own secure workspace where only their financial information is accessible.

---

# 🚀 Features

### Authentication

- User Registration
- Secure Login
- JWT Authentication
- Password Encryption
- Protected APIs
- Role-Based Security

---

### Dashboard

- Monthly Income
- Monthly Expenses
- Current Balance
- Savings Overview
- Recent Transactions
- Budget Summary

---

### Transaction Management

- Add Transaction
- Update Transaction
- Delete Transaction
- Search Transactions
- Filter by Category
- Filter by Type
- Pagination

---

### Budget Management

- Monthly Budget
- Category Budget
- Budget Progress
- Overspending Alerts

---

### Savings Goals

- Create Goal
- Update Goal
- Track Progress
- Goal Completion Status

---

### Reports

- Financial Summary
- Monthly Analysis
- Category Wise Expenses
- PDF Export
- Excel Export

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Axios
- React Router
- React Hook Form
- Material UI Icons
- Tailwind CSS
- Framer Motion
- Recharts

---

## Backend

- Java 21
- Spring Boot 3.3.1
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven

---

## Database

- MySQL
- Railway MySQL

---

## Deployment

### Frontend

- Vercel

### Backend

- Render

### Database

- Railway

---

# 📂 Project Structure

```
FinTrack-Pro
│
├── fintrack-frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   └── App.jsx
│
├── fintrack-backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── security
│   ├── config
│   └── FinTrackApplication.java
│
└── README.md
```

---

# 🔒 Security Features

- JWT Authentication
- BCrypt Password Encryption
- Spring Security
- Protected REST APIs
- User-Based Data Access
- CORS Configuration

---

# 🗄 Database Design

### User

- id
- username
- email
- password
- role

---

### Transaction

- id
- amount
- type
- category
- description
- date
- user_id

---

### Budget

- id
- limitAmount
- period
- category
- user_id

---

### Goal

- id
- targetAmount
- currentAmount
- targetDate
- status
- user_id

---

### Category

- id
- name
- type
- colorCode
- iconName

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/fintrack-pro.git
```

```
cd fintrack-pro
```

---

## Backend

```
cd fintrack-backend
```

Install Dependencies

```bash
mvn clean install
```

Run Backend

```bash
mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

## Frontend

```
cd fintrack-frontend
```

Install Packages

```bash
npm install
```

Run Project

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Environment Variables

## Backend

```
MYSQL_URL=
MYSQLUSER=
MYSQLPASSWORD=

JWT_SECRET=
JWT_EXPIRATION=
```

---

## Frontend

```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

---

# API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

---

## Dashboard

```
GET /api/dashboard/stats
```

---

## Transactions

```
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
```

---

## Budgets

```
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/{id}
DELETE /api/budgets/{id}
```

---

## Goals

```
GET    /api/goals
POST   /api/goals
PUT    /api/goals/{id}
DELETE /api/goals/{id}
```

---

# Screenshots

Add screenshots here:

- Login Page
- Register Page
- Dashboard
- Transactions
- Budgets
- Goals
- Reports

---

# Future Enhancements

- AI Expense Analysis
- Email Notifications
- Budget Prediction
- Mobile Application
- Recurring Transactions
- Multi-Currency Support
- Dark/Light Theme
- Financial Insights using AI

---

# Author

**Karuppudurai K**

🎓 B.E. Electronics and Communication Engineering

💻 Java Full Stack Developer

### Skills

- Java
- Spring Boot
- React
- MySQL
- REST API
- JWT
- Git
- GitHub

---

# License

This project is developed for educational and portfolio purposes.
