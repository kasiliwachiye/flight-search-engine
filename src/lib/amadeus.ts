import { amadeusTokenSchema } from "@/domain/amadeus";

const DEFAULT_HOST = "https://test.api.amadeus.com";
const TOKEN_REFRESH_BUFFER_MS = 60_000;

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function getAmadeusHost(): string {
  return process.env.AMADEUS_HOST ?? DEFAULT_HOST;
}

export async function getAmadeusAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - TOKEN_REFRESH_BUFFER_MS > now) {
    return tokenCache.accessToken;
  }

  const clientId = requireEnv("AMADEUS_CLIENT_ID");
  const clientSecret = requireEnv("AMADEUS_CLIENT_SECRET");
  const host = getAmadeusHost();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${host}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Amadeus token request failed: ${response.status} ${errorText}`
    );
  }

  const parsed = amadeusTokenSchema.parse(await response.json());
  tokenCache = {
    accessToken: parsed.access_token,
    expiresAt: now + parsed.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

export async function amadeusFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAmadeusAccessToken();
  const host = getAmadeusHost();
  const headers = new Headers(options.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");

  return fetch(`${host}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}
