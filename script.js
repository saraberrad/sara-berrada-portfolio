const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-navigation");
const navigationLinks = [...document.querySelectorAll(".main-navigation a")];
const progressBar = document.querySelector(".reading-progress");

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
  navigation.classList.toggle("is-open", !isOpen);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
    navigation.classList.remove("is-open");
  });
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const projectCarousel = document.querySelector(".project-carousel");
const projectSlides = [...projectCarousel.querySelectorAll(".project-slide")];
const projectDots = [...projectCarousel.querySelectorAll(".carousel-dot")];
const pauseButton = projectCarousel.querySelector(".carousel-pause");
const carouselHint = projectCarousel.querySelector(".carousel-hint");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeProject = 0;
let carouselPaused = reduceMotion.matches;

const showProject = (index) => {
  activeProject = (index + projectSlides.length) % projectSlides.length;
  projectSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeProject;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
  });
  projectDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeProject;
    dot.classList.toggle("is-active", isActive);
    if (isActive) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
};

projectSlides.forEach((slide) => {
  const image = slide.querySelector(".project-media img");
  const media = image.parentElement;
  image.addEventListener("load", () => media.classList.add("has-image"));
  if (image.complete && image.naturalWidth > 0) media.classList.add("has-image");
});

projectDots.forEach((dot, index) => dot.addEventListener("click", () => showProject(index)));
projectCarousel.querySelector(".carousel-previous").addEventListener("click", () => showProject(activeProject - 1));
projectCarousel.querySelector(".carousel-next").addEventListener("click", () => showProject(activeProject + 1));

const updateCarouselState = () => {
  projectCarousel.classList.toggle("is-paused", carouselPaused);
  pauseButton.setAttribute("aria-pressed", String(carouselPaused));
  pauseButton.setAttribute("aria-label", carouselPaused ? "Reprendre le défilement automatique" : "Mettre le défilement en pause");
  pauseButton.querySelector("span").textContent = carouselPaused ? "▶" : "Ⅱ";
  carouselHint.textContent = carouselPaused ? "Défilement en pause" : "Défilement automatique";
};

pauseButton.addEventListener("click", () => {
  carouselPaused = !carouselPaused;
  updateCarouselState();
});
let touchStartX = null;
projectCarousel.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });
projectCarousel.addEventListener("touchend", (event) => {
  if (touchStartX === null) return;
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(deltaX) > 45) showProject(activeProject + (deltaX < 0 ? 1 : -1));
  touchStartX = null;
}, { passive: true });

window.setInterval(() => {
  if (!carouselPaused && document.visibilityState === "visible") {
    showProject(activeProject + 1);
  }
}, 5200);
updateCarouselState();

const heroVisual = document.querySelector(".hero-visual");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
  heroVisual.addEventListener("pointermove", (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const offsetX = pointerX * -9;
    const offsetY = pointerY * -9;
    heroVisual.style.setProperty("--float-x", `${offsetX.toFixed(1)}px`);
    heroVisual.style.setProperty("--float-y", `${offsetY.toFixed(1)}px`);
    heroVisual.style.setProperty("--tilt-x", `${(pointerY * 3.5).toFixed(2)}deg`);
    heroVisual.style.setProperty("--tilt-y", `${(pointerX * -3.5).toFixed(2)}deg`);
  });
  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--float-x", "0px");
    heroVisual.style.setProperty("--float-y", "0px");
    heroVisual.style.setProperty("--tilt-x", "0deg");
    heroVisual.style.setProperty("--tilt-y", "0deg");
  });
}

const updatePortraitParallax = () => {
  const bounds = heroVisual.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const portraitCenter = bounds.top + bounds.height / 2;
  const offset = Math.max(-1, Math.min(1, (portraitCenter - viewportCenter) / window.innerHeight));
  heroVisual.style.setProperty("--scroll-shift", `${(offset * 18).toFixed(1)}px`);
};

window.addEventListener("scroll", updatePortraitParallax, { passive: true });
updatePortraitParallax();

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navigationLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${entry.target.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

const updateProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();