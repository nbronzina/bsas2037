# Sistema de Eventos Aleatorios - Red de Aguante

## Filosofía de Diseño

El sistema de eventos aleatorios está diseñado para crear una experiencia de juego más dinámica e impredecible, donde cada partida se siente única. Los eventos procedurales añaden:

1. **Tensión Dramática**: El jugador nunca sabe cuándo ocurrirá la próxima crisis
2. **Rejugabilidad**: Cada run de 60 días es diferente
3. **Gestión Táctica**: Fuerza al jugador a adaptarse a situaciones inesperadas
4. **Mundo Vivo**: Buenos Aires 2037 responde y reacciona más allá del control del jugador

### Principios de Diseño

- **Contextual, no Random**: Los eventos solo ocurren cuando tienen sentido (recursos bajos, días específicos)
- **Consecuencias Significativas**: Cada decisión importa y afecta recursos/flags
- **Balance de Riesgo/Recompensa**: Mix de crisis (40%), oportunidades (33%), y narrativa (27%)
- **No Spam**: Cooldown de 3 días mínimo entre eventos
- **Frecuencia Moderada**: 4-6 eventos por run de 60 días (no abrumador)

---

## Mecánicas del Sistema

### Probabilidad y Frecuencia

- **Base Chance Diaria**: 20% de probabilidad cada día
- **Cooldown**: Mínimo 3 días entre eventos
- **Zona de Exclusión**: No eventos en días 1-5 (tutorial) ni días 55-60 (endgame)
- **Reducción por Encuentros**: 50% de probabilidad en días con encuentros scripteados
- **Frecuencia Esperada**: ~4-6 eventos en un run completo de 60 días

### Sistema de Precondiciones

Cada evento tiene condiciones que deben cumplirse:

```javascript
conditions: {
  minDay: 10,              // Día mínimo del juego
  maxDay: 50,              // Día máximo del juego
  electricidad: {
    min: 0,                // Nivel mínimo requerido
    max: 40                // Nivel máximo permitido
  },
  creditos: { min: 100 },  // Créditos mínimos
  notFlags: ['flag_x'],    // Flags que NO deben estar activos
  requireFlags: ['flag_y'], // Flags que SÍ deben estar activos
  minTimeSinceLastEvent: 3 // Días desde último evento
}
```

### Selección por Peso

Si múltiples eventos son elegibles, se selecciona usando weighted random:

```javascript
weight = baseChance * weight * contextModifier
```

---

## Estructura de Evento

Template de estructura para cada evento:

```javascript
{
  id: 'evento_nombre',           // Identificador único
  title: 'Título del Evento',    // Nombre mostrado
  description: 'Descripción...',  // Contexto narrativo
  type: 'crisis',                // 'crisis', 'opportunity', 'neutral'
  icon: '⚡💥',                   // Emoji(s) representativo
  conditions: {                  // Precondiciones para elegibilidad
    minDay: 10,
    maxDay: 50,
    electricidad: { max: 40 },
    notFlags: ['flag_exclude'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.3,               // Probabilidad base (0.0-1.0)
  weight: 1.0,                   // Peso para selección múltiple
  options: [                     // 2-3 opciones de decisión
    {
      id: 1,
      text: 'Opción A (costo)',
      consequences: {
        resources: {
          creditos: -500,
          electricidad: 15
        },
        flags: ['flag_resultado']
      },
      resultMessage: 'Consecuencia de la decisión'
    }
  ]
}
```

---

## Lista Completa de Eventos

### ⚠️ CATEGORÍA: CRISIS (6 eventos)

#### 1. Apagón Sorpresivo

**ID**: `evento_apagon_sorpresa`

**Concepto**: Un transformador crítico falla sin previo aviso, dejando al barrio sin electricidad.

