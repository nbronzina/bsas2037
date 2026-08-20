# Sistema de NPC Trust y Reactividad - Implementación Completa

## Resumen

Se ha implementado un sistema completo de tracking de trust y reactividad para NPCs en "Red de Aguante". Los NPCs ahora recuerdan las decisiones del jugador y reaccionan dinámicamente según su nivel de confianza.

---

## Archivos Modificados

### 1. `src/core/GameState.js`

**Cambios:**
- ✅ Agregado `trust`, `lastDecision`, `interactionCount` a cada NPC
- ✅ Agregados NPCs `laura` y `dani` con personalidades únicas
- ✅ Cambiado campo `personality` de texto descriptivo a keyword (`pragmatic`, `technical`, `community`, `cautious`, `practical`)
- ✅ Agregados métodos:
  - `modifyNPCTrust(npcId, amount, reason)` - Modifica trust con límites 0-100
  - `getNPCTrustLevel(npcId)` - Retorna nivel: high/good/neutral/low/critical
  - `getNPCResponseModifier(npcId)` - Retorna {level, personality}
- ✅ Actualizado `reset()` para resetear trust de NPCs

**NPCs disponibles:**
- **Valeria** (pragmatic) - Prioriza legitimidad y agua
- **Beto** (technical) - Prioriza electricidad y autonomía
- **Yani** (community) - Prioriza legitimidad y agua
- **Marcos** (cautious) - Prioriza agua y electricidad
- **Laura** (community) - Prioriza legitimidad y autonomía
- **Dani** (practical) - Prioriza agua y autonomía

---

### 2. `src/utils/NPCManager.js` (NUEVO)

**Funcionalidad principal:**

```javascript
class NPCManager {
  // Procesar decisión y modificar trust
  processDecision(npcId, optionId, consequences)
  
  // Generar sufijo de respuesta según trust
  getResponseSuffix(npcId)
  
  // Utilidades de debug
  getAllNPCTrustStatus()
  showNPCStatus()
}
```

**Lógica de trust:**

1. **Alineación con prioridades**: Cada NPC tiene 2 prioridades. Si una decisión mejora una prioridad, +1 punto de trust por cada punto de mejora.

2. **Modificadores de personalidad:**
   - `technical` (Beto): +2 si electricidad sube, -2 si baja mucho
   - `community` (Laura/Yani): +2 si legitimidad sube, -3 si baja mucho
   - `pragmatic` (Valeria): Penaliza decisiones extremas, premia balance
   - `cautious` (Marcos): Penaliza decisiones con muchas consecuencias negativas
   - `practical` (Dani): +2 si agua sube, -2 si baja mucho

3. **Límites**: Trust change máximo por decisión = ±10 puntos

**Respuestas según trust:**

```
high (80-100):    Muy positiva, entusiasta
good (60-79):     Positiva, satisfecha
neutral (40-59):  Neutral, sin comentarios
low (20-39):      Negativa, decepcionada
critical (0-19):  Muy negativa, frustrada
```

---

### 3. `src/scenes/DeskScene.js`

**Integración en `selectOption()`:**

```javascript
// Después de procesar decisión
if (gameState.npcManager && doc.sender && gameState.npcs[doc.sender]) {
  gameState.npcManager.processDecision(doc.sender, option.id, option.consequences);
}

// Antes de mostrar feedback
let npcResponse = result.response;
if (gameState.npcManager && doc.sender && gameState.npcs[doc.sender]) {
  const trustSuffix = gameState.npcManager.getResponseSuffix(doc.sender);
  npcResponse = (npcResponse || '') + trustSuffix;
}
```

**Comando de debug:**

```javascript
window.showNPCStatus()
```

Disponible en consola del navegador durante la partida.

---

### 4. `src/managers/SaveManager.js`

**Persistencia de NPCs:**

```javascript
// Al guardar
npcs: this.serializeNPCs()

// Al cargar
if (data.npcs) {
  this.deserializeNPCs(data.npcs);
}
```

Métodos agregados:
- `serializeNPCs()` - Extrae solo trust, lastDecision, interactionCount
- `deserializeNPCs(data)` - Restaura datos de NPCs

---

### 5. `src/main.js`

**Inicialización:**

```javascript
gameState.npcManager = new NPCManager(gameState);
console.log('👥 NPCManager initialized');
```

---

### 6. `index.html`

