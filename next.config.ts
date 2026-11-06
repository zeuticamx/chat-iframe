import type { NextConfig } from "next";

/**
 * ⚠️ EDITAR AQUÍ: dominios del portal que pueden embeber este chat en <iframe>.
 * Sin esto, la mayoría de navegadores bloquean el embed por seguridad (clickjacking).
 */
// localhost solo en desarrollo: en producción cualquier proceso local de un
// usuario podría, si no, embeber el chat.
const PARENT_ORIGINS = [
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001"]),
  "https://agente.orvia.tech",
  "https://www.orvia.tech",
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Fija la raíz del proyecto: sin esto Turbopack toma un package-lock.json
  // suelto de la carpeta del usuario y avisa que lo ignora.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${PARENT_ORIGINS.join(" ")};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
