const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const filterButtons = document.querySelectorAll(".filter-button");
const publicationCards = document.querySelectorAll(".publication-card");
const carouselImages = document.querySelectorAll(".carousel-image");
const carouselDots = document.querySelectorAll(".carousel-dot");
let activeSlide = 0;
let carouselTimer = null;

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    publicationCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.kind === filter;
      card.hidden = !matches;
    });
  });
});

function setActiveSlide(index) {
  activeSlide = (index + carouselImages.length) % carouselImages.length;

  carouselImages.forEach((image, imageIndex) => {
    image.classList.toggle("active", imageIndex === activeSlide);
  });

  carouselDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeSlide;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-pressed", String(isActive));
  });
}

function startCarousel() {
  if (prefersReducedMotion || carouselImages.length < 2) return;

  carouselTimer = window.setInterval(() => {
    setActiveSlide(activeSlide + 1);
  }, 5200);
}

carouselDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    window.clearInterval(carouselTimer);
    setActiveSlide(Number(dot.dataset.slide || 0));
    startCarousel();
  });
});

startCarousel();

const canvas = document.getElementById("fieldCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let width = 0;
let height = 0;
let points = [];
let animationFrame = null;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.max(34, Math.min(82, Math.floor((width * height) / 22000)));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: 1 + Math.random() * 1.7,
  }));
}

function drawField() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(31, 122, 107, 0.42)";
  ctx.strokeStyle = "rgba(31, 122, 107, 0.14)";
  ctx.lineWidth = 1;

  points.forEach((point) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 132) {
        ctx.globalAlpha = 1 - distance / 132;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  animationFrame = window.requestAnimationFrame(drawField);
}

if (!prefersReducedMotion && canvas && ctx) {
  resizeCanvas();
  drawField();
  window.addEventListener("resize", resizeCanvas);
}

window.addEventListener("pagehide", () => {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
  if (carouselTimer) {
    window.clearInterval(carouselTimer);
  }
});
