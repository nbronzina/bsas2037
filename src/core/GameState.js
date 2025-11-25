/**
 * Estado del juego - Versión Escritorio
 * Simplificado respecto a versión mapa
 */

const gameState = {
  // ═══════════════════════════════════════════
  // TIEMPO
  // ═══════════════════════════════════════════
  currentDay: 1,
  maxDays: 7,
  dayNames: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],

  getDayName() {
    return this.dayNames[this.currentDay - 1] || 'Día ' + this.currentDay;
  },

  getShortDayName() {
    const shortNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return shortNames[this.currentDay - 1] || 'Día ' + this.currentDay;
  },

  isLastDay() {
    return this.currentDay >= this.maxDays;
  },

  // ═══════════════════════════════════════════
  // RECURSOS (0-100)
  // ═══════════════════════════════════════════
  resources: {
    electricidad: 60,
    agua: 60,
    legitimidad: 60,
    autonomia: 60
  },

  creditos: 100, // Puede ser negativo

  // Íconos para UI
  resourceIcons: {
    electricidad: '⚡',
    agua: '💧',
    legitimidad: '🤝',
    autonomia: '🏴'
  },

  getResource(key) {
    return this.resources[key] ?? 0;
  },

  modifyResource(key, amount) {
    if (this.resources.hasOwnProperty(key)) {
      this.resources[key] = Math.max(0, Math.min(100, this.resources[key] + amount));
      return this.resources[key];
    }
    if (key === 'creditos') {
      this.creditos += amount;
      return this.creditos;
    }
    return null;
  },

  getResourcesArray() {
    return Object.entries(this.resources).map(([key, value]) => ({
      key,
      value,
      icon: this.resourceIcons[key]
    }));
  },

  isAnyCritical() {
    return Object.values(this.resources).some(v => v < 20);
  },

  isAnyZero() {
    return Object.values(this.resources).some(v => v <= 0);
  },

  // Obtener estado general de recursos
  getResourceStatus() {
    const values = Object.values(this.resources);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      average: Math.round(avg),
      min: min,
      max: max,
      critical: values.filter(v => v < 20).length,
      healthy: values.filter(v => v >= 50).length
    };
  },

  // Obtener recursos en estado crítico
  getCriticalResources() {
    return Object.entries(this.resources)
      .filter(([key, value]) => value < 20)
      .map(([key, value]) => ({
        key,
        value,
        icon: this.resourceIcons[key],
        name: this.getResourceName(key)
      }));
  },

  // Verificar si algún recurso llegó a 0 (game over)
  checkResourceFailure() {
    for (const [key, value] of Object.entries(this.resources)) {
      if (value <= 0) {
        return key; // Retorna el nombre del recurso que falló
      }
    }
    return null; // Ningún recurso falló
  },

  // Aplicar decay de recursos al final del día
  applyResourceDecay() {
    if (this.documentManager) {
      this.documentManager.applyDayDecay(this.currentDay);
    } else {
      // Fallback si no hay documentManager: decay estándar de 3
      Object.keys(this.resources).forEach(key => {
        this.modifyResource(key, -3);
      });
      console.log('📉 Applied default decay of 3');
    }
  },

  // Obtener nombre legible del recurso
  getResourceName(key) {
    const names = {
      electricidad: 'Electricidad',
      agua: 'Agua',
      legitimidad: 'Legitimidad',
      autonomia: 'Autonomía'
    };
    return names[key] || key;
  },

  // Calcular tendencia de un recurso (comparado con inicio)
  getResourceTrend(key) {
    const current = this.resources[key];
    const initial = 60; // Valor inicial
    const diff = current - initial;

    if (diff > 10) return 'subiendo';
    if (diff < -10) return 'bajando';
    return 'estable';
  },

  // Verificar si algún recurso está en peligro (< 30)
  hasResourcesInDanger() {
    return Object.values(this.resources).some(v => v < 30);
  },

  // Obtener el recurso más bajo
  getLowestResource() {
    let lowest = { key: null, value: 100 };
    Object.entries(this.resources).forEach(([key, value]) => {
      if (value < lowest.value) {
        lowest = { key, value, icon: this.resourceIcons[key] };
      }
    });
    return lowest;
  },

  // Obtener el recurso más alto
  getHighestResource() {
    let highest = { key: null, value: 0 };
    Object.entries(this.resources).forEach(([key, value]) => {
      if (value > highest.value) {
        highest = { key, value, icon: this.resourceIcons[key] };
      }
    });
    return highest;
  },

  // Aplicar bonus/penalidad global
  applyGlobalModifier(amount) {
    Object.keys(this.resources).forEach(key => {
      this.modifyResource(key, amount);
    });
  },

  // Verificar si puede pagar un costo
  canAfford(cost) {
    if (cost.creditos && this.creditos < cost.creditos) return false;

    for (const [key, value] of Object.entries(cost)) {
      if (key !== 'creditos' && this.resources[key] !== undefined) {
        if (this.resources[key] + value < 0) return false;
      }
    }
    return true;
  },

  // ═══════════════════════════════════════════
  // DOCUMENTOS
  // ═══════════════════════════════════════════
  documentsToday: [],        // Documentos para el día actual
  currentDocumentIndex: 0,   // Índice del documento actual
  completedDocuments: [],    // IDs de documentos ya decididos (histórico)
  readDocuments: [],         // Documentos leídos con decisión tomada
  decisionHistory: [],       // Historial detallado de decisiones

  getCurrentDocument() {
    return this.documentsToday[this.currentDocumentIndex] || null;
  },

  hasMoreDocuments() {
    return this.currentDocumentIndex < this.documentsToday.length;
  },

  getRemainingDocuments() {
    return this.documentsToday.length - this.currentDocumentIndex;
  },

  advanceToNextDocument() {
    this.currentDocumentIndex++;
    return this.getCurrentDocument();
  },

  // Guardar documento leído para carpeta "Leídos"
  addReadDocument(doc, chosenOption) {
    this.readDocuments.push({
      ...doc,
      chosenOption: chosenOption,
      day: this.currentDay,
      dayName: this.getDayName(),
      timestamp: Date.now()
    });
  },

  // Registrar decisión en historial
  recordDecision(doc, option) {
    this.decisionHistory.push({
      day: this.currentDay,
      dayName: this.getDayName(),
      docTitle: doc.title,
      sender: doc.sender,
      chosenOption: option.text,
      consequences: option.consequences
    });
  },

  // ═══════════════════════════════════════════
  // FLAGS NARRATIVOS
  // ═══════════════════════════════════════════
  flags: {},

  setFlag(key, value = true) {
    this.flags[key] = value;
  },

  getFlag(key) {
    return this.flags[key] ?? false;
  },

  hasFlag(key) {
    return this.flags[key] === true;
  },

  // ═══════════════════════════════════════════
  // NPCs (expandidos con personalidad)
  // ═══════════════════════════════════════════
  npcs: {
    valeria: {
      id: 'valeria',
      name: 'Valeria',
      role: 'Coordinadora',
      emoji: '👩',
      age: 45,
      personality: 'Pragmática y equilibrada. Busca consensos.',
      background: 'Ex trabajadora social. Lleva 3 años en la red.',
      priorities: ['legitimidad', 'agua'],
      speaks: {
        positive: [
          'Bien pensado.',
          'La comunidad va a agradecer esto.',
          'Vamos por buen camino.'
        ],
        negative: [
          'No sé si es lo mejor, pero vos decidís.',
          'Esperemos que funcione.',
          'La gente va a tener opiniones.'
        ],
        neutral: [
          'Anotado.',
          'Vemos cómo sale.',
          'Seguimos.'
        ]
      }
    },
    beto: {
      id: 'beto',
      name: 'Beto',
      role: 'Electricista',
      emoji: '👨‍🔧',
      age: 52,
      personality: 'Directo y práctico. No le gustan las vueltas.',
      background: 'Electricista de toda la vida. El que más sabe de instalaciones.',
      priorities: ['electricidad', 'autonomia'],
      speaks: {
        positive: [
          'Dale, me pongo.',
          'Eso sí tiene sentido.',
          'Por fin una buena decisión.'
        ],
        negative: [
          'Vos sabés...',
          'Bueno, si vos decís.',
          'Después no me vengan con quejas.'
        ],
        neutral: [
          'Listo.',
          'Hecho.',
          'Voy.'
        ]
      }
    },
    yani: {
      id: 'yani',
      name: 'Yani',
      role: 'Enfermera',
      emoji: '👩‍⚕️',
      age: 34,
      personality: 'Empática y preocupada por el bienestar.',
      background: 'Enfermera en hospital público. Voluntaria desde el inicio.',
      priorities: ['legitimidad', 'agua'],
      speaks: {
        positive: [
          'Qué bueno, la gente lo necesita.',
          'Me alegra que pensemos en todos.',
          'Esto va a ayudar.'
        ],
        negative: [
          'Entiendo, pero me preocupa.',
          'Ojalá no nos arrepintamos.',
          'La gente va a sufrir.'
        ],
        neutral: [
          'Bueno, vemos.',
          'Está bien.',
          'Lo comunico.'
        ]
      }
    },
    marcos: {
      id: 'marcos',
      name: 'Marcos',
      role: 'Ingeniero',
      emoji: '👨‍💼',
      age: 38,
      personality: 'Analítico y cauteloso. Le gustan los números.',
      background: 'Ingeniero civil. Perdió el laburo en el 2035 y se sumó a la red.',
      priorities: ['agua', 'electricidad'],
      speaks: {
        positive: [
          'Los números cierran.',
          'Buena inversión.',
          'Técnicamente es lo correcto.'
        ],
        negative: [
          'No me convence, pero bueno.',
          'Los números no dan.',
          'Es un riesgo.'
        ],
        neutral: [
          'Voy a revisar.',
          'Tomo nota.',
          'Después te cuento.'
        ]
      }
    }
  },

  getNPC(id) {
    return this.npcs[id] || null;
  },

  // Obtener respuesta contextual de NPC
  getNPCResponse(npcId, sentiment = 'neutral') {
    const npc = this.npcs[npcId];
    if (!npc || !npc.speaks) return null;

    const phrases = npc.speaks[sentiment] || npc.speaks.neutral;
    return phrases[Math.floor(Math.random() * phrases.length)];
  },

  // Verificar si decisión alinea con prioridades de NPC
  doesNPCApprove(npcId, consequences) {
    const npc = this.npcs[npcId];
    if (!npc || !npc.priorities) return 'neutral';

    let score = 0;
    npc.priorities.forEach(priority => {
      if (consequences[priority]) {
        score += consequences[priority];
      }
    });

    if (score > 5) return 'positive';
    if (score < -5) return 'negative';
    return 'neutral';
  },

  // ═══════════════════════════════════════════
  // MANAGERS (referencias)
  // ═══════════════════════════════════════════
  documentManager: null,
  audioManager: null,
  saveManager: null,
  currentScene: null,

  // ═══════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════
  debugMode: false,

  // ═══════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════
  reset() {
    this.currentDay = 1;
    this.resources = {
      electricidad: 60,
      agua: 60,
      legitimidad: 60,
      autonomia: 60
    };
    this.creditos = 100;
    this.documentsToday = [];
    this.currentDocumentIndex = 0;
    this.completedDocuments = [];
    this.readDocuments = [];
    this.decisionHistory = [];
    this.flags = {};
  }
};

// Export global
if (typeof window !== 'undefined') {
  window.gameState = gameState;
}
