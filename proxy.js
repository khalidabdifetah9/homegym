import { NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

const isPath = (pathname, base) =>
  pathname === base || pathname.startsWith(`${base}/`);

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isAdminApi = isPath(pathname, "/api/admin");
  const isAdminArea = isPath(pathname, "/admin");
  const isGuideArea = isPath(pathname, "/workout_guide");
  const isSignIn = pathname === "/signin";

  const cookie = request.headers.get("cookie");
  let session = null;

  if (cookie) {
    const { data } = await betterFetch("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: { cookie },
    });
    session = data;
  }

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }
    if (isSignIn) return NextResponse.next();
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const isAdmin = session.user.role === "admin";
  const home = isAdmin ? "/admin" : "/workout_guide";

  if (isAdminApi) {
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (isSignIn) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (isAdminArea && !isAdmin) {
    return NextResponse.redirect(new URL("/workout_guide", request.url));
  }

  if (isGuideArea && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/workout_guide/:path*",
    "/api/admin/:path*",
    "/signin",
  ],
};