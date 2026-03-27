/**
 * Autómata: Empieza con "ab"
 * Tipo: AFD (Autómata Finito Determinista)
 * Descripción: Acepta cadenas sobre el alfabeto {a, b} que comienzan
 *              con el prefijo "ab". Una vez rechazada, la cadena no puede
 *              recuperarse (estado trampa qf).
 *
 * Ejemplo de cadenas aceptadas:  ab, aba, abba, abab
 * Ejemplo de cadenas rechazadas: a, b, ba, aab
 */

const starts_ab = {
  id: 'starts_ab',
  name: 'Empieza con "ab"',
  desc: 'Acepta cadenas sobre {a,b} que comienzan con "ab"',
  alphabet: ['a', 'b'],
  states: ['q0', 'q1', 'q2', 'qf'],
  initial: 'q0',
  accepting: ['q2'],

  /**
   * Función de transición δ(estado, símbolo) → estado
   * q0: estado inicial, esperando 'a'
   * q1: se leyó 'a', esperando 'b'
   * q2: se leyó "ab" → estado de aceptación (sigue aceptando todo)
   * qf: estado trampa (rechazo permanente)
   */
  transitions: {
    q0: { 'a': 'q1', 'b': 'qf' },
    q1: { 'a': 'qf', 'b': 'q2' },
    q2: { 'a': 'q2', 'b': 'q2' },
    qf: { 'a': 'qf', 'b': 'qf' }
  },

  layout: {
    q0: { x: 120, y: 240 },
    q1: { x: 310, y: 240 },
    q2: { x: 500, y: 240 },
    qf: { x: 690, y: 240 }
  },

  testStrings: ['ab', 'aba', 'abba', 'a', 'b', 'ba'],

  edges: [
    { from: 'q0', to: 'q1', label: 'a' },
    { from: 'q0', to: 'qf', label: 'b', curved: true, cy: 380 },
    { from: 'q1', to: 'q2', label: 'b' },
    { from: 'q1', to: 'qf', label: 'a', curved: true, cy: 380 },
    { from: 'q2', to: 'q2', label: 'a,b', self: true, side: 'top' },
    { from: 'qf', to: 'qf', label: 'a,b', self: true, side: 'top' }
  ]
};
