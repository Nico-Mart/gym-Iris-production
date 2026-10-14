# 🏋️ Gym Iris API

> A modern, RESTful Web API for comprehensive gym management built with .NET Core 8

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Entity Framework](https://img.shields.io/badge/EF%20Core-9.0-512BD4?style=for-the-badge)](https://docs.microsoft.com/en-us/ef/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📖 About The Project

**Gym Iris API** is a robust backend solution designed to streamline gym operations through a clean, scalable RESTful architecture. The system provides comprehensive tools for managing members, tracking payments, and configuring dynamic membership pricing in real-time.

Built with enterprise-grade design patterns and modern .NET practices, this API ensures data integrity, business rule enforcement, and seamless integration capabilities for frontend applications.

### Why Gym Iris?

- **Automated Payment Tracking**: Historical payment records with month/year granularity
- **Dynamic Pricing**: Admin-configurable prices for different membership types (Musculación, Pilates)
- **Business Logic Enforcement**: Payment amounts validated against current pricing, preventing overpayment
- **Clean Architecture**: Repository Pattern with Dependency Injection for maintainability and testability

---

## 🚀 Tech Stack

**Backend Framework:**

- `.NET Core 8` - Modern, cross-platform framework
- `ASP.NET Core Web API` - RESTful service architecture
- `C# 12` - Latest language features with nullable reference types

**Data Layer:**

- `Entity Framework Core 9.0` - Code-first ORM with migrations
- `MySQL 8.0+` - Relational database with ACID compliance
- `Pomelo.EntityFrameworkCore.MySql` - High-performance MySQL provider

**Security & Authentication:**

- `BCrypt.Net-Next` - Industry-standard password hashing

**Documentation & Testing:**

- `Swashbuckle.AspNetCore (Swagger)` - Interactive API documentation
- `OpenAPI 3.0` - API contract specification

**Architecture Patterns:**

- Repository Pattern
- Dependency Injection (DI)
- Data Transfer Objects (DTOs)
- Service Layer abstraction

**Additional Features:**

- CORS enabled for frontend integration
- Automatic data seeding
- XML documentation generation

---

## 🏛️ Architecture & Design

### Repository Pattern

This project implements the **Repository Pattern** to achieve:

**Separation of Concerns:**

- Business logic (Services) decoupled from data access (Repositories)
- Controllers remain thin, focused solely on HTTP concerns

**Testability:**

- Repositories can be mocked for unit testing
- Business rules tested independently from database operations

**Maintainability:**

- Centralized data access logic
- Easy to swap ORM implementations without affecting business logic

**Abstraction:**

- Interfaces (`IUserRepository`, `IPaymentRepository`) define contracts
- Concrete implementations handle EF Core specifics

### Layered Architecture

```
┌─────────────────────────────────────┐
│      Controllers (API Layer)        │  ← HTTP requests/responses
├─────────────────────────────────────┤
│      Services (Business Logic)      │  ← Validation, orchestration
├─────────────────────────────────────┤
│   Repositories (Data Access Layer)  │  ← Database operations
├─────────────────────────────────────┤
│   EF Core + MySQL (Persistence)     │  ← Data storage
└─────────────────────────────────────┘
```

### Key Design Decisions

- **DTOs for API boundaries**: Prevents over-posting and controls data exposure
- **Service layer for business rules**: Payment validation, price enforcement, user status calculation
- **EF Core migrations**: Version-controlled database schema evolution
- **Dependency Injection**: Constructor injection for all dependencies via ASP.NET Core's built-in container

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Key Endpoints](#-key-endpoints)
- [Interactive Documentation](#-interactive-documentation)
- [Frontend Integration](#-frontend-integration)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### User Management

- ✅ Complete CRUD operations for gym members
- ✅ Membership status tracking (Pending, Partial, Paid, Suspended)
- ✅ Activity type assignment (Musculación, Pilates)
- ✅ Unique email validation
- ✅ Automatic join date registration

### Payment System

- 💰 Monthly payment recording per user
- 💰 Historical payment tracking with full audit trail
- 💰 Payment validation against current membership pricing
- 💰 Duplicate payment prevention (one payment per user/month/year)
- 💰 Aggregated payment totals per user

### Dynamic Pricing

- 💵 Admin-configurable prices for membership types
- 💵 Real-time price updates with timestamp tracking
- 💵 Business rule: payments cannot exceed configured price
- 💵 Centralized price management

### Security & Authentication

- 🔐 BCrypt password hashing for admin accounts
- 🔐 Secure password validation endpoint
- 🔐 Seeded default admin credentials

### Developer Experience

- 📄 Interactive Swagger/OpenAPI documentation
- 📄 XML code comments for IntelliSense
- 📄 CORS pre-configured for React/Vite frontend
- 📄 Automatic database seeding for development

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or higher
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/mysql/)
- [Git](https://git-scm.com/downloads)
- (Optional) [Visual Studio 2022+](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/) with C# extension

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Nico-Mart/gym-iris-api.git
cd gym-iris-api
```

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Configure Database Connection

Edit `appsettings.json` with your MySQL credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=gymiris;User=root;Password=your_password;"
  }
}
```

### 4. Apply Database Migrations

```bash
dotnet ef database update
```

This command will:

- Create the `gymiris` database
- Generate all required tables
- Seed default data (admin account + initial prices)

### 5. Run the Application

```bash
dotnet run
```

The API will start at:

- **HTTPS**: `https://localhost:7XXX`
- **HTTP**: `http://localhost:5XXX`

_(Exact ports shown in terminal output)_

### 6. Access Interactive Documentation

Navigate to:

```
https://localhost:7XXX/
```

Swagger UI will load automatically in development mode.

---

## ⚙️ Configuration

### appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=gymiris;User=root;Password=yourpassword;"
  }
}
```

### Environment Variables (Production)

For production deployments, override settings using environment variables:

```bash
export ConnectionStrings__DefaultConnection="Server=prod-server;Database=gymiris;User=prod_user;Password=prod_password;"
```

### CORS Configuration

Currently configured for frontend running at:

```
http://localhost:5173 (Vite default)
```

To modify, update `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
		policy.WithOrigins("http://localhost:YOUR_PORT")
			  .AllowAnyHeader()
			  .AllowAnyMethod());
});
```

---

## 🗄️ Database Setup

### Automatic Seeding

On first run, the application automatically seeds:

**Admin Account:**

- Username: `admin`
- Password: set via the `ADMIN_DEFAULT_PASSWORD` environment variable

**Default Pricing (Argentine Pesos - ARS):**

- Musculación: $38,000
- Pilates: $42,000

### Manual Migration Commands

```bash
# Create a new migration
dotnet ef migrations add MigrationName

