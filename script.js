const root = document.documentElement;
root.setAttribute("data-current-lang", "zh");

// 語言切換
const langButtons = document.querySelectorAll(".lang-btn");

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetLang = btn.getAttribute("data-set-lang");
    const current = root.getAttribute("data-current-lang");
    if (targetLang === current) return;

    root.setAttribute("data-current-lang", targetLang);

    langButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// 背景輪播
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".hero-dot");
const prevBtn = document.querySelector(".hero-nav-prev");
const nextBtn = document.querySelector(".hero-nav-next");

let currentSlide = 0;
let slideInterval = null;
const slideDelay = 7000;

function showSlide(index) {
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = (index + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function startSlideShow() {
  stopSlideShow();
  slideInterval = setInterval(nextSlide, slideDelay);
}

function stopSlideShow() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
}

if (slides.length > 1) {
  startSlideShow();

  nextBtn.addEventListener("click", () => {
    nextSlide();
    startSlideShow();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    startSlideShow();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startSlideShow();
    });
  });
}
