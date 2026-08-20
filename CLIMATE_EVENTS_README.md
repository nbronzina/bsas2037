# Sistema de Eventos Climáticos y Crisis Externas - Red de Aguante

## 🌪️ Descripción

Sistema completo de eventos dinámicos implementado para "Red de Aguante". Los eventos se inyectan automáticamente en la bandeja de entrada basándose en:
- **Días específicos** (scheduled)
- **Condiciones de recursos/flags** (conditional)  
- **Probabilidad aleatoria** (random)

## ✅ Estado: IMPLEMENTADO Y VALIDADO

```
✅ 20 eventos creados (5 scheduled, 10 conditional, 5 random)
✅ EventManager funcional con carga async
✅ Integración completa en DeskScene
✅ Persistencia en SaveManager
✅ Visualización diferenciada (badge ⚡)
✅ Sistema de flags para narrativas multi-día
✅ Validador de JSON
✅ Balance verificado
```

## 📂 Archivos del Sistema

### Nuevos
- `data/climate_events.json` - Base de datos de eventos
- `src/managers/ClimateEventManager.js` - Gestor principal
- `scripts/validate_events.js` - Validador de eventos
- `docs/CLIMATE_EVENTS_SYSTEM.md` - Documentación técnica

### Modificados
- `src/main.js` - Inicialización del manager
- `src/core/GameState.js` - Referencia al manager
- `src/scenes/DeskScene.js` - Verificación e inyección de eventos
- `src/managers/SaveManager.js` - Persistencia
- `index.html` - Carga del script

## 🎮 Cómo Funciona

### 1. Al inicio de cada día
```
DeskScene.setupNewDay()
  → checkClimateEvents()
    → ClimateEventManager.checkDayEvents()
      → Evalúa scheduled/conditional/random
      → Inyecta eventos como documentos
      → Aparecen en bandeja con badge ⚡
```

### 2. Cuando el usuario elige una opción
```
DeskScene.selectOption()
  → ClimateEventManager.processEventChoice()
    → Aplica consecuencias a recursos
    → Setea flags
    → Marca evento como procesado
```

### 3. Al guardar/cargar
```
SaveManager.save()
  → Guarda processedEvents + eventFlags
  
SaveManager.load()
  → Restaura estado del ClimateEventManager
```

## 📋 Eventos Implementados

### Scheduled (5)
| Día | Evento | Descripción |
|-----|--------|-------------|
| 2 | Apagón Masivo | El municipio pide compartir energía |
| 3 | Ola de Calor | 44°C, consumo de recursos se dispara |
| 4 | Barrio Vecino | Red de Flores pide ayuda para arrancar |
| 5 | Inspección Municipal | Verificación de seguridad |
| 6 | Tormenta Eléctrica | Riesgo de daño al equipamiento |

### Conditional (10)
| Condición | Evento |
|-----------|--------|
| `electricidad < 20` | Generador de emergencia |
| `agua < 15` | Sequía en tanques |
| `legitimidad < 30` | Asamblea de crisis |
| `autonomia < 20` | Oferta de corporación |
| `flag:compartir_excedente` | Nuevo pedido externo |
| `electricidad > 70 && day >= 4` | Solicitud de expansión |
| `agua < 20 && day == 5` | Crisis hídrica |
| `legitimidad > 80` | Reconocimiento público |
| Múltiples recursos bajos | Emergencia múltiple |
| `flag:priorizar_autonomia` | Presión política |

### Random (5)
| Evento | Probabilidad | Días |
|--------|--------------|------|
| Donación anónima | 15% | 2-7 |
| Falla técnica menor | 20% | 3-6 |
| Visita de periodistas | 18% | 4-6 |
| Conflicto vecinal | 20% | 3-6 |
| Solidaridad otra red | 15% | 5-7 |

## 🚀 Testing

### Validar JSON
```bash
node scripts/validate_events.js
```

### Test Manual en Juego

