(() => {
  const GAMES = ['jogo-da-memoria', 'caca-palavras', 'quiz'];
  const STORAGE_KEY = 'ovd_jogos_ativos';

  // Quando o totem roda direto do arquivo (file://) alguns navegadores bloqueiam
  // o localStorage. Nesse caso a escolha vale so enquanto a pagina estiver aberta.
  let fallback = null;

  const screens = {
    select: document.getElementById('screen-select'),
    config: document.getElementById('screen-config'),
    video: document.getElementById('screen-video'),
  };
  const cards = [...document.querySelectorAll('.game-card')];
  const checks = [...document.querySelectorAll('.config-check')];
  const noGames = document.getElementById('no-games');
  const warning = document.getElementById('config-warning');
  const btnSave = document.getElementById('btn-config-save');
  const video = document.getElementById('attract-video');
  const rngInatividade = document.getElementById('rng-inatividade');
  const valInatividade = document.getElementById('val-inatividade');

  function loadEnabled() {
    let raw = fallback;
    try { raw = localStorage.getItem(STORAGE_KEY) ?? fallback; } catch (e) { /* file:// */ }
    if (!raw) return GAMES.slice();
    try {
      const list = JSON.parse(raw).filter(g => GAMES.includes(g));
      return list.length ? list : GAMES.slice();
    } catch (e) {
      return GAMES.slice();
    }
  }

  function saveEnabled(list) {
    fallback = JSON.stringify(list);
    try { localStorage.setItem(STORAGE_KEY, fallback); } catch (e) { /* file:// */ }
  }

  function applyEnabled(list) {
    cards.forEach(card => {
      card.hidden = !list.includes(card.dataset.game);
    });
    noGames.hidden = list.length > 0;
  }

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function checkedGames() {
    return checks.filter(c => c.checked).map(c => c.dataset.game);
  }

  function refreshSaveState() {
    const empty = checkedGames().length === 0;
    warning.hidden = !empty;
    btnSave.disabled = empty;
  }

  function syncInatividade() {
    valInatividade.textContent = window.OVDGlobalConfig.formatInatividade(parseInt(rngInatividade.value, 10));
  }

  function openConfig() {
    const list = loadEnabled();
    checks.forEach(c => { c.checked = list.includes(c.dataset.game); });
    refreshSaveState();
    rngInatividade.value = window.OVDGlobalConfig.load().inatividade;
    syncInatividade();
    showScreen('config');
  }

  checks.forEach(c => c.addEventListener('change', refreshSaveState));
  rngInatividade.addEventListener('input', syncInatividade);

  document.getElementById('btn-config-open').addEventListener('click', openConfig);
  document.getElementById('btn-config-cancel').addEventListener('click', () => showScreen('select'));
  document.getElementById('btn-config-save').addEventListener('click', () => {
    const list = checkedGames();
    if (!list.length) return;
    saveEnabled(list);
    applyEnabled(list);
    window.OVDGlobalConfig.save({ inatividade: rngInatividade.value });
    attract.reset();
    showScreen('select');
  });

  /* ---------- INATIVIDADE / VIDEO DE ATRACAO ---------- */
  /* Tempo de inatividade e compartilhado com os outros jogos (OVDGlobalConfig). */

  const attract = window.OVDAttract.create({
    video,
    isPaused: () => screens.config.classList.contains('active'), // nao interrompe o operador mexendo nas configuracoes
    onEnter: () => showScreen('video'),
    onExit: () => showScreen('select'),
  });

  function onActivity() {
    if (screens.video.classList.contains('active')) attract.stop();
    else attract.reset();
  }

  ['pointerdown', 'keydown'].forEach(ev => {
    document.addEventListener(ev, onActivity, true);
  });

  applyEnabled(loadEnabled());
  attract.reset();
})();
