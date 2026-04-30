const html = document.documentElement;
const langButtons = document.querySelectorAll(".se-lang-btn");

let currentLang = "zh";

function setLanguage(lang) {
  currentLang = lang;
  html.setAttribute("data-current-lang", lang);

  langButtons.forEach((button) => {
    button.classList.toggle("se-lang-active", button.dataset.setLang === lang);
  });

  syncModalLanguage();
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.setLang);
  });
});

const slides = document.querySelectorAll(".se-slide");
const dots = document.querySelectorAll(".se-hero-dot");
const prevBtn = document.querySelector(".se-hero-prev");
const nextBtn = document.querySelector(".se-hero-next");

let currentSlide = 0;
let slideInterval = null;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("se-active", i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("se-active", i === currentSlide);
  });
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function startSlideShow() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

if (nextBtn && prevBtn) {
  nextBtn.addEventListener("click", () => {
    nextSlide();
    startSlideShow();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    startSlideShow();
  });
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    startSlideShow();
  });
});

showSlide(0);
startSlideShow();

const modalBackdrop = document.querySelector("[data-modal-backdrop]");
const modalContent = document.querySelector("[data-modal-content]");
const modalImage = document.querySelector("[data-modal-image]");
const modalClose = document.querySelector(".se-modal-close");
const experienceRows = document.querySelectorAll("[data-modal-target]");

function syncModalLanguage() {
  if (!modalContent) return;

  const zhNodes = modalContent.querySelectorAll('[data-lang="zh"]');
  const enNodes = modalContent.querySelectorAll('[data-lang="en"]');

  zhNodes.forEach((node) => {
    node.style.display = currentLang === "zh" ? "" : "none";
  });

  enNodes.forEach((node) => {
    node.style.display = currentLang === "en" ? "" : "none";
  });
}

function openModal(targetId) {
  const source = document.getElementById(targetId);
  if (!source) return;

  modalContent.innerHTML = source.innerHTML;

  const imageUrl = source.dataset.image || "";
  const imagePosition = source.dataset.imagePosition || "center center";

  modalImage.src = imageUrl;
  modalImage.style.objectPosition = imagePosition;

  syncModalLanguage();
  modalBackdrop.classList.add("se-open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalBackdrop.classList.remove("se-open");
  document.body.style.overflow = "";
}

experienceRows.forEach((row) => {
  row.addEventListener("click", (event) => {
    const openBtn = event.target.closest(".se-open-btn");
    if (!openBtn && !event.currentTarget.classList.contains("se-experience-row")) return;
    openModal(event.currentTarget.dataset.modalTarget);
  });
});

modalClose.addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalBackdrop.classList.contains("se-open")) {
    closeModal();
  }
});

setLanguage("zh");
