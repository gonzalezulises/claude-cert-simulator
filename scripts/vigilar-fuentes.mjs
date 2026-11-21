#!/usr/bin/env node
/**
 * Vigila las dos fuentes de Anthropic de las que depende el banco de preguntas y sale con 1
 * si alguna cambió respecto de lo fijado en scripts/fuentes-vigiladas.json:
 *   1. La guía oficial del examen CCAR-F (el PDF enlazado en la página de la certificación).
 *   2. La tabla «Latest models» de la documentación de modelos.
 * Un cambio no es un error del simulador: es la señal para revisar el banco y volver a fijar.
 * Uso: node scripts/vigilar-fuentes.mjs   (escribe el resumen en $GITHUB_STEP_SUMMARY si existe)
 */
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';

const fijado = JSON.parse(readFileSync(new URL('./fuentes-vigiladas.json', import.meta.url), 'utf8'));
const cambios = [];

async function traer(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'claude-cert-simulator-watch' } });
  if (!r.ok) throw new Error(`${url} respondió ${r.status}`);
  return r;
}

// 1. Guía del examen: la URL del PDF lleva un sello de tiempo, así que una URL nueva o un hash
//    distinto significa que Anthropic publicó otra versión.
const pagina = await (await traer(fijado.guia.pagina)).text();
const pdfs = [...pagina.matchAll(/https:\/\/[^"'\s\\]+Architect_-_Foundations_Exam_Guide[^"'\s\\]*\.pdf/g)]
  .map((m) => m[0])
  .filter((u) => !/Japanese/i.test(u));
if (pdfs.length === 0) throw new Error('no encontré el PDF de la guía en la página de la certificación');
const pdf = [...new Set(pdfs)].sort().at(-1);
const hash = createHash('sha256').update(Buffer.from(await (await traer(pdf)).arrayBuffer())).digest('hex');
if (pdf !== fijado.guia.pdf || hash !== fijado.guia.sha256)
  cambios.push(`Guía del examen: el PDF cambió (fijado ${fijado.guia.version}).\n  URL: ${pdf}\n  sha256: ${hash}`);

// 2. Modelos vigentes: los ids de la tabla «Latest models».
const modelos = await (await traer(fijado.modelos.pagina)).text();
const tabla = modelos.split(/^## /m).find((s) => s.startsWith('Latest models')) ?? '';
const ids = [...new Set(tabla.match(/claude-[a-z]+-\d+(?:-\d+)*/g) ?? [])].sort();
if (ids.length === 0) throw new Error('no encontré ids de modelo en la sección «Latest models»');
if (ids.join() !== [...fijado.modelos.vigentes].sort().join())
  cambios.push(`Modelos vigentes: ahora ${ids.join(', ')} (fijados: ${fijado.modelos.vigentes.join(', ')}).`);

const resumen = cambios.length
  ? `## Cambió una fuente de Anthropic\n\n${cambios.map((c) => `- ${c}`).join('\n')}\n\nRevisa el banco contra la fuente nueva y actualiza scripts/fuentes-vigiladas.json.`
  : `Sin cambios: guía ${fijado.guia.version}, modelos ${ids.join(', ')}.`;
console.log(resumen);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${resumen}\n`);
process.exit(cambios.length ? 1 : 0);
