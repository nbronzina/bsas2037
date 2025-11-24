/**
 * RandomEventManager - Sistema de eventos procedurales aleatorios
 *
 * Gestiona 15 eventos aleatorios (6 crisis, 5 oportunidades, 4 neutral)
 * que pueden ocurrir durante los 60 días de juego.
 *
 * Características:
 * - 20% de probabilidad diaria base
 * - Cooldown de 3 días mínimo entre eventos
 * - Precondiciones basadas en recursos, flags y días
 * - Weighted random selection cuando múltiples eventos son elegibles
 * - Persistencia en save/load
 */

class RandomEventManager {
  constructor() {
    this.events = [];
    this.eventHistory = []; // [{eventId, day, optionChosen}]
    this.lastEventDay = -10; // Día del último evento
    this.pendingEvent = null; // Evento esperando a ser mostrado
    this.activeFlags = new Set(); // Flags internos para eventos

    this.initializeEvents();
  }

  /**
   * Inicializa los 15 eventos del sistema
   */
  initializeEvents() {
    this.events = [
      // ========================================
      // CRISIS (6 eventos)
      // ========================================

      {
        id: 'evento_apagon_sorpresa',
        title: 'Apagón Sorpresivo',
        description: 'Un transformador falló sin previo aviso. El barrio quedó sin luz y los vecinos reclaman una solución urgente. El técnico dice que puede hacer una reparación rápida pero costosa, o esperar a que lleguen repuestos más baratos en 2 días.',
        type: 'crisis',
        icon: '⚡💥',
        conditions: {
          minDay: 10,
          maxDay: 50,
          electricidad: { max: 40 },
          notFlags: ['apagon_reciente'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.3,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Reparación urgente (500₡)',
            consequences: {
              resources: { creditos: -500, electricidad: 15 },
              flags: ['apagon_sorpresa_reparado', 'apagon_reciente']
            },
            resultMessage: 'La reparación urgente restauró el servicio. Los vecinos agradecen la rapidez.'
          },
          {
            id: 2,
            text: 'Esperar repuestos baratos (2 días)',
            consequences: {
              resources: { creditos: -200, electricidad: 10, agua: -5 },
              flags: ['apagon_esperado', 'apagon_reciente']
            },
            resultMessage: 'Ahorraste dinero pero el barrio sufrió 2 días de cortes. Algunos vecinos perdieron comida refrigerada.'
          },
          {
            id: 3,
            text: 'Dejar que el barrio se arregle solo',
            consequences: {
              resources: { electricidad: 5, moral: -15 },
              flags: ['apagon_ignorado', 'apagon_reciente']
            },
            resultMessage: 'Los vecinos se las arreglaron con generadores improvisados, pero tu credibilidad bajó.'
          }
        ]
      },

      {
        id: 'evento_contaminacion_agua',
        title: 'Contaminación del Agua',
        description: 'Análisis rutinarios detectaron niveles altos de contaminantes en el agua. Pueden ser bacterias o químicos de la zona industrial cercana. Necesitas decidir rápido antes de que alguien se enferme.',
        type: 'crisis',
        icon: '💧☣️',
        conditions: {
          minDay: 15,
          maxDay: 50,
          agua: { min: 20, max: 60 },
          notFlags: ['agua_contaminada_activa'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.25,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Cortar suministro y distribuir agua embotellada (800₡)',
            consequences: {
              resources: { creditos: -800, agua: -20, moral: 5 },
              flags: ['agua_emergencia_resuelta']
            },
            resultMessage: 'Previniste una crisis de salud. Los vecinos confían en tu liderazgo responsable.'
          },
          {
            id: 2,
            text: 'Filtros de emergencia y hervir agua (400₡)',
            consequences: {
              resources: { creditos: -400, agua: -10, electricidad: -10 },
              flags: ['agua_filtros_instalados']
            },
            resultMessage: 'Una solución intermedia. Algunos se quejaron pero nadie se enfermó gravemente.'
          },
          {
            id: 3,
            text: 'Solo avisar a los vecinos del riesgo',
            consequences: {
              resources: { agua: 0, moral: -20 },
              flags: ['agua_crisis_ignorada']
            },
            resultMessage: 'Tres familias tuvieron intoxicaciones leves. Tu reputación como líder está en duda.'
          }
        ]
      },

      {
        id: 'evento_brote_enfermedad',
        title: 'Brote de Enfermedad',
        description: 'Varios vecinos reportan fiebre alta y dolores. Podría ser dengue por la acumulación de agua estancada. El sistema de salud público está colapsado. Necesitas actuar antes de que se propague.',
        type: 'crisis',
        icon: '🤒🦟',
        conditions: {
          minDay: 20,
          maxDay: 55,
          moral: { max: 60 },
          notFlags: ['brote_reciente'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.2,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Contactar médico privado de confianza (1000₡)',
            consequences: {
              resources: { creditos: -1000, moral: 10 },
              flags: ['brote_controlado_profesional', 'brote_reciente']
            },
            resultMessage: 'El médico diagnosticó y trató a tiempo. El brote se contuvo y salvaste vidas.'
          },
          {
            id: 2,
            text: 'Enfermera del barrio + medicamentos (500₡)',
            consequences: {
              resources: { creditos: -500, moral: 0 },
              flags: ['brote_controlado_comunidad', 'brote_reciente']
            },
            resultMessage: 'La enfermera hizo lo que pudo. La mayoría se recuperó, pero fue una semana difícil.'
          },
          {
            id: 3,
            text: 'Cuarentena voluntaria y remedios caseros',
            consequences: {
              resources: { creditos: 0, moral: -15, agua: -10 },
              flags: ['brote_empeorado', 'brote_reciente']
            },
            resultMessage: 'El brote se extendió más de lo esperado. Dos ancianos tuvieron complicaciones graves.'
          }
        ]
      },

      {
        id: 'evento_robo_almacen',
        title: 'Robo en el Almacén',
        description: 'Esta madrugada forzaron la puerta del almacén comunitario. Robaron herramientas, cables y varios bidones de agua. Los vecinos están indignados y exigen medidas de seguridad.',
        type: 'crisis',
        icon: '🚨🔓',
        conditions: {
          minDay: 12,
          maxDay: 50,
          creditos: { min: 200 },
          notFlags: ['seguridad_reforzada'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.25,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Contratar vigilancia nocturna (600₡)',
            consequences: {
              resources: { creditos: -600, agua: -10 },
              flags: ['seguridad_reforzada', 'vigilancia_contratada']
            },
            resultMessage: 'La vigilancia previno futuros robos. Los vecinos se sienten más seguros.'
          },
          {
            id: 2,
            text: 'Organizar turnos de vigilancia voluntaria',
            consequences: {
              resources: { creditos: 0, moral: 5, electricidad: -5 },
              flags: ['seguridad_comunitaria', 'vigilancia_vecinal']
            },
            resultMessage: 'La comunidad se organizó en turnos. Se fortalecieron los lazos vecinales.'
          },
          {
            id: 3,
            text: 'Instalar candado mejor y cámara falsa (200₡)',
            consequences: {
              resources: { creditos: -200, agua: -5 },
              flags: ['seguridad_básica']
            },
            resultMessage: 'Una solución económica pero efectiva. No hubo más robos por ahora.'
          }
        ]
      },

      {
        id: 'evento_tormenta_severa',
        title: 'Tormenta Severa',
        description: 'Una tormenta eléctrica intensa azotó el barrio. Hay techos volados, cables caídos y el generador principal sufrió daños. El agua de lluvia acumulada amenaza con inundaciones.',
        type: 'crisis',
        icon: '⛈️🌪️',
        conditions: {
          minDay: 8,
          maxDay: 52,
          notFlags: ['tormenta_reciente'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.2,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Reparaciones completas de emergencia (900₡)',
            consequences: {
              resources: { creditos: -900, electricidad: 10, agua: 5 },
              flags: ['tormenta_reparada_completa', 'tormenta_reciente']
            },
            resultMessage: 'Reparaste todo rápidamente. El barrio volvió a la normalidad sin pérdidas mayores.'
          },
          {
            id: 2,
            text: 'Reparar solo lo crítico (400₡)',
            consequences: {
              resources: { creditos: -400, electricidad: 5, agua: -5 },
              flags: ['tormenta_reparada_parcial', 'tormenta_reciente']
            },
            resultMessage: 'Priorizaste electricidad y drenaje. Algunos techos quedaron con goteras.'
          },
          {
            id: 3,
            text: 'Jornada de reparación comunitaria',
            consequences: {
              resources: { creditos: -100, electricidad: 3, moral: 10 },
              flags: ['tormenta_comunitaria', 'tormenta_reciente']
            },
            resultMessage: 'Los vecinos trabajaron juntos toda la semana. Se reparó lo esencial y creció la solidaridad.'
          }
        ]
      },

      {
        id: 'evento_conflicto_vecinal',
        title: 'Conflicto Vecinal',
        description: 'Dos familias están en conflicto por el uso del generador comunitario. Ambos bandos tienen seguidores y la tensión está dividiendo al barrio. Como líder, debes intervenir antes de que empeore.',
        type: 'crisis',
        icon: '👥💢',
        conditions: {
          minDay: 18,
          maxDay: 50,
          moral: { max: 50 },
          electricidad: { max: 40 },
          notFlags: ['conflicto_resuelto'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.2,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Mediar y crear cronograma de uso justo',
            consequences: {
              resources: { moral: 15, electricidad: -5 },
              flags: ['conflicto_resuelto_mediacion']
            },
            resultMessage: 'Tu mediación fue exitosa. Ambas partes aceptaron el cronograma y la paz volvió.'
          },
          {
            id: 2,
            text: 'Comprar un segundo generador (700₡)',
            consequences: {
              resources: { creditos: -700, moral: 20, electricidad: 15 },
              flags: ['conflicto_resuelto_recursos']
            },
            resultMessage: 'Resolviste el problema de raíz. Ahora hay suficiente capacidad para todos.'
          },
          {
            id: 3,
            text: 'Dejar que lo resuelvan ellos',
            consequences: {
              resources: { moral: -20 },
              flags: ['conflicto_empeorado']
            },
            resultMessage: 'El conflicto escaló. Ahora hay dos facciones claramente divididas en el barrio.'
          }
        ]
      },

      // ========================================
      // OPORTUNIDADES (5 eventos)
      // ========================================

      {
        id: 'evento_donacion_inesperada',
        title: 'Donación Inesperada',
        description: 'Una ONG internacional visitó el barrio e impresionada con tu organización comunitaria, ofreció una donación. Puedes elegir qué tipo de ayuda necesitas más.',
        type: 'opportunity',
        icon: '🎁📦',
        conditions: {
          minDay: 10,
          maxDay: 50,
          moral: { min: 40 },
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.15,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Solicitar equipamiento técnico (generadores, filtros)',
            consequences: {
              resources: { electricidad: 20, agua: 15 },
              flags: ['donacion_equipamiento']
            },
            resultMessage: 'Recibiste 2 generadores solares y 5 filtros de agua. Gran impulso a la infraestructura.'
          },
          {
            id: 2,
            text: 'Solicitar dinero en efectivo',
            consequences: {
              resources: { creditos: 1200 },
              flags: ['donacion_dinero']
            },
            resultMessage: 'Recibiste 1200₡. Flexibilidad total para usarlo donde más se necesite.'
          },
          {
            id: 3,
            text: 'Solicitar capacitación técnica',
            consequences: {
              resources: { moral: 15 },
              flags: ['donacion_capacitacion', 'equipo_capacitado']
            },
            resultMessage: 'Tres vecinos recibieron capacitación en mantenimiento eléctrico. Inversión a largo plazo.'
          }
        ]
      },

      {
        id: 'evento_nuevo_miembro_tecnico',
        title: 'Nuevo Miembro Técnico',
        description: 'Paula, una ingeniera que trabajaba en la Ciudad Autónoma, se mudó al barrio escapando de la gentrificación. Tiene experiencia en sistemas eléctricos y está dispuesta a ayudar si la integras bien.',
        type: 'opportunity',
        icon: '👩‍🔧⚡',
        conditions: {
          minDay: 15,
          maxDay: 45,
          moral: { min: 30 },
          electricidad: { max: 60 },
          notFlags: ['paula_integrada'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.2,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Darle rol de liderazgo técnico',
            consequences: {
              resources: { electricidad: 20, moral: 10 },
              flags: ['paula_integrada', 'paula_lider_tecnico']
            },
            resultMessage: 'Paula optimizó todo el sistema eléctrico. Ahora gastas menos y produces más.'
          },
          {
            id: 2,
            text: 'Pedirle que capacite a otros vecinos',
            consequences: {
              resources: { electricidad: 10, moral: 15 },
              flags: ['paula_integrada', 'paula_maestra']
            },
            resultMessage: 'Paula formó un equipo de 4 técnicos. Ahora el conocimiento está distribuido.'
          },
          {
            id: 3,
            text: 'Integrarla gradualmente sin presión',
            consequences: {
              resources: { electricidad: 5, moral: 5 },
              flags: ['paula_integrada_gradual']
            },
            resultMessage: 'Paula ayuda ocasionalmente. Buena relación pero sin aprovechar todo su potencial.'
          }
        ]
      },

      {
        id: 'evento_periodista_cobertura',
        title: 'Oportunidad Mediática',
        description: 'Un periodista de un medio alternativo quiere hacer una nota sobre cómo se organizó el barrio en medio de la crisis. La cobertura podría atraer donaciones, pero también atención no deseada.',
        type: 'opportunity',
        icon: '📰🎤',
        conditions: {
          minDay: 20,
          maxDay: 50,
          moral: { min: 50 },
          notFlags: ['cobertura_mediatica'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.15,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Aceptar cobertura completa',
            consequences: {
              resources: { creditos: 600, moral: 10 },
              flags: ['cobertura_mediatica', 'visibilidad_alta']
            },
            resultMessage: 'La nota fue viral. Llegaron donaciones y mensajes de apoyo de todo el país.'
          },
          {
            id: 2,
            text: 'Cobertura limitada, sin nombres ni fotos',
            consequences: {
              resources: { creditos: 300, moral: 5 },
              flags: ['cobertura_mediatica', 'visibilidad_moderada']
            },
            resultMessage: 'La nota fue discreta pero positiva. Algunas donaciones llegaron sin atraer problemas.'
          },
          {
            id: 3,
            text: 'Rechazar la cobertura',
            consequences: {
              resources: { moral: -5 },
              flags: ['cobertura_rechazada']
            },
            resultMessage: 'Priorizaste la seguridad y privacidad del barrio. Algunos vecinos querían la exposición.'
          }
        ]
      },

      {
        id: 'evento_excedente_energia',
        title: 'Excedente de Energía',
        description: 'Una semana de sol intenso más optimizaciones técnicas resultaron en excedente de electricidad. Puedes vender el excedente, almacenarlo, o compartirlo con barrios vecinos.',
        type: 'opportunity',
        icon: '☀️🔋',
        conditions: {
          minDay: 25,
          maxDay: 50,
          electricidad: { min: 70 },
          notFlags: ['excedente_procesado'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.2,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Vender excedente al barrio vecino (800₡)',
            consequences: {
              resources: { creditos: 800, electricidad: -15 },
              flags: ['excedente_vendido', 'excedente_procesado']
            },
            resultMessage: 'Vendiste el excedente y generaste ingresos. Relación comercial establecida.'
          },
          {
            id: 2,
            text: 'Donar energía a barrio vecino',
            consequences: {
              resources: { electricidad: -15, moral: 20 },
              flags: ['excedente_donado', 'alianza_barrio_vecino', 'excedente_procesado']
            },
            resultMessage: 'El barrio vecino agradeció la solidaridad. Creaste una alianza valiosa.'
          },
          {
            id: 3,
            text: 'Invertir en baterías de almacenamiento (500₡)',
            consequences: {
              resources: { creditos: -500, electricidad: 10 },
              flags: ['baterias_instaladas', 'excedente_procesado']
            },
            resultMessage: 'Instalaste baterías. Ahora tienes reserva para días nublados.'
          }
        ]
      },

      {
        id: 'evento_taller_universidad',
        title: 'Taller Universitario',
        description: 'La cátedra de Desarrollo Comunitario de la UBA ofrece un taller gratuito de 2 días sobre gestión cooperativa, economía solidaria y organización horizontal. Pueden asistir hasta 5 vecinos.',
        type: 'opportunity',
        icon: '🎓📚',
        conditions: {
          minDay: 15,
          maxDay: 45,
          moral: { min: 40 },
          notFlags: ['taller_completado'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.15,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Enviar equipo de liderazgo (5 personas)',
            consequences: {
              resources: { moral: 15, creditos: 100 },
              flags: ['taller_completado', 'liderazgo_capacitado']
            },
            resultMessage: 'El equipo volvió con nuevas herramientas de gestión. Mejoraste la eficiencia organizativa.'
          },
          {
            id: 2,
            text: 'Enviar vecinos jóvenes (formación nueva generación)',
            consequences: {
              resources: { moral: 20 },
              flags: ['taller_completado', 'nueva_generacion_formada']
            },
            resultMessage: 'Los jóvenes están entusiasmados y aportan ideas frescas. Inversión a futuro.'
          },
          {
            id: 3,
            text: 'No enviar a nadie (priorizar trabajo local)',
            consequences: {
              resources: { creditos: 50 },
              flags: ['taller_rechazado']
            },
            resultMessage: 'Priorizaste las necesidades inmediatas del barrio sobre la capacitación.'
          }
        ]
      },

      // ========================================
      // NEUTRAL/NARRATIVA (4 eventos)
      // ========================================

      {
        id: 'evento_visita_cooperativa',
        title: 'Visita de Cooperativa Hermana',
        description: 'La Cooperativa del Barrio Oeste, que también se autogestiona, pidió visitarte para intercambiar experiencias. Tienen 3 años más de trayectoria. Puedes aprender de ellos o enseñarles tus innovaciones.',
        type: 'neutral',
        icon: '🤝🏘️',
        conditions: {
          minDay: 20,
          maxDay: 50,
          moral: { min: 30 },
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.15,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Organizar jornada de intercambio (200₡)',
            consequences: {
              resources: { creditos: -200, moral: 15 },
              flags: ['visita_cooperativa_exitosa', 'red_cooperativas']
            },
            resultMessage: 'Intercambiaron conocimientos técnicos y estrategias. Ahora son aliados permanentes.'
          },
          {
            id: 2,
            text: 'Recorrido simple sin gastos',
            consequences: {
              resources: { moral: 5 },
              flags: ['visita_cooperativa_basica']
            },
            resultMessage: 'Una visita cordial. Intercambiaron contactos y experiencias básicas.'
          },
          {
            id: 3,
            text: 'Posponer la visita (ocupados)',
            consequences: {
              resources: { moral: -5 },
              flags: ['visita_cooperativa_pospuesta']
            },
            resultMessage: 'Priorizaste urgencias locales. La cooperativa entendió pero se perdió la oportunidad.'
          }
        ]
      },

