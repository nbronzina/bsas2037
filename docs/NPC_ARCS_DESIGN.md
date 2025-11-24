# Diseño de Sistema de Arcos Narrativos - Red de Aguante

**Versión:** 1.0
**Fecha:** 2025-11-24
**Autor:** Sistema de Arcos NPCs

---

## Concepto

Cada NPC tiene un "arco narrativo" que progresa en 3 etapas (actos):

- **Acto 1 (Días 1-20):** Estado inicial, presentación del personaje
- **Acto 2 (Días 21-40):** Desarrollo y transformación
- **Acto 3 (Días 41-60):** Consecuencias y resultado final

La progresión puede ser:
- **Temporal:** Automática según día actual (baseline)
- **Por decisiones:** Triggereada por flags específicos en encounters
- **Híbrida:** Combinación de ambos (**IMPLEMENTACIÓN ELEGIDA**)

---

## Arquitectura Técnica

### Estructura de Datos

Agregar a `gameState.characters[name]`:

```javascript
{
  name: "Beto",
  available: true,
  task: null,
  taskId: null,
  taskData: null,
  daysRemaining: 0,

  // NUEVO: Sistema de arcos
  arc: {
    stage: 1,              // 1, 2, o 3 (Acto actual)
    path: null,            // Path específico en acto 3 (idealista, pragmatico, etc.)
    triggers: [],          // Array de flags que han activado progresión
    lastInteraction: 0,    // Último día que se interactuó con NPC
    relationshipScore: 0   // -10 a +10 (opcional, futuro)
  }
}
```

### Progresión de Arcos - Sistema Híbrido

```javascript
function updateNPCArcs() {
  const day = gameState.timeManager.currentDay;

  Object.entries(gameState.characters).forEach(([name, character]) => {
    // 1. Baseline temporal (mínimo stage según día)
    let minStage = 1;
    if (day >= 41) minStage = 3;
    else if (day >= 21) minStage = 2;

    // 2. Triggers pueden adelantar progresión
    const triggerStage = calculateStageFromTriggers(name, character.arc.triggers);

    // 3. El stage es el máximo entre temporal y triggers
    character.arc.stage = Math.max(minStage, triggerStage);
  });
}
```

**Ventajas del sistema híbrido:**
- ✅ Garantiza progresión mínima (nadie se queda en stage 1 forever)
- ✅ Permite progresión acelerada por buenas decisiones
- ✅ Jugadores pasivos ven arcos básicos, activos ven arcos profundos
- ✅ Rejugabilidad: diferentes runs = diferentes paths

---

## Arco: BETO - "El Pragmático se Vuelve Idealista"

### Perfil Base

- **Nombre completo:** Roberto "Beto" Fernández
- **Edad:** ~45 años
- **Rol:** Electricista comunitario
- **Personalidad inicial:** Pragmático extremo, escéptico, enfocado en sobrevivir día a día
- **Arco temático:** Descubre que la red puede ser más que subsistencia, puede ser construcción colectiva

---

### ACTO 1: El Pragmático (Días 1-20)

**Personalidad:**
- Habla SOLO de problemas técnicos inmediatos
- Escéptico de cualquier plan a largo plazo
- "Si funciona, no lo toques"
- Sin emoción visible, puro pragmatismo
- Ve la red como un trabajo de supervivencia, no un proyecto político

**Diálogos de Interacción (MapScene):**
```javascript
[
  "Transformadores al 70%. Mientras no baje de 60 estamos bien.",
  "No me vengas con planes a futuro. Primero que llegue la luz, después vemos.",
  "¿Expandir? Che, primero mantengamos lo que tenemos funcionando.",
  "Mirá, yo arreglo cables. La política no es lo mío.",
  "Mientras haya corriente para las heladeras, vamos bien."
]
```

**Flags Asociados:**
- `beto_conocido`: Primera interacción
- `beto_confia_tecnico`: Si jugador siguió sus consejos técnicos en encounters

**Trigger de Progresión a Acto 2:**
- Temporal: Día 21
- Early trigger: Flag `comunidad_estable` (si recursos >50% por 5 días consecutivos)

