# Red de Aguante

## Prototipo de Investigación

**Desarrollado por**: LAB de Mundanidad Forzada
**En colaboración con**: Heated Studio
**Contexto**: Buenos Aires, escenario especulativo

### Sobre el Proyecto

"Red de Aguante" es un prototipo interactivo de design fiction que explora futuros posibles desde contextos latinoamericanos. No predice ni prescribe: observa y sistematiza prácticas de autogestión que ya existen en barrios populares argentinos.

**Metodología**: Mundanidad Forzada
- Economías informales como punto de partida
- Restricciones de recursos como material de diseño
- Adaptación cotidiana como metodología
- Futuros desde el sur global, no desde la abundancia del norte

Este NO es gamificación de la pobreza. ES una herramienta de investigación sobre autogestión comunitaria, redes solidarias y supervivencia en condiciones de precariedad estructural.

## Estado del Proyecto: ✅ COMPLETO

### Fases Completadas (8/8)
- ✅ **FASE 0**: Setup básico
- ✅ **FASE 1**: Movimiento básico
- ✅ **FASE 2**: Sistema de diálogos
- ✅ **FASE 3**: Sistema de recursos
- ✅ **FASE 4**: Encuentros/Asambleas
- ✅ **FASE 5**: Sistema de tiempo
- ✅ **FASE 6**: Gestión de base
- ✅ **FASE 7**: Integración MVP
- ✅ **FASE 8**: Sistema de guardado

### Características Implementadas
- **Menú Principal**: Diseño austero inspirado en documentos de campo
- **Introducción Narrativa**: 5 pantallas explicando metodología y contexto
- **Pantalla INFO**: Contexto completo del proyecto y créditos
- **Mapa**: Villa Soldati (50x50 tiles) con colisiones y edificios
- **Personajes**: 3 personajes jugables (Valeria, Beto, Yani) con sistema de tareas
- **Recursos**: 5 tipos (créditos, electricidad, agua, legitimidad, autonomía)
- **Infraestructura**: 3 elementos con desgaste (Transformador A, Transformador B, Perforación)
- **Encuentros**: 9 encuentros narrativos distribuidos en 60 días
- **Mini-Dungeon**: "Sudestada Chica" con 3 fases consecutivas
- **Sistema de Tiempo**: 60 días con eventos programados y desgaste
- **Gestión de Base**: Asignación de tareas a personajes, avance de tiempo
- **Victoria/Derrota**: 4 tipos de victoria, 4 causas de derrota
- **Guardado**: Auto-guardado cada 60s, guardado manual (F5)
- **Audio 8-bit**: Música procedural y efectos de sonido generados con Web Audio API

### Timeline Narrativa (60 días)

**Días 1-15: Introducción**
- Día 3: Primera Asamblea (decisión sobre transformador)
- Día 7: Encuentro con Yani (dispensario)
- Día 10: Crisis Tormenta
- Día 15: Segunda Asamblea (alianza regional)

**Días 16-35: Consolidación**
- Día 20: Crisis de Agua (sequía)
- Día 28: Propuesta de Expansión territorial

**Días 36-50: Mini-Dungeon**
- Día 38: Sudestada Chica - Fase 1 (Alerta)
- Día 39: Sudestada Chica - Fase 2 (Impacto)
- Día 40: Sudestada Chica - Fase 3 (Reconstrucción)

**Días 51-60: Crisis Final**
- Día 55: La Gran Sudestada (encuentro final)
- Día 60: Victoria o derrota

### Cómo Usar el Prototipo
1. Abrir `index.html` en navegador moderno
2. En el menú principal:
   - **INICIAR**: Nueva sesión (borra la anterior)
   - **CONTINUAR**: Retomar sesión guardada (si existe)
   - **INFO**: Ver contexto del proyecto
3. Leer la introducción narrativa (5 pantallas)
4. Explorar el mapa, interactuar con NPCs, gestionar recursos
5. **TAB**: Abrir pantalla de gestión de base
6. Asignar tareas, avanzar tiempo, responder a crisis
7. Mantener el sistema funcionando 60 días

## Controles

### Exploración (MapScene)
- **WASD** o **Flechas**: Mover a Valeria
- **ENTER**: Interactuar con NPC
- **TAB**: Abrir pantalla de Gestión de Base

### Gestión de Base (ManagementScene)
- **Click en personaje**: Asignar tarea
- **Click en tarea**: Seleccionar tarea para personaje
- **Avanzar 1 Día**: Procesar tareas y avanzar tiempo
- **Volver al Mapa**: Regresar a exploración

