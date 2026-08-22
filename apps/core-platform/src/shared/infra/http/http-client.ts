export class HttpStatusError extends Error {
  readonly status: number;

  constructor(method: string, url: string, status: number) {
    super(`HTTP ${method} ${url} responded with status ${status}.`);
    this.name = "HttpStatusError";
    this.status = status;
  }
}

export abstract class HttpClient {
  abstract get(url: string): Promise<unknown>;
  abstract post(url: string, body: unknown): Promise<unknown>;
}

/** Minimal JSON HTTP client over the platform's fetch with a request timeout. */
export class FetchHttpClient extends HttpClient {
  constructor(private readonly timeoutMs = 30_000) {
    super();
  }

  async get(url: string): Promise<unknown> {
    return this.request("GET", url, undefined);
  }

  async post(url: string, body: unknown): Promise<unknown> {
    return this.request("POST", url, body);
  }

  private async request(
    method: "GET" | "POST",
    url: string,
    body: unknown,
  ): Promise<unknown> {
    const response = await fetch(url, {
      method,
      headers:
        body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) {
      throw new HttpStatusError(method, url, response.status);
    }
    return response.json();
  }
}