---

### ACTO 2: El Cuestionamiento (Días 21-40)

**Transición Narrativa:**
Beto empieza a notar que la red no es solo un sistema técnico. Es comunidad. Ve cómo la gente confía, cómo los pibes aprenden, cómo otros barrios los miran con esperanza.

**Personalidad:**
- Empieza a hablar de "nosotros" en vez de solo "el sistema"
- Menciona comunidad, no solo técnica
- Propone ideas proactivas (no solo reactivas)
- Muestra más emoción: entusiasmo, duda, esperanza
- Cuestiona su propio pragmatismo

**Diálogos de Interacción:**
```javascript
[
  "Estuve pensando... Con lo que logramos acá, podríamos ayudar a otros barrios.",
  "No es solo electricidad. Es que la gente confía en nosotros, ¿viste?",
  "Valeria tenía razón. Esto es más grande que mantener las luces prendidas.",
  "Vi pibes del barrio que ahora entienden los sistemas. Eso vale más que cualquier cable.",
  "Hay una red vecina en Constitución. Capaz podríamos conectarnos, compartir recursos."
]
```

**Encounter Clave:**
- **Día 30:** `beto_propone_expansion` - **MOMENTO BISAGRA DEL ARCO**
- Beto propone expandir la red a barrios vecinos
- Jugador decide: Apoyar / Rechazar / Posponer
- Esta decisión determina el path de Acto 3

**Flags Asociados:**
- `beto_propone_expansion`: Trigger del encounter
- `beto_idealista_activado`: Si apoyaste su idea
- `beto_desalentado`: Si rechazaste

**Trigger de Progresión a Acto 3:**
- Temporal: Día 41
- Early trigger: Flags `beto_idealista_activado` OR `beto_desalentado`

---

### ACTO 3: La Consecuencia (Días 41-60)

#### PATH A: Idealista Empoderado

**Condiciones:** Flag `beto_idealista_activado` presente

**Personalidad:**
- Transformado completamente: ahora habla de política, territorio, redes
- Coordina con otros barrios activamente
- Mentor de jóvenes electricistas
- Ve la red como proyecto de transformación social
- Energético, propositivo, esperanzado

**Diálogos:**
```javascript
[
  "Conectamos con dos barrios más. La red está creciendo, loco.",
  "No puedo creer que el chabón que solo quería arreglar cables ahora esté coordinando toda esta movida.",
  "Esto es lo que soñábamos al principio, ¿te acordás? Pero en serio.",
  "Ya no somos una red de aguante. Somos una red de construcción.",
  "Pase lo que pase, cambiamos algo acá. Eso nadie nos lo saca."
]
```

**Flag para Ending:** `beto_ending_idealista`

---

#### PATH B: Pragmático Experimentado

**Condiciones:** Flag `beto_desalentado` presente OR neutral (sin flags de path)

**Personalidad:**
- Volvió a su pragmatismo, pero más sabio
- Resignado pero no amargado
- Acepta que hizo lo que pudo
- "No cambiamos el mundo, pero sobrevivimos"
- Cierto tono melancólico de "qué hubiera pasado si..."

**Diálogos:**
```javascript
[
  "Bueno, al menos mantuvimos todo funcionando. No es poco.",
  "Capaz tenía ideas muy grandes. Pero mirá, llegamos hasta acá.",
  "No expandimos, pero tampoco nos caímos. Eso cuenta.",
  "A veces pienso qué hubiera pasado si... Bah, no importa. Seguimos acá.",
  "La electricidad sigue fluyendo. Eso era el objetivo, ¿no?"
]
```

**Flag para Ending:** `beto_ending_pragmatico`

---

## Arco: YANI - "La Cuidadora se Cuida"

### Perfil Base

- **Nombre completo:** Yanina "Yani" Romero
- **Edad:** ~38 años
- **Rol:** Enfermera comunitaria, coordinadora de salud
- **Personalidad inicial:** Cuidadora incondicional, siempre pendiente de otros, NUNCA de sí misma
- **Arco temático:** Aprende (o no) que cuidarse es necesario para poder cuidar a otros

