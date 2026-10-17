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
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
