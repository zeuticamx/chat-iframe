/**
 * Contrato del postMessage que manda el portal (frontend/app/components/chat-widget.tsx).
 * ⚠️ Si editas el payload en chat-widget.tsx, reflejar el cambio acá también.
 */
export interface AuthSyncMessage {
  type: "auth-sync";
  token: string | null;
  usuario: {
    id: string;
    email: string;
    tenant_id: string | null;
    nombre_negocio: string | null;
  } | null;
}

export interface ChatMensaje {
  id: string;
  rol: "usuario" | "agente";
  texto: string;
}
