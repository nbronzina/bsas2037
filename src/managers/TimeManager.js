// TimeManager.js - Sistema de tiempo/días

class TimeManager {
  constructor() {
    this.currentDay = 1;
    this.maxDays = 60;
    this.events = [];
    this.scheduledEvents = this.initializeScheduledEvents();
  }

  /**
   * Inicializar eventos programados
   * @returns {Array} - Lista de eventos con día programado
   */
  initializeScheduledEvents() {
    return [
      // === FASE INICIAL (Días 1-15): Introducción ===
      // primera_asamblea se trigerea via NPC (Beto), no por día

      // Yani aparece día 5 y se triggerea su primer encuentro
      {
        day: 5,
        type: 'encounter',
        id: 'encuentro_yani',
        triggered: false
      },
      {
        day: 10,
        type: 'encounter',
        id: 'crisis_tormenta',
        triggered: false
      },
      // Marcos - primer encuentro (agua)
      {
        day: 12,
        type: 'encounter',
        id: 'encuentro_marcos_1',
        triggered: false
      },
      {
        day: 15,
        type: 'encounter',
        id: 'segunda_asamblea',
        triggered: false
      },
      // Yani - seguimiento
      {
        day: 18,
        type: 'encounter',
        id: 'yani_seguimiento',
        triggered: false
      },

      // === FASE MEDIA (Días 16-35): Consolidación ===
      {
        day: 20,
        type: 'encounter',
        id: 'crisis_agua',
        triggered: false
      },
      // Marcos - innovación (sistema captación)
      {
        day: 25,
        type: 'encounter',
        id: 'marcos_innovacion',
        triggered: false
      },
      {
        day: 28,
        type: 'encounter',
        id: 'decision_expansion',
        triggered: false
      },
      // Yani - crisis médica
      {
        day: 32,
        type: 'encounter',
        id: 'yani_crisis_medica',
        triggered: false
      },

      // === MINI-DUNGEON (Días 36-40): Sudestada Chica ===
      {
        day: 38,
        type: 'encounter',
        id: 'sudestada_chica_fase1',
        triggered: false
      },
      {
        day: 39,
        type: 'encounter',
        id: 'sudestada_chica_fase2',
        triggered: false
      },
      {
        day: 40,
        type: 'encounter',
        id: 'sudestada_chica_fase3',
        triggered: false
      },
      // Marcos - mantenimiento
      {
        day: 42,
        type: 'encounter',
        id: 'marcos_mantenimiento',
        triggered: false
      },
      // Yani - preparación final
      {
        day: 48,
        type: 'encounter',
        id: 'yani_preparacion_final',
        triggered: false
      },

      // === FASE FINAL (Días 51-60): Crisis Final ===
      {
        day: 55,
        type: 'encounter',
        id: 'crisis_final',
        triggered: false
      },

      // === EVENTOS DE INFRAESTRUCTURA ===
      // Modelo de decay: Event-driven (días específicos) en lugar de pasivo diario
      // Permite control narrativo preciso del deterioro de infraestructura
      {
        day: 5,
        type: 'event',
        id: 'decay_transformador',
        triggered: false,
        effect: () => {
          gameState.infrastructure.transformadorB -= 10;
        }
      },
      {
        day: 12,
        type: 'event',
        id: 'heatwave',
        triggered: false,
        effect: () => {
          gameState.resourceManager.modify('agua', -15);
        }
      },
      {
        day: 22,
        type: 'event',
        id: 'decay_perforacion',
        triggered: false,
        effect: () => {
          gameState.infrastructure.perforacion1 -= 15;
          gameState.resourceManager.modify('agua', -10);
        }
      },
      {
        day: 32,
        type: 'event',
        id: 'decay_transformador_a',
        triggered: false,
        effect: () => {
          gameState.infrastructure.transformadorA -= 10;
          gameState.resourceManager.modify('electricidad', -10);
        }
      },
      {
        day: 45,
        type: 'event',
        id: 'decay_general',
        triggered: false,
        effect: () => {
          gameState.infrastructure.transformadorA -= 5;
          gameState.infrastructure.transformadorB -= 5;
          gameState.infrastructure.perforacion1 -= 5;
        }
      }
    ];
  }

  /**
   * Obtener el día actual
   * @returns {number}
   */
  getCurrentDay() {
    return this.currentDay;
  }

