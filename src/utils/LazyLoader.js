// LazyLoader.js - Carga lazy de assets bajo demanda

class LazyLoader {
  constructor(scene) {
    this.scene = scene;
    this.loadedAssets = new Set();
    this.loadingPromises = new Map();
  }

  // ═══════════════════════════════════════════
  // CHECK IF LOADED
  // ═══════════════════════════════════════════

  isLoaded(key, type = 'image') {
    switch (type) {
      case 'image':
        return this.scene.textures.exists(key);
      case 'audio':
        return this.scene.cache.audio.exists(key);
      case 'json':
        return this.scene.cache.json.exists(key);
      default:
        return this.loadedAssets.has(`${type}:${key}`);
    }
  }

  // ═══════════════════════════════════════════
  // LOAD ON DEMAND
  // ═══════════════════════════════════════════

  async loadImage(key, url) {
    if (this.isLoaded(key, 'image')) {
      return Promise.resolve();
    }

    // Check if already loading
    const loadingKey = `image:${key}`;
    if (this.loadingPromises.has(loadingKey)) {
      return this.loadingPromises.get(loadingKey);
    }

    const promise = new Promise((resolve, reject) => {
      this.scene.load.image(key, url);

      this.scene.load.once('complete', () => {
        this.loadedAssets.add(loadingKey);
        this.loadingPromises.delete(loadingKey);
        resolve();
      });

      this.scene.load.once('loaderror', (file) => {
        this.loadingPromises.delete(loadingKey);
        reject(new Error(`Failed to load image: ${key}`));
      });

      this.scene.load.start();
    });

    this.loadingPromises.set(loadingKey, promise);
    return promise;
  }

  async loadAudio(key, url) {
    if (this.isLoaded(key, 'audio')) {
      return Promise.resolve();
    }

    const loadingKey = `audio:${key}`;
    if (this.loadingPromises.has(loadingKey)) {
      return this.loadingPromises.get(loadingKey);
    }

    const promise = new Promise((resolve, reject) => {
      this.scene.load.audio(key, url);

      this.scene.load.once('complete', () => {
        this.loadedAssets.add(loadingKey);
        this.loadingPromises.delete(loadingKey);
        resolve();
      });

      this.scene.load.once('loaderror', () => {
        this.loadingPromises.delete(loadingKey);
        reject(new Error(`Failed to load audio: ${key}`));
      });

      this.scene.load.start();
    });

    this.loadingPromises.set(loadingKey, promise);
    return promise;
  }

  async loadJSON(key, url) {
    if (this.isLoaded(key, 'json')) {
      return Promise.resolve(this.scene.cache.json.get(key));
    }

    const loadingKey = `json:${key}`;
    if (this.loadingPromises.has(loadingKey)) {
      return this.loadingPromises.get(loadingKey);
    }

    const promise = new Promise((resolve, reject) => {
      this.scene.load.json(key, url);

      this.scene.load.once('complete', () => {
        this.loadedAssets.add(loadingKey);
        this.loadingPromises.delete(loadingKey);
        resolve(this.scene.cache.json.get(key));
      });

      this.scene.load.once('loaderror', () => {
        this.loadingPromises.delete(loadingKey);
        reject(new Error(`Failed to load JSON: ${key}`));
      });

      this.scene.load.start();
    });

    this.loadingPromises.set(loadingKey, promise);
    return promise;
  }

  // ═══════════════════════════════════════════
  // BATCH LOAD
  // ═══════════════════════════════════════════

  async loadBatch(assets) {
    const promises = assets.map(asset => {
      switch (asset.type) {
        case 'image':
          return this.loadImage(asset.key, asset.url);
        case 'audio':
          return this.loadAudio(asset.key, asset.url);
        case 'json':
          return this.loadJSON(asset.key, asset.url);
        default:
          return Promise.resolve();
      }
    });

    return Promise.all(promises);
  }

  // ═══════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════

  getStats() {
    return {
      loadedCount: this.loadedAssets.size,
      pendingCount: this.loadingPromises.size,
      loadedAssets: Array.from(this.loadedAssets)
    };
  }
}

if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
}
