import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dumbbell,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  LogOut,
  Edit,
  PersonStanding,
  Settings,
  AlertCircle,
  DollarSign,
  CreditCard,
  MoreVertical,
  RotateCcw,
  PauseCircle,
} from "lucide-react";
import { api } from "../../services/api.js";
import { clearAuthSession } from "../../services/session/userSessionService";
const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK_DATA || "false").toLowerCase() ===
  "true";
import * as mock from "../../mock/users.js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CustomerCard } from "../Admin/CustomerCard";
import { FloatingActionButton } from "../Admin/FloatingActionButton";
import { ConfirmationModal } from "../Admin/ConfirmationModal";
import logo from "../../assets/images/Logo.jpg";

const getCurrentMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getCurrentDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const extractLocalPhoneDigits = (phone = "") => {
  const numericPhone = phone.replace(/\D/g, "");
  if (numericPhone.startsWith("54") && numericPhone.length > 10) {
    return numericPhone.slice(2, 12);
  }
  return numericPhone.slice(0, 10);
};

const formatLocalPhone = (digits = "") => {
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

const formatPhoneInput = (phone = "") => {
  const numericPhone = phone.replace(/\D/g, "");
  const hasCountryCode =
    phone.trim().startsWith("+54") ||
    (numericPhone.startsWith("54") && numericPhone.length > 10);
  const localDigits = extractLocalPhoneDigits(phone);
  const formattedLocalPhone = formatLocalPhone(localDigits);

  if (hasCountryCode) {
    return formattedLocalPhone ? `+54 ${formattedLocalPhone}` : "+54";
  }

  return formattedLocalPhone;
};

const hasValidLocalPhone = (phone = "") =>
  extractLocalPhoneDigits(phone).length === 10;

const getErrorMessage = (error) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "";
  return String(error);
};

const isDuplicateEmailError = (error) => {
  const message = getErrorMessage(error).toLowerCase();
  const mentionsEmail =
    message.includes("email") ||
    message.includes("e-mail") ||
    message.includes("correo");
  const mentionsDuplicate =
    message.includes("exists") ||
    message.includes("already") ||
    message.includes("duplicate") ||
    message.includes("duplicado") ||
    message.includes("repetido") ||
    message.includes("registrado");
  return mentionsEmail && mentionsDuplicate;
};

const getMonthlyPriceByActivity = (activity, prices) =>
  activity === "Musculación" ? prices.musculacion : prices.pilates;