---

### ACTO 1: La Cuidadora Incondicional (Días 1-20)

**Personalidad:**
- Habla SOLO de otros, nunca de sí misma
- Minimiza o ignora sus propias necesidades
- "Estoy bien" es su frase por defecto
- Trabaja sin parar, sin límites
- Deflecta cualquier preocupación hacia ella
- Ve el autocuidado como egoísmo

**Diálogos de Interacción:**
```javascript
[
  "Hay tres familias con chicos que necesitan revisión médica. Voy para allá.",
  "¿Yo? Estoy bien. Preguntame por la señora del 4to, ella sí necesita ayuda.",
  "Mientras pueda pararme, puedo cuidar. Es así.",
  "No me pidas que descanse cuando hay gente que la está pasando mal.",
  "Vi a Marcos. Creo que no está durmiendo bien. Alguien debería hablar con él."
]
```

**Flags Asociados:**
- `yani_conocida`: Primera interacción
- `yani_sobrecargada`: Si asignaste 3+ tareas sociales/salud seguidas

**Trigger de Progresión a Acto 2:**
- Temporal: Día 21
- Early trigger: Flag `yani_sobrecargada` (acelera a acto 2 si está quemándose)

---

### ACTO 2: Las Grietas (Días 21-40)

**Transición Narrativa:**
El cuerpo y la mente de Yani empiezan a mostrar grietas. Cansancio que ya no puede ocultar, momentos de frustración, otros notando su agotamiento.

**Personalidad:**
- Empieza a mostrar cansancio visible
- Menciona agotamiento pero lo minimiza ("estoy un poco cansada, pero...")
- Otros NPCs expresan preocupación por ella
- Pequeños deslices de frustración o tristeza
- Sigue trabajando pero con más esfuerzo

**Diálogos de Interacción:**
```javascript
[
  "Estoy un poco cansada, pero nada que no se solucione. [pausa] Hay mucho que hacer igual.",
  "A veces siento que... No, olvídalo. ¿Cómo está la situación del agua?",
  "Beto me dijo que descanse. Es raro que él me preocupe a mí en vez de al revés.",
  "No sé si puedo seguir atendiendo a todos. Pero tampoco puedo no hacerlo.",
  "Me duele la espalda. Perdón, no quería quejarme. ¿En qué estábamos?"
]
```

**Encounter Clave:**
- **Día 35:** `yani_al_limite` - **MOMENTO BISAGRA DEL ARCO**
- Encontrás a Yani colapsada emocionalmente
- Jugador decide: Descanso / Presionar / Buscar ayuda
- Esta decisión determina el path de Acto 3

**Flags Asociados:**
- `yani_revelacion`: Trigger del encounter
- `yani_tomo_descanso`: Si la apoyaste a descansar
- `yani_burnout`: Si la presionaste a seguir
- `yani_equipo_salud`: Si organizaste ayuda colectiva

**Trigger de Progresión a Acto 3:**
- Temporal: Día 41
- Early trigger: Flags `yani_tomo_descanso` OR `yani_burnout` OR `yani_equipo_salud`

---

### ACTO 3: La Integración (Días 41-60)

#### PATH A: Cuidadora Balanceada

**Condiciones:** Flag `yani_tomo_descanso` presente

**Personalidad:**
- Aprendió a balancear cuidar a otros y a sí misma
- Delega tareas, confía en otros
- Toma descansos sin culpa
- Más efectiva porque está descansada
- Modelo de cuidado sustentable

**Diálogos:**
```javascript
[
  "Entendí algo: si me quiebro, no puedo ayudar a nadie. Ahora delego más.",
  "Enseñé a dos vecinas primeros auxilios. Ya no tengo que hacer todo sola.",
  "Tomé un día libre la semana pasada. No se cayó el mundo. ¿Sabés qué? Volví con más energía.",
  "Aprendí a pedir ayuda. Es difícil, pero necesario.",
  "Cuido a la comunidad. Y la comunidad me cuida a mí. Así tiene que ser."
]
```

