import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  // All config is read from environment variables automatically:
  // AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, APP_BASE_URL, AUTH0_SECRET
  // You can override here if needed, but env vars are the recommended approach.
});
