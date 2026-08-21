/**
 * 서울신답초등학교 교가 맞추기 게임 키오스크 (1080x1920 Signage)
 * Main JavaScript Module - Complete Interactive Implementation
 */

const HOME_URL = 'https://claix-quiz-list6-bp67.vercel.app/';

export function goToHome(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }

  try {
    if (window.sfx && typeof window.sfx.playClick === 'function') {
      window.sfx.playClick();
    }
  } catch (err) {}

  // 1. Try window.top for iframe parent container
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = HOME_URL;
      return;
    }
  } catch (err) {
    // Cross-origin iframe fallback
  }

  // 2. Try window.parent
  try {
    if (window.parent && window.parent !== window) {
      window.parent.location.href = HOME_URL;
      return;
    }
  } catch (err) {}

  // 3. Direct window navigation fallback
  try {
    window.location.assign(HOME_URL);
  } catch (err) {
    window.location.href = HOME_URL;
  }
}
window.goToHome = goToHome;

// Global event handlers on capture phase for all pointer/touch/click events
['click', 'pointerdown', 'touchend'].forEach(evtName => {
  document.addEventListener(evtName, (e) => {
    const target = e.target;
    if (target && (
      target.id === 'btn-back' ||
      target.id === 'btn-close' ||
      (target.closest && target.closest('#btn-back, .btn-top-back, #btn-close'))
    )) {
      goToHome(e);
    }
  }, true);
});

// ==========================================
// 1. DATA: 서울신답초등학교 교가 가사 & 초성 데이터
// ==========================================
const SCHOOL_SONG_DATA = {
  schoolName: "서울신답초등학교",
  verses: [
    {
      verseNum: 1,
      title: "교가 1절",
      lines: [
        {
          fullText: "새싹이 무럭무럭 자라나듯이",
          displayParts: [
            { text: "새싹이 무럭무럭 " },
            { target: "자", choseong: "ㅈ" },
            { text: " " },
            { target: "라", choseong: "ㄹ" },
            { text: "나듯이" }
          ],
          answers: ["자", "라"]
        },
        {
          fullText: "오늘도 무럭무럭 자라는 우리",
          displayParts: [
            { text: "오늘도 무럭무럭 자라는 " },
            { target: "우", choseong: "ㅇ" },
            { text: " " },
            { target: "리", choseong: "ㄹ" }
          ],
          answers: ["우", "리"]
        },
        {
          fullText: "튼튼한 몸과 마음 한데 뭉쳐서",
          displayParts: [
            { text: "튼튼한 몸과 " },
            { target: "마", choseong: "ㅁ" },
            { text: " " },
            { target: "음", choseong: "ㅇ" },
            { text: " 한데 뭉쳐서" }
          ],
          answers: ["마", "음"]
        },
        {
          fullText: "나라의 기둥이 될 힘을 기르자",
          displayParts: [
            { text: "나라의 " },
            { target: "기", choseong: "ㄱ" },
            { text: " " },
            { target: "둥", choseong: "ㄷ" },
            { text: "이 될 힘을 기르자" }
          ],
          answers: ["기", "둥"]
        },
        {
          fullText: "우리는 다정스런 신답 어린이",
          displayParts: [
            { text: "우리는 다정스런 " },
            { target: "신", choseong: "ㅅ" },
            { text: " " },
            { target: "답", choseong: "ㄷ" },
            { text: " 어린이" }
          ],
          answers: ["신", "답"]
        },
        {
          fullText: "신답은 다정스런 우리의 학교",
          displayParts: [
            { text: "신답은 다정스런 우리의 " },
            { target: "학", choseong: "ㅎ" },
            { text: " " },
            { target: "교", choseong: "ㄱ" }
          ],
          answers: ["학", "교"]
        }
      ],
      keypadTiles: [
        "자", "라", "우", "리", "마", "음", "기", "둥", "신", "답", "학", "교", "꿈", "빛"
      ]
    }
  ]
};

// Helper: Extract Korean Choseong
function getChoseong(str) {
  const choseongs = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const code = str.charCodeAt(0) - 44032;
  if (code < 0 || code > 11172) return str;
  return choseongs[Math.floor(code / 588)];
}