# Apply pending migrations
dotnet ef database update

# Rollback to specific migration
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove

# Drop database (development only)
dotnet ef database drop
```

---

## 📁 Project Structure

```
Backend-Gym-Iris/
│
├── Controllers/               # API endpoints
│   ├── AdminsController.cs    # Admin authentication
│   ├── UsersController.cs     # User management
│   ├── PaymentsController.cs  # Payment operations
│   └── PricesController.cs    # Price management
│
├── Services/                  # Business logic layer
│   ├── Interfaces/
│   │   ├── IUserService.cs
│   │   ├── IPaymentService.cs
│   │   ├── IAdminService.cs
│   │   └── IMembershipPriceService.cs
│   ├── UserService.cs
│   ├── PaymentService.cs
│   ├── AdminService.cs
│   └── MembershipPriceService.cs
│
├── Repositories/              # Data access layer
│   ├── Interfaces/
│   │   ├── IUserRepository.cs
│   │   ├── IPaymentRepository.cs
│   │   └── IMembershipPriceRepository.cs
│   ├── UserRepository.cs
│   ├── PaymentRepository.cs
│   └── MembershipPriceRepository.cs
│
├── Entities/                  # Domain models
│   ├── User.cs
│   ├── Payment.cs
│   ├── Admin.cs
│   └── MembershipPrice.cs
│
├── DTOs/                      # Data Transfer Objects
│   ├── User/
│   │   └── UserDTOs.cs
│   ├── Payment/
│   │   └── PaymentDTOs.cs
│   ├── Admin/
│   │   └── AdminDTOs.cs
│   └── MembershipPrice/
│       └── MembershipPriceDTOs.cs
│
├── Data/
│   └── ApplicationDbContext.cs  # EF Core context
│
├── Enums/
│   ├── MembershipStatus.cs
│   └── MembershipType.cs
│
├── Migrations/                # EF Core migrations
│
├── Program.cs                 # Application entry point
├── appsettings.json           # Configuration
└── README.md
```

---

## 🌐 Key Endpoints

### 🔐 Authentication

```http
POST /api/admins/validate
```

Validates admin credentials for secure operations.

**Request Body:**

```json
{
  "password": "<admin_password_from_environment>"
}
```

**Response:** `200 OK` if valid, `400 Bad Request` if invalid

---

### 👥 User Management

| Method   | Endpoint          | Description                       | Auth Required |
| -------- | ----------------- | --------------------------------- | ------------- |
| `GET`    | `/api/users`      | Retrieve all gym members          | No            |
| `GET`    | `/api/users/{id}` | Get specific user by ID           | No            |
| `POST`   | `/api/users`      | Register new member               | No            |
| `PUT`    | `/api/users/{id}` | Update member information         | No            |
| `DELETE` | `/api/users/{id}` | Remove member (cascades payments) | No            |

**Create User Example:**

```json
POST /api/users

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "telephone": "1234567890",
  "activity": "Musculacion"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "telephone": "1234567890",
  "joinDate": "2024-03-20T10:30:00Z",
  "status": "Pending",
  "activity": "Musculacion",
  "payments": []
}
```

---

### 💰 Payment Operations

| Method   | Endpoint                                                       | Description                         |
| -------- | -------------------------------------------------------------- | ----------------------------------- |
| `GET`    | `/api/payments`                                                | List all payments system-wide       |
| `GET`    | `/api/payments/{id}`                                           | Get payment details by ID           |
| `GET`    | `/api/payments/user/{userId}`                                  | Get all payments for specific user  |
| `GET`    | `/api/payments/user/{userId}/total`                            | Calculate total amount paid by user |
| `GET`    | `/api/payments/user/{userId}/month/{month}/year/{year}/exists` | Check if payment exists for period  |
| `POST`   | `/api/payments`                                                | Record new payment                  |
| `PUT`    | `/api/payments/{id}`                                           | Update payment details              |
| `DELETE` | `/api/payments/{id}`                                           | Remove payment record               |

**Create Payment Example:**

```json
POST /api/payments

