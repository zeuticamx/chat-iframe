import { cn } from "@/lib/utils";

/**
 * Retrasos negativos: cada punto arranca ya desfasado desde el primer frame,
 * así el rebote escalonado se ve de inmediato en vez de empezar sincronizado.
 */
const RETRASOS = ["[animation-delay:-0.3s]", "[animation-delay:-0.15s]", "[animation-delay:0s]"];

/** Burbuja temporal del lado del agente mientras se espera la respuesta de n8n. */
export function IndicadorEscribiendo() {
  return (
    <div
      role="status"
      aria-label="El agente está escribiendo"
      className="flex w-fit items-center gap-1 rounded-lg bg-bg-800 px-3 py-3"
    >
      {RETRASOS.map((retraso) => (
        <span
          key={retraso}
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 animate-bounce rounded-full bg-text-400 motion-reduce:animate-none",
            retraso,
          )}
        />
      ))}
    </div>
  );
}
