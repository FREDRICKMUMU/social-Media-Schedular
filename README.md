Social Scheduler
A full-stack social media management platform that enables users to schedule posts, generate AI-powered content, and manage multiple social media accounts from a single dashboard.

Features
AI-powered post generation using Google Gemini

Image generation with Leonardo.ai integration

Multi-platform social media scheduling

OAuth authentication and account management

Cloudinary media storage and optimization

Real-time post preview and scheduling

Activity tracking and analytics

User authentication with JWT

Responsive dashboard interface

Tech Stack
Frontend
React with TypeScript

Tailwind CSS for styling

React Router for navigation

Lucide React for icons

Motion for animations

Axios for API calls

Backend
Node.js with Express

TypeScript

MongoDB with Mongoose ODM

JSON Web Tokens for authentication

Bcrypt for password hashing

Zernio SDK for social media integration

Integrations
Google Gemini AI

Leonardo.ai

Cloudinary

MongoDB Atlas

Prerequisites
Node.js (v18 or higher)

npm or yarn package manager

MongoDB Atlas account or local MongoDB instance

API keys for:

Google Gemini

Leonardo.ai

Cloudinary

Installation
Clone the repository

text
git clone https://github.com/frenao/social-scheduler.git
cd social-scheduler
Install backend dependencies

text
cd server
npm install
Install frontend dependencies

text
cd client
npm install
Create environment files

Backend (.env)

text
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
LEONARDO_API_KEY=your_leonardo_api_key
ZERNIO_API_KEY=your_zernio_api_key
Frontend (.env)

text
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
Start the development servers

Backend

text
cd server
npm run server
Frontend

text
cd client
npm run dev
Project Structure
text
social-scheduler/
├── server/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.ts       # Entry point
├── client/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── assets/     # Static assets
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Frontend utilities
│   └── index.html
└── package.json
API Endpoints
Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - User login

GET /api/auth/me - Get current user

Social Accounts
GET /api/accounts - Get all accounts

POST /api/accounts/connect - Connect new account

DELETE /api/accounts/:id - Disconnect account

Posts
POST /api/posts/generate - Generate AI post

GET /api/posts/generations - Get all generations

POST /api/posts - Schedule a post

GET /api/posts - Get all posts

Usage
Register an account or login

Connect your social media platforms

Generate AI content or create custom posts

Schedule posts for your connected accounts

Monitor activity and engagement from your dashboard

Environment Variables
Server
Variable	Description
MONGODB_URI	MongoDB Atlas connection string
JWT_SECRET	Secret key for JWT signing
PORT	Server port number
GEMINI_API_KEY	Google Gemini API key
LEONARDO_API_KEY	Leonardo.ai API key
ZERNIO_API_KEY	Zernio platform API key
Client
Variable	Description
VITE_API_URL	Backend API URL
VITE_CLOUDINARY_UPLOAD_PRESET	Cloudinary upload preset
VITE_CLOUDINARY_CLOUD_NAME	Cloudinary cloud name
Database Models
User
email (String, unique)

password (String, hashed)

name (String)

zernioProfileId (String)

createdAt, updatedAt (Timestamp)

Account
user (ObjectId, ref: User)

platform (String)

handle (String)

zernioAccountId (String)

status (String: connected/disconnected)

avatarUrl (String)

Generation
user (ObjectId, ref: User)

prompt (String)

content (String)

mediaUrl (String)

hashtags ([String])

tone (String)

status (String: generated/scheduled/published)

Post
user (ObjectId, ref: User)

content (String)

mediaUrl (String)

platforms ([String])

scheduledFor (Date)

status (String: scheduled/published/failed)

Contributing
Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Open a pull request

License
This project is licensed under the MIT License.
