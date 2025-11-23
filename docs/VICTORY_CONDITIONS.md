# VICTORY CONDITIONS - Red de Aguante

## 🎯 Matriz de Finales

Este documento define los 8 finales posibles del juego, sus condiciones de activación, y los flags necesarios para alcanzarlos.

### Ejes de Diseño

Los finales se determinan por la intersección de 3 ejes:

1. **Supervivencia**: ¿Llegaron recursos altos o críticos?
2. **Comunidad**: ¿Decisiones cooperativas o pragmáticas?
3. **Autonomía**: ¿Mantuvieron independencia o aceptaron ayuda externa?

---

## 📊 Tabla de Finales

| # | Final | Tipo | Día Min | Recursos | Flags Clave | Moral/Legitimidad |
|---|-------|------|---------|----------|-------------|-------------------|
| 1 | Utopía en Ruinas | Victoria ⭐⭐⭐ | 60 | 3x>60% | `autonomia_mantenida`, `comunidad_fuerte` | >75% |
| 2 | Red que Expande | Victoria ⭐⭐ | 60 | 2x>50% | `union_red_vecina`, `autonomia_parcial` | >60% |
| 3 | Supervivencia Amarga | Victoria ⭐ | 60 | Todos>30% | `decisiones_duras`, `personas_perdidas` | <50% |
| 4 | Dependencia Inevitable | Victoria ⚠️ | 60 | Variable | `ayuda_municipal`, `autonomia_perdida` | Variable |
| 5 | Resistencia Heroica | Victoria 🏆 | 60 | <40% | `rechazo_total_ayuda`, `comunidad_unida` | >70% |
| 6 | Éxodo Pacífico | Derrota 🟡 | 40-59 | Críticos | `evacuacion_organizada` | Variable |
| 7 | Colapso Caótico | Derrota 🔴 | <40 | 2x=0 | `colapso_violento`, `npcs_huyeron` | <30% |
| 8 | Traición del Sistema | Derrota 💔 | <50 | Variable | `ayuda_municipal`, `inspeccion_cerro_red` | Variable |

---

## 🏆 FINALES DETALLADOS

### 1. UTOPÍA EN RUINAS [Mejor Final] ⭐⭐⭐

**Condiciones:**
- ✅ Día 60 alcanzado
- ✅ Al menos 3 recursos >60%
- ✅ Flag: `autonomia_mantenida` (rechazaron ayuda externa en TODOS los encounters críticos)
- ✅ Flag: `comunidad_fuerte` (legitimidad >75% en últimos 10 días)
- ✅ Flag: `cooperacion_alta` (>5 decisiones cooperativas en encounters)

**Mensaje:**
```
UTOPÍA EN RUINAS

Lo lograron. Sin rendirse, sin claudicar.

Red de Aguante sigue en pie, autónoma y fuerte.
Mantuvieron la independencia sin perder la humanidad.

No fue fácil. Pero lo hicieron juntes.
El barrio es más que infraestructura: es comunidad.
```

**Cómo alcanzar:**
- Rechazar donación externa (día 22)
- Resistir inspección municipal (día 25)
- Rechazar alianza con La Matanza (día 15)
- Mantener recursos altos mediante gestión eficiente
- Priorizar decisiones cooperativas incluso si cuestan recursos

---

### 2. RED QUE SE EXPANDE ⭐⭐

**Condiciones:**
- ✅ Día 60 alcanzado
- ✅ Al menos 2 recursos >50%
- ✅ Flag: `union_red_vecina` (aceptaron alianza en día 28+)
- ✅ Flag: `autonomia_parcial` (rechazaron ayuda municipal pero aceptaron alianzas barriales)
- ❌ NO Flag: `ayuda_municipal`

**Mensaje:**
```
LA RED SE EXPANDE

Ya no están solos.

La unión con la red vecina les dio fuerza.
Crecieron sin perder su voz en el territorio.

La autonomía no es aislamiento.
Es construir poder colectivo.
```

**Cómo alcanzar:**
- Aceptar alianza con La Matanza o Villa 21-24 (días 15, 28)
- Rechazar inspección municipal (día 25)
- Expandir red territorial (día 28)
- Mantener recursos medios-altos

