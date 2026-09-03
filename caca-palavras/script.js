(() => {
  const WORD_POOL = [
    'FURADEIRA', 'PARAFUSADEIRA', 'CHAVE PHILIPS', 'MARTELO', 'TRENA',
    'ESQUADRO', 'NÍVEL', 'ALICATE', 'LIXADEIRA', 'SERRA',
    'FITA MÉTRICA', 'ESTILETE', 'BOLSA', 'FERRAMENTA', 'GRAMPOS'
  ];
  const GRID_SIZE = 10;
  const WORDS_PER_GAME = 5;
  // Regras fáceis: só da esquerda p/ direita, de cima p/ baixo,
  // ou na diagonal descendente (\) — sem palavras ao contrário nem diagonal invertida (/).
  const DIRECTIONS = [
    [0, 1], [1, 0], [1, 1]
  ];

  const STORAGE_KEY = 'ovd_cacapalavras_config';
  const DEFAULTS = { jogo: 60 };
  const LIMITS = { jogo: { min: 30, max: 180 } };

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
  const wordListEl = document.getElementById('word-list');
  const timerText = document.getElementById('timer-text');
  const timerPill = document.querySelector('.timer-pill');
  const video = document.getElementById('attract-video');
  const introTempo = document.getElementById('intro-tempo');

  const ranges = {
    jogo: document.getElementById('rng-jogo'),
    inatividade: document.getElementById('rng-inatividade'),
  };
  const values = {
    jogo: document.getElementById('val-jogo'),
    inatividade: document.getElementById('val-inatividade'),
  };

  let config = loadConfig();
  let secondsLeft = config.jogo;
  let timerId = null;
  let grid = [];
  let placements = new Map(); // normalized word -> path
  let foundWords = new Set();
  let cellEls = [];
  let currentWords = [];
  let anchor = null;
  let dragStarted = false;
  let moved = false;
  let currentPath = [];

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
      return { jogo: clampInt(saved.jogo, 'jogo') };
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

  function paintIntro() {
    introTempo.textContent = config.jogo + ' segundos';
  }

  function openConfig() {
    ranges.jogo.value = config.jogo;
    ranges.inatividade.value = window.OVDGlobalConfig.load().inatividade;
    Object.keys(ranges).forEach(syncValue);
    showScreen('config');
  }

  /* ---------- INATIVIDADE / VIDEO DE ATRACAO ---------- */
  /* Tempo de inatividade e compartilhado com os outros jogos (OVDGlobalConfig). */

  const attract = window.OVDAttract.create({
    video,
    isPaused: () => screens.config.classList.contains('active'), // nao interrompe o operador mexendo nas configuracoes
    onEnter: () => {
      clearInterval(timerId);
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

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function normalize(word) {
    return word
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Z]/g, '');
  }

  function randomInt(n) { return Math.floor(Math.random() * n); }
  function randomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[randomInt(letters.length)];
  }

  function pickRoundWords() {
    const eligible = WORD_POOL.filter(w => normalize(w).length <= GRID_SIZE);
    const shuffled = [...eligible];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, WORDS_PER_GAME);
  }

  function tryPlaceWord(gridArr, size, norm) {
    const attempts = 300;
    for (let a = 0; a < attempts; a++) {
      const [dr, dc] = DIRECTIONS[randomInt(DIRECTIONS.length)];
      const len = norm.length;
      const startR = randomInt(size);
      const startC = randomInt(size);
      const endR = startR + dr * (len - 1);
      const endC = startC + dc * (len - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

      const path = [];
      let fits = true;
      for (let i = 0; i < len; i++) {
        const r = startR + dr * i;
        const c = startC + dc * i;
        const existing = gridArr[r][c];
        if (existing !== null && existing !== norm[i]) { fits = false; break; }
        path.push({ r, c });
      }
      if (!fits) continue;

      path.forEach((cell, i) => { gridArr[cell.r][cell.c] = norm[i]; });
      return path;
    }
    return null;
  }

  function generatePuzzle(words) {
    const size = GRID_SIZE;
    const normWords = words.map(w => ({ display: w, norm: normalize(w) }))
      .sort((a, b) => b.norm.length - a.norm.length);

    for (let retry = 0; retry < 50; retry++) {
      const gridArr = Array.from({ length: size }, () => Array(size).fill(null));
      const placed = new Map();
      let ok = true;

      for (const { norm } of normWords) {
        const path = tryPlaceWord(gridArr, size, norm);
        if (!path) { ok = false; break; }
        placed.set(norm, path);
      }

      if (ok) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (gridArr[r][c] === null) gridArr[r][c] = randomLetter();
          }
        }
        return { gridArr, placed };
      }
    }
    throw new Error('Não foi possível gerar o caça-palavras.');
  }

  function buildBoard() {
    currentWords = pickRoundWords();
    const { gridArr, placed } = generatePuzzle(currentWords);
    grid = gridArr;
    placements = placed;
    foundWords = new Set();

    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    cellEls = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      const rowEls = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = grid[r][c];
        cell.dataset.row = r;
        cell.dataset.col = c;
        board.appendChild(cell);
        rowEls.push(cell);
      }
      cellEls.push(rowEls);
    }

    wordListEl.innerHTML = '';
    currentWords.forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      li.dataset.norm = normalize(w);
      wordListEl.appendChild(li);
    });

    anchor = null;
    dragStarted = false;
    moved = false;
    currentPath = [];
  }

  function initSelection() {
    function cellFromPoint(x, y) {
      const el = document.elementFromPoint(x, y);
      if (!el || !el.classList.contains('cell')) return null;
      return { r: +el.dataset.row, c: +el.dataset.col, el };
    }

    function clearHighlight(cls) {
      currentPath.forEach(cell => cellEls[cell.r][cell.c].classList.remove(cls));
    }

    function straightPath(a, b) {
      const dr = Math.sign(b.r - a.r);
      const dc = Math.sign(b.c - a.c);
      const dist = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c));
      if (dr === 0 && dc === 0) return [a];
      if (!(dr === 0 || dc === 0 || Math.abs(b.r - a.r) === Math.abs(b.c - a.c))) return null;
      const path = [];
      for (let i = 0; i <= dist; i++) {
        path.push({ r: a.r + dr * i, c: a.c + dc * i });
      }
      return path;
    }

    function flashInvalid(path) {
      path.forEach(cell => cellEls[cell.r][cell.c].classList.add('invalid'));
      setTimeout(() => {
        path.forEach(cell => cellEls[cell.r][cell.c].classList.remove('invalid'));
      }, 350);
    }

    function markFound(path, norm) {
      path.forEach(cell => cellEls[cell.r][cell.c].classList.add('found'));
      foundWords.add(norm);
      const li = wordListEl.querySelector(`li[data-norm="${norm}"]`);
      if (li) li.classList.add('found');
      if (foundWords.size === currentWords.length) endGame(true);
    }

    function evaluateSelection(path) {
      clearHighlight('selecting');
      clearHighlight('anchor');
      if (!path || path.length < 2) return;

      const forward = path.map(cell => grid[cell.r][cell.c]).join('');
      const backward = forward.split('').reverse().join('');

      for (const [norm, plannedPath] of placements) {
        if (foundWords.has(norm)) continue;
        if (norm === forward || norm === backward) {
          markFound(path, norm);
          return;
        }
      }
      flashInvalid(path);
    }

    board.addEventListener('pointerdown', (e) => {
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      e.preventDefault();

      if (anchor) {
        // second tap: finalize selection against the pending anchor
        const path = straightPath(anchor, cell) || [anchor];
        currentPath = path;
        evaluateSelection(path);
        anchor = null;
        currentPath = [];
        dragStarted = false;
        moved = false;
        return;
      }

      anchor = cell;
      dragStarted = true;
      moved = false;
      currentPath = [cell];
      cellEls[cell.r][cell.c].classList.add('anchor');
    });

    board.addEventListener('pointermove', (e) => {
      if (!dragStarted || !anchor) return;
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      const path = straightPath(anchor, cell);
      if (!path) return;
      moved = true;

      clearHighlight('selecting');
      currentPath = path;
      path.forEach(c => cellEls[c.r][c.c].classList.add('selecting'));
    });

    window.addEventListener('pointerup', () => {
      if (!dragStarted) return;
      dragStarted = false;
      if (moved) {
        const path = currentPath;
        cellEls[anchor.r][anchor.c].classList.remove('anchor');
        evaluateSelection(path);
        anchor = null;
        currentPath = [];
        moved = false;
      }
      // if not moved, keep anchor pending for a second tap
    });
  }

  function startTimer() {
    secondsLeft = config.jogo;
    updateTimerText();
    timerPill.classList.remove('warning');
    clearInterval(timerId);
    timerId = setInterval(() => {
      secondsLeft--;
      updateTimerText();
      if (secondsLeft <= 10) timerPill.classList.add('warning');
      if (secondsLeft <= 0) {
        clearInterval(timerId);
        endGame(false);
      }
    }, 1000);
  }

  function updateTimerText() {
    const m = String(Math.max(secondsLeft, 0) / 60 | 0).padStart(2, '0');
    const s = String(Math.max(secondsLeft, 0) % 60).padStart(2, '0');
    timerText.textContent = `${m}:${s}`;
  }

  function endGame(won) {
    clearInterval(timerId);
    showScreen(won ? 'win' : 'lose');
  }

  function startGame() {
    buildBoard();
    showScreen('game');
    startTimer();
  }

  initSelection();

  Object.keys(ranges).forEach(key => {
    ranges[key].addEventListener('input', () => syncValue(key));
  });

  document.getElementById('btn-config-open').addEventListener('click', openConfig);
  document.getElementById('btn-config-cancel').addEventListener('click', () => showScreen('intro'));
  document.getElementById('btn-config-save').addEventListener('click', () => {
    config = { jogo: clampInt(ranges.jogo.value, 'jogo') };
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
