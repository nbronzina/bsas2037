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

  // CORREGIDO: Setter para validar que currentDay esté siempre entre 1-7
  setCurrentDay(day) {
    this.currentDay = Math.max(1, Math.min(7, day));
    console.log(`📅 currentDay set to: ${this.currentDay}`);
  },

  // CORREGIDO: Validar índice para evitar out of bounds
  getDayName() {
    const index = Math.max(0, Math.min(6, this.currentDay - 1));
    return this.dayNames[index] || 'Lunes';
  },

  // CORREGIDO: Validar índice para evitar out of bounds
  getShortDayName() {
    const shortNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const index = Math.max(0, Math.min(6, this.currentDay - 1));
    return shortNames[index] || 'Lun';
  },

  // CORREGIDO: Usar 7 en vez de this.maxDays para ser explícito
  isLastDay() {
    return this.currentDay >= 7;
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

  resourceHistory: [], // Historial de cambios de recursos

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

      // INTEGRACIÓN: Actualizar velocidad del ventilador cuando cambia electricidad
      if (key === 'electricidad' && this.audioManager) {
        this.audioManager.updateFanSpeed(this.resources[key]);
      }

      return this.resources[key];
    }
    if (key === 'creditos') {
      // CORREGIDO: Agregar límites inferior y superior a créditos
      // Límite inferior: -100 (deuda máxima razonable)
      // Límite superior: 999 (evita overflow y mantiene balance del juego)
      const minCreditos = -100;
      const maxCreditos = 999;
      this.creditos = Math.max(minCreditos, Math.min(maxCreditos, this.creditos + amount));

      // Log si llegamos a límites críticos
      if (this.creditos === minCreditos) {
        console.warn('⚠️ Créditos en límite de deuda máxima:', minCreditos);
      }
      if (this.creditos === maxCreditos) {
        console.log('💰 Créditos en límite máximo:', maxCreditos);
      }

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
  // CORREGIDO: Prevenir documentos duplicados en readDocuments
  addReadDocument(doc, chosenOption) {
    // Verificar que no esté ya agregado
    const alreadyExists = this.readDocuments.some(d => d.id === doc.id);

    if (!alreadyExists) {
      this.readDocuments.push({
        ...doc,
        chosenOption: chosenOption,
        day: this.currentDay,
        dayName: this.getDayName(),
        timestamp: Date.now()
      });
    } else {
      console.warn(`⚠️ Documento "${doc.id}" ya existe en readDocuments, no se agrega duplicado`);
    }
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
    console.log(`🚩 Flag set: ${key} = ${value}`);
  },

  getFlag(key) {
    return this.flags[key] ?? false;
  },

  hasFlag(key) {
    return this.flags[key] === true;
  },

  doesNotHaveFlag(key) {
    return !this.flags[key];
  },

  hasAllFlags(flagNames) {
    return flagNames.every(flag => this.hasFlag(flag));
  },

  hasAnyFlag(flagNames) {
    return flagNames.some(flag => this.hasFlag(flag));
  },

  // Filtrar documentos disponibles según flags
  filterAvailableDocuments(documents) {
    return documents.filter(doc => {
      // Sin requiresFlag? Siempre disponible
      if (!doc.requiresFlag) return true;

      // requiresFlag puede ser string o array
      const required = Array.isArray(doc.requiresFlag)
        ? doc.requiresFlag
        : [doc.requiresFlag];

      // Verificar cada requisito
      return required.every(req => {
        // Negación (!)
        if (req.startsWith('!')) {
          const flagName = req.substring(1);
          return this.doesNotHaveFlag(flagName);
        }
        // Flag normal
        return this.hasFlag(req);
      });
    });
  },

  // ═══════════════════════════════════════════
  // NPCs (expandidos con personalidad y trust)
  // ═══════════════════════════════════════════
  npcs: {
    valeria: {
      id: 'valeria',
      name: 'Valeria',
      role: 'Coordinadora',
      emoji: '👩',
      age: 45,
      personality: 'pragmatic', // para NPCManager
      description: 'Pragmática y equilibrada. Busca consensos.',
      background: 'Ex trabajadora social. Lleva 3 años en la red.',
      priorities: ['legitimidad', 'agua'],
      trust: 50,
      lastDecision: null,
      interactionCount: 0,
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
      personality: 'technical', // para NPCManager
      description: 'Directo y práctico. No le gustan las vueltas.',
      background: 'Electricista de toda la vida. El que más sabe de instalaciones.',
      priorities: ['electricidad', 'autonomia'],
      trust: 50,
      lastDecision: null,
      interactionCount: 0,
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
      personality: 'community', // para NPCManager
      description: 'Empática y preocupada por el bienestar.',
      background: 'Enfermera en hospital público. Voluntaria desde el inicio.',
      priorities: ['legitimidad', 'agua'],
      trust: 50,
      lastDecision: null,
      interactionCount: 0,
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
      personality: 'cautious', // para NPCManager
      description: 'Analítico y cauteloso. Le gustan los números.',
      background: 'Ingeniero civil. Perdió el laburo en el 2035 y se sumó a la red.',
      priorities: ['agua', 'electricidad'],
      trust: 50,
      lastDecision: null,
      interactionCount: 0,
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
    },
    laura: {
      id: 'laura',
      name: 'Laura',
      role: 'Organizadora comunitaria',
      emoji: '👩‍🦱',
      age: 41,
      personality: 'community',
      description: 'Activista de barrio. Siempre piensa en la comunidad.',
      background: 'Organizadora social. Conecta la red con el barrio.',
      priorities: ['legitimidad', 'autonomia'],
      trust: 50,
      lastDecision: null,
      interactionCount: 0,
      speaks: {
        positive: [
          'Esto fortalece al barrio.',
          'La gente va a apoyar esto.',
          'Así se construye comunidad.'
        ],
        negative: [
          'El barrio no va a entender esto.',
          'Vamos a perder apoyo.',
          'Esto nos aleja de la gente.'
        ],
        neutral: [
          'Voy a consultar con los vecinos.',
          'Veamos qué dice la gente.',
          'Lo hablamos en la asamblea.'
        ]
      }
    },
    dani: {
      id: 'dani',
      name: 'Dani',
      role: 'Técnico de agua',
      emoji: '👨‍🔧',
      age: 29,
      personality: 'practical',
      description: 'Práctico y eficiente. Sabe hacer mucho con poco.',
      background: 'Plomero. Se especializa en sistemas de agua.',
      priorities: ['agua', 'autonomia'],
      trust: 50,
      lastDecision: null,
      interactionCount: 0,
      speaks: {
        positive: [
          'Buena idea, es factible.',
          'Esto lo podemos hacer.',
          'Voy a conseguir las partes.'
        ],
        negative: [
          'No es práctico.',
          'Va a ser difícil conseguir eso.',
          'Mejor buscamos otra forma.'
        ],
        neutral: [
          'Dale, lo veo.',
          'Chequeo el sistema.',
          'Te aviso cómo viene.'
        ]
      }
    }
  },

  getNPC(id) {
    return this.npcs[id] || null;
  },

  // Obtener respuesta contextual de NPC
  getNPCResponse(npcId, sentiment = 'neutral') {
    // Validar que el NPC existe
    const npc = this.npcs[npcId];
    if (!npc) {
      console.warn(`⚠️ getNPCResponse: NPC "${npcId}" not found`);
      return null;
    }

    // Validar que el NPC tiene diálogos
    if (!npc.speaks) {
      console.warn(`⚠️ getNPCResponse: NPC "${npcId}" has no speaks defined`);
      return null;
    }

    // Intentar obtener frases del sentiment solicitado, fallback a neutral
    const phrases = npc.speaks[sentiment] || npc.speaks.neutral;

    // CORREGIDO: Validar que hay frases disponibles antes de acceder al array
    if (!phrases || !Array.isArray(phrases) || phrases.length === 0) {
      console.warn(`⚠️ getNPCResponse: NPC "${npcId}" has no phrases for sentiment "${sentiment}"`);
      return null;
    }

    // Random access seguro ahora que validamos el array
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
  // NPC TRUST SYSTEM
  // ═══════════════════════════════════════════

  // Modificar trust de un NPC
  modifyNPCTrust(npcId, amount, reason) {
    if (!this.npcs[npcId]) {
      console.warn(`⚠️ modifyNPCTrust: NPC "${npcId}" not found`);
      return;
    }

    // Aplicar cambio con límites 0-100
    this.npcs[npcId].trust = Math.max(0, Math.min(100, this.npcs[npcId].trust + amount));

    // Registrar decisión
    this.npcs[npcId].lastDecision = {
      reason,
      amount,
      day: this.currentDay
    };
    this.npcs[npcId].interactionCount++;

    console.log(`💭 ${npcId} trust: ${this.npcs[npcId].trust} (${amount > 0 ? '+' : ''}${amount})`);
  },

  // Obtener nivel de trust (high/good/neutral/low/critical)
  getNPCTrustLevel(npcId) {
    const npc = this.npcs[npcId];
    if (!npc) return 'neutral';

    const trust = npc.trust;
    if (trust >= 80) return 'high';
    if (trust >= 60) return 'good';
    if (trust >= 40) return 'neutral';
    if (trust >= 20) return 'low';
    return 'critical';
  },

  // Obtener modificador de respuesta según trust y personalidad
  getNPCResponseModifier(npcId) {
    const npc = this.npcs[npcId];
    if (!npc) return { level: 'neutral', personality: 'neutral' };

    return {
      level: this.getNPCTrustLevel(npcId),
      personality: npc.personality || 'neutral'
    };
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

    // Reset NPC trust
    Object.keys(this.npcs).forEach(npcId => {
      this.npcs[npcId].trust = 50;
      this.npcs[npcId].lastDecision = null;
      this.npcs[npcId].interactionCount = 0;
    });
  }
};

// Export global
if (typeof window !== 'undefined') {
  window.gameState = gameState;
}