export function Admin() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalCount, setServerTotalCount] = useState(0);
  const [priceIds, setPriceIds] = useState({
    musculacion: null,
    pilates: null,
  });
  // Flag para indicar que los precios están siendo cargados
  const [isPricesLoading, setIsPricesLoading] = useState(true);
  // Pagination state (must be declared before any useEffect that uses it)
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 12;

  /**
   * Enriquece los pagos de un miembro con el precio oficial de la membresía
   * y calcula el status real comparando `moneyPaid` contra ese precio.
   *
   * Reglas:
   *   moneyPaid <= 0            → "pending"
   *   0 < moneyPaid < fullPrice → "partial"
   *   moneyPaid >= fullPrice    → "paid"
   */
  const enrichPayments = (member, pricesMap) => {
    const fullPrice = getMonthlyPriceByActivity(member.activity, pricesMap);

    const deriveStatus = (moneyPaid) => {
      if (moneyPaid <= 0) return "pending";
      if (moneyPaid < fullPrice) return "partial";
      return "paid";
    };

    return {
      ...member,
      payments: (member.payments ?? []).map((p) => ({
        ...p,
        amount: fullPrice,
        paidAmount: p.moneyPaid,
        status: deriveStatus(p.moneyPaid),
      })),
    };
  };

  const refreshMember = async (memberId, pricesMap) => {
    try {
      const updated = await api.getUserById(memberId);
      const enriched = enrichPayments(updated, pricesMap ?? prices);
      setMembers((prev) =>
        prev.map((m) => (m.id === enriched.id ? enriched : m)),
      );
    } catch {
      toast.error("Error al actualizar los datos del cliente");
    }
  };

  useEffect(() => {
    // Load prices and first page
    setIsPricesLoading(true);
    Promise.all([api.getPrices(), api.getUsers(currentPage, membersPerPage)])
      .then(([pricesData, usersPage]) => {
        const musculacionEntry = pricesData.find(
          (p) => p.type === "Musculacion",
        );
        const pilatesEntry = pricesData.find((p) => p.type === "Pilates");

        const loadedPrices = {
          musculacion: musculacionEntry?.price ?? 38000,
          pilates: pilatesEntry?.price ?? 42000,
        };

        setPrices(loadedPrices);
        setPriceIds({
          musculacion: musculacionEntry?.id ?? null,
          pilates: pilatesEntry?.id ?? null,
        });

        const users = usersPage.items ?? [];
        const enriched = (Array.isArray(users) ? users : []).map((u) =>
          enrichPayments(u, loadedPrices),
        );
        setMembers(enriched);
        setServerTotalPages(usersPage.totalPages ?? 1);
        setServerTotalCount(
          usersPage.totalCount ?? usersPage.items?.length ?? users.length,
        );
      })
      .catch(() => {
        toast.error(
          "Error al cargar los datos. Verifica que el servidor esté activo.",
        );
      })
      .finally(() => {
        setLoadingMembers(false);
        setIsPricesLoading(false);
      });
  }, []);

  // Refetch when page changes — siempre obtener precios actualizados
  useEffect(() => {
    setLoadingMembers(true);
    setIsPricesLoading(true);
    Promise.all([api.getPrices(), api.getUsers(currentPage, membersPerPage)])
      .then(([pricesData, usersPage]) => {
        const musculacionEntry = pricesData.find(
          (p) => p.type === "Musculacion",
        );
        const pilatesEntry = pricesData.find((p) => p.type === "Pilates");

        const loadedPrices = {
          musculacion: musculacionEntry?.price ?? 38000,
          pilates: pilatesEntry?.price ?? 42000,
        };

        setPrices(loadedPrices);
        setPriceIds({
          musculacion: musculacionEntry?.id ?? null,
          pilates: pilatesEntry?.id ?? null,
        });

        const users = usersPage.items ?? [];
        const enriched = (Array.isArray(users) ? users : []).map((u) =>
          enrichPayments(u, loadedPrices),
        );
        setMembers(enriched);
        setServerTotalPages(usersPage.totalPages ?? 1);
        setServerTotalCount(
          usersPage.totalCount ?? usersPage.items?.length ?? users.length,
        );
      })
      .catch(() => {
        toast.error("Error al cargar la página de miembros");
      })
      .finally(() => {
        setLoadingMembers(false);
        setIsPricesLoading(false);
      });
  }, [currentPage]);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);
  // Inicializar a 0 para no depender de valores hardcodeados al arrancar
  const [prices, setPrices] = useState({ musculacion: 0, pilates: 0 });
  const [activeFilter, setActiveFilter] = useState("todos");
  const [openDesktopMenuId, setOpenDesktopMenuId] = useState(null);
  // ─── Estados de carga para prevenir race conditions ─────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [showPriceConfig, setShowPriceConfig] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    memberId: "",
    memberName: "",
  });
  const [editMember, setEditMember] = useState({ show: false, member: null });
  const [partialPayment, setPartialPayment] = useState({
    show: false,
    memberId: "",
    monthlyAmount: 0,
  });
  const [partialAmount, setPartialAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState({
    show: false,
    memberId: "",
  });
  const [advanceMonths, setAdvanceMonths] = useState("1");
  const [paymentConfirm, setPaymentConfirm] = useState({
    show: false,
    memberId: "",
    memberName: "",
    amount: 0,
  });
  const [advanceBlockedAlert, setAdvanceBlockedAlert] = useState({
    show: false,
    memberName: "",
  });

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const currentMonth = getCurrentMonthKey();

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/admin";
  };
  const handleSelectActivity = (activity) => setSelectedActivity(activity);

  const handleAddMember = async () => {
    if (!selectedActivity) {
      setShowActivitySelector(true);
      toast.warning("Seleccioná una actividad antes de agregar el cliente");
      return;
    }
    if (!newMember.name || !newMember.email || !newMember.phone) {
      toast.error("Por favor completá todos los campos");
      return;
    }
    if (!EMAIL_REGEX.test(newMember.email)) {
      toast.error(
        "El email no tiene un formato válido (ej: nombre@dominio.com)",
      );
      return;
    }
    if (!hasValidLocalPhone(newMember.phone)) {
      toast.error("El teléfono debe tener 10 dígitos (sin contar el +54)");
      return;
    }
    setIsSubmitting(true);
    const monthlyPrice = getMonthlyPriceByActivity(selectedActivity, prices);
    try {
      const created = await api.createUser({
        name: newMember.name,
        email: newMember.email,
        phone: formatPhoneInput(newMember.phone),
        activity: selectedActivity,
      });
      const memberWithPayment = {
        ...created,
        payments: [
          { month: currentMonth, status: "pending", amount: monthlyPrice },
        ],
      };
      setMembers((prev) => [memberWithPayment, ...prev]);
      setNewMember({ name: "", email: "", phone: "" });
      setSelectedActivity(null);
      setShowActivitySelector(false);
      toast.success("Cliente agregado correctamente");
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        toast.error("Ese email ya está registrado. Usá otro distinto.");
      } else {
        toast.error("Error al guardar el cliente");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = (id, name) =>
    setDeleteConfirm({ show: true, memberId: id, memberName: name });

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.deleteUser(deleteConfirm.memberId);
      setMembers(members.filter((m) => m.id !== deleteConfirm.memberId));
      toast.success(`Se eliminó con éxito a ${deleteConfirm.memberName}`);
    } catch {
      toast.error("Error al eliminar el cliente");
    } finally {
      setDeleteConfirm({ show: false, memberId: "", memberName: "" });
      setIsSubmitting(false);
    }
  };

  const handleRegisterPayment = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    const currentPayment = member?.payments?.find(
      (p) => p.month === currentMonth,
    );
    if (!currentPayment || currentPayment.status === "paid") return;
    const pendingAmount =
      (currentPayment?.amount ?? 0) - (currentPayment?.paidAmount || 0);
    setPaymentConfirm({
      show: true,
      memberId,
      memberName: member?.name ?? "Cliente",
      amount: Math.max(pendingAmount, 0),
    });
  };

  const handleConfirmRegisterPayment = async () => {
    const member = members.find((m) => m.id === paymentConfirm.memberId);
    const currentPayment = member?.payments?.find(
      (p) => p.month === currentMonth,
    );
    const fullPrice = getMonthlyPriceByActivity(member?.activity, prices);

    setIsSubmitting(true);
    try {
      if (currentPayment?._backendId) {
        await api.updatePayment(currentPayment._backendId, {
          userId: Number(paymentConfirm.memberId),
          activity: member.activity,
          amount: fullPrice,
          monthKey: currentMonth,
        });
      } else {
        await api.registerPayment(
          Number(paymentConfirm.memberId),
          currentMonth,
          fullPrice,
          member?.activity,
        );
      }

      toast.success("Pago registrado");
      await refreshMember(paymentConfirm.memberId);
    } catch {
      toast.error("Error al registrar el pago");
    } finally {
      setPaymentConfirm({
        show: false,
        memberId: "",
        memberName: "",
        amount: 0,
      });
      setIsSubmitting(false);
    }
  };

  const handleUndoLastPayment = async (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const paidPayments = (member?.payments ?? []).filter(
      (p) => Number(p?.paidAmount ?? 0) > 0,
    );

    const futurePaidPayments = paidPayments
      .filter((p) => p.month > currentMonth)
      .sort((a, b) => b.month.localeCompare(a.month));

    const currentMonthPayment = paidPayments.find(
      (p) => p.month === currentMonth,
    );
    const targetPayment = futurePaidPayments[0] ?? currentMonthPayment;
    if (!targetPayment) return;

    const isFutureMonth = targetPayment.month > currentMonth;

    setIsSubmitting(true);
    try {
      if (targetPayment._backendId) {
        await api.deletePayment(targetPayment._backendId);
      }

      setMembers(
        members.map((m) => {
          if (m.id !== memberId) return m;
          return {
            ...m,
            payments: isFutureMonth
              ? (m.payments ?? []).filter(
                  (p) => p.month !== targetPayment.month,
                )
              : (m.payments ?? []).map((p) => {
                  if (p.month !== targetPayment.month) return p;
                  return {
                    ...p,
                    status: "pending",
                    paidAmount: undefined,
                    paidDate: undefined,
                    _backendId: undefined,
                  };
                }),
          };
        }),
      );

      toast.info(
        isFutureMonth
          ? `Pago adelantado de ${targetPayment.month} eliminado`
          : `Pago de ${targetPayment.month} revertido a pendiente`,
      );
      await refreshMember(memberId);
    } catch {
      toast.error("Error al anular el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPartialPayment = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    const currentPayment = member?.payments?.find(
      (p) => p.month === currentMonth,
    );
    // Siempre calcular el restante sobre el PRECIO COMPLETO de la membresía,
    // no sobre payment.amount (que podría ser un pago parcial previo del backend).
    const fullPrice = getMonthlyPriceByActivity(member.activity, prices);
    const remainingAmount = fullPrice - (currentPayment?.paidAmount || 0);
    setPartialPayment({
      show: true,
      memberId,
      monthlyAmount: Math.max(remainingAmount, 0),
    });
    setPartialAmount("");
  };

  const handleConfirmPartialPayment = async () => {
    const amount = parseFloat(partialAmount);
    const member = members.find((m) => m.id === partialPayment.memberId);
    const currentPayment = member?.payments?.find(
      (p) => p.month === currentMonth,
    );

    setIsSubmitting(true);
    try {
      const totalPaid = (currentPayment?.paidAmount || 0) + amount;

      if (currentPayment?._backendId) {
        await api.updatePayment(currentPayment._backendId, {
          userId: Number(partialPayment.memberId),
          activity: member.activity,
          amount: totalPaid,
          monthKey: currentMonth,
        });
      } else {
        await api.registerPayment(
          Number(partialPayment.memberId),
          currentMonth,
          totalPaid,
          member?.activity,
        );
      }

      toast.success("Pago parcial registrado");
      await refreshMember(partialPayment.memberId);
    } catch {
      toast.error("Error al registrar el pago parcial");
    } finally {
      setPartialPayment({ show: false, memberId: "", monthlyAmount: 0 });
      setPartialAmount("");
      setIsSubmitting(false);
    }
  };

  const handleOpenAdvancePayment = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const currentPayment = member?.payments?.find(
      (p) => p.month === currentMonth,
    );

    if (!currentPayment || currentPayment.status !== "paid") {
      setAdvanceBlockedAlert({
        show: true,
        memberName: member?.name ?? "Cliente",
      });
      return;
    }

    setAdvancePayment({ show: true, memberId });
    setAdvanceMonths("1");
  };

  const handleConfirmAdvancePayment = async () => {
    const months = Math.min(3, Math.max(1, parseInt(advanceMonths) || 1));
    if (months < 1) return;
    const member = members.find((m) => m.id === advancePayment.memberId);
    if (!member) return;

    const monthlyPrice =
      member.activity === "Musculación" ? prices.musculacion : prices.pilates;
    const now = new Date();
    const baseYear = now.getFullYear();
    const baseMonth = now.getMonth();

    setIsSubmitting(true);
    try {
      const newPayments = [...(member.payments ?? [])];

      for (let i = 1; i <= months; i++) {
        const totalMonths = baseMonth + i;
        const futureYear = baseYear + Math.floor(totalMonths / 12);
        const futureMonthIndex = totalMonths % 12;
        const futureMonth = `${futureYear}-${String(futureMonthIndex + 1).padStart(2, "0")}`;

        if (!newPayments.find((p) => p.month === futureMonth)) {
          await api.registerPayment(
            Number(advancePayment.memberId),
            futureMonth,
            monthlyPrice,
            member.activity,
          );
          newPayments.push({
            month: futureMonth,
            status: "paid",
            amount: monthlyPrice,
            paidAmount: monthlyPrice,
            paidDate: getCurrentDateKey(),
          });
        }
      }

      setMembers(
        members.map((m) => {
          if (m.id !== advancePayment.memberId) return m;
          return {
            ...m,
            payments: newPayments.sort((a, b) =>
              b.month.localeCompare(a.month),
            ),
          };
        }),
      );

      toast.success("Pago adelantado registrado");
      await refreshMember(advancePayment.memberId);
    } catch {
      toast.error("Error al registrar el pago adelantado");
    } finally {
      setAdvancePayment({ show: false, memberId: "" });
      setAdvanceMonths("1");
      setIsSubmitting(false);
    }
  };

  const handleToggleSuspend = async (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    const nowSuspending = !member.suspended;
    setIsSubmitting(true);
    try {
      await api.updateUser(memberId, {
        name: member.name,
        email: member.email,
        phone: member.phone,
        activity: member.activity,
        suspended: nowSuspending,
      });
      setMembers(
        members.map((m) => {
          if (m.id !== memberId) return m;
          return { ...m, suspended: nowSuspending };
        }),
      );
      toast.info(
        nowSuspending
          ? `${member.name} fue suspendido`
          : `${member.name} fue reactivado`,
      );
      await refreshMember(memberId);
    } catch {
      toast.error("Error al cambiar el estado del miembro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditMember = (member) =>
    setEditMember({
      show: true,
      member: { ...member, phone: formatPhoneInput(member?.phone ?? "") },
    });

  const handleSaveEditMember = async () => {
    if (!editMember.member) return;
    if (
      !editMember.member?.name?.trim() ||
      !editMember.member?.email?.trim() ||
      !editMember.member?.phone?.trim()
    ) {
      toast.error("Completá nombre, email y teléfono antes de guardar");
      return;
    }
    if (!EMAIL_REGEX.test(editMember.member?.email ?? "")) {
      toast.error(
        "El email no tiene un formato válido (ej: nombre@dominio.com)",
      );
      return;
    }
    if (!hasValidLocalPhone(editMember.member?.phone ?? "")) {
      toast.error("El teléfono debe tener 10 dígitos (sin contar el +54)");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.updateUser(editMember.member.id, {
        name: editMember.member.name,
        email: editMember.member.email,
        phone: editMember.member.phone,
        activity: editMember.member.activity,
        suspended: editMember.member.suspended,
      });
      const local = members.find((m) => m.id === editMember.member.id);
      setMembers(
        members.map((m) =>
          m.id === editMember.member.id
            ? { ...updated, payments: local?.payments ?? [] }
            : m,
        ),
      );
      setEditMember({ show: false, member: null });
      toast.success(`Se modificó con éxito a ${editMember.member.name}`);
      await refreshMember(editMember.member.id);
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        toast.error("Ese email ya está registrado. Usá otro distinto.");
      } else {
        toast.error("Error al guardar los cambios");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePrices = async () => {
    setIsSubmitting(true);
    try {
      const updates = [];
      if (priceIds.musculacion != null)
        updates.push(api.updatePrice(priceIds.musculacion, prices.musculacion));
      if (priceIds.pilates != null)
        updates.push(api.updatePrice(priceIds.pilates, prices.pilates));

      await Promise.all(updates);
      toast.success("Precios actualizados");
    } catch {
      toast.error("Error al guardar los precios");
    } finally {
      setShowPriceConfig(false);
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (memberId) =>
    setExpandedMember(expandedMember === memberId ? null : memberId);

  const normalizedSearchQuery = searchQuery.toLowerCase();

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member?.name ?? "").toLowerCase().includes(normalizedSearchQuery) ||
      (member?.email ?? "").toLowerCase().includes(normalizedSearchQuery);
    if (!matchesSearch) return false;

    const currentPayment = (member?.payments ?? []).find(
      (p) => p.month === currentMonth,
    );

    switch (activeFilter) {
      case "suspendidos":
        return member.suspended === true;
      case "deudores":
        return !member.suspended && currentPayment?.status === "pending";
      case "parciales":
        return !member.suspended && currentPayment?.status === "partial";
      case "aldia":
        return !member.suspended && currentPayment?.status === "paid";
      default:
        return member?.suspended !== true;
    }
  });

  const totalPages = Math.max(1, serverTotalPages);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMembers = filteredMembers; // server already paged

  // Compute global stats. If running with mock data, compute against the
  // full mock dataset so cards reflect totals for the whole DB. Otherwise
  // fall back to page-local calculations (server should ideally provide
  // aggregate endpoints for accurate global stats).
  let activeMembers = members.filter((m) => m?.suspended !== true);
  let suspendedCount = members.filter((m) => m.suspended).length;

  // Use the server-provided totalCount for the global 'Total' stat so it
  // reflects the entire DB and not just the current page slice.
  const totalMembers = serverTotalCount;

  let paidThisMonth = 0;
  let pendingThisMonth = 0;
  let partialThisMonth = 0;
  let totalRevenue = 0;

  if (USE_MOCK) {
    const all = mock.getAllForFrontend();
    const allActive = all.filter((m) => m?.suspended !== true);
    suspendedCount = all.filter((m) => m.suspended).length;

    paidThisMonth = allActive.filter(
      (m) =>
        (m.payments ?? []).find((p) => p.month === currentMonth)?.status ===
        "paid",
    ).length;

    pendingThisMonth = allActive.filter(
      (m) =>
        (m.payments ?? []).find((p) => p.month === currentMonth)?.status ===
        "pending",
    ).length;

    partialThisMonth = allActive.filter(
      (m) =>
        (m.payments ?? []).find((p) => p.month === currentMonth)?.status ===
        "partial",
    ).length;

    totalRevenue = allActive.reduce((total, member) => {
      const p = (member.payments ?? []).find((p) => p.month === currentMonth);
      return total + (p?.paidAmount || 0);
    }, 0);
  } else {
    paidThisMonth = activeMembers.filter(
      (m) =>
        (m.payments ?? []).find((p) => p.month === currentMonth)?.status ===
        "paid",
    ).length;

    pendingThisMonth = activeMembers.filter(
      (m) =>
        (m.payments ?? []).find((p) => p.month === currentMonth)?.status ===
        "pending",
    ).length;

    partialThisMonth = activeMembers.filter(
      (m) =>
        (m.payments ?? []).find((p) => p.month === currentMonth)?.status ===
        "partial",
    ).length;

    totalRevenue = activeMembers.reduce((total, member) => {
      const p = (member.payments ?? []).find((p) => p.month === currentMonth);
      return total + (p?.paidAmount || 0);
    }, 0);
  }

  const partialAmount_value = parseFloat(partialAmount) || 0;
  const remainingBalance = partialPayment.monthlyAmount - partialAmount_value;
  const isPartialValid =
    partialAmount_value > 0 &&
    partialAmount_value <= partialPayment.monthlyAmount;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="backdrop-blur-md bg-black/90 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo y Nombre */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="Gym Iris Logo"
                className="h-8 w-8 rounded-full object-cover border border-gray-700"
              />
              <span className="text-white text-lg sm:text-xl font-bold tracking-tight">
                Gym <span className="text-[#A020F0]">Iris</span>
              </span>
            </Link>

            {/* Botones de Navegación del Header (Responsive para Celular y PC) */}
            <div className="flex items-center gap-3">
              {/* Botón de Turnos Pilates */}
              <Link
                to="/admin/pilates"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#7C3AED]/45 border border-[#7C3AED]/30 text-[#EBD9FF] text-sm font-semibold transition-all duration-200 hover:bg-[#7C3AED]/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                title="Gestionar Turnos Pilates"
                aria-label="Turnos Pilates"
              >
                <PersonStanding className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Turnos Pilates</span>
              </Link>

              {/* Botón de Modificar Precios */}
              <button
                onClick={() => setShowPriceConfig(true)}
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-lime-700 border border-lime-600 text-white text-sm font-medium transition-all duration-200 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500/30"
                title="Modificar Precios"
                aria-label="Modificar Precios"
              >
                <DollarSign className="h-5 w-5" />
                <span className="hidden sm:inline">Modificar Precios</span>
              </button>

              {/* Botón Cerrar Sesión (rojo) */}
              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 border border-red-700 text-white text-sm font-semibold transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Card className="bg-gray-900 border border-gray-700">
              <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                  Total
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {totalMembers}
                </div>
                {suspendedCount > 0 && (
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    +{suspendedCount} suspendido{suspendedCount > 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border border-gray-700">
              <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                  Al Día
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-lime-400">
                  {paidThisMonth}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border border-gray-700">
              <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                  Parcial
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                  {partialThisMonth}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border border-gray-700">
              <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                  Deudores
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400">
                  {pendingThisMonth}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border border-lime-500/40 col-span-2 lg:col-span-4">
              <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                  Recaudación
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-lime-400 flex flex-col sm:flex-row sm:items-baseline gap-1 leading-tight min-w-0">
                  <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 shrink-0" />
                  <span className="break-words">
                    {totalRevenue.toLocaleString("es-AR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters — incluye "Suspendidos" */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-800 overflow-x-auto">
            {[
              { key: "todos", label: "Todos", active: "bg-white text-black" },
              {
                key: "deudores",
                label: "Deudores",
                active: "bg-red-500 text-white",
              },
              {
                key: "parciales",
                label: "Parciales",
                active: "bg-orange-500 text-white",
              },
              {
                key: "aldia",
                label: "Al Día",
                active: "bg-lime-400 text-black",
              },
              {
                key: "suspendidos",
                label: "Suspendidos",
                active: "bg-gray-400 text-black",
              },
            ].map(({ key, label, active }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveFilter(key);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === key
                    ? active
                    : "bg-transparent text-gray-400 hover:text-white border border-gray-700"
                }`}
              >
                {label}
                {key === "suspendidos" && suspendedCount > 0 && (
                  <span className="ml-1.5 bg-gray-600 text-gray-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {suspendedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + Add */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onFocus={() => {
                  if (activeFilter !== "todos") {
                    setActiveFilter("todos");
                    setCurrentPage(1);
                  }
                }}
                onChange={(e) => {
                  if (activeFilter !== "todos") setActiveFilter("todos");
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 sm:pl-10 py-2 text-xs sm:text-sm bg-gray-800 border-2 border-gray-600 text-white focus:border-[#A020F0] placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={() => setShowActivitySelector(true)}
              className="hidden md:inline-flex bg-[#A020F0] hover:bg-[#8b1acc] text-white px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              Agregar cliente
            </Button>
          </div>

          {/* Pagination controls */}
          <div className="w-full flex justify-center my-2">
            <nav
              className="inline-flex items-center gap-2"
              aria-label="Pagination"
            >
              <button
                className="px-3 py-1 rounded bg-gray-800 text-sm text-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded text-sm ${p === currentPage ? "bg-[#A020F0] text-white" : "bg-gray-800 text-gray-200"}`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className="px-3 py-1 rounded bg-gray-800 text-sm text-gray-200 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Siguiente
              </button>
            </nav>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMembers || isPricesLoading ? (
              <Card className="bg-gray-900 border border-gray-800 col-span-full">
                <CardContent className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RotateCcw className="h-8 w-8 text-gray-400 animate-spin" />
                    <div className="text-sm text-gray-300">
                      Cargando datos...
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredMembers.length === 0 ? (
              <Card className="bg-gray-900 border border-gray-800 col-span-full">
                <CardContent className="py-12 text-center text-sm text-gray-500">
                  No se encontraron miembros
                </CardContent>
              </Card>
            ) : (
              paginatedMembers.map((member) => {
                const currentMonthPayment = (member?.payments ?? []).find(
                  (p) => p.month === currentMonth,
                );
                const paymentHistory = (member?.payments ?? [])
                  .filter((payment) => payment.month !== currentMonth)
                  .sort((a, b) => b.month.localeCompare(a.month));
                const isPending = currentMonthPayment?.status === "pending";
                const isPartial = currentMonthPayment?.status === "partial";
                const isPaid = currentMonthPayment?.status === "paid";
                const isSuspended = member.suspended === true;
                const isExpanded = expandedMember === member.id;

                const pendingPayments = (member?.payments ?? []).filter(
                  (p) => p.status === "pending",
                ).length;
                const isCriticalDebtor = isPending && pendingPayments >= 2;
                const hasAnyPaidPayment = (member?.payments ?? []).some(
                  (p) => p.paidDate,
                );

                const desktopBorder = isSuspended
                  ? "border-gray-600"
                  : isCriticalDebtor
                    ? "border-red-500"
                    : isPending
                      ? "border-orange-500/70"
                      : isPartial
                        ? "border-orange-400/60"
                        : isPaid
                          ? "border-lime-500/40"
                          : "border-gray-700";

                const desktopBg = isSuspended
                  ? "bg-gray-800/30"
                  : isCriticalDebtor
                    ? "bg-red-950/30"
                    : isPending
                      ? "bg-orange-950/20"
                      : isPartial
                        ? "bg-orange-950/15"
                        : isPaid
                          ? "bg-lime-950/15"
                          : "bg-gray-900";

                const statusBadgeClass = isSuspended
                  ? "bg-gray-600/30 text-gray-400 border border-gray-500/50"
                  : isCriticalDebtor
                    ? "bg-red-500/20 text-red-400 border border-red-500/50"
                    : isPending
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/40"
                      : isPartial
                        ? "bg-orange-500/15 text-orange-400 border border-orange-500/40"
                        : "bg-lime-500/15 text-lime-400 border border-lime-500/40";

                const statusLabel = isSuspended
                  ? "Suspendido"
                  : isCriticalDebtor
                    ? "Deudor crítico"
                    : isPending
                      ? "Pendiente"
                      : isPartial
                        ? `Parcial · $${currentMonthPayment?.paidAmount?.toLocaleString()} / $${currentMonthPayment?.amount?.toLocaleString()}`
                        : "Al día";

                return (
                  <div key={member.id}>
                    {/* Mobile */}
                    <CustomerCard
                      member={member}
                      currentMonthPayment={currentMonthPayment}
                      isExpanded={isExpanded}
                      onToggleExpand={toggleExpand}
                      onOpenAdvancePayment={handleOpenAdvancePayment}
                      onOpenEditMember={handleOpenEditMember}
                      onDeleteMember={handleDeleteMember}
                      onRegisterPayment={handleRegisterPayment}
                      onOpenPartialPayment={handleOpenPartialPayment}
                      onUndoLastPayment={handleUndoLastPayment}
                      onToggleSuspend={handleToggleSuspend}
                    />

                    {/* Desktop */}
                    <Card
                      className={`hidden md:flex flex-col border-2 ${desktopBorder} ${desktopBg} transition-all`}
                    >
                      <CardContent className="p-5 flex flex-col gap-4 h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="h-11 w-11 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-lg leading-none">
                                {(member?.name?.charAt(0) ?? "?").toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-white leading-tight break-words">
                                {member?.name ?? "Sin nombre"}
                              </h3>
                              {isSuspended ? (
                                <Badge className="mt-1 bg-gray-600 text-gray-200 border border-gray-500 px-2.5 py-0.5 text-xs font-bold rounded-full w-fit">
                                  <PauseCircle className="h-3 w-3 mr-1" />
                                  Suspendido
                                </Badge>
                              ) : member.activity === "Musculación" ? (
                                <Badge className="mt-1 bg-[#BFFF00] text-black px-2.5 py-0.5 text-xs font-bold border border-[#BFFF00]/70 rounded-full w-fit">
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  Musculación
                                </Badge>
                              ) : (
                                <Badge className="mt-1 bg-[#A020F0] text-white px-2.5 py-0.5 text-xs font-bold border border-[#A020F0]/70 rounded-full w-fit">
                                  <PersonStanding className="h-3 w-3 mr-1" />
                                  Pilates
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Menú ⋮ */}
                          <div className="relative flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setOpenDesktopMenuId((prev) =>
                                  prev === member.id ? null : member.id,
                                )
                              }
                              className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {openDesktopMenuId === member.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setOpenDesktopMenuId(null)}
                                />
                                <div className="absolute right-0 top-10 z-40 w-52 rounded-xl border border-gray-700 bg-gray-950 shadow-2xl overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenEditMember(member);
                                      setOpenDesktopMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors border-b border-gray-800"
                                  >
                                    <Edit className="h-4 w-4 text-orange-400" />
                                    Modificar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleToggleSuspend(member.id);
                                      setOpenDesktopMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors border-b border-gray-800"
                                  >
                                    <PauseCircle className="h-4 w-4" />
                                    {isSuspended ? "Reactivar" : "Suspender"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenAdvancePayment(member.id);
                                      setOpenDesktopMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors border-b border-gray-800"
                                  >
                                    <CreditCard className="h-4 w-4 text-[#A020F0]" />
                                    Pago adelantado
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteMember(
                                        member.id,
                                        member?.name ?? "Cliente",
                                      );
                                      setOpenDesktopMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors border-b border-gray-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </button>
                                  {hasAnyPaidPayment && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUndoLastPayment(member.id);
                                        setOpenDesktopMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                      Anular último pago
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Contacto */}
                        <div className="space-y-1 border-t border-white/5 pt-2">
                          <p className="text-sm text-gray-300">
                            <span className="text-gray-500">Email: </span>
                            {member?.email ?? "-"}
                          </p>
                          <p className="text-sm text-gray-300">
                            <span className="text-gray-500">Tel: </span>
                            {member?.phone ?? "-"}
                          </p>
                        </div>

                        {/* Estado del mes */}
                        {currentMonthPayment && (
                          <div className="mt-auto border-t border-white/5 pt-3 space-y-3">
                            <button
                              type="button"
                              onClick={() => toggleExpand(member.id)}
                              className="flex items-center justify-between w-full rounded-lg border border-gray-700 bg-black/30 px-3 py-2 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                            >
                              <span className="text-sm font-medium capitalize">
                                {new Date(
                                  `${currentMonthPayment?.month ?? currentMonth}-01`,
                                ).toLocaleDateString("es-AR", {
                                  month: "long",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>

                            <Badge
                              className={`w-fit text-sm px-3 py-1 font-semibold ${statusBadgeClass}`}
                            >
                              {isSuspended ? (
                                <PauseCircle className="h-3.5 w-3.5 mr-1.5" />
                              ) : isPaid ? (
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              ) : isCriticalDebtor || isPending ? (
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              {statusLabel}
                            </Badge>

                            {isExpanded && (
                              <div className="space-y-2 pt-2 border-t border-white/5">
                                <h4 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                  Historial de pagos
                                </h4>
                                {paymentHistory.map((payment) => (
                                  <div
                                    key={payment.month}
                                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                                      payment.status === "paid"
                                        ? "bg-lime-950/30 border-lime-500/20"
                                        : payment.status === "partial"
                                          ? "bg-orange-950/30 border-orange-500/20"
                                          : "bg-red-950/30 border-red-500/20"
                                    }`}
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-white capitalize">
                                        {new Date(
                                          `${payment?.month ?? currentMonth}-01`,
                                        ).toLocaleDateString("es-AR", {
                                          month: "long",
                                          year: "numeric",
                                          timeZone: "UTC",
                                        })}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {payment.status === "partial"
                                          ? `$${Number(payment?.paidAmount ?? 0).toLocaleString("es-AR")} de $${Number(payment?.amount ?? 0).toLocaleString("es-AR")}`
                                          : `$${Number(payment?.amount ?? 0).toLocaleString("es-AR")}`}
                                      </p>
                                      {payment.paidDate && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          Pagado el{" "}
                                          {new Date(
                                            payment.paidDate,
                                          ).toLocaleDateString("es-AR")}
                                        </p>
                                      )}
                                    </div>
                                    <Badge
                                      className={`text-xs px-2.5 py-1 font-semibold shrink-0 ${
                                        payment.status === "paid"
                                          ? "bg-lime-500/10 text-lime-400 border border-lime-500/30"
                                          : payment.status === "partial"
                                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                                      }`}
                                    >
                                      {payment.status === "paid"
                                        ? "Pagado"
                                        : payment.status === "partial"
                                          ? "Parcial"
                                          : "Pendiente"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Botones de pago — no se muestran si está suspendido */}
                            {!isSuspended && (isPending || isPartial) && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleRegisterPayment(member.id)
                                  }
                                  className="w-full bg-[#BFFF00] hover:bg-[#a8e600] text-black font-bold py-2.5 text-sm"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                  Registrar pago completo
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleOpenPartialPayment(member.id)
                                  }
                                  className="w-full border-2 border-orange-500/50 text-orange-400 bg-transparent hover:bg-orange-500/10 font-semibold py-2.5 text-sm"
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                  Registrar pago parcial
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginación */}
          {filteredMembers.length > membersPerPage && (
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap md:mb-0 mb-20">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="border-gray-600 text-gray-200 disabled:opacity-40"
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      page === safeCurrentPage
                        ? "bg-[#A020F0] hover:bg-[#8b1acc] text-white"
                        : "bg-gray-900 border border-gray-600 text-gray-200 hover:bg-gray-800"
                    }
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={safeCurrentPage === totalPages}
                className="border-gray-600 text-gray-200 disabled:opacity-40"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>

        <FloatingActionButton onClick={() => setShowActivitySelector(true)} />

        {/* Sidebar */}
        <div className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="sticky top-20 lg:top-24">
            <Card className="bg-gray-900 border border-gray-600">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <CreditCard className="h-3 sm:h-4 w-3 sm:w-4" />
                  Tarifa Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="pb-3 border-b border-gray-700">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Dumbbell className="h-3 sm:h-4 w-3 sm:w-4 text-[#BFFF00]" />
                    <span className="text-[10px] sm:text-xs text-gray-200">
                      Musculación
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    ${prices.musculacion.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    por mes
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <PersonStanding className="h-3 sm:h-4 w-3 sm:w-4 text-[#A020F0]" />
                    <span className="text-[10px] sm:text-xs text-gray-200">
                      Pilates
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    ${prices.pilates.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    por mes
                  </div>
                </div>
                <Button
                  onClick={() => setShowPriceConfig(true)}
                  variant="outline"
                  className="w-full text-[10px] sm:text-xs bg-cyan-600 hover:bg-cyan-700 border-cyan-500 text-white mt-3 sm:mt-4 px-2 sm:px-3 py-1 sm:py-2"
                >
                  <DollarSign className="h-3 w-3 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Modificar precios</span>
                  <span className="sm:hidden">Actualizar</span>
                </Button>
                <div className="mt-3">
                  <Link to="/admin/pilates">
                    <Button
                      variant="ghost"
                      className="w-full text-[#EBD9FF] rounded-xl bg-[#7C3AED]/45 border border-[#A020F0]/20 hover:bg-[#A020F0]/10 px-2 py-1 rounded-md"
                    >
                      <PersonStanding className="h-3 w-3 mr-2" />
                      <span className="text-sm ">Ir a Turnos Pilates</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal: Activity Selector */}
      {showActivitySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="absolute inset-0 backdrop-blur-xl bg-black/90"
            onClick={() => setShowActivitySelector(false)}
          />
          <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto pr-1">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                <Card
                  className={`bg-gray-900 border-2 cursor-pointer transition-all ${selectedActivity === "Musculación" ? "border-[#BFFF00]" : "border-[#BFFF00]/50 hover:border-[#BFFF00]"}`}
                  onClick={() => handleSelectActivity("Musculación")}
                >
                  <CardContent className="p-5 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-[#BFFF00]/15 rounded-full mb-4 sm:mb-6 border-2 border-[#BFFF00]/40">
                      <Dumbbell className="h-7 w-7 sm:h-10 sm:w-10 text-[#BFFF00]" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
                      Gym + Clases
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                      Entrenamiento con pesas
                    </p>
                    <div className="text-xl sm:text-2xl font-bold text-[#BFFF00]">
                      ${prices.musculacion.toLocaleString()}/mes
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`bg-gray-900 border-2 cursor-pointer transition-all ${selectedActivity === "Pilates" ? "border-[#A020F0]" : "border-[#A020F0]/50 hover:border-[#A020F0]"}`}
                  onClick={() => handleSelectActivity("Pilates")}
                >
                  <CardContent className="p-5 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-[#A020F0]/20 rounded-full mb-4 sm:mb-6 border-2 border-[#A020F0]/40">
                      <PersonStanding className="h-7 w-7 sm:h-10 sm:w-10 text-[#A020F0]" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
                      Pilates
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                      Fortalecimiento y flexibilidad
                    </p>
                    <div className="text-xl sm:text-2xl font-bold text-[#A020F0]">
                      ${prices.pilates.toLocaleString()}/mes
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card
                className={`bg-gray-900 border ${selectedActivity === "Musculación" ? "border-[#BFFF00]/50" : "border-[#A020F0]/50"}`}
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-white">
                    Nuevo Miembro
                    {selectedActivity ? ` — ${selectedActivity}` : ""}
                  </CardTitle>
                  {selectedActivity ? (
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-semibold w-fit ${selectedActivity === "Musculación" ? "border-[#BFFF00]/40 bg-[#BFFF00]/10 text-[#BFFF00]" : "border-[#A020F0]/40 bg-[#A020F0]/10 text-[#A020F0]"}`}
                    >
                      {selectedActivity === "Musculación" ? (
                        <Dumbbell className="h-4 w-4" />
                      ) : (
                        <PersonStanding className="h-4 w-4" />
                      )}
                      Actividad: {selectedActivity}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-800/70 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-300 w-fit">
                      Seleccioná una actividad
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <Input
                    autoFocus
                    type="text"
                    placeholder="Nombre"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    className="text-sm py-2.5 bg-gray-900 border-2 border-[#A020F0]/70 text-white placeholder:text-gray-400 focus:border-[#A020F0]"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    className="text-sm py-2.5 bg-gray-900 border-2 border-[#A020F0]/70 text-white placeholder:text-gray-400 focus:border-[#A020F0]"
                  />
                  <Input
                    type="tel"
                    placeholder="Teléfono"
                    value={newMember.phone}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        phone: formatPhoneInput(e.target.value),
                      })
                    }
                    className="text-sm py-2.5 bg-gray-900 border-2 border-[#A020F0]/70 text-white placeholder:text-gray-400 focus:border-[#A020F0]"
                  />
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-1">
                    <Button
                      onClick={handleAddMember}
                      className="w-full sm:w-auto bg-[#BFFF00] hover:bg-[#a8e600] text-black font-semibold"
                    >
                      Agregar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowActivitySelector(false);
                        setSelectedActivity(null);
                        setNewMember({ name: "", email: "", phone: "" });
                      }}
                      variant="outline"
                      className="w-full sm:w-auto border-red-500/40 text-red-400 hover:bg-red-500/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Price Config */}
      {showPriceConfig && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border border-gray-600 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurar Precios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#BFFF00] text-black px-2 py-1 rounded-md font-semibold">
                    <Dumbbell className="h-3.5 w-3.5" />
                    Musculación
                  </span>
                  <span className="text-gray-400">($/mes)</span>
                </label>
                <Input
                  type="number"
                  value={prices.musculacion}
                  onChange={(e) =>
                    setPrices({
                      ...prices,
                      musculacion: parseInt(e.target.value) || 0,
                    })
                  }
                  className="text-lg py-3 bg-gray-900 border-2 border-[#A020F0]/70 text-white focus:border-[#A020F0]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#A020F0] text-white px-2 py-1 rounded-md font-semibold">
                    <PersonStanding className="h-3.5 w-3.5" />
                    Pilates
                  </span>
                  <span className="text-gray-400">($/mes)</span>
                </label>
                <Input
                  type="number"
                  value={prices.pilates}
                  onChange={(e) =>
                    setPrices({
                      ...prices,
                      pilates: parseInt(e.target.value) || 0,
                    })
                  }
                  className="text-lg py-3 bg-gray-900 border-2 border-[#A020F0]/70 text-white focus:border-[#A020F0]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSavePrices}
                  disabled={isSubmitting}
                  className="bg-[#A020F0] hover:bg-[#8b1acc] text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Procesando..." : "Guardar"}
                </Button>
                <Button
                  onClick={() => setShowPriceConfig(false)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Confirm Payment */}
      <ConfirmationModal
        open={paymentConfirm.show}
        title="Confirmar pago"
        description={`¿Registrar pago de $${paymentConfirm.amount.toLocaleString("es-AR")} para ${paymentConfirm.memberName}?`}
        confirmText={isSubmitting ? "Procesando..." : "Registrar pago"}
        isLoading={isSubmitting}
        onCancel={() =>
          !isSubmitting &&
          setPaymentConfirm({
            show: false,
            memberId: "",
            memberName: "",
            amount: 0,
          })
        }
        onConfirm={handleConfirmRegisterPayment}
      />

      {/* Modal: Advance Blocked */}
      {advanceBlockedAlert.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border border-orange-500/50 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-14 w-14 text-orange-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                No se puede adelantar
              </h2>
              <p className="text-gray-400 mb-6">
                <span className="text-white font-semibold">
                  {advanceBlockedAlert.memberName}
                </span>{" "}
                tiene el mes actual pendiente o parcial. Primero debe estar al
                día para registrar un pago adelantado.
              </p>
              <Button
                onClick={() =>
                  setAdvanceBlockedAlert({ show: false, memberName: "" })
                }
                className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              >
                Entendido
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Edit Member */}
      {editMember.show && editMember.member && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border border-gray-600 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Modificar Miembro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Nombre", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Teléfono", key: "phone", type: "tel" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-2">
                    {label}
                  </label>
                  <Input
                    type={type}
                    value={editMember.member?.[key] ?? ""}
                    onChange={(e) => {
                      const value =
                        key === "phone"
                          ? formatPhoneInput(e.target.value)
                          : e.target.value;
                      setEditMember({
                        ...editMember,
                        member: { ...editMember.member, [key]: value },
                      });
                    }}
                    className="text-sm py-2 bg-gray-900 border-2 border-[#A020F0]/70 text-white focus:border-[#A020F0]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Actividad
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() =>
                      setEditMember({
                        ...editMember,
                        member: {
                          ...editMember.member,
                          activity: "Musculación",
                        },
                      })
                    }
                    className={`text-sm ${editMember.member.activity === "Musculación" ? "bg-[#BFFF00] text-black" : "bg-black text-gray-400 border border-gray-700"}`}
                  >
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Musculación
                  </Button>
                  <Button
                    onClick={() =>
                      setEditMember({
                        ...editMember,
                        member: { ...editMember.member, activity: "Pilates" },
                      })
                    }
                    className={`text-sm ${editMember.member.activity === "Pilates" ? "bg-[#A020F0] text-white" : "bg-black text-gray-400 border border-gray-700"}`}
                  >
                    <PersonStanding className="h-4 w-4 mr-2" />
                    Pilates
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveEditMember}
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Procesando..." : "Guardar"}
                </Button>
                <Button
                  onClick={() => setEditMember({ show: false, member: null })}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Partial Payment */}
      {partialPayment.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border border-gray-600 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">Pago Parcial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 p-4 rounded-xl border border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Saldo restante:</p>
                <p className="text-3xl font-bold text-white">
                  ${partialPayment.monthlyAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Monto a pagar ahora
                </label>
                <Input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0"
                  className="text-2xl py-4 bg-gray-900 border-2 border-[#A020F0]/70 text-white text-center focus:border-[#A020F0]"
                />
              </div>
              {partialAmount && (
                <div
                  className={`p-4 rounded-xl border ${remainingBalance > 0 ? "bg-red-950/30 border-red-500/30" : "bg-lime-950/30 border-lime-500/30"}`}
                >
                  <p className="text-sm mb-1 text-gray-400">
                    Quedará pendiente:
                  </p>
                  <p
                    className={`text-2xl font-bold ${remainingBalance > 0 ? "text-red-400" : "text-lime-400"}`}
                  >
                    ${Math.max(0, remainingBalance).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleConfirmPartialPayment}
                  disabled={!isPartialValid || isSubmitting}
                  className={`flex-1 ${
                    isPartialValid && !isSubmitting
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isSubmitting ? "Procesando..." : "Confirmar"}
                </Button>
                <Button
                  onClick={() => {
                    setPartialPayment({
                      show: false,
                      memberId: "",
                      monthlyAmount: 0,
                    });
                    setPartialAmount("");
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
              </div>
              {!isPartialValid && partialAmount && (
                <p className="text-sm text-red-400 text-center">
                  {partialAmount_value <= 0
                    ? "Debe ser mayor a $0"
                    : "No puede exceder el saldo"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {advancePayment.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border border-gray-600 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Pago Adelantado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ¿Cuántos meses adelanta?
                </label>
                <select
                  value={advanceMonths}
                  onChange={(e) => setAdvanceMonths(e.target.value)}
                  className="w-full text-2xl py-4 bg-gray-900 border-2 border-[#A020F0]/70 text-white text-center focus:border-[#A020F0] rounded-md"
                >
                  <option value="1">1 mes</option>
                  <option value="2">2 meses</option>
                  <option value="3">3 meses</option>
                </select>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Máximo 3 meses adelantados
                </p>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Total a pagar:</p>
                <p className="text-2xl font-bold text-lime-400">
                  $
                  {(
                    parseInt(advanceMonths) *
                    (members.find((m) => m.id === advancePayment.memberId)
                      ?.activity === "Musculación"
                      ? prices.musculacion
                      : prices.pilates)
                  ).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleConfirmAdvancePayment}
                  disabled={parseInt(advanceMonths) < 1 || isSubmitting}
                  className="bg-[#A020F0] hover:bg-[#8b1acc] text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar"}
                </Button>
                <Button
                  onClick={() =>
                    setAdvancePayment({ show: false, memberId: "" })
                  }
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Delete Confirm */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border border-red-500/50 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Confirmar eliminación
              </h2>
              <p className="text-gray-400 mb-6">
                ¿Eliminar a{" "}
                <span className="text-white font-semibold">
                  {deleteConfirm.memberName}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Procesando..." : "Eliminar"}
                </Button>
                <Button
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      memberId: "",
                      memberName: "",
                    })
                  }
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}
