/**
 * MemoriaColectivaManager - Sistema de Memoria Colectiva del Barrio
 *
 * Registra eventos significativos como "fragmentos de memoria"
 * que crean una cronología narrativa consultable del barrio.
 *
 * Características:
 * - Fragmentos fijos (hitos en días específicos)
 * - Fragmentos dinámicos (decisiones, crisis, logros)
 * - Sistema de puntuación (memoria score)
 * - Influencia sutil en endings
 * - Achievement por memoria completa
 */

class MemoriaColectivaManager {
  constructor() {
    this.fragmentos = [];
    this.crisisResolvedFlags = {}; // Track which crises have been resolved
    this.initializeFragments();
  }

  /**
   * Inicializa fragmentos fijos (hitos y templates)
   */
  initializeFragments() {
    // ========================================
    // HITOS FIJOS
    // ========================================

    this.addFragment({
      id: 'memoria_primer_dia',
      day: 1,
      title: 'El Primer Día',
      category: 'hito',
      icon: '🌅',
      shortText: 'Red de Aguante comienza sus operaciones.',
      longText: 'Hoy es el día 1. El barrio se organiza por primera vez como red autogestionada. Valeria convoca la primera asamblea. Hay esperanza, pero también incertidumbre. Nadie sabe si esto funcionará, pero todos están dispuestos a intentarlo.',
      narrator: 'colectiva',
      importance: 'alta',
      autoUnlock: true
    });

    this.addFragment({
      id: 'memoria_primera_semana',
      day: 7,
      title: 'Primera Semana Completa',
      category: 'logro',
      icon: '📅',
      shortText: 'Sobrevivimos la primera semana.',
      longText: 'Siete días de autogestión. Al principio parecían muchos. Ahora solo son el comienzo. La red está encontrando su ritmo. Los vecinos empiezan a confiar en que esto puede funcionar.',
      narrator: 'colectiva',
      importance: 'baja',
      autoUnlock: true
    });

    this.addFragment({
      id: 'memoria_dia_30',
      day: 30,
      title: 'Mitad del Camino',
      category: 'hito',
      icon: '🏘️',
      shortText: '30 días. La red sigue en pie.',
      longText: 'Han pasado 30 días desde que empezamos. El barrio cambió. Ya no somos vecinos que se saludan por compromiso. Somos una comunidad que se cuida. Los desafíos siguen, pero también la convicción de que este camino vale la pena.',
      narrator: 'colectiva',
      importance: 'media',
      autoUnlock: true
    });

    this.addFragment({
      id: 'memoria_dia_60',
      day: 60,
      title: 'El Último Día',
      category: 'hito',
      icon: '🎯',
      shortText: '60 días. Lo logramos.',
      longText: 'Llegamos al día 60. Red de Aguante sobrevivió. Esta memoria colectiva es el testimonio de todo lo que construimos, decidimos y superamos juntos. Cada fragmento aquí es parte de nuestra historia. Una historia que ahora pertenece al barrio para siempre.',
      narrator: 'colectiva',
      importance: 'alta',
      autoUnlock: true
    });

    // ========================================
    // LOGROS DE RECURSOS
    // ========================================

    this.addFragment({
      id: 'memoria_autonomia_80',
      day: null,
      title: 'Autonomía Plena',
      category: 'logro',
      icon: '🏴',
      shortText: 'La red es verdaderamente autónoma.',
      longText: 'Hoy alcanzamos 80% de autonomía. Ya no dependemos de nadie externo para funcionar. Este es el sueño que teníamos al principio. Lo hicimos realidad. El barrio funciona por y para los vecinos.',
      narrator: 'colectiva',
      importance: 'alta',
      autoUnlock: false
    });

    this.addFragment({
      id: 'memoria_todos_recursos_70',
      day: null,
      title: 'Abundancia de Recursos',
      category: 'logro',
      icon: '🌈',
      shortText: 'Por primera vez, todo está bien.',
      longText: 'Electricidad, agua, legitimidad, autonomía, créditos. Todo por encima de 70%. No es solo supervivencia. Es prosperidad comunitaria. Es posible vivir bien sin el sistema tradicional. Lo estamos demostrando.',
      narrator: 'colectiva',
      importance: 'alta',
      autoUnlock: false
    });

    // ========================================
    // NPCs ARCOS - Templates (se completan cuando ocurren)
    // ========================================

    this.addFragment({
      id: 'memoria_beto_expansion',
      day: null,
      title: 'Beto Propone Expandir',
      category: 'npc',
      icon: '⚡',
      shortText: 'Beto ya no es solo el técnico.',
      longText: 'Beto, el electricista pragmático que solo hablaba de cables, hoy propuso expandir la red a otros barrios. Fue sorprendente verlo pensar más allá de la supervivencia inmediata. El barrio debatió seriamente la propuesta.',
      narrator: 'beto',
      importance: 'media',
      autoUnlock: false
    });

    this.addFragment({
      id: 'memoria_yani_crisis',
      day: null,
      title: 'Yani al Límite',
      category: 'npc',
      icon: '💊',
      shortText: 'Yani confesó su agotamiento.',
      longText: 'Yani, que siempre cuidaba a todos, admitió que no podía más. Ese día aprendimos que cuidar también significa dejar que te cuiden. La comunidad respondió con solidaridad.',
      narrator: 'yani',
      importance: 'alta',
      autoUnlock: false
    });

    this.addFragment({
      id: 'memoria_marcos_voz',
      day: null,
      title: 'Marcos Encuentra su Voz',
      category: 'npc',
      icon: '💧',
      shortText: 'Marcos habló por primera vez en asamblea.',
      longText: 'Marcos, que siempre respondía con monosílabos, propuso una mejora técnica en asamblea. Algunos se sorprendieron tanto que no supieron qué decir. Fue el comienzo de una transformación.',
      narrator: 'marcos',
      importance: 'media',
      autoUnlock: false
    });

    console.log(`MemoriaColectivaManager: Initialized ${this.fragmentos.length} base fragments`);
  }