```javascript
{
  id: 'evento_apagon_sorpresa',
  title: 'Apagón Sorpresivo',
  description: 'Un transformador falló sin previo aviso. El barrio quedó sin luz y los vecinos reclaman una solución urgente. El técnico dice que puede hacer una reparación rápida pero costosa, o esperar a que lleguen repuestos más baratos en 2 días.',
  type: 'crisis',
  icon: '⚡💥',
  conditions: {
    minDay: 10,
    maxDay: 50,
    electricidad: { max: 40 },
    notFlags: ['apagon_reciente'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.3,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Reparación urgente (500₡)',
      consequences: {
        resources: { creditos: -500, electricidad: 15 },
        flags: ['apagon_sorpresa_reparado', 'apagon_reciente']
      },
      resultMessage: 'La reparación urgente restauró el servicio. Los vecinos agradecen la rapidez.'
    },
    {
      id: 2,
      text: 'Esperar repuestos baratos (2 días)',
      consequences: {
        resources: { creditos: -200, electricidad: 10, agua: -5 },
        flags: ['apagon_esperado', 'apagon_reciente']
      },
      resultMessage: 'Ahorraste dinero pero el barrio sufrió 2 días de cortes. Algunos vecinos perdieron comida refrigerada.'
    },
    {
      id: 3,
      text: 'Dejar que el barrio se arregle solo',
      consequences: {
        resources: { electricidad: 5, moral: -15 },
        flags: ['apagon_ignorado', 'apagon_reciente']
      },
      resultMessage: 'Los vecinos se las arreglaron con generadores improvisados, pero tu credibilidad bajó.'
    }
  ]
}
```

#### 2. Contaminación del Agua

**ID**: `evento_contaminacion_agua`

**Concepto**: Detección de contaminantes en el suministro de agua del barrio.

```javascript
{
  id: 'evento_contaminacion_agua',
  title: 'Contaminación del Agua',
  description: 'Análisis rutinarios detectaron niveles altos de contaminantes en el agua. Pueden ser bacterias o químicos de la zona industrial cercana. Necesitas decidir rápido antes de que alguien se enferme.',
  type: 'crisis',
  icon: '💧☣️',
  conditions: {
    minDay: 15,
    maxDay: 50,
    agua: { min: 20, max: 60 },
    notFlags: ['agua_contaminada_activa'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.25,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Cortar suministro y distribuir agua embotellada (800₡)',
      consequences: {
        resources: { creditos: -800, agua: -20, moral: 5 },
        flags: ['agua_emergencia_resuelta']
      },
      resultMessage: 'Previniste una crisis de salud. Los vecinos confían en tu liderazgo responsable.'
    },
    {
      id: 2,
      text: 'Filtros de emergencia y hervir agua (400₡)',
      consequences: {
        resources: { creditos: -400, agua: -10, electricidad: -10 },
        flags: ['agua_filtros_instalados']
      },
      resultMessage: 'Una solución intermedia. Algunos se quejaron pero nadie se enfermó gravemente.'
    },
    {
      id: 3,
      text: 'Solo avisar a los vecinos del riesgo',
      consequences: {
        resources: { agua: 0, moral: -20 },
        flags: ['agua_crisis_ignorada'],
        achievements: ['achievement_riesgo_sanitario'] // Logro negativo
      },
      resultMessage: 'Tres familias tuvieron intoxicaciones leves. Tu reputación como líder está en duda.'
    }
  ]
}
```

#### 3. Brote de Enfermedad

**ID**: `evento_brote_enfermedad`

**Concepto**: Un brote de dengue o gripe afecta al barrio en medio del colapso sanitario.

```javascript
{
  id: 'evento_brote_enfermedad',
  title: 'Brote de Enfermedad',
  description: 'Varios vecinos reportan fiebre alta y dolores. Podría ser dengue por la acumulación de agua estancada. El sistema de salud público está colapsado. Necesitas actuar antes de que se propague.',
  type: 'crisis',
  icon: '🤒🦟',
  conditions: {
    minDay: 20,
    maxDay: 55,
    moral: { max: 60 },
    notFlags: ['brote_reciente'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.2,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Contactar médico privado de confianza (1000₡)',
      consequences: {
        resources: { creditos: -1000, moral: 10 },
        flags: ['brote_controlado_profesional', 'brote_reciente']
      },
      resultMessage: 'El médico diagnosticó y trató a tiempo. El brote se contuvo y salvaste vidas.'
    },
    {
      id: 2,
      text: 'Enfermera del barrio + medicamentos (500₡)',
      consequences: {
        resources: { creditos: -500, moral: 0 },
        flags: ['brote_controlado_comunidad', 'brote_reciente']
      },
      resultMessage: 'La enfermera hizo lo que pudo. La mayoría se recuperó, pero fue una semana difícil.'
    },
    {
      id: 3,
      text: 'Cuarentena voluntaria y remedios caseros',
      consequences: {
        resources: { creditos: 0, moral: -15, agua: -10 },
        flags: ['brote_empeorado', 'brote_reciente']
      },
      resultMessage: 'El brote se extendió más de lo esperado. Dos ancianos tuvieron complicaciones graves.'
    }
  ]
}
```

