/**
 * Gestiona el pool de documentos y selección por día
 */

class DocumentManager {
  constructor() {
    this.allDocuments = [];
    this.dayConfig = this.getDefaultDayConfig();
  }

  // ═══════════════════════════════════════════
  // CONFIGURACIÓN DE DÍAS
  // ═══════════════════════════════════════════

  getDefaultDayConfig() {
    return {
      1: { fixed: ['d1_intro', 'd1_generador'], randomCount: 0, decay: 0 },
      2: { fixed: ['d2_agua'], randomCount: 2, decay: 4 },
      3: { fixed: ['d3_conflicto'], randomCount: 2, decay: 5 },
      4: { fixed: ['d4_crisis'], randomCount: 3, decay: 5 },
      5: { fixed: ['d5_preasamblea', 'd5_asamblea'], randomCount: 2, decay: 5 },
      6: { fixed: ['d6_balance'], randomCount: 2, decay: 3 },
      7: { fixed: ['d7_reflexion', 'd7_cierre'], randomCount: 0, decay: 0 }
    };
  }

  // ═══════════════════════════════════════════
  // CARGAR DOCUMENTOS
  // ═══════════════════════════════════════════

  loadDocuments(documentsData) {
    this.allDocuments = documentsData;
    console.log(`📄 Loaded ${this.allDocuments.length} documents`);
  }

  getDocumentById(id) {
    return this.allDocuments.find(doc => doc.id === id) || null;
  }

  // ═══════════════════════════════════════════
  // SELECCIONAR DOCUMENTOS PARA EL DÍA
  // ═══════════════════════════════════════════

  // CORREGIDO: Validar día y manejar casos sin documentos
  getDocumentsForDay(day) {
    // Validar día
    if (typeof day !== 'number' || day < 1 || day > 7) {
      console.error(`❌ getDocumentsForDay: día inválido (${day}). Debe estar entre 1-7`);
      return [];
    }

    const config = this.dayConfig[day];
    if (!config) {
      console.warn(`⚠️ No hay configuración para día ${day}`);
      return [];
    }

    const documents = [];

    // 1. Agregar documentos fijos
    if (config.fixed && Array.isArray(config.fixed)) {
      config.fixed.forEach(docId => {
        const doc = this.getDocumentById(docId);
        if (doc) {
          // Verificar condiciones
          if (this.checkConditions(doc)) {
            documents.push(doc);
          }
        } else {
          console.warn(`⚠️ Documento fijo "${docId}" no encontrado`);
        }
      });
    }

    // 2. Agregar documentos aleatorios
    const randomCount = config.randomCount || 0;
    if (randomCount > 0) {
      const randomDocs = this.getRandomDocuments(day, randomCount);
      documents.push(...randomDocs);
    }

    // 3. Advertir si no hay documentos para un día válido
    if (documents.length === 0) {
      console.warn(`⚠️ No hay documentos disponibles para día ${day}`);
    } else {
      console.log(`📅 Día ${day}: ${documents.length} documentos seleccionados`);
    }

    return documents;
  }

  getRandomDocuments(day, count) {
    if (count <= 0) return [];

    // Filtrar documentos elegibles
    const eligible = this.allDocuments.filter(doc => {
      // No es fijo para ningún día
      if (doc.day && doc.day !== 'random') return false;

      // No está ya completado
      if (gameState.completedDocuments.includes(doc.id)) return false;

      // Cumple condiciones
      if (!this.checkConditions(doc)) return false;

      return true;
    });

    // Shuffle y tomar count
    const shuffled = this.shuffle([...eligible]);
    return shuffled.slice(0, count);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ═══════════════════════════════════════════
  // VERIFICAR CONDICIONES
  // ═══════════════════════════════════════════

  checkConditions(doc) {
    if (!doc.conditions) return true;

    const conditions = doc.conditions;

    // Verificar recursos mínimos
    if (conditions.minElectricidad && gameState.resources.electricidad < conditions.minElectricidad) {
      return false;
    }
    if (conditions.minAgua && gameState.resources.agua < conditions.minAgua) {
      return false;
    }
    if (conditions.minLegitimidad && gameState.resources.legitimidad < conditions.minLegitimidad) {
      return false;
    }
    if (conditions.minAutonomia && gameState.resources.autonomia < conditions.minAutonomia) {
      return false;
    }

    // Verificar flags requeridos
    if (conditions.requiresFlag && !gameState.hasFlag(conditions.requiresFlag)) {
      return false;
    }

    // Verificar flags excluidos
    if (conditions.excludesFlag && gameState.hasFlag(conditions.excludesFlag)) {
      return false;
    }

    return true;
  }

  // ═══════════════════════════════════════════
  // APLICAR DECAY
  // ═══════════════════════════════════════════

  applyDayDecay(day) {
    const config = this.dayConfig[day];
    if (!config || config.decay <= 0) return;

    const decay = config.decay;

    Object.keys(gameState.resources).forEach(key => {
      gameState.modifyResource(key, -decay);
    });

    console.log(`📉 Applied decay of ${decay} for day ${day}`);
  }

  // ═══════════════════════════════════════════
  // PROCESAR DECISIÓN
  // ═══════════════════════════════════════════

  processDecision(document, optionIndex) {
    // CORREGIDO: Validar que el documento existe y tiene estructura válida
    if (!document) {
      console.error('❌ processDecision: document is null or undefined');
      return null;
    }

    if (!document.options || !Array.isArray(document.options)) {
      console.error(`❌ processDecision: document "${document.id}" has no options array`);
      return null;
    }

    // Validar que el índice de opción es válido
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= document.options.length) {
      console.error(`❌ processDecision: invalid option index ${optionIndex} for document "${document.id}" (has ${document.options.length} options)`);
      return null;
    }

    const option = document.options[optionIndex];
    if (!option) {
      console.error(`❌ processDecision: option at index ${optionIndex} is null/undefined`);
      return null;
    }

    // Aplicar consecuencias
    if (option.consequences) {
      Object.entries(option.consequences).forEach(([key, value]) => {
        gameState.modifyResource(key, value);
      });
    }

    // Setear flag si existe
    if (option.setsFlag) {
      gameState.setFlag(option.setsFlag);
    }

    if (document.setsFlag) {
      gameState.setFlag(document.setsFlag);
    }

    // Marcar documento como completado
    if (!gameState.completedDocuments.includes(document.id)) {
      gameState.completedDocuments.push(document.id);
    }

    console.log(`📝 Processed decision: ${document.id} → option ${optionIndex}`);

    return {
      document,
      option,
      response: option.response || 'Decisión registrada.'
    };
  }
}

if (typeof window !== 'undefined') {
  window.DocumentManager = DocumentManager;
}
