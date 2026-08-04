#!/usr/bin/env node
/* Verificador del simulador Claude Certified Architect.
 *
 * Comprueba tres cosas que se degradan solas con el tiempo:
 *   1. que el formato del examen coincida con la guía oficial vigente,
 *   2. que el contenido no enseñe API retirada ni modelos que ya no existen,
 *   3. que el sitio lleve el sistema de diseño Rizoma y su sello de versión.
 *
 * Fuente de la verdad del punto 1: «Claude Certified Architect – Foundations,
 * Exam Guide, Version 1.0 · Effective July 2026 · Exam code CCAR-F».
 *
 * Uso:  node scripts/verificar.mjs           (todo, con red)
 *       node scripts/verificar.mjs --sin-red (omite la comprobación de enlaces)
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => readFileSync(join(RAIZ, p), 'utf8');
const SIN_RED = process.argv.includes('--sin-red');

const fallos = [];
const avisos = [];
let pasados = 0;

function ok(nombre, evidencia) {
  pasados++;
  console.log(`  \x1b[32m✓\x1b[0m ${nombre}${evidencia ? ` — ${evidencia}` : ''}`);
}
function mal(nombre, esperado, encontrado) {
  fallos.push(nombre);
  console.log(`  \x1b[31m✗\x1b[0m ${nombre}`);
  console.log(`      esperado: ${esperado}`);
  console.log(`      encontrado: ${encontrado}`);
}
function aviso(nombre, detalle) {
  avisos.push(nombre);
  console.log(`  \x1b[33m!\x1b[0m ${nombre} — ${detalle}`);
}
const seccion = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);

/* ─────────────────────────────────────────────────────────────
   1. Formato del examen contra la guía oficial CCAR-F v1.0
   ───────────────────────────────────────────────────────────── */
const GUIA = {
  codigo: 'CCAR-F',
  preguntas: 60,
  minutos: 120,
  aprobar: 720,
  escalaMin: 100,
  escalaMax: 1000,
  escenariosPresentados: 4,
  escenariosBanco: 6,
};

seccion('Formato del examen (guía oficial CCAR-F v1.0, julio 2026)');
{
  const sim = leer('src/components/Simulator.tsx');

  const mCount = sim.match(/EXAM_QUESTION_COUNT\s*=\s*(\d+)/);
  const count = mCount ? Number(mCount[1]) : null;
  count === GUIA.preguntas
    ? ok('número de ítems', `${count}`)
    : mal('número de ítems', `${GUIA.preguntas} (guía §3)`, String(count));

  const mTime = sim.match(/EXAM_TIME_LIMIT\s*=\s*(\d+)\s*\*\s*60/);
  const mins = mTime ? Number(mTime[1]) : null;
  mins === GUIA.minutos
    ? ok('límite de tiempo', `${mins} min`)
    : mal('límite de tiempo', `${GUIA.minutos} min (guía §3)`, `${mins} min`);

  const store = leer('src/lib/store.ts');
  const mPass = store.match(/scaledScore\s*>=\s*(\d+)/);
  Number(mPass?.[1]) === GUIA.aprobar
    ? ok('puntuación de corte', `${GUIA.aprobar}`)
    : mal('puntuación de corte', String(GUIA.aprobar), mPass?.[1] ?? 'no encontrada');

  // La escala oficial es 100–1000: score = 100 + pct/100 * 900.
  /100\s*\+\s*\(percentage\s*\/\s*100\)\s*\*\s*900/.test(store)
    ? ok('escala de puntuación', `${GUIA.escalaMin}–${GUIA.escalaMax}`)
    : mal('escala de puntuación', '100 + (pct/100)*900', 'fórmula distinta');
}

/* ─────────────────────────────────────────────────────────────
   2. Plano de contenido: dominios y pesos exactos
   ───────────────────────────────────────────────────────────── */
