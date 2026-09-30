import "@testing-library/jest-dom";

// app/embed/page.tsx lee la URL del webhook al cargar el módulo: tiene que
// existir antes del primer import o el widget nunca llega a hacer fetch.
process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL = "https://n8n.test/webhook/widget";

// jsdom no implementa scrollTo en elementos; el widget lo llama en cada
// mensaje nuevo para bajar la lista.
if (typeof Element.prototype.scrollTo !== "function") {
  Element.prototype.scrollTo = () => {};
}