  /**
   * Agrega un fragmento a la lista
   */
  addFragment(fragmentData) {
    const fragment = {
      ...fragmentData,
      unlocked: false,
      unlockedAt: null
    };

    this.fragmentos.push(fragment);
  }

  /**
   * Desbloquea un fragmento existente
   */
  unlockFragment(fragmentId, customData = {}) {
    const fragment = this.fragmentos.find(f => f.id === fragmentId);

    if (!fragment) {
      console.warn(`Fragment ${fragmentId} not found`);
      return false;
    }

    if (fragment.unlocked) {
      return false;
    }

    fragment.unlocked = true;
    fragment.unlockedAt = Date.now();

    // Si el fragmento no tiene día asignado, usar día actual
    if (fragment.day === null && gameState && gameState.timeManager) {
      fragment.day = gameState.timeManager.currentDay;
    }

    // Aplicar custom data
    Object.assign(fragment, customData);

    console.log(`📖 Memory unlocked: ${fragment.title} (Day ${fragment.day})`);

    this.checkCompletionAchievement();

    return true;
  }

  /**
   * Crea un fragmento dinámico completamente nuevo
   */
  createDynamicFragment(baseId, data) {
    const currentDay = gameState && gameState.timeManager ? gameState.timeManager.currentDay : 0;

    const fragment = {
      id: `memoria_${baseId}_${Date.now()}`,
      day: data.day || currentDay,
      title: data.title,
      category: data.category || 'decision',
      icon: data.icon || '📌',
      shortText: data.shortText,
      longText: data.longText,
      narrator: data.narrator || 'colectiva',
      importance: data.importance || 'media',
      unlocked: true,
      unlockedAt: Date.now()
    };

    this.fragmentos.push(fragment);
    console.log(`📖 Dynamic memory created: ${fragment.title} (Day ${fragment.day})`);

    this.checkCompletionAchievement();

    return fragment.id;
  }

