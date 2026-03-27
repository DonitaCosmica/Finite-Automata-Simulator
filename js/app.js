/** @type {Automata} Autómata actualmente seleccionado */
let currentAutomata = null;

/** @type {SimState | null} Estado de simulación activo (paso a paso) */
let simState = null;

const UI = {
  runFull,
  stepForward: stepForwardUI,
  reset: resetUI
};

/**
 * Punto de entrada principal. Se llama al cargar el DOM.
 * Construye la lista de ejemplos y carga el primero por defecto.
 */
function init() {
  const listEl = document.getElementById('examples');

  EXAMPLES.forEach((ex, i) => {
    const btn = document.createElement('button');
    btn.className = 'example-btn' + (i === 0 ? ' active' : '');
    btn.dataset.id = ex.id;
    btn.innerHTML = `
      <div class="example-name">${ex.name}</div>
      <div class="example-desc">${ex.desc}</div>
    `;
    btn.addEventListener('click', () => loadExample(ex));
    listEl.appendChild(btn);
  });

  // Cargar el primer ejemplo al inicio
  loadExample(EXAMPLES[0]);

  // Atajos de teclado
  document.getElementById('input-string').addEventListener('keydown', e => {
    if (e.key === 'Enter') runFull();
  });
}

/**
 * Carga un autómata en el simulador, reseteando cualquier simulación previa.
 * @param {Automata} automata
 */
function loadExample(automata) {
  currentAutomata = automata;
  simState = null;

  // Actualizar botones del sidebar
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === automata.id);
  });

  // Sugerir la primera cadena de prueba
  const inputEl = document.getElementById('input-string');
  inputEl.value = automata.testStrings[0] ?? '';
  inputEl.placeholder = automata.testStrings.slice(0, 3).join(', ');

  resetUI();
  _updateInfoStrip();
}

/**
 * Ejecuta la simulación completa de una sola vez (sin paso a paso).
 */
function runFull() {
  if (!currentAutomata) return;

  const input = document.getElementById('input-string').value;
  const result = runAll(currentAutomata, input);

  // Reconstruir simState con el resultado final para que el canvas
  // muestre el estado correcto y la traza completa
  simState = createSimState(currentAutomata, input);
  simState.currentState = result.finalState;
  simState.pos = input.length;
  simState.done = true;
  simState.accepted = result.accepted;
  simState.trace = result.trace;

  _renderStepDisplay(input.length);
  _renderTrace(result.trace);
  _showResult(result.accepted, result.finalState);
  _updateCanvas(!result.accepted);
  _updateInfoStep(input.length, input.length);
  document.getElementById('info-current').textContent = result.finalState;
}

/**
 * Avanza la simulación un símbolo (modo paso a paso).
 * Si no hay simulación activa, crea una nueva.
 */
function stepForwardUI() {
  if (!currentAutomata) return;

  const input = document.getElementById('input-string').value;

  // Crear nueva simulación si no hay una activa o ya terminó
  if (!simState || simState.done) {
    simState = createSimState(currentAutomata, input);
    _clearTrace();
    _addTraceEntry(simState.trace[0]);
    _renderStepDisplay(0);
    _updateCanvas(false);
    document.getElementById('info-current').textContent = currentAutomata.initial;
    _updateInfoStep(0, input.length);
    return;
  }

  const result = stepForward(simState);

  _renderStepDisplay(simState.pos);
  _updateInfoStep(simState.pos, simState.string.length);
  document.getElementById('info-current').textContent = simState.currentState;

  // Añadir las entradas nuevas de la traza a la UI
  const lastEntry = simState.trace[simState.trace.length - 1];
  _addTraceEntry(lastEntry);

  if (result.done) {
    _showResult(simState.accepted, simState.currentState);
    _updateCanvas(!simState.accepted);
  } else {
    _updateCanvas(false, result.transition);
  }
}

/**
 * Reinicia la simulación y limpia todos los elementos de UI.
 */