seccion('Plano de contenido (dominios y pesos)');
{
  const q = leer('src/data/questions.ts');
  const OFICIAL = [
    ['Agentic Architecture & Orchestration', 27],
    ['Tool Design & MCP Integration', 18],
    ['Claude Code Configuration & Workflows', 20],
    ['Prompt Engineering & Structured Output', 20],
    ['Context Management & Reliability', 15],
  ];

  const pesos = [...q.matchAll(/^\s*(\d):\s*(\d+),\s*$/gm)]
    .filter((m) => Number(m[1]) >= 1 && Number(m[1]) <= 5);
  const mapa = {};
  for (const m of pesos) mapa[m[1]] ??= Number(m[2]);

  let pesosOk = true;
  OFICIAL.forEach(([nombre, peso], i) => {
    const d = String(i + 1);
    if (mapa[d] !== peso) {
      pesosOk = false;
      mal(`peso del dominio ${d}`, `${peso}%`, `${mapa[d] ?? '—'}%`);
    }
    if (!q.includes(nombre)) {
      pesosOk = false;
      mal(`nombre del dominio ${d}`, nombre, 'no aparece en questions.ts');
    }
  });
  if (pesosOk) ok('5 dominios con los pesos oficiales', '27 / 18 / 20 / 20 / 15');

  const suma = Object.values(mapa).reduce((a, b) => a + b, 0);
  suma === 100 ? ok('los pesos suman 100', `${suma}%`) : mal('suma de pesos', '100', String(suma));

  // No basta con que el banco tenga 60 preguntas en total: el muestreo reparte
  // por peso, así que cada dominio necesita las suyas. Un banco repartido a
  // partes iguales no puede servir un examen con pesos desiguales — entrega
  // menos ítems de los que la ficha promete, y nadie se entera.
  const examen = leer('src/data/questions-exam.ts');
  const nExamen = (examen.match(/^\s{2}\{\s*$/gm) || []).length;
  const porDominio = {};
  for (const m of examen.matchAll(/domain:\s*(\d)/g)) porDominio[m[1]] = (porDominio[m[1]] || 0) + 1;

  const cupo = {};
  let entregables = 0;
  const cortos = [];
  OFICIAL.forEach(([, peso], i) => {
    const d = String(i + 1);
    cupo[d] = Math.round(GUIA.preguntas * (peso / 100));
    const hay = porDominio[d] || 0;
    entregables += Math.min(cupo[d], hay);
    if (hay < cupo[d]) cortos.push(`D${d} necesita ${cupo[d]} y tiene ${hay}`);
  });

  nExamen >= GUIA.preguntas
    ? ok('banco de examen suficiente en total', `${nExamen} preguntas`)
    : mal('banco de examen', `≥ ${GUIA.preguntas} preguntas`, `${nExamen}`);

  entregables === GUIA.preguntas
    ? ok('el muestreo por pesos entrega el examen completo', `${entregables}/${GUIA.preguntas} ítems`)
    : mal(
        'ítems que el examen puede entregar',
        `${GUIA.preguntas} (los que anuncia la ficha)`,
        `${entregables} — ${cortos.join('; ')}`,
      );
}

/* ─────────────────────────────────────────────────────────────
   3. Vigencia técnica del contenido
   ───────────────────────────────────────────────────────────── */
seccion('Vigencia técnica del contenido');
{
  const DATOS = [
    'src/data/questions.ts',
    'src/data/questions-es.ts',
    'src/data/questions-exam.ts',
    'src/data/questions-exam-es.ts',
    'src/data/study-guide.ts',
  ];
  const cuerpo = DATOS.map((f) => [f, leer(f)]);

  // Patrones que la API ya no acepta o que apuntan a modelos retirados.
  const RETIRADO = [
    [/thinking:\s*\{\s*type:\s*\\?"enabled\\?"/g, 'thinking {type:"enabled", budget_tokens} devuelve 400 en Opus 4.7+'],
    [/budget_tokens/g, 'budget_tokens fue sustituido por output_config.effort'],
    [/\boutput_format\s*:/g, 'output_format quedó obsoleto: usar output_config.format'],
    [/claude-opus-4-[0156]\b/g, 'modelo Opus anterior a la generación 5'],
    [/claude-sonnet-4-[056]\b/g, 'modelo Sonnet anterior a la generación 5'],
    [/web_search_20250305/g, 'variante básica: existe web_search_20260209'],
    [/text_editor_2025(0124|0429)/g, 'versión de herramienta retirada'],
  ];

  // Una pregunta puede nombrar un patrón retirado a propósito, para enseñar que
  // ya no funciona. Eso vale solo si el texto de alrededor lo dice: si aparece
  // suelto, es contenido viejo disfrazado de lección.
  const MARCA_OBSOLETA = /\b(400|rechaz|reject|deprecat|obsolet|retirad|replaced|sustitu|ya no)\b/i;
  const esDidactico = (s, i) => MARCA_OBSOLETA.test(s.slice(Math.max(0, i - 260), i + 260));

  let sucio = 0;
  for (const [re, motivo] of RETIRADO) {
    const golpes = [];
    for (const [f, s] of cuerpo) {
      const vivos = [...s.matchAll(re)].filter((m) => !esDidactico(s, m.index));
      if (vivos.length) golpes.push(`${f.replace('src/data/', '')}×${vivos.length}`);
    }
    if (golpes.length) {
      sucio++;
      mal(`patrón retirado: ${re.source}`, motivo, golpes.join(', '));
    }
  }
  if (!sucio) ok('sin API retirada ni modelos obsoletos presentados como vigentes');

  // El nombre de dominio que lleva cada pregunta debe ser el de la guía.
  const oficiales = new Set([
    'Agentic Architecture & Orchestration',
    'Tool Design & MCP Integration',
    'Claude Code Configuration & Workflows',
    'Prompt Engineering & Structured Output',
    'Context Management & Reliability',
  ]);
  const raros = new Set();
  for (const [, s] of cuerpo) {
    for (const m of s.matchAll(/domainName:\s*"([^"]+)"/g)) {
      if (!oficiales.has(m[1])) raros.add(m[1]);
    }
  }
  raros.size === 0
    ? ok('cada pregunta lleva el nombre de dominio oficial')
    : mal('nombres de dominio', [...oficiales].join(' / '), [...raros].join(' | '));

  // Los modelos vigentes sí deben aparecer: el examen se rinde sobre la API actual.
  const todo = cuerpo.map(([, s]) => s).join('');
  const vigentes = ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5'].filter((m) =>
    todo.includes(m),
  );
  vigentes.length >= 2
    ? ok('menciona modelos vigentes', vigentes.join(', '))
    : mal('modelos vigentes', 'al menos 2 de opus-5 / sonnet-5 / haiku-4-5', vigentes.join(', ') || 'ninguno');
}

