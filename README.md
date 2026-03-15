# Claude Certified Architect — Simulador de Certificacion

Simulador interactivo para prepararte para el examen **Claude Certified Architect – Foundations** de Anthropic.

**[Usar el simulador →](https://gonzalezulises.github.io/claude-cert-simulator/)**

## Caracteristicas

### Modo Estudio
- 60 preguntas basadas en escenarios reales del examen
- Filtrado por dominio individual o todos los dominios
- Explicacion detallada despues de cada respuesta
- Concepto clave identificado por pregunta

### Modo Examen
- 30 preguntas aleatorias ponderadas por peso de dominio
- Temporizador de 90 minutos
- Navegador visual de preguntas
- Score escalado 100–1000 (minimo 720 para aprobar)
- Sin explicaciones hasta finalizar

### Seguimiento de Progreso
- Progreso por dominio persistente (localStorage)
- Historial de examenes realizados
- Identificacion de areas debiles a reforzar
- Modo revision post-examen

## Dominios del Examen

| # | Dominio | Peso | Preguntas |
|---|---------|------|-----------|
| 1 | Agentic Architecture & Orchestration | 27% | 12 |
| 2 | Tool Design & MCP Integration | 18% | 12 |
| 3 | Claude Code Configuration & Workflows | 20% | 12 |
| 4 | Prompt Engineering & Structured Output | 20% | 12 |
| 5 | Context Management & Reliability | 15% | 12 |

## Escenarios

- Customer Support Resolution Agent
- Code Generation with Claude Code
- Multi-Agent Research System
- Developer Productivity with Claude
- Claude Code for Continuous Integration
- Structured Data Extraction

## Tecnologias

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- shadcn/ui
- GitHub Pages (deploy automatico via GitHub Actions)

## Desarrollo local

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## Disclaimer

Simulador no oficial — solo para estudio personal. Basado en la guia publica del examen Claude Certified Architect – Foundations de Anthropic.
