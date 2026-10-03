// Shared input style, used by Register and PasswordField
export const inputClass =
  "w-full border-0 border-b border-white/20 bg-transparent pb-3 pt-2.5 text-[0.98rem] font-light text-white outline-none transition-colors " +
  "placeholder:text-white/30 focus:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white " +
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#050505]";

export default function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.68rem] uppercase tracking-[0.16em] text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}