{
  "userId": 1,
  "membershipType": "Musculacion",
  "amount": 38000.00,
  "month": 3,
  "year": 2024,
  "notes": "March membership payment"
}
```

**Business Rules:**

- ❌ Payment amount **cannot exceed** configured membership price
- ❌ Only **one payment per user/month/year**
- ✅ Auto-validation against `MembershipPrice` table

---

### 💵 Pricing Management

| Method | Endpoint           | Description                       | Admin Only |
| ------ | ------------------ | --------------------------------- | ---------- |
| `GET`  | `/api/prices`      | Get all current membership prices | No         |
| `GET`  | `/api/prices/{id}` | Get specific price configuration  | No         |
| `PUT`  | `/api/prices/{id}` | Update membership price           | Yes        |

**Update Price Example:**

```json
PUT /api/prices/1

{
  "price": 45000.00
}
```

**Response:**

```json
{
  "id": 1,
  "type": "Musculacion",
  "price": 45000.0,
  "lastUpdated": "2024-03-21T15:30:00Z"
}
```

---

## 📖 Interactive Documentation

Once the application is running, access the **Swagger UI** at:

```
https://localhost:PORT/
```

### Swagger Features:

✅ **Try It Out** - Execute API calls directly from browser  
✅ **Schema Definitions** - View request/response models  
✅ **Authentication Testing** - Test admin endpoints  
✅ **Error Responses** - See validation error examples

### Example Workflow in Swagger:

1. **POST** `/api/users` - Create a test user
2. **GET** `/api/prices` - Check current membership prices
3. **POST** `/api/payments` - Record a payment for the user
4. **GET** `/api/payments/user/{userId}` - View user's payment history

---

## 🎨 Frontend Integration

This API is designed for seamless integration with modern frontend frameworks.

### CORS Configuration

Pre-configured for React/Vite development server:

```
http://localhost:5173
```

### TypeScript Type Definitions

```typescript
// User Model
interface User {
  id: number;
  name: string;
  email: string;
  telephone: string;
  joinDate: string; // ISO 8601
  status: "Pending" | "Partial" | "Paid" | "Suspended";
  activity: "Musculacion" | "Pilates";
  payments: Payment[];
}

// Payment Model
interface Payment {
  id: number;
  userId: number;
  userName: string;
  membershipType: "Musculacion" | "Pilates";
  amount: number;
  paymentDate: string; // ISO 8601
  month: number; // 1-12
  year: number;
  notes?: string;
}

// Price Model
interface MembershipPrice {
  id: number;
  type: "Musculacion" | "Pilates";
  price: number;
  lastUpdated: string; // ISO 8601
}
```

### Example API Client (Axios)

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7XXX/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

// Create payment
export const createPayment = async (payment: CreatePaymentRequest) => {
  const response = await api.post("/payments", payment);
  return response.data;
};

// Validate admin
export const validateAdmin = async (password: string): Promise<boolean> => {
  try {
    await api.post("/admins/validate", { password });
    return true;
  } catch {
    return false;
  }
};
```

