# Sistema de Memoria Colectiva - Red de Aguante

**Versión**: 1.0
**Fecha**: 2025-11-24
**Prioridad**: MEDIA-ALTA

---

## Concepto

La **Memoria Colectiva** es un "archivo comunitario" que registra automáticamente eventos significativos durante los 60 días del juego. Funciona como:

- **Narrativo:** Cuenta la historia del barrio desde la perspectiva comunitaria
- **Consultable:** Los jugadores pueden ver la cronología en cualquier momento
- **Influencial:** Una memoria rica mejora endings (bonus narrativo)
- **Emocional:** Crea sentido de legado y permanencia

**Inspiración:**
- *What Remains of Edith Finch* (memoria familiar)
- *80 Days* (diario de viaje)
- *Mass Effect* (codex/archivos)

---

## Tipos de Fragmentos de Memoria

### 📊 Distribución Esperada

| Tipo | Activador | Cantidad Esperada |
|------|-----------|-------------------|
| **Hitos Fijos** | Días específicos (1, 30, 60) | 3 |
| **Decisiones Críticas** | Encounters importantes | 8-12 |
| **Arcos NPCs** | Progresión de personajes | 6-9 |
| **Crisis Superadas** | Resolver crisis exitosamente | 4-8 |
| **Logros Comunitarios** | Hitos de recursos | 2-5 |
| **Eventos Aleatorios** | Random events significativos | 2-4 |

**Total esperado por run:** 25-41 fragmentos

---

## Estructura de Fragmento

```javascript
{
  id: 'memoria_primer_dia',
  day: 1,
  title: 'El Primer Día',
  category: 'hito', // hito, decision, npc, crisis, logro, evento
  icon: '🌅',
  shortText: 'Red de Aguante comienza sus operaciones.',
  longText: 'Hoy es el día 1. El barrio se organiza por primera vez...',
  narrator: 'colectiva', // colectiva, npc_name
  importance: 'alta', // baja, media, alta
  unlocked: true,
  unlockedAt: timestamp
}
```

---

## Lista Completa de Fragmentos

### 🌟 HITOS FIJOS (3 fragmentos)

Estos se desbloquean automáticamente en días específicos.

#### Fragmento #1: "El Primer Día"
```javascript
{
  id: 'memoria_primer_dia',
  day: 1,
  title: 'El Primer Día',
  category: 'hito',
  icon: '🌅',
  shortText: 'Red de Aguante comienza sus operaciones.',
  longText: 'Hoy es el día 1. El barrio se organiza por primera vez como red autogestionada. Valeria convoca la primera asamblea. Hay esperanza, pero también incertidumbre. Nadie sabe si esto funcionará, pero todos están dispuestos a intentarlo.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: true
}
```

#### Fragmento #2: "Mitad del Camino"
```javascript
{
  id: 'memoria_dia_30',
  day: 30,
  title: 'Mitad del Camino',
  category: 'hito',
  icon: '🏘️',
  shortText: '30 días. La red sigue en pie.',
  longText: 'Han pasado 30 días desde que empezamos. El barrio cambió. Ya no somos vecinos que se saludan por compromiso. Somos una comunidad que se cuida. Los desafíos siguen, pero también la convicción de que este camino vale la pena.',
  narrator: 'colectiva',
  importance: 'media',
  autoUnlock: true
}
```

#### Fragmento #3: "El Último Día"
```javascript
{
  id: 'memoria_dia_60',
  day: 60,
  title: 'El Último Día',
  category: 'hito',
  icon: '🎯',
  shortText: '60 días. Lo logramos.',
  longText: 'Llegamos al día 60. Red de Aguante sobrevivió. Esta memoria colectiva es el testimonio de todo lo que construimos, decidimos y superamos juntos. Cada fragmento aquí es parte de nuestra historia. Una historia que ahora pertenece al barrio para siempre.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: true
}
```

---

### 🎯 DECISIONES CRÍTICAS (8-12 fragmentos dinámicos)

Estos se generan automáticamente cuando se completan encounters con `createMemory: true`.

**Encounters que deben crear memoria:**
- `primera_asamblea` (día 3)
- `inspeccion_municipal` (día 25)
- `donacion_externa` (día 22)
- `decision_expansion` (día 28)
- `crisis_final` (día 55)
- `sudestada_chica_fase3` (día 40)