---

### 3. SUPERVIVENCIA AMARGA ⭐

**Condiciones:**
- ✅ Día 60 alcanzado
- ✅ Todos recursos >30% PERO legitimidad <50%
- ✅ Flag: `decisiones_duras` (>3 decisiones pragmáticas con costo social)
- ✅ Flag: `personas_perdidas` (al menos 1 NPC se fue o se alejó)

**Mensaje:**
```
SUPERVIVENCIA AMARGA

Sobrevivieron. Pero a qué costo.

Los números están bien. Electricidad, agua, infraestructura.
Pero la red está fracturada.

Las decisiones duras dejaron cicatrices.
Algunos se fueron. Otros se quedaron por necesidad.
¿Esto es victoria?
```

**Cómo alcanzar:**
- Tomar decisiones pragmáticas (cortar dispensario, racionar agua duramente)
- Priorizar infraestructura sobre personas
- Rechazar pedidos de NPCs (Yani, Marcos)
- Llegar a día 60 con recursos pero baja moral

---

### 4. DEPENDENCIA INEVITABLE ⚠️

**Condiciones:**
- ✅ Día 60 alcanzado
- ✅ Flag: `ayuda_municipal` (aceptaron inspección y supervisión día 25)
- ✅ Flag: `autonomia_perdida` (autonomía <30%)

**Mensaje:**
```
DEPENDENCIA INEVITABLE

Sobrevivieron bajo tutela del estado.

El municipio supervisa la red. Los recursos fluyen.
Pero ya no son autónomos. ¿Era este el objetivo?

La red existe, pero a cambio de su independencia.
A veces la supervivencia cuesta la dignidad.
```

**Cómo alcanzar:**
- Aceptar inspección municipal (día 25, opción "Cooperar totalmente")
- Aceptar ayuda del municipio cuando se ofrece
- Llegar a día 60 bajo supervisión estatal

---

### 5. RESISTENCIA HEROICA 🏆 [Final Secreto Positivo]

**Condiciones:**
- ✅ Día 60 alcanzado
- ✅ Recursos críticos (<40%) PERO legitimidad >70%
- ✅ Flag: `rechazo_total_ayuda` (rechazaron TODAS las ayudas externas)
- ✅ Flag: `comunidad_unida` (0 NPCs perdidos + >5 decisiones cooperativas)

**Mensaje:**
```
RESISTENCIA HEROICA

Contra todo pronóstico, resistieron.

Los recursos son escasos. La infraestructura está al límite.
Pero la comunidad está UNIDA.

Rechazaron todas las ayudas que condicionaban.
Priorizaron dignidad sobre comodidad.

Esta es la resistencia real:
Aguantar sin rendirse, construir sin claudicar.
```

**Cómo alcanzar:**
- Rechazar TODAS las ayudas externas (día 22, 25, alianzas)
- Priorizar decisiones cooperativas siempre
- Mantener a todos los NPCs comprometidos
- Llegar a día 60 con recursos bajos pero moral altísima

---

### 6. ÉXODO PACÍFICO 🟡 [Derrota Digna]

**Condiciones:**
- ✅ Día 40-59 (no llegaron a 60)
- ✅ Recursos críticos (<30%)
- ✅ Flag: `evacuacion_organizada` (decisión de evacuar ordenadamente)
- ❌ NO Flag: `colapso_violento`

**Mensaje:**
```
ÉXODO PACÍFICO

La red no resistió.

Pero se disolvió con dignidad, cuidando a los suyos.
Las familias se reubicaron ordenadamente.

A veces retirarse es también resistir.
No todo colapso es fracaso.

Pelearon hasta donde pudieron.
```

**Cómo alcanzar:**
- Recursos críticos en día 40-59
- Tomar decisión consciente de evacuar (encounter especial)
- Gestionar salida ordenada de NPCs

---

### 7. COLAPSO CAÓTICO 🔴 [Derrota Mala]

