"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const MAX_PER_BATCH = 500;

// The link each QR code opens when scanned
const getScanUrl = (code) => {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  ).replace(/\/$/, "");
  return `${base}/register/${code}`;
};

// Printable label: QR code with the serial number under it
async function makeLabel(code) {
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, getScanUrl(code), {
    width: 520,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 660;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 600, 660);
  ctx.drawImage(qrCanvas, 40, 40);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px monospace";
  ctx.textAlign = "center";
  ctx.fillText(code, 300, 615);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not create image")),
      "image/png"
    )
  );
}

async function buildZip(codes, onProgress) {
  const zip = new JSZip();
  const folder = zip.folder("qr-codes");

  for (let i = 0; i < codes.length; i++) {
    folder.file(`${codes[i]}.png`, await makeLabel(codes[i]));
    onProgress(i + 1);
  }

  zip.file("serials.csv", ["serial", ...codes].join("\n"));
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GenerateQR() {
  const [count, setCount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [status, setStatus] = useState("idle"); // idle | saving | building
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);

  const [toast, setToast] = useState({ type: "", text: "" });
  const [toastVisible, setToastVisible] = useState(false);

  const busy = status !== "idle";

  // Load product types for the dropdown
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/generate_qr");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Could not load product types.");
        }
        if (!cancelled) setCategories(data.categories || []);
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(
            err instanceof TypeError
              ? "Network error. Could not load product types."
              : err.message || "Could not load product types."
          );
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Message fades in, fades out, and is removed after 4 seconds
  useEffect(() => {
    if (!toast.text) return;

    const show = setTimeout(() => setToastVisible(true), 20);
    const fade = setTimeout(() => setToastVisible(false), 3700);
    const clear = setTimeout(() => setToast({ type: "", text: "" }), 4000);

    return () => {
      clearTimeout(show);
      clearTimeout(fade);
      clearTimeout(clear);
    };
  }, [toast]);

  const clearFieldError = (field) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: "", text: "" });
    setToastVisible(false);
    setFieldErrors({});
    setResult(null);

    const number = Number(count);
    const localErrors = {};

    if (!Number.isInteger(number) || number < 1) {
      localErrors.count = "Enter a whole number of 1 or more.";
    } else if (number > MAX_PER_BATCH) {
      localErrors.count = `You can generate at most ${MAX_PER_BATCH} codes at a time.`;
    }
    if (!categoryId) localErrors.categoryId = "Please select a product type.";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setToast({ type: "error", text: Object.values(localErrors).join(" ") });
      return;
    }

    setStatus("saving");

    // 1. Save the serial numbers in the database
    let data = null;
    try {
      const res = await fetch("/api/admin/generate_qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: number, categoryId }),
      });

      try {
        data = await res.json();
      } catch {
        // response had no JSON body
      }

      if (!res.ok) {
        if (data?.errors) setFieldErrors(data.errors);
        setToast({
          type: "error",
          text: data?.message || `Request failed (${res.status})`,
        });
        setStatus("idle");
        return;
      }
    } catch (err) {
      setToast({
        type: "error",
        text:
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err.message || "Something went wrong.",
      });
      setStatus("idle");
      return;
    }

    // 2. Build the downloadable file in the browser
    setStatus("building");
    setProgress({ done: 0, total: data.codes.length });

    try {
      const blob = await buildZip(data.codes, (done) =>
        setProgress({ done, total: data.codes.length })
      );

      setResult({
        blob,
        fileName: `qr-codes-${data.batchNumber}.zip`,
        size: blob.size,
        count: data.codes.length,
        categoryName: data.categoryName,
      });
      setToast({ type: "success", text: data.message });
      setCount("");
    } catch (err) {
      console.error("QR file error:", err);
      setToast({
        type: "error",
        text: `Codes were saved (batch ${data.batchNumber}) but the file could not be created. Please try again.`,
      });
    } finally {
      setStatus("idle");
    }
  };

  const labelClass =
    "mb-2 block font-poppins text-xs uppercase tracking-[0.2em] text-white/50";
  const fieldClass =
    "w-full border-b border-white/40 bg-transparent py-3 font-poppins text-base text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-[#d4d4d4] disabled:opacity-50";
  const errorClass = "mt-2 font-poppins text-xs text-red-400";

  const isSuccess = toast.type === "success";

  const buttonText =
    status === "saving"
      ? "Generating..."
      : status === "building"
      ? `Preparing file... ${progress.done}/${progress.total}`
      : "Generate";

  return (
    <section className="flex min-h-svh items-start justify-center px-5 pb-10 pt-24 md:ml-64 md:items-center md:px-10 md:pt-10">
      <div className="w-full min-w-0 max-w-xl">
        <h1 className="mb-8 text-2xl font-semibold uppercase leading-none sm:text-3xl md:mb-10 md:text-4xl">
          Make QR codes
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-7 md:gap-8"
        >
          {/* Product type */}
          <div>
            <label htmlFor="category" className={labelClass}>
              Product Type
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                clearFieldError("categoryId");
              }}
              disabled={
                busy ||
                categoriesLoading ||
                !!categoriesError ||
                categories.length === 0
              }
              className={`${fieldClass} [color-scheme:dark] ${
                categoryId ? "" : "text-white/30"
              }`}
            >
              <option value="" disabled className="bg-black text-white/50">
                {categoriesLoading
                  ? "Loading product types..."
                  : categoriesError
                  ? "Could not load product types"
                  : categories.length === 0
                  ? "No product types yet"
                  : "Select a product type"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-black text-white">
                  {c.name}
                </option>
              ))}
            </select>
            {categoriesError && <p className={errorClass}>{categoriesError}</p>}
            {!categoriesError &&
              !categoriesLoading &&
              categories.length === 0 && (
                <p className={errorClass}>
                  Add a product type first, then come back to generate QR codes.
                </p>
              )}
            {fieldErrors.categoryId && (
              <p className={errorClass}>{fieldErrors.categoryId}</p>
            )}
          </div>

          {/* Count */}
          <div>
            <label htmlFor="count" className={labelClass}>
              Number of QR Codes
            </label>
            <input
              id="count"
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PER_BATCH}
              value={count}
              onChange={(e) => {
                setCount(e.target.value);
                clearFieldError("count");
              }}
              disabled={busy}
              placeholder="10"
              className={`${fieldClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            />
            {fieldErrors.count && <p className={errorClass}>{fieldErrors.count}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={busy}
              className="w-full border border-[#d4d4d4] bg-[#d4d4d4] px-6 py-4 font-poppins text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4] disabled:opacity-50"
            >
              {buttonText}
            </button>

            {/* Error / success message */}
            {toast.text && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-3 border-l-2 px-4 py-3 font-poppins text-sm transition-all duration-300 ${
                  toastVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-1 opacity-0"
                } ${
                  isSuccess
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-red-500 bg-red-500/10 text-red-400"
                }`}
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {isSuccess ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.58 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <p className="flex-1 leading-snug">{toast.text}</p>
              </div>
            )}

            {/* Download file */}
            {result && (
              <div className="mt-6 border border-white/20 p-4 font-poppins">
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-[11px]">
                  Ready to download
                </p>
                <p
                  className="mb-1 truncate text-sm text-white"
                  title={result.fileName}
                >
                  {result.fileName}
                </p>
                <p className="mb-4 text-xs text-white/50">
                  {result.count} {result.count === 1 ? "code" : "codes"} ·{" "}
                  {result.categoryName} · {formatSize(result.size)}
                </p>
                <button
                  type="button"
                  onClick={() => saveAs(result.blob, result.fileName)}
                  className="w-full border border-[#d4d4d4] px-6 py-4 text-xs uppercase tracking-[0.15em] text-[#d4d4d4] transition-colors duration-300 hover:bg-[#d4d4d4] hover:text-black"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}