"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthSyncMessage, ChatMensaje } from "@/lib/types";

/**
 * ⚠️ EDITAR AQUÍ: orígenes del portal permitidos para recibir postMessage.
 * Debe matchear PARENT_ORIGINS de next.config.ts.
 */
const ALLOWED_PARENT_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "";
const TENANT_ID = process.env.TENANT_ID ?? "";

export default function EmbedPage() {
  const [auth, setAuth] = useState<AuthSyncMessage["usuario"]>(null);
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [texto, setTexto] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!ALLOWED_PARENT_ORIGINS.includes(event.origin)) return;

      const data = event.data as AuthSyncMessage;
      if (data?.type === "auth-sync") setAuth(data.usuario);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [mensajes]);

  const handleEnviar = async () => {
    const texto_limpio = texto.trim();
    if (!texto_limpio) return;

    setMensajes((prev) => [...prev, { id: crypto.randomUUID(), rol: "usuario", texto: texto_limpio }]);
    setTexto("");

    if (!N8N_WEBHOOK_URL) return;

    try {
      // ⚠️ EDITAR AQUÍ: forma del payload que espera el workflow "canal-entrada" en n8n.
      const respuesta = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: texto_limpio,
          usuario_id: auth?.id ?? null,
          tenant_id: TENANT_ID,
        }),
      });

      // ⚠️ EDITAR AQUÍ: forma de la respuesta que devuelve ese workflow.
      const data = await respuesta.json();
      const texto_respuesta: string = data?.respuesta ?? data?.reply ?? "";

      if (texto_respuesta) {
        setMensajes((prev) => [...prev, { id: crypto.randomUUID(), rol: "agente", texto: texto_respuesta }]);
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        { id: crypto.randomUUID(), rol: "agente", texto: "No se pudo conectar con el agente." },
      ]);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-bg-900">
      <header className="flex items-center justify-between border-b border-bg-700 px-3 py-2">
        <span className="text-sm font-medium text-text-100">Chat</span>
        <span className="font-mono text-[11px] text-text-600">
          {auth ? auth.email : "esperando sesión…"}
        </span>
      </header>

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {mensajes.length === 0 && (
          <p className="text-sm text-text-600">Escribí un mensaje para empezar.</p>
        )}
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.rol === "usuario"
                ? "ml-auto bg-series-1 text-text-100"
                : "bg-bg-800 text-text-100",
            )}
          >
            {m.texto}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-bg-700 p-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
          placeholder="Escribí tu mensaje…"
          className="flex-1 rounded-md border border-bg-700 bg-bg-950 px-3 py-2 text-sm text-text-100 outline-none focus:border-bg-600"
        />
        <button
          type="button"
          onClick={handleEnviar}
          disabled={!texto.trim()}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-bg-800 text-text-100 hover:bg-bg-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
