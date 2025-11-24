// ObjectPool.js - Sistema de pooling de objetos para reutilización

class ObjectPool {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.pools = new Map();
    this.config = {
      defaultSize: config.defaultSize || 10,
      maxSize: config.maxSize || 50,
      autoExpand: config.autoExpand !== false
    };
  }

  // ═══════════════════════════════════════════
  // CREAR POOL
  // ═══════════════════════════════════════════

  createPool(key, createFunc, resetFunc = null, initialSize = null) {
    const size = initialSize || this.config.defaultSize;

    const pool = {
      key: key,
      createFunc: createFunc,
      resetFunc: resetFunc,
      objects: [],
      activeCount: 0,
      totalCreated: 0
    };

    // Pre-crear objetos
    for (let i = 0; i < size; i++) {
      const obj = this.createPoolObject(pool);
      obj.setActive(false);
      obj.setVisible(false);
      pool.objects.push(obj);
      pool.totalCreated++;
    }

    this.pools.set(key, pool);

    console.log(`🏊 Pool '${key}' created with ${size} objects`);

    return pool;
  }

  createPoolObject(pool) {
    const obj = pool.createFunc();
    obj._poolKey = pool.key;
    return obj;
  }

  // ═══════════════════════════════════════════
  // OBTENER OBJETO
  // ═══════════════════════════════════════════

  get(key) {
    const pool = this.pools.get(key);

    if (!pool) {
      console.warn(`Pool '${key}' not found`);
      return null;
    }

    // Buscar objeto inactivo
    let obj = pool.objects.find(o => !o.active);

    // Si no hay disponibles, expandir pool
    if (!obj) {
      if (this.config.autoExpand && pool.totalCreated < this.config.maxSize) {
        obj = this.createPoolObject(pool);
        pool.objects.push(obj);
        pool.totalCreated++;
        console.log(`🏊 Pool '${key}' expanded to ${pool.totalCreated} objects`);
      } else {
        console.warn(`Pool '${key}' exhausted (max: ${this.config.maxSize})`);
        return null;
      }
    }

    // Activar objeto
    obj.setActive(true);
    obj.setVisible(true);
    pool.activeCount++;

    // Reset si hay función
    if (pool.resetFunc) {
      pool.resetFunc(obj);
    }

    return obj;
  }

  // ═══════════════════════════════════════════
  // DEVOLVER OBJETO
  // ═══════════════════════════════════════════

  release(obj) {
    if (!obj || !obj._poolKey) {
      console.warn('Object is not from a pool');
      return;
    }

    const pool = this.pools.get(obj._poolKey);

    if (!pool) {
      console.warn(`Pool '${obj._poolKey}' not found`);
      return;
    }

    // Desactivar objeto
    obj.setActive(false);
    obj.setVisible(false);
    pool.activeCount--;

    // Resetear posición/estado
    if (obj.setPosition) obj.setPosition(-1000, -1000);
    if (obj.setAlpha) obj.setAlpha(1);
    if (obj.setScale) obj.setScale(1);
  }

  // ═══════════════════════════════════════════
  // RELEASE ALL
  // ═══════════════════════════════════════════

  releaseAll(key) {
    const pool = this.pools.get(key);

    if (!pool) return;

    pool.objects.forEach(obj => {
      if (obj.active) {
        this.release(obj);
      }
    });
  }

  // ═══════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════

  getStats(key) {
    const pool = this.pools.get(key);

    if (!pool) return null;

    return {
      key: key,
      total: pool.totalCreated,
      active: pool.activeCount,
      available: pool.totalCreated - pool.activeCount
    };
  }

  getAllStats() {
    const stats = {};

    this.pools.forEach((pool, key) => {
      stats[key] = this.getStats(key);
    });

    return stats;
  }

  // ═══════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════

  destroyPool(key) {
    const pool = this.pools.get(key);

    if (!pool) return;

    pool.objects.forEach(obj => {
      if (obj.destroy) obj.destroy();
    });

    this.pools.delete(key);

    console.log(`🏊 Pool '${key}' destroyed`);
  }

  destroyAll() {
    this.pools.forEach((pool, key) => {
      this.destroyPool(key);
    });

    this.pools.clear();
  }
}

if (typeof window !== 'undefined') {
  window.ObjectPool = ObjectPool;
}
