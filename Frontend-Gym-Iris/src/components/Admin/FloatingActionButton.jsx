import { Plus } from "lucide-react";
import { Button } from "../ui/button";

export function FloatingActionButton({ onClick, label = "Agregar cliente" }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#A020F0] hover:bg-[#8b1acc] text-white shadow-lg shadow-black/40 p-0"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
