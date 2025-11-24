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

  // ═══════════════════════════════════════════
  // DOCUMENTOS
  // ═══════════════════════════════════════════
  documentsToday: [],        // Documentos para el día actual
  currentDocumentIndex: 0,   // Índice del documento actual
  completedDocuments: [],    // IDs de documentos ya decididos (histórico)

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
  // NPCs (simplificados - solo datos)
  // ═══════════════════════════════════════════
  npcs: {
    valeria: {
      id: 'valeria',
      name: 'Valeria',
      role: 'Coordinadora',
      emoji: '👩'
    },
    beto: {
      id: 'beto',
      name: 'Beto',
      role: 'Electricista',
      emoji: '👨‍🔧'
    },
    yani: {
      id: 'yani',
      name: 'Yani',
      role: 'Enfermera',
      emoji: '👩‍⚕️'
    },
    marcos: {
      id: 'marcos',
      name: 'Marcos',
      role: 'Ingeniero',
      emoji: '👨‍💼'
    }
  },

  getNPC(id) {
    return this.npcs[id] || null;
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
    this.flags = {};
  }
};

// Export global
if (typeof window !== 'undefined') {
  window.gameState = gameState;
}