**Flag para Ending:** `yani_ending_balanceada`

---

#### PATH B: Cuidadora Quemada

**Condiciones:** Flag `yani_burnout` presente

**Personalidad:**
- Sigue trabajando pero está exhausta
- Signos visibles de burnout (peso, sueño, salud)
- Sonríe pero es una máscara
- "Aguanté" es su mantra, pero a qué costo
- Insustentable a largo plazo

**Diálogos:**
```javascript
[
  "Aguanté. No sé cómo, pero aguanté.",
  "Perdí peso. No duermo bien. Pero la gente está mejor, eso es lo que importa.",
  "A veces me pregunto qué va a quedar de mí cuando esto termine.",
  "[Está claramente exhausta pero sonríe] Estoy bien, no te preocupes.",
  "Después descansaré. Después del día 60. O 70. O cuando sea."
]
```

**Flag para Ending:** `yani_ending_burnout`

---

#### PATH C: Cuidadora Comunitaria

**Condiciones:** Flag `yani_equipo_salud` presente

**Personalidad:**
- Transformó el cuidado individual en cuidado colectivo
- Líder de equipo de salud comunitaria
- Sigue trabajando mucho pero de forma sustentable
- Multiplicó su impacto delegando y enseñando
- Modelo de organización comunitaria

**Diálogos:**
```javascript
[
  "Armamos un equipo de salud. Ya somos cinco haciendo lo que hacía yo sola.",
  "Descubrí que cuidar no significa hacerlo todo. Significa organizar para que todos cuiden.",
  "La red no depende de mí. Depende de todas. Eso me da paz.",
  "Sigo trabajando mucho, pero ahora es sustentable. Hay diferencia.",
  "Estoy cansada, pero es un cansancio... bueno. ¿Tiene sentido?"
]
```

**Flag para Ending:** `yani_ending_comunitaria`

---

## Arco: MARCOS - "El Reservado Encuentra su Voz"

### Perfil Base

- **Nombre completo:** Marcos Aguirre
- **Edad:** ~32 años
- **Rol:** Ingeniero civil, especialista en sistemas hídricos
- **Personalidad inicial:** Callado extremo, reservado, responde con monosílabos
- **Arco temático:** Gana (o no) confianza para expresar sus ideas y conectar con la comunidad

---

### ACTO 1: El Silencioso (Días 1-20)

**Personalidad:**
- Habla lo mínimo indispensable
- Respuestas de 1-5 palabras máximo
- Nunca propone iniciativas, solo ejecuta
- No participa en asambleas (está presente pero callado)
- Evita contacto visual prolongado
- Comunicación 90% técnica, 0% social

**Diálogos de Interacción:**
```javascript
[
  "La perforación va bien.",
  "Sí.",
  "Hm. Podría funcionar.",
  "...",
  "[Asiente con la cabeza]"
]
```

**Flags Asociados:**
- `marcos_conocido`: Primera interacción
- `marcos_exitoso_tecnico`: Si completó tareas de agua exitosamente

**Trigger de Progresión a Acto 2:**
- Temporal: Día 21
- Early trigger: Flag `marcos_exitoso_tecnico` + `comunidad_estable`

---

### ACTO 2: Las Primeras Palabras (Días 21-40)

**Transición Narrativa:**
Marcos empieza a sentir que su trabajo importa, que la gente valora lo que hace. Lentamente gana confianza.

**Personalidad:**
- Oraciones completas (¡progreso!)
- Empieza a explicar ideas técnicas con más detalle
- Todavía tímido en asambleas pero participa brevemente
- Muestra pasión por su trabajo cuando habla de sistemas
- Menos monosílabos, más explicaciones

**Diálogos de Interacción:**
```javascript
[
  "Estaba pensando... Podríamos optimizar el sistema de filtrado. Es más eficiente.",
  "Me gusta esto. El trabajo tiene sentido. No es solo un sueldo.",
  "Valeria me pidió que hable en la asamblea. No sé... Tal vez.",
  "Nunca fui bueno hablando. Pero esto... esto vale la pena explicar.",
  "Tengo una propuesta para mejorar la distribución. ¿Querés que la presente?"
]
```

