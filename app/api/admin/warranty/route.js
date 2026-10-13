import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  user,
  userProducts,
  qrCodes,
  productCategories,
} from "@/db/schema";
import {
  calculateWarranty,
  normalizeEthiopianPhone,
  phoneVariants,
} from "@/lib/warranty";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

// Admin access is enforced by middleware.js (/api/admin/*)
export async function GET(request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (q.length < 6) {
    return errorResponse("Enter a phone number or a serial number.", 422);
  }
  if (q.length > 40) {
    return errorResponse("That search is too long.", 422);
  }

  const phone = normalizeEthiopianPhone(q);
  const searchType = phone ? "phone" : "serial";
  const serial = q.toUpperCase();

  if (!phone && !/^[A-Z0-9-]{6,40}$/.test(serial)) {
    return errorResponse(
      "Enter a valid Ethiopian phone number or a serial number.",
      422
    );
  }

  try {
    const rows = await db
      .select({
        serial: userProducts.serialCode,
        registeredAt: userProducts.registeredAt,
        ownerName: user.name,
        ownerPhone: user.phoneNumber,
        ownerEmail: user.email,
        productType: productCategories.name,
        qrStatus: qrCodes.status,
        batchNumber: qrCodes.batchNumber,
        scanCount: qrCodes.scanCount,
      })
      .from(userProducts)
      .innerJoin(user, eq(userProducts.userId, user.id))
      .innerJoin(qrCodes, eq(userProducts.serialCode, qrCodes.code))
      .innerJoin(productCategories, eq(qrCodes.categoryId, productCategories.id))
      .where(
        phone
          ? inArray(user.phoneNumber, phoneVariants(phone))
          : eq(userProducts.serialCode, serial)
      )
      .orderBy(desc(userProducts.registeredAt))
      .limit(20);

    const now = new Date();
    const results = rows.map((r) => ({
      serial: r.serial,
      owner: { name: r.ownerName, phone: r.ownerPhone, email: r.ownerEmail },
      productType: r.productType,
      batchNumber: r.batchNumber,
      scanCount: r.scanCount,
      warranty: calculateWarranty(r.registeredAt, r.qrStatus, now),
    }));

    // A valid serial that nobody has registered yet
    let unregistered = null;
    if (results.length === 0 && !phone) {
      const [qr] = await db
        .select({
          code: qrCodes.code,
          status: qrCodes.status,
          batchNumber: qrCodes.batchNumber,
          productType: productCategories.name,
        })
        .from(qrCodes)
        .innerJoin(productCategories, eq(qrCodes.categoryId, productCategories.id))
        .where(eq(qrCodes.code, serial))
        .limit(1);

      if (qr) {
        unregistered = {
          serial: qr.code,
          productType: qr.productType,
          batchNumber: qr.batchNumber,
          deactivated: qr.status === "deactivated",
        };
      }
    }

    return NextResponse.json({ success: true, searchType, results, unregistered });
  } catch (err) {
    console.error("warranty GET error:", err);

    const code = err?.code ?? err?.cause?.code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }
    return errorResponse("Something went wrong while checking the warranty.", 500);
  }
}