import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuthForm } from "../../hooks/useAuthForm";

export function Login() {
  const navigate = useNavigate();
  const {
    isLogin,
    email,
    password,
    name,
    setEmail,
    setPassword,
    setName,
    toggleMode,
    handleSubmit,
  } = useAuthForm({ navigate });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <Dumbbell className="h-10 w-10 text-lime-500" />
            <span className="text-white text-2xl font-bold">
              Gym <span className="text-lime-500">Iris</span>
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {isLogin ? "Bienvenido de nuevo" : "Únete a nuestra comunidad"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-white">
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-lime-500"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-lime-500 hover:text-lime-400"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold"
            >
              {isLogin ? "Iniciar Sesión" : "Registrarse"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                onClick={toggleMode}
                className="text-lime-500 hover:text-lime-400 font-semibold"
              >
                {isLogin ? "Regístrate" : "Inicia Sesión"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-white">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
