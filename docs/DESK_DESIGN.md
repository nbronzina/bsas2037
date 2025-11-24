# Red de Aguante - Versión Escritorio

## Concepto

El jugador es coordinador de una red autogestionada en Buenos Aires 2037. En vez de explorar un mapa, recibe **documentos** en su escritorio que requieren decisiones. Cada decisión afecta los recursos de la comunidad.

**Duración:** 7 días (1 semana laboral + fin de semana)
**Tiempo real:** 15-25 minutos por partida
**Complejidad:** Simplificada para accesibilidad

---

## Flujo de Juego

```
┌─────────────────────────────────────────────────────────┐
│                      INICIO                             │
│                         │                               │
│                         ▼                               │
│              ┌─────────────────────┐                    │
│              │   PANTALLA TÍTULO   │                    │
│              │  [Nueva Partida]    │                    │
│              │  [Continuar]        │                    │
│              │  [Configuración]    │                    │
│              └─────────────────────┘                    │
│                         │                               │
│                         ▼                               │
│              ┌─────────────────────┐                    │
│              │   INTRO (1 vez)     │                    │
│              │  Contexto breve     │                    │
│              │  2-3 pantallas      │                    │
│              └─────────────────────┘                    │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  DÍA X                           │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │           ESCRITORIO                       │  │  │
│  │  │                                            │  │  │
│  │  │  ┌──────────────────────────────────┐     │  │  │
│  │  │  │  📄 DOCUMENTO                    │     │  │  │
│  │  │  │                                  │     │  │  │
│  │  │  │  De: Beto                        │     │  │  │
│  │  │  │  Re: Reparación generador        │     │  │  │
│  │  │  │                                  │     │  │  │
│  │  │  │  [Texto del documento...]        │     │  │  │
│  │  │  │                                  │     │  │  │
│  │  │  │  ┌───────────┐  ┌────────────┐  │     │  │  │
│  │  │  │  │ Opción A  │  │  Opción B  │  │     │  │  │
│  │  │  │  │ +15⚡ -20💰│  │   -10🤝    │  │     │  │  │
│  │  │  │  └───────────┘  └────────────┘  │     │  │  │
│  │  │  └──────────────────────────────────┘     │  │  │
│  │  │                                            │  │  │
│  │  │  📬 Bandeja: 2 documentos restantes        │  │  │
│  │  │  🏠 Recursos: ⚡60 💧55 🤝70 ✊65           │  │  │
│  │  │                                            │  │  │
│  │  │  [Pausa]  [Terminar Día]                  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                      │                           │  │
│  │         ┌────────────┴────────────┐              │  │
│  │         ▼                         ▼              │  │
│  │  [Decidir documento]      [Terminar día]         │  │
│  │         │                         │              │  │
│  │         ▼                         ▼              │  │
│  │  Siguiente doc             Resumen del día       │  │
│  │  (si quedan)               → Siguiente día       │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼ (después de día 7)            │
│              ┌─────────────────────┐                    │
│              │      ENDING         │                    │
│              │  Según recursos     │                    │
│              └─────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## Estructura de Datos

### Documento (Document)

```javascript
{
  id: "doc_001",

  // Cuándo aparece
  day: 1,              // Día específico (1-7) o null si aleatorio
  required: true,      // Si es obligatorio o puede no aparecer

  // Quién lo envía
  sender: "beto",      // ID del NPC: beto, yani, marcos, valeria
  senderName: "Beto",
  senderRole: "Electricista",

  // Tipo visual
  type: "solicitud",   // solicitud, queja, propuesta, urgente, info

  // Contenido
  title: "Reparación del generador",
  content: "El generador del bloque 4 está fallando. Necesito autorización para usar materiales del stock común para repararlo antes de que falle completamente.",

  // Opciones de respuesta (2-3 por documento)
  options: [
    {
      id: "aprobar",
      text: "Aprobar reparación",
      consequence: {
        electricidad: +15,
        creditos: -20
      },
      preview: "+15⚡ -20💰",  // Mostrado al jugador
      response: "Beto asiente. 'Perfecto, me pongo a trabajar.'"
    },
    {
      id: "rechazar",
      text: "Rechazar por ahora",
      consequence: {
        legitimidad: -10
      },
      preview: "-10🤝",
      response: "Beto frunce el ceño. 'Espero que sepas lo que hacés...'"
    },
    {
      id: "postergar",
      text: "Pedir más información",
      consequence: {},
      preview: "Sin efecto inmediato",
      response: "Beto suspira. 'Te mando un informe mañana.'",
      spawnsDocument: "doc_001b"  // Genera otro doc (opcional)
    }
  ],

  // Condiciones (opcional)
  conditions: {
    minElectricidad: 30,   // Solo aparece si electricidad >= 30
    requiresFlag: null,     // Requiere flag previo
    excludesFlag: null      // No aparece si este flag existe
  },

  // Efectos secundarios (opcional)
  setsFlag: "generador_reparado",  // Flag que se activa
  triggersEnding: null              // Si dispara ending especial
}
```

### Estado del Juego (GameState Simplificado)

```javascript
{
  // Tiempo
  currentDay: 1,        // 1-7
  dayNames: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],

  // Recursos (0-100)
  resources: {
    electricidad: 60,
    agua: 60,
    legitimidad: 60,
    autonomia: 60
  },
  creditos: 100,        // Puede ser negativo

  // Documentos
  documentsToday: [],       // IDs de docs para hoy
  currentDocumentIndex: 0,  // Cuál estamos viendo
  completedDocuments: [],   // IDs de docs ya decididos

  // Flags narrativos
  flags: {},

  // Para save/load
  savedAt: null
}
```

### Configuración de Días

```javascript
{
  days: [
    {
      day: 1,
      name: "Lunes",
      fixedDocuments: ["doc_intro_001", "doc_intro_002"],
      randomCount: 0,
      decayMultiplier: 0  // Sin decay día 1
    },
    {
      day: 2,
      name: "Martes",
      fixedDocuments: ["doc_agua_001"],
      randomCount: 2,
      decayMultiplier: 1
    },
    {
      day: 3,
      name: "Miércoles",
      fixedDocuments: ["doc_conflict_001"],
      randomCount: 2,
      decayMultiplier: 1
    },
    {
      day: 4,
      name: "Jueves",
      fixedDocuments: ["doc_crisis_001"],
      randomCount: 3,
      decayMultiplier: 1
    },
    {
      day: 5,
      name: "Viernes",
      fixedDocuments: ["doc_asamblea_001", "doc_asamblea_002"],
      randomCount: 2,
      decayMultiplier: 1
    },
    {
      day: 6,
      name: "Sábado",
      fixedDocuments: ["doc_weekend_001"],
      randomCount: 2,
      decayMultiplier: 0.5  // Menos decay fin de semana
    },
    {
      day: 7,
      name: "Domingo",
      fixedDocuments: ["doc_cierre_001", "doc_cierre_002"],
      randomCount: 0,
      decayMultiplier: 0
    }
  ]
}
```

---

## NPCs como Remitentes

Ya no tienen sprites ni posiciones. Solo son "voces" que envían documentos.

```javascript
{
  npcs: {
    valeria: {
      id: "valeria",
      name: "Valeria",
      role: "Coordinadora",
      emoji: "👩",
      personality: "Pragmática, equilibrada",
      sends: ["propuesta", "info", "urgente"]
    },
    beto: {
      id: "beto",
      name: "Beto",
      role: "Electricista",
      emoji: "👨‍🔧",
      personality: "Directo, práctico",
      sends: ["solicitud", "urgente"]
    },
    yani: {
      id: "yani",
      name: "Yani",
      role: "Enfermera",
      emoji: "👩‍⚕️",
      personality: "Empática, preocupada",
      sends: ["queja", "propuesta", "info"]
    },
    marcos: {
      id: "marcos",
      name: "Marcos",
      role: "Ingeniero",
      emoji: "👨‍💼",
      personality: "Analítico, cauteloso",
      sends: ["propuesta", "info", "solicitud"]
    }
  }
}
```

---

## Endings (3-4)

| ID | Nombre | Condición | Descripción |
|----|--------|-----------|-------------|
| `ending_success` | "Red Consolidada" | Todos recursos ≥50% | La semana termina con la red fortalecida y estable |
| `ending_balance` | "Equilibrio Frágil" | Promedio 30-50% | Sobreviviste, pero hay tensiones y desafíos pendientes |
| `ending_crisis` | "Crisis Latente" | Algún recurso <20% | Problemas serios que necesitan resolverse urgentemente |
| `ending_collapse` | "Colapso" | Algún recurso =0 | La red no sobrevive la semana, game over |

---

## Decay Simplificado

```javascript
// Cada fin de día (excepto día 1 y 7)
function applyDecay(day) {
  const config = dayConfigs[day];
  const baseDecay = 5;  // 5 puntos por día (no porcentaje)
  const multiplier = config.decayMultiplier;

  Object.keys(resources).forEach(res => {
    resources[res] -= baseDecay * multiplier;
    resources[res] = Math.max(0, resources[res]);
  });
}
```

---

## Archivos a Crear

```
src/
├── scenes/
│   ├── DeskScene.js        # Pantalla principal (NUEVA)
│   ├── IntroScene.js       # Intro breve (NUEVA/ADAPTAR)
│   └── EndingScene.js      # Reusar/simplificar
├── components/
│   └── DocumentCard.js     # Componente de documento (NUEVA)
├── managers/
│   ├── DocumentManager.js  # Gestión de docs (NUEVA)
│   ├── ResourceManager.js  # Reusar/simplificar
│   └── SaveManager.js      # Reusar/simplificar
└── data/
    └── documents.json      # Pool de documentos (NUEVA)