**Encounter Clave:**
- **Día 28:** `marcos_primera_voz` - **MOMENTO BISAGRA DEL ARCO**
- Marcos habla por primera vez en asamblea pública
- Jugador decide: Apoyar / Cuestionar / Neutral
- Esta decisión determina el path de Acto 3

**Flags Asociados:**
- `marcos_primera_voz`: Trigger del encounter
- `marcos_apoyado`: Si validaste su participación
- `marcos_ignorado`: Si no le diste espacio o cuestionaste

**Trigger de Progresión a Acto 3:**
- Temporal: Día 41
- Early trigger: Flags `marcos_apoyado` OR `marcos_ignorado`

---

### ACTO 3: El Resultado (Días 41-60)

#### PATH A: Voz Propositiva (Líder Técnico)

**Condiciones:** Flag `marcos_apoyado` presente

**Personalidad:**
- Transformación completa: ahora habla con confianza
- Propone ideas activamente
- Enseña a otros (mentor)
- Participa en asambleas con voz clara
- Descubrió que disfruta la comunicación cuando es sobre algo que importa

**Diálogos:**
```javascript
[
  "Tengo tres propuestas para optimizar la red. ¿Las vemos ahora o en la asamblea?",
  "Nunca pensé que iba a disfrutar hablar con gente. Pero cuando es sobre algo que importa...",
  "Estoy enseñando a dos pibes del barrio sobre sistemas hídricos. Son rápidos para aprender.",
  "Me eligieron para coordinar el equipo técnico. Yo. El chabón que no hablaba.",
  "Al principio solo quería hacer mi laburo. Ahora entiendo que el laburo ES la comunidad."
]
```

**Flag para Ending:** `marcos_ending_lider`

---

#### PATH B: Competente Callado

**Condiciones:** Neutral (sin flags de path específico)

**Personalidad:**
- Volvió al silencio, pero más cómodo con ello
- "Hice mi parte y la hice bien"
- No siente necesidad de hablar más de lo necesario
- Competente técnico, callado social
- Sin resentimiento, simplemente es así

**Diálogos:**
```javascript
[
  "El sistema funciona. Eso es lo importante.",
  "Hablo cuando es necesario. No más.",
  "Hice mi parte. Bien hecha.",
  "[Responde con asentimiento]",
  "Prefiero que mi trabajo hable por mí."
]
```

**Flag para Ending:** `marcos_ending_callado`

---

#### PATH C: Retraído

**Condiciones:** Flag `marcos_ignorado` presente

**Personalidad:**
- Se cerró completamente tras ser cuestionado
- Aprendió a no proponer ideas
- "Hago lo que me piden, no más"
- Amargura sutil, resentimiento contenido
- Evita interacciones no técnicas

**Diálogos:**
```javascript
[
  "Mejor me quedo callado. Total...",
  "Hago lo que me piden. Sin proponer.",
  "...",
  "Aprendí la lección. Hablo solo de lo técnico.",
  "[Evita contacto visual]"
]
```

**Flag para Ending:** `marcos_ending_retraido`

---

## Resumen de Arcos - Vista General

| NPC | Acto 1 (1-20) | Acto 2 (21-40) | Acto 3 (41-60) | Paths Acto 3 | Encounter Clave |
|-----|---------------|----------------|----------------|--------------|-----------------|
| **Beto** | Pragmático | Cuestionamiento | Consecuencia | • Idealista<br>• Pragmático | Día 30: beto_propone_expansion |
| **Yani** | Cuidadora incondicional | Grietas | Integración | • Balanceada<br>• Burnout<br>• Comunitaria | Día 35: yani_al_limite |
| **Marcos** | Silencioso | Primeras palabras | Resultado | • Líder<br>• Callado<br>• Retraído | Día 28: marcos_primera_voz |
| **Valeria** | Líder estable | Líder consolidada | Líder veterana | (Sin paths, consistente) | (No tiene encounter de arco) |

