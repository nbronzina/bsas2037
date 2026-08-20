# Sistema de Eventos Climáticos y Crisis Externas

## Descripción General

Sistema completo de eventos dinámicos que ocurren durante el juego "Red de Aguante". Los eventos se inyectan como documentos en la bandeja de entrada basándose en días específicos, condiciones de recursos, o probabilidad aleatoria.

## Archivos Creados/Modificados

### Archivos Nuevos

1. **`data/climate_events.json`**
   - 20 eventos totales (5 scheduled, 10 conditional, 5 random)
   - Balance: 40% crisis, 40% decisiones difíciles, 20% oportunidades
   - Temática: Crisis climáticas, demandas externas, solidaridad entre redes

2. **`src/managers/ClimateEventManager.js`**
   - Gestor principal del sistema de eventos
   - Carga eventos desde JSON
   - Evalúa condiciones (recursos, flags, días)
   - Inyecta eventos como documentos
   - Procesa elecciones y aplica consecuencias
   - Persistencia vía save/load

### Archivos Modificados

1. **`src/main.js`**
   - Inicialización de ClimateEventManager

2. **`src/core/GameState.js`**
   - Agregado: `climateEventManager: null`

3. **`src/scenes/DeskScene.js`**
   - Agregado: `checkClimateEvents()` en `setupNewDay()`
   - Agregado: Badge visual ⚡ para eventos en sidebar
   - Agregado: Procesamiento de elecciones de eventos en `selectOption()`

4. **`src/managers/SaveManager.js`**
   - Agregado: Persistencia de `processedEvents` y `eventFlags`

5. **`index.html`**
   - Agregado: `<script src="src/managers/ClimateEventManager.js"></script>`

## Tipos de Eventos

### 1. SCHEDULED (5 eventos)
Ocurren en días específicos:
- **Día 2**: Apagón masivo en la ciudad
- **Día 3**: Ola de calor extrema (44°C)
- **Día 4**: Pedido de barrio vecino
- **Día 5**: Inspección municipal
- **Día 6**: Tormenta eléctrica severa

### 2. CONDITIONAL (10 eventos)
Se activan cuando se cumplen condiciones:
- `electricidad < 20`: Generador de emergencia
- `agua < 15`: Sequía en tanques
- `legitimidad < 30`: Asamblea de crisis
- `autonomia < 20`: Oferta de corporación
- `flag:compartir_excedente`: Nuevo pedido externo
- `electricidad > 70 && day >= 4`: Solicitud de expansión
- `agua < 20 && day == 5`: Crisis hídrica
- `legitimidad > 80`: Reconocimiento público
- Múltiples recursos bajos: Emergencia múltiple
- `flag:priorizar_autonomia`: Presión política

### 3. RANDOM (5 eventos)
Probabilidad de ocurrir en ciertos días:
- Donación anónima (15% chance)
- Falla técnica menor (20% chance)
- Visita de periodistas (18% chance)
- Conflicto vecinal menor (20% chance)
- Solidaridad de otra red (15% chance)

## Estructura de un Evento

```json
{
  "id": "evento_unico",
  "type": "scheduled|conditional|random",
  "day": 2,                    // Solo para scheduled
  "condition": "electricidad < 20",  // Solo para conditional
  "days": [2, 3, 4],          // Solo para random
  "chance": 0.2,              // Solo para random
  "title": "Título del Evento",
  "description": "Descripción completa...",
  "sender": "remitente",
  "options": [
    {
      "id": "opcion1",
      "text": "Texto del botón",
      "consequences": {
        "electricidad": -15,
        "agua": 10,
        "legitimidad": 5,
        "autonomia": -8
      },
      "preview": "-15⚡ +10💧 +5🤝 -8🏴",
      "response": "Resultado de la decisión...",
      "setsFlag": "nombre_del_flag"
    }
  ]
}
```

## Sistema de Flags

Los eventos pueden setear flags que afectan futuros eventos:

```javascript
// Flags disponibles (ejemplos):
- compartir_excedente
- priorizar_autonomia
- racionamiento_calor
- dependencia_municipio
- alianza_flores
- inspeccion_aprobada
- tormenta_daños
- cooptacion_corporativa
- expansion_exitosa
- visibilidad_nacional
// ... etc
```

## Condiciones Soportadas

```javascript
// Recursos
"electricidad < 20"
"agua > 50"
"legitimidad >= 80"

// Días
"day >= 4"
"day == 5"

// Flags
"flag:compartir_excedente"

// Compuestas
"electricidad > 70 && day >= 4"
"agua < 20 && day == 5"
```