### Diálogos
- **ENTER**: Avanzar texto

### Encuentros
- **Click en opción** o **1, 2, 3, 4**: Elegir opción
- **ENTER**: Confirmar resultado y continuar

### Sistema de Guardado
- **Auto-guardado**: Cada 60 segundos
- **F5**: Guardar manualmente
- **F9**: Cargar partida guardada
- Al iniciar: Carga automática si existe partida

### Audio
- **M**: Mutear/Desmutear audio
- **Click en botón 🔊**: Toggle mute
- Música dinámica según escena (Mapa, Gestión, Encuentros)
- Efectos de sonido 8-bit para interacciones

### Controles de Debug
- **T**: Avanzar 1 día (triggea eventos programados)
- **E**: Lanzar Primera Asamblea directamente
- **1/2**: ±500 créditos
- **3/4**: ±10% electricidad

## Condiciones de Victoria/Derrota

### Victoria (llegar al día 60)
1. **Victoria por Autonomía**: Red autónoma aguanta la Gran Sudestada (req: 50% autonomía, 60% electricidad)
2. **Victoria Colectiva**: Red cooperativa territorial sobrevive (req: 60% legitimidad)
3. **Victoria por Cooperativas**: Reconstrucción solidaria exitosa
4. **Victoria por Supervivencia**: Recursos básicos mantenidos (40% electricidad, 40% agua, 30% legitimidad)

### Derrota (antes del día 60)
1. **Colapso Energético**: Electricidad llega a 0%
2. **Crisis Hídrica**: Agua llega a 0%
3. **Pérdida de Legitimidad**: Legitimidad llega a 0%
4. **Recursos Críticos**: Llegar al día 60 con recursos muy bajos

## Instalación

1. Clonar el repositorio
2. Abrir `index.html` en un navegador moderno
3. No requiere servidor web ni build

## Stack Técnico
- **Framework**: Phaser 3.80.1
- **Lenguaje**: JavaScript ES6+ (vanilla, sin transpilación)
- **Guardado**: localStorage API
- **No dependencias**: Sin npm, webpack, o build tools

## Estructura del Proyecto
```
/red-de-aguante
  /data
    dialogues.json      - Diálogos de NPCs
    encounters.json     - 9 encuentros narrativos
    tasks.json          - 6 tareas asignables
  /src
    /managers
      ResourceManager.js   - Sistema de 5 recursos
      TimeManager.js       - 60 días + eventos programados
      SaveManager.js       - Guardado en localStorage
    /scenes
      MapScene.js          - Exploración 50x50 tiles
      EncounterScene.js    - Sistema de decisiones
      ManagementScene.js   - Gestión de base
      EndGameScene.js      - Pantallas de victoria/derrota
    /utils
      Constants.js         - Configuración y colores
      Helpers.js           - Funciones auxiliares
    main.js                - Entry point + gameState
  index.html             - HTML base
  style.css              - Estilos minimalistas
  README.md              - Esta documentación
```

## Mecánicas Principales

### Recursos (0-100)
- **Créditos**: Dinero de la cooperativa (sin límite superior)
- **Electricidad**: Capacidad de la red (%)
- **Agua**: Capacidad hídrica (%)
- **Legitimidad**: Confianza popular (%)
- **Autonomía**: Independencia territorial (%)

### Infraestructura (0-100)
- **Transformador A**: 90% inicial, desgaste día 32
- **Transformador B**: 40% inicial, desgaste día 5
- **Perforación**: 100% inicial, desgaste día 22

### Tareas (6 tipos)
- **Reparar Transformador B**: 2 días, -1200 créditos, +30% salud
- **Buscar Materiales**: 3 días, +800 créditos
- **Reunión Vecinal**: 1 día, +15% legitimidad
- **Mantenimiento Red**: 2 días, -500 créditos, +10% electricidad
- **Reparar Perforación**: 3 días, -1500 créditos, +20% agua
- **Descansar**: 1 día, +5% legitimidad

## Créditos
- **Diseño y Desarrollo**: Claude (Anthropic) + Usuario
- **Framework**: Phaser 3 (https://phaser.io)
- **Concepto**: RPG de gestión territorial cooperativa

## Próximos Pasos (Post-MVP)
- [ ] Arte real (reemplazar placeholders)
- [ ] Música y SFX
- [ ] Más encuentros y eventos
- [ ] Sistema de logros
- [ ] Modo difícil/fácil
- [ ] Localización EN/ES

## Licencia
MIT (pendiente de confirmación)
