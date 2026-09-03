(() => {
  const CARD_NAMES = [
    'disco_corte', 'trena', 'lavadora', 'spray',
    'mascote', 'mochila', 'parafusadeira', 'logo_vonder'
  ];

  const STORAGE_KEY = 'ovd_memoria_config';
  const DEFAULTS = { jogo: 30, preparacao: 5 };
  const LIMITS = {
    jogo:        { min: 15, max: 180 },
    preparacao:  { min: 0,  max: 30 }
  };

  // Quando o totem roda direto do arquivo (file://) alguns navegadores bloqueiam
  // o localStorage. Nesse caso a config vale so enquanto a pagina estiver aberta.
  let fallback = null;

  const screens = {
    intro: document.getElementById('screen-intro'),
    config: document.getElementById('screen-config'),
    game: document.getElementById('screen-game'),
    win: document.getElementById('screen-win'),
    lose: document.getElementById('screen-lose'),
    video: document.getElementById('screen-video'),
  };
  const board = document.getElementById('board');
  const timerText = document.getElementById('timer-text');
  const timerLabel = document.getElementById('timer-label');
  const timerPill = document.querySelector('.timer-pill');
  const video = document.getElementById('attract-video');
  const introTempo = document.getElementById('intro-tempo');

  const ranges = {
    jogo: document.getElementById('rng-jogo'),
    preparacao: document.getElementById('rng-preparacao'),
    inatividade: document.getElementById('rng-inatividade'),
  };
  const values = {
    jogo: document.getElementById('val-jogo'),
    preparacao: document.getElementById('val-preparacao'),
    inatividade: document.getElementById('val-inatividade'),
  };

  let config = loadConfig();
  let flippedCards = [];
  let matchedCount = 0;
  let lockBoard = false;
  let secondsLeft = 0;
  let timerId = null;

  /* ---------- CONFIGURACAO ---------- */

  function clampInt(value, key) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return DEFAULTS[key];
    return Math.min(Math.max(n, LIMITS[key].min), LIMITS[key].max);
  }

  function loadConfig() {
    let raw = fallback;
    try { raw = localStorage.getItem(STORAGE_KEY) ?? fallback; } catch (e) { /* file:// */ }
    if (!raw) return Object.assign({}, DEFAULTS);
    try {
      const saved = JSON.parse(raw);
      return {
        jogo: clampInt(saved.jogo, 'jogo'),
        preparacao: clampInt(saved.preparacao, 'preparacao'),
      };
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function saveConfig(next) {
    fallback = JSON.stringify(next);
    try { localStorage.setItem(STORAGE_KEY, fallback); } catch (e) { /* file:// */ }
  }

  function syncValue(key) {
    if (key === 'inatividade') {
      values.inatividade.textContent = window.OVDGlobalConfig.formatInatividade(parseInt(ranges.inatividade.value, 10));
      return;
    }
    values[key].textContent = parseInt(ranges[key].value, 10) + 's';
  }

  // a arte da abertura anuncia o tempo de jogo; mantem o texto em dia
  function paintIntro() {
    introTempo.textContent = config.jogo + ' segundos';
  }

  function openConfig() {
    ranges.jogo.value = config.jogo;
    ranges.preparacao.value = config.preparacao;
    ranges.inatividade.value = window.OVDGlobalConfig.load().inatividade;
    Object.keys(ranges).forEach(syncValue);
    showScreen('config');
  }

  /* ---------- TELAS ---------- */

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  /* ---------- INATIVIDADE / VIDEO DE ATRACAO ---------- */
  /* Tempo de inatividade e compartilhado com os outros jogos (OVDGlobalConfig). */

  const attract = window.OVDAttract.create({
    video,
    isPaused: () => screens.config.classList.contains('active'), // nao interrompe o operador mexendo nas configuracoes
    onEnter: () => {
      clearInterval(timerId);
      lockBoard = true;
      showScreen('video');
    },
    onExit: () => showScreen('intro'),
  });

  function onActivity() {
    if (screens.video.classList.contains('active')) attract.stop();
    else attract.reset();
  }

  ['pointerdown', 'keydown'].forEach(ev => {
    document.addEventListener(ev, onActivity, true);
  });

  /* ---------- JOGO ---------- */

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildBoard() {
    board.innerHTML = '';
    const deck = shuffle([...CARD_NAMES, ...CARD_NAMES]);

    deck.forEach(name => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.name = name;
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back">?</div>
          <div class="card-face card-front">
            <img src="../assets/cards/${name}.png" alt="${name}">
          </div>
        </div>
      `;
      card.addEventListener('click', () => onCardClick(card));
      board.appendChild(card);
    });
  }

  function onCardClick(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      lockBoard = true;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = flippedCards;
    const isMatch = a.dataset.name === b.dataset.name;

    if (isMatch) {
      a.classList.add('matched');
      b.classList.add('matched');
      matchedCount++;
      flippedCards = [];
      lockBoard = false;
      if (matchedCount === CARD_NAMES.length) {
        endGame(true);
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
      }, 700);
    }
  }

  function updateTimerText() {
    const total = Math.max(secondsLeft, 0);
    const m = String(total / 60 | 0).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    timerText.textContent = `${m}:${s}`;
  }

  function runCountdown(seconds, onEnd) {
    clearInterval(timerId);
    secondsLeft = seconds;
    updateTimerText();
    timerId = setInterval(() => {
      secondsLeft--;
      updateTimerText();
      if (!timerPill.classList.contains('prep') && secondsLeft <= 10) {
        timerPill.classList.add('warning');
      }
      if (secondsLeft <= 0) {
        clearInterval(timerId);
        onEnd();
      }
    }, 1000);
  }

  function startPreview(onEnd) {
    const cards = [...board.querySelectorAll('.card')];
    cards.forEach(c => c.classList.add('preview'));
    lockBoard = true;
    timerPill.classList.add('prep');
    timerLabel.hidden = false;

    runCountdown(config.preparacao, () => {
      cards.forEach(c => c.classList.remove('preview'));
      timerPill.classList.remove('prep');
      timerLabel.hidden = true;
      lockBoard = false;
      onEnd();
    });
  }

  function startRound() {
    runCountdown(config.jogo, () => endGame(false));
  }

  function endGame(won) {
    clearInterval(timerId);
    lockBoard = true;
    showScreen(won ? 'win' : 'lose');
  }

  function startGame() {
    matchedCount = 0;
    flippedCards = [];
    lockBoard = false;
    timerPill.classList.remove('warning', 'prep');
    timerLabel.hidden = true;
    buildBoard();
    showScreen('game');

    if (config.preparacao > 0) startPreview(startRound);
    else startRound();
  }

  /* ---------- LIGACOES ---------- */

  Object.keys(ranges).forEach(key => {
    ranges[key].addEventListener('input', () => syncValue(key));
  });

  document.getElementById('btn-config-open').addEventListener('click', openConfig);
  document.getElementById('btn-config-cancel').addEventListener('click', () => showScreen('intro'));
  document.getElementById('btn-config-save').addEventListener('click', () => {
    config = {
      jogo: clampInt(ranges.jogo.value, 'jogo'),
      preparacao: clampInt(ranges.preparacao.value, 'preparacao'),
    };
    saveConfig(config);
    window.OVDGlobalConfig.save({ inatividade: ranges.inatividade.value });
    paintIntro();
    attract.reset();
    showScreen('intro');
  });

  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-finish-win').addEventListener('click', () => showScreen('intro'));
  document.getElementById('btn-finish-lose').addEventListener('click', () => showScreen('intro'));

  paintIntro();
  attract.reset();
})();
