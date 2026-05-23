/* ── CAÇADOR: A REVANCHE — Ficha de Personagem ── */
/* script.js */

const LS_KEY = 'cacador_revanche_ficha';

/* ─────────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────────── */
const state = {
  /* campos de texto simples (id do elemento) */
  text: {},
  /* bolinhas & caixas: key → valor (int) */
  dots: {},
  /* listas dinâmicas */
  trunfos: Array.from({ length: 9 }, () => ({ nome: '', val: 0 })),
  quals:   Array.from({ length: 12 }, () => ({ nome: '', val: 0 })),
  equips:  Array.from({ length: 14 }, () => ({ nome: '' })),
};

/* IDs dos campos de texto simples */
const TEXT_IDS = [
  'nome','conceito','credo','celula','ambicao','desejo',
  'impeto','redencao','principios','pilares','credo_campos',
  'xp_total','xp_gasta','idade','nascimento','aparencia',
  'caracteristicas','notas','historia',
];

/* ─────────────────────────────────────────────
   UTILITÁRIOS
───────────────────────────────────────────── */
function showStatus(msg, type = 'ok', duration = 2800) {
  const bar = document.getElementById('status-bar');
  bar.textContent = msg;
  bar.className = `status-bar show ${type}`;
  clearTimeout(bar._t);
  bar._t = setTimeout(() => { bar.className = 'status-bar'; }, duration);
}

/* ─────────────────────────────────────────────
   BOLINHAS (dots)
───────────────────────────────────────────── */
function initDots(container) {
  const key = container.dataset.key;
  const max = parseInt(container.dataset.max, 10);
  state.dots[key] = state.dots[key] || 0;

  for (let i = 1; i <= max; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i <= state.dots[key] ? ' filled' : '');
    d.dataset.i = i;
    d.addEventListener('click', () => {
      /* clicar na mesma bolinha preenchida zera a partir dela */
      state.dots[key] = (state.dots[key] === i) ? i - 1 : i;
      refreshDots(container, key, max);
      autoSave();
    });
    container.appendChild(d);
  }
}

function refreshDots(container, key, max) {
  container.querySelectorAll('.dot').forEach((d, idx) => {
    d.classList.toggle('filled', idx < state.dots[key]);
  });
}

/* ─────────────────────────────────────────────
   CAIXAS (track boxes)
───────────────────────────────────────────── */
function initBoxes(container) {
  const key = container.dataset.key;
  const max = parseInt(container.dataset.max, 10);
  state.dots[key] = state.dots[key] || 0;

  for (let i = 1; i <= max; i++) {
    const b = document.createElement('div');
    b.className = 'tbox' + (i <= state.dots[key] ? ' filled' : '');
    b.dataset.i = i;
    b.addEventListener('click', () => {
      state.dots[key] = (state.dots[key] === i) ? i - 1 : i;
      container.querySelectorAll('.tbox').forEach((el, idx) => {
        el.classList.toggle('filled', idx < state.dots[key]);
      });
      autoSave();
    });
    container.appendChild(b);
  }
}

/* ─────────────────────────────────────────────
   LISTAS DINÂMICAS (trunfos / quals / equips)
───────────────────────────────────────────── */
function buildTrunfos() {
  const c = document.getElementById('trunfos-container');
  c.innerHTML = '';
  state.trunfos.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'trunfo-row';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Trunfo ou distinção…';
    inp.value = item.nome || '';
    inp.addEventListener('input', () => { state.trunfos[i].nome = inp.value; autoSave(); });

    const dotsEl = document.createElement('div');
    dotsEl.className = 'dots';
    dotsEl.dataset.key = `trunfo_${i}`;
    dotsEl.dataset.max = '5';
    state.dots[`trunfo_${i}`] = item.val || 0;
    row.appendChild(inp);
    row.appendChild(dotsEl);
    c.appendChild(row);
    initDots(dotsEl);
    /* sync val back */
    dotsEl.addEventListener('click', () => { state.trunfos[i].val = state.dots[`trunfo_${i}`]; });
  });
}

function buildQuals() {
  const c = document.getElementById('quals-container');
  c.innerHTML = '';
  state.quals.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'qual-row';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Qualidade ou defeito…';
    inp.value = item.nome || '';
    inp.addEventListener('input', () => { state.quals[i].nome = inp.value; autoSave(); });

    const dotsEl = document.createElement('div');
    dotsEl.className = 'dots';
    dotsEl.dataset.key = `qual_${i}`;
    dotsEl.dataset.max = '5';
    state.dots[`qual_${i}`] = item.val || 0;
    row.appendChild(inp);
    row.appendChild(dotsEl);
    c.appendChild(row);
    initDots(dotsEl);
    dotsEl.addEventListener('click', () => { state.quals[i].val = state.dots[`qual_${i}`]; });
  });
}

function buildEquips() {
  const c = document.getElementById('equip-container');
  c.innerHTML = '';
  state.equips.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'equip-row';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Item…';
    inp.value = item.nome || '';
    inp.addEventListener('input', () => { state.equips[i].nome = inp.value; autoSave(); });
    row.appendChild(inp);
    c.appendChild(row);
  });
}

/* ─────────────────────────────────────────────
   LEITURA / ESCRITA DE TEXTO
───────────────────────────────────────────── */
function readTextFields() {
  const out = {};
  TEXT_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) out[id] = el.value;
  });
  return out;
}

function writeTextFields(data) {
  TEXT_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && data[id] !== undefined) el.value = data[id];
  });
}

