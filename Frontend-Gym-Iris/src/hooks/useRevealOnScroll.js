import { useEffect } from "react";

export const useRevealOnScroll = (
  selector = "[data-reveal]",
  threshold = 0.18,
) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [selector, threshold]);
};