  /**
   * Obtener días restantes
   * @returns {number}
   */
  getDaysRemaining() {
    return this.maxDays - this.currentDay;
  }

  /**
   * Verificar si el juego terminó
   * @returns {boolean}
   */
  isGameOver() {
    return this.currentDay >= this.maxDays;
  }

  /**
   * Avanzar tiempo (días)
   * @param {number} days - Número de días a avanzar
   * @returns {Array} - Eventos que se triggerearon
   */
  advanceDays(days = 1) {
    const triggeredEvents = [];

    for (let i = 0; i < days; i++) {
      if (this.currentDay >= this.maxDays) {
        break;
      }

      this.currentDay++;

      // Chequear eventos programados para este día
      const eventsToday = this.checkEvents();
      triggeredEvents.push(...eventsToday);
    }

    return triggeredEvents;
  }

  /**
   * Chequear si hay eventos programados para el día actual
   * @returns {Array} - Eventos del día actual
   */
  checkEvents() {
    const eventsToday = [];

    for (const event of this.scheduledEvents) {
      if (event.day === this.currentDay && !event.triggered) {
        console.log('=== TIMEMANAGER: Checking event ===');
        console.log('Event:', event.id, 'Type:', event.type);

        // CRÍTICO: Verificar si ya se completó manualmente
        if (event.type === 'encounter') {
          const alreadyCompleted = gameState.completedEncounters?.includes(event.id);

          if (alreadyCompleted) {
            console.log('⚠ Encounter already completed manually, marking as triggered');
            event.triggered = true;
            continue; // No agregar a eventsToday
          }
        }

        console.log('✓ Triggering event:', event.id);
        eventsToday.push(event);
        event.triggered = true;

        // Si el evento tiene un efecto, ejecutarlo
        if (event.effect && typeof event.effect === 'function') {
          event.effect();
        }
      }
    }

    return eventsToday;
  }

  /**
   * Agregar un evento programado
   * @param {number} day - Día en que ocurre el evento
   * @param {string} type - Tipo de evento ('encounter', 'event', etc.)
   * @param {string} id - ID del evento
   * @param {Function} effect - Función opcional a ejecutar
   */
  scheduleEvent(day, type, id, effect = null) {
    this.scheduledEvents.push({
      day: day,
      type: type,
      id: id,
      triggered: false,
      effect: effect
    });

    // Ordenar por día
    this.scheduledEvents.sort((a, b) => a.day - b.day);
  }

  /**
   * Verificar si un evento ya fue triggereado
   * @param {string} eventId - ID del evento
   * @returns {boolean}
   */
  wasEventTriggered(eventId) {
    const event = this.scheduledEvents.find(e => e.id === eventId);
    return event ? event.triggered : false;
  }

  /**
   * Obtener próximos eventos (los siguientes 5 días)
   * @returns {Array}
   */
  getUpcomingEvents() {
    return this.scheduledEvents.filter(event =>
      !event.triggered &&
      event.day > this.currentDay &&
      event.day <= this.currentDay + 5
    );
  }

  /**
   * Obtener porcentaje de progreso del juego
   * @returns {number} - 0-100
   */
  getProgress() {
    return Math.floor((this.currentDay / this.maxDays) * 100);
  }

  /**
   * Resetear al día 1
   */
  reset() {
    this.currentDay = 1;
    this.scheduledEvents = this.initializeScheduledEvents();
  }

  /**
   * Guardar estado como objeto
   * @returns {Object}
   */
  save() {
    return {
      currentDay: this.currentDay,
      maxDays: this.maxDays,
      scheduledEvents: this.scheduledEvents.map(e => ({
        ...e,
        effect: null // No guardar funciones
      }))
    };
  }

  /**
   * Cargar estado desde objeto
   * @param {Object} data
   */
  load(data) {
    this.currentDay = data.currentDay;
    this.maxDays = data.maxDays;

    // Combinar eventos guardados con efectos de la inicialización
    const baseEvents = this.initializeScheduledEvents();
    this.scheduledEvents = data.scheduledEvents.map(savedEvent => {
      const baseEvent = baseEvents.find(e => e.id === savedEvent.id);
      return {
        ...savedEvent,
        effect: baseEvent ? baseEvent.effect : null
      };
    });
  }
}