// Helper: Shuffle Array (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==========================================
// 2. AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playTileSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = this.ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playMelodyTune(onComplete) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      { f: 392.00, d: 0.35 }, { f: 440.00, d: 0.35 }, { f: 523.25, d: 0.6 }, { f: 523.25, d: 0.35 },
      { f: 587.33, d: 0.35 }, { f: 659.25, d: 0.6 }, { f: 587.33, d: 0.35 }, { f: 523.25, d: 0.7 }
    ];

    let now = this.ctx.currentTime;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + note.d);
      now += note.d + 0.05;
    });

    if (onComplete) {
      setTimeout(onComplete, (now - this.ctx.currentTime) * 1000);
    }
  }

  playApplause() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 2.2;

    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const clapCount = 50;
    for (let i = 0; i < clapCount; i++) {
      const timeOffset = Math.random() * duration;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900 + Math.random() * 1100;
      filter.Q.value = 1.6;

      const gain = ctx.createGain();
      const startTime = now + timeOffset;
      const clapDuration = 0.035 + Math.random() * 0.025;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28 + Math.random() * 0.15, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + clapDuration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + clapDuration);
    }

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = now + idx * 0.07;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }
}

const sfx = new SoundFX();

// Fireworks / Confetti generator from left & right sides
function launchSideConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (canvas) canvas.remove();

  canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '10000';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#FACC15', '#06B6D4', '#FFD700'];

  function createSideBurst(x, y, isLeft) {
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      const baseAngle = isLeft ? -Math.PI * 0.28 : -Math.PI * 0.72;
      const spread = (Math.random() - 0.5) * 0.7;
      const angle = baseAngle + spread;
      const speed = 16 + Math.random() * 22;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 9 + Math.random() * 11,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.25,
        gravity: 0.42,
        drag: 0.965,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.008
      });
    }
  }

  const startY = canvas.height * 0.75;
  createSideBurst(0, startY, true);
  createSideBurst(canvas.width, startY, false);

  setTimeout(() => {
    createSideBurst(0, startY + 40, true);
    createSideBurst(canvas.width, startY + 40, false);
  }, 220);

  setTimeout(() => {
    createSideBurst(canvas.width * 0.08, startY - 80, true);
    createSideBurst(canvas.width * 0.92, startY - 80, false);
  }, 450);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRotation;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.3);
      ctx.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(render);
    } else {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  }

  render();
}

// ==========================================
// 3. GAME STATE
// ==========================================
const state = {
  currentVerseIndex: 0, // 0: 1절, 1: 2절
  score: 0,
  timeRemaining: 300, // 05:00 (300 seconds / 5분)
  timerInterval: null,
  activeBoxIndex: 0, // Current active target blank box (0..N)
  userAnswers: {}, // Map boxIndex -> chosen syllable string
  boxKeyMap: {}, // Map boxIndex -> chosen keypad tile index
  usedKeypadIndices: new Set(), // Set of disabled keypad tile indices
  shuffledKeypadTiles: [], // Shuffled keypad tiles for current verse session
  isCompleted: false
};

// ==========================================
// 4. AUTO-SCALING KIOSK ENGINE
// ==========================================
function getAppScale() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const scaleX = windowWidth / 1080;
  const scaleY = windowHeight / 1920;
  return Math.min(scaleX, scaleY);
}

function setupAutoScaling() {
  const stage = document.getElementById('app-stage');
  if (!stage) return;

  function updateScale() {
    const scale = getAppScale();
    stage.style.transform = `scale(${scale})`;

    document.querySelectorAll('.modal-scale-wrapper').forEach(el => {
      el.style.transform = `scale(${scale})`;
    });
  }

  window.addEventListener('resize', updateScale);
  updateScale();
}

// ==========================================
// 5. VIEW RENDER ENGINE
// ==========================================

function initGameSession() {
  state.score = 0;
  state.timeRemaining = 300;
  state.userAnswers = {};
  state.boxKeyMap = {};
  state.usedKeypadIndices.clear();
  state.activeBoxIndex = 0;
  state.isCompleted = false;

  const verseData = SCHOOL_SONG_DATA.verses[state.currentVerseIndex];
  state.shuffledKeypadTiles = shuffleArray(verseData.keypadTiles);

  startTimer();
  renderMainGameUI();
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      sfx.playWrong();
      showResultModal(false);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerBadge = document.getElementById('timer-pill-badge');
  if (timerBadge) {
    const mins = Math.floor(state.timeRemaining / 60);
    const secs = state.timeRemaining % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    timerBadge.innerHTML = `⏱ 남은 시간 ${timeStr}`;
    
    if (state.timeRemaining <= 15) {
      timerBadge.classList.add('warning');
    } else {
      timerBadge.classList.remove('warning');
    }
  }
}

