import { useState } from "react";
import {
  Dumbbell,
  PersonStanding,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Edit,
  Trash2,
  CreditCard,
  RotateCcw,
  PauseCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function CustomerCard({
  member,
  currentMonthPayment,
  isExpanded,
  onToggleExpand,
  onOpenAdvancePayment,
  onOpenEditMember,
  onDeleteMember,
  onRegisterPayment,
  onOpenPartialPayment,
  onUndoLastPayment,
  onToggleSuspend,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const memberPayments = member?.payments ?? [];
  const memberName = member?.name ?? "Sin nombre";
  const memberId = member?.id;

  const isSuspended = member?.suspended === true;

  const isPending = currentMonthPayment?.status === "pending";
  const isPartial = currentMonthPayment?.status === "partial";
  const isPaid = currentMonthPayment?.status === "paid";

  const pendingPayments = memberPayments.filter(
    (p) => p.status === "pending",
  ).length;
  const isCriticalDebtor = isPending && pendingPayments >= 2;

  const hasAnyPaidPayment = memberPayments.some((p) => p.paidDate);

  const cardBorder = isSuspended
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

  const cardBg = isSuspended
    ? "bg-gray-800/30"
    : isCriticalDebtor
      ? "bg-red-950/40"
      : isPending
        ? "bg-orange-950/30"
        : isPartial
          ? "bg-orange-950/20"
          : isPaid
            ? "bg-lime-950/20"
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
          ? `Parcial · $${Number(currentMonthPayment?.paidAmount ?? 0).toLocaleString("es-AR")} / $${Number(currentMonthPayment?.amount ?? 0).toLocaleString("es-AR")}`
          : "Al día";

  const currentMonthKey = currentMonthPayment?.month;
  const paymentHistory = memberPayments
    .filter((payment) => payment.month !== currentMonthKey)
    .sort((a, b) => b.month.localeCompare(a.month));

  return (
    <article
      className={`md:hidden w-full rounded-2xl border-2 ${cardBorder} ${cardBg} transition-all shadow-md`}
      style={{ overflow: "visible" }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-11 w-11 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-600">
              <span className="text-white font-bold text-lg leading-none">
                {(memberName?.charAt(0) ?? "?").toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-lg font-bold text-white leading-tight break-words">
                {memberName}
              </h3>

              {isSuspended ? (
                <Badge className="mt-1 bg-gray-600 text-gray-200 border border-gray-500 px-2.5 py-0.5 text-xs font-bold rounded-full w-fit">
                  <PauseCircle className="h-3 w-3 mr-1" />
                  Suspendido
                </Badge>
              ) : member.activity === "Musculación" ? (
                <Badge className="mt-1 bg-[#BFFF00] text-black border border-[#BFFF00]/70 px-2.5 py-0.5 text-xs font-bold rounded-full w-fit">
                  <Dumbbell className="h-3 w-3 mr-1" />
                  Musculación
                </Badge>
              ) : (
                <Badge className="mt-1 bg-[#A020F0] text-white border border-[#A020F0]/70 px-2.5 py-0.5 text-xs font-bold rounded-full w-fit">
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
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-40 w-52 rounded-xl border border-gray-700 bg-gray-950 shadow-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenEditMember(member);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-base text-gray-200 hover:bg-gray-800 transition-colors border-b border-gray-800"
                  >
                    <Edit className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    Modificar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (memberId) onToggleSuspend(memberId);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-base text-yellow-400 hover:bg-yellow-500/10 transition-colors border-b border-gray-800"
                  >
                    <PauseCircle className="h-4 w-4 flex-shrink-0" />
                    {isSuspended ? "Reactivar" : "Suspender"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (memberId) onOpenAdvancePayment(memberId);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-base text-gray-200 hover:bg-gray-800 transition-colors border-b border-gray-800"
                  >
                    <CreditCard className="h-4 w-4 text-[#A020F0] flex-shrink-0" />
                    Pago adelantado
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (memberId) onDeleteMember(memberId, memberName);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-base text-red-400 hover:bg-red-500/10 transition-colors border-b border-gray-800"
                  >
                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                    Eliminar
                  </button>

                  {hasAnyPaidPayment && (
                    <button
                      type="button"
                      onClick={() => {
                        if (memberId) onUndoLastPayment(memberId);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-base text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 flex-shrink-0" />
                      Anular último pago
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-1 border-t border-white/5 pt-3">
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
          <div className="border-t border-white/5 pt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                if (memberId) onToggleExpand(memberId);
              }}
              className="flex items-center justify-between w-full rounded-lg border border-gray-700 bg-black/30 px-3 py-2 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
              <span className="text-sm font-medium capitalize">
                {new Date(
                  `${currentMonthPayment?.month ?? "1970-01"}-01`,
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

            {/* Historial expandible */}
            {isExpanded && paymentHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Historial de pagos
                </p>
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
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white capitalize">
                        {new Date(
                          `${payment?.month ?? "1970-01"}-01`,
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
          </div>
        )}

        {!isSuspended && (isPending || isPartial) && (
          <div className="flex flex-col gap-2 pt-1">
            {isPending && (
              <Button
                onClick={() => {
                  if (memberId) onRegisterPayment(memberId);
                }}
                className="w-full h-12 bg-[#BFFF00] hover:bg-[#a8e600] text-black font-bold text-base rounded-xl"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Registrar pago completo
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (memberId) onOpenPartialPayment(memberId);
              }}
              className="w-full h-12 border-2 border-orange-500/50 text-orange-400 bg-black/20 hover:bg-orange-500/10 font-semibold text-base rounded-xl"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Registrar pago parcial
            </Button>
          </div>
        )}

        {!isSuspended && isPaid && (
          <div className="flex items-center justify-center gap-2 py-2 text-lime-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-base font-semibold">Pago al día</span>
          </div>
        )}

        {isSuspended && (
          <div className="flex items-center justify-center gap-2 py-2 text-gray-500">
            <PauseCircle className="h-5 w-5" />
            <span className="text-base font-semibold">Miembro inactivo</span>
          </div>
        )}
      </div>
    </article>
  );
}
