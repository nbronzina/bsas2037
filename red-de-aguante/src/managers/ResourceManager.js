// ResourceManager.js - Gestión de recursos

class ResourceManager {
  constructor() {
    // Inicializar recursos con valores por defecto
    this.resources = {
      creditos: 2000,
      electricidad: 70,
      agua: 65,
      legitimidad: 75,
      autonomia: 80
    };

    // Límites de recursos
    this.limits = {
      creditos: { min: 0, max: 10000 },
      electricidad: { min: 0, max: 100 },
      agua: { min: 0, max: 100 },
      legitimidad: { min: 0, max: 100 },
      autonomia: { min: 0, max: 100 }
    };
  }

  /**
   * Obtener el valor de un recurso
   * @param {string} resource - Nombre del recurso
   * @returns {number} - Valor actual del recurso
   */
  get(resource) {
    if (!this.resources.hasOwnProperty(resource)) {
      console.error(`Recurso no existe: ${resource}`);
      return 0;
    }
    return this.resources[resource];
  }

  /**
   * Modificar un recurso (sumar o restar)
   * @param {string} resource - Nombre del recurso
   * @param {number} amount - Cantidad a modificar (positivo o negativo)
   * @returns {boolean} - True si se pudo modificar, false si no había suficientes
   */
  modify(resource, amount) {
    if (!this.resources.hasOwnProperty(resource)) {
      console.error(`Recurso no existe: ${resource}`);
      return false;
    }

    const newValue = this.resources[resource] + amount;
    const limit = this.limits[resource];

    // Clampear valor entre min y max
    this.resources[resource] = clamp(newValue, limit.min, limit.max);

    return true;
  }

  /**
   * Establecer un valor directo a un recurso
   * @param {string} resource - Nombre del recurso
   * @param {number} value - Nuevo valor
   */
  set(resource, value) {
    if (!this.resources.hasOwnProperty(resource)) {
      console.error(`Recurso no existe: ${resource}`);
      return;
    }

    const limit = this.limits[resource];
    this.resources[resource] = clamp(value, limit.min, limit.max);
  }

  /**
   * Verificar si se puede pagar un costo
   * @param {Object} cost - Objeto con costos {creditos: 100, electricidad: 10, etc}
   * @returns {boolean} - True si se puede pagar
   */
  canAfford(cost) {
    for (const [resource, amount] of Object.entries(cost)) {
      if (this.resources[resource] < amount) {
        return false;
      }
    }
    return true;
  }

  /**
   * Pagar un costo (restar múltiples recursos)
   * @param {Object} cost - Objeto con costos {creditos: 100, electricidad: 10, etc}
   * @returns {boolean} - True si se pudo pagar
   */
  pay(cost) {
    if (!this.canAfford(cost)) {
      return false;
    }

    for (const [resource, amount] of Object.entries(cost)) {
      this.modify(resource, -amount);
    }

    return true;
  }

  /**
   * Aplicar cambios (puede ser positivo o negativo)
   * @param {Object} changes - Objeto con cambios {creditos: -100, electricidad: 10, etc}
   */
  applyChanges(changes) {
    for (const [resource, amount] of Object.entries(changes)) {
      this.modify(resource, amount);
    }
  }

  /**
   * Obtener todos los recursos como objeto
   * @returns {Object} - Copia de los recursos actuales
   */
  getAll() {
    return { ...this.resources };
  }

  /**
   * Verificar si algún recurso crítico está muy bajo
   * @returns {Object} - {critical: boolean, warnings: []}
   */
  checkCriticalLevels() {
    const warnings = [];

    if (this.resources.electricidad < 30) {
      warnings.push('¡Electricidad crítica!');
    }
    if (this.resources.agua < 30) {
      warnings.push('¡Agua crítica!');
    }
    if (this.resources.legitimidad < 20) {
      warnings.push('¡Legitimidad muy baja!');
    }

    return {
      critical: warnings.length > 0,
      warnings
    };
  }

  /**
   * Resetear recursos a valores iniciales
   */
  reset() {
    this.resources = {
      creditos: 2000,
      electricidad: 70,
      agua: 65,
      legitimidad: 75,
      autonomia: 80
    };
  }
}