**Día 2:**
1. Iniciar juego
2. Completar día 1
3. Al inicio del día 2, verificar que aparezca "Apagón Masivo"
4. Badge ⚡ debe ser visible
5. Elegir opción y verificar consecuencias

**Eventos Condicionales:**
1. Usar consola del navegador:
   ```javascript
   gameState.resources.electricidad = 15  // Bajar electricidad
   ```
2. Avanzar al siguiente día
3. Debe aparecer "Generador de Emergencia"

**Flags:**
1. Día 2: Elegir "Compartir excedente"
2. Días posteriores: Verificar que aparezca "Nuevo Pedido del Municipio"

**Persistencia:**
1. Procesar varios eventos
2. Guardar partida
3. Recargar página
4. Cargar partida
5. Verificar que eventos procesados no vuelvan a aparecer

## 🔧 Agregar Nuevos Eventos

### 1. Editar `data/climate_events.json`

```json
{
  "id": "mi_nuevo_evento",
  "type": "conditional",
  "condition": "legitimidad < 40",
  "title": "Título del Evento",
  "description": "Descripción...",
  "sender": "remitente",
  "options": [
    {
      "id": "opcion_a",
      "text": "Acción A",
      "consequences": {
        "legitimidad": 15,
        "autonomia": -10
      },
      "preview": "+15🤝 -10🏴",
      "response": "Resultado...",
      "setsFlag": "nombre_flag"
    }
  ]
}
```

### 2. Validar
```bash
node scripts/validate_events.js
```

### 3. Testear en juego

No requiere cambios en código.

## 📊 Balance de Recursos

### Consecuencias Típicas
- **Cambios pequeños**: ±5 a ±10
- **Cambios moderados**: ±15 a ±20
- **Cambios grandes**: ±25 a ±30
- **Crisis severas**: ±35 a ±40

### Recursos
- `electricidad` (0-100)
- `agua` (0-100)
- `legitimidad` (0-100)
- `autonomia` (0-100)

## 🎨 Visualización

### Badge de Evento
- Icono: ⚡ (rayo)
- Posición: Esquina superior izquierda del email
- Color: Automático (emoji)

### Preview de Consecuencias
Cada opción muestra preview:
```
-15⚡ +10💧 +5🤝 -8🏴
```

## 🏁 Flags Principales

Flags seteados por eventos que afectan futuras decisiones:

- `compartir_excedente` - Compartiste energía con el barrio
- `priorizar_autonomia` - Rechazaste ayuda externa
- `alianza_flores` - Alianza con Red de Flores
- `dependencia_municipio` - Aceptaste ayuda del municipio
- `expansion_exitosa` - Red expandida a más edificios
- `visibilidad_nacional` - Media nacional cubrió la red
- `cooptacion_corporativa` - Corporación invirtió en la red
- `nucleo_resistente` - Sobreviviste a crisis múltiple

## ⚠️ Limitaciones Conocidas

1. **Máximo 2 eventos por día** - Previene saturación
2. **Eventos procesados no reaparecen** - Diseño intencional
3. **Random events dependen de probabilidad** - Pueden no ocurrir nunca
4. **Flags no tienen límite** - Puede crecer indefinidamente (no es problema práctico)

## 🔮 Mejoras Futuras Posibles

- [ ] UI para mostrar flags activos
- [ ] Achievements basados en combinaciones de flags
- [ ] Eventos que requieren múltiples flags simultáneos
- [ ] Eventos que modifican créditos
- [ ] Integración más profunda con sistema de NPC trust
- [ ] Editor visual de eventos (GUI)
- [ ] Exportar/importar packs de eventos

## 📚 Documentación Adicional

Ver `docs/CLIMATE_EVENTS_SYSTEM.md` para documentación técnica completa.

## ✨ Créditos

Sistema diseñado para reflejar realidades de redes solidarias en Argentina:
- Dilemas autonomía vs integración
- Solidaridad vs supervivencia
- Ecología vs pragmatismo
- Crisis climáticas reales

---

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Estado:** ✅ Producción
