"use client";

import { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tema = "light" | "dark";
const CLAVE = "cca-tema";

/* Este componente no guarda el tema en estado de React, a propósito.
 *
 * El HTML se genera una sola vez al compilar, cuando todavía no se sabe qué
 * tema quiere quien visita; el tema real lo fija public/tema.js justo antes
 * del primer pintado. Si el icono dependiera de un estado que se corrige en
 * un efecto, ese re-render puede adelantarse a la hidratación —React 19
 * hidrata de forma concurrente— y React encuentra «☾» en el HTML servido
 * donde el cliente ya escribió «☀»: error de hidratación en cada carga.
 *
 * Con los dos iconos siempre en el marcado y la visibilidad resuelta por CSS,
 * el HTML del servidor y el primer render del cliente son idénticos por
 * construcción, y no hay desajuste posible. El estado real vive donde debe:
 * en el atributo del documento, que es lo que se lee al pulsar. */

function aplicar(tema: Tema) {
  const raiz = document.documentElement;
  raiz.setAttribute("data-theme", tema);
  raiz.classList.toggle("dark", tema === "dark");
  try {
    localStorage.setItem(CLAVE, tema);
  } catch {
    /* localStorage bloqueado: el cambio vale para esta sesión y no se guarda. */
  }
}

export default function ThemeToggle({ locale }: { locale: Locale }) {
  const cambiar = () => {
    const actual: Tema =
      document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    aplicar(actual === "dark" ? "light" : "dark");
  };

  // Etiqueta independiente del tema: si dijera «cambiar a modo oscuro» tendría
  // el mismo problema que el icono, solo que en un atributo.
  const etiqueta =
    locale === "es" ? "Alternar entre modo claro y oscuro" : "Toggle light and dark mode";

  return (
    <button
      type="button"
      onClick={cambiar}
      aria-label={etiqueta}
      title={etiqueta}
      className={cn(
        "inline-flex h-[26px] w-[26px] items-center justify-center rounded-lg border bg-muted",
        "text-muted-foreground transition-colors hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <span aria-hidden="true" className="text-xs leading-none">
        <span className="dark:hidden">☾</span>
        <span className="hidden dark:inline">☀</span>
      </span>
    </button>
  );
}
