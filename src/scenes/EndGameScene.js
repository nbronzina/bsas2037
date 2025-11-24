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
    // Fondo - asegurar que no bloquee interacción
    const bg = this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      hexToNumber(COLORS.fondo),
      1
    ).setOrigin(0, 0);
    bg.setDepth(0);  // Fondo en capa más baja

    // Detener música
    gameState.audioManager.stopMusic();

    // Reproducir sonido de victoria o derrota
    if (this.isVictory) {
      gameState.audioManager.playVictorySound();
      this.createVictoryScreen();
    } else {
      gameState.audioManager.playDefeatSound();
      this.createDefeatScreen();
    }

    // Stats finales
    this.createStatsPanel();

    // Botón de reinicio
    this.createRestartButton();
  }

  createVictoryScreen() {
    const centerX = GAME_CONFIG.width / 2;

    // Título (más arriba)
    const title = this.add.text(
      centerX,
      50,
      '¡VICTORIA!',
      {
        fontSize: '42px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Subtítulo según tipo de victoria - 8 FINALES DIFERENCIADOS
    let victoryMessage = '';

    if (this.victoryType === 'utopia_ruinas') {
      victoryMessage = 'UTOPÍA EN RUINAS\n\nLo lograron. Sin rendirse, sin claudicar.\nRed de Aguante sigue en pie, autónoma y fuerte.\nMantuvieron la independencia sin perder la humanidad.';
    } else if (this.victoryType === 'resistencia_heroica') {
      victoryMessage = 'RESISTENCIA HEROICA 🏆\n\nContra todo pronóstico, resistieron.\nLos recursos son escasos, pero la comunidad está UNIDA.\nRechazaron ayudas que condicionaban.\nEsta es la resistencia real.';
    } else if (this.victoryType === 'red_expande') {
      victoryMessage = 'LA RED SE EXPANDE\n\nYa no están solos.\nLa unión con redes vecinas les dio fuerza.\nCrecieron sin perder su voz en el territorio.\nLa autonomía no es aislamiento.';
    } else if (this.victoryType === 'dependencia_inevitable') {
      victoryMessage = 'DEPENDENCIA INEVITABLE\n\nSobrevivieron bajo tutela del estado.\nEl municipio supervisa la red. Los recursos fluyen.\nPero ya no son autónomos. ¿Era este el objetivo?';
    } else if (this.victoryType === 'supervivencia_amarga') {
      victoryMessage = 'SUPERVIVENCIA AMARGA\n\nSobrevivieron. Pero a qué costo.\nLos números están bien, pero la red está fracturada.\nLas decisiones duras dejaron cicatrices.';
    } else if (gameState.flags.includes('victoria_autonomia')) {
      victoryMessage = 'RED AUTÓNOMA CONSOLIDADA\n\nResististe la Gran Sudestada con luz propia.';
    } else if (gameState.flags.includes('victoria_colectiva')) {
      victoryMessage = 'RED COOPERATIVA TERRITORIAL\n\n8 cooperativas sobrevivieron juntas.';
    } else {
      victoryMessage = 'SUPERVIVENCIA Y AUTONOMÍA\n\nLlegaste al día 60 manteniendo la red.';
    }

    const subtitle = this.add.text(
      centerX,
      110,
      victoryMessage,
      {
        fontSize: '16px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 650 }
      }
    ).setOrigin(0.5, 0);

    // Verificar altura del subtitle
    console.log('Victory subtitle height:', subtitle.height);

    // Evaluación de logros (POSICIÓN DINÁMICA)
    const achievements = this.evaluateAchievements();
    const achievementsY = Math.min(subtitle.y + subtitle.height + 30, 280);

    const achievementText = this.add.text(
      centerX,
      achievementsY,
      'LOGROS:\n' + achievements.slice(0, 4).join('\n'),  // Máximo 4 logros
      {
        fontSize: '13px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 650 }
      }
    ).setOrigin(0.5, 0);

    console.log('Achievements Y:', achievementsY, 'Height:', achievementText.height);
  }

  createDefeatScreen() {
    const centerX = GAME_CONFIG.width / 2;

    // Título (más arriba)
    const title = this.add.text(
      centerX,
      50,
      'DERROTA',
      {
        fontSize: '42px',
        color: COLORS.emergencia,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Mensaje de derrota - 3 NUEVOS FINALES + CLÁSICOS
    let defeatMessage = '';

    if (this.defeatReason === 'traicion_sistema') {
      defeatMessage = 'TRAICIÓN DEL SISTEMA 💔\n\nConfiaron en el estado. El estado les falló.\nLa inspección municipal encontró "irregularidades".\nLa red fue desmantelada por órdenes de arriba.';
    } else if (this.defeatReason === 'colapso_caotico') {
      defeatMessage = 'COLAPSO CAÓTICO 🔴\n\nTodo se desmoronó demasiado rápido.\nLa red no pudo sostenerse. Las personas huyeron.\nNo hubo tiempo para organizarse.';
    } else if (this.defeatReason === 'exodo_pacifico') {
      defeatMessage = 'ÉXODO PACÍFICO 🟡\n\nLa red no resistió.\nPero se disolvió con dignidad, cuidando a los suyos.\nA veces retirarse es también resistir.';
    } else if (this.defeatReason === 'electricidad') {
      defeatMessage = 'COLAPSO ENERGÉTICO\n\nLa red eléctrica colapsó completamente.';
    } else if (this.defeatReason === 'agua') {
      defeatMessage = 'CRISIS HÍDRICA\n\nSe acabó el agua potable.';
    } else if (this.defeatReason === 'legitimidad') {
      defeatMessage = 'PÉRDIDA DE LEGITIMIDAD\n\nLa gente dejó de confiar en tu gestión.';
    } else {
      defeatMessage = 'RECURSOS CRÍTICOS\n\nLos recursos cayeron bajo el mínimo.';
    }

    const subtitle = this.add.text(
      centerX,
      110,
      defeatMessage,
      {
        fontSize: '16px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 650 }
      }
    ).setOrigin(0.5, 0);

    console.log('Defeat subtitle height:', subtitle.height);

    // Mensaje motivacional (POSICIÓN DINÁMICA)
    const motivationalY = Math.min(subtitle.y + subtitle.height + 40, 260);

    const motivationalText = this.add.text(
      centerX,
      motivationalY,
      'Día alcanzado: ' + this.finalStats.day + ' / 60\n\nLa organización popular es aprendizaje.\nIntentá de nuevo con otra estrategia.',
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 650 }
      }
    ).setOrigin(0.5, 0);

    console.log('Motivational Y:', motivationalY, 'Height:', motivationalText.height);
  }

  createStatsPanel() {
    const centerX = GAME_CONFIG.width / 2;
    const panelY = 360;  // Más arriba
    const panelHeight = 120;  // Más compacto

    // Fondo
    const bg = this.add.rectangle(
      centerX,
      panelY,
      520,
      panelHeight,
      hexToNumber(COLORS.panel),
      0.9
    ).setOrigin(0.5, 0);

    const border = this.add.rectangle(
      centerX,
      panelY,
      520,
      panelHeight
    ).setOrigin(0.5, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;

    // Título
    const title = this.add.text(
      centerX,
      panelY + 8,
      'ESTADÍSTICAS FINALES',
      {
        fontSize: '13px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);

    // Stats (FORMATO COMPACTO)
    const statsText = [
      `${RESOURCE_ICONS.creditos} ${formatNumber(this.finalStats.creditos)}`,
      `${RESOURCE_ICONS.electricidad} ${Math.round(this.finalStats.electricidad)}%`,
      `${RESOURCE_ICONS.agua} ${Math.round(this.finalStats.agua)}%`,
      `${RESOURCE_ICONS.legitimidad} ${Math.round(this.finalStats.legitimidad)}%`,
      `${RESOURCE_ICONS.autonomia} ${Math.round(this.finalStats.autonomia)}%`
    ].join('   ');

    this.add.text(
      centerX,
      panelY + 40,
      statsText,
      {
        fontSize: '12px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center'
      }
    ).setOrigin(0.5, 0);

    // Infraestructura (FORMATO COMPACTO)
    const infraText = [
      `Transf.A: ${gameState.infrastructure.transformadorA}%`,
      `Transf.B: ${gameState.infrastructure.transformadorB}%`,
      `Perfora: ${gameState.infrastructure.perforacion1}%`
    ].join('   ');

    this.add.text(
      centerX,
      panelY + 75,
      infraText,
      {
        fontSize: '11px',
        color: COLORS.textoOscuro,
        fontFamily: 'Courier New',
        align: 'center'
      }
    ).setOrigin(0.5, 0);

    console.log('Stats panel: Y=' + panelY + ', bottom=' + (panelY + panelHeight));
  }

  createRestartButton() {
    const buttonY = 510;  // Más arriba para asegurar visibilidad
    const centerX = GAME_CONFIG.width / 2;

    console.log('Buttons Y position:', buttonY);

    // ========================================
    // BOTÓN IZQUIERDO: "Volver a inicio"
    // ========================================
    const backToMenuButton = this.add.text(
      centerX - 130,
      buttonY,
      '[ Volver a inicio ]',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#d4a574',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5);

    backToMenuButton.setDepth(100);  // Asegurar que esté encima de todo
    backToMenuButton.setInteractive({ useHandCursor: true });

    // Hover effect
    backToMenuButton.on('pointerover', () => {
      backToMenuButton.setColor('#ffffff');
      backToMenuButton.setScale(1.05);
    });

    backToMenuButton.on('pointerout', () => {
      backToMenuButton.setColor('#d4a574');
      backToMenuButton.setScale(1);
    });

    // Click handler - Volver a MainMenuScene
    backToMenuButton.on('pointerdown', () => {
      console.log('=== BACK TO MENU BUTTON CLICKED ===');
      this.resetGameState();
      console.log('Navigating to MainMenuScene');
      this.scene.start('MainMenuScene');
    });

    // ========================================
    // BOTÓN DERECHO: "Terminar"
    // ========================================
    const exitButton = this.add.text(
      centerX + 130,
      buttonY,
      '[ Terminar ]',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#d4a574',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5);

    exitButton.setDepth(100);  // Asegurar que esté encima de todo
    exitButton.setInteractive({ useHandCursor: true });

    // Hover effect
    exitButton.on('pointerover', () => {
      exitButton.setColor('#ffffff');
      exitButton.setScale(1.05);
    });

    exitButton.on('pointerout', () => {
      exitButton.setColor('#d4a574');
      exitButton.setScale(1);
    });

    // Click handler - Volver a WelcomeScene
    exitButton.on('pointerdown', () => {
      console.log('=== EXIT BUTTON CLICKED ===');
      this.resetGameState();
      console.log('Returning to WelcomeScene');
      this.scene.start('WelcomeScene');
    });

    // ========================================
    // ATAJO: ENTER = Volver a inicio
    // ========================================
    this.input.keyboard.on('keydown-ENTER', () => {
      console.log('ENTER pressed - returning to MainMenuScene');
      this.resetGameState();
      this.scene.start('MainMenuScene');
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

  resetGameState() {
    console.log('=== RESETTING GAME STATE ===');

    // 1. Borrar partida guardada
    if (gameState.saveManager) {
      gameState.saveManager.deleteSave();
      console.log('✓ Save deleted');
    }

    // 2. Resetear TimeManager
    if (gameState.timeManager) {
      gameState.timeManager.reset();
      console.log('✓ TimeManager reset to day 1');
    }

    // 3. Resetear ResourceManager
    if (gameState.resourceManager) {
      gameState.resourceManager.reset();
      console.log('✓ ResourceManager reset to initial values');
    }

    // 4. Resetear flags, completedEncounters y decisionCounters
    gameState.flags = [];
    gameState.completedEncounters = [];
    gameState.decisionCounters = {
      decisiones_cooperativas: 0,
      decisiones_duras: 0,
      ayudas_rechazadas: 0,
      ayudas_aceptadas: 0
    };
    console.log('✓ Flags, completedEncounters and decisionCounters cleared');

    // 5. Resetear personajes
    if (gameState.characters) {
      for (const charKey in gameState.characters) {
        resetCharacter(gameState.characters[charKey]);
      }
      console.log('✓ Characters reset');
    }

    // 6. Resetear infraestructura
    if (gameState.infrastructure) {
      gameState.infrastructure = { ...INITIAL_INFRASTRUCTURE };
      console.log('✓ Infrastructure reset');
    }

    console.log('=== GAME STATE FULLY RESET ===');
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-ENTER');
  }
}
