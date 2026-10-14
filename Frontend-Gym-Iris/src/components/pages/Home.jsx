import { useState } from "react";
import { useHomeNavigation } from "../../hooks/useHomeNavigation";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";
import {
  Users,
  Clock,
  Award,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Send,
  Briefcase,
  CalendarDays,
  Dumbbell,
  Zap,
  Flower2,
  PersonStanding,
  Music2,
  MoreHorizontal,
  Play,
  Frown,
} from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { WhatsAppButton } from "../WhatsAppButton/WhatsAppButton";
import logo from "../../assets/images/Foto-owner.jpg";
import heroimg from "../../assets/images/heroback.png";
import yogaImg from "../../assets/images/yoga-img.png";
import pilatesImg from "../../assets/images/pilates-img.png";
import zumbaImg from "../../assets/images/zumba-img.png";
import funcionalImg from "../../assets/images/funcional-img.png";
import moreStuffImg from "../../assets/images/more-stuff-img.png";
import musculacionImg from "../../assets/images/musculacion-img.png";
import funcionalVideo from "../../assets/videos/funcional.mp4";
import funcional2 from "../../assets/videos/funcional2.mp4";
import moreStuffVideo from "../../assets/videos/more_stuf.mp4";
import pilatesVideo from "../../assets/videos/pilates.mp4";
import zumbaVideo from "../../assets/videos/zumba.mp4";

