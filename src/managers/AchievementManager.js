/**
 * AchievementManager - Sistema de Logros para Red de Aguante
 *
 * Maneja 20 achievements en 5 categorías:
 * - Historia (5): Endings alcanzados
 * - Personajes (4): Arcos de NPCs
 * - Gestión (5): Maestría en recursos
 * - Decisiones (4): Caminos únicos
 * - Secretos (2): Contenido oculto
 */

class AchievementManager {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.tracking = {
      // Para "Gestora Experta" - nunca bajo 20%
      resourceMinimums: {
        electricidad: 100,
        agua: 100,
        legitimidad: 100,
        autonomia: 100,
        creditos: 2000
      },
      // Para "Economista Radical" - nunca negativo
      creditsNeverNegative: true,
      // Para "Asambleísta Perfecta"
      asambleasAsistidas: 0,
      // Para "Polivalente"
      tareasUsadas: new Set(),
      // Para "Coleccionista de Futuros"
      endingHistory: [],
      // Para "Todas las Voces"
      npcConsultedInAssembly: {}
    };
    this.pendingNotifications = [];
  }

  initializeAchievements() {
    return [
      // ====== CATEGORÍA: HISTORIA (5) ======
      {
        id: 'achievement_sobrevivir_60',
        title: 'Red de Aguante',
        description: 'Sobreviviste los 60 días. La red sigue en pie.',
        icon: '🏘️',
        rarity: 2,
        unlocked: false,
        unlockedAt: null,
        category: 'historia',
        points: 10
      },
      {
        id: 'achievement_ending_utopico',
        title: 'Arquitecta del Futuro',
        description: 'Alcanzaste el ending utópico. Buenos Aires 2037 tiene esperanza.',
        icon: '✨',
        rarity: 4,
        unlocked: false,
        unlockedAt: null,
        category: 'historia',
        points: 50
      },
      {
        id: 'achievement_ending_resistencia',
        title: 'Contra Viento y Marea',
        description: 'Aguantaste hasta el final a pesar de todo. La resistencia vale.',
        icon: '💪',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'historia',
        points: 25
      },
      {
        id: 'achievement_ending_colectivo',
        title: 'Colectivista',
        description: 'Priorizaste autonomía sobre todo. La red decide su destino.',
        icon: '🤝',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'historia',
        points: 25
      },
      {
        id: 'achievement_todos_endings',
        title: 'Coleccionista de Futuros',
        description: 'Experimentaste todos los endings posibles. Conocés cada futuro de Buenos Aires 2037.',
        icon: '🎭',
        rarity: 5,
        unlocked: false,
        unlockedAt: null,
        category: 'historia',
        points: 100
      },

      // ====== CATEGORÍA: PERSONAJES (4) ======
      {
        id: 'achievement_marcos_lider',
        title: 'La Voz de Marcos',
        description: 'Marcos encontró su voz. Ahora lidera con confianza.',
        icon: '🎤',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'personajes',
        points: 25
      },
      {
        id: 'achievement_beto_idealista',
        title: 'Idealista Porteño',
        description: 'Beto dejó de ser solo pragmático. Ahora sueña con una red más grande.',
        icon: '💡',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'personajes',
        points: 25
      },
      {
        id: 'achievement_yani_comunitaria',
        title: 'El Cuidado es Comunitario',
        description: 'Yani creó un equipo de salud. Ya no está sola.',
        icon: '❤️',
        rarity: 4,
        unlocked: false,
        unlockedAt: null,
        category: 'personajes',
        points: 50
      },
      {
        id: 'achievement_todos_npcs_felices',
        title: 'Familia de Aguante',
        description: 'Todos los NPCs alcanzaron sus mejores versiones. Beto idealista, Yani balanceada/comunitaria, Marcos líder.',
        icon: '🌟',
        rarity: 5,
        unlocked: false,
        unlockedAt: null,
        category: 'personajes',
        points: 100
      },

      // ====== CATEGORÍA: GESTIÓN (5) ======
      {
        id: 'achievement_nunca_critico',
        title: 'Gestora Experta',
        description: 'Nunca dejaste que ningún recurso cayera a nivel crítico (<20%).',
        icon: '📊',
        rarity: 4,
        unlocked: false,
        unlockedAt: null,
        category: 'gestion',
        points: 50
      },
      {
        id: 'achievement_todos_recursos_80',
        title: 'La Abundancia es Posible',
        description: 'Terminaste con todos los recursos por encima de 80%. La red prospera.',
        icon: '🌈',
        rarity: 5,
        unlocked: false,
        unlockedAt: null,
        category: 'gestion',
        points: 100
      },
      {
        id: 'achievement_todas_asambleas',
        title: 'Asambleísta Perfecta',
        description: 'Participaste en todas las asambleas. La democracia directa funciona.',
        icon: '🗣️',
        rarity: 2,
        unlocked: false,
        unlockedAt: null,
        category: 'gestion',
        points: 10
      },
      {
        id: 'achievement_nunca_deficit',
        title: 'Economista Radical',
        description: 'Nunca tuviste déficit de créditos. La economía solidaria es sustentable.',
        icon: '💰',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'gestion',
        points: 25
      },
      {
        id: 'achievement_todas_tareas_usadas',
        title: 'Polivalente',
        description: 'Usaste todas las tareas disponibles al menos una vez. Conocés todas las herramientas.',
        icon: '🛠️',
        rarity: 2,
        unlocked: false,
        unlockedAt: null,
        category: 'gestion',
        points: 10
      },

      // ====== CATEGORÍA: DECISIONES (4) ======
      {
        id: 'achievement_autonomia_maxima',
        title: 'Territorio Libre',
        description: 'Rechazaste toda ayuda externa. La red es completamente autónoma.',
        icon: '🏴',
        rarity: 4,
        unlocked: false,
        unlockedAt: null,
        category: 'decisiones',
        points: 50
      },
      {
        id: 'achievement_todas_alianzas',
        title: 'Diplomática',
        description: 'Estableciste todas las alianzas posibles. La red tiene muchos amigos.',
        icon: '🤲',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'decisiones',
        points: 25
      },
      {
        id: 'achievement_crisis_sin_evacuacion',
        title: 'La Crisis Nos Fortaleció',
        description: 'Sobreviviste la crisis final sin evacuar. La comunidad se mantuvo unida.',
        icon: '🔥',
        rarity: 4,
        unlocked: false,
        unlockedAt: null,
        category: 'decisiones',
        points: 50
      },
      {
        id: 'achievement_consultar_todos_npcs',
        title: 'Todas las Voces',
        description: 'En al menos una asamblea crítica, consultaste la opinión de todos los NPCs antes de decidir.',
        icon: '🗨️',
        rarity: 3,
        unlocked: false,
        unlockedAt: null,
        category: 'decisiones',
        points: 25
      },

      // ====== CATEGORÍA: SECRETOS (2) ======
      {
        id: 'achievement_easter_egg',
        title: 'Códigos Ocultos',
        description: 'Encontraste el easter egg secreto. ¿Qué más hay escondido?',
        icon: '🥚',
        rarity: 5,
        unlocked: false,
        unlockedAt: null,
        category: 'secretos',
        points: 100
      },
      {
        id: 'achievement_memoria_completa',
        title: 'Memoria Colectiva',
        description: 'Desbloqueaste todos los fragmentos de memoria del barrio. La historia vive.',
        icon: '📖',
        rarity: 4,
        unlocked: false,
        unlockedAt: null,
        category: 'secretos',
        points: 50
      }
    ];
  }

  // ====================================
  // TRACKING METHODS
  // ====================================

  /**
   * Track minimum resource levels para "Gestora Experta"
   */
  trackResourceLevel(resource, value) {
    if (this.tracking.resourceMinimums[resource] !== undefined) {
      if (value < this.tracking.resourceMinimums[resource]) {
        this.tracking.resourceMinimums[resource] = value;
        console.log(`  Resource minimum updated: ${resource} = ${value}`);
      }
    }
  }

  /**
   * Track créditos para "Economista Radical"
   */
  trackCredits(value) {
    if (value < 0 && this.tracking.creditsNeverNegative) {
      this.tracking.creditsNeverNegative = false;
      console.log('  Credits went negative - "Economista Radical" no longer achievable');
    }
  }

  /**
   * Track tarea usada para "Polivalente"
   */
  trackTaskUsed(taskId) {
    if (!this.tracking.tareasUsadas.has(taskId)) {
      this.tracking.tareasUsadas.add(taskId);
      console.log(`  Task tracked: ${taskId} (${this.tracking.tareasUsadas.size}/6)`);
    }
  }

  /**
   * Track asamblea asistida para "Asambleísta Perfecta"
   */
  trackAssemblyAttended() {
    this.tracking.asambleasAsistidas++;
    console.log(`  Assembly attended: ${this.tracking.asambleasAsistidas}/6`);
  }

  /**
   * Track NPC consultado en asamblea para "Todas las Voces"
   */
  trackNPCConsulted(encounterId, npcName) {
    if (!this.tracking.npcConsultedInAssembly[encounterId]) {
      this.tracking.npcConsultedInAssembly[encounterId] = new Set();
    }
    this.tracking.npcConsultedInAssembly[encounterId].add(npcName);
    console.log(`  NPC consulted in ${encounterId}: ${npcName}`);
  }

  /**
   * Agregar ending a historial para "Coleccionista de Futuros"
   */
  addEndingToHistory(endingType) {
    if (!this.tracking.endingHistory.includes(endingType)) {
      this.tracking.endingHistory.push(endingType);
      console.log(`  Ending added to history: ${endingType} (${this.tracking.endingHistory.length}/8)`);
    }
  }

  // ====================================
  // UNLOCK METHODS
  // ====================================

  /**
   * Unlock achievement
   */
  unlock(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);

    if (!achievement) {
      console.warn(`Achievement ${achievementId} not found`);
      return false;
    }

    if (achievement.unlocked) {
      console.log(`Achievement ${achievementId} already unlocked`);
      return false;
    }

    // Unlock
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();

    // Notification
    this.queueNotification(achievement);

    console.log(`🏆 Achievement unlocked: ${achievement.title} (+${achievement.points} pts)`);

    return true;
  }

  /**
   * Queue notification para mostrar in-game
   */
  queueNotification(achievement) {
    this.pendingNotifications.push({
      achievement: achievement,
      timestamp: Date.now()
    });
  }

  // ====================================
  // CHECK METHODS
  // ====================================

  /**
   * Check achievements al día 60
   */
  checkDay60Achievements() {
    console.log('=== CHECKING DAY 60 ACHIEVEMENTS ===');

    // #1: Sobrevivir 60 días
    this.unlock('achievement_sobrevivir_60');

    // #10: Nunca crítico (<20%)
    const nuncaCritico = Object.values(this.tracking.resourceMinimums).every(min => min >= 20);
    if (nuncaCritico) {
      this.unlock('achievement_nunca_critico');
    }

    // #11: Todos recursos >80%
    const recursos = gameState.resourceManager.getAll();
    const todosAltos = Object.values(recursos).every(r => r >= 80);
    if (todosAltos) {
      this.unlock('achievement_todos_recursos_80');
    }

    // #13: Nunca déficit
    if (this.tracking.creditsNeverNegative) {
      this.unlock('achievement_nunca_deficit');
    }

    // #14: Todas tareas usadas
    if (this.tracking.tareasUsadas.size >= 6) {
      this.unlock('achievement_todas_tareas_usadas');
    }

    // #12: Todas asambleas
    if (this.tracking.asambleasAsistidas >= 6) {
      this.unlock('achievement_todas_asambleas');
    }

    // Check NPC achievements
    this.checkNPCAchievements();

    // Check decision achievements
    this.checkDecisionAchievements();

    // #5: Todos endings
    if (this.tracking.endingHistory.length >= 8) {
      this.unlock('achievement_todos_endings');
    }

    console.log('=== DAY 60 ACHIEVEMENTS CHECK COMPLETE ===');
  }

  /**
   * Check achievements de arcos de NPCs
   */
  checkNPCAchievements() {
    console.log('=== CHECKING NPC ARC ACHIEVEMENTS ===');

    const marcos = gameState.characters.marcos;
    const beto = gameState.characters.beto;
    const yani = gameState.characters.yani;

    // #6: Marcos líder
    if (marcos.arc && marcos.arc.path === 'lider') {
      this.unlock('achievement_marcos_lider');
    }

    // #7: Beto idealista
    if (beto.arc && beto.arc.path === 'idealista') {
      this.unlock('achievement_beto_idealista');
    }

    // #8: Yani comunitaria
    if (yani.arc && yani.arc.path === 'comunitaria') {
      this.unlock('achievement_yani_comunitaria');
    }

    // #9: Todos NPCs felices
    const marcosOK = marcos.arc && marcos.arc.path === 'lider';
    const betoOK = beto.arc && beto.arc.path === 'idealista';
    const yaniOK = yani.arc && ['balanceada', 'comunitaria'].includes(yani.arc.path);

    if (marcosOK && betoOK && yaniOK) {
      this.unlock('achievement_todos_npcs_felices');
    }
  }

  /**
   * Check achievement de ending específico
   */
  checkEndingAchievement(endingType) {
    console.log(`=== CHECKING ENDING ACHIEVEMENT: ${endingType} ===`);

    // Agregar a historial
    this.addEndingToHistory(endingType);

    // Unlock achievement específico del ending
    const endingAchievements = {
      'UTOPICO': 'achievement_ending_utopico',
      'RESISTENCIA': 'achievement_ending_resistencia',
      'COLECTIVO': 'achievement_ending_colectivo'
      // Agregar otros endings según existan
    };

    if (endingAchievements[endingType]) {
      this.unlock(endingAchievements[endingType]);
    }
  }

  /**
   * Check achievements de decisiones
   */
  checkDecisionAchievements() {
    console.log('=== CHECKING DECISION ACHIEVEMENTS ===');

    // #15: Autonomía máxima
    const autonomia = gameState.resourceManager.get('autonomia');
    const rechazoDonacion = gameState.flags.includes('rechazo_donacion');
    const rechazoMunicipal = gameState.flags.includes('rechazo_municipal');

    if (rechazoDonacion && rechazoMunicipal && autonomia >= 80) {
      this.unlock('achievement_autonomia_maxima');
    }

    // #16: Todas las alianzas
    const alianzas = [
      'alianza_universidad',
      'alianza_sindicato',
      'acuerdo_municipal',
      'red_barrios_conectada'
    ];
    const todasAlianzas = alianzas.every(flag => gameState.flags.includes(flag));
    if (todasAlianzas) {
      this.unlock('achievement_todas_alianzas');
    }

    // #17: Crisis sin evacuación
    if (gameState.flags.includes('crisis_final_sin_evacuacion')) {
      this.unlock('achievement_crisis_sin_evacuacion');
    }

    // #18: Consultar todos NPCs en asamblea
    const assemblyIds = ['primera_asamblea', 'asamblea_expansion', 'decision_evacuacion'];
    for (const assemblyId of assemblyIds) {
      const consulted = this.tracking.npcConsultedInAssembly[assemblyId];
      if (consulted && consulted.size >= 4) { // 4 NPCs (beto, yani, marcos, valeria)
        this.unlock('achievement_consultar_todos_npcs');
        break;
      }
    }
  }

  // ====================================
  // PERSISTENCE
  // ====================================

  /**
   * Serializar para save
   */
  toJSON() {
    return {
      achievements: this.achievements.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt
      })),
      tracking: {
        resourceMinimums: this.tracking.resourceMinimums,
        creditsNeverNegative: this.tracking.creditsNeverNegative,
        asambleasAsistidas: this.tracking.asambleasAsistidas,
        tareasUsadas: Array.from(this.tracking.tareasUsadas),
        endingHistory: this.tracking.endingHistory,
        npcConsultedInAssembly: Object.fromEntries(
          Object.entries(this.tracking.npcConsultedInAssembly).map(([k, v]) => [k, Array.from(v)])
        )
      }
    };
  }

  /**
   * Deserializar desde save
   */
  fromJSON(data) {
    if (!data) return;

    // Restore unlocked achievements
    if (data.achievements) {
      data.achievements.forEach(savedAch => {
        const achievement = this.achievements.find(a => a.id === savedAch.id);
        if (achievement) {
          achievement.unlocked = savedAch.unlocked;
          achievement.unlockedAt = savedAch.unlockedAt;
        }
      });
    }

    // Restore tracking
    if (data.tracking) {
      this.tracking.resourceMinimums = data.tracking.resourceMinimums || this.tracking.resourceMinimums;
      this.tracking.creditsNeverNegative = data.tracking.creditsNeverNegative !== false;
      this.tracking.asambleasAsistidas = data.tracking.asambleasAsistidas || 0;
      this.tracking.tareasUsadas = new Set(data.tracking.tareasUsadas || []);
      this.tracking.endingHistory = data.tracking.endingHistory || [];

      // Restore npcConsultedInAssembly
      if (data.tracking.npcConsultedInAssembly) {
        this.tracking.npcConsultedInAssembly = Object.fromEntries(
          Object.entries(data.tracking.npcConsultedInAssembly).map(([k, v]) => [k, new Set(v)])
        );
      }
    }

    console.log('Achievement data loaded from save');
  }

  // ====================================
  // STATS
  // ====================================

  /**
   * Obtener estadísticas globales
   */
  getStats() {
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    const total = this.achievements.length;
    const points = this.achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    const maxPoints = this.achievements.reduce((sum, a) => sum + a.points, 0);

    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
      points,
      maxPoints
    };
  }

  /**
   * Obtener achievements por categoría
   */
  getByCategory(category) {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Obtener achievement por ID
   */
  getById(achievementId) {
    return this.achievements.find(a => a.id === achievementId);
  }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.AchievementManager = AchievementManager;
}
