import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { useDashboardState } from "../../hooks/useDashboardState";

export function Dashboard() {
  const navigate = useNavigate();
  const { user, payments, summary, handleLogout, handlePayment } =
    useDashboardState({ navigate });

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-lime-500 text-black hover:bg-lime-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Pagado
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-500"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenido, <span className="text-lime-500">{user.name}</span>
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-4 md:mt-0 border-gray-700 text-white hover:bg-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Cuotas Pagadas
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-lime-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {summary.totalPaid}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                De {summary.totalPayments} cuotas totales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Cuotas Pendientes
              </CardTitle>
              <CreditCard className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {summary.totalPending}
              </div>
              <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Pagado
              </CardTitle>
              <DollarSign className="h-5 w-5 text-lime-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${summary.totalAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">En el historial</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Historial de Cuotas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Período</TableHead>
                    <TableHead className="text-gray-400">Monto</TableHead>
                    <TableHead className="text-gray-400">Vencimiento</TableHead>
                    <TableHead className="text-gray-400">
                      Fecha de Pago
                    </TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
                    <TableHead className="text-gray-400">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="border-gray-800 hover:bg-gray-800/50"
                    >
                      <TableCell className="text-white font-medium">
                        {payment.month}
                      </TableCell>
                      <TableCell className="text-white">
                        ${payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(payment.dueDate).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {payment.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString(
                              "es-AR",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.status !== "paid" && (
                          <Button
                            onClick={() => handlePayment(payment.id)}
                            size="sm"
                            className="bg-lime-500 hover:bg-lime-600 text-black"
                          >
                            Pagar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Plan Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-lime-500 mb-1">
                  Plan Mensual
                </h3>
                <p className="text-gray-400">
                  Acceso completo a todas las instalaciones y clases
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">$5,000</p>
                <p className="text-sm text-gray-400">por mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
