# REWRITES - Encounters Mejorados

**Fecha:** 2025-11-24
**Total Rewrites:** 5
**Objetivo:** Tier C/B bajo → Tier B/A (14+/20)

---

## Rewrite #1: yani_seguimiento

### 1. ANÁLISIS DEL PROBLEMA

**Versión Original:**
```json
{
  "id": "yani_seguimiento",
  "title": "Yani - Seguimiento",
  "context": "Yani te cuenta cómo están las cosas en el dispensario después de tu ayuda. Los medicamentos están seguros, pero siempre hay nuevas necesidades.",
  "options": [
    {
      "id": 1,
      "text": "Preguntar sobre necesidades actuales",
      "cost": { "creditos": 100 },
      "requirements": { "creditos": 100 },
      "result": {
        "changes": { "legitimidad": 10 },
        "message": "Yani te explica que necesitan insumos básicos. Decidís hacer una colecta. La gente agradece el apoyo.",
        "flags": []
      }
    },
    {
      "id": 2,
      "text": "Ofrecer capacitación en primeros auxilios",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": 15 },
        "message": "Organizás una capacitación en primeros auxilios para la comunidad. Yani coordina todo. Se fortalece la red de cuidados.",
        "flags": ["capacitacion_salud"]
      }
    }
  ]
}
```

**Problemas Identificados en Audit:**
1. **Diálogo genérico:** "cómo están las cosas", "siempre hay nuevas necesidades" - muy vago
2. **Trade-off nulo:** Opción 2 domina (gratis, +15 legit vs pagar 100₡ por +10 legit)
3. **Consecuencias sin impacto:** Flag `capacitacion_salud` no se usa en ningún otro encounter
4. **Autenticidad 2/5:** No evoca Buenos Aires 2037, ni contexto específico

**Score Original:** 10/20 (TIER C)
- Autenticidad: 2/5 - Diálogo genérico, no evoca lugar/tiempo
- Trade-offs: 2/5 - Opción 2 domina completamente
- Consecuencias: 3/5 - Lógicas pero flags sin payoff
- Coherencia: 3/5 - Arco de Yani correcto pero tono plano

---

### 2. OBJETIVOS DEL REWRITE

**Resolver:**
- [x] Diálogo genérico → Situación específica del dispensario (nombre enfermedad, necesidad concreta)
- [x] Trade-off nulo → 3 opciones competitivas con pros/cons claros
- [x] Flags sin uso → Flags que conecten con otros encounters o endings
- [x] No evoca 2037 → Contexto tecnológico/social futuro específico

**Mejorar:**
- [x] Autenticidad cultural (target: 4/5) → Contexto salud barrial específico
- [x] Trade-offs genuinos (target: 4-5/5) → Cada opción viable según estrategia
- [x] Consecuencias lógicas (target: 4/5) → Costos proporcionales, flags útiles
- [x] Coherencia narrativa (target: 4/5) → Conectar con arco de Yani

**Mantener:**
- ✅ Es seguimiento de encuentro_yani (arco correcto)
- ✅ Involucra a Yani (personaje establecido)
- ✅ Tema de salud comunitaria
- ✅ Tono empático de Yani

---

### 3. INVESTIGACIÓN Y CONTEXTO

**Contexto en historia (día variable, post-encuentro_yani):**
- **Qué pasó antes:** Jugador ayudó a Yani conectando dispensario a red o prestando generador (encuentro_yani día ~10)
- **Estado típico de recursos:** Día 20-30, electricidad ~50-60%, legitimidad ~40-50%, créditos ~1500-2000
- **Arco de Yani:** Establecida como aliada (flag yani_aliada), dispensario funcionando, ahora aparecen nuevos desafíos

**Referencias para autenticidad (Buenos Aires 2037):**
- Salud pública en barrios: falta de insumos, dependencia de ayuda externa vs autogestión
- Tecnología médica: telemedicina, monitoreo remoto, diagnóstico por IA (accesible en 2037)
- Contexto climático: olas de calor más intensas → enfermedades respiratorias, golpes de calor
- Lenguaje natural de Yani: empática, directa, preocupada por otros

**Evitar clichés:**
- ❌ "Che, vení que te cuento" - forzado
- ❌ Mate en el dispensario - innecesario
- ✅ Usar: Nombre de enfermedad específica, insumos concretos, problema técnico real