function renderMainGameUI() {
  const verseData = SCHOOL_SONG_DATA.verses[state.currentVerseIndex];
  const main = document.getElementById('view-container');
  const footer = document.getElementById('app-footer');

  // Flatten all blank target boxes in this verse
  let globalBoxCount = 0;

  // Build Chalkboard Lyrics Lines HTML
  const lyricsHtml = verseData.lines.map((lineData) => {
    let lineContentHtml = '';
    
    lineData.displayParts.forEach((part) => {
      if (part.text) {
        lineContentHtml += `<span>${part.text}</span>`;
      } else if (part.target) {
        const boxIdx = globalBoxCount++;
        const userVal = state.userAnswers[boxIdx] || '';
        const isActive = boxIdx === state.activeBoxIndex;
        const isFilled = userVal !== '';
        
        let boxClasses = 'choseong-box';
        if (isActive) boxClasses += ' active-target';
        if (isFilled) boxClasses += ' filled';

        const displayVal = isFilled ? userVal : '';

        lineContentHtml += `
          <div class="${boxClasses}" data-box-idx="${boxIdx}" data-choseong="${part.choseong}" data-target="${part.target}">
            ${displayVal}
          </div>
        `;
      }
    });

    return `<div class="chalk-lyric-row">${lineContentHtml}</div>`;
  }).join('');

  // Render Chalkboard Card + Keypad Tray
  main.innerHTML = `
    <!-- Top-Left Circular Back Button -->
    <a id="btn-back" class="btn-top-back" href="https://claix-quiz-list6-bp67.vercel.app/" target="_top" aria-label="닫기" onclick="goToHome(event)">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </a>

    <!-- Title Banner Area -->
    <div class="title-banner-wrapper">
      <div class="title-center-block">
        <img src="/image123.png" alt="우리학교 교가 맞추기" class="title-text-img" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src='/assets/image123.png';}" referrerPolicy="no-referrer">
        <div id="timer-pill-badge" class="timer-pill-badge">
          ⏱ 남은 시간 05:00
        </div>
      </div>
    </div>

    <!-- Main Green Chalkboard -->
    <div class="chalkboard-container">
      <!-- Lyrics Lines -->
      <div class="chalk-lyrics-container">
        ${lyricsHtml}
      </div>

      <!-- Chalkboard Bottom Ledge Tray -->
      <div class="chalkboard-tray">
        <div class="tray-eraser"></div>
        <div class="tray-chalks-row">
          <div class="chalk-stick chalk-white"></div>
          <div class="chalk-stick chalk-yellow"></div>
          <div class="chalk-stick chalk-pink"></div>
          <div class="chalk-stick chalk-blue"></div>
        </div>
      </div>
    </div>

    <!-- Bottom Wooden Syllable Keypad Tray -->
    <div class="syllable-keypad-tray">
      <div class="syllable-grid" id="syllable-keypad-grid">
        ${(state.shuffledKeypadTiles && state.shuffledKeypadTiles.length ? state.shuffledKeypadTiles : verseData.keypadTiles).map((syllable, keyIdx) => {
          const isDisabled = state.usedKeypadIndices.has(keyIdx);
          return `
            <button class="syllable-btn ${isDisabled ? 'disabled' : ''}" data-key-idx="${keyIdx}" data-syllable="${syllable}">
              ${syllable}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Action Buttons directly under syllable keypad grid -->
      <div class="keypad-actions-row">
        <button id="btn-reset-line" class="ctrl-btn ctrl-btn-sec">
          <svg style="width:36px;height:36px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span>처음부터</span>
        </button>
        <button id="btn-submit-answer" class="ctrl-btn ctrl-btn-pri">
          <svg style="width:36px;height:36px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>채점하기</span>
        </button>
        <button id="btn-view-lyrics" class="ctrl-btn ctrl-btn-accent">
          <svg style="width:36px;height:36px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span>가사 미리보기</span>
        </button>
      </div>
    </div>
  `;

  updateTimerDisplay();

  // Empty Footer as controls are attached directly under syllable cards
  footer.innerHTML = '';

  attachEventHandlers(globalBoxCount);
}

function attachEventHandlers(totalBoxes) {
  // 0. Top Back/Close Button
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToHome();
    };
  }

  // 1. Choseong Box Tap Handler
  document.querySelectorAll('.choseong-box').forEach(box => {
    box.addEventListener('click', (e) => {
      sfx.playClick();
      const boxIdx = parseInt(e.currentTarget.dataset.boxIdx);

      // If already filled, clear it and return tile to keypad
      if (state.userAnswers[boxIdx]) {
        const keyIdx = state.boxKeyMap[boxIdx];
        if (keyIdx !== undefined) {
          state.usedKeypadIndices.delete(keyIdx);
          delete state.boxKeyMap[boxIdx];
        } else {
          const removedSyllable = state.userAnswers[boxIdx];
          for (let kIdx of state.usedKeypadIndices) {
            const btn = document.querySelector(`.syllable-btn[data-key-idx="${kIdx}"]`);
            if (btn && btn.dataset.syllable === removedSyllable) {
              state.usedKeypadIndices.delete(kIdx);
              break;
            }
          }
        }
        delete state.userAnswers[boxIdx];
      }

      state.activeBoxIndex = boxIdx;
      renderMainGameUI();
    });
  });

  // 2. Syllable Keypad Button Tap Handler
  document.querySelectorAll('.syllable-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.currentTarget.classList.contains('disabled')) return;
      sfx.playTileSelect();

      const keyIdx = parseInt(e.currentTarget.dataset.keyIdx);
      const syllable = e.currentTarget.dataset.syllable;

      // Fill current active box
      state.userAnswers[state.activeBoxIndex] = syllable;
      state.boxKeyMap[state.activeBoxIndex] = keyIdx;
      state.usedKeypadIndices.add(keyIdx);

      // Move active target focus to next empty box
      let nextEmptyIndex = -1;
      for (let i = 0; i < totalBoxes; i++) {
        if (!state.userAnswers[i]) {
          nextEmptyIndex = i;
          break;
        }
      }

      if (nextEmptyIndex !== -1) {
        state.activeBoxIndex = nextEmptyIndex;
      }

      renderMainGameUI();
    });
  });

  // 3. Reset Button ("처음부터")
  const btnReset = document.getElementById('btn-reset-line');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      sfx.playClick();
      state.userAnswers = {};
      state.boxKeyMap = {};
      state.usedKeypadIndices.clear();
      state.activeBoxIndex = 0;
      renderMainGameUI();
    });
  }

  // 4. Submit Answer Button ("제출하기")
  const btnSubmit = document.getElementById('btn-submit-answer');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      validateAnswer(totalBoxes);
    });
  }

  // 5. View Full Lyrics / Check Correct Answer Button ("정답확인")
  const btnViewLyrics = document.getElementById('btn-view-lyrics');
  if (btnViewLyrics) {
    btnViewLyrics.addEventListener('click', () => {
      sfx.playClick();
      showFullLyricsModal();
    });
  }
}

function showFullLyricsModal() {
  const verseData = SCHOOL_SONG_DATA.verses[state.currentVerseIndex];
  const scale = getAppScale();

  const lyricsHtml = `
    <div class="result-overlay" id="lyrics-modal-overlay">
      <div class="modal-scale-wrapper" style="transform: scale(${scale});">
        <div class="result-dialog full-lyrics-dialog">
          <div class="lyrics-modal-header">
            <span class="lyrics-icon">🎼</span>
            <h2 class="lyrics-title">${SCHOOL_SONG_DATA.schoolName} 교가 전체 가사</h2>
          </div>
          
          <div class="lyrics-content-card">
            <div class="lyrics-verse-badge">${verseData.title} 가사</div>
            <div class="lyrics-lines-list">
              ${verseData.lines.map((line, idx) => `
                <div class="lyrics-line-item">
                  <span class="line-num">${idx + 1}.</span>
                  <span class="line-text">${line.fullText}</span>
                </div>
              `).join('')}
              <div class="lyrics-refrain-item">
                <span class="refrain-star">⭐</span>
                <span class="refrain-text">"아 빛내자 우리 학교 서울 신답초등학교"</span>
              </div>
            </div>
          </div>

          <button id="btn-modal-close-lyrics" class="ctrl-btn ctrl-btn-pri" style="width: 100%; height: 160px; flex: 0 0 auto; margin-top: 24px; font-size: 38px; border-radius: 28px;">
            <span>확인</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const existingModal = document.getElementById('lyrics-modal-overlay');
  if (existingModal) existingModal.remove();

  document.body.insertAdjacentHTML('beforeend', lyricsHtml);

  document.getElementById('btn-modal-close-lyrics').addEventListener('click', () => {
    sfx.playClick();
    const modal = document.getElementById('lyrics-modal-overlay');
    if (modal) modal.remove();
  });
}