      {
        id: 'evento_aniversario_barrio',
        title: 'Aniversario del Barrio',
        description: 'Se cumple el 40° aniversario de la fundación del barrio. Los vecinos más antiguos proponen organizar una celebración para recordar la historia y fortalecer la identidad comunitaria.',
        type: 'neutral',
        icon: '🎉🏘️',
        conditions: {
          minDay: 25,
          maxDay: 45,
          moral: { min: 30 },
          notFlags: ['aniversario_celebrado'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.15,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Organizar festival comunitario (400₡)',
            consequences: {
              resources: { creditos: -400, moral: 25 },
              flags: ['aniversario_celebrado', 'festival_exitoso']
            },
            resultMessage: 'El festival fue hermoso. Música, comida y relatos históricos. La comunidad se siente más unida.'
          },
          {
            id: 2,
            text: 'Asado comunitario simple (150₡)',
            consequences: {
              resources: { creditos: -150, moral: 15 },
              flags: ['aniversario_celebrado', 'asado_comunitario']
            },
            resultMessage: 'Un asado sencillo pero emotivo. Los viejos contaron historias mientras los chicos jugaban.'
          },
          {
            id: 3,
            text: 'Solo reconocimiento simbólico',
            consequences: {
              resources: { moral: 5 },
              flags: ['aniversario_simbólico']
            },
            resultMessage: 'Una placa conmemorativa y algunas palabras. Los recursos se priorizaron para necesidades.'
          }
        ]
      },

