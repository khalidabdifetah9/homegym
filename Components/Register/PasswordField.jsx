"use client";

import { useState } from "react";
import Field, { inputClass } from "./Field";

export default function PasswordField({ value, onChange }) {
  // The show/hide state only matters here, so it lives here
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field label="Password">
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="8+ characters, letters and numbers"
          minLength={8}
          value={value}
          onChange={onChange}
          required
          className={`${inputClass} pr-14`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute bottom-3 right-0 text-[0.78rem] text-white/60 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  );
}