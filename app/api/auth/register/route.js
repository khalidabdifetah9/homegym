import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth"; // your Better Auth instance
import { db } from "@/db";
import { user, qrCodes, userProducts } from "@/db/schema";

export const dynamic = "force-dynamic";

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

// Accepts 09XXXXXXXX, 07XXXXXXXX, 9XXXXXXXX, 2519XXXXXXXX, +2519XXXXXXXX
// Returns +251XXXXXXXXX, or null if it isn't a valid Ethiopian mobile number
function normalizeEthiopianPhone(input) {
  const cleaned = String(input).replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  return match ? `+251${match[1]}` : null;
}

function validate({ fullName, phone, serialNumber, email, password }) {
  const errors = {};

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  } else if (fullName.trim().length > 100) {
    errors.fullName = "Name must be 100 characters or less.";
  }

  if (typeof phone !== "string" || !normalizeEthiopianPhone(phone)) {
    errors.phone = "Enter a valid Ethiopian phone number.";
  }

  if (
    typeof serialNumber !== "string" ||
    !/^[A-Z0-9-]{6,40}$/.test(serialNumber.trim().toUpperCase())
  ) {
    errors.serialNumber = "Enter a valid serial number.";
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or less.";
  } else if (!/[A-Za-z]/.test(password)) {
    errors.password = "Password must include at least one letter.";
  } else if (!/[^A-Za-z]/.test(password)) {
    errors.password = "Password must include at least one number or symbol.";
  }

  return errors;
}

export async function POST(request) {
  // 1. Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  // 2. Validate input
  const errors = validate(body ?? {});
  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  const fullName = body.fullName.trim();
  const phone = normalizeEthiopianPhone(body.phone);
  const serial = body.serialNumber.trim().toUpperCase();
  const email = body.email.trim().toLowerCase();
  const password = body.password;

  let createdUserId = null;

  try {
    // 3. Does the serial exist?
    const [qr] = await db
      .select({ code: qrCodes.code, status: qrCodes.status })
      .from(qrCodes)
      .where(eq(qrCodes.code, serial))
      .limit(1);

    if (!qr) {
      return errorResponse("This serial number was not found.", 404, {
        serialNumber: "This serial number was not found.",
      });
    }

    if (qr.status === "deactivated") {
      return errorResponse("This serial number has been deactivated.", 403, {
        serialNumber: "This serial number has been deactivated.",
      });
    }

    // 4. Has it already been registered?
    const [used] = await db
      .select({ id: userProducts.id })
      .from(userProducts)
      .where(eq(userProducts.serialCode, serial))
      .limit(1);

    if (used) {
      return errorResponse(
        "This serial number has already been registered.",
        409,
        { serialNumber: "This serial number has already been registered." }
      );
    }

    // 5. Create the user with Better Auth
    let signUp;
    try {
      signUp = await auth.api.signUpEmail({
        body: { name: fullName, email, password, phoneNumber: phone },
        headers: await headers(),
      });
    } catch (err) {
      if (err instanceof APIError) {
        const msg = err.body?.message || "Could not create the account.";
        const code = err.body?.code;

        if (code === "USER_ALREADY_EXISTS" || /already exists/i.test(msg)) {
          return errorResponse("An account with this email already exists.", 409, {
            email: "An account with this email already exists.",
          });
        }
        if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") {
          return errorResponse(msg, 422, { password: msg });
        }
        return errorResponse(msg, Number(err.statusCode) || 400);
      }
      throw err;
    }

    createdUserId = signUp?.user?.id;
    if (!createdUserId) {
      return errorResponse("Could not create the account.", 500);
    }

    // 6. Claim the serial. The unique constraint on serial_code
    //    guarantees only one account can ever get it, even if two
    //    people submit at the same moment.
    await db.insert(userProducts).values({
      userId: createdUserId,
      serialCode: serial,
    });

    // 7. Mark the QR code as scanned
    await db
      .update(qrCodes)
      .set({
        status: "scanned",
        scannedAt: new Date(),
        scanCount: sql`${qrCodes.scanCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.code, serial));

    return NextResponse.json(
      { success: true, message: "Account created. Your bench is registered." },
      { status: 201 }
    );
  } catch (err) {
    console.error("register error:", err);

    // Undo the user so the person can try again with the same email
    if (createdUserId) {
      try {
        await db.delete(user).where(eq(user.id, createdUserId));
      } catch (cleanupErr) {
        console.error("register cleanup error:", cleanupErr);
      }
    }

    const code = err?.code ?? err?.cause?.code;

    if (code === "23505") {
      return errorResponse(
        "This serial number has already been registered.",
        409,
        { serialNumber: "This serial number has already been registered." }
      );
    }
    if (code === "42703" || code === "42P01") {
      return errorResponse(
        "Database tables are out of date. Run your migration (drizzle-kit push).",
        500
      );
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong. Please try again.", 500);
  }
}