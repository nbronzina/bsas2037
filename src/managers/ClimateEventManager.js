/**
 * ClimateEventManager - Sistema de eventos climáticos y crisis externas
 *
 * Gestiona eventos cargados desde JSON (climate_events.json) con tres tipos:
 * - SCHEDULED: Ocurren en días específicos
 * - CONDITIONAL: Se activan cuando se cumplen condiciones
 * - RANDOM: Tienen probabilidad de ocurrir en ciertos días
 *
 * Los eventos se inyectan como documentos en la bandeja de entrada del día.
 */

class ClimateEventManager {
  constructor(scene) {
    this.scene = scene;
    this.events = [];
    this.processedEvents = []; // IDs de eventos ya procesados
    this.eventFlags = {}; // Flags seteados por eventos
    this.isLoaded = false;

    this.loadEvents();
  }

  /**
   * Carga los eventos desde el archivo JSON
   */
  async loadEvents() {
    try {
      const response = await fetch('data/climate_events.json');
      const data = await response.json();
      this.events = data.events;
      this.isLoaded = true;
      console.log('🌪️ Loaded', this.events.length, 'climate events');
    } catch (error) {
      console.error('❌ Failed to load climate events:', error);
      this.events = [];
      this.isLoaded = true; // Marcar como cargado para no bloquear
    }
  }

  /**
   * Verifica y retorna eventos que deben ocurrir en el día actual
   * @returns {Array} Lista de eventos elegibles para hoy
   */
  checkDayEvents() {
    if (!this.isLoaded || !window.gameState) {
      return [];
    }

    const currentDay = window.gameState.currentDay;
    const eligible = [];

    this.events.forEach(event => {
      // Ya procesado?
      if (this.processedEvents.includes(event.id)) return;

      // SCHEDULED: Eventos en días específicos
      if (event.type === 'scheduled' && event.day === currentDay) {
        eligible.push(event);
        return;
      }

      // CONDITIONAL: Eventos que se activan por condiciones
      if (event.type === 'conditional') {
        if (this.checkCondition(event.condition)) {
          eligible.push(event);
        }
        return;
      }

      // RANDOM: Eventos con probabilidad de ocurrir
      if (event.type === 'random') {
        if (event.days && event.days.includes(currentDay)) {
          const chance = event.chance || 0.2;
          if (Math.random() < chance) {
            eligible.push(event);
          }
        }
      }
    });

    // Limitar a máximo 2 eventos por día para no saturar
    return eligible.slice(0, 2);
  }

  /**
   * Evalúa si una condición se cumple
   * @param {string} condition - Condición a evaluar (ej: "electricidad < 20" o "flag:compartir_excedente")
   * @returns {boolean}
   */
  checkCondition(condition) {
    if (!condition || !window.gameState) return false;

    // Condiciones de flags
    if (condition.includes('flag:')) {
      const flagName = condition.split('flag:')[1].trim();
      return this.eventFlags[flagName] === true;
    }

    // Condiciones compuestas con &&
    if (condition.includes('&&')) {
      const parts = condition.split('&&').map(p => p.trim());
      return parts.every(part => this.checkCondition(part));
    }

    // Condiciones de día
    if (condition.includes('day')) {
      const match = condition.match(/day\s*([<>=]+)\s*(\d+)/);
      if (match) {
        const [, operator, value] = match;
        const currentDay = window.gameState.currentDay;
        return this.evaluateOperator(currentDay, operator, parseInt(value));
      }
    }

    // Condiciones de recursos (electricidad, agua, legitimidad, autonomia)
    const match = condition.match(/(\w+)\s*([<>=]+)\s*(\d+)/);
    if (match) {
      const [, resource, operator, value] = match;
      let currentValue;

      // Buscar el valor actual del recurso
      if (window.gameState.resources && window.gameState.resources[resource] !== undefined) {
        currentValue = window.gameState.resources[resource];
      } else {
        console.warn('⚠️ Resource not found:', resource);
        return false;
      }

      return this.evaluateOperator(currentValue, operator, parseInt(value));
    }

    console.warn('⚠️ Unknown condition format:', condition);
    return false;
  }

