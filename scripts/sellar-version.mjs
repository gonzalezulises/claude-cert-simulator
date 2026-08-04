/* Sella version.json con la fecha del último commit que tocó el contenido.
   Se usa la fecha del commit y no la del build: si se redespliega sin cambios,
   la página no debe anunciar que se actualizó hoy. */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const RUTA = new URL('../version.json', import.meta.url);
const actual = JSON.parse(readFileSync(RUTA, 'utf8'));

let fecha = actual.actualizado;
try {
  fecha = execSync('git log -1 --format=%cs -- src/ public/', { encoding: 'utf8' }).trim() || fecha;
} catch {
  console.log('sin historial de git disponible: se conserva la fecha guardada');
}

const bump = process.argv[2];           // patch | minor | major
if (bump) {
  const [ma, mi, pa] = actual.version.split('.').map(Number);
  actual.version = bump === 'major' ? `${ma + 1}.0.0`
    : bump === 'minor' ? `${ma}.${mi + 1}.0`
    : `${ma}.${mi}.${pa + 1}`;
}
actual.actualizado = fecha;
writeFileSync(RUTA, JSON.stringify(actual, null, 2) + '\n');
console.log(`version.json → v${actual.version} · actualizado ${actual.actualizado}`);