/* ─────────────────────────────────────────────
   SERIALIZAÇÃO
───────────────────────────────────────────── */
function snapshot() {
  return {
    _version: 1,
    text: readTextFields(),
    dots: { ...state.dots },
    trunfos: state.trunfos.map((t, i) => ({
      nome: t.nome, val: state.dots[`trunfo_${i}`] || 0
    })),
    quals: state.quals.map((q, i) => ({
      nome: q.nome, val: state.dots[`qual_${i}`] || 0
    })),
    equips: state.equips.map(e => ({ nome: e.nome })),
  };
}

function applySnapshot(data) {
  if (!data || typeof data !== 'object') return;

  if (data.text) writeTextFields(data.text);

  if (data.dots) Object.assign(state.dots, data.dots);

  if (data.trunfos) {
    state.trunfos = data.trunfos.map(t => ({ nome: t.nome || '', val: t.val || 0 }));
    while (state.trunfos.length < 9) state.trunfos.push({ nome: '', val: 0 });
  }
  if (data.quals) {
    state.quals = data.quals.map(q => ({ nome: q.nome || '', val: q.val || 0 }));
    while (state.quals.length < 12) state.quals.push({ nome: '', val: 0 });
  }
  if (data.equips) {
    state.equips = data.equips.map(e => ({ nome: e.nome || '' }));
    while (state.equips.length < 14) state.equips.push({ nome: '' });
  }

  buildTrunfos();
  buildQuals();
  buildEquips();

  /* refresh todos os dots/boxes no DOM */
  document.querySelectorAll('.dots[data-key]').forEach(el => {
    const key = el.dataset.key;
    const max = parseInt(el.dataset.max, 10);
    if (state.dots[key] !== undefined) refreshDots(el, key, max);
  });
  document.querySelectorAll('.track-boxes[data-key]').forEach(el => {
    const key = el.dataset.key;
    el.querySelectorAll('.tbox').forEach((b, idx) => {
      b.classList.toggle('filled', idx < (state.dots[key] || 0));
    });
  });
}

/* ─────────────────────────────────────────────
   LOCALSTORAGE
───────────────────────────────────────────── */
let _autoSaveTimer = null;
function autoSave() {
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(saveToLS, 600);
}

function saveToLS() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(snapshot()));
    showStatus('✓  Salvo automaticamente no navegador', 'ok');
  } catch (e) {
    showStatus('Erro ao salvar no navegador', 'err');
  }
}

function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    applySnapshot(JSON.parse(raw));
    showStatus('Ficha carregada do navegador', 'info');
    return true;
  } catch (e) {
    showStatus('Erro ao carregar do navegador', 'err');
    return false;
  }
}

/* ─────────────────────────────────────────────
   JSON DOWNLOAD
───────────────────────────────────────────── */
function exportJSON() {
  const data = snapshot();
  const nome = (data.text && data.text.nome) ? data.text.nome.trim() : 'personagem';
  const filename = `cacador-${nome.replace(/\s+/g, '_') || 'ficha'}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showStatus(`✓  Baixado: ${filename}`, 'ok');
}

/* ─────────────────────────────────────────────
   JSON IMPORT
───────────────────────────────────────────── */
function importJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      applySnapshot(data);
      saveToLS();
      showStatus('✓  Ficha importada com sucesso!', 'ok');
    } catch (err) {
      showStatus('Arquivo JSON inválido', 'err');
    }
  };
  reader.readAsText(file);
}

/* ─────────────────────────────────────────────
   INICIALIZAÇÃO
───────────────────────────────────────────── */
function init() {
  /* dots de atributos e habilidades */
  document.querySelectorAll('.dots[data-key]').forEach(initDots);

  /* track boxes */
  document.querySelectorAll('.track-boxes[data-key]').forEach(initBoxes);

  /* listas dinâmicas */
  buildTrunfos();
  buildQuals();
  buildEquips();

  /* escutar mudanças nos campos de texto */
  TEXT_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', autoSave);
  });

  /* botões */
  document.getElementById('btn-save').addEventListener('click', () => {
    saveToLS();
    showStatus('✓  Ficha salva no navegador!', 'ok');
  });

  document.getElementById('btn-export').addEventListener('click', exportJSON);

  document.getElementById('btn-import').addEventListener('change', e => {
    importJSON(e.target.files[0]);
    e.target.value = ''; /* reset para permitir importar o mesmo arquivo novamente */
  });

  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });

  /* Antes de imprimir: criar divs-espelho para cada textarea */
  window.addEventListener('beforeprint', injectPrintMirrors);
  window.addEventListener('afterprint', removePrintMirrors);

  /* carregar ficha salva ao abrir */
  loadFromLS();
}

/* Cria uma <div class="print-mirror"> logo apos cada textarea
   com o conteudo completo do campo. O CSS esconde o textarea
   e mostra a div na impressao, sem restricao de altura. */
function injectPrintMirrors() {
  document.querySelectorAll('textarea').forEach(ta => {
    if (ta.nextSibling && ta.nextSibling.classList &&
        ta.nextSibling.classList.contains('print-mirror')) return;
    const mirror = document.createElement('div');
    mirror.className = 'print-mirror';
    mirror.textContent = ta.value;
    ta.parentNode.insertBefore(mirror, ta.nextSibling);
  });
}

function removePrintMirrors() {
  document.querySelectorAll('.print-mirror').forEach(el => el.remove());
}

document.addEventListener('DOMContentLoaded', init);