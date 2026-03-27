/**
 * Autómata: Número binario par
 * Tipo: AFD (Autómata Finito Determinista)
 * Descripción: Acepta representaciones binarias de números divisibles entre 2.
 *              Un número binario es par si y solo si su último bit es 0.
 *
 * Ejemplo de cadenas aceptadas:  0, 10, 100, 110, 1010
 * Ejemplo de cadenas rechazadas: 1, 11, 101, 111
 */

const binary_even = {
  id: 'binary_even',
  name: 'Número binario par',
  desc: 'Acepta números binarios divisibles entre 2 (terminan en 0)',
  alphabet: ['0', '1'],
  states: ['q0', 'q1'],
  initial: 'q0',
  accepting: ['q0'],

  /**
   * Función de transición δ(estado, símbolo) → estado
   * q0: el último símbolo leído fue '0' (o no se ha leído nada) → par
   * q1: el último símbolo leído fue '1' → impar
   */
  transitions: {
    q0: { '0': 'q0', '1': 'q1' },
    q1: { '0': 'q0', '1': 'q1' }
  },

  layout: {
    q0: { x: 240, y: 240 },
    q1: { x: 560, y: 240 }
  },

  testStrings: ['0', '10', '100', '110', '111', '1010'],

  edges: [
    { from: 'q0', to: 'q0', label: '0', self: true, side: 'top' },
    { from: 'q0', to: 'q1', label: '1', curved: true, cy: 170 },
    { from: 'q1', to: 'q1', label: '1', self: true, side: 'top' },
    { from: 'q1', to: 'q0', label: '0', curved: true, cy: 310 }
  ]
};