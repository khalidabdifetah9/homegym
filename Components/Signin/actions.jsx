"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";

export async function signInAction({ email, password }) {
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return { success: false, message: "Enter a valid email address." };
  }
  if (typeof password !== "string" || password.length === 0) {
    return { success: false, message: "Enter your password." };
  }

  try {
    await auth.api.signInEmail({
      body: { email: email.trim().toLowerCase(), password },
      headers: await headers(),
    });

    return { success: true, message: "Signed in. Redirecting..." };
  } catch (err) {
    if (err instanceof APIError) {
      const status = Number(err.statusCode) || 400;
      const code = err.body?.code;

      // Shows in your terminal (or Vercel runtime logs)
      console.error("signin APIError:", {
        status,
        code,
        message: err.body?.message,
      });

      if (code === "EMAIL_NOT_VERIFIED" || status === 403) {
        return {
          success: false,
          message: "Please verify your email before signing in.",
        };
      }
      if (status === 429) {
        return {
          success: false,
          message: "Too many attempts. Please wait and try again.",
        };
      }
      if (code === "INVALID_EMAIL_OR_PASSWORD" || status === 401) {
        return {
          success: false,
          message: "Invalid Email or Password",
        };
      }

      // Anything else is a real problem, not a wrong password
      return {
        success: false,
        message: err.body?.message || "Could not sign in. Please try again.",
      };
    }

    console.error("signin error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