#### 4. Robo en el Almacén

**ID**: `evento_robo_almacen`

**Concepto**: Robo nocturno en el almacén comunitario de suministros.

```javascript
{
  id: 'evento_robo_almacen',
  title: 'Robo en el Almacén',
  description: 'Esta madrugada forzaron la puerta del almacén comunitario. Robaron herramientas, cables y varios bidones de agua. Los vecinos están indignados y exigen medidas de seguridad.',
  type: 'crisis',
  icon: '🚨🔓',
  conditions: {
    minDay: 12,
    maxDay: 50,
    creditos: { min: 200 },
    notFlags: ['seguridad_reforzada'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.25,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Contratar vigilancia nocturna (600₡)',
      consequences: {
        resources: { creditos: -600, agua: -10 },
        flags: ['seguridad_reforzada', 'vigilancia_contratada']
      },
      resultMessage: 'La vigilancia previno futuros robos. Los vecinos se sienten más seguros.'
    },
    {
      id: 2,
      text: 'Organizar turnos de vigilancia voluntaria',
      consequences: {
        resources: { creditos: 0, moral: 5, electricidad: -5 },
        flags: ['seguridad_comunitaria', 'vigilancia_vecinal']
      },
      resultMessage: 'La comunidad se organizó en turnos. Se fortalecieron los lazos vecinales.'
    },
    {
      id: 3,
      text: 'Instalar candado mejor y cámara falsa (200₡)',
      consequences: {
        resources: { creditos: -200, agua: -5 },
        flags: ['seguridad_básica']
      },
      resultMessage: 'Una solución económica pero efectiva. No hubo más robos por ahora.'
    }
  ]
}
```

#### 5. Tormenta Severa

**ID**: `evento_tormenta_severa`

**Concepto**: Tormenta eléctrica daña la infraestructura del barrio.

```javascript
{
  id: 'evento_tormenta_severa',
  title: 'Tormenta Severa',
  description: 'Una tormenta eléctrica intensa azotó el barrio. Hay techos volados, cables caídos y el generador principal sufrió daños. El agua de lluvia acumulada amenaza con inundaciones.',
  type: 'crisis',
  icon: '⛈️🌪️',
  conditions: {
    minDay: 8,
    maxDay: 52,
    notFlags: ['tormenta_reciente'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.2,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Reparaciones completas de emergencia (900₡)',
      consequences: {
        resources: { creditos: -900, electricidad: 10, agua: 5 },
        flags: ['tormenta_reparada_completa', 'tormenta_reciente']
      },
      resultMessage: 'Reparaste todo rápidamente. El barrio volvió a la normalidad sin pérdidas mayores.'
    },
    {
      id: 2,
      text: 'Reparar solo lo crítico (400₡)',
      consequences: {
        resources: { creditos: -400, electricidad: 5, agua: -5 },
        flags: ['tormenta_reparada_parcial', 'tormenta_reciente']
      },
      resultMessage: 'Priorizaste electricidad y drenaje. Algunos techos quedaron con goteras.'
    },
    {
      id: 3,
      text: 'Jornada de reparación comunitaria',
      consequences: {
        resources: { creditos: -100, electricidad: 3, moral: 10 },
        flags: ['tormenta_comunitaria', 'tormenta_reciente']
      },
      resultMessage: 'Los vecinos trabajaron juntos toda la semana. Se reparó lo esencial y creció la solidaridad.'
    }
  ]
}
```

#### 6. Conflicto Vecinal Escalado

**ID**: `evento_conflicto_vecinal`

**Concepto**: Una disputa entre vecinos amenaza con dividir la comunidad.