**Script agregado:**

```html
<script src="src/utils/NPCManager.js"></script>
```

---

## Testing

### Checklist de Validación

**1. Iniciar nuevo juego**
```javascript
// Verificar en consola:
// "👥 NPCManager initialized"
// "🎮 Debug: window.showNPCStatus() disponible"
```

**2. Ver estado inicial de NPCs**
```javascript
window.showNPCStatus()
// Todos deberían tener trust: 50, interactionCount: 0
```

**3. Procesar documento de Beto**
- Elegir opción que **aumenta** electricidad
- Verificar en consola: `"💭 beto trust: 55 (+5)"` (o similar)
- Verificar que aparece sufijo en respuesta (ej: "Beto asiente. 'Dale, vamos para adelante.'")

**4. Procesar otro documento de Beto**
- Elegir opción que **reduce** electricidad
- Verificar que trust baja
- Sufijo debería ser más negativo

**5. Verificar múltiples NPCs**
```javascript
window.showNPCStatus()
// Debería mostrar diferentes valores de trust según decisiones
```

**6. Guardar y cargar partida**
- Guardar partida (auto-save o manual)
- Recargar página
- Cargar partida
- Ejecutar `window.showNPCStatus()`
- Verificar que trust se preserva

**7. Verificar límites**
```javascript
// Modificar manualmente
gameState.modifyNPCTrust('beto', 100, 'test')
window.showNPCStatus()
// Trust de Beto debería estar en 100 (tope máximo)

gameState.modifyNPCTrust('beto', -200, 'test')
window.showNPCStatus()
// Trust de Beto debería estar en 0 (tope mínimo)
```

---

## Comandos de Debug

### En Consola del Navegador:

```javascript
// Mostrar estado de todos los NPCs
window.showNPCStatus()

// Modificar trust manualmente
gameState.modifyNPCTrust('beto', 10, 'test')
gameState.modifyNPCTrust('valeria', -15, 'test')

// Ver modificador de respuesta
gameState.getNPCResponseModifier('valeria')
// Returns: { level: 'neutral', personality: 'pragmatic' }

// Ver nivel de trust específico
gameState.getNPCTrustLevel('beto')
// Returns: 'good' | 'high' | 'neutral' | 'low' | 'critical'

// Ver todos los datos de un NPC
gameState.npcs.beto

// Limpiar trust (resetear a 50)
Object.keys(gameState.npcs).forEach(id => {
  gameState.npcs[id].trust = 50;
  gameState.npcs[id].interactionCount = 0;
  gameState.npcs[id].lastDecision = null;
});
```

---

## Ejemplo de Interacción

### Escenario: Decisión sobre generador eléctrico

**Documento de Beto:**
```
Title: "Problema con el generador"
Options:
  1. Reparar generador (+10 electricidad, -5 créditos)
  2. Dejarlo así (0 cambios)
```

**Si eliges Opción 1:**

1. Trust calculation:
   - Beto prioriza electricidad → +10 trust (alineación)
   - Beto personality `technical` → +2 trust (bonus)
   - **Total: +12 trust**

2. Trust actualizado: 50 → 62 (nivel `good`)

3. Respuesta mostrada:
   ```
   "Perfecto, me pongo a trabajar ya."
   
   Beto asiente. 'Dale, vamos para adelante.'
   ```

**Si eliges Opción 2:**

1. Trust calculation:
   - Beto prioriza electricidad → 0 trust
   - No hay cambios → 0 trust
   - **Total: 0 trust**

2. Trust sin cambios: 50 (nivel `neutral`)

3. Respuesta mostrada:
   ```
   "Bueno, ahí vemos."
   
   Beto se encoge de hombros.
   ```

---

## Personalidades en Detalle

### **Valeria (pragmatic)**
- **Reacción**: Prefiere decisiones equilibradas sin consecuencias extremas
- **Trust +**: Balance entre recursos, pocas consecuencias negativas
- **Trust -**: Decisiones extremas (mucho ganancia O mucha pérdida)

### **Beto (technical)**
- **Reacción**: Aprecia mejoras de infraestructura técnica
- **Trust +**: Electricidad sube, autonomía sube
- **Trust -**: Electricidad baja significativamente (<-5)

### **Yani/Laura (community)**
- **Reacción**: Prioriza el bienestar comunitario
- **Trust +**: Legitimidad sube
- **Trust -**: Legitimidad baja significativamente (<-5)

