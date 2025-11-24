/**
 * EndingScene - Estilo Macintosh clásico (System 6/7)
 * Pantalla de resultado final con 8 endings (4 normales + 4 especiales)
 */

class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });

    // Paleta Macintosh clásica (monocromática con grises)
    this.colors = {
      black: 0x000000,
      white: 0xFFFFFF,
      lightGray: 0xCCCCCC,
      mediumGray: 0x888888,
      darkGray: 0x555555,
      desktopGray: 0x999999,
      shadow: 0x333333
    };
  }

  init(data) {
    this.gameOver = data?.gameOver || false;
    this.failedResource = data?.failedResource || null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Calcular ending
    const ending = this.calculateEnding();

    // Audio según el resultado
    if (gameState.audioManager) {
      // Detener música de fondo
      gameState.audioManager.stopMusic();

      // Sonido según el tipo de ending
      this.time.delayedCall(500, () => {
        if (ending.id === 'collapse') {
          // Colapso total - sonido de derrota
          gameState.audioManager.playDefeatSound();
        } else if (ending.id === 'success' || ending.id === 'community') {
          // Éxito o comunidad fuerte - sonido de victoria
          gameState.audioManager.playVictorySound();
        } else if (ending.id === 'crisis') {
          // Crisis - sonido de alerta
          gameState.audioManager.playAlertSound();
        }
        // Para otros endings (balance, struggle, etc.) no reproducir sonido especial
      });
    }

    // Fondo estilo escritorio Mac (gris con textura de puntos)
    this.createMacDesktop(width, height);

    // Mostrar ventana de ending
    this.showEndingWindow(width, height, ending);

    // Fade in
    this.cameras.main.fadeIn(1000);
  }

  createMacDesktop(width, height) {
    // Fondo gris del desktop
    this.add.rectangle(width/2, height/2, width, height, this.colors.desktopGray);

    // Textura de puntos (patrón característico de Mac)
    const graphics = this.add.graphics();
    graphics.fillStyle(this.colors.mediumGray, 0.3);
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if ((x + y) % 8 === 0) {
          graphics.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  // CÁLCULO DE ENDING
  // ═══════════════════════════════════════════

  calculateEnding() {
    // Game over por recurso a 0
    if (this.gameOver && this.failedResource) {
      return this.getCollapseEnding(this.failedResource);
    }

    const status = gameState.getResourceStatus();
    const resources = gameState.resources;

    // Verificar endings especiales primero
    const specialEnding = this.checkSpecialEndings(resources, status);
    if (specialEnding) return specialEnding;

    // Endings normales por estado de recursos
    if (status.healthy === 4) {
      return this.getSuccessEnding(resources);
    }

    if (status.critical >= 2) {
      return this.getCrisisEnding(resources);
    }

    if (status.critical === 1) {
      return this.getStruggleEnding(resources);
    }

    return this.getBalanceEnding(resources);
  }

  // ═══════════════════════════════════════════
  // ENDINGS ESPECIALES
  // ═══════════════════════════════════════════

  checkSpecialEndings(resources, status) {
    // Ending: Autarquía (autonomía muy alta, otros bajos)
    if (resources.autonomia >= 80 && status.average < 50) {
      return {
        id: 'autarky',
        title: 'AUTARQUÍA',
        icon: '🏴',
        subtitle: 'Independientes pero aislados',
        description: 'La red mantuvo su independencia a toda costa. No dependemos de nadie, pero el precio fue alto.\n\nLa comunidad está orgullosa de su autonomía, aunque algunos recursos escasean. El futuro es incierto, pero es nuestro.'
      };
    }

    // Ending: Institucionalización (legitimidad alta, autonomía baja)
    if (resources.legitimidad >= 80 && resources.autonomia < 30) {
      return {
        id: 'institutional',
        title: 'INSTITUCIONALIZACIÓN',
        icon: '🏛️',
        subtitle: 'Reconocidos pero dependientes',
        description: 'La red ganó reconocimiento oficial. El municipio nos ve como modelo.\n\nPero con el reconocimiento vinieron las regulaciones. Ya no somos tan libres de hacer las cosas a nuestra manera.'
      };
    }

    // Ending: Abundancia técnica (electricidad y agua altas)
    if (resources.electricidad >= 80 && resources.agua >= 80) {
      return {
        id: 'technical',
        title: 'ABUNDANCIA TÉCNICA',
        icon: '⚙️',
        subtitle: 'Infraestructura sólida',
        description: 'La infraestructura de la red es impecable. Electricidad estable, agua limpia.\n\nBeto y Marcos están orgullosos. Aunque la comunidad a veces se queja de que priorizamos cables y caños sobre personas.'
      };
    }

    // Ending: Comunidad fuerte (legitimidad alta, otros ok)
    if (resources.legitimidad >= 80 && status.average >= 50) {
      return {
        id: 'community',
        title: 'COMUNIDAD FUERTE',
        icon: '🤝',
        subtitle: 'Unidos en la adversidad',
        description: 'La confianza en la red nunca fue tan alta. Los vecinos se sienten parte de algo.\n\nHay problemas, claro. Pero se resuelven en asamblea, hablando, como debe ser.'
      };
    }

    return null; // Sin ending especial
  }

  // ═══════════════════════════════════════════
  // ENDINGS NORMALES
  // ═══════════════════════════════════════════

  getSuccessEnding(resources) {
    return {
      id: 'success',
      title: 'RED CONSOLIDADA',
      icon: '🏆',
      subtitle: 'Una semana para recordar',
      description: 'Todos los recursos están en buen estado. La semana fue un éxito.\n\nNo significa que no hubo problemas, pero se manejaron bien. La comunidad confía en la gestión y mira el futuro con optimismo.\n\nEl trabajo colectivo dio sus frutos. Seguimos adelante.'
    };
  }

  getBalanceEnding(resources) {
    const lowest = gameState.getLowestResource();

    return {
      id: 'balance',
      title: 'EQUILIBRIO FRÁGIL',
      icon: '⚖️',
      subtitle: 'Ni bien ni mal',
      description: `La semana termina en un equilibrio precario.\n\nLos recursos están estables, aunque ${lowest.icon} ${gameState.getResourceName(lowest.key)} preocupa un poco. La comunidad mantiene la confianza, pero hay tensiones latentes.\n\nNo es un triunfo, pero tampoco un fracaso. El trabajo continúa.`
    };
  }

  getStruggleEnding(resources) {
    const critical = gameState.getCriticalResources()[0];

    return {
      id: 'struggle',
      title: 'RESISTIENDO',
      icon: '⚠️',
      subtitle: 'Sobrevivimos, apenas',
      description: `La semana fue dura. ${critical.icon} ${critical.name} está en estado crítico.\n\nLa comunidad aguanta, pero hay preocupación. Si la próxima semana no mejoramos, vamos a tener problemas serios.\n\nHay que tomar decisiones difíciles pronto.`
    };
  }

  getCrisisEnding(resources) {
    const criticals = gameState.getCriticalResources();
    const criticalNames = criticals.map(c => c.icon).join(' ');

    return {
      id: 'crisis',
      title: 'CRISIS',
      icon: '🔥',
      subtitle: 'Al borde del colapso',
      description: `Múltiples recursos en estado crítico: ${criticalNames}\n\nLa red está al límite. La gente empieza a dudar. Algunos hablan de abandonar el proyecto.\n\nSe necesitan cambios urgentes. No hay margen para más errores.`
    };
  }

  getCollapseEnding(failedResource) {
    const resourceName = gameState.getResourceName(failedResource);
    const icon = gameState.resourceIcons[failedResource];

    const descriptions = {
      electricidad: 'Sin electricidad, los sistemas de la red colapsaron. Los alimentos se pudrieron, la comunicación se cortó, el caos se instaló.\n\nLa gente tuvo que dispersarse. El sueño de la autogestión murió en la oscuridad.',
      agua: 'Sin agua, no hay vida posible. Los vecinos tuvieron que abandonar el barrio en busca de fuentes.\n\nLa red se disolvió. Años de trabajo comunitario, perdidos por falta de planificación.',
      legitimidad: 'La comunidad perdió toda confianza en la gestión. Una asamblea de emergencia votó disolver la coordinación.\n\nLa red existe técnicamente, pero sin legitimidad no hay gobierno posible. El caos se instaló.',
      autonomia: 'La dependencia externa se volvió total. El municipio intervino la red "por el bien de los vecinos".\n\nTécnicamente seguimos funcionando, pero ya no somos una red autogestionada. Somos un programa municipal más.'
    };

    return {
      id: 'collapse',
      title: 'COLAPSO',
      icon: '💀',
      subtitle: `${icon} ${resourceName} llegó a cero`,
      description: descriptions[failedResource] || 'La red no sobrevivió la semana.'
    };
  }

  // ═══════════════════════════════════════════
  // MOSTRAR ENDING
  // ═══════════════════════════════════════════

  showEndingWindow(width, height, ending) {
    const windowWidth = 560;
    const windowHeight = 520;
    const windowX = width / 2;
    const windowY = height / 2;

    // Sombra de la ventana
    this.add.rectangle(windowX + 4, windowY + 4, windowWidth, windowHeight, this.colors.shadow, 0.5);

    // Fondo blanco de la ventana
    this.add.rectangle(windowX, windowY, windowWidth, windowHeight, this.colors.white)
      .setStrokeStyle(2, this.colors.black);

    // Barra de título con rayas
    this.createStripedTitleBar(windowX, windowY - windowHeight/2 + 10, windowWidth, 'Fin de la semana');

    // Contenido
    this.showEndingContent(windowX, windowY, windowHeight, ending);

    // Botones
    this.createButtons(windowX, windowY + windowHeight/2 - 40);
  }

  createStripedTitleBar(x, y, width, title) {
    const barHeight = 20;

    // Fondo blanco
    this.add.rectangle(x, y, width - 4, barHeight, this.colors.white);

    // Rayas horizontales (patrón Mac clásico)
    const graphics = this.add.graphics();
    graphics.fillStyle(this.colors.black, 1);
    for (let i = 0; i < barHeight; i += 2) {
      graphics.fillRect(x - width/2 + 2, y - barHeight/2 + i, width - 4, 1);
    }

    // Título centrado
    this.add.text(x, y, title, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Botón de cerrar (cuadrado en la esquina)
    this.add.rectangle(x - width/2 + 15, y, 12, 12, this.colors.white)
      .setStrokeStyle(1, this.colors.black);
  }

  showEndingContent(centerX, centerY, windowHeight, ending) {
    // Icono grande
    this.add.text(centerX, centerY - 190, ending.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Título
    const titleText = this.add.text(centerX, centerY - 135, ending.title, {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5).setScale(0.8).setAlpha(0);

    // Animación del título
    this.tweens.add({
      targets: titleText,
      scale: { from: 0.8, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Back.easeOut'
    });

    // Subtítulo
    if (ending.subtitle) {
      this.add.text(centerX, centerY - 110, ending.subtitle, {
        fontSize: '13px',
        color: '#555555',
        fontStyle: 'italic',
        fontFamily: 'Geneva, Chicago, sans-serif'
      }).setOrigin(0.5);
    }

    // Línea separadora
    this.add.rectangle(centerX, centerY - 90, 400, 1, this.colors.black);

    // Descripción
    this.add.text(centerX, centerY - 30, ending.description, {
      fontSize: '13px',
      color: '#000000',
      wordWrap: { width: 480 },
      align: 'center',
      lineSpacing: 6,
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Panel de recursos finales
    this.showFinalResources(centerX, centerY + 80);

    // Estadísticas
    this.showStats(centerX, centerY + 120);
  }

  showFinalResources(centerX, y) {
    // Fondo del panel
    this.add.rectangle(centerX, y, 480, 40, this.colors.lightGray)
      .setStrokeStyle(1, this.colors.black);

    // Recursos
    const resources = gameState.getResourcesArray();
    const spacing = 480 / (resources.length + 1);
    const startX = centerX - 240;

    resources.forEach((res, index) => {
      const x = startX + spacing * (index + 1);
      const color = res.value < 20 ? '#cc0000' : res.value >= 50 ? '#006600' : '#000000';

      const resText = this.add.text(x, y + 5, `${res.icon} ${res.value}%`, {
        fontSize: '13px',
        color: color,
        fontStyle: 'bold',
        fontFamily: 'Geneva, Chicago, sans-serif'
      }).setOrigin(0.5).setAlpha(0);

      // Animación secuencial
      this.tweens.add({
        targets: resText,
        alpha: 1,
        y: y,
        duration: 400,
        delay: index * 150,
        ease: 'Power2'
      });
    });
  }

  showStats(centerX, y) {
    const docsCompleted = gameState.completedDocuments.length;
    const daysPlayed = gameState.currentDay;

    this.add.text(centerX, y, `📄 ${docsCompleted} decisiones  •  📅 ${daysPlayed} días  •  💰 ${gameState.creditos} créditos`, {
      fontSize: '12px',
      color: '#555555',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);
  }

  createButtons(centerX, y) {
    // Jugar de nuevo
    const playAgain = this.createMacButton(
      centerX - 120,
      y,
      150,
      28,
      'Jugar de nuevo',
      true
    );
    playAgain.on('pointerdown', () => {
      // Sonido de confirmación
      if (gameState.audioManager) {
        gameState.audioManager.playConfirmSound();
      }

      gameState.reset();
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WelcomeScene');
      });
    });

    // Volver al menú
    const menu = this.createMacButton(
      centerX + 120,
      y,
      100,
      28,
      'Menú',
      false
    );
    menu.on('pointerdown', () => {
      // Sonido de confirmación
      if (gameState.audioManager) {
        gameState.audioManager.playConfirmSound();
      }

      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WelcomeScene');
      });
    });
  }

  createMacButton(x, y, width, height, text, isDefault) {
    const container = this.add.container(x, y);

    // Borde exterior (sombra)
    const shadow = this.add.rectangle(0, 0, width, height, this.colors.shadow)
      .setStrokeStyle(2, this.colors.black);

    // Fondo del botón
    const bg = this.add.rectangle(0, 0, width - 2, height - 2, this.colors.white)
      .setStrokeStyle(isDefault ? 3 : 2, this.colors.black);

    // Texto del botón
    const label = this.add.text(0, 0, text, {
      fontSize: isDefault ? '14px' : '13px',
      color: '#000000',
      fontStyle: isDefault ? 'bold' : 'normal',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    // Efectos hover
    container.on('pointerover', () => {
      bg.setFillStyle(this.colors.lightGray);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(this.colors.white);
    });

    container.on('pointerdown', () => {
      bg.setFillStyle(this.colors.black);
      label.setColor('#FFFFFF');
    });

    container.on('pointerup', () => {
      bg.setFillStyle(this.colors.white);
      label.setColor('#000000');
    });

    return container;
  }
}

if (typeof window !== 'undefined') {
  window.EndingScene = EndingScene;
}
