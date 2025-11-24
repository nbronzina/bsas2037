# Sistema de Achievements - Red de Aguante

**Versión:** 1.0
**Fecha:** 2025-11-24
**Total Achievements:** 20
**Categorías:** 5 (Historia, Personajes, Gestión, Decisiones, Secretos)

---

## Filosofía de Diseño

Los achievements deben:
- ✅ **Celebrar decisiones significativas**, no grind
- ✅ **Incentivar exploración** de diferentes paths
- ✅ **Reconocer maestría** en gestión de recursos
- ✅ **Revelar contenido secreto** sin spoilear
- ❌ **NO ser triviales** ("Jugaste 5 minutos")
- ❌ **NO requerir RNG puro** (suerte extrema)

---

## Taxonomía de Achievements

### 📊 Distribución por Tipo

| Tipo | Cantidad | % | Descripción |
|------|----------|---|-------------|
| Historia | 5 | 25% | Endings alcanzados |
| Personajes | 4 | 20% | Arcos de NPCs |
| Gestión | 5 | 25% | Maestría en recursos |
| Decisiones | 4 | 20% | Caminos únicos |
| Secretos | 2 | 10% | Contenido oculto |
| **TOTAL** | **20** | **100%** | |

### 🏅 Distribución por Rareza

| Rareza | Cantidad | % Unlock Esperado |
|--------|----------|-------------------|
| ⭐⭐ Común | 4 | 50-80% jugadores |
| ⭐⭐⭐ Poco común | 8 | 25-40% jugadores |
| ⭐⭐⭐⭐ Raro | 5 | 10-20% jugadores |
| ⭐⭐⭐⭐⭐ Muy raro | 3 | 3-8% jugadores |

---

## Lista Completa de Achievements

### 🏆 CATEGORÍA: HISTORIA (5 achievements)

---

#### Achievement #1: "Red de Aguante"
**ID:** `achievement_sobrevivir_60`
**Título:** "Red de Aguante"
**Descripción:** "Sobreviviste los 60 días. La red sigue en pie."
**Icono:** 🏘️
**Rareza:** ⭐⭐ (Común - ~80% jugadores)
**Puntos:** 10

**Condición de Unlock:**
```javascript
// Al llegar a día 60
if (gameState.timeManager.currentDay === 60) {
  unlockAchievement('achievement_sobrevivir_60');
}
```

**Razón:** Achievement básico que celebra completar el juego. Debe ser alcanzable por casi todos.

---

#### Achievement #2: "Arquitecta del Futuro"
**ID:** `achievement_ending_utopico`
**Título:** "Arquitecta del Futuro"
**Descripción:** "Alcanzaste el ending utópico. Buenos Aires 2037 tiene esperanza."
**Icono:** ✨
**Rareza:** ⭐⭐⭐⭐ (Raro - ~15% jugadores)
**Puntos:** 50

**Condición de Unlock:**
```javascript
// En determineEnding()
if (endingType === 'UTOPICO') {
  unlockAchievement('achievement_ending_utopico');
}
```

**Razón:** Celebra el mejor ending posible, requiere excelencia en gestión.

---

