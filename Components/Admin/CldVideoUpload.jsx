"use client";
import { CldUploadWidget } from "next-cloudinary";

export default function CldVideoUpload({ onUploadSuccess, hasVideo }) {
  return (
    <CldUploadWidget
      uploadPreset="wnda_products"
      options={{
        resourceType: "video",
        clientAllowedFormats: ["mp4", "mov", "webm"],
        maxFileSize: 50 * 1024 * 1024, // 50 MB
        multiple: false,
        maxFiles: 1,
        sources: ["local", "camera"],
      }}
      onSuccess={(result) => {
        const info = result?.info;
        if (info?.secure_url) {
          const name = info.original_filename
            ? `${info.original_filename}${info.format ? "." + info.format : ""}`
            : "video";
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
          {hasVideo ? "Change Video" : "Choose Video"}
        </button>
      )}
    </CldUploadWidget>
  );
}