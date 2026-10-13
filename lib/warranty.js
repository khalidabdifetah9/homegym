export const WARRANTY_MONTHS = 12;

// Accepts 09XXXXXXXX, 07XXXXXXXX, 9XXXXXXXX, 2519XXXXXXXX, +2519XXXXXXXX
export function normalizeEthiopianPhone(input) {
  const cleaned = String(input).replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  return match ? `+251${match[1]}` : null;
}

// All the ways a phone may be stored in the database
export function phoneVariants(normalized) {
  const local = normalized.slice(4); // 9XXXXXXXX
  return [normalized, `0${local}`, `251${local}`, local];
}

export function calculateWarranty(registeredAt, qrStatus, now = new Date()) {
  const start = new Date(registeredAt);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + WARRANTY_MONTHS);

  const totalMs = end - start;
  const usedPct = Math.min(100, Math.max(0, ((now - start) / totalMs) * 100));
  const msLeft = end - now;
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));

  // Months + days remaining
  let months = 0;
  let days = 0;
  if (msLeft > 0) {
    let cursor = new Date(now);
    while (true) {
      const next = new Date(cursor);
      next.setUTCMonth(next.getUTCMonth() + 1);
      if (next > end) break;
      cursor = next;
      months++;
    }
    days = Math.floor((end - cursor) / 86400000);
  }

  let status;
  if (qrStatus === "deactivated") status = "void";
  else if (msLeft <= 0) status = "expired";
  else if (daysLeft <= 30) status = "expiring";
  else status = "active";

  return {
    status,
    startsAt: start.toISOString(),
    expiresAt: end.toISOString(),
    daysLeft,
    timeLeft: { months, days },
    usedPct: Math.round(usedPct),
    durationMonths: WARRANTY_MONTHS,
  };
}