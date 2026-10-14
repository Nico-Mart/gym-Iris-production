import { useEffect, useMemo, useState } from "react";
import {
  createInitialPayments,
  getPaymentSummary,
  markPaymentAsPaid,
} from "../services/payments/paymentsService";
import {
  clearUserSession,
  getUserSession,
} from "../services/session/userSessionService";

export const useDashboardState = ({ navigate } = {}) => {
  const user = useMemo(() => getUserSession(), []);
  const [payments, setPayments] = useState(() => createInitialPayments());

  useEffect(() => {
    if (!user && navigate) {
      navigate("/login");
    }
  }, [navigate, user]);

  const handleLogout = () => {
    clearUserSession();

    if (navigate) {
      navigate("/");
    }
  };

  const handlePayment = (paymentId) => {
    const paidDate = new Date().toISOString().split("T")[0];

    setPayments((currentPayments) =>
      markPaymentAsPaid(currentPayments, paymentId, paidDate),
    );
  };

  const summary = useMemo(() => getPaymentSummary(payments), [payments]);

  return {
    user,
    payments,
    summary,
    handleLogout,
    handlePayment,
  };
};
