"use client";

import { useState, useEffect } from "react";

export default function AddProductType() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast.text) return;

    const show = setTimeout(() => setVisible(true), 20);
    const fade = setTimeout(() => setVisible(false), 2700);
    const clear = setTimeout(() => setToast({ type: "", text: "" }), 3000);

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
    setVisible(false);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: "Product type name is required." });
      setToast({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/add_product_type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
      }

      if (!res.ok) {
        if (data?.errors) setFieldErrors(data.errors);
        setToast({
          type: "error",
          text: data?.message || `Request failed (${res.status})`,
        });
        return;
      }

      setToast({
        type: "success",
        text: data?.message || "Product type added.",
      });
      setName("");
      setDescription("");
    } catch (err) {
      setToast({
        type: "error",
        text:
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "mb-2 block font-poppins text-xs uppercase tracking-[0.2em] text-white/50";
  const fieldClass =
    "w-full border-b border-white/40 bg-transparent py-3 font-poppins text-base text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-[#d4d4d4] disabled:opacity-50";
  const errorClass = "mt-2 font-poppins text-xs text-red-400";

  const isSuccess = toast.type === "success";

  return (
    <section className="flex min-h-svh items-start justify-center px-5 pb-10 pt-24 md:ml-64 md:items-center md:px-10 md:pt-10">
      <div className="w-full min-w-0 max-w-xl">
        <h1 className="mb-8 text-2xl font-semibold uppercase leading-none sm:text-3xl md:mb-10 md:text-4xl">
          Add product type
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-7 md:gap-8"
        >
          <div>
            <label htmlFor="type-name" className={labelClass}>
              Name
            </label>
            <input
              id="type-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              disabled={loading}
              maxLength={100}
              placeholder="Benches"
              className={fieldClass}
            />
            {fieldErrors.name && (
              <p className={errorClass}>{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="type-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="type-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFieldError("description");
              }}
              disabled={loading}
              rows={4}
              maxLength={1000}
              placeholder="Short description of this product type"
              className={`${fieldClass} resize-none`}
            />
            {fieldErrors.description && (
              <p className={errorClass}>{fieldErrors.description}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#d4d4d4] bg-[#d4d4d4] px-6 py-4 font-poppins text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4] disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Product Type"}
            </button>

            {toast.text && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-3 border-l-2 px-4 py-3 font-poppins text-sm transition-all duration-300 ${
                  visible
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
          </div>
        </form>
      </div>
    </section>
  );
}