function showToast(message, isWrong = false) {
  const stage = document.getElementById('app-stage');
  if (!stage) return;

  const existingToast = document.querySelector('.game-toast-popup');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `game-toast-popup ${isWrong ? 'wrong-toast' : 'success-toast'}`;
  toast.innerHTML = `
    <div class="toast-icon">${isWrong ? '😢' : '💯'}</div>
    <div class="toast-text">${message}</div>
  `;

  stage.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 400);
  }, 2000);
}

function validateAnswer(totalBoxes) {
  const verseData = SCHOOL_SONG_DATA.verses[state.currentVerseIndex];
  let expectedAnswers = [];

  verseData.lines.forEach(line => {
    line.displayParts.forEach(part => {
      if (part.target) {
        expectedAnswers.push(part.target);
      }
    });
  });

  let isAllCorrect = true;
  let filledCount = 0;
  const boxes = document.querySelectorAll('.choseong-box');

  boxes.forEach((box, idx) => {
    const userVal = state.userAnswers[idx];
    const expected = expectedAnswers[idx];

    if (userVal) filledCount++;

    if (userVal && userVal === expected) {
      box.classList.add('correct');
      box.classList.remove('wrong');
    } else {
      box.classList.add('wrong');
      box.classList.remove('correct');
      isAllCorrect = false;
    }
  });

  if (isAllCorrect && filledCount === totalBoxes) {
    if (state.timerInterval) clearInterval(state.timerInterval);
    sfx.playCorrect();
    sfx.playApplause();
    launchSideConfetti();
    state.score = 100;
    
    showToast("100점!", false);

    // Fast popup display (350ms delay)
    setTimeout(() => {
      showResultModal(true);
    }, 350);
  } else {
    sfx.playWrong();
    showToast("아쉬워요 !", true);
  }
}