**Mecánicas a considerar:**
- Balance post-ajuste: decay -0.9 elec, -0.8 agua, -0.8 legit, -20 créditos
- Legitimidad = recurso clave para Yani (relación comunitaria)
- Flags útiles: red_salud_comunitaria, telemedicina_instalada (conectar con futuros encounters/endings)

---

### 4. PROPUESTA DE REWRITE

**Nuevo Título:** Yani - Red de Salud

**Nuevo Context:**
"Yani te llama al dispensario. Desde que tienen electricidad estable, pudieron conectar el sistema de telemedicina donado hace meses. Ahora pueden diagnosticar casos complejos remotamente, pero el servidor consume mucha energía y los vecinos están pidiendo más turnos. La demanda creció 40%. Hay que decidir cómo escalar."

**Principios aplicados:**
- ✅ Voz de Yani: empática, técnica cuando necesario, enfocada en soluciones
- ✅ Específico 2037: "sistema de telemedicina", "servidor consume energía", "diagnóstico remoto"
- ✅ Consecuencia de encuentro previo: "desde que tienen electricidad estable"
- ✅ Problema concreto: demanda +40%, decisión de escalabilidad
- ✅ Dilema genuino: éxito crea nuevos desafíos

---

### Nuevas Opciones:

#### **Opción 1:** "Expandir turnos remotos (requiere -8% electricidad)"

**Pros:**
- Atiende más gente (+18 legitimidad)
- Aprovecha tecnología existente
- Fortalece reputación del dispensario

**Cons:**
- Consume 8% electricidad permanente
- Requiere tener >40% electricidad disponible

**Consecuencias:**
```json
{
  "resources": {
    "electricidad": -8,
    "legitimidad": 18
  },
  "flags": ["telemedicina_expandida"]
}
```

**Message:** "Yani programa turnos de telemedicina todos los días. La demanda se dispara: ahora atienden casos de 3 barrios vecinos. El servidor funciona 12 horas diarias. El dispensario es referencia zonal, pero la red eléctrica está más cargada."

**Justificación balance:**
- Electricidad -8%: permanente, simula consumo continuo servidor
- Legitimidad +18: alto porque resuelve necesidad de varios barrios
- Requiere 40% elec: asegura que jugador tiene margen
- Flag telemedicina_expandida: puede conectar con ending "Red Territorial Consolidada"

---

#### **Opción 2:** "Capacitar promotores de salud del barrio (-300 créditos)"

**Pros:**
- Reduce dependencia tecnológica
- Genera autonomía comunitaria (+8 autonomía)
- Menos consumo eléctrico

**Cons:**
- Costo económico inmediato (-300₡)
- Beneficio de legitimidad menor (+12 vs +18)

**Consecuencias:**
```json
{
  "resources": {
    "creditos": -300,
    "legitimidad": 12,
    "autonomia": 8
  },
  "flags": ["promotores_salud"]
}
```

**Message:** "Yani organiza talleres de 3 semanas. Capacitan a 15 vecinos en primeros auxilios, detección temprana y cuidados básicos. La red de salud se descentraliza. Ahora hay promotores en cada manzana. El dispensario atiende solo casos complejos."

**Justificación balance:**
- Créditos -300: costo de capacitación, materiales, incentivos
- Legitimidad +12: menor que opción 1 (alcance más lento) pero más sostenible
- Autonomía +8: estrategia comunitaria, menos dependencia externa/tecnológica
- Flag promotores_salud: útil para ending "Autonomía Comunitaria"

---

#### **Opción 3:** "Pedir servidor más eficiente a ONG externa (-12 autonomía)"

**Pros:**
- Sin costo económico ni eléctrico
- Atención remota mejorada (+15 legitimidad)
- Tecnología de punta

**Cons:**
- Pérdida de autonomía significativa (-12)
- Dependencia de ayuda externa
- Supervisión de ONG sobre uso del equipo

**Consecuencias:**
```json
{
  "resources": {
    "legitimidad": 15,
    "autonomia": -12
  },
  "flags": ["ayuda_externa_aceptada", "dependencia_tecnologica"]
}
```

**Message:** "La ONG 'Salud Sin Fronteras' dona un servidor de última generación con IA diagnóstica. Es impresionante: detecta patologías que antes requerían hospital. Pero ahora tienen un representante de la ONG 'asesorando' en el dispensario. Algunas decisiones médicas requieren su visto bueno."

