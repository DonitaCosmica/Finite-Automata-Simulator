const VIZ = {
  STATE_RADIUS: 32,          // Radio del círculo de cada estado
  ACCEPT_RING_GAP: 6,        // Espacio entre el círculo y el anillo de aceptación
  GLOW_RADIUS_EXTRA: 8,      // Radio extra del halo del estado activo
  SELF_LOOP_FACTOR: 2.2,     // Factor de distancia del lazo propio
  SELF_LOOP_ANGLE: 0.7,      // Ángulo de apertura del lazo propio (radianes)
  EDGE_LABEL_PAD_X: 5,       // Padding horizontal del fondo de etiqueta
  EDGE_LABEL_PAD_Y: 10,      // Padding vertical del fondo de etiqueta
  EDGE_LABEL_HEIGHT: 18,     // Alto del fondo de etiqueta
  INIT_ARROW_LENGTH: 35,     // Longitud de la flecha de estado inicial
  CANVAS_PAD_X: 100,         // Padding horizontal del canvas
  CANVAS_PAD_Y: 80,          // Padding vertical del canvas
  MAX_SCALE: 1.4,            // Escala máxima permitida

  COLORS: {
    normal:          { fill: '#1e222d', stroke: '#4b5563' },
    initial:         { fill: '#0d2e20', stroke: '#6ee7b7' },
    active:          { fill: '#2d2410', stroke: '#fbbf24' },
    accepting_active:{ fill: '#2d2410', stroke: '#fbbf24' },
    rejected:        { fill: '#2d1010', stroke: '#f87171' },
    accepting:       { fill: '#0d2e20', stroke: '#6ee7b7' }
  },

  EDGE_COLOR_NORMAL:  '#374151',
  EDGE_COLOR_ACTIVE:  '#fbbf24',
  EDGE_COLOR_REJECT:  '#f87171',
  LABEL_BG:           '#0d0f14',
  FONT_MONO:          'JetBrains Mono, monospace',
  FONT_SANS:          'Syne, sans-serif',
  NS:                 'http://www.w3.org/2000/svg'
};

/**
 * Renderiza completamente el diagrama SVG del autómata.
 *
 * @param {SVGElement} svgEl     — elemento <svg> destino
 * @param {Automata}   automata  — definición del autómata
 * @param {object}     options
 * @param {string|null}  options.activeState      — estado a resaltar (actual)
 * @param {object|null}  options.activeTransition — { from, to, symbol }
 * @param {boolean}      options.rejected         — si el estado activo es de error
 */
function renderAutomata(svgEl, automata, options = {}) {
  const { activeState = null, activeTransition = null, rejected = false } = options;

  svgEl.innerHTML = '';

  const { width: W, height: H } = _getCanvasSize(svgEl);
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Insertar definiciones (marcadores de flecha, filtros)
  svgEl.appendChild(_buildDefs());

  // Calcular transformación de coordenadas lógicas → canvas
  const transform = _buildTransform(automata.layout, W, H);

  // 1. Aristas (se dibujan primero para quedar debajo de los estados)
  automata.edges.forEach(edge => {
    _drawEdge(svgEl, edge, automata, transform, activeTransition, rejected);
  });

  // 2. Flecha de entrada al estado inicial
  _drawInitialArrow(svgEl, automata, transform);

  // 3. Estados
  automata.states.forEach(state => {
    _drawState(svgEl, state, automata, transform, activeState, rejected);
  });
}