  /**
   * Verifica unlocks automáticos por día
   */
  checkDailyUnlocks(currentDay) {
    let unlocked = 0;

    this.fragmentos.forEach(fragment => {
      if (fragment.autoUnlock && fragment.day === currentDay && !fragment.unlocked) {
        this.unlockFragment(fragment.id);
        unlocked++;
      }
    });

    if (unlocked > 0) {
      console.log(`MemoriaColectiva: ${unlocked} daily fragments unlocked on day ${currentDay}`);
    }
  }

  /**
   * Verifica logros de recursos
   */
  checkResourceMilestones() {
    if (!gameState || !gameState.resourceManager) return;

    const recursos = gameState.resourceManager.getAll();

    // Autonomía 80%
    if (recursos.autonomia >= 80) {
      this.unlockFragment('memoria_autonomia_80');
    }

    // Todos recursos >70%
    const allHigh = ['electricidad', 'agua', 'legitimidad', 'autonomia'].every(key =>
      recursos[key] >= 70
    ) && recursos.creditos > 0;

    if (allHigh) {
      this.unlockFragment('memoria_todos_recursos_70');
    }
  }

  /**
   * Detecta y registra crisis resueltas
   */
  checkCrisisResolved(resource, previousValue, currentValue) {
    // Check if this crisis type already has a memory
    if (this.crisisResolvedFlags[resource]) {
      return; // Already created memory for this crisis type
    }

    const crisisTemplates = {
      electricidad: {
        threshold: { low: 30, high: 50 },
        title: 'Crisis Eléctrica Superada',
        shortText: 'Sobrevivimos el apagón crítico.',
        longText: 'La electricidad cayó a niveles peligrosos. Beto trabajó sin dormir. El barrio se organizó. Al día siguiente, el sistema volvió a funcionar. Aprendimos que podemos superar crisis juntos.',
        icon: '⚡'
      },
      agua: {
        threshold: { low: 20, high: 40 },
        title: 'Crisis Hídrica Superada',
        shortText: 'El agua volvió a fluir.',
        longText: 'Quedamos sin agua potable. Marcos improvisó soluciones de emergencia. Fue difícil, pero nadie se enfermó. La red probó su resiliencia.',
        icon: '💧'
      },
      legitimidad: {
        threshold: { low: 25, high: 50 },
        title: 'Confianza Restaurada',
        shortText: 'La comunidad volvió a confiar.',
        longText: 'La confianza en la red cayó peligrosamente. Hubo cuestionamientos, críticas, dudas. Pero escuchamos, respondimos, y la comunidad decidió seguir creyendo en este proyecto.',
        icon: '🤝'
      }
    };

    const template = crisisTemplates[resource];
    if (!template) return;

    // Check if crisis was resolved (went from below threshold to above)
    if (previousValue < template.threshold.low && currentValue > template.threshold.high) {
      this.createDynamicFragment(`crisis_${resource}`, {
        ...template,
        category: 'crisis',
        importance: 'alta'
      });

      // Mark this crisis type as resolved
      this.crisisResolvedFlags[resource] = true;
    }
  }

  /**
   * Desbloquea fragmentos de NPCs basándose en sus arcos
   */
  checkNPCArcs() {
    if (!gameState || !gameState.characters) return;

    const characters = gameState.characters;

    // Beto - Día 30, encounter beto_propone_expansion
    if (characters.beto && characters.beto.arc) {
      if (characters.beto.arc.triggers && characters.beto.arc.triggers.includes('beto_propone_expansion')) {
        this.unlockFragment('memoria_beto_expansion');
      }
    }

    // Yani - Día 35, encounter yani_al_limite
    if (characters.yani && characters.yani.arc) {
      if (characters.yani.arc.triggers && characters.yani.arc.triggers.includes('yani_revelacion')) {
        this.unlockFragment('memoria_yani_crisis');
      }
    }

    // Marcos - Día 29, encounter marcos_primera_voz
    if (characters.marcos && characters.marcos.arc) {
      if (characters.marcos.arc.triggers && characters.marcos.arc.triggers.includes('marcos_primera_voz')) {
        this.unlockFragment('memoria_marcos_voz');
      }
    }
  }

