"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tema = "light" | "dark";
const CLAVE = "cca-tema";

/* El tema inicial ya lo dejó puesto public/tema.js antes del primer pintado.
   Este componente solo lo lee del DOM y lo cambia; no vuelve a decidirlo, para
   no pelearse con ese script ni provocar un parpadeo. */
function temaActual(): Tema {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

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
  // Arranca en "light" y se corrige tras montar: en el HTML exportado no hay
  // forma de saber el tema, y leer el DOM durante el render rompe la hidratación.
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => setTema(temaActual()), []);

  const cambiar = () => {
    const siguiente: Tema = tema === "dark" ? "light" : "dark";
    aplicar(siguiente);
    setTema(siguiente);
  };

  const etiqueta =
    locale === "es"
      ? tema === "dark"
        ? "Cambiar a modo claro"
        : "Cambiar a modo oscuro"
      : tema === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode";

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
        {tema === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}
