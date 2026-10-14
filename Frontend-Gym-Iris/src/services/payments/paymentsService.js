export const createInitialPayments = () => [
  {
    id: 1,
    month: "Marzo 2026",
    amount: 5000,
    status: "pending",
    dueDate: "2026-03-31",
  },
  {
    id: 2,
    month: "Febrero 2026",
    amount: 5000,
    status: "paid",
    dueDate: "2026-02-28",
    paidDate: "2026-02-25",
  },
  {
    id: 3,
    month: "Enero 2026",
    amount: 5000,
    status: "paid",
    dueDate: "2026-01-31",
    paidDate: "2026-01-28",
  },
  {
    id: 4,
    month: "Diciembre 2025",
    amount: 4500,
    status: "paid",
    dueDate: "2025-12-31",
    paidDate: "2025-12-20",
  },
  {
    id: 5,
    month: "Noviembre 2025",
    amount: 4500,
    status: "overdue",
    dueDate: "2025-11-30",
  },
];

export const markPaymentAsPaid = (payments, paymentId, paidDate) =>
  payments.map((payment) =>
    payment.id === paymentId
      ? {
          ...payment,
          status: "paid",
          paidDate,
        }
      : payment,
  );

export const getPaymentSummary = (payments) => {
  const totalPaid = payments.filter(
    (payment) => payment.status === "paid",
  ).length;
  const totalPending = payments.filter(
    (payment) => payment.status === "pending" || payment.status === "overdue",
  ).length;
  const totalAmount = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totalPaid,
    totalPending,
    totalAmount,
    totalPayments: payments.length,
  };
};
