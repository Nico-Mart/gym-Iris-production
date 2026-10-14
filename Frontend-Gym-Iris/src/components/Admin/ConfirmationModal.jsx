import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

export function ConfirmationModal({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-600 max-w-lg w-full rounded-lg">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-[#A020F0]" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <p className="text-gray-300 text-sm">{description}</p>
        </div>

        <div className="p-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={onCancel}
            className="border-gray-500 text-gray-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </Button>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-[#BFFF00] hover:bg-[#a8e600] text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