**Formato dinámico:**
```javascript
{
  id: `memoria_${encounterId}`,
  day: gameState.timeManager.currentDay,
  title: encounter.title,
  category: 'decision',
  icon: '⚖️',
  shortText: encounter.memoryShort || `Decisión tomada: ${encounter.title}`,
  longText: encounter.memoryLong || encounter.dialogue.substring(0, 200) + '...',
  narrator: 'colectiva',
  importance: encounter.memoryImportance || 'media'
}
```

---

### 👥 ARCOS NPCs (6-9 fragmentos)

Se generan cuando NPCs alcanzan hitos importantes en sus arcos narrativos.

#### Fragmento #4: "Beto Propone Expandir"
```javascript
{
  id: 'memoria_beto_expansion',
  day: 30,
  title: 'Beto Propone Expandir',
  category: 'npc',
  icon: '⚡',
  shortText: 'Beto ya no es solo el técnico.',
  longText: 'Beto, el electricista pragmático que solo hablaba de cables, hoy propuso expandir la red a otros barrios. Fue sorprendente verlo pensar más allá de la supervivencia inmediata. El barrio debatió seriamente la propuesta.',
  narrator: 'beto',
  importance: 'media',
  autoUnlock: false
}
```

#### Fragmento #5: "Yani al Límite"
```javascript
{
  id: 'memoria_yani_crisis',
  day: 35,
  title: 'Yani al Límite',
  category: 'npc',
  icon: '💊',
  shortText: 'Yani confesó su agotamiento.',
  longText: 'Yani, que siempre cuidaba a todos, admitió que no podía más. Ese día aprendimos que cuidar también significa dejar que te cuiden. La comunidad respondió.',
  narrator: 'yani',
  importance: 'alta',
  autoUnlock: false
}
```

#### Fragmento #6: "Marcos Encuentra su Voz"
```javascript
{
  id: 'memoria_marcos_voz',
  day: 29,
  title: 'Marcos Encuentra su Voz',
  category: 'npc',
  icon: '💧',
  shortText: 'Marcos habló por primera vez en asamblea.',
  longText: 'Marcos, que siempre respondía con monosílabos, propuso una mejora técnica en asamblea. Algunos se sorprendieron tanto que no supieron qué decir. Fue el comienzo de una transformación.',
  narrator: 'marcos',
  importance: 'media',
  autoUnlock: false
}
```

**Fragmentos adicionales por paths de NPCs:**
- `memoria_beto_idealista` / `memoria_beto_pragmatico`
- `memoria_yani_balanceada` / `memoria_yani_burnout` / `memoria_yani_comunitaria`
- `memoria_marcos_lider` / `memoria_marcos_retraido`

---

### 🔥 CRISIS SUPERADAS (4-8 fragmentos dinámicos)

Se crean automáticamente cuando se supera una crisis de recursos.

#### Fragmento #7: "Crisis Eléctrica Superada"
```javascript
{
  id: 'memoria_crisis_electricidad',
  day: null, // Se asigna cuando ocurre
  title: 'Crisis Eléctrica Superada',
  category: 'crisis',
  icon: '⚡',
  shortText: 'Sobrevivimos el apagón crítico.',
  longText: 'La electricidad cayó a niveles peligrosos. Beto trabajó sin dormir. El barrio se organizó. Al día siguiente, el sistema volvió a funcionar. Aprendimos que podemos superar crisis juntos.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: false
}
```

**Trigger:** Electricidad <30% → >50%

#### Fragmento #8: "Crisis Hídrica Superada"
```javascript
{
  id: 'memoria_crisis_agua',
  day: null,
  title: 'Crisis Hídrica Superada',
  category: 'crisis',
  icon: '💧',
  shortText: 'El agua volvió a fluir.',
  longText: 'Quedamos sin agua potable. Marcos improvisó soluciones de emergencia. Fue difícil, pero nadie se enfermó. La red probó su resiliencia.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: false
}
```

**Trigger:** Agua <20% → >40%

#### Fragmento #9: "Confianza Restaurada"
```javascript
{
  id: 'memoria_crisis_legitimidad',
  day: null,
  title: 'Confianza Restaurada',
  category: 'crisis',
  icon: '🤝',
  shortText: 'La comunidad volvió a confiar.',
  longText: 'La confianza en la red cayó peligrosamente. Hubo cuestionamientos, críticas, dudas. Pero escuchamos, respondimos, y la comunidad decidió seguir creyendo en este proyecto.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: false
}
```