```javascript
{
  id: 'evento_conflicto_vecinal',
  title: 'Conflicto Vecinal',
  description: 'Dos familias están en conflicto por el uso del generador comunitario. Ambos bandos tienen seguidores y la tensión está dividiendo al barrio. Como líder, debes intervenir antes de que empeore.',
  type: 'crisis',
  icon: '👥💢',
  conditions: {
    minDay: 18,
    maxDay: 50,
    moral: { max: 50 },
    electricidad: { max: 40 },
    notFlags: ['conflicto_resuelto'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.2,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Mediar y crear cronograma de uso justo',
      consequences: {
        resources: { moral: 15, electricidad: -5 },
        flags: ['conflicto_resuelto_mediacion']
      },
      resultMessage: 'Tu mediación fue exitosa. Ambas partes aceptaron el cronograma y la paz volvió.'
    },
    {
      id: 2,
      text: 'Comprar un segundo generador (700₡)',
      consequences: {
        resources: { creditos: -700, moral: 20, electricidad: 15 },
        flags: ['conflicto_resuelto_recursos']
      },
      resultMessage: 'Resolviste el problema de raíz. Ahora hay suficiente capacidad para todos.'
    },
    {
      id: 3,
      text: 'Dejar que lo resuelvan ellos',
      consequences: {
        resources: { moral: -20 },
        flags: ['conflicto_empeorado']
      },
      resultMessage: 'El conflicto escaló. Ahora hay dos facciones claramente divididas en el barrio.'
    }
  ]
}
```

---

### ✨ CATEGORÍA: OPORTUNIDADES (5 eventos)

#### 7. Donación Inesperada

**ID**: `evento_donacion_inesperada`

**Concepto**: Una ONG o benefactor dona recursos al barrio.

```javascript
{
  id: 'evento_donacion_inesperada',
  title: 'Donación Inesperada',
  description: 'Una ONG internacional visitó el barrio e impresionada con tu organización comunitaria, ofreció una donación. Puedes elegir qué tipo de ayuda necesitas más.',
  type: 'opportunity',
  icon: '🎁📦',
  conditions: {
    minDay: 10,
    maxDay: 50,
    moral: { min: 40 },
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.15,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Solicitar equipamiento técnico (generadores, filtros)',
      consequences: {
        resources: { electricidad: 20, agua: 15 },
        flags: ['donacion_equipamiento']
      },
      resultMessage: 'Recibiste 2 generadores solares y 5 filtros de agua. Gran impulso a la infraestructura.'
    },
    {
      id: 2,
      text: 'Solicitar dinero en efectivo',
      consequences: {
        resources: { creditos: 1200 },
        flags: ['donacion_dinero']
      },
      resultMessage: 'Recibiste 1200₡. Flexibilidad total para usarlo donde más se necesite.'
    },
    {
      id: 3,
      text: 'Solicitar capacitación técnica',
      consequences: {
        resources: { moral: 15 },
        flags: ['donacion_capacitacion', 'equipo_capacitado']
      },
      resultMessage: 'Tres vecinos recibieron capacitación en mantenimiento eléctrico. Inversión a largo plazo.'
    }
  ]
}
```

#### 8. Nuevo Miembro con Habilidades

**ID**: `evento_nuevo_miembro_tecnico`

**Concepto**: Una persona con habilidades técnicas se une al barrio.

```javascript
{
  id: 'evento_nuevo_miembro_tecnico',
  title: 'Nuevo Miembro Técnico',
  description: 'Paula, una ingeniera que trabajaba en la Ciudad Autónoma, se mudó al barrio escapando de la gentrificación. Tiene experiencia en sistemas eléctricos y está dispuesta a ayudar si la integras bien.',
  type: 'opportunity',
  icon: '👩‍🔧⚡',
  conditions: {
    minDay: 15,
    maxDay: 45,
    moral: { min: 30 },
    electricidad: { max: 60 },
    notFlags: ['paula_integrada'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.2,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Darle rol de liderazgo técnico',
      consequences: {
        resources: { electricidad: 20, moral: 10 },
        flags: ['paula_integrada', 'paula_lider_tecnico']
      },
      resultMessage: 'Paula optimizó todo el sistema eléctrico. Ahora gastas menos y produces más.'
    },
    {
      id: 2,
      text: 'Pedirle que capacite a otros vecinos',
      consequences: {
        resources: { electricidad: 10, moral: 15 },
        flags: ['paula_integrada', 'paula_maestra']
      },
      resultMessage: 'Paula formó un equipo de 4 técnicos. Ahora el conocimiento está distribuido.'
    },
    {
      id: 3,
      text: 'Integrarla gradualmente sin presión',
      consequences: {
        resources: { electricidad: 5, moral: 5 },
        flags: ['paula_integrada_gradual']
      },
      resultMessage: 'Paula ayuda ocasionalmente. Buena relación pero sin aprovechar todo su potencial.'
    }
  ]
}
```

