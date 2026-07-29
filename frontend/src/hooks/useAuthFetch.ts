import { useAuth0 } from "@auth0/auth0-react";

export function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();

  return async (url: string, options: RequestInit = {}) => {
    const doFetch = (accessToken: string) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

    const token = await getAccessTokenSilently();
    let response = await doFetch(token);

    // Token may have expired or been revoked between requests - force a fresh
    // one (bypassing the SDK's own cache) and retry once before giving up.
    if (response.status === 401) {
      const freshToken = await getAccessTokenSilently({ cacheMode: "off" });
      response = await doFetch(freshToken);
    }

    return response;
  };
}