/* ─────────────────────────────────────────────────────────────
   4. Sistema de diseño Rizoma
   ───────────────────────────────────────────────────────────── */
seccion('Sistema de diseño Rizoma');
{
  const css = leer('src/app/globals.css');

  // Tokens que definen la identidad. Deben estar, con estos valores exactos.
  const TOKENS = {
    '#289448': 'verde Rizoma',
    '#34A856': 'verde claro',
    '#1F7038': 'verde oscuro (texto sobre claro)',
    '#F0EDE5': 'cloud dancer (fondo)',
    '#151414': 'tinta',
    '#178A9A': 'cian oscuro',
    '#C32421': 'rojo',
  };
  const faltan = Object.entries(TOKENS).filter(([hex]) => !css.includes(hex));
  faltan.length === 0
    ? ok('paleta Rizoma completa', `${Object.keys(TOKENS).length} tokens`)
    : mal('paleta Rizoma', Object.keys(TOKENS).join(' '), `faltan ${faltan.map(([h, n]) => `${h} (${n})`).join(', ')}`);

  // La paleta índigo del andamiaje de shadcn no debe sobrevivir.
  const indigo = (css.match(/oklch\([^)]*\b26[0-9](?:\.\d+)?\s*\)/g) || []).length;
  indigo === 0
    ? ok('sin restos de la paleta índigo de plantilla')
    : mal('paleta índigo', '0 ocurrencias de oklch(... 260)', `${indigo} ocurrencias`);

  // Tipografía: familias nombradas con respaldo del sistema, sin descarga de webfonts.
  /Source Serif 4/.test(css)
    ? ok('titulares en Source Serif 4')
    : mal('titular', 'Source Serif 4', 'no declarado');
  /--font-body[^;]*Inter/.test(css)
    ? ok('cuerpo en Inter con respaldo del sistema')
    : mal('cuerpo', 'Inter + system-ui', 'no declarado');

  const layout = leer('src/app/layout.tsx');
  /next\/font\/google/.test(layout)
    ? mal('webfonts', 'sin next/font/google (el estándar Rizoma no descarga fuentes)', 'importa next/font/google')
    : ok('sin descarga de webfonts');

  // font-sans debe resolver a algo real: la plantilla traía una referencia circular.
  /--font-sans:\s*var\(--font-sans\)/.test(css)
    ? mal('variable --font-sans', 'que apunte a una familia real', 'referencia circular var(--font-sans)')
    : ok('--font-sans resuelve a una familia real');
}

/* ─────────────────────────────────────────────────────────────
   5. Contraste AA del texto de acento
   ───────────────────────────────────────────────────────────── */
