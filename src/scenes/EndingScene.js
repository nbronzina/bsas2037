/**
 * EndingScene - Pantalla de resultado final mejorada
 * Con 8 endings (4 normales + 4 especiales)
 */

class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  init(data) {
    this.gameOver = data?.gameOver || false;
    this.failedResource = data?.failedResource || null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo
    this.add.rectangle(width/2, height/2, width, height, 0x1a1a1a);

    // Calcular ending
    const ending = this.calculateEnding();

    // Mostrar ending
    this.showEnding(ending);

    // Fade in
    this.cameras.main.fadeIn(1000);
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
        title: '🏴 AUTARQUÍA',
        subtitle: 'Independientes pero aislados',
        description: 'La red mantuvo su independencia a toda costa. No dependemos de nadie, pero el precio fue alto.\n\nLa comunidad está orgullosa de su autonomía, aunque algunos recursos escasean. El futuro es incierto, pero es nuestro.',
        color: '#9C27B0',
        icon: '🏴'
      };
    }

    // Ending: Institucionalización (legitimidad alta, autonomía baja)
    if (resources.legitimidad >= 80 && resources.autonomia < 30) {
      return {
        id: 'institutional',
        title: '🏛️ INSTITUCIONALIZACIÓN',
        subtitle: 'Reconocidos pero dependientes',
        description: 'La red ganó reconocimiento oficial. El municipio nos ve como modelo.\n\nPero con el reconocimiento vinieron las regulaciones. Ya no somos tan libres de hacer las cosas a nuestra manera.',
        color: '#3F51B5',
        icon: '🏛️'
      };
    }

    // Ending: Abundancia técnica (electricidad y agua altas)
    if (resources.electricidad >= 80 && resources.agua >= 80) {
      return {
        id: 'technical',
        title: '⚙️ ABUNDANCIA TÉCNICA',
        subtitle: 'Infraestructura sólida',
        description: 'La infraestructura de la red es impecable. Electricidad estable, agua limpia.\n\nBeto y Marcos están orgullosos. Aunque la comunidad a veces se queja de que priorizamos cables y caños sobre personas.',
        color: '#00BCD4',
        icon: '⚙️'
      };
    }

    // Ending: Comunidad fuerte (legitimidad alta, otros ok)
    if (resources.legitimidad >= 80 && status.average >= 50) {
      return {
        id: 'community',
        title: '🤝 COMUNIDAD FUERTE',
        subtitle: 'Unidos en la adversidad',
        description: 'La confianza en la red nunca fue tan alta. Los vecinos se sienten parte de algo.\n\nHay problemas, claro. Pero se resuelven en asamblea, hablando, como debe ser.',
        color: '#4CAF50',
        icon: '🤝'
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
      title: '🏆 RED CONSOLIDADA',
      subtitle: 'Una semana para recordar',
      description: 'Todos los recursos están en buen estado. La semana fue un éxito.\n\nNo significa que no hubo problemas, pero se manejaron bien. La comunidad confía en la gestión y mira el futuro con optimismo.\n\nEl trabajo colectivo dio sus frutos. Seguimos adelante.',
      color: '#4CAF50',
      icon: '🏆'
    };
  }

  getBalanceEnding(resources) {
    const lowest = gameState.getLowestResource();

    return {
      id: 'balance',
      title: '⚖️ EQUILIBRIO FRÁGIL',
      subtitle: 'Ni bien ni mal',
      description: `La semana termina en un equilibrio precario.\n\nLos recursos están estables, aunque ${lowest.icon} ${gameState.getResourceName(lowest.key)} preocupa un poco. La comunidad mantiene la confianza, pero hay tensiones latentes.\n\nNo es un triunfo, pero tampoco un fracaso. El trabajo continúa.`,
      color: '#2196F3',
      icon: '⚖️'
    };
  }

  getStruggleEnding(resources) {
    const critical = gameState.getCriticalResources()[0];

    return {
      id: 'struggle',
      title: '⚠️ RESISTIENDO',
      subtitle: 'Sobrevivimos, apenas',
      description: `La semana fue dura. ${critical.icon} ${critical.name} está en estado crítico.\n\nLa comunidad aguanta, pero hay preocupación. Si la próxima semana no mejoramos, vamos a tener problemas serios.\n\nHay que tomar decisiones difíciles pronto.`,
      color: '#FF9800',
      icon: '⚠️'
    };
  }

  getCrisisEnding(resources) {
    const criticals = gameState.getCriticalResources();
    const criticalNames = criticals.map(c => c.icon).join(' ');

    return {
      id: 'crisis',
      title: '🔥 CRISIS',
      subtitle: 'Al borde del colapso',
      description: `Múltiples recursos en estado crítico: ${criticalNames}\n\nLa red está al límite. La gente empieza a dudar. Algunos hablan de abandonar el proyecto.\n\nSe necesitan cambios urgentes. No hay margen para más errores.`,
      color: '#F44336',
      icon: '🔥'
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
      title: '💀 COLAPSO',
      subtitle: `${icon} ${resourceName} llegó a cero`,
      description: descriptions[failedResource] || 'La red no sobrevivió la semana.',
      color: '#B71C1C',
      icon: '💀'
    };
  }

  // ═══════════════════════════════════════════
  // MOSTRAR ENDING
  // ═══════════════════════════════════════════

  showEnding(ending) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Icono grande
    this.add.text(width/2, 80, ending.icon, {
      fontSize: '64px'
    }).setOrigin(0.5);

    // Título con animación
    const titleText = this.add.text(width/2, 150, ending.title, {
      fontSize: '32px',
      color: ending.color,
      fontStyle: 'bold',
      fontFamily: 'Courier New'
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
      this.add.text(width/2, 185, ending.subtitle, {
        fontSize: '18px',
        color: '#888888',
        fontStyle: 'italic',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }

    // Descripción
    this.add.text(width/2, height/2 - 20, ending.description, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 580 },
      align: 'center',
      lineSpacing: 8,
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Panel de recursos finales
    this.showFinalResources(height);

    // Estadísticas
    this.showStats(height);

    // Botones
    this.createButtons(height);
  }

  showFinalResources(height) {
    const width = this.cameras.main.width;
    const y = height - 160;

    // Fondo
    this.add.rectangle(width/2, y, 500, 50, 0x333333, 0.8).setStrokeStyle(1, 0x555555);

    // Recursos
    const resources = gameState.getResourcesArray();
    const spacing = 500 / (resources.length + 1);
    const startX = width/2 - 250;

    resources.forEach((res, index) => {
      const x = startX + spacing * (index + 1);
      const color = res.value < 20 ? '#ff5555' : res.value >= 50 ? '#4CAF50' : '#ffffff';

      const resText = this.add.text(x, y + 10, `${res.icon} ${res.value}%`, {
        fontSize: '16px',
        color: color,
        fontFamily: 'Courier New'
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

  showStats(height) {
    const width = this.cameras.main.width;
    const y = height - 110;

    const docsCompleted = gameState.completedDocuments.length;
    const daysPlayed = gameState.currentDay;

    this.add.text(width/2, y, `📄 ${docsCompleted} decisiones  •  📅 ${daysPlayed} días  •  💰 ${gameState.creditos} créditos`, {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
  }

  createButtons(height) {
    const width = this.cameras.main.width;
    const y = height - 50;

    // Jugar de nuevo
    const playAgain = this.add.text(width/2 - 100, y, '[ Jugar de nuevo ]', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgain.on('pointerover', () => playAgain.setColor('#ffffff'));
    playAgain.on('pointerout', () => playAgain.setColor('#ffd700'));
    playAgain.on('pointerdown', () => {
      gameState.reset();
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WelcomeScene');
      });
    });

    // Volver al menú
    const menu = this.add.text(width/2 + 100, y, '[ Menú ]', {
      fontSize: '18px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menu.on('pointerover', () => menu.setColor('#ffffff'));
    menu.on('pointerout', () => menu.setColor('#888888'));
    menu.on('pointerdown', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WelcomeScene');
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.EndingScene = EndingScene;
}