**Justificación balance:**
- Legitimidad +15: tecnología de punta, buena atención
- Autonomía -12: alto costo político, supervisión externa
- Gratis: tentador, pero costo es autonomía (trade-off genuino)
- Flags: ayuda_externa_aceptada (suma con otros), dependencia_tecnologica (nuevo)

---

### 5. VERIFICACIÓN DE CALIDAD

#### Checklist Pre-Implementación:

- [x] ¿Diálogo usa voz natural de Yani? → SÍ: empática, técnica, enfocada en comunidad
- [x] ¿Evita clichés identificados? → SÍ: no hay mate, che boludo, etc. innecesarios
- [x] ¿Al menos 2 opciones competitivas? → SÍ: 3 opciones, todas viables según estrategia
- [x] ¿Cada opción tiene pros Y cons claros? → SÍ: todas tienen trade-offs
  - Opción 1: alta legitimidad vs alto consumo eléctrico
  - Opción 2: autonomía + legit vs costo económico
  - Opción 3: gratis + legit vs pérdida autonomía
- [x] ¿Consecuencias proporcionales al costo? → SÍ: valores balanceados
- [x] ¿Flags seteados son coherentes? → SÍ: útiles para endings y futuros encounters
- [x] ¿Message telegrafía efectos futuros? → SÍ: "servidor 12h diarias", "promotores en cada manzana", "representante ONG asesorando"
- [x] ¿Conecta con arco narrativo mayor? → SÍ: arco de Yani, tema autonomía vs ayuda externa

#### Comparación con Original:

| Dimensión | Original | Nuevo | Mejora |
|-----------|----------|-------|--------|
| Autenticidad | 2/5 | 4/5 | +2 |
| Trade-offs | 2/5 | 5/5 | +3 |
| Consecuencias | 3/5 | 5/5 | +2 |
| Coherencia | 3/5 | 4/5 | +1 |
| **TOTAL** | **10/20** | **18/20** | **+8** |

**Target Score:** 18/20 (TIER A) ✅
**Tier:** C → A (2 tiers de mejora)

---

### 6. IMPLEMENTACIÓN JSON

**Archivo:** data/encounters.json (reemplazar sección "yani_seguimiento")

```json
"yani_seguimiento": {
  "id": "yani_seguimiento",
  "title": "Yani - Red de Salud",
  "context": "Yani te llama al dispensario. Desde que tienen electricidad estable, pudieron conectar el sistema de telemedicina donado hace meses. Ahora pueden diagnosticar casos complejos remotamente, pero el servidor consume mucha energía y los vecinos están pidiendo más turnos. La demanda creció 40%. Hay que decidir cómo escalar.",
  "options": [
    {
      "id": 1,
      "text": "Expandir turnos remotos (requiere 40% electricidad)",
      "cost": { "electricidad": 8 },
      "requirements": { "electricidad": 40 },
      "result": {
        "changes": { "legitimidad": 18 },
        "message": "Yani programa turnos de telemedicina todos los días. La demanda se dispara: ahora atienden casos de 3 barrios vecinos. El servidor funciona 12 horas diarias. El dispensario es referencia zonal, pero la red eléctrica está más cargada.",
        "flags": ["telemedicina_expandida"],
        "counters": { "decisiones_cooperativas": 1 }
      }
    },
    {
      "id": 2,
      "text": "Capacitar promotores de salud del barrio (-300 créditos)",
      "cost": { "creditos": 300 },
      "requirements": { "creditos": 300 },
      "result": {
        "changes": { "legitimidad": 12, "autonomia": 8 },
        "message": "Yani organiza talleres de 3 semanas. Capacitan a 15 vecinos en primeros auxilios, detección temprana y cuidados básicos. La red de salud se descentraliza. Ahora hay promotores en cada manzana. El dispensario atiende solo casos complejos.",
        "flags": ["promotores_salud"],
        "counters": { "decisiones_cooperativas": 1 }
      }
    },
    {
      "id": 3,
      "text": "Pedir servidor más eficiente a ONG externa",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": 15, "autonomia": -12 },
        "message": "La ONG 'Salud Sin Fronteras' dona un servidor de última generación con IA diagnóstica. Es impresionante: detecta patologías que antes requerían hospital. Pero ahora tienen un representante de la ONG 'asesorando' en el dispensario. Algunas decisiones médicas requieren su visto bueno.",
        "flags": ["ayuda_externa_aceptada", "dependencia_tecnologica"],
        "counters": { "ayudas_aceptadas": 1 }
      }
    }
  ]
}
```