**Trigger:** Legitimidad <25% → >50%

---

### 🏆 LOGROS COMUNITARIOS (2-5 fragmentos)

Celebran hitos de recursos alcanzados.

#### Fragmento #10: "Autonomía Plena"
```javascript
{
  id: 'memoria_autonomia_80',
  day: null,
  title: 'Autonomía Plena',
  category: 'logro',
  icon: '🏴',
  shortText: 'La red es verdaderamente autónoma.',
  longText: 'Hoy alcanzamos 80% de autonomía. Ya no dependemos de nadie externo para funcionar. Este es el sueño que teníamos al principio. Lo hicimos realidad.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: false
}
```

**Trigger:** Autonomía ≥ 80%

#### Fragmento #11: "Abundancia de Recursos"
```javascript
{
  id: 'memoria_todos_recursos_70',
  day: null,
  title: 'Abundancia de Recursos',
  category: 'logro',
  icon: '🌈',
  shortText: 'Por primera vez, todo está bien.',
  longText: 'Electricidad, agua, legitimidad, autonomía, créditos. Todo por encima de 70%. No es solo supervivencia. Es prosperidad comunitaria. Es posible vivir bien sin el sistema tradicional.',
  narrator: 'colectiva',
  importance: 'alta',
  autoUnlock: false
}
```

**Trigger:** Todos los recursos >70% simultáneamente

#### Fragmento #12: "Primera Semana Completa"
```javascript
{
  id: 'memoria_primera_semana',
  day: 7,
  title: 'Primera Semana Completa',
  category: 'logro',
  icon: '📅',
  shortText: 'Sobrevivimos la primera semana.',
  longText: 'Siete días de autogestión. Al principio parecían muchos. Ahora solo son el comienzo. La red está encontrando su ritmo.',
  narrator: 'colectiva',
  importance: 'baja',
  autoUnlock: true
}
```

---

### 🎲 EVENTOS ALEATORIOS (2-4 fragmentos dinámicos)

Eventos aleatorios importantes pueden crear fragmentos de memoria.

**Eventos que deben crear memoria:**
- `evento_periodista_cobertura` (si se acepta cobertura completa)
- `evento_donacion_inesperada`
- `evento_aniversario_barrio`
- `evento_mural_ninos` (si se completa con materiales de calidad)

**Formato:**
```javascript
{
  id: `memoria_evento_${eventId}`,
  day: currentDay,
  title: event.title,
  category: 'evento',
  icon: event.icon,
  shortText: event.memoryShort,
  longText: event.memoryLong,
  narrator: 'colectiva',
  importance: 'media'
}
```

---

## Sistema de Puntuación (Memoria Score)

La riqueza de la memoria se calcula con un sistema de puntos:

```javascript
const points = {
  alta: 3,
  media: 2,
  baja: 1
};

memoriaScore = fragmentos
  .filter(f => f.unlocked)
  .reduce((sum, f) => sum + points[f.importance], 0);
```

**Niveles de memoria:**
- **Memoria Rica**: Score > 80 puntos
- **Memoria Parcial**: Score 40-80 puntos
- **Memoria Escasa**: Score < 40 puntos

---

## Influencia en Endings

El sistema NO cambia el tipo de ending, pero **enriquece la narrativa** del ending final.

```javascript
function getEndingBonus() {
  const stats = gameState.memoriaColectiva.getStats();

  if (stats.memoriaScore > 80) {
    return {
      level: 'rica',
      text: '\n\nLa historia de estos 60 días quedó registrada en detalle. Cada decisión, cada crisis superada, cada logro comunitario. El archivo es testimonio de lo que construimos. Futuras generaciones sabrán cómo fue posible.'
    };
  } else if (stats.memoriaScore > 40) {
    return {
      level: 'parcial',
      text: '\n\nAlgunos momentos importantes quedaron registrados. La memoria del barrio preserva lo esencial, aunque muchos detalles se perdieron en el día a día.'
    };
  } else {
    return {
      level: 'escasa',
      text: ''
    };
  }
}
```

---

## Achievement: "Cronista del Barrio"

