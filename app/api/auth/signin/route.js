import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status },
  );
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { email, password } = body ?? {};

  const errors = {};
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = "Enter a valid email address.";
  }
  if (typeof password !== "string" || password.length === 0) {
    errors.password = "Enter your password.";
  } else if (password.length > 128) {
    errors.password = "Password is too long.";
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email: email.trim().toLowerCase(), password },
      headers: await headers(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Signed in. Redirecting...",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof APIError) {
      const status = Number(err.statusCode) || 400;
      const code = err.body?.code;

      console.error("signin APIError:", {
        status,
        code,
        message: err.body?.message,
      });

      if (code === "EMAIL_NOT_VERIFIED" || status === 403) {
        return errorResponse(
          "Please verify your email before signing in.",
          403,
        );
      }
      if (status === 429) {
        return errorResponse(
          "Too many attempts. Please wait a moment and try again.",
          429,
        );
      }
      if (code === "INVALID_EMAIL_OR_PASSWORD" || status === 401) {
        return errorResponse(
          "Sign in failed. Check your email and password.",
          401,
        );
      }

      return errorResponse(
        err.body?.message || "Could not sign in. Please try again.",
        status,
      );
    }

    console.error("signin error:", err);

    const code = err?.code ?? err?.cause?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
