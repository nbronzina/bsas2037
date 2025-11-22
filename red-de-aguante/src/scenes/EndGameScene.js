// EndGameScene.js - Pantalla de fin de juego (victoria/derrota)

class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndGameScene' });
    this.isVictory = false;
    this.victoryType = null;
    this.finalStats = null;
  }

  init(data) {
    // Determinar si es victoria o derrota
    this.isVictory = data.victory || false;
    this.victoryType = data.victoryType || null;
    this.defeatReason = data.defeatReason || null;

    // Guardar stats finales
    this.finalStats = {
      day: gameState.timeManager.getCurrentDay(),
      creditos: gameState.resourceManager.get('creditos'),
      electricidad: gameState.resourceManager.get('electricidad'),
      agua: gameState.resourceManager.get('agua'),
      legitimidad: gameState.resourceManager.get('legitimidad'),
      autonomia: gameState.resourceManager.get('autonomia')
    };
  }

  create() {
    // Fondo
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      hexToNumber(COLORS.fondo),
      1
    ).setOrigin(0, 0);

    if (this.isVictory) {
      this.createVictoryScreen();
    } else {
      this.createDefeatScreen();
    }

    // Stats finales
    this.createStatsPanel();

    // Botón de reinicio
    this.createRestartButton();
  }

  createVictoryScreen() {
    // Título
    const title = this.add.text(
      GAME_CONFIG.width / 2,
      80,
      '¡VICTORIA!',
      {
        fontSize: '48px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Subtítulo según tipo de victoria
    let victoryMessage = '';

    if (gameState.flags.includes('victoria_autonomia')) {
      victoryMessage = 'RED AUTÓNOMA CONSOLIDADA\n\nVilla Soldati resistió la Gran Sudestada con luz propia.\nFuiste el único barrio con energía durante el apagón masivo.';
    } else if (gameState.flags.includes('victoria_colectiva')) {
      victoryMessage = 'RED COOPERATIVA TERRITORIAL\n\n8 cooperativas sobrevivieron juntas a la crisis.\nLa organización popular demostró su poder.';
    } else if (gameState.flags.includes('red_cooperativas')) {
      victoryMessage = 'RECONSTRUCCIÓN SOLIDARIA\n\nLograste reconstruir la red con ayuda de cooperativas vecinas.\nEl territorio está más fuerte que antes.';
    } else {
      victoryMessage = 'SUPERVIVENCIA Y AUTONOMÍA\n\nLlegaste al día 60 manteniendo la red funcionando.\nVilla Soldati sobrevivió la temporada de sudestadas.';
    }

    const subtitle = this.add.text(
      GAME_CONFIG.width / 2,
      180,
      victoryMessage,
      {
        fontSize: '16px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5);

    // Evaluación de logros
    const achievements = this.evaluateAchievements();
    const achievementText = this.add.text(
      GAME_CONFIG.width / 2,
      320,
      'LOGROS:\n\n' + achievements.join('\n'),
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5);
  }

  createDefeatScreen() {
    // Título
    const title = this.add.text(
      GAME_CONFIG.width / 2,
      80,
      'DERROTA',
      {
        fontSize: '48px',
        color: COLORS.emergencia,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Mensaje de derrota
    let defeatMessage = '';

    if (this.defeatReason === 'electricidad') {
      defeatMessage = 'COLAPSO ENERGÉTICO\n\nLa red eléctrica colapsó completamente.\nEl barrio quedó a oscuras y la gente perdió la confianza.';
    } else if (this.defeatReason === 'agua') {
      defeatMessage = 'CRISIS HÍDRICA\n\nSe acabó el agua potable.\nLas familias tuvieron que evacuar el barrio.';
    } else if (this.defeatReason === 'legitimidad') {
      defeatMessage = 'PÉRDIDA DE LEGITIMIDAD\n\nLa gente dejó de confiar en tu gestión.\nLa cooperativa se disolvió por falta de apoyo popular.';
    } else {
      defeatMessage = 'RECURSOS CRÍTICOS\n\nLos recursos cayeron por debajo del mínimo viable.\nLa infraestructura no pudo sostenerse.';
    }

    const subtitle = this.add.text(
      GAME_CONFIG.width / 2,
      180,
      defeatMessage,
      {
        fontSize: '16px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5);

    // Mensaje motivacional
    const motivationalText = this.add.text(
      GAME_CONFIG.width / 2,
      280,
      'Día alcanzado: ' + this.finalStats.day + ' / 60\n\nLa organización popular es un proceso de aprendizaje.\nIntentá de nuevo con una estrategia diferente.',
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5);
  }

  createStatsPanel() {
    const panelY = 380;
    const panelHeight = 140;

    // Fondo
    const bg = this.add.rectangle(
      GAME_CONFIG.width / 2,
      panelY,
      500,
      panelHeight,
      hexToNumber(COLORS.panel),
      0.9
    ).setOrigin(0.5, 0);

    const border = this.add.rectangle(
      GAME_CONFIG.width / 2,
      panelY,
      500,
      panelHeight
    ).setOrigin(0.5, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;

    // Título
    const title = this.add.text(
      GAME_CONFIG.width / 2,
      panelY + 10,
      'ESTADÍSTICAS FINALES',
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);

    // Stats
    const statsText = [
      `${RESOURCE_ICONS.creditos} Créditos: ${formatNumber(this.finalStats.creditos)}`,
      `${RESOURCE_ICONS.electricidad} Electricidad: ${this.finalStats.electricidad}%`,
      `${RESOURCE_ICONS.agua} Agua: ${this.finalStats.agua}%`,
      `${RESOURCE_ICONS.legitimidad} Legitimidad: ${this.finalStats.legitimidad}%`,
      `${RESOURCE_ICONS.autonomia} Autonomía: ${this.finalStats.autonomia}%`
    ].join('    ');

    this.add.text(
      GAME_CONFIG.width / 2,
      panelY + 50,
      statsText,
      {
        fontSize: '13px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center'
      }
    ).setOrigin(0.5, 0);

    // Infraestructura
    const infraText = [
      `Transformador A: ${gameState.infrastructure.transformadorA}%`,
      `Transformador B: ${gameState.infrastructure.transformadorB}%`,
      `Perforación: ${gameState.infrastructure.perforacion1}%`
    ].join('    ');

    this.add.text(
      GAME_CONFIG.width / 2,
      panelY + 90,
      infraText,
      {
        fontSize: '12px',
        color: COLORS.textoOscuro,
        fontFamily: 'Courier New',
        align: 'center'
      }
    ).setOrigin(0.5, 0);
  }

  createRestartButton() {
    const buttonY = 540;

    // Botón de reinicio
    const restartButton = this.add.rectangle(
      GAME_CONFIG.width / 2,
      buttonY,
      200,
      40,
      hexToNumber(COLORS.cooperativa),
      1
    );
    restartButton.setInteractive({ useHandCursor: true });

    const restartText = this.add.text(
      GAME_CONFIG.width / 2,
      buttonY,
      'REINICIAR JUEGO',
      {
        fontSize: '16px',
        color: COLORS.fondo,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Hover effect
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(hexToNumber(COLORS.agua));
    });

    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(hexToNumber(COLORS.cooperativa));
    });

    // Click handler
    restartButton.on('pointerdown', () => {
      this.restartGame();
    });

    // También permitir ENTER para reiniciar
    this.input.keyboard.on('keydown-ENTER', () => {
      this.restartGame();
    });
  }

  evaluateAchievements() {
    const achievements = [];
    const flags = gameState.flags;

    // Logros basados en flags
    if (flags.includes('yani_aliada')) {
      achievements.push('✓ Alianza con el dispensario');
    }
    if (flags.includes('expansion_red')) {
      achievements.push('✓ Expansión territorial exitosa');
    }
    if (flags.includes('cooperativa_mixta')) {
      achievements.push('✓ Cooperativa mixta creada');
    }
    if (flags.includes('heroes_tormenta')) {
      achievements.push('✓ Heroísmo durante la tormenta');
    }
    if (flags.includes('reconstruccion_autonoma')) {
      achievements.push('✓ Reconstrucción sin ayuda externa');
    }
    if (flags.includes('red_cooperativas')) {
      achievements.push('✓ Red de cooperativas consolidada');
    }

    // Logros basados en recursos
    if (this.finalStats.autonomia >= 70) {
      achievements.push('✓ Autonomía máxima alcanzada');
    }
    if (this.finalStats.legitimidad >= 80) {
      achievements.push('✓ Legitimidad popular alta');
    }
    if (this.finalStats.electricidad >= 80 && this.finalStats.agua >= 80) {
      achievements.push('✓ Infraestructura óptima');
    }

    if (achievements.length === 0) {
      achievements.push('Sobreviviste contra viento y marea');
    }

    return achievements;
  }

  restartGame() {
    // Resetear gameState
    gameState.resourceManager.reset();
    gameState.timeManager.reset();
    gameState.flags = [];

    // Resetear personajes
    for (const char in gameState.characters) {
      gameState.characters[char].available = true;
      gameState.characters[char].task = null;
      gameState.characters[char].daysRemaining = 0;
    }

    // Resetear infraestructura
    gameState.infrastructure.transformadorA = 90;
    gameState.infrastructure.transformadorB = 40;
    gameState.infrastructure.perforacion1 = 100;

    // Volver a MapScene
    this.scene.start('MapScene');
  }
}