```javascript
{
  id: 'achievement_memoria_completa',
  title: 'Cronista del Barrio',
  description: 'Documentaste cada momento importante de Red de Aguante. La memoria colectiva está completa.',
  icon: '📖',
  rarity: 5,
  category: 'secretos',
  points: 100,
  condition: 'Desbloquear ≥90% de fragmentos disponibles'
}
```

---

## Arquitectura Técnica

### Manager Class: MemoriaColectivaManager

**Responsabilidades:**
- Almacenar fragmentos (fijos + dinámicos)
- Desbloquear fragmentos cuando se cumplen condiciones
- Crear fragmentos dinámicos
- Verificar logros diarios y de recursos
- Detectar crisis resueltas
- Calcular stats y score
- Persistir estado

**Métodos principales:**
```javascript
class MemoriaColectivaManager {
  initializeFragments()              // Carga fragmentos fijos
  addFragment(fragmentData)          // Agrega fragmento a la lista
  unlockFragment(fragmentId)         // Desbloquea fragmento existente
  createDynamicFragment(baseId, data) // Crea y unlockea fragmento nuevo
  checkDailyUnlocks(currentDay)      // Verifica unlocks automáticos por día
  checkResourceMilestones()          // Verifica logros de recursos
  checkCrisisResolved(resource, prev, curr) // Detecta crisis superadas
  getAllFragments()                  // Obtiene fragmentos desbloqueados
  getFragmentById(id)                // Obtiene fragmento específico
  getStats()                         // Calcula estadísticas
  getEndingBonus()                   // Obtiene bonus narrativo
  toJSON() / fromJSON()              // Persistencia
}
```

### Integration Points

**1. TimeManager.advanceDay():**
```javascript
// Check daily unlocks
gameState.memoriaColectiva.checkDailyUnlocks(this.currentDay);

// Check resource milestones
gameState.memoriaColectiva.checkResourceMilestones();
```

**2. ResourceManager.set():**
```javascript
const previousValue = this.resources[resource];
// ... actualizar recurso ...

// Check crisis resolved
gameState.memoriaColectiva.checkCrisisResolved(
  resource,
  previousValue,
  this.resources[resource]
);
```

**3. EncounterScene.applyConsequences():**
```javascript
// Create memory if encounter has it
if (this.encounter.createMemory) {
  gameState.memoriaColectiva.createDynamicFragment(
    this.encounter.id,
    {
      title: this.encounter.title,
      shortText: this.encounter.memoryShort,
      longText: this.encounter.memoryLong,
      category: 'decision',
      importance: this.encounter.memoryImportance || 'media'
    }
  );
}
```

**4. EndGameScene (endings):**
```javascript
const memoriaBonus = gameState.memoriaColectiva.getEndingBonus();
const finalText = endingText + memoriaBonus.text;
```

---

## UI: Archivo Comunitario Scene

### Acceso
- Botón en MapScene: "📖 Archivo" (esquina superior derecha)
- Accesible en cualquier momento
- Pausa el juego

### Pantalla Principal - Timeline
```
┌─────────────────────────────────────────────┐
│   📖 ARCHIVO COMUNITARIO                    │
│   15 fragmentos • 60% completo              │
├─────────────────────────────────────────────┤
│                                             │
│  🌅  Día 1  │ HITO                          │
│  El Primer Día                              │
│  Red de Aguante comienza sus operaciones.  │
│                                             │
│  ⚖️  Día 3  │ DECISIÓN                      │
│  Primera Asamblea                           │
│  La primera asamblea define nuestro rumbo. │
│                                             │
│  ⚡  Día 15 │ CRISIS                        │
│  Crisis Eléctrica Superada                  │
│  Sobrevivimos el apagón crítico.           │
│                                             │
│  [... más fragmentos ...]                   │
│                                             │
├─────────────────────────────────────────────┤
│  ← Volver                                   │
└─────────────────────────────────────────────┘
```

