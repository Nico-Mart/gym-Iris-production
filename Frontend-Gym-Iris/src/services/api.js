// Configuración limpia de la URL base para Vite y Docker
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Feature flag: usar datos mock si está activado
const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK_DATA || "false").toLowerCase() ===
  "true";

import * as mock from "../mock/users.js";

const getCurrentDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getCurrentMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/**
 * Obtiene los headers con el token JWT almacenado si existe.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("gym_iris_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Normaliza la actividad del frontend al valor que espera el backend.
 * @param {string} activity
 * @returns {"Musculacion"|"Pilates"}
 */
const toBackendMembershipType = (activity) => {
  if (activity === "Musculación" || activity === "Musculacion")
    return "Musculacion";
  if (activity === "Pilates") return "Pilates";
  return "Musculacion"; // fallback
};

const parseResponseSafely = async (res) => {
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
};

export const api = {
  // ─── ADMIN ───────────────────────────────────────────────
  validateAdmin: async (password) => {
    if (USE_MOCK) return mock.validateAdmin(password);
    const res = await fetch(`${BASE_URL}/Admins/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.status === 401) return { isValid: false };
    if (!res.ok) return { isValid: false };

    const data = await res.json();
    if (data && (data.token || data.accessToken)) {
      localStorage.setItem("gym_iris_token", data.token || data.accessToken);
    }

    return { isValid: true, ...data };
  },

  // ─── USUARIOS ────────────────────────────────────────────
  getUsers: async (pageNumber = 1, pageSize = 12) => {
    if (USE_MOCK) {
      const data = await mock.getUsers(pageNumber, pageSize);
      return { ...data, items: (data.items ?? []).map(mapUserFromApi) };
    }

    const url = new URL(`${BASE_URL}/Users`);
    url.searchParams.set("pageNumber", String(pageNumber));
    url.searchParams.set("pageSize", String(pageSize));

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener usuarios");
    const data = await res.json();
    return {
      ...data,
      items: (data.items ?? []).map(mapUserFromApi),
    };
  },

  getUserById: async (id) => {
    if (USE_MOCK) {
      const u = await mock.getUserById(id);
      if (!u) throw new Error("Usuario no encontrado (mock)");
      return mapUserFromApi(u);
    }
    const res = await fetch(`${BASE_URL}/Users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener usuario");
    return mapUserFromApi(await res.json());
  },

  createUser: async (data) => {
    const res = await fetch(`${BASE_URL}/Users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        telephone: data.phone,
        activity: data.activity,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return mapUserFromApi(await res.json());
  },

  updateUser: async (id, data) => {
    const res = await fetch(`${BASE_URL}/Users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        telephone: data.phone,
        activity: data.activity,
        status: data.suspended ? "Suspended" : "Active",
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return mapUserFromApi(await res.json());
  },

  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/Users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204)
      throw new Error("Error al eliminar usuario");
  },

  // ─── PAGOS ───────────────────────────────────────────────
  registerPayment: async (userId, monthKey, amount, activity, notes = null) => {
    const [year, month] = monthKey.split("-").map(Number);
    const res = await fetch(`${BASE_URL}/Payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        membershipType: toBackendMembershipType(activity),
        amount,
        month,
        year,
        notes,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return parseResponseSafely(res);
  },

  updatePayment: async (
    paymentId,
    { userId, activity, amount, monthKey, notes = null },
  ) => {
    const [year, month] = monthKey.split("-").map(Number);
    const res = await fetch(`${BASE_URL}/Payments/${paymentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        membershipType: toBackendMembershipType(activity),
        amount,
        paymentDate: new Date().toISOString(),
        month,
        year,
        notes,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return parseResponseSafely(res);
  },

  deletePayment: async (id) => {
    const res = await fetch(`${BASE_URL}/Payments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204)
      throw new Error("Error al eliminar pago");
  },

  // ─── PRECIOS ─────────────────────────────────────────────
  getPrices: async () => {
    if (USE_MOCK) return mock.getPrices();
    const res = await fetch(`${BASE_URL}/Prices`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener precios");
    return res.json();
  },

  // ─── PILATES SCHEDULE ─────────────────────────────────────
  getPilatesSchedule: async () => {
    if (USE_MOCK && mock.getPilatesSchedule) return mock.getPilatesSchedule();
    const res = await fetch(`${BASE_URL}/Pilates/schedule`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener el horario de Pilates");
    return res.json();
  },

  assignPilatesSlot: async (userId, dayIndex, slotIndex) => {
    const res = await fetch(`${BASE_URL}/Pilates/assign`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, dayIndex, slotIndex }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  removePilatesAssignment: async (userId, dayIndex, slotIndex) => {
    const res = await fetch(
      `${BASE_URL}/Pilates/remove/${userId}/${dayIndex}/${slotIndex}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok && res.status !== 204) throw new Error(await res.text());
  },

  updatePrice: async (id, price) => {
    const res = await fetch(`${BASE_URL}/Prices/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ price }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Mapper ──────────────────────────────────────────────────────────────────
function mapUserFromApi(u) {
  const currentMonthKey = getCurrentMonthKey();

  const payments = (u.payments ?? []).map((p) => ({
    _backendId: p.id,
    month:
      typeof p.month === "number" && typeof p.year === "number"
        ? `${p.year}-${String(p.month).padStart(2, "0")}`
        : String(p.month),
    moneyPaid: p.amount ?? 0,
    paidDate: p.paymentDate?.slice(0, 10) ?? p.paidDate ?? undefined,
    membershipType: p.membershipType,
    amount: 0,
    paidAmount: 0,
    status: "pending",
  }));

  const hasCurrentMonth = payments.some((p) => p.month === currentMonthKey);
  if (!hasCurrentMonth && u.status !== "Suspended") {
    payments.unshift({
      _backendId: null,
      month: currentMonthKey,
      moneyPaid: 0,
      paidDate: undefined,
      membershipType: null,
      amount: 0,
      paidAmount: 0,
      status: "pending",
    });
  }

  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.telephone,
    activity: u.activity ?? "Musculación",
    joinDate: u.joinDate?.slice(0, 10) ?? getCurrentDateKey(),
    suspended: u.status === "Suspended",
    payments,
  };
}