## Flujo de Ejecución

### Al inicio de cada día:

1. `DeskScene.setupNewDay()` se ejecuta
2. Se llama a `checkClimateEvents()`
3. `ClimateEventManager.checkDayEvents()` evalúa:
   - Eventos scheduled para el día actual
   - Eventos conditional cuyas condiciones se cumplen
   - Eventos random con probabilidad de ocurrir
4. Eventos elegibles se inyectan como documentos vía `injectEventAsDocument()`
5. Aparecen en la bandeja de entrada con badge ⚡

### Cuando el usuario elige una opción:

1. `DeskScene.selectOption()` detecta que `doc.isEvent === true`
2. Llama a `ClimateEventManager.processEventChoice(eventId, optionId)`
3. Se aplican consecuencias a recursos
4. Se setean flags si corresponde
5. Evento se marca como procesado (no vuelve a aparecer)

### Al guardar/cargar:

1. **Save**: `SaveManager.save()` incluye `climateEvents` con:
   - `processedEvents`: IDs de eventos ya procesados
   - `eventFlags`: Flags seteados por eventos

2. **Load**: `SaveManager.load()` restaura el estado del ClimateEventManager

## Visualización

### En la bandeja de entrada:
- Los eventos tienen un badge ⚡ en la esquina superior izquierda
- Se distinguen visualmente de documentos normales

### En el contenido:
- Título y descripción del evento
- Opciones con preview de consecuencias (ej: "-15⚡ +10💧")
- Respuesta específica según la elección

## Validaciones

### JSON Schema:
- IDs únicos
- Tipos válidos (scheduled|conditional|random)
- Condiciones sintácticamente correctas
- Opciones con consecuencias balanceadas

### Balance de Recursos:
- Cambios típicos: ±5 a ±30
- Eventos críticos: hasta ±40
- Ningún evento puede llevar un recurso a 0 directamente

### Frecuencia:
- Máximo 2 eventos por día (evita saturación)
- Random events: cooldown implícito por días disponibles
- Conditional events: no se repiten (marcados como procesados)

## Testing Manual

### Día 2:
```
✅ Debe aparecer "Apagón Masivo en la Ciudad"
✅ Badge ⚡ visible en sidebar
✅ Opciones aplicables con consecuencias correctas
```

### Día 3:
```
✅ "Ola de Calor Extrema" debe aparecer
✅ Tres opciones disponibles con diferentes trade-offs
```

### Recursos < 20:
```
✅ Bajar electricidad < 20 → debe trigger "Generador de Emergencia"
✅ Bajar agua < 15 → debe trigger "Sequía en los Tanques"
```

### Flags:
```
✅ Elegir "Compartir excedente" día 2
   → Flag seteado
   → En día posterior, trigger "Nuevo Pedido del Municipio"
```

### Persistencia:
```
✅ Guardar partida con eventos procesados
✅ Cargar partida
✅ Eventos procesados no vuelven a aparecer
✅ Flags se mantienen
```

## Extensión Futura

Para agregar nuevos eventos:

1. Editar `data/climate_events.json`
2. Agregar nuevo objeto en el array `events`
3. Asignar ID único
4. Definir tipo, condiciones, opciones
5. Testear manualmente

No requiere cambios en código.

## Notas de Diseño

### Balance:
- Eventos negativos crean tensión y dilemas
- Eventos positivos recompensan buenas decisiones
- Eventos neutrales exploran trade-offs ideológicos

### Temática:
- Reflejan realidad de redes solidarias en Argentina
- Dilema autonomía vs integración al sistema
- Solidaridad vs supervivencia
- Ecología vs pragmatismo

### Narrativa:
- Cada evento tiene sender coherente (municipio, vecinos, clima, sistema)
- Respuestas reflejan consecuencias sociales, no solo numéricas
- Flags permiten arcos narrativos multi-día

## Errores Conocidos

- [ ] Si `documentsToday` se reinicia externamente, eventos inyectados se pierden
- [ ] No hay límite en cantidad de flags (podría crecer indefinidamente)
- [ ] Eventos random pueden no aparecer nunca si la probabilidad es muy baja

## Mejoras Futuras

- [ ] UI para mostrar flags activos
- [ ] Sistema de achievements basados en flags
- [ ] Eventos que requieren múltiples flags
- [ ] Eventos que modifican créditos además de recursos
- [ ] Integración con sistema de NPC trust
