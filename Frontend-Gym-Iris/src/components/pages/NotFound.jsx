import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">404</h1>
        <p className="text-gray-300 text-lg">
          Parece que te equivocaste de URL.
        </p>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
          <img
            src="https://media.giphy.com/media/6uGhT1O4sxpi8/giphy.gif"
            alt="John Travolta confundido"
            className="w-full h-auto"
          />
        </div>

        <Link to="/">
          <Button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
