(() => {
  const QUESTION_POOL = [
    { question: 'Em que ano a VONDER lançou seu primeiro produto?', options: ['1995', '1997', '2003', '2010'], correct: 1 },
    { question: 'Qual foi o primeiro produto lançado pela VONDER?', options: ['Furadeira de impacto', 'Trena a laser', 'Lubrificante em spray (VONDER LUB)', 'Parafusadeira a bateria'], correct: 2 },
    { question: 'A VONDER é a principal marca de qual grupo?', options: ['Grupo PFV', 'Grupo OVD', 'Grupo Brasil', 'Grupo VONDER'], correct: 1 },
    { question: 'Qual ferramenta é indicada para apertar ou soltar parafusos com fenda cruzada?', options: ['Alicate', 'Chave Phillips', 'Martelo', 'Trena'], correct: 1 },
    { question: 'Qual ferramenta é utilizada principalmente para fazer furos?', options: ['Furadeira', 'Lixadeira', 'Serra manual', 'Torquês'], correct: 0 },
    { question: 'Qual ferramenta é usada para medir comprimentos?', options: ['Esquadro', 'Trena', 'Alicate', 'Formão'], correct: 1 },
    { question: 'Qual ferramenta é indicada para bater e fixar pregos?', options: ['Martelo', 'Chave combinada', 'Estilete', 'Nível'], correct: 0 },
    { question: 'Qual ferramenta é utilizada para verificar se uma superfície está nivelada?', options: ['Paquímetro', 'Nível', 'Serrote', 'Grampo'], correct: 1 },
    { question: 'Qual ferramenta pode ser usada para segurar, dobrar ou cortar fios?', options: ['Alicate', 'Trena', 'Martelo', 'Esquadro'], correct: 0 },
    { question: 'Qual ferramenta elétrica é indicada para lixar superfícies?', options: ['Martelete', 'Lixadeira', 'Parafusadeira', 'Soprador térmico'], correct: 1 },
    { question: 'Qual ferramenta é utilizada para apertar porcas e parafusos sextavados?', options: ['Chave de boca', 'Estilete', 'Formão', 'Serrote'], correct: 0 },
    { question: 'Qual equipamento é utilizado para cortar madeira manualmente?', options: ['Serrote', 'Trena', 'Nível', 'Torquímetro'], correct: 0 },
    { question: 'Qual ferramenta permite apertar parafusos de maneira rápida e motorizada?', options: ['Plaina', 'Parafusadeira', 'Lixadeira', 'Esmerilhadeira'], correct: 1 },
    { question: 'Qual ferramenta é indicada para conferir ângulos de 90°?', options: ['Esquadro', 'Trena', 'Martelo', 'Alicate de pressão'], correct: 0 },
    { question: 'Para que serve uma chave Allen?', options: ['Cortar chapas', 'Apertar parafusos com encaixe hexagonal interno', 'Medir superfícies', 'Lixar madeira'], correct: 1 },
    { question: 'Qual ferramenta possui uma lâmina retrátil e é usada para cortes leves?', options: ['Estilete', 'Martelo', 'Soquete', 'Torquímetro'], correct: 0 },
    { question: 'Qual ferramenta é indicada para remover ou apertar parafusos e porcas com soquetes?', options: ['Catraca', 'Formão', 'Lima', 'Arco de serra'], correct: 0 },
    { question: 'Qual ferramenta é utilizada para desbastar, cortar ou lixar diferentes materiais com discos?', options: ['Esmerilhadeira', 'Trena', 'Chave Phillips', 'Grampo'], correct: 0 },
    { question: 'Qual acessório é instalado em uma furadeira para realizar o furo?', options: ['Broca', 'Disco de corte', 'Soquete', 'Lâmina de serra'], correct: 0 },
    { question: 'Qual tipo de broca é normalmente utilizada para perfurar concreto?', options: ['Broca para madeira', 'Broca para concreto', 'Broca chata', 'Broca escalonada para chapa'], correct: 1 },
    { question: 'Qual ferramenta é indicada para trabalhos de impacto e perfuração em concreto e alvenaria?', options: ['Martelete', 'Plaina', 'Lixadeira orbital', 'Serra tico-tico'], correct: 0 },
    { question: 'Qual ferramenta é indicada para cortes curvos em madeira utilizando uma lâmina de movimento alternado?', options: ['Serra tico-tico', 'Esmerilhadeira', 'Martelete', 'Torquímetro'], correct: 0 },
    { question: 'Qual ferramenta é especialmente indicada para realizar cortes retos em madeira utilizando disco?', options: ['Serra circular', 'Furadeira', 'Parafusadeira', 'Lixadeira roto-orbital'], correct: 0 },
    { question: 'Qual ferramenta manual é utilizada para retirar pequenas quantidades de material de uma superfície?', options: ['Lima', 'Trena', 'Chave Phillips', 'Nível'], correct: 0 },
    { question: 'Qual ferramenta pode manter duas peças pressionadas durante uma montagem?', options: ['Grampo', 'Serrote', 'Broca', 'Soquete'], correct: 0 },
    { question: 'Qual ferramenta é utilizada para aplicar um torque específico em porcas e parafusos?', options: ['Torquímetro', 'Alicate universal', 'Martelo', 'Estilete'], correct: 0 },
    { question: 'Qual instrumento permite medir dimensões externas, internas e profundidades com precisão?', options: ['Paquímetro', 'Trena', 'Nível', 'Esquadro'], correct: 0 },
    { question: 'Qual ferramenta é utilizada para cortar tubos e barras metálicas manualmente?', options: ['Arco de serra', 'Martelo de borracha', 'Chave Allen', 'Grampo'], correct: 0 },
    { question: 'Qual ferramenta é indicada para remover revestimentos, tinta ou resíduos utilizando uma lâmina?', options: ['Espátula', 'Trena', 'Chave combinada', 'Furadeira'], correct: 0 },
    { question: 'Qual ferramenta permite apertar diferentes tamanhos de porcas por possuir abertura regulável?', options: ['Chave ajustável', 'Chave Phillips', 'Chave Allen', 'Chave de fenda'], correct: 0 },
    { question: 'Qual ferramenta possui uma mandíbula ajustável e pode prender peças com firmeza?', options: ['Alicate de pressão', 'Esquadro', 'Trena', 'Lima'], correct: 0 },
    { question: 'Qual ferramenta é usada para cortar cabos ou fios elétricos?', options: ['Alicate de corte', 'Martelo', 'Chave de boca', 'Trena'], correct: 0 },
    { question: 'Qual ferramenta é utilizada para retirar a camada isolante de um fio elétrico?', options: ['Alicate desencapador', 'Torquímetro', 'Serra circular', 'Chave ajustável'], correct: 0 },
    { question: 'Qual ferramenta é indicada para fazer rasgos, entalhes ou acabamentos em madeira?', options: ['Formão', 'Trena', 'Chave combinada', 'Soquete'], correct: 0 },
    { question: 'Qual ferramenta elétrica é utilizada para aplainar e regularizar superfícies de madeira?', options: ['Plaina elétrica', 'Martelete', 'Esmerilhadeira', 'Furadeira de impacto'], correct: 0 },
    { question: 'Qual ferramenta é indicada para cortar tubos de PVC com precisão?', options: ['Cortador de tubos', 'Chave Phillips', 'Nível', 'Alicate de pressão'], correct: 0 },
    { question: 'Qual equipamento é utilizado para produzir ar quente concentrado?', options: ['Soprador térmico', 'Compressor', 'Aspirador', 'Lixadeira'], correct: 0 },
    { question: 'Qual equipamento produz ar comprimido para alimentar determinadas ferramentas pneumáticas?', options: ['Compressor de ar', 'Serra circular', 'Parafusadeira', 'Politriz'], correct: 0 },
    { question: 'Qual ferramenta elétrica é indicada para polir superfícies?', options: ['Politriz', 'Martelete', 'Serra sabre', 'Furadeira de bancada'], correct: 0 },
    { question: 'Qual ferramenta utiliza uma lâmina longa com movimento alternado e é muito usada em cortes de demolição?', options: ['Serra sabre', 'Serra circular', 'Plaina', 'Lixadeira orbital'], correct: 0 },
    { question: 'Qual ferramenta é indicada para fixar grampos em madeira, tecidos e outros materiais?', options: ['Grampeador manual', 'Martelo de borracha', 'Chave Allen', 'Paquímetro'], correct: 0 },
    { question: 'Para que serve um martelo de borracha?', options: ['Golpear peças reduzindo o risco de marcar a superfície', 'Cortar metais', 'Medir ângulos', 'Apertar parafusos'], correct: 0 },
    { question: 'Qual ferramenta é indicada para apertar e soltar parafusos de cabeça com uma única fenda reta?', options: ['Chave de fenda', 'Chave Phillips', 'Chave Allen', 'Chave estrela'], correct: 0 },
    { question: 'Qual é a principal característica de uma chave combinada?', options: ['Possui uma extremidade de boca e outra estrela', 'Possui uma lâmina de corte', 'Possui escala de medição', 'Possui mandril para brocas'], correct: 0 },
    { question: 'Qual parte da furadeira normalmente prende a broca?', options: ['Mandril', 'Empunhadura', 'Gatilho', 'Cabo elétrico'], correct: 0 },
    { question: 'O que significa uma ferramenta ser "a bateria"?', options: ['Funciona com energia armazenada em uma bateria recarregável', 'Funciona somente com ar comprimido', 'Precisa estar sempre conectada à tomada', 'Funciona apenas manualmente'], correct: 0 },
    { question: 'Qual acessório deve ser escolhido de acordo com o material que será perfurado?', options: ['Broca', 'Trena', 'Nível', 'Martelo'], correct: 0 },
    { question: 'Antes de trocar um disco ou uma lâmina de uma ferramenta elétrica, o mais seguro é:', options: ['Desligar a ferramenta e desconectá-la da fonte de energia', 'Aumentar a rotação', 'Pressionar o gatilho', 'Manter a ferramenta funcionando'], correct: 0 },
    { question: 'Qual EPI é especialmente importante em atividades que podem lançar partículas nos olhos?', options: ['Óculos de segurança', 'Joelheira', 'Avental comum', 'Boné'], correct: 0 },
    { question: 'Em atividades com ferramentas muito ruidosas, qual proteção pode ser necessária?', options: ['Protetor auditivo', 'Óculos de leitura', 'Boné', 'Cinto comum'], correct: 0 },
    { question: 'Qual ferramenta elétrica pode apresentar função de impacto para facilitar perfurações em alvenaria?', options: ['Furadeira de impacto', 'Politriz', 'Plaina', 'Lixadeira orbital'], correct: 0 },
    { question: 'Para que serve um detector de tensão elétrica?', options: ['Verificar a presença de tensão em uma instalação ou condutor compatível com o equipamento', 'Medir comprimento', 'Fazer furos em concreto', 'Cortar madeira'], correct: 0 },
    { question: 'Qual ferramenta é mais indicada para verificar rapidamente alinhamentos horizontais e verticais em instalações?', options: ['Nível', 'Alicate universal', 'Martelo', 'Chave de boca'], correct: 0 },
  ];

  const ANSWER_DELAY = 1100;

  const STORAGE_KEY = 'ovd_quiz_config';
  const DEFAULTS = { perguntas: 3 };
  const LIMITS = { perguntas: { min: 3, max: 10 } };

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
  const progressText = document.getElementById('progress-text');
  const questionText = document.getElementById('question-text');
  const optionsEl = document.getElementById('options');
  const video = document.getElementById('attract-video');
  const introPerguntas = document.getElementById('intro-perguntas');

  const ranges = {
    perguntas: document.getElementById('rng-perguntas'),
    inatividade: document.getElementById('rng-inatividade'),
  };
  const values = {
    perguntas: document.getElementById('val-perguntas'),
    inatividade: document.getElementById('val-inatividade'),
  };

  let config = loadConfig();
  let roundQuestions = [];
  let currentQuestion = 0;
  let correctCount = 0;
  let locked = false;

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
      return { perguntas: clampInt(saved.perguntas, 'perguntas') };
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
    values[key].textContent = parseInt(ranges[key].value, 10);
  }

  function paintIntro() {
    introPerguntas.textContent = config.perguntas;
  }

  function openConfig() {
    ranges.perguntas.value = config.perguntas;
    ranges.inatividade.value = window.OVDGlobalConfig.load().inatividade;
    Object.keys(ranges).forEach(syncValue);
    showScreen('config');
  }

  /* ---------- INATIVIDADE / VIDEO DE ATRACAO ---------- */
  /* Tempo de inatividade e compartilhado com os outros jogos (OVDGlobalConfig). */

  const attract = window.OVDAttract.create({
    video,
    isPaused: () => screens.config.classList.contains('active'), // nao interrompe o operador mexendo nas configuracoes
    onEnter: () => showScreen('video'),
    onExit: () => showScreen('intro'),
  });

  function onActivity() {
    if (screens.video.classList.contains('active')) attract.stop();
    else attract.reset();
  }

  ['pointerdown', 'keydown'].forEach(ev => {
    document.addEventListener(ev, onActivity, true);
  });

  function randomInt(n) { return Math.floor(Math.random() * n); }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickRoundQuestions() {
    return shuffle(QUESTION_POOL)
      .slice(0, config.perguntas)
      .map(q => {
        const shuffledOptions = shuffle(q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct })));
        return {
          question: q.question,
          options: shuffledOptions.map(o => o.opt),
          correct: shuffledOptions.findIndex(o => o.isCorrect),
        };
      });
  }

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function renderQuestion() {
    const q = roundQuestions[currentQuestion];
    progressText.textContent = `Pergunta ${currentQuestion + 1}/${roundQuestions.length}`;
    questionText.textContent = q.question;

    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.innerHTML = `<span class="option-number">${i + 1}</span><span class="option-text">${opt}</span>`;
      btn.addEventListener('click', () => onAnswer(i, btn));
      optionsEl.appendChild(btn);
    });

    locked = false;
  }

  function onAnswer(index, btn) {
    if (locked) return;
    locked = true;

    const q = roundQuestions[currentQuestion];
    const allOptions = optionsEl.querySelectorAll('.option');
    allOptions.forEach(el => el.classList.add('disabled'));

    if (index === q.correct) {
      correctCount++;
      btn.classList.add('correct');
    } else {
      btn.classList.add('wrong');
      allOptions[q.correct].classList.add('correct');
    }

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < roundQuestions.length) {
        renderQuestion();
      } else {
        endGame(correctCount === roundQuestions.length);
      }
    }, ANSWER_DELAY);
  }

  function endGame(won) {
    showScreen(won ? 'win' : 'lose');
  }

  function startGame() {
    roundQuestions = pickRoundQuestions();
    currentQuestion = 0;
    correctCount = 0;
    renderQuestion();
    showScreen('game');
  }

  Object.keys(ranges).forEach(key => {
    ranges[key].addEventListener('input', () => syncValue(key));
  });

  document.getElementById('btn-config-open').addEventListener('click', openConfig);
  document.getElementById('btn-config-cancel').addEventListener('click', () => showScreen('intro'));
  document.getElementById('btn-config-save').addEventListener('click', () => {
    config = { perguntas: clampInt(ranges.perguntas.value, 'perguntas') };
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
