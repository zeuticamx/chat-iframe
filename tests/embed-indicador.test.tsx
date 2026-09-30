import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmbedPage from "@/app/embed/page";

interface FetchDiferido {
  resolver: (cuerpo: string) => void;
  rechazar: (error: unknown) => void;
  signal: AbortSignal | undefined;
}

let fetchMock: jest.Mock;
let pendientes: FetchDiferido[];

beforeEach(() => {
  pendientes = [];
  fetchMock = jest.fn((_url: string, init?: RequestInit) => {
    return new Promise<Response>((resolve, reject) => {
      const signal = init?.signal ?? undefined;
      signal?.addEventListener("abort", () => reject(signal.reason));
      pendientes.push({
        resolver: (cuerpo) => resolve({ status: 200, text: () => Promise.resolve(cuerpo) } as Response),
        rechazar: reject,
        signal,
      });
    });
  });
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function enviar(texto: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Escribí tu mensaje…"), `${texto}{Enter}`);
  return user;
}

describe("indicador de escribiendo del widget", () => {
  it("no se muestra antes de enviar", () => {
    render(<EmbedPage />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("se muestra del lado del agente mientras se espera la respuesta", async () => {
    render(<EmbedPage />);
    await enviar("hola");

    expect(screen.getByText("hola")).toBeInTheDocument();
    const indicador = screen.getByRole("status", { name: "El agente está escribiendo" });
    expect(indicador).toBeInTheDocument();
    expect(indicador).not.toHaveClass("ml-auto");
    expect(indicador.querySelectorAll("span.animate-bounce")).toHaveLength(3);
  });

  it("se oculta al recibir la respuesta", async () => {
    render(<EmbedPage />);
    await enviar("hola");
    pendientes[0].resolver(JSON.stringify({ respuesta: "¡Hola! ¿En qué te ayudo?" }));

    expect(await screen.findByText("¡Hola! ¿En qué te ayudo?")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("se oculta si la petición falla", async () => {
    render(<EmbedPage />);
    await enviar("hola");
    pendientes[0].rechazar(new TypeError("Failed to fetch"));

    expect(await screen.findByText("No se pudo conectar con el agente.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("se oculta si la petición entra en timeout (30s)", async () => {
    const controlador = new AbortController();
    const timeoutSpy = jest.spyOn(AbortSignal, "timeout").mockReturnValue(controlador.signal);

    render(<EmbedPage />);
    await enviar("hola");
    expect(timeoutSpy).toHaveBeenCalledWith(30_000);
    expect(pendientes[0].signal).toBe(controlador.signal);
    expect(screen.getByRole("status")).toBeInTheDocument();

    controlador.abort(new DOMException("signal timed out", "TimeoutError"));

    expect(await screen.findByText("No se pudo conectar con el agente.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("bloquea un segundo envío mientras espera y lo libera al responder", async () => {
    render(<EmbedPage />);
    const user = await enviar("primero");

    const input = screen.getByPlaceholderText("Escribí tu mensaje…");
    await user.type(input, "segundo");
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("segundo");

    pendientes[0].resolver(JSON.stringify({ respuesta: "listo" }));
    await screen.findByText("listo");
    await waitFor(() => expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled());
  });
});
