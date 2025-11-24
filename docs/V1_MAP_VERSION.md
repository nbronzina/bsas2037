# Red de Aguante - Versión 1.0 (Mapa)

## Descripción

Versión original con mapa explorable 2D y 60 días de gameplay. El jugador explora un mapa donde puede interactuar con NPCs, asignar tareas, y tomar decisiones que afectan los recursos de la comunidad a lo largo de 60 días.

## Tag

`v1.0-mapa`

## Características Principales

### Gameplay
- **Mapa 2D explorable**: Vista top-down con sprites caminando
- **60 días de gameplay**: Campaña completa de 2 meses
- **4 NPCs con sprites**: Valeria, Beto, Yani, Marcos (con movimiento y posiciones)
- **Sistema de tareas asignables**: Asignar tareas a NPCs con duración
- **20 encounters scripted**: Eventos narrativos en días específicos
- **15+ random events**: Eventos procedurales con probabilidades
- **8 endings diferentes**: Basados en recursos finales y decisiones

### Sistemas
- **Resource Manager**: Gestión de 4 recursos (electricidad, agua, legitimidad, autonomía)
- **Time Manager**: Avance de días con decay diario
- **NPC Manager**: NPCs con posiciones, sprites, arcos evolutivos (3 etapas)
- **Task Manager**: Sistema de asignación y completado de tareas
- **Encounter Manager**: Eventos scripted por día
- **Random Event Manager**: Sistema de eventos procedurales
- **Achievement Manager**: 15+ logros desbloqueables
- **Memoria Colectiva**: Sistema de fragmentos narrativos

### Polish & Systems (Phase 3)
- **Tutorial System**: Tutorial de 5 pasos con Valeria
- **Audio System**: Música ambiental + SFX
- **Visual Polish**: Transiciones, animaciones, feedback visual
- **Accessibility**: Alto contraste, tamaños de texto, navegación por teclado, reducir movimiento
- **Performance Optimization**: Object pooling, cleanup, FPS monitoring
- **Test Suite**: 32+ tests unitarios, simulación de 60 días

## Archivos Clave

### Scenes
- `src/scenes/MapScene.js` - Escena principal con mapa explorable
- `src/scenes/ManagementScene.js` - Gestión de tareas y NPCs
- `src/scenes/EncounterScene.js` - Visualización de encounters
- `src/scenes/RandomEventScene.js` - Eventos aleatorios
- `src/scenes/EndGameScene.js` - 8 endings diferentes

### Managers
- `src/managers/NPCManager.js` - NPCs con posiciones y sprites
- `src/managers/TaskManager.js` - Sistema de tareas
- `src/managers/EncounterManager.js` - Encounters scripted
- `src/managers/RandomEventManager.js` - Eventos procedurales
- `src/managers/AchievementManager.js` - Logros
- `src/managers/MemoriaColectivaManager.js` - Fragmentos narrativos

### Components
- `src/components/NPC.js` - Sprite y comportamiento de NPC
- `src/components/AchievementNotification.js` - Notificaciones de logros

### Data
- `data/encounters.json` - 20 encounters scripted
- `data/achievements.json` - 15+ achievements

## Métricas de Complejidad

- **Duración promedio de partida**: 45-90 minutos
- **Sistemas simultáneos**: 8+ managers activos
- **Interacciones posibles**: Mapa + 4 NPCs + tareas + encounters
- **Curva de aprendizaje**: Alta (tutorial de 5 pasos)
- **Archivos de código**: 40+ archivos
- **Líneas de código**: ~8000+ LOC

## Feedback de Playtest

### Positivo
- ✅ Narrativa inmersiva
- ✅ Dilemas morales interesantes
- ✅ Sistema de recursos bien balanceado
- ✅ Múltiples endings dan rejoabilidad

### Negativo
- ❌ **"Muy complejo"** - Demasiados sistemas simultáneos
- ❌ **Partidas muy largas** - 45-90 minutos es mucho
- ❌ **Curva de aprendizaje alta** - Mucho que aprender al inicio
- ❌ **Gestión de tareas confusa** - No queda claro qué hacer
- ❌ **Mapa desorientador** - No siempre claro dónde ir

## Por Qué Se Cambió

El feedback consistente de playtesters indicó que la versión mapa era:
1. **Demasiado compleja** para el público objetivo
2. **Demasiado larga** para sesiones casuales
3. **Poco clara** en sus objetivos inmediatos

Se decidió refactorear a una versión más accesible:
- ❌ Mapa explorable → ✅ Escritorio estático
- ❌ 60 días → ✅ 7 días
- ❌ Tareas asignables → ✅ Documentos/decisiones directas
- ❌ 45-90 min → ✅ 15-25 min

## Cómo Restaurar Esta Versión

```bash
# Volver a esta versión
git checkout v1.0-mapa

# O crear una rama desde este tag
git checkout -b restore-map-version v1.0-mapa
```

## Estado del Tag

- **Commit**: `3e6e898` - Implement Final Testing & QA System (Phase 3.6)
- **Branch**: `claude/implement-game-mvp-01Vp1bGgZc4q19rHgKktSiGK`
- **Fecha**: 2025-11-24
- **Estado**: Completo y funcional con test suite

## Notas de Desarrollo

Esta versión representa ~3 meses de desarrollo y contiene:
- Phase 1: Balance & Analysis
- Phase 2: Content (NPCs, achievements, events, memoria)
- Phase 3: Polish & Systems (Tutorial, Audio, Visual, Accessibility, Performance, Testing)

Todo el trabajo está documentado en commits desde el inicio del proyecto.
