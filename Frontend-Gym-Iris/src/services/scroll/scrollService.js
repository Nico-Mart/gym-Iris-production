const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const smoothScrollToY = (targetY, duration = 1400) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

export const getSectionScrollY = (sectionId, offset = 72) => {
  const targetElement = document.getElementById(sectionId);

  if (!targetElement) {
    return null;
  }

  return targetElement.getBoundingClientRect().top + window.scrollY - offset;
};

export const clearHashFromLocation = (pathname) => {
  window.history.replaceState(window.history.state, "", pathname);
};