  /**
   * Obtiene todos los fragmentos desbloqueados, ordenados por día
   */
  getAllFragments() {
    return this.fragmentos
      .filter(f => f.unlocked)
      .sort((a, b) => a.day - b.day);
  }

  /**
   * Obtiene fragmentos por categoría
   */
  getFragmentsByCategory(category) {
    return this.getAllFragments().filter(f => f.category === category);
  }

  /**
   * Obtiene fragmento por ID
   */
  getFragmentById(id) {
    return this.fragmentos.find(f => f.id === id);
  }

  /**
   * Calcula estadísticas del sistema
   */
  getStats() {
    const unlocked = this.fragmentos.filter(f => f.unlocked).length;
    const total = this.fragmentos.length;

    const memoriaScore = this.fragmentos
      .filter(f => f.unlocked)
      .reduce((sum, f) => {
        const points = { alta: 3, media: 2, baja: 1 };
        return sum + (points[f.importance] || 1);
      }, 0);

    return {
      totalUnlocked: unlocked,
      totalPossible: total,
      completionPercentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      memoriaScore
    };
  }

  /**
   * Verifica si debe desbloquear achievement de memoria completa
   */
  checkCompletionAchievement() {
    const stats = this.getStats();
    if (stats.completionPercentage >= 90 && gameState && gameState.achievementManager) {
      gameState.achievementManager.unlock('achievement_memoria_completa');
    }
  }

  /**
   * Obtiene bonus narrativo para ending según memoria
   */
  getEndingBonus() {
    const stats = this.getStats();

    if (stats.memoriaScore > 80) {
      return {
        level: 'rica',
        text: '\n\nLa historia de estos 60 días quedó registrada en detalle. Cada decisión, cada crisis superada, cada logro comunitario. El archivo es testimonio de lo que construimos. Futuras generaciones sabrán cómo fue posible.'
      };
    } else if (stats.memoriaScore > 40) {
      return {
        level: 'parcial',
        text: '\n\nAlgunos momentos importantes quedaron registrados. La memoria del barrio preserva lo esencial, aunque muchos detalles se perdieron en el día a día.'
      };
    } else {
      return {
        level: 'escasa',
        text: ''
      };
    }
  }

  /**
   * Exporta estado para guardado
   */
  toJSON() {
    return {
      fragmentos: this.fragmentos.map(f => ({
        id: f.id,
        day: f.day,
        title: f.title,
        category: f.category,
        icon: f.icon,
        shortText: f.shortText,
        longText: f.longText,
        narrator: f.narrator,
        importance: f.importance,
        autoUnlock: f.autoUnlock,
        unlocked: f.unlocked,
        unlockedAt: f.unlockedAt
      })),
      crisisResolvedFlags: this.crisisResolvedFlags
    };
  }

  /**
   * Importa estado desde guardado
   */
  fromJSON(data) {
    if (!data || !data.fragmentos) return;

    // Clear current fragmentos
    this.fragmentos = [];

    // Restore all fragments from save
    data.fragmentos.forEach(savedFragment => {
      this.fragmentos.push({ ...savedFragment });
    });

    // Restore crisis flags
    if (data.crisisResolvedFlags) {
      this.crisisResolvedFlags = data.crisisResolvedFlags;
    }

    console.log(`MemoriaColectiva: Loaded ${this.fragmentos.length} fragments from save`);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MemoriaColectivaManager = MemoriaColectivaManager;
}
