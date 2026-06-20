/* ============================================================
   JASS'S BIRTHDAY PAGE — main script
   ============================================================ */

(function () {
  "use strict";
  window.__jassScriptLoaded = true;

  /* ---------- ELEMENTS ---------- */
  const screenLanding   = document.getElementById("screenLanding");
  const screenMain      = document.getElementById("screenMain");
  const btnEnter        = document.getElementById("btnEnter");
  const btnSpin         = document.getElementById("btnSpin");
  const spinHint        = document.getElementById("spinHint");
  const wheelCanvas     = document.getElementById("wheelCanvas");
  const bgMusic         = document.getElementById("bgMusic");
  const btnMusicToggle  = document.getElementById("btnMusicToggle");
  const musicIcon       = document.getElementById("musicIcon");

  const envelopeOverlay = document.getElementById("envelopeOverlay");
  const overlayBg       = document.getElementById("overlayBg");
  const envelope        = document.getElementById("envelope");
  const envelopeSeal     = document.getElementById("envelopeSeal");
  const letterName       = document.getElementById("letterName");
  const letterMessage    = document.getElementById("letterMessage");
  const btnCloseEnvelope = document.getElementById("btnCloseEnvelope");
  const readCounter      = document.getElementById("readCounter");

  /* ---------- STATE TRACKING ---------- */
  // Track indices that have already been read
  let readIndices = new Set();
  let currentWinner = null;

  /* ---------- GUARD: need at least 1 message ---------- */
  if (!Array.isArray(GREETINGS) || GREETINGS.length === 0) {
    console.warn("No greetings found in messages.js — add at least one!");
  }

  // Update counter visualization dynamically based on messages.js array length
  function updateCounter() {
    readCounter.textContent = `${readIndices.size}/${GREETINGS.length} 🍓`;
  }
  updateCounter();

  /* ============================================================
     FLOATING PETALS / LEAVES BACKGROUND
     ============================================================ */
  function spawnPetals() {
    const layer = document.getElementById("petalLayer");
    const symbols = ["🍓", "🍃", "🌸", "🍓", "🍃"];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "petal";
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const left = Math.random() * 100;
      const duration = 9 + Math.random() * 10;
      const delay = Math.random() * -20;
      const drift = (Math.random() * 120 - 60) + "px";
      const size = 0.9 + Math.random() * 1.1;
      el.style.left = left + "vw";
      el.style.animationDuration = duration + "s";
      el.style.animationDelay = delay + "s";
      el.style.setProperty("--drift", drift);
      el.style.fontSize = size + "rem";
      layer.appendChild(el);
    }
  }
  spawnPetals();

  /* ============================================================
     MUSIC HANDLING
     ============================================================ */
  const TARGET_VOLUME = 1.0;

  function startMusic() {
    bgMusic.volume = TARGET_VOLUME;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        musicIcon.textContent = "🔇";
      });
    }
  }

  btnMusicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicIcon.textContent = "🔊";
    } else {
      bgMusic.pause();
      musicIcon.textContent = "🔇";
    }
  });

  /* ============================================================
     SCREEN TRANSITION: landing -> main
     ============================================================ */
  btnEnter.addEventListener("click", () => {
    startMusic();
    screenLanding.classList.add("hidden");
    screenMain.classList.remove("hidden");
    drawWheel();
  });

  /* ============================================================
     WHEEL OF NAMES
     ============================================================ */
  const ctx = wheelCanvas.getContext("2d");
  const wheelColorsA = ["#E8527A", "#FFD9E3"];
  const wheelColorsB = ["#6FA968", "#FCE38A"];

  function getSliceColor(i) {
    const palette = i % 2 === 0 ? wheelColorsA : wheelColorsB;
    return palette[Math.floor(i / 2) % 2];
  }

  function drawWheel() {
    const size = wheelCanvas.clientWidth || 480;
    const dpr = window.devicePixelRatio || 1;
    wheelCanvas.width = size * dpr;
    wheelCanvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 6;

    // Filter list to only contain components that haven't been read yet
    const activeGreetings = GREETINGS.map((entry, originalIndex) => ({
      ...entry,
      originalIndex
    })).filter(item => !readIndices.has(item.originalIndex));

    ctx.clearRect(0, 0, size, size);

    // If everything is read, draw a clean solid baseline circle background
    if (activeGreetings.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFDF9";
      ctx.fill();
      ctx.strokeStyle = "#FFFDF9";
      ctx.lineWidth = 3;
      ctx.stroke();
      return;
    }

    const sliceAngle = (2 * Math.PI) / activeGreetings.length;

    activeGreetings.forEach((entry, i) => {
      const start = i * sliceAngle - Math.PI / 2;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      
      // Assign alternating color sets dynamically to balance layout visual composition
      ctx.fillStyle = getSliceColor(i);
      ctx.fill();
      ctx.strokeStyle = "#FFFDF9";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Render text label inside newly proportioned segment constraints
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#6E1F3A";
      ctx.font = `600 ${Math.max(14, size * 0.04)}px Quicksand, sans-serif`;
      ctx.fillText(entry.name, radius - 18, 6);
      ctx.restore();
    });
  }

  window.addEventListener("resize", drawWheel);

  /* ---------- SPIN LOGIC ---------- */
  let currentRotation = 0;
  let spinning = false;

  function spinWheel() {
    if (spinning) return;
    
    // Check if everything has been read
    if (readIndices.size >= GREETINGS.length) {
      spinHint.textContent = "All messages have been read! 🍓";
      return;
    }

    spinning = true;
    btnSpin.disabled = true;
    spinHint.textContent = "spinning… 🍓";

    // Reconstruct list mapping remaining active choices back to target locations
    const activeGreetings = GREETINGS.map((entry, originalIndex) => ({
      ...entry,
      originalIndex
    })).filter(item => !readIndices.has(item.originalIndex));

    const sliceDeg = 360 / activeGreetings.length;
    const winnerActiveIndex = Math.floor(Math.random() * activeGreetings.length);
    const chosen = activeGreetings[winnerActiveIndex];
    currentWinner = chosen.originalIndex;

    const jitter = (Math.random() - 0.5) * (sliceDeg * 0.6);
    const winnerSliceCenterDeg = winnerActiveIndex * sliceDeg + sliceDeg / 2 + jitter;
    const fullSpins = 5 + Math.floor(Math.random() * 3);

    const baseline = Math.floor(currentRotation / 360) * 360;
    const targetRotation = baseline + fullSpins * 360 + (360 - winnerSliceCenterDeg);

    currentRotation = targetRotation;
    wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      spinning = false;
      btnSpin.disabled = false;
      spinHint.textContent = "tap the wheel to spin 🍃";
      openEnvelopeFor(GREETINGS[currentWinner]);
    }, 5600);
  }

  btnSpin.addEventListener("click", spinWheel);
  wheelCanvas.addEventListener("click", spinWheel);

  /* ============================================================
     ENVELOPE / LETTER REVEAL
     ============================================================ */
  function openEnvelopeFor(entry) {
    letterName.textContent = entry.name;
    letterMessage.textContent = entry.message;

    envelope.classList.remove("open", "fade-envelope");
    envelopeOverlay.classList.remove("hidden");

    requestAnimationFrame(() => {
      setTimeout(() => {
        envelope.classList.add("open");
        
        // Once the letter slides all the way out (approx 1200ms after opening transitions start), fade out the outer envelope envelope shell
        setTimeout(() => {
          envelope.classList.add("fade-envelope");
        }, 1100);

      }, 450);
    });
  }

  function closeEnvelope() {
    envelopeOverlay.classList.add("hidden");
    envelope.classList.remove("open", "fade-envelope");
    
    // If an item was successfully drawn and opened, mark it as read upon closing
    if (currentWinner !== null) {
      readIndices.add(currentWinner);
      currentWinner = null;
      updateCounter();
      drawWheel(); // Redraws wheel layout immediately removing the name
    }
  }

  envelopeSeal.addEventListener("click", (e) => {
    e.stopPropagation();
    envelope.classList.add("open");
    setTimeout(() => {
      envelope.classList.add("fade-envelope");
    }, 1100);
  });

  btnCloseEnvelope.addEventListener("click", closeEnvelope);
  overlayBg.addEventListener("click", closeEnvelope);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEnvelope();
  });

})();