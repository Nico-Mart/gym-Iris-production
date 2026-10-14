import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  clearHashFromLocation,
  getSectionScrollY,
  smoothScrollToY,
} from "../services/scroll/scrollService";

const SCROLL_TOP_SECTION = "inicio";
const LEGACY_TOP_SECTION = "nosotros";

export const useHomeNavigation = () => {
  const location = useLocation();

  const scrollToSection = useCallback((sectionId) => {
    const targetY = getSectionScrollY(sectionId);

    if (targetY === null) {
      return;
    }

    smoothScrollToY(targetY, 1450);
  }, []);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isReload = navigationEntry?.type === "reload";

    if (isReload && location.hash) {
      clearHashFromLocation(location.pathname);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const requestedSection = location.state?.scrollTo;

    if (requestedSection) {
      if (requestedSection === SCROLL_TOP_SECTION) {
        smoothScrollToY(0, 1300);
      } else {
        setTimeout(() => {
          scrollToSection(requestedSection);
        }, 80);
      }

      clearHashFromLocation(location.pathname);
      return;
    }

    if (location.hash) {
      const hashSection = location.hash.replace("#", "");

      if (
        hashSection === SCROLL_TOP_SECTION ||
        hashSection === LEGACY_TOP_SECTION
      ) {
        clearHashFromLocation(location.pathname);
        smoothScrollToY(0, 1300);
      }
    }
  }, [location, scrollToSection]);

  return { scrollToSection };
};
