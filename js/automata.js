/**
 * Crea un nuevo estado de simulación para un autómata y cadena dados.
 * @param {Automata} automata
 * @param {string} inputString
 * @returns {SimState}
 */
function createSimState(automata, inputString) {
  return {
    automata,
    string: inputString,
    pos: 0,
    currentState: automata.initial,
    trace: [
      {
        type: 'init',
        message: `Estado inicial: ${automata.initial}`,
        toState: automata.initial
      }
    ],
    done: false,
    accepted: null
  };
}

/**
 * Avanza la simulación un símbolo hacia adelante (modo paso a paso).
 * Muta el objeto simState directamente.
 * @param {SimState} simState
 * @returns {StepResult}
 */
function stepForward(simState) {
  if (simState.done) {
    return { ok: false, done: true, accepted: simState.accepted, error: 'La simulación ya terminó.' };
  }

  // Si ya consumimos todos los símbolos, evaluar resultado
  if (simState.pos >= simState.string.length) {
    return _finalize(simState);
  }

  const symbol = simState.string[simState.pos];
  const fromState = simState.currentState;
  const nextState = getTransition(simState.automata, fromState, symbol);

  // Sin transición → rechazo por error
  if (nextState === null) {
    const error = `No existe δ(${fromState}, '${symbol}') — transición indefinida`;
    simState.trace.push({ type: 'error', message: error, fromState, symbol });
    simState.done = true;
    simState.accepted = false;
    return { ok: false, done: true, accepted: false, error };
  }

  // Transición válida
  simState.trace.push({
    type: 'step',
    message: `δ(${fromState}, '${symbol}') → ${nextState}`,
    fromState,
    toState: nextState,
    symbol,
    step: simState.pos
  });

  simState.currentState = nextState;
  simState.pos++;

  // Si terminamos la cadena en este paso, finalizar
  if (simState.pos >= simState.string.length) {
    return _finalize(simState);
  }

  return {
    ok: true,
    done: false,
    accepted: null,
    transition: { from: fromState, to: nextState, symbol }
  };
}

/**
 * Ejecuta el autómata completo sobre una cadena de entrada sin paso a paso.
 * No necesita un SimState previo; devuelve el resultado y la traza completa.
 * @param {Automata} automata
 * @param {string} inputString
 * @returns {RunResult}
 */
function runAll(automata, inputString) {
  const sim = createSimState(automata, inputString);

  // Caso especial: cadena vacía
  if (inputString.length === 0) {
    const accepted = isAccepted(automata, automata.initial);
    sim.trace.push({
      type: 'result',
      message: accepted
        ? `✓ Cadena vacía ACEPTADA — ${automata.initial} es estado de aceptación`
        : `✗ Cadena vacía RECHAZADA — ${automata.initial} no es estado de aceptación`,
      toState: automata.initial
    });
    sim.done = true;
    sim.accepted = accepted;
    return { accepted, finalState: automata.initial, trace: sim.trace };
  }

  // Procesar símbolo a símbolo
  let result;
  while (!sim.done) {
    result = stepForward(sim);
  }

  return {
    accepted: sim.accepted,
    finalState: sim.currentState,
    trace: sim.trace
  };
}

/**
 * Verifica si un estado es de aceptación en el autómata dado.
 * @param {Automata} automata
 * @param {string} state
 * @returns {boolean}
 */
function isAccepted(automata, state) {
  return automata.accepting.includes(state);
}

/**
 * Devuelve el estado destino dado un estado origen y un símbolo.
 * Retorna null si no existe la transición.
 * @param {Automata} automata
 * @param {string} state
 * @param {string} symbol
 * @returns {string | null}
 */
function getTransition(automata, state, symbol) {
  const row = automata.transitions[state];
  if (!row) return null;
  return row[symbol] ?? null;
}

/**
 * Marca la simulación como terminada y determina si la cadena es aceptada.
 * @param {SimState} simState
 * @returns {StepResult}
 */
function _finalize(simState) {
  const accepted = isAccepted(simState.automata, simState.currentState);
  simState.done = true;
  simState.accepted = accepted;

  simState.trace.push({
    type: 'result',
    message: accepted
      ? `✓ Cadena ACEPTADA — "${simState.currentState}" es estado de aceptación`
      : `✗ Cadena RECHAZADA — "${simState.currentState}" no es estado de aceptación`,
    toState: simState.currentState
  });

  return { ok: true, done: true, accepted };
}
