import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/pages/Home";
import { Dashboard } from "./components/pages/Dashboard";
import { Navbar } from "./components/Navbar/Navbar";
import { Admin } from "./components/pages/Admin";
import { PilatesSchedule } from "./components/pages/PilatesSchedule";
import { AdminGuard } from "./components/Admin/AdminGuard";
import { NotFound } from "./components/pages/NotFound";

const routes = [
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Home />
      </>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <>
        <Navbar />
        <Dashboard />
      </>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <Admin />
      </AdminGuard>
    ),
  },
  {
    path: "/admin/pilates",
    element: (
      <AdminGuard>
        <PilatesSchedule />
      </AdminGuard>
    ),
  },
];

// Dev-only route to render the admin UI without the guard. ONLY enable
// when the developer explicitly sets the VITE_ALLOW_DEV_ADMIN env var.
// This must never be enabled in production.
if (import.meta.env.VITE_ALLOW_DEV_ADMIN === "true") {
  routes.push({
    path: "/dev-admin",
    element: (
      <>
        <Navbar />
        <Admin />
      </>
    ),
  });
}

routes.push({ path: "*", element: <NotFound /> });

export const router = createBrowserRouter(routes);