  /**
   * Evalúa un operador de comparación
   */
  evaluateOperator(current, operator, target) {
    switch(operator) {
      case '<': return current < target;
      case '>': return current > target;
      case '<=': return current <= target;
      case '>=': return current >= target;
      case '==': return current == target;
      case '!=': return current != target;
      default: return false;
    }
  }

  /**
   * Marca un evento como procesado
   */
  markAsProcessed(eventId) {
    if (!this.processedEvents.includes(eventId)) {
      this.processedEvents.push(eventId);
      console.log('✅ Event marked as processed:', eventId);
    }
  }

  /**
   * Setea un flag desde un evento
   */
  setFlag(flagName) {
    if (flagName) {
      this.eventFlags[flagName] = true;
      console.log('🏁 Flag set:', flagName);
    }
  }

  /**
   * Convierte un evento en documento para la bandeja de entrada
   * @param {Object} event - El evento a convertir
   * @returns {Object} Documento formateado
   */
  eventToDocument(event) {
    return {
      id: event.id,
      day: window.gameState.currentDay,
      sender: event.sender || 'system',
      type: 'crisis', // Tipo de documento (para el icono)
      title: event.title,
      content: event.description,
      options: event.options,
      isEvent: true, // Flag especial para identificar eventos climáticos
      eventType: event.type // scheduled/conditional/random para debug
    };
  }

  /**
   * Inyecta un evento como documento en la bandeja de entrada del día
   */
  injectEventAsDocument(event) {
    if (!window.gameState || !window.gameState.documentsToday) {
      console.warn('⚠️ Cannot inject event: gameState not ready');
      return;
    }

    const doc = this.eventToDocument(event);

    // Inyectar al principio de los documentos del día
    window.gameState.documentsToday.unshift(doc);

    // Marcar como procesado para que no vuelva a aparecer
    this.markAsProcessed(event.id);

    console.log('⚡ Event injected as document:', event.id, `(${event.type})`);
  }

  /**
   * Procesa la elección de un evento y aplica consecuencias
   */
  processEventChoice(eventId, optionId) {
    // Buscar el evento original
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      console.warn('⚠️ Event not found:', eventId);
      return;
    }

    // Buscar la opción elegida
    const option = event.options.find(opt => opt.id === optionId);
    if (!option) {
      console.warn('⚠️ Option not found:', optionId, 'in event', eventId);
      return;
    }

    // Aplicar consecuencias
    if (option.consequences) {
      this.applyConsequences(option.consequences);
    }

    // Setear flag si existe
    if (option.setsFlag) {
      this.setFlag(option.setsFlag);
    }

    console.log('🎯 Event choice processed:', eventId, '→', optionId);
  }

  /**
   * Aplica las consecuencias de una elección a los recursos
   */
  applyConsequences(consequences) {
    if (!window.gameState || !window.gameState.resources) return;

    Object.keys(consequences).forEach(resource => {
      if (window.gameState.resources[resource] !== undefined) {
        const change = consequences[resource];
        window.gameState.resources[resource] += change;

        // Clamp entre 0 y 100
        window.gameState.resources[resource] = Math.max(0,
          Math.min(100, window.gameState.resources[resource]));

        console.log(`📊 Resource ${resource}: ${change > 0 ? '+' : ''}${change} → ${window.gameState.resources[resource]}`);
      }
    });
  }

  /**
   * Obtiene el estado serializable para guardar
   */
  getSaveData() {
    return {
      processedEvents: this.processedEvents,
      eventFlags: this.eventFlags
    };
  }

  /**
   * Restaura el estado desde un save
   */
  loadSaveData(data) {
    if (data.processedEvents) {
      this.processedEvents = data.processedEvents;
      console.log('💾 Loaded', this.processedEvents.length, 'processed events');
    }
    if (data.eventFlags) {
      this.eventFlags = data.eventFlags;
      console.log('💾 Loaded', Object.keys(this.eventFlags).length, 'event flags');
    }
  }

  /**
   * Resetea el manager (para nuevo juego)
   */
  reset() {
    this.processedEvents = [];
    this.eventFlags = {};
    console.log('🔄 ClimateEventManager reset');
  }
}

// Export para ES6 modules (si se usa)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClimateEventManager;
}
