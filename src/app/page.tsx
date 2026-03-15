import Simulator from "@/components/Simulator";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Simulator />
      </div>
      <footer className="text-center text-xs text-muted-foreground py-6 border-t mt-8">
        <p>
          Simulador no oficial — Solo para estudio personal.
          Basado en la guia publica del examen Claude Certified Architect – Foundations.
        </p>
      </footer>
    </main>
  );
}