### Pantalla de Detalle
```
┌─────────────────────────────────────────────┐
│                                             │
│              🌅                             │
│                                             │
│         Día 1 • HITO                        │
│                                             │
│         El Primer Día                       │
│                                             │
│  Hoy es el día 1. El barrio se organiza    │
│  por primera vez como red autogestionada.  │
│  Valeria convoca la primera asamblea. Hay  │
│  esperanza, pero también incertidumbre.    │
│  Nadie sabe si esto funcionará, pero todos │
│  están dispuestos a intentarlo.            │
│                                             │
│  — Voz Colectiva                           │
│                                             │
│         ← Volver al archivo                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Color Coding por Categoría
- **Hito**: 🟡 Dorado (`#ffd700`)
- **Decisión**: 🔵 Azul (`#2196F3`)
- **NPC**: 🟣 Morado (`#9C27B0`)
- **Crisis**: 🔴 Rojo (`#FF5252`)
- **Logro**: 🟢 Verde (`#4CAF50`)
- **Evento**: 🟠 Naranja (`#FF9800`)

---

## Estética Narrativa

### Principios de Escritura

✅ **SÍ:**
- Usar voz colectiva ("decidimos", "logramos", "enfrentamos")
- Ser evocativo pero conciso
- Reflejar emoción comunitaria
- Usar lenguaje porteño donde sea natural
- Enfocarse en el "por qué" y el "qué sentimos"

❌ **NO:**
- Ser neutral/corporativo
- Explicar mecánicas de juego
- Usar jerga técnica
- Ser excesivamente largo
- Perder la voz humana

### Ejemplos

**✅ Bueno:**
> "Ese día aprendimos que la solidaridad no es solo ayudar, es también dejarse ayudar."

**❌ Malo:**
> "Los recursos de legitimidad aumentaron en 10 puntos después de completar la asamblea."

**✅ Bueno:**
> "Beto, que siempre hablaba de cables, hoy habló de sueños. Fue extraño y hermoso."

**❌ Malo:**
> "Beto progresó al stage 2 de su arco narrativo y desbloqueó nuevas opciones de diálogo."

---

## Persistencia

### Save Format
```javascript
{
  memoriaColectiva: {
    fragmentos: [
      {
        id: 'memoria_primer_dia',
        day: 1,
        unlocked: true,
        unlockedAt: 1732464000000
        // ... otros campos se reconstruyen desde initializeFragments()
      },
      // ... más fragmentos
    ]
  }
}
```

### Load Strategy
1. Inicializar fragmentos fijos con `initializeFragments()`
2. Para cada fragmento guardado:
   - Si existe en lista fija: actualizar estado de unlock
   - Si no existe: es dinámico, recrear completo desde save
3. Recalcular stats

---

## Testing Strategy

### Test Cases Clave

1. **Fragmentos Fijos**
   - Día 1, 30, 60 se desbloquean automáticamente
   - Contenido correcto en cada uno

2. **Fragmentos Dinámicos (Encounters)**
   - Completar encounter con `createMemory: true`
   - Verificar fragmento creado
   - Verificar datos correctos

3. **Logros de Recursos**
   - Autonomía 80%+ desbloquea fragmento
   - Todos recursos >70% desbloquea fragmento
   - No duplicados

4. **Crisis Resueltas**
   - Electricidad <30% → >50% crea fragmento
   - Solo se crea una vez por tipo de crisis
   - Texto apropiado

5. **UI Archivo**
   - Botón accesible desde MapScene
   - Timeline muestra fragmentos ordenados
   - Detalle muestra información completa
   - Colores por categoría correctos

6. **Achievement**
   - ≥90% fragmentos desbloquea achievement
   - Raridad 5 estrellas

7. **Persistencia**
   - Guardar/cargar preserva fragmentos
   - Fragmentos dinámicos se restauran
   - Stats correctos después de load

8. **Ending Bonus**
   - Score >80: texto bonus largo
   - Score 40-80: texto bonus corto
   - Score <40: sin texto

---

## Métricas de Éxito

**Funcionales:**
- ✅ 3 fragmentos fijos implementados
- ✅ Sistema de fragmentos dinámicos funcional
- ✅ Tracking de crisis, logros y decisiones
- ✅ UI navegable y estética
- ✅ 25-40 fragmentos esperados por run

**Narrativos:**
- ✅ Textos evocativos y con voz porteña
- ✅ Cronología coherente
- ✅ Diversidad de tipos de fragmentos
- ✅ Bonus en endings implementado

**Técnicos:**
- ✅ Sin crashes
- ✅ Persistencia completa
- ✅ Integración limpia con sistemas existentes
- ✅ Performance sin degradación

---

**Versión**: 1.0
**Estado**: Diseño Completo - Listo para Implementación
**Tiempo Estimado**: 5 horas
