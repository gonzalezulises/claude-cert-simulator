/* Fija el tema antes del primer pintado para que no haya un parpadeo claro al
   cargar en modo oscuro. Se carga como <script src> síncrono desde el <head>:
   bloquea el parseo justo lo necesario y evita meter HTML en línea.

   Pone la clase y el atributo porque las utilidades `dark:` de Tailwind miran
   la clase y las variables de color aceptan cualquiera de los dos. */
(function () {
  try {
    var guardado = localStorage.getItem("cca-tema");
    var tema =
      guardado ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var raiz = document.documentElement;
    raiz.setAttribute("data-theme", tema);
    raiz.classList.toggle("dark", tema === "dark");
  } catch (_) {
    /* localStorage bloqueado (modo privado, cookies de terceros): se queda en claro. */
  }
})();
