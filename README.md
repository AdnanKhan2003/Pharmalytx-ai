# Pharmalytx-ai: Pharmacy Management System

## Demo
Live: https://pharmalytix-ai.vercel.app/ \
Video: https://adnankhan-dev.netlify.app/projects/pharmalytix-ai

## Existing System (Paper-based, non-digital)
Traditional pharmacies often rely on manual ledgers and paper-based records to track inventory, sales, and returns. This approach is prone to:
- Human error in calculations and data entry.
- Delayed insights into stock levels and expiry dates.
- High risk of data loss due to physical damage or misplacement of records.
- Difficulty in generating comprehensive reports or tracking long-term trends.

## Problem Statement
The lack of a centralized, digital system for pharmacy management leads to operational inefficiencies, stockouts of critical medicines, and potential financial losses. There is a need for a secure, real-time platform that automates inventory tracking, simplifies sales processing, and provides actionable insights for better decision-making.

## Features
- **Real-time Inventory Management**: Track stock levels, batch numbers, and expiry dates automatically.
- **Smart Sales Tracking**: Process transactions swiftly and maintain a digital history of all sales.
- **Returns Processing**: Efficiently manage customer returns and update inventory in real-time.
- **Advanced Dashboard**: Visualized analytics for sales performance, inventory turnover, and financial health.
- **Secure User Management**: Role-Based Access Control (RBAC) ensuring only authorized personnel can access sensitive data.
- **Automated Insights**: AI-ready architecture for predicting stock requirements and identifying sales trends.

## Technical Challenges
- **Next.js & Turbopack Stabilization**: Ensuring a smooth development experience and reliable production builds with the latest Next.js 16/Turbopack features.
- **Authentication Resilience**: Implementing a hardened NextAuth system with robust server-side sign-out actions to prevent common fetch errors in modern frameworks.
- **Database Scalability (Prisma 7)**: Migrating to and optimizing Prisma 7 with custom driver adapters for high-performance PostgreSQL connections.
- **Complex UI/UX**: Building a premium, responsive dashboard that remains fast and interactive under heavy data loads.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma 7.6.0
- **Authentication**: NextAuth.js (Auth.js v5)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Server Actions
- **Deployment**: Render / Vercel ready

## Conclusion
Pharmalytx-ai transforms pharmacy operations from a manual, error-prone process into a streamlined, digital-first experience. By leveraging the latest web technologies, it provides a secure and scalable foundation for modern healthcare commerce.

---

## How to Setup

### 1. Clone the repository
```bash
git clone https://github.com/AdnanKhan2003/Pharmalytx-ai.git
cd Pharmalytx-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following (see example below).

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
```

---

## Example of .env variables used

```env
# Database (PostgreSQL/Neon)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# NextAuth Configuration
AUTH_SECRET="your-256-bit-secret-key"
AUTH_URL="http://localhost:3000/api/auth"

# Compatibility for NextAuth v5
NEXTAUTH_URL="http://localhost:3000/api/auth"
NEXTAUTH_SECRET="your-256-bit-secret-key"

# (Add other environment-specific variables here)
```
