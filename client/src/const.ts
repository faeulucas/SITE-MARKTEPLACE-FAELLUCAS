export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const LOGIN_ROUTE = "/entrar";

export const hasOAuthConfig = () =>
  Boolean(import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID);

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "");

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  if (!hasOAuthConfig()) {
    return "#";
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectBaseUrl = getApiBaseUrl() || window.location.origin;
  const redirectUri = `${redirectBaseUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
