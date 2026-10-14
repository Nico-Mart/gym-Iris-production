import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { api } from "../../services/api.js";
import { toast } from "react-toastify";
import {
  PersonStanding,
  Calendar as CalendarIcon,
  GripVertical,
  X,
} from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
];
const MAX_CAPACITY = 4;

export function PilatesSchedule() {
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayMobile, setSelectedDayMobile] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserToAssign, setSelectedUserToAssign] = useState(null);
  const [modalDayIndex, setModalDayIndex] = useState(0);
  const [modalSlotIndex, setModalSlotIndex] = useState(0);
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(available.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleUsers = available.slice(startIndex, startIndex + PAGE_SIZE);

  // schedule: { dayIndex: { slotIndex: [user, ...] } }
  const [schedule, setSchedule] = useState(() => {
    const s = {};
    for (let d = 0; d < 5; d++) {
      s[d] = {};
      for (let t = 0; t < SLOTS.length; t++) s[d][t] = [];
    }
    return s;
  });

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        let pageNumber = 1;
        let allUsers = [];
        let totalPages = 1;

        do {
          const response = await api.getUsers(pageNumber, 50);
          const items = response.items ?? [];
          allUsers = [...allUsers, ...items];
          totalPages = response.totalPages ?? 1;
          pageNumber++;
        } while (pageNumber <= totalPages);

        const pilatesUsers = allUsers.filter(
          (u) =>
            (u.activity || "").toLowerCase().includes("pilates") &&
            !u.suspended,
        );

        try {
          const apiSchedule = await api.getPilatesSchedule();

          // build schedule structure
          const next = {};
          for (let d = 0; d < 5; d++) {
            next[d] = {};
            for (let s = 0; s < SLOTS.length; s++) next[d][s] = [];
          }

          const assignedDaysCount = {};

          Object.keys(apiSchedule || {}).forEach((dKey) => {
            const dayIdx = Number(dKey);
            const slotsObj = apiSchedule[dKey] || {};
            Object.keys(slotsObj).forEach((sKey) => {
              const slotIdx = Number(sKey);
              const usersArr = slotsObj[sKey] || [];
              next[dayIdx][slotIdx] = usersArr.map((uu) => {
                const id = uu.Id ?? uu.id ?? uu.Id;
                const name =
                  uu.FullName ?? uu.fullName ?? uu.Name ?? uu.name ?? "";
                assignedDaysCount[String(id)] =
                  assignedDaysCount[String(id)] || new Set();
                assignedDaysCount[String(id)].add(dayIdx);
                return { id: String(id), name };
              });
            });
          });

          const assignedCounts = {};
          Object.keys(assignedDaysCount).forEach((k) => {
            assignedCounts[k] = assignedDaysCount[k].size;
          });

          setSchedule(next);

          setAvailable(
            pilatesUsers.filter((u) => (assignedCounts[String(u.id)] || 0) < 2),
          );
        } catch (err) {
          setAvailable(pilatesUsers);
        }
      } catch (err) {
        toast.error("No se pudieron cargar los usuarios de Pilates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Keep pagination in range when available users change
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [available.length]);

  const onDragStart = (e, user) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(user));
  };

  const onAvailableClick = (user) => {
    setSelectedUserToAssign(user);
    setModalDayIndex(0);
    setModalSlotIndex(0);
    setShowAssignModal(true);
  };

  const validatePackageRules = (userId, targetDayIdx) => {
    const assignedDays = new Set();

    for (let d = 0; d < 5; d++) {
      for (let s = 0; s < SLOTS.length; s++) {
        const occupants = schedule[d][s] || [];
        if (occupants.some((u) => String(u.id) === String(userId))) {
          assignedDays.add(d);
        }
      }
    }

    if (assignedDays.has(targetDayIdx)) {
      return {
        valid: false,
        message: "El alumno ya tiene un turno asignado ese día.",
      };
    }

    // No permitir más de 2 días distintos por semana
    if (assignedDays.size >= 2) {
      return {
        valid: false,
        message: "El alumno ya tiene 2 días asignados esta semana.",
      };
    }

    return { valid: true };
  };

  const countUserDistinctDays = (sched, userId) => {
    const days = new Set();
    for (let d = 0; d < 5; d++) {
      for (let s = 0; s < SLOTS.length; s++) {
        const arr = (sched[d] && sched[d][s]) || [];
        if (arr.some((u) => String(u.id) === String(userId))) {
          days.add(d);
        }
      }
    }
    return days.size;
  };

  const assignUserToSlot = async (user, dayIdx, slotIdx) => {
    // Validar cupo del turno
    const occupants = schedule[dayIdx][slotIdx] || [];
    if (occupants.some((u) => String(u.id) === String(user.id))) {
      toast.info("El usuario ya está en este turno.");
      return false;
    }
    if (occupants.length >= MAX_CAPACITY) {
      toast.warning("¡Este turno ya está lleno (máximo 4 personas)!");
      return false;
    }

    const ruleCheck = validatePackageRules(user.id, dayIdx);
    if (!ruleCheck.valid) {
      toast.warning(ruleCheck.message);
      return false;
    }

    // Call backend to create assignment (will enforce rules)
    try {
      await api.assignPilatesSlot(Number(user.id), dayIdx, slotIdx);

      // update local schedule immutably
      setSchedule((prev) => {
        const next = JSON.parse(JSON.stringify(prev));

        // doble comprobación: si ya tiene turno ese día, abortar
        const alreadyInDay = Object.values(next[dayIdx]).some((arr) =>
          arr.some((u) => String(u.id) === String(user.id)),
        );
        if (alreadyInDay) {
          toast.warning(
            "No se puede asignar: el alumno ya tiene un turno ese día.",
          );
          return prev;
        }

        next[dayIdx][slotIdx].push(user);
        return next;
      });

      // Actualizar lista de disponibles: sólo remover cuando alcanza 2 días distintos
      const prevDistinct = countUserDistinctDays(schedule, user.id);
      const newDistinct = prevDistinct + 1;
      if (newDistinct >= 2) {
        setAvailable((cur) =>
          cur.filter((u) => String(u.id) !== String(user.id)),
        );
      }

      toast.success(`Asignado a ${DAYS[dayIdx]} (${SLOTS[slotIdx]})`);
      return true;
    } catch (err) {
      const msg = err?.message || String(err);
      toast.error(msg || "Error al asignar el turno");
      return false;
    }
  };

  const onDropToSlot = async (e, dayIdx, slotIdx) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(e.dataTransfer.getData("text/plain"));
      await assignUserToSlot(userData, dayIdx, slotIdx);
    } catch (error) {
      toast.error("Error al soltar el usuario en el turno");
    }
  };

  const onDragOver = (e) => e.preventDefault();

  const removeFromSlot = async (dayIdx, slotIdx, user) => {
    try {
      await api.removePilatesAssignment(Number(user.id), dayIdx, slotIdx);

      setSchedule((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        next[dayIdx][slotIdx] = next[dayIdx][slotIdx].filter(
          (u) => String(u.id) !== String(user.id),
        );

        const remainingDistinct = countUserDistinctDays(next, user.id);

        if (remainingDistinct < 2) {
          setAvailable((cur) => {
            if (!cur.some((u) => String(u.id) === String(user.id))) {
              toast.info(`${user.name} devuelto a disponibles`);
              return [user, ...cur];
            }
            return cur;
          });
        } else {
          toast.info(`${user.name} removido de este turno.`);
        }

        return next;
      });
    } catch (err) {
      const msg = err?.message || String(err);
      toast.error(msg || "Error al remover la asignación");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120811] to-[#1f0d1e] text-gray-200 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Superior */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-pink-300">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-100">
                Gestión de Turnos - Pilates
              </h1>
              <p className="text-xs sm:text-sm text-gray-300">
                Panel semanal (Máx 2 días distintos por semana — 1 turno por día
                | Máx 4 por turno)
              </p>
            </div>
          </div>
          <div>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-pink-200 bg-transparent border border-transparent hover:bg-white/5"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Columna Izquierda: Alumnos Disponibles */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border border-gray-700 sticky top-6 shadow-lg text-gray-200">
              <CardHeader className="pb-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-100">
                    <PersonStanding className="h-4 w-4 text-pink-300" />
                    <span>Alumnos Inscriptos</span>
                  </CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-900/20 text-pink-200 font-bold border border-pink-900/30">
                    {available.length}
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-gray-300">
                  Tocá un alumno (móvil) o arrastralo (PC) para asignarlo.
                </p>
              </CardHeader>
              <CardContent className="pt-4 max-h-[300px] lg:max-h-[calc(100vh-250px)] overflow-y-auto space-y-2 bg-gray-800">
                {loading ? (
                  <div className="py-8 text-center text-sm text-gray-500 animate-pulse">
                    Cargando alumnos...
                  </div>
                ) : available.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                    No hay alumnos libres.
                  </div>
                ) : (
                  visibleUsers.map((u) => (
                    <div
                      key={u.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, u)}
                      onClick={() => onAvailableClick(u)}
                      className="group flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-700 transition-all cursor-pointer active:cursor-grabbing shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-300 shrink-0" />
                        <span className="text-sm font-medium text-gray-100 truncate">
                          {u.name}
                        </span>
                      </div>
                      <span className="text-[10px] bg-pink-900/30 text-pink-200 border border-pink-800/30 px-1.5 py-0.5 rounded shrink-0">
                        Pilates
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="pt-3 border-t border-gray-700 flex items-center justify-between gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <div className="text-[12px] text-gray-300">
                  Página {page} de {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </Card>
          </div>

          {/* Columna Derecha: Grilla de Agenda (Responsive Inteligente) */}
          <div className="lg:col-span-3">
            {/* VISTA ESCRITORIO: Matriz completa de 5 columnas */}
            <div className="hidden lg:grid grid-cols-5 gap-3">
              {DAYS.map((day, dayIdx) => (
                <div key={day} className="space-y-3">
                  <div className="bg-gray-900 border border-gray-700 py-2.5 px-3 rounded-xl text-center font-bold text-sm text-pink-200 shadow-sm">
                    {day}
                  </div>
                  {SLOTS.map((slot, slotIdx) => {
                    const occupants = schedule[dayIdx][slotIdx] || [];
                    const isFull = occupants.length >= MAX_CAPACITY;
                    return (
                      <div
                        key={slot}
                        onDrop={(e) => onDropToSlot(e, dayIdx, slotIdx)}
                        onDragOver={onDragOver}
                        className={`flex flex-col justify-between p-3 min-h-[130px] rounded-2xl border transition-all ${isFull ? "bg-red-900/30 border-red-800 text-red-200" : "bg-gray-800 border border-gray-700 shadow-sm"}`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-700 text-xs">
                          <span className="font-semibold text-gray-300">
                            {slot}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isFull ? "bg-red-900/20 text-red-200 border border-red-800" : occupants.length > 0 ? "bg-pink-900/20 text-pink-200 border border-pink-800/30" : "bg-gray-900/20 text-gray-300 border border-gray-700"}`}
                          >
                            {occupants.length}/{MAX_CAPACITY}
                          </span>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          {occupants.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[11px] text-gray-400 border border-dashed border-gray-700 rounded-lg p-2 bg-gray-800">
                              Soltar aquí
                            </div>
                          ) : (
                            occupants.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center justify-between px-2.5 py-2.5 rounded-lg text-xs shadow-sm bg-gray-800 border border-violet-700 text-gray-200"
                              >
                                <span className="truncate font-medium pr-1 text-xs">
                                  {u.name}
                                </span>
                                <button
                                  onClick={() =>
                                    removeFromSlot(dayIdx, slotIdx, u)
                                  }
                                  className="text-gray-400 hover:text-red-400 p-1 rounded-md transition-colors"
                                  title={`Quitar ${u.name}`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* VISTA MÓVIL: Pestañas de días arriba y bloques verticales limpios */}
            <div className="block lg:hidden space-y-4">
              <div className="flex rounded-xl p-1 overflow-x-auto bg-transparent">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDayMobile(idx)}
                    className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg transition-all ${selectedDayMobile === idx ? "bg-pink-800 text-white shadow-sm" : "text-gray-300 bg-transparent hover:bg-gray-800/30"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {SLOTS.map((slot, slotIdx) => {
                  const occupants = schedule[selectedDayMobile][slotIdx] || [];
                  const isFull = occupants.length >= MAX_CAPACITY;
                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-2xl border transition-all ${isFull ? "border-red-800 bg-red-900/20 text-red-200" : "bg-gray-800 border border-gray-700 text-gray-200 shadow-sm"}`}
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                        <span className="text-sm font-bold text-gray-200">
                          {slot}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${isFull ? "bg-red-900/20 text-red-200 border border-red-800" : "bg-pink-900/20 text-pink-200 border border-pink-800/30"}`}
                        >
                          {occupants.length} / {MAX_CAPACITY} cupos
                        </span>
                      </div>

                      <div className="space-y-2">
                        {occupants.length === 0 ? (
                          <div className="text-xs text-center py-3 rounded-xl text-gray-400 border border-dashed border-gray-700 bg-gray-800">
                            Sin alumnos en este horario
                          </div>
                        ) : (
                          occupants.map((u) => (
                            <div
                              key={u.id}
                              className="flex items-center justify-between p-2.5 rounded-xl border bg-gray-900 border-gray-700 text-gray-200"
                            >
                              <span className="text-sm font-medium">
                                {u.name}
                              </span>
                              <button
                                onClick={() =>
                                  removeFromSlot(selectedDayMobile, slotIdx, u)
                                }
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <X className="h-3.5 w-3.5" /> Quitar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Asignación Táctil (Móvil y Clicks rápidos) */}
      {showAssignModal && selectedUserToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 bg-gray-900 border border-gray-800 text-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-base font-bold">Asignar Turno</h3>
                <p className="text-xs text-pink-200">
                  Alumno: {selectedUserToAssign.name}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block text-gray-300">
                  Seleccionar Día
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DAYS.map((d, idx) => (
                    <button
                      key={d}
                      onClick={() => setModalDayIndex(idx)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${modalDayIndex === idx ? "bg-pink-800 text-white border-pink-800" : "bg-transparent text-gray-300 border border-gray-700"}`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block text-gray-300">
                  Seleccionar Horario
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SLOTS.map((s, idx) => (
                    <button
                      key={s}
                      onClick={() => setModalSlotIndex(idx)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${modalSlotIndex === idx ? "bg-pink-800 text-white border-pink-800" : "bg-transparent text-gray-300 border border-gray-700"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAssignModal(false)}
                className="text-gray-300 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  const ok = await assignUserToSlot(
                    selectedUserToAssign,
                    modalDayIndex,
                    modalSlotIndex,
                  );
                  if (ok) setShowAssignModal(false);
                }}
                className="bg-pink-800 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded-xl"
              >
                Confirmar Asignación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PilatesSchedule;