export function Home() {
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [activeCardTitle, setActiveCardTitle] = useState(null);
  const { scrollToSection } = useHomeNavigation();
  const isTouchDevice =
    typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
  const whatsappNumber = (
    import.meta.env.VITE_WHATSAPP_NUMBER || "5491100000000"
  ).replace(/\D/g, "");
  const careersEmail = import.meta.env.VITE_CAREERS_EMAIL || "rrhh@example.com";
  const contactEmail =
    import.meta.env.VITE_CONTACT_EMAIL || "contacto@example.com";

  useRevealOnScroll();

  const closeVideoModal = () => {
    setIsVideoModalVisible(false);

    setTimeout(() => {
      setIsVideoModalOpen(false);
      setSelectedVideoUrl(null);
    }, 320);
  };

  const handleClassCardClick = (title, videoUrl) => {
    if (isTouchDevice && activeCardTitle !== title) {
      setActiveCardTitle(title);
      return;
    }

    setSelectedVideoUrl(videoUrl || null);
    setIsVideoModalOpen(true);

    requestAnimationFrame(() => {
      setIsVideoModalVisible(true);
    });
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={heroimg}
            alt="Gym workout"
            className="w-full h-full object-cover opacity-65"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Tu <span className="text-lime-500">Transformación</span>{" "}
            <span className="text-violet-500">Empieza Aquí </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Gym Iris - Tu gimnasio de barrio con la mejor atención personalizada
            y los mejores precios
          </p>
          <div className="flex flex-col items-center space-y-4 mt-12">
            <button
              type="button"
              onClick={() => scrollToSection("about-us")}
              className="text-white hover:text-violet-500 transition-colors"
            >
              <div className="flex flex-col items-center space-y-2 animate-bounce">
                <span className="text-lg font-semibold">
                  Conoce más de nosotros
                </span>
                <div className="flex space-x-2">
                  <ChevronDown className="h-8 w-8" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div data-reveal="left" className="space-y-6">
              <p className="text-violet-500 font-semibold uppercase tracking-widest text-sm">
                About Us
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Somos <span className="text-lime-500">Gym Iris</span>,
                entrenamiento real con atención individualizada
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                En nuestro gimnasio priorizamos el acompañamiento cercano, la
                técnica correcta y un ambiente en el que te sientas motivado en
                cada clase. Combinamos experiencia, energía y compromiso para
                ayudarte a progresar a tu ritmo.
              </p>
            </div>

            <div data-reveal="right" style={{ "--reveal-delay": "120ms" }}>
              <div className="relative overflow-hidden rounded-2xl border border-gray-800">
                <ImageWithFallback
                  src={logo}
                  alt="Equipo de Gym Iris"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="beneficios" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            ¿Por Qué <span className="text-violet-500">Gym Iris</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-violet-500 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Entrenadores Certificados
              </h3>
              <p className="text-gray-400">
                Profesionales que te ayudarán a alcanzar tus objetivos
              </p>
            </div>

            <div className="text-center p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-violet-500 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Horarios</h3>
              <p className="text-gray-400">
                Lunes a Jueves: 7:30 a 11 hs y 15:30 a 20 hs <br />
                Viernes: 7:30 a 11 hs y 16 a 20 hs
              </p>
            </div>

            <div className="text-center p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-violet-500 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Precios Accesibles
              </h3>
              <p className="text-gray-400">
                Rutinas flexibles que se adaptan a ti
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Nuestras <span className="text-lime-500">Clases</span>
          </h2>
          <p className="text-center text-gray-400 mb-16">
            Encontrá la actividad que más se adapta a vos
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Dumbbell className="h-7 w-7" />,
                color: "lime",
                title: "Musculación",
                desc: "Entrenamiento con pesas y máquinas para ganar fuerza y masa muscular.",
                badge: "Libre",
                src: musculacionImg,
                videoUrl: funcionalVideo,
              },
              {
                icon: <Zap className="h-7 w-7" />,
                color: "violet",
                title: "Funcional",
                desc: "Circuitos de alta intensidad para mejorar resistencia y coordinación.",
                badge: "Grupal",
                src: funcionalImg,
                videoUrl: funcional2,
              },
              {
                icon: <Flower2 className="h-7 w-7" />,
                color: "lime",
                title: "Yoga",
                desc: "Flexibilidad, respiración y equilibrio entre mente y cuerpo.",
                badge: "Grupal",
                src: yogaImg,
              },
              {
                icon: <PersonStanding className="h-7 w-7" />,
                color: "violet",
                title: "Pilates",
                desc: "Fortalecé el core, mejorá tu postura y prevenís lesiones.",
                badge: "Grupal",
                src: pilatesImg,
                videoUrl: pilatesVideo,
              },
              {
                icon: <Music2 className="h-7 w-7" />,
                color: "lime",
                title: "Zumba",
                desc: "Bailá, quemá calorías y divertite en cada clase.",
                badge: "Grupal",
                src: zumbaImg,
                videoUrl: zumbaVideo,
              },
              {
                icon: <MoreHorizontal className="h-7 w-7" />,
                color: "violet",
                title: "Y mucho más",
                desc: "Aeróbics, clases especiales y nuevas actividades sumándose siempre.",
                badge: "Varios",
                src: moreStuffImg,
                videoUrl: moreStuffVideo,
              },
            ].map(({ icon, color, title, desc, badge, src, videoUrl }) => (
              <div
                key={title}
                onClick={() => handleClassCardClick(title, videoUrl)}
                onMouseLeave={() => setActiveCardTitle(null)}
                className={`bg-gray-950 rounded-2xl border border-gray-800 transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer ${
                  color === "lime"
                    ? "hover:border-lime-500"
                    : "hover:border-violet-500"
                }`}
              >
                <div className="relative overflow-hidden h-48">
                  <ImageWithFallback
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
                  <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${
                      color === "lime"
                        ? "bg-lime-500 text-black"
                        : "bg-violet-500 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                  <div
                    className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 group-hover:opacity-100 ${
                      activeCardTitle === title ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Play className="h-16 w-16 text-lime-400 drop-shadow-[0_0_16px_rgba(163,230,53,0.9)]" />
                    <span className="text-white/90 text-sm tracking-wide font-medium">
                      Ver demo
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        color === "lime"
                          ? "text-lime-500 bg-lime-500/10"
                          : "text-violet-400 bg-violet-500/10"
                      } rounded-lg p-2`}
                    >
                      {icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon Rental Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-lime-500/30">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjByb29tJTIwZW1wdHklMjBzcGFjZXxlbnwxfHx8fDE3NzQ3Mjc1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Salón Gym Iris"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="bg-lime-500/10 border border-lime-500/40 rounded-2xl p-6">
                    <CalendarDays className="h-14 w-14 text-lime-500" />
                  </div>
                  <span className="bg-lime-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Fines de semana
                  </span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Alquilá Nuestro <span className="text-lime-500">Salón</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-2">
                    Los sábados y domingos el salón está disponible para que lo
                    uses como quieras: cumpleaños, eventos deportivos,
                    reuniones, clases privadas y mucho más.
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Capacidad para grupos · Vestuarios incluidos · Baño
                    accesibles
                  </p>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      "¡Hola! Me interesa alquilar el salón de Gym Iris para el fin de semana. ¿Me podés dar más info?",
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button className="bg-lime-500 hover:bg-lime-400 text-black font-semibold text-base px-8 py-5">
                      Consultar disponibilidad
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Team Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl p-8 md:p-12 border border-violet-500/30">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-full mb-6">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Querés Formar Parte de Nuestro Equipo?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Buscamos profesionales apasionados por el fitness para unirse a
                nuestra comunidad de entrenadores
              </p>
              <a
                href={`mailto:${careersEmail}?subject=Postulación Instructor Gym Iris`}
              >
                <Button className="bg-violet-500 hover:bg-violet-600 text-white text-lg px-12 py-6">
                  Enviar CV
                </Button>
              </a>
              <p className="text-gray-400 mt-4">
                Envianos tu CV a{" "}
                <a
                  href={`mailto:${careersEmail}`}
                  className="text-violet-500 hover:text-violet-400"
                >
                  {careersEmail}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="contactanos" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            <span className="text-violet-500">Encuéntranos</span> Aquí
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Visítanos en nuestra ubicación
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Map */}
            <div className="w-full h-112 rounded-lg overflow-hidden border-2 border-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d703.946369075521!2d-60.699413354394245!3d-32.93642952533484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b653357a852135%3A0x5dd5f243f418315e!2sGimnasio%20Iris!5e0!3m2!1ses-419!2sar!4v1776180463555!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Gym Iris"
              ></iframe>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Dirección
                    </h3>
                    <p className="text-gray-400">
                      A. Zeno 761, S2008 Rosario, Santa Fe
                      <br />
                      Ciudad de Rosario
                      <br />
                      C2000 Santa Fe , Argentina
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Teléfono
                    </h3>
                    <p className="text-gray-400">+54 341 000-0000</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                    <p className="text-gray-400">
                      {contactEmail}
                      <br />
                      Responderemos a la brevedad
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-full mb-6">
            <Send className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Tenés una Consulta?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Estamos aquí para ayudarte. Mandanos un WhatsApp y te responderemos
            lo antes posible.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola! Quiero hacer una consulta sobre Gym Iris")}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button className="bg-violet-500 hover:bg-violet-600 text-white text-lg px-12 py-6">
              Enviar Consulta
            </Button>
          </a>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            isVideoModalVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeVideoModal}
        >
          <div
            className={`relative mx-4 max-w-[92vw] max-h-[88vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoModalVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedVideoUrl ? (
              <div className="relative">
                <video
                  src={selectedVideoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  className="block max-w-[92vw] max-h-[88vh] w-auto h-auto object-contain bg-black"
                />
              </div>
            ) : (
              <div className="w-[min(92vw,28rem)] h-[min(70vh,22rem)] flex flex-col items-center justify-center gap-4 px-6 text-center bg-gradient-to-b from-gray-950 to-black">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-violet-500/15 border border-violet-500/30">
                  <Frown className="h-10 w-10 text-violet-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    Ups, no hay video disponible
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Todavía no cargamos una demo para esta actividad.
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Cerrar video"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 Gym Iris. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
