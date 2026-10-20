import type { NextConfig } from "next";

/**
 * ⚠️ EDITAR AQUÍ: dominios del portal que pueden embeber este chat en <iframe>.
 * Sin esto, la mayoría de navegadores bloquean el embed por seguridad (clickjacking).
 */
// localhost solo en desarrollo: en producción cualquier proceso local de un
// usuario podría, si no, embeber el chat.
const PARENT_ORIGINS = [
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001"]),
  "https://agente.operativai.com.mx",
  "https://www.operativai.com.mx",
];

const nextConfig: NextConfig = {
  output: "standalone",
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
