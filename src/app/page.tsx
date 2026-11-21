import Simulator from "@/components/Simulator";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Simulator />
        <footer className="mt-12 border-t pt-4 text-center text-xs text-muted-foreground">
          Elaborado por Ulises González ·{" "}
          <a href="mailto:ulises@rizo.ma" className="underline underline-offset-2 hover:text-foreground">
            ulises@rizo.ma
          </a>
        </footer>
      </div>
    </main>
  );
}
