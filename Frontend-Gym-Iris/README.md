# 🏋️ Gym Iris Admin Dashboard

Gym Iris is an internal administration dashboard built for gym staff to manage members, track payments, update pricing, and monitor monthly revenue through a fast and accessible interface.

The project focuses on a clean dark UI, responsive behavior, and simple payment workflows for day-to-day gym operations.

## ✨ Features

- **Member management**
  - View members in a clear card-based layout
  - Search by name or email
  - Edit and delete member records

- **Payment tracking**
  - Register full payments in one click
  - Handle partial payments with automatic remaining balance calculation
  - Support advance payments for multiple upcoming months

- **Status filters**
  - All members
  - Paid
  - Partial payments
  - Debtors / pending payments

- **Dynamic pricing**
  - Configure monthly prices for Musculation and Pilates

- **Monthly revenue insights**
  - Real-time calculation of the current month revenue
  - Revenue displayed using Argentine number formatting with `toLocaleString('es-AR')`

- **Responsive UI**
  - Optimized for desktop and mobile use
  - Dark-mode-first visual system

- **Safer UX**
  - Confirmation dialogs for destructive actions

## 🧩 Tech Stack

- **Framework:** React
- **Bundler:** Vite
- **Language:** JavaScript (ES Modules)
- **Routing:** React Router
- **Styling:** Tailwind CSS

## ⚙️ Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the development server

```bash
pnpm run dev
```

### Optional: environment variables

Copy `.env.example` to `.env` and adjust values for your local setup:

```bash
cp .env.example .env
```

Variables used:

- `VITE_ADMIN_PASSWORD`
- `VITE_WHATSAPP_NUMBER`
- `VITE_CAREERS_EMAIL`
- `VITE_CONTACT_EMAIL`

### 3. Build for production

```bash
pnpm run build
```

### 4. Preview the production build

```bash
pnpm run preview
```

## 📜 Available Scripts

- `pnpm run dev` — start the Vite development server
- `pnpm run build` — build the project for production
- `pnpm run lint` — run ESLint
- `pnpm run preview` — preview the production build locally

## 🖥️ Main Admin Capabilities

The admin panel currently includes:

- member cards with payment status
- monthly payment history expansion
- advance payment handling
- partial payment modal with validation
- price configuration modal
- edit member modal
- delete confirmation modal
- sidebar with current activity pricing

## 📌 Notes

- The backend is fully integrated and operational — members, payments, and pricing are persisted via a REST API.
- The frontend communicates with the backend through a centralized `api.js` service layer.

## 🚀 Future Improvements (Optional)

- Authentication and role-based access
- Real payment reports and exports
- Member registration form improvements
- Implement a leaderboard
- Dashboard charts and analytics

---

Built for **Gym Iris** — 2026