function showResultModal(isSuccess) {
  if (isSuccess) {
    launchSideConfetti();
  }

  const scale = getAppScale();

  const modalHtml = `
    <div class="result-overlay">
      <div class="modal-scale-wrapper" style="transform: scale(${scale});">
        <div class="result-dialog">
          <div class="result-trophy">${isSuccess ? '🏆' : '⏰'}</div>
          <h2 class="result-title-text">${isSuccess ? '교가 완성! 참 잘했어요!' : '시간이 다 되었어요!'}</h2>
          
          <div class="result-score-big">${state.score} 점</div>

          <div style="font-size: 34px; color: #334155; font-weight: 700; line-height: 1.5; margin-top: 8px;">
            오늘도 멋지게 빛난 우리들!<br>
            다음에 또 만나요!
          </div>

          <div style="width: 100%; margin-top: 24px;">
            <button id="btn-modal-confirm" class="ctrl-btn ctrl-btn-pri" style="width: 100%; height: 160px; flex: 0 0 auto; margin-top: 24px; font-size: 38px; border-radius: 28px;">
              <span>확인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.result-overlay').forEach(el => el.remove());

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('btn-modal-confirm').addEventListener('click', () => {
    sfx.playClick();
    document.querySelectorAll('.result-overlay').forEach(el => el.remove());
    initGameSession();
  });
}

// ==========================================
// 6. INITIALIZATION & GLOBAL LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupAutoScaling();

  // Header Back / Close Button
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToHome();
    };
  }

  // Header Home / Close Button
  const btnClose = document.getElementById('btn-close');
  if (btnClose) {
    btnClose.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToHome();
    };
  }

  // Start initial game session immediately
  initGameSession();
});
