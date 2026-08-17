// ====== Datos ======
const IMAGES = Array.from({ length: 10 }, (_, i) => `img/${i}.jpeg`);
const DIFFICULTIES = ["Fácil", "Muy Fácil", "Regalado"];

const track = document.getElementById("carouselTrack");
const btn = document.getElementById("newQuestionBtn");
const infoBox = document.getElementById("infoBox");
const fullscreen = document.getElementById("fullscreen");
const fullscreenImg = document.getElementById("fullscreenImg");
const closeBtn = document.getElementById("closeFullscreen");

const CARD_COUNT = 40; // suficientes cards para el giro
let cards = [];
let spinning = false;

// ====== Utilidades ======
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Crea una card con imagen y dificultad aleatoria
function createCard() {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  const src = rand(IMAGES);
  img.src = src;
  img.alt = "Pregunta";
  card.dataset.img = src;

  const diff = document.createElement("div");
  diff.className = "difficulty";
  diff.textContent = rand(DIFFICULTIES);

  const check = document.createElement("div");
  check.className = "check";
  check.innerHTML = "&#10003;";

  card.append(img, diff, check);
  return card;
}

// Genera todas las cards del carrusel (aleatorias)
function buildCarousel() {
  track.innerHTML = "";
  cards = [];
  for (let i = 0; i < CARD_COUNT; i++) {
    const c = createCard();
    track.appendChild(c);
    cards.push(c);
  }
}

// Paso entre cards (ancho card + gap)
function getStep() {
  const cardWidth = cards[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).gap) || 20;
  return cardWidth + gap;
}

// ====== Animación de giro tipo ruleta ======
function spin() {
  if (spinning) return;
  spinning = true;
  btn.disabled = true;
  closeFullscreen();

  // Nuevas cards aleatorias en cada giro
  buildCarousel();

  // Limpiar selección previa
  cards.forEach((c) => c.classList.remove("selected"));

  const step = getStep();
  const cardWidth = cards[0].offsetWidth;
  const viewportCenter = track.parentElement.offsetWidth / 2;

  // Índice objetivo aleatorio (bastante adelante para que gire mucho)
  const targetIndex = Math.floor(Math.random() * 10) + 28; // 28..37

  // Desplazamiento final para centrar la card objetivo bajo el marcador
  const finalOffset =
    targetIndex * step + cardWidth / 2 - viewportCenter;

  const startOffset = 0;
  const distance = finalOffset - startOffset;

  const duration = 5000; // 5 segundos
  const startTime = performance.now();

  // Easing: rápido al inicio, muy lento al final (desacelera pasado el seg 3)
  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function frame(now) {
    let t = (now - startTime) / duration;
    if (t > 1) t = 1;

    const eased = easeOutQuint(t);
    const current = startOffset + distance * eased;
    track.style.transform = `translateX(${-current}px)`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      finishSpin(targetIndex);
    }
  }

  requestAnimationFrame(frame);
}

// ====== Finaliza el giro y marca la card seleccionada ======
function finishSpin(index) {
  spinning = false;
  btn.disabled = false;

  const selected = cards[index];
  selected.classList.add("selected");

  const diff = selected.querySelector(".difficulty").textContent;
  infoBox.innerHTML = `Pregunta <strong>${diff}</strong> — haz click en la card para verla en pantalla completa.`;

  // Click en la card seleccionada -> pantalla completa
  selected.addEventListener("click", () => {
    openFullscreen(selected.dataset.img);
  });
}

// ====== Pantalla completa ======
function openFullscreen(src) {
  fullscreenImg.src = src;
  fullscreen.classList.add("open");
}

function closeFullscreen() {
  fullscreen.classList.remove("open");
  fullscreenImg.src = "";
}

// ====== Eventos ======
btn.addEventListener("click", spin);
closeBtn.addEventListener("click", closeFullscreen);
fullscreen.addEventListener("click", (e) => {
  if (e.target === fullscreen) closeFullscreen();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeFullscreen();
});

// ====== Inicial ======
buildCarousel();