---

**Status:** ✅ REWRITE COMPLETADO
**Score Estimado:** 18/20 (TIER A)
**Mejora:** +8 puntos (de 10/20 a 18/20)

---

## Rewrite #2: yani_preparacion_final

### 1. ANÁLISIS DEL PROBLEMA

**Versión Original:**
```json
{
  "id": "yani_preparacion_final",
  "title": "Yani - Preparación Final",
  "context": "Yani te cuenta que se acerca el invierno más duro. Hay que preparar el dispensario para las emergencias que vienen.",
  "options": [
    {
      "id": 1,
      "text": "Stockear medicamentos y mantas (-300 créditos)",
      "cost": { "creditos": 300 },
      "requirements": { "creditos": 300 },
      "result": {
        "changes": { "legitimidad": 20 },
        "message": "Compraste stock de medicamentos y mantas para el invierno. La red está preparada para lo que venga.",
        "flags": ["stock_invierno"]
      }
    },
    {
      "id": 2,
      "text": "Fortalecer la red de cuidados",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": 15 },
        "message": "Organizaste una red de vecinos que se cuidan mutuamente en emergencias. El cuidado colectivo es la mejor defensa.",
        "flags": ["red_cuidados"]
      }
    }
  ]
}
```

**Problemas Identificados en Audit:**
1. **"Invierno más duro" sin especificar:** ¿Por qué es más duro? ¿Qué cambió en 2037?
2. **Trade-off roto:** Opción 2 gratis da 75% del beneficio (+15 legit vs +20)
3. **Flags sin payoff:** stock_invierno y red_cuidados no se usan después
4. **No hay evento de invierno:** Preparación sin testeo posterior

**Score Original:** 12/20 (TIER B)
- Autenticidad: 3/5 - "Invierno duro" genérico
- Trade-offs: 3/5 - Opción gratis 75% del beneficio
- Consecuencias: 3/5 - Flags no usados
- Coherencia: 3/5 - Cierre de arco pero tono menor

---

### 2. OBJETIVOS DEL REWRITE

**Resolver:**
- [x] "Invierno duro" genérico → Crisis específica pre-crisis_final (día 50-54)
- [x] Trade-off roto → 3 opciones con costos/beneficios balanceados
- [x] Flags sin payoff → Flags que afecten crisis_final o endings
- [x] Preparación sin testeo → Conectar explícitamente con crisis_final

**Mejorar:**
- [x] Autenticidad cultural (target: 4/5) → Contexto climático 2037 específico
- [x] Trade-offs genuinos (target: 4/5) → Opciones competitivas
- [x] Consecuencias lógicas (target: 5/5) → Flags útiles en crisis_final
- [x] Coherencia narrativa (target: 5/5) → Setup perfecto para climax

**Mantener:**
- ✅ Cierre del arco de Yani
- ✅ Tema de cuidado comunitario
- ✅ Preparación para final del juego
- ✅ Tono empático

---

### 3. INVESTIGACIÓN Y CONTEXTO

**Contexto en historia (día 50-54, pre-crisis_final):**
- **Qué pasó antes:** yani_seguimiento (red de salud escalada), posible yani_crisis_medica
- **Estado típico de recursos:** Día 50-54, preparándose para crisis_final (día 55)
- **Arco de Yani:** Este es su último encounter antes del climax, debe preparar para lo peor
- **Crisis_final:** Gran sudestada día 55 (vientos 120km/h, apagón masivo)

**Referencias para autenticidad (Buenos Aires 2037):**
- Cambio climático: inviernos más extremos, olas de frío polar intensas
- Sistema de salud: colapso anticipado ante crisis climáticas
- Tecnología: monitoreo de temperatura remoto, alertas tempranas
- Contexto: "Invierno duro" no es suficiente → **ola de frío polar + gran sudestada** combinadas

**Evitar:**
- ❌ "Invierno genérico"
- ❌ Opción gratis dominante
- ✅ Usar: Crisis dual (frío + tormenta), preparación técnica específica

**Mecánicas a considerar:**
- Este encounter debe IMPORTAR en crisis_final
- Flags deben dar ventajas/desventajas en encounter día 55
- Setup de Chekhov's Gun: si preparás, debe usarse

---

### 4. PROPUESTA DE REWRITE

**Nuevo Título:** Yani - Protocolo de Emergencia