function _buildDefs() {
  const defs = _el('defs');
  defs.innerHTML = `
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
      <path d="M1 1L9 5L1 9" fill="none" stroke="#6b7280"
            stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="arr-active" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
      <path d="M1 1L9 5L1 9" fill="none" stroke="${VIZ.EDGE_COLOR_ACTIVE}"
            stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="arr-red" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
      <path d="M1 1L9 5L1 9" fill="none" stroke="${VIZ.EDGE_COLOR_REJECT}"
            stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
  return defs;
}

/**
 * Calcula la escala y el desplazamiento para centrar el layout en el canvas.
 * @returns {{ sx: Function, sy: Function }}
 */
function _buildTransform(layout, W, H) {
  const points = Object.values(layout);
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const { CANVAS_PAD_X: px, CANVAS_PAD_Y: py, MAX_SCALE } = VIZ;
  const scaleX = (W - px * 2) / Math.max(maxX - minX, 1);
  const scaleY = (H - py * 2) / Math.max(maxY - minY, 1);
  const scale  = Math.min(scaleX, scaleY, MAX_SCALE);

  const offX = (W - (maxX - minX) * scale) / 2 - minX * scale;
  const offY = (H - (maxY - minY) * scale) / 2 - minY * scale;

  return {
    sx: x => x * scale + offX,
    sy: y => y * scale + offY,
    scale
  };
}

function _drawEdge(svgEl, edge, automata, transform, activeTransition, rejected) {
  const { sx, sy } = transform;
  const R = VIZ.STATE_RADIUS;
  const from = automata.layout[edge.from];
  const fx = sx(from.x), fy = sy(from.y);

  const isActiveTrans = activeTransition &&
    activeTransition.from === edge.from &&
    activeTransition.to   === edge.to;

  const edgeColor  = rejected && isActiveTrans ? VIZ.EDGE_COLOR_REJECT
                   : isActiveTrans             ? VIZ.EDGE_COLOR_ACTIVE
                   : VIZ.EDGE_COLOR_NORMAL;
  const markerRef  = rejected && isActiveTrans ? 'arr-red'
                   : isActiveTrans             ? 'arr-active'
                   : 'arr';
  const strokeW    = isActiveTrans ? '2.5' : '1.5';

  if (edge.self) {
    _drawSelfLoop(svgEl, fx, fy, edge, edgeColor, markerRef, strokeW, isActiveTrans);
  } else {
    const to = automata.layout[edge.to];
    const tx = sx(to.x), ty = sy(to.y);
    _drawDirectEdge(svgEl, fx, fy, tx, ty, edge, edgeColor, markerRef, strokeW, isActiveTrans, sy, R);
  }
}

function _drawSelfLoop(svgEl, fx, fy, edge, color, markerRef, strokeW, isActive) {
  const R = VIZ.STATE_RADIUS;
  const side  = edge.side === 'top' ? -1 : 1;
  const angle = side === -1 ? -Math.PI / 2 : Math.PI / 2;

  const cx  = fx + Math.cos(angle) * R * VIZ.SELF_LOOP_FACTOR;
  const cy  = fy + Math.sin(angle) * R * VIZ.SELF_LOOP_FACTOR;
  const a   = VIZ.SELF_LOOP_ANGLE;
  const lx1 = fx + Math.cos(angle - a) * R;
  const ly1 = fy + Math.sin(angle - a) * R;
  const lx2 = fx + Math.cos(angle + a) * R;
  const ly2 = fy + Math.sin(angle + a) * R;

  const path = _el('path');
  _attrs(path, {
    d: `M${lx1},${ly1} Q${cx},${cy} ${lx2},${ly2}`,
    fill: 'none', stroke: color, 'stroke-width': strokeW,
    'marker-end': `url(#${markerRef})`
  });
  svgEl.appendChild(path);

  // Etiqueta del lazo
  const labelY = cy + (edge.side === 'top' ? -10 : 10);
  const label = _el('text');
  _attrs(label, {
    x: cx, y: labelY,
    'text-anchor': 'middle', 'dominant-baseline': 'central',
    'font-family': VIZ.FONT_MONO, 'font-size': '12',
    fill: isActive ? color : '#9ca3af'
  });
  label.textContent = edge.label;
  svgEl.appendChild(label);
}

function _drawDirectEdge(svgEl, fx, fy, tx, ty, edge, color, markerRef, strokeW, isActive, sy, R) {
  const dx = tx - fx, dy = ty - fy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist, uy = dy / dist;

  let d;
  if (edge.curved) {
    const cy_val = sy(edge.cy || 0);
    const cx_val = (fx + tx) / 2;
    const sx1 = fx + ux * R, sy1 = fy + uy * R;
    const ddx = tx - cx_val, ddy = ty - cy_val;
    const dd  = Math.sqrt(ddx * ddx + ddy * ddy);
    const ex2 = tx - (ddx / dd) * R;
    const ey2 = ty - (ddy / dd) * R;
    d = `M${sx1},${sy1} Q${cx_val},${cy_val} ${ex2},${ey2}`;
  } else {
    const sx1 = fx + ux * R, sy1 = fy + uy * R;
    const ex2 = tx - ux * R, ey2 = ty - uy * R;
    d = `M${sx1},${sy1} L${ex2},${ey2}`;
  }

  const path = _el('path');
  _attrs(path, {
    d, fill: 'none', stroke: color, 'stroke-width': strokeW,
    'marker-end': `url(#${markerRef})`
  });
  svgEl.appendChild(path);

  // Fondo y etiqueta de la arista
  const midX = (fx + tx) / 2;
  const midY = (fy + ty) / 2;
  const lx = edge.curved ? midX : midX - uy * 16;
  const ly = edge.curved
    ? (edge.cy ? sy(edge.cy) - 16 : midY - 16)
    : midY + ux * 16;

  const lw = edge.label.length * 7 + VIZ.EDGE_LABEL_PAD_X * 2;
  const bg = _el('rect');
  _attrs(bg, {
    x: lx - lw / 2, y: ly - VIZ.EDGE_LABEL_PAD_Y,
    width: lw, height: VIZ.EDGE_LABEL_HEIGHT,
    rx: '4', fill: VIZ.LABEL_BG
  });
  svgEl.appendChild(bg);

  const label = _el('text');
  _attrs(label, {
    x: lx, y: ly, 'text-anchor': 'middle', 'dominant-baseline': 'central',
    'font-family': VIZ.FONT_MONO, 'font-size': '12',
    fill: isActive ? color : '#9ca3af'
  });
  label.textContent = edge.label;
  svgEl.appendChild(label);
}

