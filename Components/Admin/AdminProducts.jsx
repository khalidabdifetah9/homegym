"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

export default function AdminProducts({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
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

  const notify = (type, text) => {
    setVisible(false);
    setToast({ type, text });
  };

  const request = async (id, options) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, options);
      let data = null;
      try {
        data = await res.json();
      } catch {}
      if (!res.ok) {
        const details = data?.errors
          ? Object.values(data.errors).join(" ")
          : "";
        notify(
          "error",
          details || data?.message || `Request failed (${res.status})`,
        );
        return { ok: false };
      }
      return { ok: true, data };
    } catch (err) {
      notify(
        "error",
        err instanceof TypeError
          ? "Network error. Check your connection and try again."
          : err.message || "Something went wrong.",
      );
      return { ok: false };
    }
  };

  const handleChangePhoto = async (id, imageUrl) => {
    if (!imageUrl) {
      notify("error", "Upload failed. Please try again.");
      return;
    }

    setBusyId(id);
    const { ok, data } = await request(id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    setBusyId(null);

    if (!ok) return;

    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        products: c.products.map((p) => (p.id === id ? { ...p, imageUrl } : p)),
      })),
    );
    notify("success", data?.message || "Photo updated.");
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    const { ok, data } = await request(id, { method: "DELETE" });
    setBusyId(null);
    setConfirmId(null);

    if (!ok) return;

    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        products: c.products.filter((p) => p.id !== id),
      })),
    );
    notify("success", data?.message || "Product deleted.");
  };

  const isSuccess = toast.type === "success";
  const totalProducts = categories.reduce((n, c) => n + c.products.length, 0);

  const buttonClass =
    "w-full border px-2 py-3 font-poppins text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs";

  return (
    <section className="px-5 pb-16 pt-24 text-white md:ml-64 md:px-10 md:pt-12">
      <h1 className="mb-8 text-2xl font-semibold uppercase leading-none sm:text-3xl md:mb-10 md:text-4xl">
        Manage products
      </h1>

      {toast.text && (
        <div
          role="alert"
          className={`fixed left-1/2 top-20 z-50 flex w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 items-start gap-3 border-l-2 px-4 py-3 font-poppins text-sm shadow-lg backdrop-blur transition-all duration-300 md:top-6 ${
            visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          } ${
            isSuccess
              ? "border-green-500 bg-green-950/90 text-green-400"
              : "border-red-500 bg-red-950/90 text-red-400"
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

      {categories.length === 0 ? (
        <p className="font-poppins text-sm uppercase tracking-[0.1em] text-white/60">
          No product types yet. Add a product type first.
        </p>
      ) : (
        <div className="flex flex-col gap-14 md:gap-20">
          {categories.map((category, index) => (
            <section key={category.id}>
              <div className="mb-5 border-b border-white/20 pb-4 md:mb-6">
                <h2 className="flex items-baseline gap-3 text-2xl font-semibold uppercase leading-tight md:text-3xl">
                  <span className="font-poppins text-sm font-light text-white/40 md:text-base">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-2 max-w-xl font-poppins text-sm leading-snug text-white/60">
                    {category.description}
                  </p>
                )}
              </div>

              {category.products.length === 0 ? (
                <p className="font-poppins text-xs uppercase tracking-[0.1em] text-white/40">
                  No products in this type yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.products.map((product) => {
                    const busy = busyId === product.id;
                    const confirming = confirmId === product.id;

                    return (
                      <div key={product.id} className="bg-[#141414]">
                        <div className="relative aspect-square w-full bg-[#d4d4d4]">
                          <Image
                            src={product.imageUrl}
                            alt={category.name}
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                            className="object-contain"
                          />
                          {busy && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-poppins text-xs uppercase tracking-[0.15em] text-white">
                              Working...
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3">
                          {confirming ? (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDelete(product.id)}
                                className={`${buttonClass} border-red-500 bg-red-500 text-white hover:bg-transparent hover:text-red-400`}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => setConfirmId(null)}
                                className={`${buttonClass} border-white/40 text-white hover:bg-white/10`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <CldUploadWidget
                                uploadPreset="wnda_products"
                                options={{ multiple: false, maxFiles: 1 }}
                                onSuccess={(result) =>
                                  handleChangePhoto(
                                    product.id,
                                    result?.info?.secure_url,
                                  )
                                }
                              >
                                {({ open }) => (
                                  <button
                                    type="button"
                                    disabled={busy || busyId !== null}
                                    onClick={() => open()}
                                    className={`${buttonClass} border-[#d4d4d4] text-[#d4d4d4] hover:bg-[#d4d4d4] hover:text-black`}
                                  >
                                    Change Photo
                                  </button>
                                )}
                              </CldUploadWidget>

                              <button
                                type="button"
                                disabled={busyId !== null}
                                onClick={() => setConfirmId(product.id)}
                                className={`${buttonClass} border-red-500/60 text-red-400 hover:bg-red-500 hover:text-white`}
                              >
                                Delete Product
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          <p className="font-poppins text-xs uppercase tracking-[0.15em] text-white/40">
            {totalProducts} {totalProducts === 1 ? "product" : "products"} in{" "}
            {categories.length} {categories.length === 1 ? "type" : "types"}
          </p>
        </div>
      )}
    </section>
  );
}
