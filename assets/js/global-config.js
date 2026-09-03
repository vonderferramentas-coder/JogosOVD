// Configuracao compartilhada por TODOS os jogos + menu principal (nao e por jogo).
// Hoje guarda so o tempo de inatividade (video de atracao), mas e o lugar certo
// para qualquer outro ajuste que deva valer para o totem como um todo.
(() => {
  const STORAGE_KEY = 'ovd_config_global';
  const DEFAULTS = { inatividade: 180 };
  const LIMITS = { inatividade: { min: 30, max: 600 } };

  // Quando o totem roda direto do arquivo (file://) alguns navegadores bloqueiam
  // o localStorage. Nesse caso a config vale so enquanto a pagina estiver aberta.
  let fallback = null;

  function clampInatividade(value) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return DEFAULTS.inatividade;
    return Math.min(Math.max(n, LIMITS.inatividade.min), LIMITS.inatividade.max);
  }

  function load() {
    let raw = fallback;
    try { raw = localStorage.getItem(STORAGE_KEY) ?? fallback; } catch (e) { /* file:// */ }
    if (!raw) return { inatividade: DEFAULTS.inatividade };
    try {
      const saved = JSON.parse(raw);
      return { inatividade: clampInatividade(saved.inatividade) };
    } catch (e) {
      return { inatividade: DEFAULTS.inatividade };
    }
  }

  function save(next) {
    const clamped = { inatividade: clampInatividade(next.inatividade) };
    fallback = JSON.stringify(clamped);
    try { localStorage.setItem(STORAGE_KEY, fallback); } catch (e) { /* file:// */ }
    return clamped;
  }

  function formatInatividade(n) {
    if (n >= 60) {
      const min = Math.floor(n / 60);
      const sec = n % 60;
      return n + 's (' + (sec ? min + 'min ' + sec + 's' : min + ' min') + ')';
    }
    return n + 's';
  }

  window.OVDGlobalConfig = { load, save, formatInatividade, LIMITS, DEFAULTS };
})();

// Controlador generico de inatividade + video de atracao.
// Cada tela cuida da propria troca de tela (showScreen) e limpeza de estado
// (timers do jogo em andamento, etc); este modulo so decide QUANDO entrar/sair
// do modo atracao e toca/pausa o <video>, sempre lendo o tempo do OVDGlobalConfig.
window.OVDAttract = (() => {
  function create({ video, isPaused, onEnter, onExit }) {
    let idleId = null;
    let videoOk = true;

    video.addEventListener('error', () => { videoOk = false; });

    function reset() {
      clearTimeout(idleId);
      const config = window.OVDGlobalConfig.load();
      idleId = setTimeout(start, config.inatividade * 1000);
    }

    function start() {
      if (isPaused && isPaused()) { reset(); return; }
      // sem o arquivo de video, a inatividade so devolve o totem para a abertura
      if (!videoOk) { reset(); return; }

      onEnter();
      try { video.currentTime = 0; } catch (e) { /* ainda sem metadata */ }
      const playing = video.play();
      if (playing && playing.catch) {
        playing.catch(() => { videoOk = false; onExit(); reset(); });
      }
    }

    function stop() {
      video.pause();
      onExit();
      reset();
    }

    return { reset, stop };
  }

  return { create };
})();