### **Marcos (cautious)**
- **Reacción**: Prefiere decisiones conservadoras
- **Trust +**: Decisiones sin consecuencias negativas
- **Trust -**: Decisiones con muchas consecuencias negativas (>2 recursos bajan)

### **Dani (practical)**
- **Reacción**: Aprecia soluciones prácticas de agua/autonomía
- **Trust +**: Agua sube, autonomía sube
- **Trust -**: Agua baja significativamente (<-5)

---

## Logs de Consola Esperados

```
🎮 Phaser preBoot - Red de Aguante (Desk Version)
📄 Loaded 15 documents
📋 DocumentManager initialized
💾 SaveManager initialized
🎵 AudioManager initialized
👥 NPCManager initialized
✅ Phaser postBoot - Game ready
🎮 Game started - Red de Aguante (Escritorio)
📅 Day 1 - no boot sequence
🎮 Debug: window.showNPCStatus() disponible
💾 Auto-save activado en DeskScene
🔊 Ambient audio started in DeskScene

// Al procesar decisión:
🔵 selectOption called: d1_intro option: 0
📊 processDecision result: { response: "...", ... }
💭 NPC trust processed for: valeria
💬 Added trust suffix for valeria
💭 valeria trust: 55 (+5)
```

---

## Archivos de Configuración

### `data/documents.json`

Los documentos ahora deben incluir `sender` para que funcione el sistema:

```json
{
  "id": "d1_generador",
  "sender": "beto",
  "title": "El generador está fallando",
  "content": "...",
  "options": [
    {
      "id": "repair",
      "text": "Reparar ahora",
      "consequences": {
        "electricidad": 10,
        "creditos": -5
      }
    }
  ]
}
```

---

## Notas de Implementación

### Validaciones implementadas:

✅ Trust nunca sale de rango 0-100  
✅ Save/load preserva estado de NPCs  
✅ Console logs claros para debugging  
✅ No rompe funcionalidad existente  
✅ Personalidades influyen en cálculo de trust  
✅ Sufijos se agregan solo si el NPC existe  

### Casos Edge manejados:

- Documento sin `sender` → No procesa trust (sin error)
- NPC inexistente → Warning en consola, continúa
- Save corrupto → NPCs se resetean a valores default
- Múltiples decisiones del mismo NPC → Trust acumulativo

---

## Próximos Pasos Sugeridos

1. **Eventos narrativos basados en trust:**
   - Si trust de un NPC < 20 por 2 días → Evento especial
   - Si todos los NPCs tienen trust > 70 → Bonus ending

2. **UI de trust:**
   - Mostrar barras de trust en ventana de "Estado"
   - Indicador visual en emails según trust

3. **Consecuencias de trust crítico:**
   - NPCs con trust < 10 pueden rechazar ayudar
   - Opciones bloqueadas si trust muy bajo

4. **Logros:**
   - "Líder confiable": Todos los NPCs con trust > 80
   - "Electricista del barrio": Beto con trust 100

---

## Solución de Problemas

### Trust no cambia

**Problema:** Al tomar decisiones, trust no se modifica.

**Solución:**
1. Verificar que el documento tiene campo `sender`
2. Verificar que `sender` coincide con un ID de NPC
3. Verificar en consola: `"💭 NPC trust processed"`

### Sufijo no aparece

**Problema:** La respuesta del NPC no incluye sufijo de trust.

**Solución:**
1. Verificar que `result.response` existe
2. Verificar log: `"💬 Added trust suffix for..."`
3. Verificar que el NPC tiene templates en `getTrustResponses()`

### Save no preserva trust

**Problema:** Al cargar partida, trust vuelve a 50.

**Solución:**
1. Verificar log al cargar: `"👥 NPC data restored"`
2. Verificar en consola del navegador → Application → Local Storage
3. Buscar key `redDeAguante_v2_save`, verificar que contiene campo `npcs`

---

## Créditos

Sistema implementado según especificaciones de:
- **NPC Trust System**: Tracking 0-100 con personalidades
- **NPCManager**: Lógica de reactividad y respuestas
- **Persistencia**: Save/Load completo
- **Debug Tools**: Comandos de consola

**Implementado por:** Claude Code Agent  
**Fecha:** 2026-08-20  
**Versión:** 1.0.0