      {
        id: 'evento_mural_ninos',
        title: 'Proyecto Mural',
        description: 'Los niños de la escuela del barrio proponen pintar un mural sobre "Cómo vivimos la crisis". Una artista local se ofreció a coordinar el proyecto si consiguen los materiales.',
        type: 'neutral',
        icon: '🎨👧👦',
        conditions: {
          minDay: 15,
          maxDay: 50,
          moral: { min: 20 },
          notFlags: ['mural_completado'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.2,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Comprar materiales de calidad (300₡)',
            consequences: {
              resources: { creditos: -300, moral: 20 },
              flags: ['mural_completado', 'arte_comunitario']
            },
            resultMessage: 'El mural quedó hermoso. Atrae miradas y da identidad al barrio. Los niños están orgullosos.'
          },
          {
            id: 2,
            text: 'Buscar materiales donados',
            consequences: {
              resources: { creditos: -50, moral: 10 },
              flags: ['mural_completado', 'mural_improvisado']
            },
            resultMessage: 'Con pinturas donadas y restos, los niños crearon algo único. No perfecto, pero auténtico.'
          },
          {
            id: 3,
            text: 'Posponer el proyecto',
            consequences: {
              resources: { moral: -10 },
              flags: ['mural_pospuesto']
            },
            resultMessage: 'Los niños entendieron que hay prioridades. Algunos perdieron el entusiasmo inicial.'
          }
        ]
      },

