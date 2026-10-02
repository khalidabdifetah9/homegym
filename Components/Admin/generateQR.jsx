"use client";

import { useState } from "react";

export default function GenerateQR() {
  const [count, setCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const number = parseInt(count, 10);

    if (!number || number < 1) {
      setError("Enter a number of 1 or more.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate_qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: number }),
      });

      if (!res.ok) throw new Error("Failed");

      setMessage(`${number} QR ${number === 1 ? "code" : "codes"} generated.`);
      setCount("");
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <section className="flex min-h-svh items-start justify-center px-5 pb-10 pt-24 md:ml-64 md:items-center md:px-10 md:pt-10">
      <div className="w-full min-w-0 max-w-xl">
        <h1 className="mb-8 text-2xl font-semibold uppercase leading-none sm:text-3xl md:mb-10 md:text-4xl">
          Make QR codes
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7 md:gap-8">
          <div>
            <label
              htmlFor="count"
              className="mb-2 block font-poppins text-xs uppercase tracking-[0.2em] text-white/50"
            >
              Number of QR Codes
            </label>
            <input
              id="count"
              type="number"
              inputMode="numeric"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="10"
              required
              className="w-full border-b border-white/40 bg-transparent py-3 font-poppins text-base text-white outline-none transition-colors duration-300 [appearance:textfield] placeholder:text-white/30 focus:border-[#d4d4d4] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#d4d4d4] bg-[#d4d4d4] px-6 py-4 font-poppins text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4] disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            {message && (
              <p className="mt-4 font-poppins text-sm text-[#d4d4d4]">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 font-poppins text-sm text-red-400">{error}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