**Nuevo Context:**
"Yani está preocupada. Los pronósticos climáticos para las próximas semanas son alarmantes: una ola de frío polar (-8°C en Buenos Aires) justo cuando se espera la gran sudestada. Es la combinación más peligrosa. El dispensario puede ser refugio de emergencia si lo preparás ahora, pero implica decisiones difíciles sobre recursos."

**Principios aplicados:**
- ✅ Específico 2037: pronósticos climáticos avanzados, combinación de crisis
- ✅ Urgencia real: preparación para crisis_final (día 55)
- ✅ Voz Yani: preocupada pero proactiva, pensando en comunidad
- ✅ Setup narrativo: estas decisiones afectarán crisis_final

---

### Nuevas Opciones:

#### **Opción 1:** "Convertir dispensario en refugio de emergencia (-400 créditos, -5% electricidad)"

**Pros:**
- Refugio preparado para crisis_final
- Alta legitimidad (+22)
- Flag ventajoso para día 55

**Cons:**
- Caro (-400₡)
- Consume electricidad permanente (-5%)
- Requiere recursos ahora

**Consecuencias:**
```json
{
  "resources": {
    "creditos": -400,
    "electricidad": -5,
    "legitimidad": 22
  },
  "flags": ["refugio_preparado"]
}
```

**Message:** "Yani coordina la conversión en 4 días. Instalan calefactores de bajo consumo, stockean mantas térmicas y medicamentos para hipotermia. Refuerzan las ventanas. El dispensario ahora puede albergar 80 personas en emergencia. Los vecinos se sienten más seguros ante lo que viene."

**Justificación balance:**
- Créditos -400: equipamiento (calefactores, mantas, refuerzos)
- Electricidad -5%: consumo permanente de calefactores en standby
- Legitimidad +22: alta porque es preparación visible y tranquilizadora
- Flag refugio_preparado: en crisis_final (día 55) da opción especial de proteger comunidad

---

#### **Opción 2:** "Organizar red de refugios distribuidos (-250 créditos, +10 autonomía)"

**Pros:**
- Más barato que opción 1 (-250₡ vs -400₡)
- Gana autonomía (+10)
- Descentralizado (más resiliente)

**Cons:**
- Legitimidad menor (+15 vs +22)
- Requiere coordinación comunitaria
- No hay un refugio central grande

**Consecuencias:**
```json
{
  "resources": {
    "creditos": -250,
    "legitimidad": 15,
    "autonomia": 10
  },
  "flags": ["red_refugios_distribuida"]
}
```

**Message:** "Yani propone algo diferente: en vez de un refugio central, preparar 8 casas distribuidas en el barrio. Cada una con estufa a leña, stock de mantas y un promotor de salud. Si pasa algo, la gente se refugia en el lugar más cercano. Es menos impresionante pero más resiliente. La red se autogestiona."

**Justificación balance:**
- Créditos -250: más barato (estufas a leña, no calefactores eléctricos)
- Legitimidad +15: menor que refugio central (menos visible)
- Autonomía +10: estrategia descentralizada y autogestiva
- Flag red_refugios_distribuida: en crisis_final da ventaja en autonomía

---

#### **Opción 3:** "Confiar en preparación individual (gratis, arriesgado)"

**Pros:**
- Sin costo económico ni eléctrico
- Mantiene recursos para otras prioridades

**Cons:**
- No gana legitimidad
- Arriesgado para crisis_final
- Flag negativo (desprepara dos)

**Consecuencias:**
```json
{
  "resources": {
    "legitimidad": -5
  },
  "flags": ["sin_preparacion_frio"]
}
```

**Message:** "Decidís que cada familia se prepare como pueda. Yani no está convencida. Algunos vecinos empiezan a stockear por su cuenta, pero de forma desorganizada. Hay tensión: los que no tienen recursos para prepararse se sienten abandonados. Cuando llegue la crisis, estarán solos."

**Justificación balance:**
- Gratis: tentador para jugadores con recursos escasos
- Legitimidad -5: decisión impopular, genera división
- Flag sin_preparacion_frio: en crisis_final genera desventaja o mayor dificultad

---

### 5. VERIFICACIÓN DE CALIDAD

#### Checklist Pre-Implementación:

