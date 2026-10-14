// Mock data and helpers for offline development
const PRICES = [
  {
    id: 1,
    type: "Musculacion",
    price: 3500,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    type: "Pilates",
    price: 4200,
    lastUpdated: new Date().toISOString(),
  },
];

// Generate a list of mock users with simple payment histories
const USERS = Array.from({ length: 36 }).map((_, i) => {
  const id = i + 1;
  const name = `Usuario ${id}`;
  const activity = i % 3 === 0 ? "Pilates" : "Musculación";
  const telephone = `+54 9 11 0000 ${String(id).padStart(4, "0")}`;
  const joinDate = new Date(Date.now() - i * 86400000 * 30).toISOString();

  // payments: some users have payments for previous months; one current month entry will be added by frontend mapper
  const payments = [];
  if (i % 2 === 0) {
    payments.push({
      id: id * 10 + 1,
      amount: 3500,
      membershipType: activity === "Pilates" ? "Pilates" : "Musculacion",
      month: new Date(Date.now() - 86400000 * 30).getMonth() + 1,
      year: new Date(Date.now() - 86400000 * 30).getFullYear(),
      paymentDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    });
  }

  return {
    id,
    name,
    email: `user${id}@example.com`,
    telephone,
    activity,
    status: i % 10 === 0 ? "Suspended" : "Active",
    joinDate,
    payments,
  };
});

function paginate(array, pageNumber = 1, pageSize = 12) {
  // Enforce strict page size of 12 to avoid offset issues.
  const enforcedPageSize = 12;
  const totalCount = array.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / enforcedPageSize));
  const pn = Math.max(1, Math.min(pageNumber, totalPages));
  const start = (pn - 1) * enforcedPageSize;
  const items = array.slice(start, start + enforcedPageSize);
  return { items, totalCount, pageNumber: pn, totalPages };
}

export function validateAdmin(password) {
  const expected = import.meta.env.VITE_DEV_PASSWORD || "tu_password_oculta";
  return Promise.resolve({ isValid: password === expected });
}

export function getUsers(pageNumber = 1, pageSize = 12) {
  return Promise.resolve(paginate(USERS, pageNumber, pageSize));
}

// Return a frontend-friendly mapping of all users (applies the same
// normalization the frontend expects, including payments normalized to
// "YYYY-MM" and ensuring a current-month entry exists for non-suspended users).
export function getAllForFrontend() {
  const getCurrentMonthKey = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const getCurrentDateKey = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const mapUser = (u) => {
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
  };

  return USERS.map(mapUser);
}

export function getUserById(id) {
  const u = USERS.find((x) => String(x.id) === String(id));
  return Promise.resolve(u ?? null);
}

export function getPrices() {
  return Promise.resolve(PRICES);
}

export default {
  validateAdmin,
  getUsers,
  getUserById,
  getPrices,
};