#### 9. Periodista Interesado

**ID**: `evento_periodista_cobertura`

**Concepto**: Un periodista quiere hacer una nota sobre el barrio autogestionado.

```javascript
{
  id: 'evento_periodista_cobertura',
  title: 'Oportunidad Mediática',
  description: 'Un periodista de un medio alternativo quiere hacer una nota sobre cómo se organizó el barrio en medio de la crisis. La cobertura podría atraer donaciones, pero también atención no deseada.',
  type: 'opportunity',
  icon: '📰🎤',
  conditions: {
    minDay: 20,
    maxDay: 50,
    moral: { min: 50 },
    notFlags: ['cobertura_mediatica'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.15,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Aceptar cobertura completa',
      consequences: {
        resources: { creditos: 600, moral: 10 },
        flags: ['cobertura_mediatica', 'visibilidad_alta'],
        achievements: ['achievement_vocero_comunidad']
      },
      resultMessage: 'La nota fue viral. Llegaron donaciones y mensajes de apoyo de todo el país.'
    },
    {
      id: 2,
      text: 'Cobertura limitada, sin nombres ni fotos',
      consequences: {
        resources: { creditos: 300, moral: 5 },
        flags: ['cobertura_mediatica', 'visibilidad_moderada']
      },
      resultMessage: 'La nota fue discreta pero positiva. Algunas donaciones llegaron sin atraer problemas.'
    },
    {
      id: 3,
      text: 'Rechazar la cobertura',
      consequences: {
        resources: { moral: -5 },
        flags: ['cobertura_rechazada']
      },
      resultMessage: 'Priorizaste la seguridad y privacidad del barrio. Algunos vecinos querían la exposición.'
    }
  ]
}
```

#### 10. Excedente de Energía

**ID**: `evento_excedente_energia`

**Concepto**: Los paneles solares produjeron más energía de la esperada.

```javascript
{
  id: 'evento_excedente_energia',
  title: 'Excedente de Energía',
  description: 'Una semana de sol intenso más optimizaciones técnicas resultaron en excedente de electricidad. Puedes vender el excedente, almacenarlo, o compartirlo con barrios vecinos.',
  type: 'opportunity',
  icon: '☀️🔋',
  conditions: {
    minDay: 25,
    maxDay: 50,
    electricidad: { min: 70 },
    requireFlags: ['paneles_solares_mejorados'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.2,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Vender excedente al barrio vecino (800₡)',
      consequences: {
        resources: { creditos: 800, electricidad: -15 },
        flags: ['excedente_vendido']
      },
      resultMessage: 'Vendiste el excedente y generaste ingresos. Relación comercial establecida.'
    },
    {
      id: 2,
      text: 'Donar energía a barrio vecino',
      consequences: {
        resources: { electricidad: -15, moral: 20 },
        flags: ['excedente_donado', 'alianza_barrio_vecino']
      },
      resultMessage: 'El barrio vecino agradeció la solidaridad. Creaste una alianza valiosa.'
    },
    {
      id: 3,
      text: 'Invertir en baterías de almacenamiento (500₡)',
      consequences: {
        resources: { creditos: -500, electricidad: 10 },
        flags: ['baterias_instaladas']
      },
      resultMessage: 'Instalaste baterías. Ahora tienes reserva para días nublados.'
    }
  ]
}
```

#### 11. Taller en Universidad

**ID**: `evento_taller_universidad`

**Concepto**: Una universidad ofrece un taller gratuito de gestión comunitaria.

