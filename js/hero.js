// Animasi fluid gradient + ripple di hero
document.addEventListener("DOMContentLoaded", function () {
  const heroShell = document.querySelector(".hero-shell");
  const canvas = document.getElementById("heroCanvas");
  if (!heroShell || !canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  const blobs = [];
  const ripples = [];
  let lastTime = 0;
  let lastRippleTime = 0;

  function resize() {
    const rect = heroShell.getBoundingClientRect();
    width = rect.width;
    height = rect.height || 600;

    dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initBlobs() {
    blobs.length = 0;
    const baseR = Math.max(width, height);
    blobs.push(
      {
        baseX: width * 0.25,
        baseY: height * 0.3,
        radius: baseR * 0.35,
        speed: 0.10,
        offset: 0
      },
      {
        baseX: width * 0.8,
        baseY: height * 0.4,
        radius: baseR * 0.32,
        speed: 0.16,
        offset: 2
      },
      {
        baseX: width * 0.5,
        baseY: height * 0.95,
        radius: baseR * 0.4,
        speed: 0.09,
        offset: 4
      }
    );
  }

  function addRipple(x, y) {
    const now = performance.now();
    if (now - lastRippleTime < 120) return; // ripple lebih jarang
    lastRippleTime = now;

    ripples.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(width, height) * 0.22,
      alpha: 0.35
    });

    if (ripples.length > 20) {
      ripples.splice(0, ripples.length - 20);
    }
  }

  heroShell.addEventListener("mousemove", (e) => {
    const rect = heroShell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addRipple(x, y);
  });

  window.addEventListener("resize", () => {
    resize();
    initBlobs();
  });

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    // Base background (mostly black)
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Moving orange blobs (subtle flow)
    blobs.forEach((blob, index) => {
      const t = timestamp / 1000;
      const wobbleX = Math.sin(t * blob.speed + blob.offset) * (blob.radius * 0.10);
      const wobbleY = Math.cos(t * blob.speed * 0.8 + blob.offset) * (blob.radius * 0.10);

      const x = blob.baseX + wobbleX;
      const y = blob.baseY + wobbleY;
      const r = blob.radius;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      const colorCore =
        index === 0
          ? "rgba(252, 159, 21, 0.55)"
          : index === 1
          ? "rgba(232, 119, 21, 0.45)"
          : "rgba(252, 159, 21, 0.35)";

      grad.addColorStop(0, colorCore);
      grad.addColorStop(0.4, "rgba(252, 159, 21, 0.18)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ripples (mouse drops, very soft)
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      const grow = ripple.maxRadius * 0.012;
      ripple.radius += grow * (dt * 60);
      ripple.alpha -= 0.06 * (dt * 60);

      if (ripple.radius >= ripple.maxRadius || ripple.alpha <= 0) {
        ripples.splice(i, 1);
        continue;
      }

      const grad = ctx.createRadialGradient(
        ripple.x,
        ripple.y,
        ripple.radius * 0.15,
        ripple.x,
        ripple.y,
        ripple.radius
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${ripple.alpha * 0.7})`);
      grad.addColorStop(0.35, `rgba(252, 159, 21, ${ripple.alpha * 0.9})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  // Initial setup & start
  resize();
  initBlobs();
  requestAnimationFrame(animate);
});
