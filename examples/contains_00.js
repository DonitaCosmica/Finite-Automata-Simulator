/**
 * Autómata: Contiene "00"
 * Tipo: AFD (Autómata Finito Determinista)
 * Descripción: Acepta cadenas binarias que contienen la subcadena "00"
 *              en cualquier posición.
 *
 * Ejemplo de cadenas aceptadas:  00, 100, 010, 0011
 * Ejemplo de cadenas rechazadas: 11, 0101, 010101
 */

const contains_00 = {
  id: 'contains_00',
  name: 'Contiene "00"',
  desc: 'Acepta cadenas binarias que contienen la subcadena 00',
  alphabet: ['0', '1'],
  states: ['q0', 'q1', 'q2'],
  initial: 'q0',
  accepting: ['q2'],

  /**
   * Función de transición δ(estado, símbolo) → estado
   * q0: no se ha visto ningún '0' relevante aún
   * q1: se acaba de leer exactamente un '0'
   * q2: ya se vio "00" → estado de aceptación (trampa positiva)
   */
  transitions: {
    q0: { '0': 'q1', '1': 'q0' },
    q1: { '0': 'q2', '1': 'q0' },
    q2: { '0': 'q2', '1': 'q2' }
  },

  layout: {
    q0: { x: 160, y: 240 },
    q1: { x: 400, y: 240 },
    q2: { x: 640, y: 240 }
  },

  testStrings: ['00', '100', '010', '0011', '11', '0101'],

  edges: [
    { from: 'q0', to: 'q0', label: '1', self: true, side: 'top' },
    { from: 'q0', to: 'q1', label: '0' },
    { from: 'q1', to: 'q0', label: '1', curved: true, cy: 100 },
    { from: 'q1', to: 'q2', label: '0' },
    { from: 'q2', to: 'q2', label: '0,1', self: true, side: 'top' }
  ]
};