### API Response Handling

```typescript
try {
  const payment = await api.post("/payments", paymentData);
  console.log("Payment created:", payment.data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      // Business rule violation
      alert(error.response.data.message);
    }
  }
}
```

---

## 🧪 Testing

### Using cURL

```bash
# Get all users
curl https://localhost:7XXX/api/users

# Create user
curl -X POST https://localhost:7XXX/api/users \
  -H "Content-Type: application/json" \
  -d '{
	"name": "Jane Smith",
	"email": "jane@example.com",
	"telephone": "9876543210",
	"activity": "Pilates"
  }'

# Validate admin
curl -X POST https://localhost:7XXX/api/admins/validate \
  -H "Content-Type: application/json" \
  -d '{"password":"IrisAdmin2026!"}'
```

### Using PowerShell (Invoke-RestMethod)

```powershell
# Get prices
$prices = Invoke-RestMethod -Uri "https://localhost:7XXX/api/prices" -Method Get
$prices | Format-Table

# Create payment
$payment = @{
	userId = 1
	membershipType = "Musculacion"
	amount = 38000
	month = 3
	year = 2024
	notes = "Test payment"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:7XXX/api/payments" `
  -Method Post `
  -Body $payment `
  -ContentType "application/json"
```

---

## 🔒 Security Considerations

### Implemented:

- ✅ **BCrypt Hashing** - Admin passwords hashed with salt
- ✅ **Input Validation** - DTO-level validation attributes
- ✅ **Business Rule Enforcement** - Service layer validation
- ✅ **HTTPS Enforcement** - Redirect to secure endpoints
- ✅ **CORS Configuration** - Restricted origins

### Recommended for Production:

- 🔐 Implement **JWT Authentication** for user sessions
- 🔐 Add **Rate Limiting** to prevent abuse
- 🔐 Enable **API Key Authentication** for admin operations
- 🔐 Implement **Audit Logging** for sensitive operations
- 🔐 Add **Request/Response Encryption** for payment data

---

## 🐛 Troubleshooting

### MySQL Connection Failed

**Problem:** `Unable to connect to any of the specified MySQL hosts`

**Solution:**

```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
Get-Service MySQL80          # Windows

# Test connection manually
mysql -u root -p

# Verify appsettings.json connection string
# Ensure Server, Database, User, and Password are correct
```

### Migration Errors

**Problem:** `A migration has already been applied to the database`

**Solution:**

```bash
# Check migration status
dotnet ef migrations list

# If needed, rollback
dotnet ef database update PreviousMigrationName

# Or reset completely (development only)
dotnet ef database drop --force
dotnet ef database update
```

### CORS Errors from Frontend

**Problem:** `Access to fetch at 'https://localhost:7XXX' blocked by CORS policy`

**Solution:**
Update `Program.cs` with your frontend URL:

```csharp
policy.WithOrigins("http://localhost:YOUR_FRONTEND_PORT")
```

### Port Already in Use

**Problem:** `Failed to bind to address https://127.0.0.1:7XXX`

**Solution:**

```bash
# Find process using port (Windows)
netstat -ano | findstr :7XXX
taskkill /PID <PID> /F

# Or change port in Properties/launchSettings.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### 1. Fork the Repository

```bash
git clone https://github.com/Nico-Mart/gym-iris-api.git
cd gym-iris-api
```

### 2. Create Feature Branch

```bash
git checkout -b feature/YourFeatureName
```

### 3. Commit Changes

```bash
git commit -m "feat: Add YourFeatureName"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests

### 4. Push and Create PR

```bash
git push origin feature/YourFeatureName
```

Then open a Pull Request on GitHub.

### Code Style Guidelines:

- Follow [C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Use meaningful variable/method names
- Add XML documentation for public APIs
- Write unit tests for business logic

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Gym Iris

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [.NET Community](https://dotnet.microsoft.com/platform/community) - For excellent framework documentation
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) - Powerful ORM with migrations
- [Pomelo Foundation](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql) - MySQL provider
- [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) - OpenAPI/Swagger integration

---

## 📧 Contact & Support

**Project Maintainer:** Nicolás Martínez  
**GitHub:** [@Nico-Mart](https://github.com/Nico-Mart)  
**Repository:** [gym-iris-api](https://github.com/Nico-Mart/gym-iris-api)

For questions, issues, or feature requests:

- 🐛 [Open an Issue](https://github.com/Nico-Mart/gym-iris-api/issues)
- 💬 [Start a Discussion](https://github.com/Nico-Mart/gym-iris-api/discussions)

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ by the Gym Iris Team

</div>
