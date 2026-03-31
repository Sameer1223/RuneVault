import { useAuth0 } from "@auth0/auth0-react";

let cachedToken: string | null = null;

export function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();

  return async (url: string, options: RequestInit = {}) => {
    if (!cachedToken) {
      cachedToken = await getAccessTokenSilently();
    }

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${cachedToken}`,
        "Content-Type": "application/json",
      },
    });
  };
}