**Total:**
- **3 NPCs con arcos completos** (Beto, Yani, Marcos)
- **9 etapas narrativas** (3 actos × 3 NPCs)
- **8 paths únicos en Acto 3**
- **35+ diálogos contextuales nuevos**
- **3 encounters críticos de arco**

---

## Implementación Técnica - Detalles

### Triggers de Progresión Temprana

Los siguientes flags pueden acelerar la progresión antes del límite temporal:

**Beto:**
- `beto_idealista_activado` → Force stage 3, path "idealista"
- `beto_desalentado` → Force stage 3, path "pragmatico"
- `beto_propone_expansion` → Force stage 2 mínimo

**Yani:**
- `yani_tomo_descanso` → Force stage 3, path "balanceada"
- `yani_burnout` → Force stage 3, path "burnout"
- `yani_equipo_salud` → Force stage 3, path "comunitaria"
- `yani_revelacion` → Force stage 2 mínimo

**Marcos:**
- `marcos_apoyado` → Force stage 3, path "lider"
- `marcos_ignorado` → Force stage 3, path "retraido"
- `marcos_primera_voz` → Force stage 2 mínimo

### Persistencia en Save/Load

El objeto `arc` debe persistirse completamente en localStorage:

```javascript
// Al guardar
localStorage.setItem('gameState', JSON.stringify({
  // ... otros datos ...
  characters: {
    beto: {
      // ... datos existentes ...
      arc: {
        stage: 2,
        path: null,
        triggers: ['beto_propone_expansion'],
        lastInteraction: 30,
        relationshipScore: 0
      }
    },
    // ... otros NPCs ...
  }
}));

// Al cargar
const savedState = JSON.parse(localStorage.getItem('gameState'));
gameState.characters = savedState.characters; // Incluye arc objects
```

### Integración con Endings

Los flags de endings (`*_ending_*`) deben usarse en `src/utils/endings.js`:

```javascript
function determineEnding() {
  // ... lógica existente ...

  // Considerar paths de NPCs
  const betoIdealista = gameState.flags.includes('beto_ending_idealista');
  const yaniComunitaria = gameState.flags.includes('yani_ending_comunitaria');
  const marcosLider = gameState.flags.includes('marcos_ending_lider');

  if (betoIdealista && yaniComunitaria && marcosLider) {
    return 'victoria_colectiva_profunda'; // Nuevo ending especial
  }

  // ... resto de lógica ...
}
```

---

## Métricas de Éxito

**Implementación:**
- [x] 3 NPCs con 3 stages cada uno (9 stages totales)
- [x] 8 paths únicos en Acto 3
- [x] 35+ diálogos contextuales
- [x] 3 encounters de arco críticos
- [x] Sistema híbrido temporal + triggers
- [x] Persistencia en save/load

**Jugabilidad:**
- [ ] Progresión temporal funciona (días 1-20, 21-40, 41-60)
- [ ] Progresión por triggers funciona (early progression)
- [ ] Diálogos cambian según stage/path
- [ ] Encounters de arco aparecen en días correctos
- [ ] Múltiples runs generan paths diferentes

**Narrativa:**
- [ ] Arcos coherentes con personalidades
- [ ] Transformaciones creíbles
- [ ] Paths genuinamente diferentes
- [ ] Rejugabilidad aumentada

---

## Próximos Pasos Post-Implementación

1. **Valeria Arc (Opcional):** Considerar si Valeria necesita arco o si su estabilidad es parte del diseño
2. **Relationship Score:** Implementar sistema de puntos de relación (-10 a +10) para modificar diálogos
3. **Conditional Dialogues:** Diálogos adicionales que referencien decisiones específicas del jugador
4. **Ending Variants:** Crear endings específicos para combinaciones de paths (ej: todos idealistas, todos quemados, etc.)
5. **Visual Feedback:** Indicadores visuales en MapScene de stage actual de NPCs

---

**Fin del Diseño de Sistema de Arcos Narrativos**

**Versión:** 1.0
**Estado:** Diseño completo, listo para implementación
**Tiempo Estimado Implementación:** 10h
