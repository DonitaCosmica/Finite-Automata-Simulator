/**
 * Autómata: Termina en "01"
 * Tipo: AFD (Autómata Finito Determinista)
 * Descripción: Acepta cadenas binarias que terminan con la subcadena "01"
 *
 * Ejemplo de cadenas aceptadas:  01, 001, 10001
 * Ejemplo de cadenas rechazadas: 10, 0, 11
 */

const ends_01 = {
  id: 'ends_01',
  name: 'Termina en "01"',
  desc: 'Acepta cadenas binarias que terminan con 01',
  alphabet: ['0', '1'],
  states: ['q0', 'q1', 'q2'],
  initial: 'q0',
  accepting: ['q2'],

  /**
   * Función de transición δ(estado, símbolo) → estado
   * q0: estado inicial, no se ha leído ningún patrón relevante
   * q1: se acaba de leer un '0'
   * q2: se acaba de leer '01' (estado de aceptación)
   */
  transitions: {
    q0: { '0': 'q1', '1': 'q0' },
    q1: { '0': 'q1', '1': 'q2' },
    q2: { '0': 'q1', '1': 'q0' }
  },

  // Posiciones (x, y) de cada estado en el canvas (coordenadas lógicas)
  layout: {
    q0: { x: 160, y: 240 },
    q1: { x: 400, y: 240 },
    q2: { x: 640, y: 240 }
  },

  // Cadenas de prueba sugeridas
  testStrings: ['01', '001', '10001', '10', '0', '101'],

  // Definición visual de aristas (edges)
  edges: [
    { from: 'q0', to: 'q0', label: '1', self: true, side: 'top' },
    { from: 'q0', to: 'q1', label: '0' },
    { from: 'q1', to: 'q1', label: '0', self: true, side: 'top' },
    { from: 'q1', to: 'q2', label: '1' },
    { from: 'q2', to: 'q1', label: '0' },
    { from: 'q2', to: 'q0', label: '1', curved: true, cy: -100 }
  ]
};