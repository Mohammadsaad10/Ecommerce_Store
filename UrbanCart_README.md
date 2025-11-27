# 🛒 UrbanCart Co. — Full-Stack E-Commerce Application

UrbanCart Co. is a modern full-stack e-commerce web application featuring robust product management, secure user authentication, dynamic shopping experiences, analytics, and seamless checkout with Stripe. Built using a clean architecture and optimized with Redis caching, the application focuses on speed, scalability, and maintainability.

[Live Site] (https://urbancart-co.onrender.com/)

## 📑 Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#️-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Deployment](#️-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 📘 Introduction

UrbanCart Co. is a fully functional e-commerce platform featuring a complete product lifecycle (create, update, delete, feature), a dynamic shopping cart system, discount/coupon capabilities, and secure payment processing.
The project leverages **React**, **Node.js**, **MongoDB**, **Redis**, and **Stripe** to deliver a scalable and seamless online shopping experience.

## ⭐ Features

### 🛍️ E-Commerce Core

- Product & Category Management
- Shopping Cart System with Recommendations
- Coupons & Gift Cards
- Secure Checkout with Stripe

### 🛠️ Admin Dashboard

- Product & category management tools
- Sales analytics with line charts

### 🔐 Robust Authentication

- Signup & login system
- JWT authentication (access + refresh tokens)
- bcrypt.js password hashing
- Axios interceptors for token refreshing

### ⚙️ Technical Features

- MongoDB + Mongoose
- Redis (Upstash) caching
- Cloudinary image handling
- Tailwind CSS UI
- Clean architecture & error handling

## 🧰 Tech Stack

### Frontend

- React.js
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- Nodemon
- Dotenv
- Cookie-parser
- Cloudinary

### Databases & Caching

- MongoDB
- Mongoose
- Redis (Upstash)

### Authentication & Security

- JWT
- bcrypt.js

### Payment Processing

- Stripe

### Development Tools

- VS Code
- Postman

## ⚒️ Installation

### 1. Clone the repository

```
https://github.com/Mohammadsaad10/Ecommerce_Store.git
cd Ecommerce_Store-main
```

### 2. Install server dependencies

```
npm install
```

### 3. Install client dependencies

```
cd frontend
npm install
```

## 🔑 Environment Variables

Create a `.env` file inside the **server** folder:

```
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
REDIS_URL=
STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 🚀 Usage

### Start backend

```
npm run dev
```

### Start frontend

```
cd frontend
npm run dev
```

## ☁️ Deployment

- Configure environment variables
- Build frontend
- Deploy backend + frontend
- Connect Stripe & Cloudinary

## 🧩 Troubleshooting

| Issue                   | Fix                      |
| ----------------------- | ------------------------ |
| Stripe issues           | Check API keys           |
| JWT refresh failing     | Validate cookie settings |
| Mongo errors            | Check MONGO_URI          |
| Cloudinary upload fails | Verify credentials       |
| Redis errors            | Ensure Upstash URL       |

## 📜 License

MIT
