# Claude Certified Architect — Simulador de certificación

Simulador interactivo para prepararte para el examen **Claude Certified Architect – Foundations**
(CCAR-F) de Anthropic.

**[Usar el simulador →](https://gonzalezulises.github.io/claude-cert-simulator/)**

El formato reproduce la guía oficial **versión 1.0, vigente desde julio de 2026**. Si Anthropic
publica una revisión, `npm run verificar` es lo que avisa de que este repositorio se quedó atrás.

## El examen real

| | |
|---|---|
| Código | CCAR-F |
| Ítems | 60 |
| Formato | Opción múltiple y respuesta múltiple; cada ítem indica cuántas marcar |
| Estructura | 4 escenarios sacados de un banco de 6 |
| Tiempo | 120 minutos |
| Aprobar | 720 en una escala de 100–1000 |
| Coste | 125 USD |
| Vigencia | 12 meses desde la fecha de emisión |

## Modos

### Modo estudio
- 60 preguntas basadas en escenarios reales, con explicación después de cada respuesta
- Filtrado por dominio o todos a la vez
- Un concepto clave identificado por pregunta

### Modo examen
- 60 preguntas exclusivas, distintas a las del modo estudio
- Muestreo **ponderado por el peso oficial de cada dominio**, no a partes iguales
- Temporizador de 120 minutos y navegador visual de preguntas
- Puntuación escalada 100–1000, sin explicaciones hasta terminar

### Seguimiento
- Progreso por dominio persistente en el navegador (`localStorage`)
- Historial de exámenes y áreas flojas señaladas
- Modo revisión posterior al examen

## Dominios

Los pesos son los de la guía oficial. El banco tiene más preguntas del dominio 1 justamente
porque es el que más pesa: con 12 por dominio, un examen ponderado de 60 ítems solo llegaba a 56.

| # | Dominio | Peso | En el examen | En el banco |
|---|---------|------|--------------|-------------|
| 1 | Agentic Architecture & Orchestration | 27 % | 16 | 16 |
| 2 | Tool Design & MCP Integration | 18 % | 11 | 12 |
| 3 | Claude Code Configuration & Workflows | 20 % | 12 | 12 |
| 4 | Prompt Engineering & Structured Output | 20 % | 12 | 12 |
| 5 | Context Management & Reliability | 15 % | 9 | 12 |

## Escenarios

Los seis del banco oficial; en el examen real aparecen cuatro, elegidos al azar.

- Customer Support Resolution Agent
- Code Generation with Claude Code
- Multi-Agent Research System
- Developer Productivity with Claude
- Claude Code for Continuous Integration
- Structured Data Extraction

## Verificación

```bash
npm run verificar                # todo, incluida la comprobación de enlaces
npm run verificar -- --sin-red   # sin red (es lo que corre en CI)
```

Comprueba lo que se degrada solo con el tiempo:

- que el formato del examen siga coincidiendo con la guía oficial;
- que el muestreo ponderado pueda entregar los 60 ítems que anuncia la ficha;
- que el contenido no enseñe API retirada ni modelos que ya no existen — una mención marcada
  como obsoleta sí se permite, porque enseñar qué dejó de funcionar es parte del temario;
- que todos los enlaces respondan **y que ninguno redirija**, porque una redirección es el
  primer síntoma de que la documentación se movió;
- la paleta Rizoma, el contraste AA y las tildes de la interfaz en español.

## Tecnologías

- Next.js 16 (App Router, TypeScript), exportación estática
- Tailwind CSS v4 y shadcn/ui, con los tokens remapeados al sistema de diseño Rizoma
- Sin descarga de webfonts: las familias se nombran y caen en las del sistema
- GitHub Pages, desplegado por GitHub Actions

## Desarrollo local

```bash
npm install
npm run dev            # http://localhost:3000
npm run sellar-version # sella version.json con la fecha del último commit
```

## Aviso

Simulador no oficial — solo para estudio personal. Basado en la guía pública del examen
Claude Certified Architect – Foundations de Anthropic.
