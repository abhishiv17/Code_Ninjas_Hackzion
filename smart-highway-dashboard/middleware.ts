import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static assets and API routes that
     * don't need auth protection. Auth0 SDK automatically handles:
     *   /auth/login
     *   /auth/logout
     *   /auth/callback
     *   /auth/profile
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
