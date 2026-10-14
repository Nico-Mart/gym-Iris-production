import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AdminGuard({ children }) {
  const [authenticated, setAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("gym_iris_token")),
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await api.validateAdmin(password);
    if (result.isValid) {
      // `api.validateAdmin` stores the token in localStorage when successful.
      setAuthenticated(Boolean(localStorage.getItem("gym_iris_token")));
      setError("");
    } else {
      setError("Contraseña incorrecta.");
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (authenticated) return children;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-white text-2xl font-bold">
              Gym <span className="text-lime-500">Iris</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className={`bg-gray-900 rounded-lg p-8 border border-gray-800 transition-all ${
            shake ? "animate-shake border-red-500" : ""
          }`}
          style={shake ? { animation: "shake 0.4s ease" } : {}}
        >
          {/* Shield icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-lime-500/10 rounded-full p-4 border border-lime-500/30">
              <ShieldAlert className="h-10 w-10 text-lime-500" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            Zona Restringida
          </h2>
          <p className="text-gray-400 text-center mb-6">
            Acceso exclusivo para administradores
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="admin-password" className="text-white">
                Contraseña de Administrador
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  className="pl-10 pr-10 bg-black border-gray-700 text-white placeholder:text-gray-600 focus:border-lime-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-md px-4 py-2 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-lime-500 hover:bg-lime-400 text-black font-semibold py-2 transition-colors"
            >
              Ingresar al Panel
            </Button>

            <div className="text-center">
              <Link
                to="/"
                className="text-gray-500 hover:text-lime-500 text-sm transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
