// TutorialManager.js - Sistema de tutoriales graduales e interactivos

class TutorialManager {
  constructor(scene) {
    this.scene = scene;
    this.currentTutorial = null;
    this.queue = [];
  }

  // Check si tutorial está activo
  isTutorialActive() {
    return !gameState.tutorialFlags.tutorial_skipped;
  }

  // Check si step específico ya se vio
  hasSeenStep(stepFlag) {
    return gameState.tutorialFlags[stepFlag] === true;
  }

  // Mostrar tutorial si no se ha visto
  showIfNotSeen(stepFlag, tutorialData) {
    if (!this.isTutorialActive()) return false;
    if (this.hasSeenStep(stepFlag)) return false;

    this.show(stepFlag, tutorialData);
    return true;
  }

  // Mostrar tutorial
  show(stepFlag, tutorialData) {
    if (this.currentTutorial) {
      // Ya hay tutorial activo, encolar
      this.queue.push({ stepFlag, tutorialData });
      return;
    }

    this.currentTutorial = {
      stepFlag,
      data: tutorialData
    };

    // Pausar juego
    this.scene.scene.pause();

    // Lanzar TutorialScene
    this.scene.scene.launch('TutorialScene', {
      stepFlag,
      tutorialData,
      onComplete: () => this.onTutorialComplete(stepFlag)
    });
  }

  onTutorialComplete(stepFlag) {
    // Marcar como visto
    gameState.tutorialFlags[stepFlag] = true;

    this.currentTutorial = null;

    // Reanudar juego
    this.scene.scene.resume();

    // Mostrar siguiente en cola si hay
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.show(next.stepFlag, next.tutorialData);
    }
  }

  // Skip tutorial completo
  skipAll() {
    gameState.tutorialFlags.tutorial_skipped = true;

    if (this.currentTutorial) {
      this.scene.scene.stop('TutorialScene');
      this.scene.scene.resume();
      this.currentTutorial = null;
    }

    this.queue = [];
  }

  // Mostrar tooltip
  showTooltip(element, text, position = 'top') {
    // Crear tooltip flotante
    const tooltip = new Tooltip(this.scene, element, text, position);
    return tooltip;
  }
}

if (typeof window !== 'undefined') {
  window.TutorialManager = TutorialManager;
}
