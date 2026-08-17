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
  startTimer();
}

function closeFullscreen() {
  stopTimer();
  fullscreen.classList.remove("open");
  fullscreenImg.src = "";
}

// ====== Temporizador (1 minuto) ======
const TIMER_SECONDS = 60;
let timerId = null;
const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");
const timerWrap = document.querySelector(".timer");

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function startTimer() {
  stopTimer();
  let remaining = TIMER_SECONDS;

  // Estado inicial
  timerText.textContent = formatTime(remaining);
  timerFill.style.transition = "none";
  timerFill.style.width = "100%";
  timerWrap.classList.remove("low");

  // Forzar reflow para que la transición arranque desde 100%
  void timerFill.offsetWidth;
  timerFill.style.transition = "width 1s linear";
  timerFill.style.width = "0%";

  timerId = setInterval(() => {
    remaining--;
    timerText.textContent = formatTime(remaining);

    if (remaining <= 10) timerWrap.classList.add("low");

    if (remaining <= 0) {
      closeFullscreen(); // se cierra solo al terminar el tiempo
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
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