function resetUI() {
  simState = null;

  document.getElementById('result-panel').className = 'result-panel';
  document.getElementById('step-display').innerHTML = '';
  document.getElementById('info-current').textContent = '—';
  document.getElementById('info-step').textContent = '0 / 0';

  _clearTrace();
  _showTracePlaceholder();

  if (currentAutomata) {
    renderAutomata(
      document.getElementById('canvas-svg'),
      currentAutomata
    );
  }
}

/**
 * Renderiza el canvas SVG con el estado actual de la simulación.
 * @param {boolean} rejected
 * @param {{ from, to, symbol } | null} activeTransition
 */
function _updateCanvas(rejected = false, activeTransition = null) {
  renderAutomata(
    document.getElementById('canvas-svg'),
    currentAutomata,
    {
      activeState:      simState?.currentState ?? null,
      activeTransition,
      rejected
    }
  );
}

/**
 * Muestra u oculta el panel de resultado (aceptado / rechazado).
 * @param {boolean} accepted
 * @param {string}  finalState
 */
function _showResult(accepted, finalState) {
  const panel = document.getElementById('result-panel');
  panel.className = 'result-panel ' + (accepted ? 'accepted' : 'rejected');
  document.getElementById('result-title').textContent =
    accepted ? '✓ CADENA ACEPTADA' : '✗ CADENA RECHAZADA';
  document.getElementById('result-body').textContent = accepted
    ? `El estado "${finalState}" es un estado de aceptación.`
    : `El estado "${finalState}" no es un estado de aceptación.`;
}

/**
 * Actualiza el display visual de caracteres (resalta el carácter actual).
 * @param {number} pos — posición ya procesada
 */
function _renderStepDisplay(pos) {
  const container = document.getElementById('step-display');
  container.innerHTML = '';
  const str = simState?.string ?? document.getElementById('input-string').value;

  for (let i = 0; i < str.length; i++) {
    const span = document.createElement('div');
    span.className = 'step-char ' + (
      i < pos  ? 'processed'    :
      i === pos ? 'current-char' : ''
    );
    span.textContent = str[i];
    container.appendChild(span);
  }
}

/**
 * Agrega una entrada a la lista de traza en el sidebar.
 * @param {TraceEntry} entry
 */
function _addTraceEntry(entry) {
  const list = document.getElementById('trace-list');
  const placeholder = document.getElementById('trace-placeholder');
  if (placeholder) placeholder.remove();

  const item = document.createElement('div');
  item.className = 'trace-item' + (
    entry.type === 'result' && simState?.accepted  ? ' current' :
    entry.type === 'result' && !simState?.accepted ? ' error'   :
    entry.type === 'error'                         ? ' error'   : ''
  );
  item.textContent = entry.message;
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
}

/**
 * Renderiza toda la traza de golpe (usado en modo runFull).
 * @param {TraceEntry[]} trace
 */
function _renderTrace(trace) {
  _clearTrace();
  trace.forEach(entry => _addTraceEntry(entry));
}

/** Limpia todos los elementos de la lista de traza. */
function _clearTrace() {
  document.getElementById('trace-list').innerHTML = '';
}

/** Muestra el mensaje placeholder en la traza cuando no hay simulación. */
function _showTracePlaceholder() {
  const list = document.getElementById('trace-list');
  list.innerHTML = `
    <div class="trace-item" id="trace-placeholder"
         style="color: var(--text3); font-style: italic;">
      Ejecuta una cadena para ver la traza...
    </div>
  `;
}

/**
 * Actualiza el contador de pasos en la info strip.
 * @param {number} current
 * @param {number} total
 */
function _updateInfoStep(current, total) {
  document.getElementById('info-step').textContent = `${current} / ${total}`;
}

/**
 * Actualiza el nombre del autómata y el alfabeto en la info strip.
 */
function _updateInfoStrip() {
  document.getElementById('info-name').textContent = currentAutomata.name;

  const alphaEl = document.getElementById('info-alphabet');
  alphaEl.innerHTML = '';
  currentAutomata.alphabet.forEach(symbol => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = `'${symbol}'`;
    alphaEl.appendChild(tag);
  });
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