- [x] ¿Diálogo usa voz natural de Yani? → SÍ: preocupada, proactiva, técnica
- [x] ¿Evita clichés identificados? → SÍ: crisis específica, no genérica
- [x] ¿Al menos 2 opciones competitivas? → SÍ: 3 opciones, trade-offs claros
- [x] ¿Cada opción tiene pros Y cons claros? → SÍ:
  - Opción 1: mejor preparación vs más caro
  - Opción 2: balance autonomía/costo vs menor legit
  - Opción 3: gratis vs desventaja en crisis_final
- [x] ¿Consecuencias proporcionales al costo? → SÍ: valores balanceados
- [x] ¿Flags seteados son coherentes? → SÍ: afectarán crisis_final
- [x] ¿Message telegrafía efectos futuros? → SÍ: "ante lo que viene", "cuando llegue la crisis"
- [x] ¿Conecta con arco narrativo mayor? → SÍ: setup perfecto para crisis_final (día 55)

#### Comparación con Original:

| Dimensión | Original | Nuevo | Mejora |
|-----------|----------|-------|--------|
| Autenticidad | 3/5 | 4/5 | +1 |
| Trade-offs | 3/5 | 4/5 | +1 |
| Consecuencias | 3/5 | 5/5 | +2 |
| Coherencia | 3/5 | 5/5 | +2 |
| **TOTAL** | **12/20** | **18/20** | **+6** |

**Target Score:** 18/20 (TIER A) ✅
**Tier:** B → A (1 tier de mejora)

---

### 6. IMPLEMENTACIÓN JSON

**Archivo:** data/encounters.json (reemplazar sección "yani_preparacion_final")

```json
"yani_preparacion_final": {
  "id": "yani_preparacion_final",
  "title": "Yani - Protocolo de Emergencia",
  "context": "Yani está preocupada. Los pronósticos climáticos para las próximas semanas son alarmantes: una ola de frío polar (-8°C en Buenos Aires) justo cuando se espera la gran sudestada. Es la combinación más peligrosa. El dispensario puede ser refugio de emergencia si lo preparás ahora, pero implica decisiones difíciles sobre recursos.",
  "options": [
    {
      "id": 1,
      "text": "Convertir dispensario en refugio de emergencia (-400 créditos, -5% electricidad)",
      "cost": { "creditos": 400, "electricidad": 5 },
      "requirements": { "creditos": 400, "electricidad": 40 },
      "result": {
        "changes": { "legitimidad": 22 },
        "message": "Yani coordina la conversión en 4 días. Instalan calefactores de bajo consumo, stockean mantas térmicas y medicamentos para hipotermia. Refuerzan las ventanas. El dispensario ahora puede albergar 80 personas en emergencia. Los vecinos se sienten más seguros ante lo que viene.",
        "flags": ["refugio_preparado"],
        "counters": { "decisiones_cooperativas": 1 }
      }
    },
    {
      "id": 2,
      "text": "Organizar red de refugios distribuidos (-250 créditos)",
      "cost": { "creditos": 250 },
      "requirements": { "creditos": 250 },
      "result": {
        "changes": { "legitimidad": 15, "autonomia": 10 },
        "message": "Yani propone algo diferente: en vez de un refugio central, preparar 8 casas distribuidas en el barrio. Cada una con estufa a leña, stock de mantas y un promotor de salud. Si pasa algo, la gente se refugia en el lugar más cercano. Es menos impresionante pero más resiliente. La red se autogestiona.",
        "flags": ["red_refugios_distribuida"],
        "counters": { "decisiones_cooperativas": 1 }
      }
    },
    {
      "id": 3,
      "text": "Confiar en preparación individual (arriesgado)",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": -5 },
        "message": "Decidís que cada familia se prepare como pueda. Yani no está convencida. Algunos vecinos empiezan a stockear por su cuenta, pero de forma desorganizada. Hay tensión: los que no tienen recursos para prepararse se sienten abandonados. Cuando llegue la crisis, estarán solos.",
        "flags": ["sin_preparacion_frio"],
        "counters": { "decisiones_duras": 1 }
      }
    }
  ]
}
```

---

**Status:** ✅ REWRITE COMPLETADO
**Score Estimado:** 18/20 (TIER A)
**Mejora:** +6 puntos (de 12/20 a 18/20)

**NOTA IMPORTANTE:** Este rewrite crea flags que deberían usarse en `crisis_final` para dar ventajas/desventajas basadas en preparación. Considerar agregar opciones condicionales en crisis_final basadas en estos flags.

---