seccion('Contraste WCAG AA');
{
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };

  const PARES = [
    ['#1F7038', '#F0EDE5', 'verde oscuro sobre cloud dancer', 4.5],
    ['#151414', '#F0EDE5', 'tinta sobre cloud dancer', 4.5],
    ['#151414', '#289448', 'tinta sobre verde (botón)', 4.5],
    ['#34A856', '#151414', 'verde claro sobre tinta (modo oscuro)', 4.5],
    ['#C32421', '#F0EDE5', 'rojo sobre cloud dancer', 4.5],
  ];
  for (const [fg, bg, nombre, min] of PARES) {
    const r = ratio(fg, bg);
    r >= min
      ? ok(nombre, `${r.toFixed(2)}:1`)
      : mal(`contraste: ${nombre}`, `≥ ${min}:1`, `${r.toFixed(2)}:1`);
  }
}

/* ─────────────────────────────────────────────────────────────
   6. Sello de versión (lo que el hub cruza)
   ───────────────────────────────────────────────────────────── */
seccion('Sello de versión');
{
  if (!existsSync(join(RAIZ, 'version.json'))) {
    mal('version.json', 'presente en la raíz', 'no existe');
  } else {
    const v = JSON.parse(leer('version.json'));
    /^\d+\.\d+\.\d+$/.test(v.version)
      ? ok('versión semántica', `v${v.version}`)
      : mal('versión', 'x.y.z', String(v.version));

    /^\d{4}-\d{2}-\d{2}$/.test(v.actualizado)
      ? ok('fecha de actualización', v.actualizado)
      : mal('fecha', 'AAAA-MM-DD', String(v.actualizado));

    const layout = leer('src/app/layout.tsx');
    const metaV = /name="curso-version"/.test(layout);
    const metaA = /name="curso-actualizado"/.test(layout);
    metaV && metaA
      ? ok('metadatos curso-version / curso-actualizado en el layout')
      : mal('metadatos de versión', 'ambas etiquetas meta', `version:${metaV} actualizado:${metaA}`);
  }
}

/* ─────────────────────────────────────────────────────────────
   7. Ortografía española de la interfaz
   ───────────────────────────────────────────────────────────── */
