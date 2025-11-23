// SaveManager.js - Sistema de guardado con localStorage

class SaveManager {
  constructor() {
    this.saveKey = 'red_de_aguante_save';
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 60000; // 1 minuto
  }

  /**
   * Guardar el estado completo del juego
   * @returns {boolean} - True si se guardó correctamente
   */
  save() {
    try {
      const saveData = {
        version: '1.0',
        timestamp: Date.now(),

        // Recursos
        resources: {
          creditos: gameState.resourceManager.get('creditos'),
          electricidad: gameState.resourceManager.get('electricidad'),
          agua: gameState.resourceManager.get('agua'),
          legitimidad: gameState.resourceManager.get('legitimidad'),
          autonomia: gameState.resourceManager.get('autonomia')
        },

        // Tiempo
        time: {
          currentDay: gameState.timeManager.getCurrentDay(),
          scheduledEvents: gameState.timeManager.scheduledEvents.map(e => ({
            day: e.day,
            type: e.type,
            id: e.id,
            triggered: e.triggered
          }))
        },

        // Flags y estado
        flags: gameState.flags,
        completedEncounters: gameState.completedEncounters,

        // Personajes
        characters: JSON.parse(JSON.stringify(gameState.characters)),

        // Infraestructura
        infrastructure: JSON.parse(JSON.stringify(gameState.infrastructure))
      };

      // Guardar en localStorage
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));

      console.log('Juego guardado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      return false;
    }
  }

  /**
   * Cargar el estado del juego
   * @returns {boolean} - True si se cargó correctamente
   */
  load() {
    try {
      const savedData = localStorage.getItem(this.saveKey);

      if (!savedData) {
        console.log('No hay partida guardada');
        return false;
      }

      const saveData = JSON.parse(savedData);

      // Validar versión
      if (saveData.version !== '1.0') {
        console.warn('Versión de guardado incompatible');
        return false;
      }

      // Cargar recursos
      if (saveData.resources) {
        for (const [key, value] of Object.entries(saveData.resources)) {
          gameState.resourceManager.set(key, value);
        }
      }

      // Cargar tiempo
      if (saveData.time) {
        gameState.timeManager.currentDay = saveData.time.currentDay;

        // Reconstruir eventos programados
        const baseEvents = gameState.timeManager.initializeScheduledEvents();
        gameState.timeManager.scheduledEvents = saveData.time.scheduledEvents.map(savedEvent => {
          const baseEvent = baseEvents.find(e => e.id === savedEvent.id);
          return {
            ...savedEvent,
            effect: baseEvent ? baseEvent.effect : null
          };
        });
      }

      // Cargar flags
      if (saveData.flags) {
        gameState.flags = saveData.flags;
      }

      // Cargar completedEncounters
      if (saveData.completedEncounters) {
        gameState.completedEncounters = saveData.completedEncounters;
      }

      // Cargar personajes
      if (saveData.characters) {
        gameState.characters = saveData.characters;
      }

      // Cargar infraestructura
      if (saveData.infrastructure) {
        gameState.infrastructure = saveData.infrastructure;
      }

      console.log('Partida cargada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al cargar:', error);
      return false;
    }
  }

  /**
   * Verificar si existe una partida guardada
   * @returns {boolean}
   */
  hasSavedGame() {
    return localStorage.getItem(this.saveKey) !== null;
  }

  /**
   * Obtener información del guardado sin cargarlo
   * @returns {Object|null}
   */
  getSaveInfo() {
    try {
      const savedData = localStorage.getItem(this.saveKey);

      if (!savedData) {
        return null;
      }

      const saveData = JSON.parse(savedData);

      return {
        day: saveData.time?.currentDay || 1,
        timestamp: saveData.timestamp,
        date: new Date(saveData.timestamp).toLocaleString('es-AR')
      };
    } catch (error) {
      console.error('Error al leer info de guardado:', error);
      return null;
    }
  }

  /**
   * Borrar la partida guardada
   * @returns {boolean}
   */
  deleteSave() {
    try {
      localStorage.removeItem(this.saveKey);
      console.log('Partida borrada');
      return true;
    } catch (error) {
      console.error('Error al borrar partida:', error);
      return false;
    }
  }

  /**
   * Activar/desactivar autoguardado
   * @param {boolean} enabled
   */
  setAutoSave(enabled) {
    this.autoSaveEnabled = enabled;

    if (enabled && !this.autoSaveTimer) {
      this.startAutoSave();
    } else if (!enabled && this.autoSaveTimer) {
      this.stopAutoSave();
    }
  }

  /**
   * Iniciar autoguardado
   */
  startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.autoSaveEnabled) {
        this.save();
        console.log('Autoguardado realizado');
      }
    }, this.autoSaveInterval);
  }

  /**
   * Detener autoguardado
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