function _drawInitialArrow(svgEl, automata, transform) {
  const { sx, sy } = transform;
  const R = VIZ.STATE_RADIUS;
  const initPos = automata.layout[automata.initial];
  const ix = sx(initPos.x), iy = sy(initPos.y);

  const arrow = _el('line');
  _attrs(arrow, {
    x1: ix - R - VIZ.INIT_ARROW_LENGTH, y1: iy,
    x2: ix - R - 1,                     y2: iy,
    stroke: '#6ee7b7', 'stroke-width': '2',
    'marker-end': 'url(#arr-active)'
  });
  svgEl.appendChild(arrow);
}

function _drawState(svgEl, state, automata, transform, activeState, rejected) {
  const { sx, sy } = transform;
  const R = VIZ.STATE_RADIUS;
  const pos = automata.layout[state];
  const cx  = sx(pos.x), cy = sy(pos.y);

  const isActive    = state === activeState;
  const isAccepting = automata.accepting.includes(state);
  const isInitial   = state === automata.initial;
  const col         = _stateColor(state, activeState, rejected, automata);

  const g = _el('g');

  // Halo del estado activo
  if (isActive) {
    const glow = _el('circle');
    _attrs(glow, {
      cx, cy, r: R + VIZ.GLOW_RADIUS_EXTRA,
      fill: rejected ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)'
    });
    g.appendChild(glow);
  }

  // Anillo doble para estados de aceptación
  if (isAccepting) {
    const ring = _el('circle');
    _attrs(ring, {
      cx, cy, r: R + VIZ.ACCEPT_RING_GAP,
      fill: 'none', stroke: col.stroke,
      'stroke-width': isActive ? '2' : '1',
      opacity: '0.6'
    });
    g.appendChild(ring);
  }

  // Círculo principal del estado
  const circle = _el('circle');
  _attrs(circle, {
    cx, cy, r: R,
    fill: col.fill, stroke: col.stroke,
    'stroke-width': isActive ? '2.5' : '1.5'
  });
  g.appendChild(circle);

  // Etiqueta del estado
  const text = _el('text');
  _attrs(text, {
    x: cx, y: cy,
    'text-anchor': 'middle', 'dominant-baseline': 'central',
    'font-family': VIZ.FONT_MONO,
    'font-size': '14',
    'font-weight': isActive ? '700' : '500',
    fill: isActive ? (rejected ? '#f87171' : '#fbbf24') : col.stroke
  });
  text.textContent = state;
  g.appendChild(text);

  svgEl.appendChild(g);
}

/**
 * Determina el color de un estado según su rol en la simulación.
 */
function _stateColor(state, activeState, isRejected, automata) {
  const isAccepting = automata.accepting.includes(state);
  const isActive    = state === activeState;

  if (isActive && isRejected)               return VIZ.COLORS.rejected;
  if (isActive && isAccepting)              return VIZ.COLORS.accepting_active;
  if (isActive)                             return VIZ.COLORS.active;
  if (isAccepting || state === automata.initial) return VIZ.COLORS.accepting;
  return VIZ.COLORS.normal;
}

/**
 * Crea un elemento SVG con el namespace correcto.
 */
function _el(tag) {
  return document.createElementNS(VIZ.NS, tag);
}

/**
 * Asigna múltiples atributos a un elemento SVG.
 */
function _attrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

/**
 * Obtiene el tamaño real del canvas SVG, con fallback seguro.
 */
function _getCanvasSize(svgEl) {
  const box = svgEl.getBoundingClientRect();
  return {
    width:  box.width  || 800,
    height: box.height || 480
  };
}
