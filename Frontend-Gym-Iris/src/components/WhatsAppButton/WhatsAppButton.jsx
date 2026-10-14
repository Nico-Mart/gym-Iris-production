import { useState } from "react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { TiPlusOutline } from "react-icons/ti";
import { FaInstagram } from "react-icons/fa6";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = (
    import.meta.env.VITE_WHATSAPP_NUMBER || "5491100000000"
  ).replace(/\D/g, "");
  const message = "¡Hola! Me gustaría consultar sobre Gym Iris";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const socialButtons = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      onClick: handleWhatsAppClick,
      className: "bg-lime-500 hover:bg-lime-600 text-black",
      icon: FaWhatsapp,
    },
    {
      id: "instagram",
      label: "Instagram",
      onClick: () =>
        window.open("https://www.instagram.com/gimnasioiris/", "_blank"),
      className: "bg-pink-500 hover:bg-pink-600 text-white",
      icon: FaInstagram,
    },
    {
      id: "facebook",
      label: "Facebook",
      onClick: () =>
        window.open(
          "https://www.facebook.com/gimnasio.iris?locale=es_LA",
          "_blank",
        ),
      className: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: FaFacebookF,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <span
        className={`rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg transition-all duration-300 ${
          isOpen
            ? "opacity-0 -translate-x-2 pointer-events-none"
            : "opacity-100 translate-x-0"
        }`}
      >
        Mirá nuestras redes
      </span>

      <div className="relative">
        {socialButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <button
              key={button.id}
              onClick={button.onClick}
              className={`absolute bottom-1 right-1 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${button.className} ${
                isOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              style={{
                transform: isOpen
                  ? `translateY(-${(index + 1) * 68}px)`
                  : "translateY(0)",
              }}
              aria-label={`Abrir ${button.label}`}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-16 h-16 bg-violet-500 hover:bg-violet-400 text-white rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label={isOpen ? "Cerrar redes sociales" : "Abrir redes sociales"}
        >
          <TiPlusOutline
            className={`h-8 w-8 transition-transform duration-300 ${
              isOpen ? "rotate-45" : "rotate-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
