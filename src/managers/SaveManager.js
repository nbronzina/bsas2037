/**
 * SaveManager - Sistema de guardado/carga (Versión Escritorio)
 * Simplificado para 7 días y documentos
 */

class SaveManager {
  constructor() {
    this.SAVE_KEY = 'redDeAguante_v2_save';
    this.SETTINGS_KEY = 'redDeAguante_v2_settings';
    this.autoSaveInterval = null;
  }

  // ═══════════════════════════════════════════
  // GUARDAR PARTIDA
  // ═══════════════════════════════════════════

  save() {
    try {
      const saveData = {
        version: 2,
        timestamp: Date.now(),

        // Estado del juego
        currentDay: gameState.currentDay,
        resources: { ...gameState.resources },
        creditos: gameState.creditos,

        // Progreso
        completedDocuments: [...gameState.completedDocuments],
        flags: { ...gameState.flags },

        // Documentos del día actual (por si guarda a mitad de día)
        documentsToday: gameState.documentsToday.map(d => d.id),
        currentDocumentIndex: gameState.currentDocumentIndex
      };

      const serialized = JSON.stringify(saveData);

      // Intentar guardar con manejo específico de QuotaExceededError
      try {
        localStorage.setItem(this.SAVE_KEY, serialized);
        console.log('💾 Partida guardada');
        return true;
      } catch (e) {
        // Manejar localStorage lleno
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.warn('⚠️ localStorage lleno, limpiando datos antiguos...');
          this.clearOldData();

          // Reintentar una vez después de limpiar
          try {
            localStorage.setItem(this.SAVE_KEY, serialized);
            console.log('💾 Partida guardada (después de limpiar)');
            return true;
          } catch (e2) {
            console.error('❌ No se pudo guardar, localStorage lleno incluso después de limpiar');
            return false;
          }
        }
        // Re-lanzar otros errores
        throw e;
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // LIMPIAR DATOS ANTIGUOS
  // ═══════════════════════════════════════════

  clearOldData() {
    // Limpiar versiones antiguas de save si existen
    const oldKeys = [
      'redDeAguante_v1_save',
      'redDeAguante_v1_settings',
      'redDeAguante_old',
      'redDeAguante_backup'
    ];

    oldKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`🧹 Limpiado: ${key}`);
      } catch (e) {
        // Ignorar errores al limpiar
      }
    });
  }

  // ═══════════════════════════════════════════
  // CARGAR PARTIDA
  // ═══════════════════════════════════════════

  // CORREGIDO: Manejo robusto de JSON corrupto
  load() {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return false;

      // CORREGIDO: Parsear JSON con manejo específico de errores
      let data;
      try {
        data = JSON.parse(saved);
      } catch (parseError) {
        console.error('❌ Save corrupto (JSON inválido), eliminando:', parseError);
        this.deleteSave();
        return false;
      }

      // Verificar versión
      if (data.version !== 2) {
        console.warn('⚠️ Save de versión anterior, eliminando');
        this.deleteSave();
        return false;
      }

      // CORREGIDO: Validar estructura básica del save
      if (!data.resources || typeof data.currentDay !== 'number') {
        console.error('❌ Save incompleto o corrupto, eliminando');
        this.deleteSave();
        return false;
      }

      // Restaurar estado - CORREGIDO: usar setCurrentDay para validación
      if (gameState.setCurrentDay) {
        gameState.setCurrentDay(data.currentDay || 1);
      } else {
        gameState.currentDay = data.currentDay || 1;
      }
      gameState.resources = data.resources || {
        electricidad: 60,
        agua: 60,
        legitimidad: 60,
        autonomia: 60
      };
      gameState.creditos = data.creditos ?? 100;
      gameState.completedDocuments = data.completedDocuments || [];
      gameState.flags = data.flags || {};

      // Restaurar documentos del día
      if (data.documentsToday && data.documentsToday.length > 0) {
        gameState.documentsToday = data.documentsToday
          .map(id => gameState.documentManager.getDocumentById(id))
          .filter(d => d !== null);
        gameState.currentDocumentIndex = data.currentDocumentIndex || 0;
      }

      console.log('📂 Partida cargada - Día', gameState.currentDay);
      return true;
    } catch (error) {
      console.error('❌ Error inesperado al cargar:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // VERIFICAR SI HAY SAVE
  // ═══════════════════════════════════════════

  hasSave() {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return false;

      const data = JSON.parse(saved);
      return data.version === 2;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // OBTENER INFO DEL SAVE (para mostrar)
  // ═══════════════════════════════════════════

  getSaveInfo() {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);

      return {
        day: data.currentDay,
        dayName: gameState.dayNames[data.currentDay - 1],
        timestamp: data.timestamp,
        timeAgo: this.getTimeAgo(data.timestamp),
        resources: data.resources
      };
    } catch {
      return null;
    }
  }

  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  }

  // ═══════════════════════════════════════════
  // BORRAR SAVE
  // ═══════════════════════════════════════════

  deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
    console.log('🗑️ Save eliminado');
  }

  // ═══════════════════════════════════════════
  // SETTINGS (volumen, etc)
  // ═══════════════════════════════════════════

  saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (!saved) return this.getDefaultSettings();
      return JSON.parse(saved);
    } catch {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      textSpeed: 'normal'
    };
  }

  // ═══════════════════════════════════════════
  // AUTO-SAVE
  // ═══════════════════════════════════════════

  enableAutoSave(intervalMs = 30000) {
    this.autoSaveInterval = setInterval(() => {
      if (gameState.currentDay > 0) {
        this.save();
      }
    }, intervalMs);
    console.log('🔄 Auto-save activado');
  }

  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('🔄 Auto-save desactivado');
    }
  }
}

if (typeof window !== 'undefined') {
  window.SaveManager = SaveManager;
}
