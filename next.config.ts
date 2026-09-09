import type { NextConfig } from "next";

/**
 * ⚠️ EDITAR AQUÍ: dominios del portal que pueden embeber este chat en <iframe>.
 * Sin esto, la mayoría de navegadores bloquean el embed por seguridad (clickjacking).
 */
const PARENT_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

const nextConfig: NextConfig = {
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
