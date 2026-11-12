(() => {
  const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (!icon) return;

  const update = () => {
    const href = document.documentElement.classList.contains("dark")
      ? "/favicon-dark.svg?v=5b99010"
      : "/favicon.svg?v=5b99010";
    if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
  };

  update();
  new MutationObserver(update).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
