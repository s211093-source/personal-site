const root = document.documentElement;
root.setAttribute("data-current-lang", "zh");

const langButtons = Array.from(document.querySelectorAll(".il-lang-btn"));
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-set-lang");
    const current = root.getAttribute("data-current-lang") || "zh";
    if (target === current) return;

    root.setAttribute("data-current-lang", target);
    langButtons.forEach((b) => b.classList.remove("il-lang-active"));
    btn.classList.add("il-lang-active");
  });
});

const slides = Array.from(document.querySelectorAll(".il-slide"));
const dots = Array.from(document.querySelectorAll(".il-hero-dot"));
const prevBtn = document.querySelector(".il-hero-prev");
const nextBtn = document.querySelector(".il-hero-next");

let currentIndex = 0;
let timerId = null;
const INTERVAL = 7000;

function showSlide(index) {
  if (!slides.length) return;
  currentIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("il-active", i === currentIndex);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("il-active", i === currentIndex);
  });
}

function nextSlide() {
  showSlide(currentIndex + 1);
}

function prevSlide() {
  showSlide(currentIndex - 1);
}

function resetTimer() {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(nextSlide, INTERVAL);
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetTimer();
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetTimer();
  });
}

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    showSlide(i);
    resetTimer();
  });
});

if (slides.length > 1) {
  resetTimer();
}

const backdrop = document.querySelector("[data-modal-backdrop]");
const modalContent = document.querySelector("[data-modal-content]");
const modalImage = document.querySelector("[data-modal-image]");
const closeBtn = document.querySelector(".il-modal-close");
const cards = Array.from(document.querySelectorAll(".il-card"));
const modalSections = Array.from(document.querySelectorAll(".il-modal-section"));
const modalRoot = document.querySelector(".il-modal");

function openModal(targetId) {
  const source = modalSections.find((section) => section.id === targetId);
  if (!source || !backdrop || !modalContent || !modalImage || !modalRoot) return;

  modalRoot.classList.remove("il-modal-wide");
  modalContent.innerHTML = source.innerHTML;

  const imageUrl = source.getAttribute("data-image") || "";
  const imagePosition = source.getAttribute("data-image-position") || "center 40%";

  modalImage.src = imageUrl;
  modalImage.style.objectPosition = imagePosition;

  if (targetId === "modal-schedule") {
    modalRoot.classList.add("il-modal-wide");
  }

  backdrop.classList.add("il-open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!backdrop || !modalRoot) return;
  backdrop.classList.remove("il-open");
  modalRoot.classList.remove("il-modal-wide");
  document.body.style.overflow = "";
}

cards.forEach((card) => {
  const targetId = card.getAttribute("data-modal-target");
  if (!targetId) return;

  card.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(targetId);
  });

  const moreBtn = card.querySelector(".il-card-more");
  if (moreBtn) {
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(targetId);
    });
  }
});

if (closeBtn) {
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeModal();
  });
}

if (backdrop) {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && backdrop && backdrop.classList.contains("il-open")) {
    closeModal();
  }
});