```

---

## Archivos a Eliminar/Ignorar

```
# Ya no se usan (mantener en repo por si acaso, pero no cargar en index.html)
src/scenes/MapScene.js
src/scenes/ManagementScene.js
src/scenes/EncounterScene.js
src/scenes/RandomEventScene.js
src/managers/NPCManager.js (versión con sprites)
src/managers/TaskManager.js
src/managers/EncounterManager.js
src/managers/RandomEventManager.js
src/managers/AchievementManager.js
src/managers/MemoriaColectivaManager.js
src/components/NPC.js
src/components/AchievementNotification.js
```

---

## Comparación: Antes vs Después

| Aspecto | v1.0 Mapa | v2.0 Escritorio |
|---------|-----------|-----------------|
| **Duración** | 60 días | 7 días |
| **Tiempo real** | 45-90 min | 15-25 min |
| **Interacción principal** | Explorar mapa | Leer documentos |
| **NPCs** | Sprites caminando | Remitentes de docs |
| **Decisiones** | Tareas + encounters | Documentos |
| **Complejidad** | Alta | Baja |
| **Sistemas** | 8+ managers | 3-4 managers |
| **Archivos** | 40+ | 20-25 |
| **Curva aprendizaje** | Alta | Baja |

---

## Métricas de Éxito

- ✅ Partida completa en 15-25 minutos
- ✅ Tutorial en <2 minutos
- ✅ Decisiones claras con preview de consecuencias
- ✅ Feedback inmediato de recursos
- ✅ Sin sistemas confusos (no hay tareas, no hay mapa)
- ✅ Narrativa clara por día
- ✅ Endings significativos

---

## Próximos Pasos (Fase 1)

1. Crear `DocumentManager.js` con pool de documentos
2. Crear `DeskScene.js` con UI de escritorio
3. Crear `DocumentCard.js` component
4. Simplificar `ResourceManager.js`
5. Adaptar `SaveManager.js`
6. Crear `documents.json` con 21-28 documentos (3-4 por día)