```javascript
{
  id: 'evento_taller_universidad',
  title: 'Taller Universitario',
  description: 'La cátedra de Desarrollo Comunitario de la UBA ofrece un taller gratuito de 2 días sobre gestión cooperativa, economía solidaria y organización horizontal. Pueden asistir hasta 5 vecinos.',
  type: 'opportunity',
  icon: '🎓📚',
  conditions: {
    minDay: 15,
    maxDay: 45,
    moral: { min: 40 },
    notFlags: ['taller_completado'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.15,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Enviar equipo de liderazgo (5 personas)',
      consequences: {
        resources: { moral: 15, creditos: 100 },
        flags: ['taller_completado', 'liderazgo_capacitado']
      },
      resultMessage: 'El equipo volvió con nuevas herramientas de gestión. Mejoraste la eficiencia organizativa.'
    },
    {
      id: 2,
      text: 'Enviar vecinos jóvenes (formación nueva generación)',
      consequences: {
        resources: { moral: 20 },
        flags: ['taller_completado', 'nueva_generacion_formada']
      },
      resultMessage: 'Los jóvenes están entusiasmados y aportan ideas frescas. Inversión a futuro.'
    },
    {
      id: 3,
      text: 'No enviar a nadie (priorizar trabajo local)',
      consequences: {
        resources: { creditos: 50 },
        flags: ['taller_rechazado']
      },
      resultMessage: 'Priorizaste las necesidades inmediatas del barrio sobre la capacitación.'
    }
  ]
}
```

---

### 📘 CATEGORÍA: NEUTRAL/NARRATIVA (4 eventos)

#### 12. Visita de Cooperativa Hermana

**ID**: `evento_visita_cooperativa`

**Concepto**: Una cooperativa de otro barrio viene a intercambiar experiencias.

```javascript
{
  id: 'evento_visita_cooperativa',
  title: 'Visita de Cooperativa Hermana',
  description: 'La Cooperativa del Barrio Oeste, que también se autogestiona, pidió visitarte para intercambiar experiencias. Tienen 3 años más de trayectoria. Puedes aprender de ellos o enseñarles tus innovaciones.',
  type: 'neutral',
  icon: '🤝🏘️',
  conditions: {
    minDay: 20,
    maxDay: 50,
    moral: { min: 30 },
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.15,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Organizar jornada de intercambio (200₡)',
      consequences: {
        resources: { creditos: -200, moral: 15 },
        flags: ['visita_cooperativa_exitosa', 'red_cooperativas']
      },
      resultMessage: 'Intercambiaron conocimientos técnicos y estrategias. Ahora son aliados permanentes.'
    },
    {
      id: 2,
      text: 'Recorrido simple sin gastos',
      consequences: {
        resources: { moral: 5 },
        flags: ['visita_cooperativa_basica']
      },
      resultMessage: 'Una visita cordial. Intercambiaron contactos y experiencias básicas.'
    },
    {
      id: 3,
      text: 'Posponer la visita (ocupados)',
      consequences: {
        resources: { moral: -5 },
        flags: ['visita_cooperativa_pospuesta']
      },
      resultMessage: 'Priorizaste urgencias locales. La cooperativa entendió pero se perdió la oportunidad.'
    }
  ]
}
```

#### 13. Aniversario del Barrio

**ID**: `evento_aniversario_barrio`

**Concepto**: Se cumple un aniversario importante de la fundación del barrio.

```javascript
{
  id: 'evento_aniversario_barrio',
  title: 'Aniversario del Barrio',
  description: 'Se cumple el 40° aniversario de la fundación del barrio. Los vecinos más antiguos proponen organizar una celebración para recordar la historia y fortalecer la identidad comunitaria.',
  type: 'neutral',
  icon: '🎉🏘️',
  conditions: {
    minDay: 25,
    maxDay: 45,
    moral: { min: 30 },
    notFlags: ['aniversario_celebrado'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.15,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Organizar festival comunitario (400₡)',
      consequences: {
        resources: { creditos: -400, moral: 25 },
        flags: ['aniversario_celebrado', 'festival_exitoso']
      },
      resultMessage: 'El festival fue hermoso. Música, comida y relatos históricos. La comunidad se siente más unida.'
    },
    {
      id: 2,
      text: 'Asado comunitario simple (150₡)',
      consequences: {
        resources: { creditos: -150, moral: 15 },
        flags: ['aniversario_celebrado', 'asado_comunitario']
      },
      resultMessage: 'Un asado sencillo pero emotivo. Los viejos contaron historias mientras los chicos jugaban.'
    },
    {
      id: 3,
      text: 'Solo reconocimiento simbólico',
      consequences: {
        resources: { moral: 5 },
        flags: ['aniversario_simbólico']
      },
      resultMessage: 'Una placa conmemorativa y algunas palabras. Los recursos se priorizaron para necesidades.'
    }
  ]
}
```

