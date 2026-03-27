/**
 * Autómata: Divisible entre 3
 * Tipo: AFD (Autómata Finito Determinista)
 * Descripción: Acepta cadenas unarias de la forma a^n donde n es múltiplo de 3.
 *              El alfabeto es {a} y se cuenta cuántas 'a' hay en la cadena.
 *
 * Ejemplo de cadenas aceptadas:  ε (vacía), aaa, aaaaaa
 * Ejemplo de cadenas rechazadas: a, aa, aaaa, aaaaa
 *
 * Nota: El estado inicial q0 también es de aceptación (la cadena vacía
 *       representa n=0, y 0 es divisible entre 3).
 */

const div3 = {
  id: 'div3',
  name: 'Divisible entre 3',
  desc: 'Acepta cadenas unarias a^n donde n es múltiplo de 3',
  alphabet: ['a'],
  states: ['q0', 'q1', 'q2'],
  initial: 'q0',
  accepting: ['q0'],

  /**
   * Función de transición δ(estado, símbolo) → estado
   * q0: contador ≡ 0 (mod 3) → aceptación
   * q1: contador ≡ 1 (mod 3)
   * q2: contador ≡ 2 (mod 3)
   */
  transitions: {
    q0: { 'a': 'q1' },
    q1: { 'a': 'q2' },
    q2: { 'a': 'q0' }
  },

  // Layout triangular para visualizar el ciclo q0 → q1 → q2 → q0
  layout: {
    q0: { x: 400, y: 120 },
    q1: { x: 640, y: 340 },
    q2: { x: 160, y: 340 }
  },

  testStrings: ['', 'aaa', 'aaaaaa', 'a', 'aa', 'aaaa'],

  edges: [
    { from: 'q0', to: 'q1', label: 'a' },
    { from: 'q1', to: 'q2', label: 'a' },
    { from: 'q2', to: 'q0', label: 'a' }
  ]
};