#### Achievement #3: "Contra Viento y Marea"
**ID:** `achievement_ending_resistencia`
**Título:** "Contra Viento y Marea"
**Descripción:** "Aguantaste hasta el final a pesar de todo. La resistencia vale."
**Icono:** 💪
**Rareza:** ⭐⭐⭐ (Poco común - ~30% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
if (endingType === 'RESISTENCIA') {
  unlockAchievement('achievement_ending_resistencia');
}
```

**Razón:** Reconoce el ending de supervivencia digna sin recursos óptimos.

---

#### Achievement #4: "Colectivista"
**ID:** `achievement_ending_colectivo`
**Título:** "Colectivista"
**Descripción:** "Priorizaste autonomía sobre todo. La red decide su destino."
**Icono:** 🤝
**Rareza:** ⭐⭐⭐ (Poco común - ~25% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
if (endingType === 'COLECTIVO') {
  unlockAchievement('achievement_ending_colectivo');
}
```

**Razón:** Celebra el camino de autonomía máxima y autogestión.

---

#### Achievement #5: "Coleccionista de Futuros"
**ID:** `achievement_todos_endings`
**Título:** "Coleccionista de Futuros"
**Descripción:** "Experimentaste todos los endings posibles. Conocés cada futuro de Buenos Aires 2037."
**Icono:** 🎭
**Rareza:** ⭐⭐⭐⭐⭐ (Muy raro - ~5% jugadores)
**Puntos:** 100

**Condición de Unlock:**
```javascript
// Verificar que se han visto los 8 endings en diferentes runs
const endingsSeen = gameState.achievementManager.endingHistory;
if (endingsSeen.length === 8) {
  unlockAchievement('achievement_todos_endings');
}
```

**Razón:** Achievement de completitud máxima, requiere múltiples runs.

---

### 👥 CATEGORÍA: PERSONAJES (4 achievements)

---

#### Achievement #6: "La Voz de Marcos"
**ID:** `achievement_marcos_lider`
**Título:** "La Voz de Marcos"
**Descripción:** "Marcos encontró su voz. Ahora lidera con confianza."
**Icono:** 🎤
**Rareza:** ⭐⭐⭐ (Poco común - ~35% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
// Al final del juego (día 60)
if (gameState.characters.marcos.arc.path === 'lider') {
  unlockAchievement('achievement_marcos_lider');
}
```

**Razón:** Reconoce haber apoyado a Marcos en su encuentro crítico (día 29).

---

#### Achievement #7: "Idealista Porteño"
**ID:** `achievement_beto_idealista`
**Título:** "Idealista Porteño"
**Descripción:** "Beto dejó de ser solo pragmático. Ahora sueña con una red más grande."
**Icono:** 💡
**Rareza:** ⭐⭐⭐ (Poco común - ~40% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
if (gameState.characters.beto.arc.path === 'idealista') {
  unlockAchievement('achievement_beto_idealista');
}
```

**Razón:** Celebra haber apoyado la expansión territorial de Beto (día 30).

---

#### Achievement #8: "El Cuidado es Comunitario"
**ID:** `achievement_yani_comunitaria`
**Título:** "El Cuidado es Comunitario"
**Descripción:** "Yani creó un equipo de salud. Ya no está sola."
**Icono:** ❤️
**Rareza:** ⭐⭐⭐⭐ (Raro - ~20% jugadores)
**Puntos:** 50

**Condición de Unlock:**
```javascript
if (gameState.characters.yani.arc.path === 'comunitaria') {
  unlockAchievement('achievement_yani_comunitaria');
}
```

**Razón:** Path más difícil de Yani (requiere buscar ayuda, no solo descansar).

---

#### Achievement #9: "Familia de Aguante"
**ID:** `achievement_todos_npcs_felices`
**Título:** "Familia de Aguante"
**Descripción:** "Todos los NPCs alcanzaron sus mejores versiones. Beto idealista, Yani balanceada/comunitaria, Marcos líder."
**Icono:** 🌟
**Rareza:** ⭐⭐⭐⭐⭐ (Muy raro - ~8% jugadores)
**Puntos:** 100

**Condición de Unlock:**
```javascript
// Al día 60
const betoOK = gameState.characters.beto.arc.path === 'idealista';
const yaniOK = ['balanceada', 'comunitaria'].includes(gameState.characters.yani.arc.path);
const marcosOK = gameState.characters.marcos.arc.path === 'lider';

if (betoOK && yaniOK && marcosOK) {
  unlockAchievement('achievement_todos_npcs_felices');
}
```

**Razón:** Achievement de maestría narrativa, requiere decisiones perfectas.

---

### 📈 CATEGORÍA: GESTIÓN (5 achievements)

---

#### Achievement #10: "Gestora Experta"
**ID:** `achievement_nunca_critico`
**Título:** "Gestora Experta"
**Descripción:** "Nunca dejaste que ningún recurso cayera a nivel crítico (<20%)."
**Icono:** 📊
**Rareza:** ⭐⭐⭐⭐ (Raro - ~15% jugadores)
**Puntos:** 50

**Condición de Unlock:**
```javascript
// Tracking durante toda la partida
gameState.achievementManager.trackResourceMinimums();

// Al día 60, verificar
if (allResourcesNeverBelowCritical()) {
  unlockAchievement('achievement_nunca_critico');
}
```

**Razón:** Reconoce excelencia continua en gestión de recursos.

---

#### Achievement #11: "La Abundancia es Posible"
**ID:** `achievement_todos_recursos_80`
**Título:** "La Abundancia es Posible"
**Descripción:** "Terminaste con todos los recursos por encima de 80%. La red prospera."
**Icono:** 🌈
**Rareza:** ⭐⭐⭐⭐⭐ (Muy raro - ~5% jugadores)
**Puntos:** 100

**Condición de Unlock:**
```javascript
// Al día 60
const recursos = gameState.resourceManager.getAll();
const todosAltos = Object.values(recursos).every(r => r >= 80);

if (todosAltos) {
  unlockAchievement('achievement_todos_recursos_80');
}
```

**Razón:** Achievement de perfección, extremadamente difícil.

---

#### Achievement #12: "Asambleísta Perfecta"
**ID:** `achievement_todas_asambleas`
**Título:** "Asambleísta Perfecta"
**Descripción:** "Participaste en todas las asambleas. La democracia directa funciona."
**Icono:** 🗣️
**Rareza:** ⭐⭐ (Común - ~60% jugadores)
**Puntos:** 10

**Condición de Unlock:**
```javascript
// Tracking de encounters de asambleas
const asambleasTotal = 6; // Cantidad de asambleas en el juego
if (gameState.achievementManager.asambleasAsistidas === asambleasTotal) {
  unlockAchievement('achievement_todas_asambleas');
}
```

**Razón:** Incentiva participación en contenido narrativo clave.

---

#### Achievement #13: "Economista Radical"
**ID:** `achievement_nunca_deficit`
**Título:** "Economista Radical"
**Descripción:** "Nunca tuviste déficit de créditos. La economía solidaria es sustentable."
**Icono:** 💰
**Rareza:** ⭐⭐⭐ (Poco común - ~30% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
// Tracking continuo
gameState.achievementManager.trackCredits();

// Al día 60
if (neverBelowZeroCredits()) {
  unlockAchievement('achievement_nunca_deficit');
}
```

**Razón:** Reconoce gestión económica exitosa a lo largo del juego.

---

#### Achievement #14: "Polivalente"
**ID:** `achievement_todas_tareas_usadas`
**Título:** "Polivalente"
**Descripción:** "Usaste todas las tareas disponibles al menos una vez. Conocés todas las herramientas."
**Icono:** 🛠️
**Rareza:** ⭐⭐ (Común - ~50% jugadores)
**Puntos:** 10

**Condición de Unlock:**
```javascript
// Tracking de tareas asignadas
const tareasTotal = 6; // Cantidad de tareas en tasks.json
if (gameState.achievementManager.tareasUsadas.size === tareasTotal) {
  unlockAchievement('achievement_todas_tareas_usadas');
}
```

**Razón:** Incentiva explorar todas las mecánicas de gestión.

---

### 🔀 CATEGORÍA: DECISIONES (4 achievements)

---

#### Achievement #15: "Territorio Libre"
**ID:** `achievement_autonomia_maxima`
**Título:** "Territorio Libre"
**Descripción:** "Rechazaste toda ayuda externa. La red es completamente autónoma."
**Icono:** 🏴
**Rareza:** ⭐⭐⭐⭐ (Raro - ~12% jugadores)
**Puntos:** 50

**Condición de Unlock:**
```javascript
// Verificar flags específicos
const rechazoDonacion = gameState.flags.includes('rechazo_donacion');
const rechazoMunicipal = gameState.flags.includes('rechazo_municipal');
const autonomiaFinal = gameState.resourceManager.get('autonomia') >= 80;

if (rechazoDonacion && rechazoMunicipal && autonomiaFinal) {
  unlockAchievement('achievement_autonomia_maxima');
}
```

**Razón:** Celebra path de independencia total, requiere sacrificios.

---

#### Achievement #16: "Diplomática"
**ID:** `achievement_todas_alianzas`
**Título:** "Diplomática"
**Descripción:** "Estableciste todas las alianzas posibles. La red tiene muchos amigos."
**Icono:** 🤲
**Rareza:** ⭐⭐⭐ (Poco común - ~25% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
// Verificar flags de alianzas
const alianzas = [
  'alianza_universidad',
  'alianza_sindicato',
  'acuerdo_municipal',
  'red_barrios_conectada'
];

const todasActivas = alianzas.every(flag => gameState.flags.includes(flag));
if (todasActivas) {
  unlockAchievement('achievement_todas_alianzas');
}
```

**Razón:** Path opuesto a autonomía máxima, requiere cooperación constante.

---

#### Achievement #17: "La Crisis Nos Fortaleció"
**ID:** `achievement_crisis_sin_evacuacion`
**Título:** "La Crisis Nos Fortaleció"
**Descripción:** "Sobreviviste la crisis final sin evacuar. La comunidad se mantuvo unida."
**Icono:** 🔥
**Rareza:** ⭐⭐⭐⭐ (Raro - ~18% jugadores)
**Puntos:** 50

**Condición de Unlock:**
```javascript
// En crisis_final encounter (día 55)
if (opcionElegida !== 'evacuar' && gameState.timeManager.currentDay === 60) {
  unlockAchievement('achievement_crisis_sin_evacuacion');
}
```

**Razón:** Reconoce valentía y preparación para enfrentar la peor crisis.

---

#### Achievement #18: "Todas las Voces"
**ID:** `achievement_consultar_todos_npcs`
**Título:** "Todas las Voces"
**Descripción:** "En al menos una asamblea crítica, consultaste la opinión de todos los NPCs antes de decidir."
**Icono:** 🗨️
**Rareza:** ⭐⭐⭐ (Poco común - ~35% jugadores)
**Puntos:** 25

**Condición de Unlock:**
```javascript
// En asambleas con múltiples NPCs
// Ejemplo: primera_asamblea, asamblea_expansion, decision_evacuacion
if (consultedAllNPCsInAssembly()) {
  unlockAchievement('achievement_consultar_todos_npcs');
}
```

**Razón:** Incentiva explorar todos los diálogos y perspectivas.

---

### 🔍 CATEGORÍA: SECRETOS (2 achievements)

---

#### Achievement #19: "Códigos Ocultos"
**ID:** `achievement_easter_egg`
**Título:** "Códigos Ocultos"
**Descripción:** "Encontraste el easter egg secreto. ¿Qué más hay escondido?"
**Icono:** 🥚
**Rareza:** ⭐⭐⭐⭐⭐ (Muy raro - ~3% jugadores)
**Puntos:** 100

**Condición de Unlock:**
```javascript
// Easter egg específico (a definir en implementación)
// Ejemplo: Clickear cierto objeto X veces, o secuencia de teclas
if (easterEggTriggered()) {
  unlockAchievement('achievement_easter_egg');
}
```

**Razón:** Recompensa a jugadores curiosos que exploran a fondo.

---

#### Achievement #20: "Memoria Colectiva"
**ID:** `achievement_memoria_completa`
**Título:** "Memoria Colectiva"
**Descripción:** "Desbloqueaste todos los fragmentos de memoria del barrio. La historia vive."
**Icono:** 📖
**Rareza:** ⭐⭐⭐⭐ (Raro - ~10% jugadores)
**Puntos:** 50

**Condición de Unlock:**
```javascript
// Cuando se implemente sistema de memoria colectiva (tarea 2.5)
if (gameState.memoriaColectiva.fragmentosDesbloqueados === totalFragmentos) {
  unlockAchievement('achievement_memoria_completa');
}
```

**Razón:** Incentiva explorar sistema de memoria colectiva (futura implementación).

---

## Resumen de Achievements

### Por Rareza

| Rareza | Cantidad | % Esperado Unlock | Puntos Totales |
|--------|----------|-------------------|----------------|
| ⭐⭐ Común | 4 | 50-80% jugadores | 40 pts |
| ⭐⭐⭐ Poco común | 8 | 25-40% jugadores | 200 pts |
| ⭐⭐⭐⭐ Raro | 5 | 10-20% jugadores | 250 pts |
| ⭐⭐⭐⭐⭐ Muy raro | 3 | 3-8% jugadores | 300 pts |
| **TOTAL** | **20** | - | **790 pts** |

### Por Categoría

| Categoría | Achievements | Puntos Totales |
|-----------|--------------|----------------|
| 🏆 Historia | 5 | 210 pts |
| 👥 Personajes | 4 | 200 pts |
| 📈 Gestión | 5 | 195 pts |
| 🔀 Decisiones | 4 | 150 pts |
| 🔍 Secretos | 2 | 150 pts |
| **TOTAL** | **20** | **790 pts** |

---

## Arquitectura Técnica del Sistema

### Estructura de Datos

**gameState.achievements:**
```javascript
achievements: {
  // Achievement data
  list: [
    {
      id: 'achievement_sobrevivir_60',
      title: 'Red de Aguante',
      description: 'Sobreviviste los 60 días...',
      icon: '🏘️',
      rarity: 2, // 1-5 estrellas
      unlocked: false,
      unlockedAt: null, // timestamp
      category: 'historia',
      points: 10
    },
    // ... resto de achievements
  ],

  // Tracking data
  tracking: {
    // Para achievements que requieren tracking continuo
    resourceMinimums: {
      electricidad: 100,
      agua: 100,
      legitimidad: 100,
      autonomia: 100,
      creditos: 2000
    },
    creditsNeverNegative: true,
    asambleasAsistidas: 0,
    tareasUsadas: new Set(),
    endingHistory: [], // Endings vistos en runs previos
    npcConsultedInAssembly: {}
  },

  // Stats
  totalUnlocked: 0,
  totalPoints: 0,
  lastUnlocked: null
}
```

### Manager Class Structure

**src/managers/AchievementManager.js:**

```javascript
class AchievementManager {
  constructor()
  initializeAchievements()

  // Tracking methods
  trackResourceLevel(resource, value)
  trackCredits(value)
  trackTaskUsed(taskId)
  trackAssemblyAttended()
  trackNPCConsulted(encounterId, npcName)
  addEndingToHistory(endingType)

  // Unlock methods
  unlock(achievementId)
  queueNotification(achievement)

  // Check methods
  checkDay60Achievements()
  checkNPCAchievements()
  checkEndingAchievement(endingType)
  checkDecisionAchievements()

  // Persistence
  toJSON()
  fromJSON(data)

  // Stats
  getStats()
}
```

### Integration Points

**Dónde verificar achievements:**

1. **TimeManager.advanceDay()** - Día 60, tracking continuo de recursos
2. **EncounterScene.selectOption()** - Después de decisiones importantes
3. **Ending determination** - Al determinar ending final
4. **ManagementScene.assignTask()** - Al asignar tareas a NPCs
5. **SaveManager.save/load()** - Persistencia de achievements

---

## UI/UX Design

### Notification System

**Toast-style notifications** cuando se desbloquea un achievement:
- Slide in desde la derecha
- Mostrar por 4 segundos
- Slide out hacia la derecha
- Queue system para múltiples achievements

**Contenido de notificación:**
- 🏆 "Logro Desbloqueado"
- Icono del achievement
- Título del achievement
- Puntos ganados

### Achievements Screen

**Layout:**
- Header con título y stats globales (X/20 unlocked, Y/790 pts)
- Agrupado por categorías
- Cada achievement muestra:
  - Icono (🔒 si locked)
  - Título (??? si locked)
  - Descripción (texto genérico si locked)
  - Rareza (estrellas)
  - Puntos

**Navegación:**
- Accesible desde menú principal
- Botón "← Volver" para salir

---

## Balancing Notes

### Dificultad vs Engagement

Los achievements están balanceados para:
- **80% jugadores** desbloquean al menos 5-8 achievements (experiencia base)
- **50% jugadores** desbloquean 10-12 achievements (jugadores comprometidos)
- **20% jugadores** desbloquean 15-17 achievements (jugadores expertos)
- **5% jugadores** desbloquean todos 20 (completionistas)

### Evitar Frustración

- Achievements NO impiden acceso a contenido
- Achievements NO requieren RNG extremo
- Achievements de gestión son difíciles pero alcanzables con planificación
- Achievements de historia incentivan rejugabilidad sin ser punitivos

---

## Future Expansions

### Posibles Adiciones (Fase 2)

1. **Logro Platino** - Desbloquear todos los 20 achievements base
2. **Achievements de Velocidad** - Completar el juego en X días
3. **Achievements de Desafío** - Completar con restricciones (ej: sin usar créditos)
4. **Achievements Conmemorativos** - Por eventos especiales o actualizaciones
5. **Steam Integration** - Si el juego se publica en Steam

### Estadísticas Avanzadas

- Total de horas jugadas
- Runs completados
- Ending más común del jugador
- NPC favorito (más consultado)

---

## Testing Checklist

- [ ] Todos los achievements se pueden desbloquear
- [ ] No hay achievements duplicados posibles
- [ ] Notificaciones aparecen correctamente
- [ ] Pantalla de achievements muestra data correcta
- [ ] Save/load persiste achievements
- [ ] Tracking funciona durante toda la partida
- [ ] Stats (X/20, puntos) son correctos
- [ ] Achievements locked muestran ??? correctamente
- [ ] Rejugabilidad: endingHistory acumula correctamente

---

**Próximos Pasos:**
1. Implementar AchievementManager.js
2. Crear UI components (notificaciones + pantalla)
3. Integrar con sistemas existentes
4. Testing exhaustivo
5. Balance adjustments si es necesario

**Total Estimated Development Time:** 5 hours
**Priority:** ALTA (aumenta retención y rejugabilidad significativamente)