      {
        id: 'evento_radio_comunitaria',
        title: 'Radio Comunitaria',
        description: 'Un grupo de jóvenes tiene experiencia en radio y propone crear FM Aguante, una radio comunitaria. Necesitan equipamiento básico y un espacio. Puede ser una herramienta de comunicación o un gasto innecesario.',
        type: 'neutral',
        icon: '📻🎙️',
        conditions: {
          minDay: 20,
          maxDay: 50,
          electricidad: { min: 40 },
          moral: { min: 35 },
          notFlags: ['radio_instalada'],
          minTimeSinceLastEvent: 3
        },
        baseChance: 0.15,
        weight: 1.0,
        options: [
          {
            id: 1,
            text: 'Invertir en equipamiento profesional (600₡)',
            consequences: {
              resources: { creditos: -600, moral: 20, electricidad: -5 },
              flags: ['radio_instalada', 'radio_profesional']
            },
            resultMessage: 'FM Aguante salió al aire con buena calidad. Informa, entretiene y da voz al barrio.'
          },
          {
            id: 2,
            text: 'Equipamiento básico y apoyo limitado (250₡)',
            consequences: {
              resources: { creditos: -250, moral: 10, electricidad: -3 },
              flags: ['radio_instalada', 'radio_basica']
            },
            resultMessage: 'La radio funciona con lo básico. Transmite 4 horas diarias y va creciendo de a poco.'
          },
          {
            id: 3,
            text: 'No apoyar el proyecto',
            consequences: {
              resources: { moral: -10 },
              flags: ['radio_rechazada']
            },
            resultMessage: 'Priorizaste recursos para necesidades inmediatas. Los jóvenes se desilusionaron un poco.'
          }
        ]
      }
    ];

    console.log(`RandomEventManager: Initialized ${this.events.length} events`);
  }

  /**
   * Verifica si debe ocurrir un evento en el día actual
   * @param {number} currentDay - Día actual del juego
   * @returns {object|null} - Evento seleccionado o null
   */
  checkForEvent(currentDay) {
    // Zona de exclusión: no eventos en días 1-5 (tutorial) ni 55-60 (endgame)
    if (currentDay <= 5 || currentDay >= 55) {
      return null;
    }

    // Verificar cooldown
    if (currentDay - this.lastEventDay < 3) {
      return null;
    }

    // Probabilidad base: 20%
    let baseProbability = 0.20;

    // Reducir si hay encuentro scripteado hoy (placeholder - necesita integración)
    // baseProbability *= 0.5;

    // Roll de probabilidad
    if (Math.random() > baseProbability) {
      return null;
    }

    // Obtener eventos elegibles
    const eligibleEvents = this.getEligibleEvents(currentDay);

    if (eligibleEvents.length === 0) {
      console.log('RandomEventManager: No eligible events found');
      return null;
    }

    // Seleccionar evento por peso
    const selectedEvent = this.selectEventByWeight(eligibleEvents);

    console.log(`RandomEventManager: Selected event "${selectedEvent.title}" for day ${currentDay}`);

    return selectedEvent;
  }

  /**
   * Obtiene la lista de eventos elegibles según condiciones
   * @param {number} currentDay - Día actual del juego
   * @returns {array} - Array de eventos que cumplen condiciones
   */
  getEligibleEvents(currentDay) {
    return this.events.filter(event => {
      return this.checkConditions(event.conditions, currentDay);
    });
  }

  /**
   * Verifica si un evento cumple todas sus condiciones
   * @param {object} conditions - Condiciones del evento
   * @param {number} currentDay - Día actual
   * @returns {boolean} - true si cumple todas las condiciones
   */
  checkConditions(conditions, currentDay) {
    if (!conditions) return true;

    // Verificar rango de días
    if (conditions.minDay && currentDay < conditions.minDay) return false;
    if (conditions.maxDay && currentDay > conditions.maxDay) return false;

    // Verificar cooldown desde último evento
    if (conditions.minTimeSinceLastEvent) {
      if (currentDay - this.lastEventDay < conditions.minTimeSinceLastEvent) {
        return false;
      }
    }

    // Verificar recursos
    if (gameState && gameState.resourceManager) {
      const resources = gameState.resourceManager;

      // Electricidad
      if (conditions.electricidad) {
        const elec = resources.electricidad;
        if (conditions.electricidad.min && elec < conditions.electricidad.min) return false;
        if (conditions.electricidad.max && elec > conditions.electricidad.max) return false;
      }

      // Agua
      if (conditions.agua) {
        const agua = resources.agua;
        if (conditions.agua.min && agua < conditions.agua.min) return false;
        if (conditions.agua.max && agua > conditions.agua.max) return false;
      }

      // Créditos
      if (conditions.creditos) {
        const creditos = resources.creditos;
        if (conditions.creditos.min && creditos < conditions.creditos.min) return false;
        if (conditions.creditos.max && creditos > conditions.creditos.max) return false;
      }

      // Moral
      if (conditions.moral) {
        const moral = resources.moral;
        if (conditions.moral.min && moral < conditions.moral.min) return false;
        if (conditions.moral.max && moral > conditions.moral.max) return false;
      }
    }

    // Verificar flags que NO deben estar activos
    if (conditions.notFlags) {
      for (const flag of conditions.notFlags) {
        if (this.activeFlags.has(flag)) {
          return false;
        }
        // También verificar en FlagManager global si existe
        if (gameState && gameState.flagManager && gameState.flagManager.hasFlag(flag)) {
          return false;
        }
      }
    }

    // Verificar flags que SÍ deben estar activos
    if (conditions.requireFlags) {
      for (const flag of conditions.requireFlags) {
        const hasInLocal = this.activeFlags.has(flag);
        const hasInGlobal = gameState && gameState.flagManager && gameState.flagManager.hasFlag(flag);
        if (!hasInLocal && !hasInGlobal) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Selecciona un evento de la lista usando weighted random
   * @param {array} eligibleEvents - Array de eventos elegibles
   * @returns {object} - Evento seleccionado
   */
  selectEventByWeight(eligibleEvents) {
    if (eligibleEvents.length === 0) return null;
    if (eligibleEvents.length === 1) return eligibleEvents[0];

    // Calcular peso total
    const totalWeight = eligibleEvents.reduce((sum, event) => {
      return sum + (event.baseChance * event.weight);
    }, 0);

    // Selección weighted random
    let random = Math.random() * totalWeight;

    for (const event of eligibleEvents) {
      const eventWeight = event.baseChance * event.weight;
      random -= eventWeight;
      if (random <= 0) {
        return event;
      }
    }

    // Fallback (no debería llegar aquí)
    return eligibleEvents[eligibleEvents.length - 1];
  }

  /**
   * Marca un evento como pendiente para ser mostrado
   * @param {object} event - Evento a activar
   */
  triggerEvent(event) {
    this.pendingEvent = event;
    console.log(`RandomEventManager: Event "${event.title}" is now pending`);
  }

  /**
   * Obtiene el evento pendiente (si hay uno)
   * @returns {object|null} - Evento pendiente
   */
  getPendingEvent() {
    return this.pendingEvent;
  }

  /**
   * Registra el resultado de un evento (opción elegida)
   * @param {string} eventId - ID del evento
   * @param {number} optionId - ID de la opción elegida
   * @param {number} currentDay - Día actual
   */
  recordEventResult(eventId, optionId, currentDay) {
    this.eventHistory.push({
      eventId: eventId,
      optionChosen: optionId,
      day: currentDay
    });

    this.lastEventDay = currentDay;
    this.pendingEvent = null;

    console.log(`RandomEventManager: Recorded event ${eventId}, option ${optionId} on day ${currentDay}`);
  }

  /**
   * Aplica las consecuencias de una opción elegida
   * @param {object} consequences - Objeto de consecuencias
   */
  applyConsequences(consequences) {
    if (!consequences) return;

    // Aplicar cambios de recursos
    if (consequences.resources && gameState && gameState.resourceManager) {
      const resources = consequences.resources;

      if (resources.creditos) {
        gameState.resourceManager.creditos += resources.creditos;
      }
      if (resources.electricidad) {
        gameState.resourceManager.electricidad += resources.electricidad;
      }
      if (resources.agua) {
        gameState.resourceManager.agua += resources.agua;
      }
      if (resources.moral) {
        gameState.resourceManager.moral += resources.moral;
      }

      // Asegurar que recursos estén en rangos válidos
      gameState.resourceManager.creditos = Math.max(0, gameState.resourceManager.creditos);
      gameState.resourceManager.electricidad = Math.max(0, Math.min(100, gameState.resourceManager.electricidad));
      gameState.resourceManager.agua = Math.max(0, Math.min(100, gameState.resourceManager.agua));
      gameState.resourceManager.moral = Math.max(0, Math.min(100, gameState.resourceManager.moral));

      console.log('RandomEventManager: Applied resource consequences:', resources);
    }

    // Aplicar flags
    if (consequences.flags) {
      for (const flag of consequences.flags) {
        this.activeFlags.add(flag);

        // También agregar al FlagManager global si existe
        if (gameState && gameState.flagManager) {
          gameState.flagManager.setFlag(flag, true);
        }
      }
      console.log('RandomEventManager: Applied flags:', consequences.flags);
    }

    // Desbloquear achievements si corresponde
    if (consequences.achievements && gameState && gameState.achievementManager) {
      for (const achievementId of consequences.achievements) {
        gameState.achievementManager.unlock(achievementId);
      }
      console.log('RandomEventManager: Unlocked achievements:', consequences.achievements);
    }
  }

  /**
   * Obtiene un evento por ID
   * @param {string} eventId - ID del evento
   * @returns {object|null} - Evento encontrado
   */
  getEventById(eventId) {
    return this.events.find(e => e.id === eventId) || null;
  }

  /**
   * Obtiene estadísticas del sistema de eventos
   * @returns {object} - Stats del sistema
   */
  getStats() {
    return {
      totalEvents: this.events.length,
      triggeredEvents: this.eventHistory.length,
      lastEventDay: this.lastEventDay,
      activeFlags: Array.from(this.activeFlags)
    };
  }

  /**
   * Limpia un flag específico (para testing)
   * @param {string} flag - Flag a limpiar
   */
  clearFlag(flag) {
    this.activeFlags.delete(flag);
    if (gameState && gameState.flagManager) {
      gameState.flagManager.setFlag(flag, false);
    }
  }

  /**
   * Exporta el estado para guardado
   * @returns {object} - Estado serializable
   */
  toJSON() {
    return {
      eventHistory: this.eventHistory,
      lastEventDay: this.lastEventDay,
      activeFlags: Array.from(this.activeFlags),
      pendingEvent: this.pendingEvent ? this.pendingEvent.id : null
    };
  }

  /**
   * Importa el estado desde guardado
   * @param {object} data - Datos guardados
   */
  fromJSON(data) {
    if (!data) return;

    this.eventHistory = data.eventHistory || [];
    this.lastEventDay = data.lastEventDay || -10;
    this.activeFlags = new Set(data.activeFlags || []);

    // Restaurar evento pendiente si existe
    if (data.pendingEvent) {
      this.pendingEvent = this.getEventById(data.pendingEvent);
    }

    console.log('RandomEventManager: State loaded from save');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.RandomEventManager = RandomEventManager;
}
