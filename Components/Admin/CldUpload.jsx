"use client";
import { CldUploadWidget } from "next-cloudinary";

export default function CldUpload({ onUploadSuccess }) {
  return (
    <CldUploadWidget
      uploadPreset="wnda_products"
      onSuccess={(result) => {
        const info = result?.info;
        if (info?.secure_url) {
          const name = info.original_filename
            ? `${info.original_filename}${info.format ? "." + info.format : ""}`
            : "image";
          onUploadSuccess(info.secure_url, name);
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className="shrink-0 border border-zinc-600 px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-zinc-800"
        >
          Choose File
        </button>
      )}
    </CldUploadWidget>
  );
}