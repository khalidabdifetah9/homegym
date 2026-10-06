"use client";
import { useState, useEffect } from "react";
import CldUpload from "./CldUpload";

export default function PostProduct() {
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load product types for the dropdown
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/add_product_type");
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
              : err.message || "Could not load product types.",
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

  // Show the message with a fade in, fade it out at 2.7s, remove it at 3s
  useEffect(() => {
    if (!message.text) return;

    const showTimer = setTimeout(() => setVisible(true), 20);
    const fadeTimer = setTimeout(() => setVisible(false), 2700);
    const clearTimer = setTimeout(
      () => setMessage({ type: "", text: "" }),
      3000,
    );

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(clearTimer);
    };
  }, [message]);

  const clearMessage = () => {
    setVisible(false);
    setMessage({ type: "", text: "" });
  };

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleUploadSuccess = (url, name) => {
    setImageUrl(url);
    setImageName(name);
    clearFieldError("imageUrl");
  };

  const handlePost = async () => {
    clearMessage();
    setFieldErrors({});

    const localErrors = {};
    if (!categoryId) localErrors.categoryId = "Please select a product type.";
    if (!imageUrl) localErrors.imageUrl = "Product image is required.";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setMessage({
        type: "error",
        text: "Please fix the highlighted fields.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/post_product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, imageUrl }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // response had no JSON body
      }

      if (!res.ok) {
        if (data?.errors) setFieldErrors(data.errors);

        setMessage({
          type: "error",
          text: data?.message || `Request failed (${res.status})`,
        });
        return;
      }

      setMessage({
        type: "success",
        text: data?.message || "Product posted successfully!",
      });
      setCategoryId("");
      setImageUrl("");
      setImageName("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]";
  const fieldClass =
    "w-full border-0 border-b border-zinc-600 bg-transparent py-3 text-base text-white placeholder:text-zinc-600 focus:border-white focus:outline-none";
  const errorClass = "mt-2 text-xs text-red-500";

  const isSuccess = message.type === "success";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-5 py-12 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-[585px]">
        <h1
          className="mb-8 text-2xl font-bold uppercase leading-tight text-white sm:mb-10 sm:text-4xl"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Add a new product
        </h1>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Product Type</label>
          <select
            suppressHydrationWarning
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              clearFieldError("categoryId");
            }}
            disabled={
              loading ||
              categoriesLoading ||
              !!categoriesError ||
              categories.length === 0
            }
            className={`${fieldClass} [color-scheme:dark] disabled:opacity-50 ${
              categoryId ? "" : "text-zinc-600"
            }`}
          >
            <option value="" disabled className="bg-black text-zinc-500">
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
                Add a product type first, then come back to post a product.
              </p>
            )}
          {fieldErrors.categoryId && (
            <p className={errorClass}>{fieldErrors.categoryId}</p>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Product Image</label>
          <div className="flex items-center gap-3 border-b border-zinc-600 pb-3 sm:gap-4">
            <CldUpload onUploadSuccess={handleUploadSuccess} />
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                imageName ? "text-white" : "text-zinc-500"
              }`}
              title={imageName}
            >
              {imageName || "No file chosen"}
            </span>
          </div>
          {fieldErrors.imageUrl && (
            <p className={errorClass}>{fieldErrors.imageUrl}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handlePost}
          disabled={loading}
          className="w-full bg-zinc-300 py-4 text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Product"}
        </button>

        {message.text && (
          <div
            role="alert"
            className={`mt-4 flex items-start gap-3 border-l-2 px-4 py-3 text-sm transition-all duration-300 ${
              visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
            } ${
              isSuccess
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-red-500 bg-red-500/10 text-red-400"
            }`}
          >
            {isSuccess ? (
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.58 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p className="flex-1 leading-snug">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