#### 14. Mural de los Niños

**ID**: `evento_mural_ninos`

**Concepto**: Los niños del barrio quieren pintar un mural sobre la crisis.

```javascript
{
  id: 'evento_mural_ninos',
  title: 'Proyecto Mural',
  description: 'Los niños de la escuela del barrio proponen pintar un mural sobre "Cómo vivimos la crisis". Una artista local se ofreció a coordinar el proyecto si consiguen los materiales.',
  type: 'neutral',
  icon: '🎨👧👦',
  conditions: {
    minDay: 15,
    maxDay: 50,
    moral: { min: 20 },
    notFlags: ['mural_completado'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.2,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Comprar materiales de calidad (300₡)',
      consequences: {
        resources: { creditos: -300, moral: 20 },
        flags: ['mural_completado', 'arte_comunitario'],
        achievements: ['achievement_cultura_viva']
      },
      resultMessage: 'El mural quedó hermoso. Atrae miradas y da identidad al barrio. Los niños están orgullosos.'
    },
    {
      id: 2,
      text: 'Buscar materiales donados',
      consequences: {
        resources: { creditos: -50, moral: 10 },
        flags: ['mural_completado', 'mural_improvisado']
      },
      resultMessage: 'Con pinturas donadas y restos, los niños crearon algo único. No perfecto, pero auténtico.'
    },
    {
      id: 3,
      text: 'Posponer el proyecto',
      consequences: {
        resources: { moral: -10 },
        flags: ['mural_pospuesto']
      },
      resultMessage: 'Los niños entendieron que hay prioridades. Algunos perdieron el entusiasmo inicial.'
    }
  ]
}
```

#### 15. Radio Comunitaria

**ID**: `evento_radio_comunitaria`

**Concepto**: Un grupo de jóvenes quiere iniciar una radio comunitaria.

```javascript
{
  id: 'evento_radio_comunitaria',
  title: 'Radio Comunitaria',
  description: 'Un grupo de jóvenes tiene experiencia en radio y propone crear FM Aguante, una radio comunitaria. Necesitan equipamiento básico y un espacio. Puede ser una herramienta de comunicación o un gasto innecesario.',
  type: 'neutral',
  icon: '📻🎙️',
  conditions: {
    minDay: 20,
    maxDay: 50,
    electricidad: { min: 40 },
    moral: { min: 35 },
    notFlags: ['radio_instalada'],
    minTimeSinceLastEvent: 3
  },
  baseChance: 0.15,
  weight: 1.0,
  options: [
    {
      id: 1,
      text: 'Invertir en equipamiento profesional (600₡)',
      consequences: {
        resources: { creditos: -600, moral: 20, electricidad: -5 },
        flags: ['radio_instalada', 'radio_profesional']
      },
      resultMessage: 'FM Aguante salió al aire con buena calidad. Informa, entretiene y da voz al barrio.'
    },
    {
      id: 2,
      text: 'Equipamiento básico y apoyo limitado (250₡)',
      consequences: {
        resources: { creditos: -250, moral: 10, electricidad: -3 },
        flags: ['radio_instalada', 'radio_basica']
      },
      resultMessage: 'La radio funciona con lo básico. Transmite 4 horas diarias y va creciendo de a poco.'
    },
    {
      id: 3,
      text: 'No apoyar el proyecto',
      consequences: {
        resources: { moral: -10 },
        flags: ['radio_rechazada']
      },
      resultMessage: 'Priorizaste recursos para necesidades inmediatas. Los jóvenes se desilusionaron un poco.'
    }
  ]
}
```

---

## Arquitectura Técnica

### RandomEventManager

**Responsabilidades**:
- Almacenar definiciones de los 15 eventos
- Verificar condiciones diarias
- Seleccionar eventos elegibles
- Aplicar weighted random selection
- Trackear historial y cooldowns
- Persistir estado en save/load

**Métodos principales**:

```javascript
class RandomEventManager {
  initializeEvents()                    // Carga los 15 eventos
  checkForEvent(currentDay)             // Verifica probabilidad diaria
  getEligibleEvents(currentDay)         // Filtra por condiciones
  checkConditions(conditions, day)      // Verifica preconditions
  selectEventByWeight(events)           // Weighted random
  triggerEvent(event)                   // Marca como pendiente
  getPendingEvent()                     // Obtiene evento activo
  recordEventResult(eventId, optionId)  // Registra decisión
  toJSON() / fromJSON()                 // Persistencia
}
```

