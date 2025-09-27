# Real Estate Next.js Application

A modern real estate platform built with Next.js, TypeScript, Prisma, and MySQL. This application allows users to browse, search, and manage property listings with authentication and user management features.

## Features

- 🏠 **Property Listings**: Browse and search properties by location, type, and price
- 🔐 **Authentication**: User registration and login system
- 📱 **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- 🏢 **Admin Panel**: Administrative features for managing properties and users
- 💾 **Database Integration**: MySQL database with Prisma ORM
- 📧 **Contact System**: Contact form for user inquiries
- ❤️ **Saved Properties**: Users can save favorite properties
- 📋 **Property Management**: Users can post and manage their own properties

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL with Prisma ORM
- **Authentication**: Custom JWT-based authentication
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MySQL database
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Update the `.env.local` file with your database credentials:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/home_db"
   JWT_SECRET="your-jwt-secret-key-here-make-it-long-and-secure"
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/properties` - Get properties (with filters)
- `POST /api/properties` - Create new property
- `POST /api/messages` - Send contact message

## Key Features

- Modern, responsive design with Tailwind CSS
- JWT-based authentication system
- Property search and filtering
- Contact form with database storage
- Clean, minimal UI optimized for performance
