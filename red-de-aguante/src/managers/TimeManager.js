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
      {
        day: 3,
        type: 'encounter',
        id: 'primera_asamblea',
        triggered: false
      },
      {
        day: 10,
        type: 'encounter',
        id: 'crisis_tormenta',
        triggered: false
      },
      {
        day: 15,
        type: 'encounter',
        id: 'segunda_asamblea',
        triggered: false
      },
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