### RandomEventScene

**Características UI**:
- Panel central con fondo según tipo (crisis=rojo, opportunity=verde, neutral=azul)
- Icono grande del evento
- Título y descripción narrativa
- 2-3 botones de opciones con preview de consecuencias
- Mensaje de resultado después de elegir
- Animaciones de entrada/salida
- Pausa MapScene mientras activo

### Integración con Sistemas Existentes

**TimeManager**: Hook en `advanceDay()` para llamar a `randomEventManager.checkForEvent()`

**MapScene**: Detección de `pendingEvent` en `update()` para lanzar RandomEventScene

**SaveManager**: Persistencia de `eventHistory`, `lastEventDay`, y estado actual

**ResourceManager**: Aplicación de consecuencias de recursos

**FlagManager**: Aplicación de consecuencias de flags

**AchievementManager**: Algunos eventos pueden desbloquear achievements

---

## Tabla de Balance

### Frecuencia por Tipo

| Tipo | Cantidad | % | Prob. Base Promedio |
|------|----------|---|---------------------|
| Crisis | 6 | 40% | 0.24 |
| Oportunidad | 5 | 33% | 0.17 |
| Neutral | 4 | 27% | 0.16 |

### Rango de Costos

| Evento | Costo Mínimo | Costo Máximo | Costo Promedio |
|--------|--------------|--------------|----------------|
| Crisis | 0₡ | 1000₡ | ~450₡ |
| Oportunidad | -800₡ | 500₡ | ~150₡ |
| Neutral | 0₡ | 600₡ | ~200₡ |

*Nota: Costos negativos = ganancia de créditos*

### Impacto en Moral

| Rango | Crisis | Oportunidad | Neutral |
|-------|--------|-------------|---------|
| Muy Negativo (-20) | 3 eventos | 0 eventos | 0 eventos |
| Negativo (-5 a -15) | 2 eventos | 1 evento | 2 eventos |
| Neutral (0 a +5) | 1 evento | 0 eventos | 1 evento |
| Positivo (+10 a +15) | 0 eventos | 3 eventos | 1 evento |
| Muy Positivo (+20+) | 0 eventos | 2 eventos | 1 evento |

---

## Notas de Implementación

### Testeo Manual Recomendado

1. **Frecuencia**: Jugar 3 runs completos y verificar ~4-6 eventos por run
2. **Precondiciones**: Forzar estados específicos (electricidad baja) y verificar eventos apropiados
3. **Cooldowns**: Verificar mínimo 3 días entre eventos
4. **Exclusiones**: No eventos en días 1-5 ni 55-60
5. **Weighted Selection**: Verificar que con múltiples elegibles, la selección respeta pesos
6. **Consecuencias**: Verificar que resources y flags se aplican correctamente
7. **Persistencia**: Guardar/cargar con evento activo
8. **UI**: Todos los eventos se muestran correctamente
9. **Flags**: Eventos con `notFlags` no aparecen si flag está activo
10. **Achievements**: Eventos que desbloquean logros lo hacen correctamente
11. **Balance**: No eventos que rompan la economía del juego

### Calibración de Dificultad

- **Run Fácil**: 2-3 crisis, 3-4 oportunidades
- **Run Normal**: 3-4 crisis, 2-3 oportunidades
- **Run Difícil**: 5-6 crisis, 1-2 oportunidades

El sistema debe balancearse con los 6 encuentros scripteados obligatorios para que el total de "momentos de decisión" sea ~10-12 por run.

---

## Expansión Futura

### Ideas para Versión 2.0

- **Eventos Encadenados**: Un evento puede desencadenar otro relacionado
- **Eventos Temporales**: Consecuencias que duran X días
- **Eventos de Múltiples Etapas**: Decisiones en día X tienen consecuencia en día X+5
- **Eventos de Final**: Variantes específicas según decisiones tomadas
- **Eventos Estacionales**: Más tormentas en verano, más enfermedades en invierno
- **Eventos de Personajes**: Arcos de NPCs pueden generar eventos personalizados

---

**Versión**: 1.0
**Fecha**: 2025-11-24
**Estado**: Diseño Completo - Listo para Implementación
