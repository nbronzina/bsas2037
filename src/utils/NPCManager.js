/**
 * NPCManager - Sistema de trust y reactividad de NPCs
 * Maneja cómo los NPCs reaccionan a las decisiones del jugador
 */

class NPCManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  // ═══════════════════════════════════════════
  // PROCESAMIENTO DE DECISIONES
  // ═══════════════════════════════════════════

  /**
   * Procesar decisión y modificar trust del NPC según personalidad
   * @param {string} npcId - ID del NPC
   * @param {string} optionId - ID de la opción elegida
   * @param {Object} consequences - Consecuencias de la decisión
   */
  processDecision(npcId, optionId, consequences) {
    const npc = this.gameState.npcs[npcId];
    if (!npc) {
      console.warn(`⚠️ NPCManager.processDecision: NPC "${npcId}" not found`);
      return;
    }

    let trustChange = 0;

    // Calcular cambio base según alineación con prioridades
    trustChange += this.calculatePriorityAlignment(npc, consequences);

    // Modificadores adicionales según personalidad
    trustChange += this.calculatePersonalityModifier(npc, consequences);

    // Aplicar cambio de trust
    if (trustChange !== 0) {
      this.gameState.modifyNPCTrust(npcId, trustChange, optionId);
    }
  }

  /**
   * Calcular alineación con prioridades del NPC
   */
  calculatePriorityAlignment(npc, consequences) {
    if (!consequences) return 0;

    let score = 0;

    // Calcular impacto en prioridades del NPC
    npc.priorities.forEach(priority => {
      if (consequences[priority]) {
        // Cada punto de cambio en una prioridad = 1 punto de trust
        score += consequences[priority];
      }
    });

    // Limitar a ±10 puntos por decisión
    return Math.max(-10, Math.min(10, score));
  }

  /**
   * Modificadores según personalidad específica
   */
  calculatePersonalityModifier(npc, consequences) {
    if (!consequences) return 0;

    let modifier = 0;

    switch (npc.personality) {
      case 'technical':
        // Beto aprecia decisiones que mejoran infraestructura técnica
        if (consequences.electricidad > 0) modifier += 2;
        if (consequences.autonomia > 0) modifier += 1;
        // Penaliza decisiones que ignoran aspectos técnicos
        if (consequences.electricidad < -5) modifier -= 2;
        break;

      case 'community':
        // Laura/Yani aprecian decisiones pro-comunidad
        if (consequences.legitimidad > 0) modifier += 2;
        // Penalizan decisiones que dañan la confianza
        if (consequences.legitimidad < -5) modifier -= 3;
        break;

      case 'pragmatic':
        // Valeria aprecia balance y decisiones equilibradas
        const totalChange = Object.values(consequences).reduce((a, b) => a + Math.abs(b), 0);
        // Penaliza decisiones extremas (muy positivas o muy negativas)
        if (totalChange > 15) modifier -= 1;
        // Aprecia cuando no hay cambios negativos grandes
        const hasLargeNegative = Object.values(consequences).some(v => v < -8);
        if (!hasLargeNegative) modifier += 1;
        break;

      case 'cautious':
        // Marcos aprecia decisiones conservadoras
        const negativesCount = Object.values(consequences).filter(v => v < 0).length;
        // Penaliza decisiones con muchas consecuencias negativas
        if (negativesCount > 2) modifier -= 2;
        // Aprecia decisiones que mejoran recursos sin riesgos
        if (negativesCount === 0) modifier += 2;
        break;

      case 'practical':
        // Dani aprecia soluciones prácticas (mejoras de agua/autonomía)
        if (consequences.agua > 0) modifier += 2;
        if (consequences.autonomia > 0) modifier += 1;
        // Penaliza si se sacrifica agua innecesariamente
        if (consequences.agua < -5) modifier -= 2;
        break;
    }

    return modifier;
  }

  // ═══════════════════════════════════════════
  // GENERACIÓN DE RESPUESTAS
  // ═══════════════════════════════════════════

  /**
   * Generar sufijo de respuesta según nivel de trust
   * @param {string} npcId - ID del NPC
   * @returns {string} Sufijo de texto para agregar a la respuesta
   */
  getResponseSuffix(npcId) {
    const npc = this.gameState.npcs[npcId];
    if (!npc) return '';

    const level = this.gameState.getNPCTrustLevel(npcId);
    const responses = this.getTrustResponses(npcId);

    return responses[level] || '';
  }

  /**
   * Obtener templates de respuesta según trust para cada NPC
   */
  getTrustResponses(npcId) {
    const templates = {
      valeria: {
        high: "\n\nValeria asiente con aprobación. 'Estás manejando esto bien.'",
        good: "\n\nValeria parece conforme con tu decisión.",
        neutral: "\n\nValeria toma nota sin comentarios.",
        low: "\n\nValeria frunce el ceño. No parece convencida.",
        critical: "\n\nValeria suspira pesadamente. 'Esto no puede seguir así.'"
      },
      beto: {
        high: "\n\nBeto te palmea el hombro. 'Sabía que podía contar con vos.'",
        good: "\n\nBeto asiente. 'Dale, vamos para adelante.'",
        neutral: "\n\nBeto se encoge de hombros.",
        low: "\n\nBeto evita tu mirada. Parece decepcionado.",
        critical: "\n\nBeto guarda sus herramientas sin decir palabra."
      },
      yani: {
        high: "\n\nYani sonríe aliviada. 'Esto va a ayudar mucho a la gente.'",
        good: "\n\nYani asiente con aprobación.",
        neutral: "\n\nYani toma nota en su cuaderno.",
        low: "\n\nYani se muerde el labio, preocupada.",
        critical: "\n\nYani niega con la cabeza. 'No sé si la gente va a aguantar esto.'"
      },
      marcos: {
        high: "\n\nMarcos revisa sus notas. 'Excelente decisión, los números lo avalan.'",
        good: "\n\nMarcos asiente. 'Razonable.'",
        neutral: "\n\nMarcos anota en su libreta.",
        low: "\n\nMarcos frunce el ceño. 'Los cálculos no me cierran.'",
        critical: "\n\nMarcos cierra su libreta bruscamente. 'Esto es insostenible.'"
      },
      laura: {
        high: "\n\nLaura sonríe ampliamente. 'El barrio va a estar agradecido.'",
        good: "\n\nLaura asiente satisfecha.",
        neutral: "\n\nLaura lo anota para comentarlo en la asamblea.",
        low: "\n\nLaura cruza los brazos. 'La gente no va a estar contenta.'",
        critical: "\n\nLaura niega con la cabeza. 'Estamos perdiendo el apoyo del barrio.'"
      },
      dani: {
        high: "\n\nDani sonríe. 'Dale, me pongo a trabajar en esto.'",
        good: "\n\nDani asiente. 'Es factible.'",
        neutral: "\n\nDani revisa el sistema.",
        low: "\n\nDani suspira. 'Va a ser complicado.'",
        critical: "\n\nDani niega. 'No puedo trabajar así.'"
      }
    };

    return templates[npcId] || {};
  }

  // ═══════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════

  /**
   * Obtener estado de trust de todos los NPCs
   */
  getAllNPCTrustStatus() {
    const status = {};

    Object.keys(this.gameState.npcs).forEach(npcId => {
      const npc = this.gameState.npcs[npcId];
      status[npcId] = {
        name: npc.name,
        trust: npc.trust,
        level: this.gameState.getNPCTrustLevel(npcId),
        interactionCount: npc.interactionCount,
        lastDecision: npc.lastDecision
      };
    });

    return status;
  }

  /**
   * Debug: Mostrar estado de trust de todos los NPCs
   */
  showNPCStatus() {
    console.log('👥 NPC Trust Levels:');
    Object.entries(this.gameState.npcs).forEach(([id, npc]) => {
      const level = this.gameState.getNPCTrustLevel(id);
      console.log(`  ${npc.emoji} ${npc.name} (${id}): ${npc.trust} (${level}) - ${npc.interactionCount} interactions`);
      if (npc.lastDecision) {
        console.log(`    Last: ${npc.lastDecision.reason} (${npc.lastDecision.amount > 0 ? '+' : ''}${npc.lastDecision.amount}) on day ${npc.lastDecision.day}`);
      }
    });
  }
}

// Export global
if (typeof window !== 'undefined') {
  window.NPCManager = NPCManager;
}

/*
═══════════════════════════════════════════
TESTING CHECKLIST
═══════════════════════════════════════════

1. Iniciar nuevo juego
2. Procesar doc de Beto con opción que aumenta electricidad
3. Verificar console: "💭 beto trust: 55 (+5)"
4. Procesar otro doc de Beto con opción que reduce electricidad
5. Verificar trust bajó
6. En consola: window.showNPCStatus()
7. Verificar números correctos

EJEMPLO DE USO:

// En DeskScene, después de procesar decisión:
if (gameState.npcManager && doc.sender && gameState.npcs[doc.sender]) {
  gameState.npcManager.processDecision(doc.sender, option.id, option.consequences);
  const trustSuffix = gameState.npcManager.getResponseSuffix(doc.sender);
  npcResponse += trustSuffix;
}

COMANDOS DE DEBUG:

// Mostrar estado de NPCs
window.showNPCStatus()

// Modificar trust manualmente
gameState.modifyNPCTrust('beto', 10, 'test')

// Ver modificador de respuesta
gameState.getNPCResponseModifier('valeria')

═══════════════════════════════════════════
*/
