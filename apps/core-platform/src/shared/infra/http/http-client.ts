export class HttpStatusError extends Error {
  readonly status: number;

  constructor(method: string, url: string, status: number) {
    super(`HTTP ${method} ${url} responded with status ${status}.`);
    this.name = "HttpStatusError";
    this.status = status;
  }
}

export abstract class HttpClient {
  abstract get<T>(url: string): Promise<T>;
  abstract post<T>(url: string, body: unknown): Promise<T>;
}

/** Minimal JSON HTTP client over the platform's fetch with a request timeout. */
export class FetchHttpClient extends HttpClient {
  constructor(private readonly timeoutMs = 30_000) {
    super();
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>("GET", url, undefined);
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>("POST", url, body);
  }

  private async request<T>(
    method: "GET" | "POST",
    url: string,
    body: unknown,
  ): Promise<T> {
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
    return (await response.json()) as T;
  }
}