seccion('Ortografía española de la interfaz');
{
  const UI = [
    'src/lib/i18n.ts',
    'src/components/Simulator.tsx',
    'src/components/ExamResults.tsx',
    'src/components/StudyGuide.tsx',
    'src/components/QuestionCard.tsx',
    'src/components/ProgressDashboard.tsx',
    'src/app/layout.tsx',
  ].filter((f) => existsSync(join(RAIZ, f)));

  // Palabras que en español llevan tilde y aparecían sin ella. Fuera de la
  // lista queda «practica», que sin tilde es el imperativo («practica cada
  // día») y con ella el sustantivo: el corrector no puede distinguirlos.
  const SIN_TILDE =
    /\b(certificacion|Certificacion|informacion|Informacion|puntuacion|Puntuacion|evaluacion|Evaluacion|revision|Revision|Examenes|examenes|Minimo|minimo|guia|Guia|despues|Despues|numero|Numero|analisis|Analisis|codigo|Codigo|dificil|Dificil|facil|Facil|sesion|Sesion|aqui|Aqui|tambien|Tambien|segun|Segun|basico|Basico|menu|Menu|areas|Areas|tecnologias|Tecnologias|opcion|Opcion|explicacion|Explicacion|preparacion|Preparacion|publica|Publica|documentacion|Documentacion|configuracion|Configuracion|produccion|Produccion|agentica|Agentica|inscripcion|Inscripcion|conexion|Conexion|deberia|Deberia)\b/g;

  // Solo se revisan las cadenas en español: un identificador de JavaScript o
  // una cadena en inglés no tienen por qué llevar tildes. Se recogen las dos
  // formas que usa el código: el mapa de i18n (`es: "…"`) y el ternario que
  // aparece suelto en los componentes (`locale === "es" ? "…"`).
  const cadenasEs = (s) =>
    [
      ...[...s.matchAll(/\bes:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]),
      ...[...s.matchAll(/locale === "es"\s*\?\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]),
      // Texto suelto dentro del JSX: >Así se ve<
      ...[...s.matchAll(/>([^<>{}"]{4,})</g)].map((m) => m[1]),
    ].join('\n');

  const sucias = [];
  for (const f of UI) {
    const hits = [...new Set([...cadenasEs(leer(f)).matchAll(SIN_TILDE)].map((m) => m[0]))];
    if (hits.length) sucias.push(`${f.replace('src/', '')}: ${hits.join(', ')}`);
  }
  sucias.length === 0
    ? ok('sin palabras a las que les falte la tilde', `${UI.length} archivos`)
    : mal('tildes', 'todas las palabras acentuadas', sucias.join(' | '));

  // Toda interrogación y exclamación en español abre con su signo.
  const sinApertura = [];
  for (const f of UI) {
    leer(f)
      .split('\n')
      .forEach((l, i) => {
        const m = l.match(/\bes:\s*"([^"]*)"/);
        if (!m) return;
        const t = m[1];
        if (t.includes('?') && !t.includes('¿')) sinApertura.push(`${f}:${i + 1} ?`);
        if (t.includes('!') && !t.includes('¡')) sinApertura.push(`${f}:${i + 1} !`);
      });
  }
  sinApertura.length === 0
    ? ok('signos de apertura ¿ ¡ en todas las cadenas en español')
    : mal('signos de apertura', '¿ antes de ? y ¡ antes de !', sinApertura.join(', '));
}

/* ─────────────────────────────────────────────────────────────
   8. Enlaces externos
   ───────────────────────────────────────────────────────────── */
if (!SIN_RED) {
  seccion('Enlaces externos');
  const fuentes = [
    'src/data/questions.ts',
    'src/data/questions-es.ts',
    'src/data/questions-exam.ts',
    'src/data/questions-exam-es.ts',
    'src/data/study-guide.ts',
    'src/components/Simulator.tsx',
    'src/components/StudyGuide.tsx',
  ].filter((f) => existsSync(join(RAIZ, f)));

  const urls = new Set();
  for (const f of fuentes) {
    for (const m of leer(f).matchAll(/https:\/\/[^\s"'`)\\]+/g)) {
      const u = m[0].replace(/[.,;]$/, '');
      // Dominios inventados dentro de los enunciados: no son enlaces reales.
      if (
        /example\.com|your-app\.com|\b(prod|staging)\.|internal\.company|localhost|analytics\.com/.test(u)
      )
        continue;
      urls.add(u);
    }
  }

  const resultados = await Promise.all(
    [...urls].map(async (u) => {
      try {
        const r = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
        if (r.status >= 300 && r.status < 400) {
          const destino = r.headers.get('location');
          return { u, estado: r.status, destino };
        }
        if (r.status === 405 || r.status === 403) {
          const g = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
          return { u, estado: g.status };
        }
        return { u, estado: r.status };
      } catch (e) {
        return { u, estado: 0, error: String(e.message || e) };
      }
    }),
  );

  // Hosts que bloquean peticiones automatizadas: un 403 suyo no dice nada sobre
  // si el enlace sirve. Se comprueban a mano y aquí solo se avisa.
  const ANTIBOT = /npmjs\.com|npmjs\.org/;
  const antibot = resultados.filter((r) => ANTIBOT.test(r.u) && r.estado >= 400);
  for (const r of antibot) aviso('enlace no comprobable', `${r.u} responde ${r.estado} a peticiones automatizadas`);

  const rotos = resultados.filter(
    (r) => (r.estado === 0 || r.estado >= 400) && !ANTIBOT.test(r.u),
  );
  const redirigidos = resultados.filter((r) => r.destino);

  rotos.length === 0
    ? ok('todos los enlaces responden', `${resultados.length} URLs`)
    : mal('enlaces rotos', 'HTTP 200', rotos.map((r) => `${r.u} → ${r.error || r.estado}`).join(' | '));

  // Un enlace que redirige sigue funcionando, pero apunta a una dirección vieja:
  // es el primer síntoma de que el contenido se quedó atrás.
  redirigidos.length === 0
    ? ok('ningún enlace apunta a una dirección obsoleta')
    : mal(
        'enlaces obsoletos',
        'la URL final, sin redirección',
        redirigidos.map((r) => `${r.u} → ${r.destino}`).join(' | '),
      );
} else {
  seccion('Enlaces externos');
  aviso('omitido', 'ejecutado con --sin-red');
}

/* ───────────────────────────────────────────────────────────── */
console.log(
  `\n${'─'.repeat(60)}\n${pasados} comprobaciones pasadas · ${fallos.length} fallidas · ${avisos.length} avisos`,
);
if (fallos.length) {
  console.log(`\n\x1b[31mFALLA:\x1b[0m ${fallos.join('; ')}`);
  process.exit(1);
}
console.log('\n\x1b[32mTodo en orden.\x1b[0m');
