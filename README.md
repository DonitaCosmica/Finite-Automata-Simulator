# 🔬 Simulador de Autómatas Finitos

Herramienta educativa interactiva para visualizar y simular **Autómatas Finitos Deterministas (AFD)**.  
Desarrollada como proyecto académico para el módulo de **Modelos de Computación**.

🔗 **Demo en vivo:** [tu-usuario.github.io/finite-automata-simulator](https://tu-usuario.github.io/finite-automata-simulator)

---

## ✨ Características

- **Visualización en tiempo real** del diagrama de estados con SVG dinámico
- **Modo paso a paso** — avanza símbolo por símbolo y observa cada transición `δ(q, a) → q'`
- **Modo ejecución completa** — procesa toda la cadena de una vez
- **Traza de ejecución** — registro detallado de cada paso de la función de transición
- **5 autómatas precargados** con ejemplos clásicos de la teoría
- **Sin dependencias externas** — HTML, CSS y JS puros

---

## 📁 Estructura del proyecto

```
finite-automata-simulator/
│
├── index.html          # Interfaz principal (estructura HTML)
├── automata.js         # Lógica pura de simulación (sin DOM)
├── visualizer.js       # Renderizado SVG del diagrama de estados
├── app.js              # Controlador de UI (conecta todo)
│
├── css/
│   └── style.css       # Estilos globales (variables, layout, componentes)
│
├── examples/
│   ├── index.js        # Registro central de autómatas
│   ├── ends_01.js      # AFD: cadenas que terminan en "01"
│   ├── binary_even.js  # AFD: números binarios pares
│   ├── contains_00.js  # AFD: cadenas que contienen "00"
│   ├── div3.js         # AFD: cadenas unarias con longitud múltiplo de 3
│   └── starts_ab.js    # AFD: cadenas que comienzan con "ab"
│
└── README.md
```

---

## 🧩 Ejemplos incluidos

| Autómata | Alfabeto | Acepta |
|---|---|---|
| Termina en "01" | {0, 1} | Cadenas binarias terminadas en `01` |
| Número binario par | {0, 1} | Representaciones binarias de números pares |
| Contiene "00" | {0, 1} | Cadenas con la subcadena `00` |
| Divisible entre 3 | {a} | Cadenas `aⁿ` donde `n mod 3 = 0` |
| Empieza con "ab" | {a, b} | Cadenas con prefijo `ab` |

---

## ➕ Agregar un nuevo autómata

1. Crea un nuevo archivo en `examples/`, siguiendo el esquema:

```javascript
// examples/mi_automata.js
const mi_automata = {
  id:        'mi_automata',
  name:      'Nombre legible',
  desc:      'Descripción breve',
  alphabet:  ['0', '1'],
  states:    ['q0', 'q1'],
  initial:   'q0',
  accepting: ['q1'],
  transitions: {
    q0: { '0': 'q1', '1': 'q0' },
    q1: { '0': 'q1', '1': 'q0' }
  },
  layout: {
    q0: { x: 200, y: 240 },
    q1: { x: 500, y: 240 }
  },
  testStrings: ['0', '10', '110'],
  edges: [
    { from: 'q0', to: 'q1', label: '0' },
    { from: 'q0', to: 'q0', label: '1', self: true, side: 'top' },
    { from: 'q1', to: 'q1', label: '0', self: true, side: 'top' },
    { from: 'q1', to: 'q0', label: '1' }
  ]
};
```

2. Agrega el `<script>` correspondiente en `index.html` (antes de `examples/index.js`):
```html
<script src="examples/mi_automata.js"></script>
```

3. Agrega la variable al array en `examples/index.js`:
```javascript
const EXAMPLES = [
  ends_01,
  binary_even,
  contains_00,
  div3,
  starts_ab,
  mi_automata  // ← aquí
];
```

---

## 🧪 Definición formal

Un **Autómata Finito Determinista** se define como una 5-tupla:

> **M = (Q, Σ, δ, q₀, F)**

| Componente | Descripción | En el código |
|---|---|---|
| **Q** | Conjunto finito de estados | `automata.states` |
| **Σ** | Alfabeto de entrada | `automata.alphabet` |
| **δ: Q × Σ → Q** | Función de transición | `automata.transitions` |
| **q₀ ∈ Q** | Estado inicial | `automata.initial` |
| **F ⊆ Q** | Estados de aceptación | `automata.accepting` |

---

## 🚀 Ejecutar localmente

Clona el repositorio y abre el archivo `index.html` en tu navegador:

```bash
git clone https://github.com/tu-usuario/finite-automata-simulator.git
cd finite-automata-simulator
# Abre index.html en tu navegador (o usa Live Server en VS Code)
```

> ⚠️ Por cómo los navegadores gestionan módulos JS con `file://`, se recomienda usar un servidor local:
> ```bash
> npx serve .
> # o en Python:
> python -m http.server 8080
> ```

---

## 📚 Conceptos teóricos relacionados

- **Lenguajes regulares** y la jerarquía de Chomsky
- **Expresiones regulares** y su equivalencia con los AFD (Teorema de Kleene)
- **Autómatas Finitos No-Deterministas (AFN)** y la construcción de subconjuntos
- **Minimización de AFDs** (algoritmo de Myhill-Nerode)
- **Clases de complejidad** L y NL

---

## 👤 Autor

Proyecto académico — Módulo de Modelos de Computación  
Licencia: MIT
