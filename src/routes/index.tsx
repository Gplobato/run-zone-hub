import { createFileRoute } from "@tanstack/react-router";
import bg from "@/assets/running-bg.jpg";
import shoe from "@/assets/running-shoe.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Corrida — Tênis de Performance" },
      { name: "description", content: "Homepage minimalista com um tênis de corrida em destaque." },
      { property: "og:title", content: "Corrida — Tênis de Performance" },
      { property: "og:description", content: "Homepage minimalista com um tênis de corrida em destaque." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <h1 className="sr-only">Tênis de corrida</h1>
      <img
        src={shoe}
        alt="Tênis de corrida em destaque"
        className="max-w-[80vw] max-h-[70vh] object-contain drop-shadow-2xl"
      />
    </main>
  );
}
