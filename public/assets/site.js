(() => {
  const root = document.documentElement;
  const btn = document.getElementById("theme-btn");
  const paint = () => {
    const dark = root.dataset.theme === "dark";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "Switch to day mode" : "Switch to night mode");
  };
  btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
    paint();
  });
  paint();
  // Every nav tab click (anything but "Turn on ads") makes the About page's red arrow one size bigger
  document.querySelectorAll(".nav-links a, .nav-name").forEach((a) => a.addEventListener("click", () => {
    try {
      if (localStorage.getItem("aboutMode") === "cooked") return;
      localStorage.setItem("arrowSteps", String(Math.min(+(localStorage.getItem("arrowSteps") || 0) + 1, 7)));
    } catch {}
  }));
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