**Condiciones:**
- ✅ Día <40
- ✅ Al menos 2 recursos = 0
- ✅ Flag: `colapso_violento` (decisión que causó crisis abrupta)
- ✅ Flag: `npcs_huyeron` (personajes abandonaron sin orden)

**Mensaje:**
```
COLAPSO CAÓTICO

Todo se desmoronó demasiado rápido.

La red no pudo sostenerse.
Las personas huyeron en pánico.
El barrio quedó vacío.

No hubo tiempo para organizarse.
El colapso fue total.
```

**Cómo alcanzar:**
- Gestión pésima de recursos
- Decisiones que causan crisis (no cortar transformador en tormenta)
- Múltiples recursos llegan a 0 antes de día 40

---

### 8. TRAICIÓN DEL SISTEMA 💔 [Derrota Especial]

**Condiciones:**
- ✅ Flag: `ayuda_municipal` (aceptaron inspección día 25)
- ✅ Flag: `inspeccion_cerro_red` (inspección resultó en cierre)
- ✅ Día <50

**Mensaje:**
```
TRAICIÓN DEL SISTEMA

Confiaron en el estado. El estado les falló.

La inspección municipal encontró "irregularidades".
La red fue desmantelada por órdenes de arriba.

Cooperaron de buena fe.
Pero las instituciones no estaban de su lado.

Las buenas intenciones no fueron suficientes.
```

**Cómo alcanzar:**
- Aceptar inspección municipal (día 25)
- Encounter especial donde inspección resulta en cierre administrativo
- Desmantelamiento antes de día 50

---

## 🚩 FLAGS DISPONIBLES

### Autonomía
- `autonomia_mantenida`: Rechazaron ayuda externa en TODOS los encounters críticos
- `autonomia_parcial`: Rechazaron ayuda municipal pero aceptaron alianzas barriales
- `autonomia_perdida`: Aceptaron ayuda municipal, autonomía <30%
- `union_red_vecina`: Aceptaron unirse a red vecina (La Matanza, Villa 21-24)
- `rechazo_total_ayuda`: Rechazaron TODAS las ayudas externas ofrecidas

### Comunidad
- `comunidad_fuerte`: Legitimidad >75% en últimos 10 días
- `comunidad_unida`: 0 NPCs perdidos + >5 decisiones cooperativas
- `personas_perdidas`: Al menos 1 NPC se fue o se alejó
- `cooperacion_alta`: Count >5 de opciones cooperativas en encounters

### Decisiones
- `decisiones_duras`: Count >3 de opciones pragmáticas con alto costo social
- `colapso_violento`: Decisión específica que causó crisis abrupta
- `evacuacion_organizada`: Gestión ordenada de evacuación

### Eventos Específicos
- `ayuda_municipal`: Aceptaron inspección municipal día 25
- `inspeccion_cerro_red`: Inspección resultó en cierre administrativo
- `alianza_matanza`: Aceptaron alianza con La Matanza (día 15)
- `expansion_red`: Expandieron red territorial (día 28)

---

## 🎯 PRIORIDAD DE EVALUACIÓN

El sistema evaluará en este orden (el primero que matchee se activa):

1. **Derrotas Especiales** (traición, colapso)
2. **Victorias Especiales** (utopía, resistencia heroica)
3. **Victorias Estándar** (expansión, dependencia)
4. **Victorias Ambiguas** (supervivencia amarga)
5. **Derrotas Estándar** (éxodo, genérica)

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Counters Necesarios
```javascript
gameState.decisionCounters = {
  cooperativas: 0,      // Cuenta decisiones cooperativas
  duras: 0,             // Cuenta decisiones pragmáticas duras
  ayudas_rechazadas: 0  // Cuenta ayudas externas rechazadas
};
```

### Tracking de Legitimidad
- Guardar legitimidad de últimos 10 días
- Calcular promedio al llegar a día 60
- Setear `comunidad_fuerte` si promedio >75%

### NPCs Tracking
- Trackear estado de cada NPC (activo, alejado, perdido)
- Setear `personas_perdidas` si alguno se fue
- Setear `comunidad_unida` si todos permanecen activos

---

**Versión:** 1.0
**Fecha:** 2025-11-23
**Estado:** 🔨 En implementación
